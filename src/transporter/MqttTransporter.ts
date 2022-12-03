import * as mqtt from "mqtt";
import { Transporter } from "./Transporter";
import { MqttTransporterOptions } from "./MqttTransporter.types";
import { SubscribeOptions } from "./Transporter.types";

export class MqttTransporter extends Transporter {
  private id: string;
  private client: mqtt.MqttClient;
  private url: string;
  private namespace: string;
  private topics: Set<string>;

  constructor(options?: MqttTransporterOptions) {
    super();
    this.url = options.url;
    this.namespace = options.namespace ?? "MICROBUS"
    this.topics = new Set();
  }

  private getTopicName(type: string, sender: string, receiver?: string) {
    let topic = `${this.namespace}/${type}/${sender}`;

    if (receiver != null)
      topic = `${topic}/${receiver}`

    return topic;
  }

  private getSender(topic: string) {
    return topic.split("/")[2];
  }

  private getReceiver(topic: string) {
    return topic.split("/")[3];
  }

  async connect(id: string): Promise<Transporter> {
    return new Promise<Transporter>((resolve, reject) => {
      this.id = id;
      this.client = mqtt.connect(this.url);

      this.client.on("connect", () => {
        this.client.subscribe(
          this.getTopicName("+", "+", this.id)
        );
        
        this.topics.forEach(topic => {
          this.client.subscribe(topic)
        });

        resolve(this);
      });

      this.client.on("message", (topic, buffer) => {
        const sender = this.getSender(topic);
        const receiver = this.getReceiver(topic);
        const broadcast = receiver == null;
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
    this.emit("stop");
    this.client.end();
  }

  async send(type: string, buffer: Buffer, receiver?: string) {
    const topic = this.getTopicName(type, this.id, receiver);
    this.client.publish(topic, buffer)
  }

  subscribe(options: SubscribeOptions): void {
    const sender = options.sender ?? "+";
    const type = options.type ?? "+";

    const topic = this.getTopicName(type, sender);

    this.topics.add(topic)

    if (this.client != null && this.client.connected)
      this.client.subscribe(topic)
  }
}
