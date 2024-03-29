import { Payload } from './Payload';

export interface Request<T> {
  readonly payload: Payload<T>;
  readonly sender: string;
  readonly receiver: string;
  readonly broadcast: boolean;
}
