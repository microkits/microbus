import {EventEmitter} from 'events';

interface TransporterEvents {
  data: (buffer: Buffer) => void;
  disconnect: () => void;
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
  abstract id: string;
  abstract start(): Promise<Transporter>;
  abstract stop(): Promise<void>;
  abstract send(buffer: Buffer, receiver?: string): Promise<void>;

  /**
   * Creates an instance of Transporter.
   *
   * @param {Options} options
   */
  constructor() {
    super();
  }
}
