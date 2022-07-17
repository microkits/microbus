import EventEmitter from "events";
import { CryptographyStrategy } from "../cryptography/CryptographyStrategy";
import { Serializer } from "../serializer/Serializer";
import { Transporter } from "../transporter/Transporter";
import { Packet } from "./Packet";
import { PacketReceiverOptions } from "./PacketReceiver.types";
import { Payload } from "./Payload";

interface Events {
  data: (packet: Packet, sender: string, broadcast: boolean) => void;
}

export interface PacketReceiver {
  on<U extends keyof Events>(
    event: U, listener: Events[U]
  ): this;

  emit<U extends keyof Events>(
    event: U, ...args: Parameters<Events[U]>
  ): boolean;
}

export class PacketReceiver extends EventEmitter {
  private readonly transporter: Transporter;
  private readonly serializer: Serializer;
  private readonly cryptography: CryptographyStrategy;

  constructor(options: PacketReceiverOptions) {
    super();

    this.transporter = options.transporter;
    this.serializer = options.serializer;
    this.cryptography = options.cryptography;

    this.transporter.on('data', (buffer, sender, broadcast) => {
      if (typeof (this.cryptography) != 'undefined') {
        buffer = this.cryptography.decrypt(buffer);
      }

      const packet = this.serializer.deserialize(buffer);

      this.emit("data", packet, sender, broadcast);
    });
  }
}