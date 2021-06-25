import {Packet} from './Packet';
import {Request} from './Request';
export interface Handler<P = Packet> {
  (request: Request<P>): Promise<Packet> | Promise<void> | Packet | void
}
