import { CryptographyStrategy } from "../cryptography/CryptographyStrategy";
import { Serializer } from "../serializer/Serializer";
import { Transporter } from "../transporter/Transporter";

export interface PacketReceiverOptions {
  readonly transporter: Transporter;
  readonly serializer: Serializer;
  readonly cryptography?: CryptographyStrategy;
}
