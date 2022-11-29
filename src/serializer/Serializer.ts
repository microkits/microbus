import { Packet } from '../core/Packet';

export abstract class Serializer {
  abstract serialize(packet: Packet): Buffer
  abstract deserialize(buffer: Buffer): Packet
}
