import {CryptographyStrategy} from '../cryptography/CryptographyStrategy';
import {Serializer} from '../serializer/Serializer';
import {Transporter} from '../transporter/Transporter';
import {PacketHandler} from './PacketHandler';

interface Options {
  transporter: Transporter;
  serializer: Serializer;
  cryptography?: CryptographyStrategy;
}

/**
 * Class responsible for receiving and deserialize
 * the buffers received by the transporter
 */
export class PacketReceiver {
  private readonly handlers: Map<string, PacketHandler[]>;
  private readonly transporter: Transporter;
  private readonly serializer: Serializer;
  private readonly cryptography: CryptographyStrategy;

  /**
   * Creates an instance of PacketReceiver.
   *
   * @param {Options} options
   */
  constructor(options: Options) {
    this.transporter = options.transporter;
    this.serializer = options.serializer;
    this.cryptography = options.cryptography;

    this.handlers = new Map();

    this.transporter.on('data', (buffer, sender) => {
      if (typeof (this.cryptography) != 'undefined') {
        buffer = this.cryptography.decrypt(buffer);
      }

      const packet = this.serializer.deserialize(buffer);
      const handlers = this.handlers.get(packet.type);

      if (typeof (handlers) != 'undefined') {
        for (const handler of handlers) {
          handler(packet, sender);
        }
      }
    });
  }

  /**
   * Add a handler to handle a specific type of incoming packet.
   *
   * @param {string} type - The type of packet to handle
   * @param {PacketHandler} handler - The handler that will handle the packet
   */
  addHandler(type: string, handler: PacketHandler) {
    const handlers = this.handlers.get(type) ?? [];

    handlers.push(handler);
    this.handlers.set(type, handlers);
  }
}
