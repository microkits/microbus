import {Packet} from './Packet';
import {Request} from './Request';
export interface Handler<P = unknown> {
  (request: Request<P>): Promise<Packet> | Promise<void> | Packet | void
}