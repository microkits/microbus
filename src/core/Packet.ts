interface Options<P> {
  payload: P;
  type?: string;
}
/**
 * Abstract class representing the packet transported
 * by the microbus
 */
export class Packet<P = unknown> {
  readonly payload: P;
  readonly type?: string;

  /**
   * Creates an instance of Packet.
   *
   * @param {string} type - The type of the packet
   */
  constructor(options: Options<P>) {
    this.type = options.type;
    this.payload = options.payload;
  }
}