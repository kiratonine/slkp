import { S1lkX402Error } from './s1lk-x402-error';

export class S1lkX402PaymentRejectedError extends S1lkX402Error {
  public readonly reason: string;

  public constructor(reason: string) {
    super(`S1lk x402 payment rejected: ${reason}`);
    this.name = 'S1lkX402PaymentRejectedError';
    this.reason = reason;
  }
}