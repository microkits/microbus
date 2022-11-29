import { CreateTransporterOptions } from "./Configuration.types";
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
}
