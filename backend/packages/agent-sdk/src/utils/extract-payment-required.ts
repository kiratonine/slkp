import { S1lkX402Invalid402ResponseError } from '../errors/s1lk-x402-invalid-402-response.error.js';

export async function extractPaymentRequired(response: Response): Promise<string> {
  const headerValue =
    response.headers.get('PAYMENT-REQUIRED') ??
    response.headers.get('payment-required');

  if (typeof headerValue === 'string' && headerValue.length > 0) {
    return headerValue;
  }

  try {
    const body = (await response.clone().json()) as { paymentRequiredB64?: unknown };

    if (
      typeof body.paymentRequiredB64 === 'string' &&
      body.paymentRequiredB64.length > 0
    ) {
      return body.paymentRequiredB64;
    }
  } catch {
    // fallback to invalid 402 error
  }

  throw new S1lkX402Invalid402ResponseError();
}