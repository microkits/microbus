export abstract class AbstractQueueItem {
  readonly timeout: number;
  readonly createdAt: number;

  constructor(timeout: number) {
    this.timeout = timeout;
    this.createdAt = Date.now();
  }

  /**
   * If the current time is greater than the time the object 
   * was created plus the timeout, then return true.
   * @returns A boolean value.
   */
  isTimedOut(): boolean {
    return (this.createdAt + this.timeout) < Date.now();
  }
}