import { HTTPFacilitatorClient } from '@x402/core/server';
import { x402ResourceServer } from '@x402/express';
import { ExactSvmScheme } from '@x402/svm/exact/server';
import { getSellerConfig } from '../config/seller.config.js';

export function createConfiguredResourceServer() {
  const config = getSellerConfig();

  if (!config.payTo) {
    throw new Error('SELLER_SOL_RECEIVER is required');
  }

  if (!config.facilitatorUrl) {
    throw new Error('FACILITATOR_URL is required');
  }

  const facilitatorClient = new HTTPFacilitatorClient({
    url: config.facilitatorUrl,
  });

  return new x402ResourceServer(facilitatorClient).register(
    config.network,
    new ExactSvmScheme(),
  );
}