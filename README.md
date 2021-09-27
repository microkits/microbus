# Microbus

![Image of Yaktocat](./docs/assets/logo.png)

Designed to make easier to develop communication protocols and data transmission between applications.

[![npm version](https://badge.fury.io/js/%40microkits%2Fmicrobus.svg)](https://badge.fury.io/js/%40microkits%2Fmicrobus)
[![CodeQL](https://github.com/microkits/microbus/workflows/CodeQL/badge.svg)](https://github.com/microkits/microbus/actions?query=workflow%3ACodeQL)


## Installation
```bash
# With npm
$ npm install @microkits/microbus

# With yarn
$ yarn add @microkits/microbus
```

## Sending a packet

```typescript
import {Microbus} from "@microkits/microbus";

const microbus = new Microbus({
  // see below in this page what this means
  transporter, serializer, cryptography 
});

const packet = new MessagePacket("Hi, I'm traveling around the world in a microbus! 🌎🚐")

// If the receiver parameter is not passed, the packet will be sent to everyone (broadcast).
microbus.sendPacket(packet);
```

## Receiving a packet 

```typescript
import {Microbus} from "@microkits/microbus";

const microbus = new Microbus({
  // see below in this page what this means
  transporter, serializer, cryptography 
});

// MESSAGE is the packet type
microbus.addHandler<MessagePacket>("MESSAGE", (request) => {
  const packet = request.packet;
  const sender = request.sender;
  
  console.log(`received message ${packet.message} from ${sender}`);
});
```
Or

```typescript
import {Microbus, Request} from "@microkits/microbus";

const microbus = new Microbus({
  // see below in this page what this means
  transporter, serializer, cryptography 
});

// MESSAGE is the packet type
microbus.addHandler("MESSAGE", (request: Request<MessagePacket>) => {
  const packet = request.packet;
  const sender = request.sender;
  console.log(`received message ${packet.message} from ${sender}`);
});
```

## Replying to a packet
To reply to a packet, just return a packet in the handler function. The returned packet will be sent directly to the sender.

```typescript
microbus.addHandler<MessagePacket>("MESSAGE", (request) => {
  const packet = request.packet;
  const sender = request.sender;
  ...
  // Will be sent to sender
  return new MessagePacket("Ok, this is really awesome!");
});
```

## Packets
A packet is a representation of an object that needs to be sent to another application. It is defined as a Typescript class that will be converted to a Buffer and transmitted over a transporter.


```typescript
type Message = string;

...

import {Packet} from "@microkits/microbus";

export class MessagePacket extends Packet<Message> {
  constructor(message: Message) {
    super("MESSAGE", message);
  }
}
```

## Transporter
A transporter is responsible for defining the communication between different applications, sending and receiving buffers. 

Need to extends `Transporter` class and implements the following properties:

```typescript
abstract id: string;
abstract start(): Promise<Transporter>;
abstract stop(): Promise<void>;
abstract send(buffer: Buffer, receiver?: string): Promise<void>;
```

It is required to emit a `data` event when a packet is received.
The `Transporter` has the following events:

```typescript
data: (buffer: Buffer, sender: string, broadcast: boolean) => void; //  emitted when a packet is received
disconnect: () => void; // emitted when the transporter is disconnected
```

Example:

```typescript
import * as mqtt from "mqtt";
import {Transporter} from "@microkits/microbus";

interface Options {
  id: string;
  url?: string;
  delimiter?: string;
}

export class MqttTransporter extends Transporter {
  readonly id: string;
  private client: mqtt.MqttClient;
  private delimiter: string;
  private url: string;

  constructor(options: Options) {
    super();
    this.id = options.id;
    this.delimiter = options.delimiter || "/";
    this.url = options.url || "mqtt://localhost:1883";
  }

  private getTopicName(sender: string, receiver: string) {
    return [sender, receiver].join(this.delimiter)
  }
  
  private getSender(topic: string) {
    return topic.split(this.delimiter)[0];
  }

  private getReceiver(topic: string) {
    return topic.split(this.delimiter)[1];
  }

  async start(): Promise<Transporter> {
    return new Promise<Transporter>((resolve, reject) => {
      this.client = mqtt.connect(this.url);

      this.client.on("connect", () => {
        this.client.subscribe(this.getTopicName("+", this.id));
        this.client.subscribe(this.getTopicName("+", "ALL"));
        resolve(this);
      })

      this.client.on("message", (topic, buffer) => {
        const sender = this.getSender(topic);
        const receiver = this.getReceiver(topic);
        const broadcast = receiver == "ALL";
        this.emit("data", buffer, sender, broadcast);
      })

      this.client.on("error", (error) => {
        if (!this.client.connected) {
          reject(error)
        }
      })
    })
  }

  async stop() {
    this.emit("disconnect");
    this.client.end();
  }

  async send(buffer: Buffer, receiver: string = "ALL") {
    const topic = this.getTopicName(this.id, receiver);
    this.client.publish(topic, buffer)
  }
}
```

## Serializer
Serializers allow packets to be converted to buffers and from buffers back to packets. 
It is necessary to implement the `Serializer` interface, with the following methods:

```typescript
serialize(packet: Packet): Buffer
deserialize(buffer: Buffer): Packet
```

Example:

```typescript
import {Packet, Serializer} from "@microkits/microbus";

export class JsonSerializer implements Serializer {
  serialize(packet: Packet): Buffer {
    const buffer = Buffer.from(JSON.stringify(packet));
    return buffer;
  }

  deserialize(buffer: Buffer): Packet {
    const packet: Packet = JSON.parse(buffer.toString());
    return packet
  }
}
```

## Cryptography 
There is the possibility of implementing encryption to data transported in microbus.
To do this, you must implement the `CryptographyStrategy` interface and implement the following methods: 

```typescript
decrypt(data: Buffer): Buffer;
encrypt(data: Buffer): Buffer;
```

Example: 

```typescript
import {CryptographyStrategy} from "@microkits/microbus";
import crypto from "crypto";

export class AES256CTR implements CryptographyStrategy {
  private readonly key: string;

  constructor(key: string) {
    this.key = key;
  }

  encrypt(data: Buffer): Buffer {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('AES-256-CTR', Buffer.from(this.key), iv)

    return Buffer.concat([iv, cipher.update(data), cipher.final()]);
  }

  decrypt(data: Buffer): Buffer {
    const iv = data.slice(0, 16);
    const decipher = crypto.createDecipheriv('AES-256-CTR', Buffer.from(this.key), iv)

    return Buffer.concat([decipher.update(data.slice(16)), decipher.final()]);
  }
}
```
