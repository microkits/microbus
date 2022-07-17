import { CryptographyStrategy } from "../cryptography/CryptographyStrategy";
import { Serializer } from "../serializer/Serializer";
import { Transporter } from "../transporter/Transporter";
import { Packet } from "./Packet";
import { PacketSenderOptions } from "./PacketSender.types";

export class PacketSender {
  private readonly transporter: Transporter;
  private readonly serializer: Serializer;
  private readonly cryptography?: CryptographyStrategy;

  constructor(options: PacketSenderOptions) {
    this.transporter = options.transporter;
    this.serializer = options.serializer;
    this.cryptography = options.cryptography;
  }

  /**
   * It takes a packet, serializes it, encrypts it, and sends it
   * @param {Packet} packet - The packet to send.
   * @param {string} [receiver] - The receiver of the packet. If not specified, 
   * the packet will be broadcasted.
   */
  send(packet: Packet, receiver?: string) {
    let buffer = this.serializer.serialize(packet);

    if (typeof (this.cryptography) != 'undefined') {
      buffer = this.cryptography.encrypt(buffer);
    }

    this.transporter.send(buffer, receiver);
  }
}