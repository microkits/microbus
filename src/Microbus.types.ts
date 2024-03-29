import { CreateSerializerOptions, CreateTransporterOptions } from "./Configuration.types";
import { Payload } from "./core/Payload";
import { Request } from "./core/Request";
import { Response } from "./core/Response";
import { CryptographyStrategy } from "./cryptography/CryptographyStrategy";

export interface Listener<Req = unknown, Res = unknown> {
  (request: Request<Req>): Promise<Payload<Res> | void> | Payload<Res> | void;
}

export interface MicrobusOptions {
  serializer: CreateSerializerOptions;
  transporter: CreateTransporterOptions;
  cryptography?: CryptographyStrategy;
}

export interface SendOptions<T> {
  payload: Payload<T>;
  receiver: string;
  timeout?: number;
}

export interface BroadcastOptions<Req, Res> {
  payload: Payload<Req>;
  timeout?: number;
  callback?(response: Response<Res>): void;
}
