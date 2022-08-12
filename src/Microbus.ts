import { Packet } from "./core/Packet";
import { PacketReceiver } from "./core/PacketReceiver";
import { PacketSender } from "./core/PacketSender";
import { Payload } from "./core/Payload";
import { BroadcastOptions, Handler, MicrobusOptions, SendOptions } from "./Microbus.types";
import { CallbackQueueItem } from "./queue/CallbackQueueItem";
import { PromiseQueueItem } from "./queue/PromiseQueueItem";
import { Transporter } from "./transporter/Transporter";
import crypto from "crypto";

export class Microbus {
  private readonly handlers: Map<string, Handler[]>;
  private readonly queue: Map<string, CallbackQueueItem | PromiseQueueItem>;
  private readonly receiver: PacketReceiver;
  private readonly sender: PacketSender;
  private readonly transporter: Transporter;

  static readonly ALL = '*';

  constructor(options: MicrobusOptions) {
    this.transporter = options.transporter;
    this.handlers = new Map();
    this.queue = new Map();

    this.receiver = new PacketReceiver({
      transporter: options.transporter,
      serializer: options.serializer,
      cryptography: options.cryptography
    });

    this.sender = new PacketSender({
      transporter: options.transporter,
      serializer: options.serializer,
      cryptography: options.cryptography
    });

    this.receiver.on('data', (options) => {
      const id = options.packet.id;
      const payload = options.packet.payload;
      const sender = options.sender;
      const receiver = options.receiver;
      const broadcast = options.broadcast;

      const handlers = [
        ...this.handlers.get(payload.type) ?? [],
        ...this.handlers.get(Microbus.ALL) ?? [],
      ];

      const item = this.queue.get(id);

      if (item != null) {
        if (item instanceof CallbackQueueItem) {
          item.callback({
            payload, sender, receiver
          });
        }

        if (item instanceof PromiseQueueItem) {
          item.resolve({
            payload, sender, receiver
          });
          this.queue.delete(id);
        }
      }

      handlers.forEach((handler) => {
        const promise = new Promise<void | Payload>((resolve) =>
          resolve(handler({
            payload, sender, receiver, broadcast
          }))
        );

        promise.then((payload) => {
          if (typeof (payload) != 'undefined') {
            const packet = new Packet({ id, payload });
            this.sender.send(packet, sender);
          }
        });
      });
    });

    setInterval(() => {
      this.queue.forEach((item, id) => {
        if (item.isTimedOut()) {
          if (item instanceof PromiseQueueItem) {
            item.reject(new Error(`Timedout: ${id}`));
          }

          this.queue.delete(id);
        }
      });
    }, 1000);
  }

  /**
   * Add a handler to handle a specific type of incoming packet.
   *
   * @param {string} type - The type of packet to handle
   * @param {PacketHandler} handler - The handler that will handle the packet
   */
  addHandler<T>(type: string, handler: Handler<T>) {
    const handlers = this.handlers.get(type) ?? [];

    handlers.push(handler);
    this.handlers.set(type, handlers);
  }

  /**
   * It sends a packet to a receiver
   * @param [options] - SendOptions<T>
   * @returns A promise.
   */
  send<T>(options?: SendOptions<T>) {
    const id = crypto.randomUUID();

    const {
      payload,
      timeout,
      receiver
    } = options;

    if (timeout > 0) {
      return new Promise((resolve, reject) => {
        const item = new PromiseQueueItem({
          timeout, resolve, reject,
        });

        this.queue.set(id, item);
      });
    }

    const packet = new Packet({
      id, payload
    });

    this.sender.send(packet, receiver);
  }

  /**
   * It broadcasts a packet
   * @param options - BroadcastOptions<T>
   */
  broadcast<T>(options: BroadcastOptions<T>) {
    const id = crypto.randomUUID();

    const {
      payload,
      timeout,
      callback
    } = options;

    if (callback != null) {
      const item = new CallbackQueueItem({
        timeout, callback
      });

      this.queue.set(id, item);
    }

    const packet = new Packet({
      id, payload
    });

    this.sender.send(packet);
  }

  /**
   * Starts up the Microbus
   */
  async start(): Promise<Microbus> {
    await this.transporter.start();
    return this;
  }

  /**
   * Stop the Microbus
   */
  async stop(): Promise<Microbus> {
    await this.transporter.stop();
    return this;
  }
}
