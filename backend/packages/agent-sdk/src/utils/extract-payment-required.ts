import { S1lkX402Invalid402ResponseError } from '../errors/s1lk-x402-invalid-402-response.error';

export async function extractPaymentRequired(response: Response): Promise<string> {
  const body = (await response.json()) as { paymentRequiredB64?: unknown };

  if (typeof body.paymentRequiredB64 !== 'string' || body.paymentRequiredB64.length === 0) {
    throw new S1lkX402Invalid402ResponseError();
  }

  return body.paymentRequiredB64;
}