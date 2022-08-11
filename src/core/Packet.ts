import { Payload } from "./Payload";

interface PacketOptions<T> {
  id: string;
  payload: Payload<T>;
}

export class Packet<T = unknown> {
  readonly id: string;
  readonly payload: Payload<T>;

  constructor(options: PacketOptions<T>) {
    this.id = options.id;
    this.payload = options.payload;
  }
}
