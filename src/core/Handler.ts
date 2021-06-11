import {Packet} from './Packet';
import {Request} from './Request';
import {Response} from './Response';

export interface Handler<P = Packet> {
  (request: Request<P>, response: Response): void
}
