export interface TypeAndOptions<T, Y extends keyof T = keyof T> {
  type: Y;
  options?: T[Y];
}