import { EventEmitter } from "events";
import { SubscribeOptions, UnsubscribeOptions } from "./Transporter.types";
interface TransporterEvents {
  data: (buffer: Buffer, sender: string, receiver: string, broadcast: boolean) => void;
  disconnect: () => void;
  stop: () => void;
}

export interface Transporter {
  on<U extends keyof TransporterEvents>(
    event: U, listener: TransporterEvents[U]
  ): this;

  emit<U extends keyof TransporterEvents>(
    event: U, ...args: Parameters<TransporterEvents[U]>
  ): boolean;
}
/**
 * Abstract class representing the transporter
 * responsible for transport the packets
 */
export abstract class Transporter extends EventEmitter {
  abstract connect(id: string): Promise<Transporter>;
  abstract stop(): Promise<void>;
  abstract send(type: string, buffer: Buffer, receiver?: string): Promise<void>;
  subscribe?(options: SubscribeOptions): void;
  unsubscribe?(options: UnsubscribeOptions): void;
  /**
   * Creates an instance of Transporter.
   *
   * @param {Options} options
   */
  constructor() {
    super();
  }
}
