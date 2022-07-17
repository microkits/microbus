export interface PromiseQueueItemOptions {
  timeout: number;
  resolve: <T>(data: T) => void;
  reject: <T>(data: T) => void;
}