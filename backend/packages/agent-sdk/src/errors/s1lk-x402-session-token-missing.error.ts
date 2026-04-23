import { S1lkX402Error } from './s1lk-x402-error';

export class S1lkX402SessionTokenMissingError extends S1lkX402Error {
  public constructor() {
    super('Session token is missing');
    this.name = 'S1lkX402SessionTokenMissingError';
  }
}