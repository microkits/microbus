import { Listener } from "../Microbus.types";
import { AddListenerOptions } from "./Listeners.types";

export class Listeners {
  private readonly listeners: Map<string, Listener[]>

  constructor() {
    this.listeners = new Map();
  }

  private getSender(key: string) {
    return key.split("*")[0];
  }

  private getType(key: string) {
    return key.split("*")[1];
  }

  private getKey(sender: string = "*", type: string = "*"): string {
    return `${sender}.${type}`;
  }

  add(options: AddListenerOptions) {
    const key = this.getKey(options.sender, options.type);

    const listeners = this.listeners.get(key) ?? [];

    listeners.push(options.listener);
    this.listeners.set(key, listeners);
  }

  get(sender: string, type: string) {
    return [
      ...this.listeners.get(this.getKey(undefined, undefined)) ?? [],
      ...this.listeners.get(this.getKey(undefined, type)) ?? [],
      ...this.listeners.get(this.getKey(sender, undefined)) ?? [],
      ...this.listeners.get(this.getKey(sender, type)) ?? []
    ]
  }

  delete(filter: (sender: string, type: string) => boolean): void {
    const keys = this.listeners.keys();

    for (const key in keys) {
      if (filter(this.getSender(key), this.getType(key))) {
        this.listeners.delete(key);
      }
    }
  }

  clear() {
    this.listeners.clear();
  }
}