import { Payload } from "./core/Payload";
import { Request } from "./core/Request";
import { Response } from "./core/Response";
import { CryptographyStrategy } from "./cryptography/CryptographyStrategy";
import { Serializer } from "./serializer/Serializer";
import { Transporter } from "./transporter/Transporter";

export interface Handler<T = unknown> {
  (request: Request<T>): Promise<Payload | void> | Payload | void;
}

export interface MicrobusOptions {
  serializer: Serializer;
  transporter: Transporter;
  cryptography?: CryptographyStrategy;
}

export interface SendOptions<T> {
  payload: Payload<T>;
  receiver: string;
  timeout?: number;
}

export interface BroadcastOptions<T> {
  payload: Payload<T>;
  timeout?: number;
  callback?(response: Response): void;
}