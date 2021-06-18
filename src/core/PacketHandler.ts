import {CryptographyStrategy} from 'src/cryptography/CryptographyStrategy';
import {Serializer} from 'src/serializer/Serializer';
import {Transporter} from 'src/transporter/Transporter';
import {Handler} from './Handler';
import {Packet} from './Packet';
import {Request} from './Request';

interface Options {
  transporter: Transporter;
  serializer: Serializer;
  cryptography?: CryptographyStrategy;
}

/**
 * Class responsible for handling serialization,
 * encryption and packet forwarding.
 */
export class PacketHandler {
  private readonly handlers: Map<string | Symbol, Handler[]>;
  private readonly transporter: Transporter;
  private readonly serializer: Serializer;
  private readonly cryptography: CryptographyStrategy;

  static readonly ALL = '*';

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
      const handlers = [
        ...this.handlers.get(packet.type) ?? [],
        ...this.handlers.get(PacketHandler.ALL) ?? [],
      ];

      const request = new Request({packet, sender});

      for (const handler of handlers) {
        handler(request, {
          send: this.send,
        });
      }
    });
  }

  /**
   * Add a handler to handle a specific type of incoming packet.
   *
   * @param {string} type - The type of packet to handle
   * @param {PacketHandler} handler - The handler that will handle the packet
   */
  addHandler(type: string, handler: Handler) {
    const handlers = this.handlers.get(type) ?? [];

    handlers.push(handler);
    this.handlers.set(type, handlers);
  }

  /**
   * Send a packet via transporter.
   *
   * @param {Packet} packet - The packet to be sent
   * @param {string} receiver - The receiver of the packet
   */
  send(packet: Packet, receiver?: string) {
    let buffer = this.serializer.serialize(packet);

    if (typeof (this.cryptography) != 'undefined') {
      buffer = this.cryptography.encrypt(buffer);
    }

    this.transporter.send(buffer, receiver);
  }
}
