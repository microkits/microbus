import {Packet} from './Packet';

interface Options<P> {
  packet: Packet<P>;
  sender: string;
  broadcast: boolean;
}

/**
 * Class responsible for storing
 * data of requests
 */
export class Request<P> {
  readonly packet: Packet<P>;
  readonly sender: string;
  readonly broadcast: boolean;

  /**
   * Creates an instance of Request.
   *
   * @param {Options} options
   */
  constructor(options: Options<P>) {
    this.packet = options.packet;
    this.sender = options.sender;
    this.broadcast = options.broadcast;
  }
}
