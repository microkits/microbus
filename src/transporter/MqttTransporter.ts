import * as mqtt from "mqtt";
import { Transporter } from "./Transporter";
import { MqttTransporterOptions } from "./MqttTransporter.types";

export class MqttTransporter extends Transporter {
  private id: string;
  private client: mqtt.MqttClient;
  private url: string;

  constructor(options?: MqttTransporterOptions) {
    super();
    this.url = options.url;
  }

  private getTopicName(sender: string, receiver: string) {
    return [sender, receiver].join("/")
  }

  private getSender(topic: string) {
    return topic.split("/")[0];
  }

  private getReceiver(topic: string) {
    return topic.split("/")[1];
  }

  async start(id: string): Promise<Transporter> {
    return new Promise<Transporter>((resolve, reject) => {
      this.id = id;
      this.client = mqtt.connect(this.url);

      this.client.on("connect", () => {
        this.client.subscribe(this.getTopicName("+", this.id));
        this.client.subscribe(this.getTopicName("+", "ALL"));
        resolve(this);
      });

      this.client.on("message", (topic, buffer) => {
        const sender = this.getSender(topic);
        const receiver = this.getReceiver(topic);
        const broadcast = receiver == "ALL";
        this.emit("data", buffer, sender, this.id, broadcast);
      });

      this.client.on("disconnect", () => {
        this.emit("disconnect");
      });
      
      this.client.on("error", (error) => {
        if (!this.client.connected) {
          reject(error)
        }
      });
    })
  }

  async stop() {
    this.emit("disconnect");
    this.client.end();
  }

  async send(buffer: Buffer, receiver?: string) {
    if (receiver == null) {
      receiver = "ALL"
    }

    const topic = this.getTopicName(this.id, receiver);
    this.client.publish(topic, buffer)
  }
}