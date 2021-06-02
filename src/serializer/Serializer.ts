import {Packet} from '../packets/Packet';

export interface Serializer {
  serialize(packet: Packet): Buffer
  deserialize(buffer: Buffer): Packet
}
