import { Payload } from './Payload';

export interface Response<T = unknown> {
  readonly payload: Payload<T>;
  readonly sender: string;
  readonly receiver: string;
}