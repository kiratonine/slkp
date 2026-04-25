import { S1lkX402Invalid402ResponseError } from '../errors/s1lk-x402-invalid-402-response.error.js';

export async function extractPaymentRequired(response: Response): Promise<string> {
  const headerValue =
    response.headers.get('PAYMENT-REQUIRED') ??
    response.headers.get('payment-required');

  console.log('[sdk-debug] response status:', response.status);
  console.log('[sdk-debug] response headers:');

  response.headers.forEach((value, key) => {
    console.log(`[sdk-debug] header ${key}: ${value}`);
  });

  if (typeof headerValue === 'string' && headerValue.length > 0) {
    console.log('[sdk-debug] PAYMENT-REQUIRED header found');
    console.log('[sdk-debug] PAYMENT-REQUIRED length:', headerValue.length);
    console.log('[sdk-debug] PAYMENT-REQUIRED preview:', headerValue.slice(0, 300));

    return headerValue;
  }

  try {
    const body = (await response.clone().json()) as { paymentRequiredB64?: unknown };

    console.log('[sdk-debug] 402 json body:', JSON.stringify(body, null, 2));

    if (
      typeof body.paymentRequiredB64 === 'string' &&
      body.paymentRequiredB64.length > 0
    ) {
      console.log('[sdk-debug] paymentRequiredB64 found in body');
      console.log('[sdk-debug] paymentRequiredB64 preview:', body.paymentRequiredB64.slice(0, 300));

      return body.paymentRequiredB64;
    }
  } catch (error: unknown) {
    console.log('[sdk-debug] failed to parse 402 body as json');

    if (error instanceof Error) {
      console.log('[sdk-debug] body parse error:', error.message);
    }
  }

  throw new S1lkX402Invalid402ResponseError();
}