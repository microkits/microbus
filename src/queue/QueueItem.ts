import { Callback } from "./QueueItem.types";

export class QueueItem<T = unknown> {
  readonly callback: Callback<T>;

  constructor(callback: Callback<T>) {
    this.callback = callback;
  }
}
