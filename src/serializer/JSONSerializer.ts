import { Packet } from "../core/Packet";
import { Serializer } from "./Serializer";

export class JSONSerializer extends Serializer {
  serialize(packet: Packet): Buffer {
    const buffer = Buffer.from(JSON.stringify(packet));
    return buffer;
  }

  deserialize(buffer: Buffer): Packet {
    const packet: Packet = JSON.parse(buffer.toString());
    return packet
  }
}