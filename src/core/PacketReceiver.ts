import EventEmitter from "events";
import { CryptographyStrategy } from "../cryptography/CryptographyStrategy";
import { Serializer } from "../serializer/Serializer";
import { Transporter } from "../transporter/Transporter";
import { Packet } from "./Packet";
import { PacketReceiverOptions } from "./PacketReceiver.types";

interface DataEventOptions {
  packet: Packet;
  sender: string;
  receiver: string;
  broadcast: boolean;
}
interface Events {
  data: (options: DataEventOptions) => void;
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

    this.transporter.on('data', (buffer, sender, receiver, broadcast) => {
      if (sender != receiver) {
        if (typeof (this.cryptography) != 'undefined') {
          buffer = this.cryptography.decrypt(buffer);
        }

        const packet = this.serializer.deserialize(buffer);

        this.emit('data', {
          packet, sender, receiver, broadcast
        });
      }
    });
  }
}
