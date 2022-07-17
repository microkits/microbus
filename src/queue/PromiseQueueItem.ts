import { PromiseQueueItemOptions } from "./PromiseQueueItem.types";
import { AbstractQueueItem } from "./AbstractQueueItem";

export class PromiseQueueItem extends AbstractQueueItem {
  readonly resolve: <T>(data: T) => void;
  readonly reject: <T>(data: T) => void;

  constructor(options: PromiseQueueItemOptions) {
    super(options.timeout);
    this.resolve = options.resolve;
    this.reject = options.reject;
  }
}