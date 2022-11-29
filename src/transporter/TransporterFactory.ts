
import { MqttTransporter } from "./MqttTransporter";
import { Transporter } from "./Transporter";
import { TransporterOptions } from "./TransporterFactory.types";

export class TransporterFactory {
  static create<U extends keyof TransporterOptions>(type: U, options: TransporterOptions[U]): Transporter {
    switch (type) {
      case "MQTT":
        return new MqttTransporter(options)

      default:
        throw new Error("Invalid transporter type");
    }
  }
}