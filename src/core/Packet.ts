/**
 * Abstract class representing the packet transported
 * by the microbus
 */
 export abstract class Packet<P = unknown> {
  readonly type: string;
  readonly payload: P;

  /**
   * Creates an instance of Packet.
   *
   * @param {string} type - The type of the packet
   */
  constructor(type: string, payload: P) {
    this.type = type;
    this.payload = payload;
  }
}