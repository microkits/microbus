import { Listener } from "../Microbus.types";

export interface AddListenerOptions<Req = unknown, Res = unknown> {
  listener: Listener<Req, Res>;
  sender?: string;
  type?: string;
}