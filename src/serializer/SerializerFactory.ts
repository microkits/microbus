import { JSONSerializer } from "./JSONSerializer";
import { Serializer } from "./Serializer";
import { SerializerOptions } from "./SerializerFactory.types";

export class SerializerFactory {
  static create<U extends keyof SerializerOptions>(type: U, options: SerializerOptions[U]): Serializer {
    switch (type) {
      case "JSON":
        return new JSONSerializer();

      default:
        throw new Error("Invalid serializer type");

    }
  }
}