import { Response } from '../core/Response';

export interface CallbackQueueItemOptions<T> {
  timeout: number;
  callback(response: Response<T>): void;
}
