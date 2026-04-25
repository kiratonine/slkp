import { S1lkX402Error } from './s1lk-x402-error.js';

export class S1lkX402BridgeRequestError extends S1lkX402Error {
  public constructor(message: string) {
    super(message);
    this.name = 'S1lkX402BridgeRequestError';
  }
}