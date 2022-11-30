import { Response } from '../core/Response';

export interface Callback<T> {
  (response: Response<T>): void;
}
