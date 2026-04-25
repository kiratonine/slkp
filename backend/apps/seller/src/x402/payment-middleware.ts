import { paymentMiddleware } from '@x402/express';
import { getPaymentResources } from './payment-config.js';
import { createConfiguredResourceServer } from './resource-server.js';

export function createX402PaymentMiddleware() {
  return paymentMiddleware(
    getPaymentResources(),
    createConfiguredResourceServer(),
  );
}