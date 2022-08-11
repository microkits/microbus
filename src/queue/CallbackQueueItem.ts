import { CallbackQueueItemOptions } from "./CallbackQueueItem.types";
import { AbstractQueueItem } from "./AbstractQueueItem";
import { Response } from "../core/Response";

export class CallbackQueueItem extends AbstractQueueItem {
  readonly callback: <T>(response: Response<T>) => void;

  constructor(options: CallbackQueueItemOptions) {
    super(options.timeout);
    this.callback = options.callback;
  }
}
