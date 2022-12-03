import { BroadcastOptions, MicrobusOptions, SendOptions } from "./Microbus.types";
import { Configuration } from "./Configuration";
import { AddListenerOptions } from "./core/Listeners.types";
import { Packet } from "./core/Packet";
import { PacketReceiver } from "./core/PacketReceiver";
import { PacketSender } from "./core/PacketSender";
import { Listeners } from "./core/Listeners";
import { Response } from "./core/Response";
import { Payload } from "./core/Payload";
import { Transporter } from "./transporter/Transporter";
import { QueueItem } from "./queue/QueueItem";

import crypto from "crypto";
export class Microbus {
  private readonly listeners: Listeners;
  private readonly queue: Map<string, QueueItem>;
  private readonly receiver: PacketReceiver;
  private readonly sender: PacketSender;
  private readonly transporter: Transporter;

  static readonly ALL = '*';

  constructor(options: MicrobusOptions) {
    this.listeners = new Listeners;
    this.queue = new Map();

    options.transporter = Configuration.createTransporter(options.transporter);
    options.serializer = Configuration.createSerializer(options.serializer);

    this.transporter = options.transporter;

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

      const listeners = this.listeners.get(sender, payload.type);

      const item = this.queue.get(id);

      if (item != null) {
        item.callback({
          payload, sender, receiver
        });
      }

      listeners.forEach((listener) => {
        const promise = Promise.resolve(listener({
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
   * Adds a listener function
   * @param {AddListenerOptions} options - {
   * @returns The Microbus instance.
   */
  addListener<Req = unknown, Res = unknown>(options: AddListenerOptions<Req, Res>): Microbus {
    this.listeners.add(options);
    this.transporter.subscribe({
      type: options.type,
      sender: options.sender
    });

    return this;
  }

  /**
   * Remove all listeners that match the given filter.
   * 
   * The filter is a function that takes two arguments: the sender and the type. The sender is the name
   * of the sender that sent the message. The type is the type of the message. The filter function should
   * return true if the listener should be removed
   * @param filter - (sender: string, type: string) => boolean
   * @returns The Microbus instance.
   */
  removeListeners(filter: (sender: string, type: string) => boolean): Microbus {
    const unsubscribe = (sender: string, type: string) => {
      const remove = filter(sender, type);

      if (remove) {
        this.transporter.unsubscribe({
          sender, type
        })
      }

      return remove
    }

    this.listeners.delete(unsubscribe);

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
   * It delete all listeners
   */
  clear(): Microbus {
    this.listeners.clear();
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
