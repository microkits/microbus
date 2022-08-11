import { Response } from '../core/Response';

export interface CallbackQueueItemOptions {
  timeout: number;
  callback<T>(response: Response<T>): void;
}
