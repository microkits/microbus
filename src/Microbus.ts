import { Packet } from "./core/Packet";
import { PacketReceiver } from "./core/PacketReceiver";
import { PacketSender } from "./core/PacketSender";
import { BroadcastOptions, Handler, MicrobusOptions, SendOptions } from "./Microbus.types";
import { CallbackQueueItem } from "./queue/CallbackQueueItem";
import { PromiseQueueItem } from "./queue/PromiseQueueItem";
import { Transporter } from "./transporter/Transporter";
import { Response } from "./core/Response";
import { Payload } from "./core/Payload";
import { Configuration } from "./Configuration";
import crypto from "crypto";
import EventEmitter from "events";

interface MicrobusEvents {
  disconnect: () => void;
}

export interface Microbus {
  on<U extends keyof MicrobusEvents>(
    event: U, listener: MicrobusEvents[U]
  ): this;

  emit<U extends keyof MicrobusEvents>(
    event: U, ...args: Parameters<MicrobusEvents[U]>
  ): boolean;
}

export class Microbus extends EventEmitter {
  private readonly handlers: Map<string, Handler[]>;
  private readonly queue: Map<string, CallbackQueueItem | PromiseQueueItem>;
  private readonly receiver: PacketReceiver;
  private readonly sender: PacketSender;
  private readonly transporter: Transporter;

  static readonly ALL = '*';

  constructor(options: MicrobusOptions) {
    super();
    this.handlers = new Map();
    this.queue = new Map();

    options.transporter = Configuration.createTransporter(options.transporter);
    options.serializer = Configuration.createSerializer(options.serializer);

    this.transporter = options.transporter;
    this.transporter.on("disconnect", () => {
      this.emit("disconnect");
    });

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
        const promise = Promise.resolve(handler({
          payload, sender, receiver, broadcast
        }));

        promise.then((payload) => {
          if (payload instanceof Payload) {
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
  addHandler<Req = unknown, Res = unknown>(type: string, handler: Handler<Req, Res>): Microbus {
    const handlers = this.handlers.get(type) ?? [];

    handlers.push(handler);
    this.handlers.set(type, handlers);

    return this;
  }

  /**
   * It sends a packet to a receiver
   * @param [options] - SendOptions<T>
   * @returns A promise.
   */
  async send<Req = unknown, Res = unknown>(options?: SendOptions<Req>): Promise<Response<Res> | void> {
    const id = crypto.randomUUID();

    const {
      payload,
      timeout,
      receiver
    } = options;

    const packet = new Packet({
      id, payload
    });

    this.sender.send(packet, receiver);

    if (timeout > 0) {
      return new Promise((resolve, reject) => {
        const item = new PromiseQueueItem({
          timeout, resolve, reject,
        });

        this.queue.set(id, item);
      });
    }
  }

  /**
   * It broadcasts a packet
   * @param options - BroadcastOptions<T>
   */
  broadcast<Req = unknown, Res = unknown>(options: BroadcastOptions<Req, Res>) {
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
   * It delete all handlers
   */
  clear(): Microbus {
    this.handlers.clear();
    return this;
  }

  /**
   * Starts up the Microbus
   */
  async start(id?: string): Promise<Microbus> {
    if (id == null) {
      id = crypto.randomUUID();
    }

    await this.transporter.connect(id);
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
