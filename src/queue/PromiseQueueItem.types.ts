import { Response } from "../core/Response";

export interface PromiseQueueItemOptions {
  timeout: number;
  resolve: <T>(response: Response<T>) => void;
  reject: (error: Error) => void;
}