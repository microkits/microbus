import {Packet} from '../core/Packet';

export interface Serializer {
  serialize(packet: Packet): Buffer
  deserialize(buffer: Buffer): Packet
}
