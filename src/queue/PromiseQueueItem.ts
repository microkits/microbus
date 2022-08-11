import { PromiseQueueItemOptions } from './PromiseQueueItem.types';
import { AbstractQueueItem } from './AbstractQueueItem';
import { Response } from '../core/Response';

export class PromiseQueueItem extends AbstractQueueItem {
  readonly resolve: <T>(response: Response<T>) => void;
  readonly reject: (error: Error) => void;

  constructor(options: PromiseQueueItemOptions) {
    super(options.timeout);
    this.resolve = options.resolve;
    this.reject = options.reject;
  }
}
