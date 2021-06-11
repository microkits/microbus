import {Packet} from './Packet';

interface Options<P = Packet> {
  packet: P;
  sender: string;
}

/**
 * Class responsible for storing
 * data of requests
 */
export class Request<P = Packet> {
  readonly packet: P;
  readonly sender: string;

  /**
   * Creates an instance of Request.
   *
   * @param {Options} options
   */
  constructor(options: Options<P>) {
    this.packet = options.packet;
    this.sender = options.sender;
  }
}
