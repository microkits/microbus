import {Packet} from './Packet';

export interface PacketHandler {
  (packet: Packet): void
}
