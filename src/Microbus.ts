
import {Handler} from './core/Handler';
import {Packet} from './core/Packet';
import {PacketHandler} from './core/PacketHandler';
import {CryptographyStrategy} from './cryptography/CryptographyStrategy';
import {Serializer} from './serializer/Serializer';
import {Transporter} from './transporter/Transporter';

interface Options {
  serializer: Serializer;
  transporter: Transporter;
  cryptography?: CryptographyStrategy;
}

/**
 * Helper class for bootstrapping the Microbus.
 */
export class Microbus {
  private packetHandler: PacketHandler;
  private transporter: Transporter;

  /**
   * Creates an instance of Microbus.
   *
   * @param {Options} options
   */
  constructor(options: Options) {
    this.transporter = options.transporter;

    this.packetHandler = new PacketHandler({
      transporter: options.transporter,
      serializer: options.serializer,
      cryptography: options.cryptography,
    });
  }

  /**
   * Send a packet via transporter.
   *
   * @param {Packet} packet - The packet to be sent
   * @param {string} receiver - The receiver of the packet
   */
  sendPacket(packet: Packet, receiver?: string) {
    this.packetHandler.send(packet, receiver);
  }

  /**
   * Add a handler to handle a specific type of incoming packet.
   *
   * @param {string} type - The type of packet to handle
   * @param {Handler} handler - The handler that will handle the packet
   */
  addHandler<P>(type: string, handler: Handler<P>) {
    this.packetHandler.addHandler(type, handler);
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
