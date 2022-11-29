import { CreateSerializerOptions, CreateTransporterOptions } from "./Configuration.types";
import { Serializer } from "./serializer";
import { SerializerFactory } from "./serializer/SerializerFactory";
import { Transporter } from "./transporter";
import { TransporterFactory } from "./transporter/TransporterFactory";

export abstract class Configuration {
  static createTransporter(options: CreateTransporterOptions): Transporter {
    if (options instanceof Transporter) {
      return options;
    }

    if (typeof (options) == "string") {
      if (options.match(/^(mqtt|mqtts):\/\//i)) {
        return TransporterFactory.create("MQTT", {
          url: options
        });
      }

      throw new Error("Invalid transporter address");
    }

    return TransporterFactory.create(
      options.type,
      options.options
    );
  }

  static createSerializer(options: CreateSerializerOptions): Serializer {
    if (options instanceof Serializer) {
      return options;
    }

    return SerializerFactory.create(
      options.type,
      options.options
    );
  }
}
