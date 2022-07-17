import { CallbackQueueItemOptions } from "./CallbackQueueItem.types";
import { AbstractQueueItem } from "./AbstractQueueItem";
import { Payload } from "../core/Payload";

export class CallbackQueueItem extends AbstractQueueItem {
  readonly callback: <T>(sender: string, payload: Payload<T>) => void;

  constructor(options: CallbackQueueItemOptions) {
    super(options.timeout);
    this.callback = options.callback;
  }
}