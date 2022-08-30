import { Response } from "../core/Response";

export interface PromiseQueueItemOptions<T> {
  timeout: number;
  resolve: (response: Response<T>) => void;
  reject: (error: Error) => void;
}