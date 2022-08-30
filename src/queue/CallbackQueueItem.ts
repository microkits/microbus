import { CallbackQueueItemOptions } from "./CallbackQueueItem.types";
import { AbstractQueueItem } from "./AbstractQueueItem";
import { Response } from "../core/Response";

export class CallbackQueueItem<T = unknown> extends AbstractQueueItem {
  readonly callback: (response: Response<T>) => void;

  constructor(options: CallbackQueueItemOptions<T>) {
    super(options.timeout);
    this.callback = options.callback;
  }
}
