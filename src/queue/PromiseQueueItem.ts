import { PromiseQueueItemOptions } from './PromiseQueueItem.types';
import { AbstractQueueItem } from './AbstractQueueItem';
import { Response } from '../core/Response';

export class PromiseQueueItem<T = unknown> extends AbstractQueueItem {
  readonly resolve: (response: Response<T>) => void;
  readonly reject: (error: Error) => void;

  constructor(options: PromiseQueueItemOptions<T>) {
    super(options.timeout);
    this.resolve = options.resolve;
    this.reject = options.reject;
  }
}
