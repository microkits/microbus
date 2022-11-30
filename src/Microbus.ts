import { Packet } from "./core/Packet";
import { PacketReceiver } from "./core/PacketReceiver";
import { PacketSender } from "./core/PacketSender";
import { BroadcastOptions, Handler, MicrobusOptions, SendOptions } from "./Microbus.types";
import { Transporter } from "./transporter/Transporter";
import { Response } from "./core/Response";
import { Payload } from "./core/Payload";
import { Configuration } from "./Configuration";
import crypto from "crypto";
import EventEmitter from "events";
import { QueueItem } from "./queue/QueueItem";

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
  private readonly queue: Map<string, QueueItem>;
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
        item.callback({
          payload, sender, receiver
        });
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
      const successPromise = new Promise<Response<Res>>((resolve) => {
        const item = new QueueItem(resolve);
        this.queue.set(id, item);
      });

      const timeoutPromise = new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          reject(`Timedout: ${id}`)
        }, timeout)
      });

      return Promise.race([
        successPromise,
        timeoutPromise
      ]).finally(() => {
        this.queue.delete(id);
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
      const item = new QueueItem(callback);

      this.queue.set(id, item);

      setTimeout(() => {
        this.queue.delete(id);
      }, timeout)
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

    this.transporter.on("disconnect", async () => {
      await this.transporter.connect(id);
    })

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
