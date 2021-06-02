/**
 * Abstract class representing the packet transported
 * by the microbus
 */
export abstract class Packet {
  readonly type: string;

  /**
   * Creates an instance of Packet.
   *
   * @param {string} type - The type of the packet
   */
  constructor(type: string) {
    this.type = type;
  }
}
