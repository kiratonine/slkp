import { S1lkX402Error } from './s1lk-x402-error.js';

export class S1lkX402Invalid402ResponseError extends S1lkX402Error {
  public constructor() {
    super('Seller returned invalid 402 response');
    this.name = 'S1lkX402Invalid402ResponseError';
  }
}