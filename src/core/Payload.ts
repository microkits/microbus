export class Payload<T = unknown> {
  readonly type: string;
  readonly body?: T;

  constructor(type: string, body?: T) {
    this.type = type;
    this.body = body;
  }
}