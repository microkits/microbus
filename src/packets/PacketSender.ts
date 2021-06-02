import {CryptographyStrategy} from '../cryptography/CryptographyStrategy';
import {Serializer} from '../serializer/Serializer';
import {Transporter} from '../transporter/Transporter';
import {Packet} from './Packet';

interface Options {
  transporter: Transporter;
  serializer: Serializer;
  cryptography?: CryptographyStrategy;
}

/**
 * Class responsible for serialize and sending
 * the packets via transporter
 */
export class PacketSender {
  private readonly transporter: Transporter;
  private readonly serializer: Serializer;
  private readonly cryptography: CryptographyStrategy;

  /**
   * Creates an instance of PacketSender.
   *
   * @param {Options} options
   */
  constructor(options: Options) {
    this.transporter = options.transporter;
    this.serializer = options.serializer;
    this.cryptography = options.cryptography;
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
