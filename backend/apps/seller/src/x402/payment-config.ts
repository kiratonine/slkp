import { getSellerConfig } from '../config/seller.config.js';

export function getPaymentResources() {
  const config = getSellerConfig();

  return {
    'GET /paid/sol': {
      accepts: [
        {
          scheme: 'exact' as const,
          price: config.price,
          network: config.network,
          payTo: config.payTo,
        },
      ],
      description: 'Premium SOL quote',
      mimeType: 'application/json',
    },
  };
}