import {Packet} from './Packet';

export interface Response {
  send(packet: Packet)
}
