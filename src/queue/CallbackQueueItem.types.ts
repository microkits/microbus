import { Payload } from "../core/Payload";

export interface CallbackQueueItemOptions {
  timeout: number;
  callback<T>(sender: string, payload: Payload<T>): void;
}