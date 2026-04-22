import { PaymentRequiredPayload } from '../types/payment-required.type';
import { PaymentSignaturePayload } from '../types/payment-signature.type';

export class SellerPaymentService {
  public createPaymentRequired(params: {
    seller: string;
    amount: string;
    token: 'SOL';
    network: 'solana';
    payTo: string;
    purpose: string;
  }): string {
    const payload: PaymentRequiredPayload = {
      seller: params.seller,
      amount: params.amount,
      token: params.token,
      network: params.network,
      payTo: params.payTo,
      purpose: params.purpose,
    };

    return Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
  }

  public verifyPaymentSignature(params: {
    paymentRequiredB64: string;
    paymentSignatureB64: string;
  }): boolean {
    try {
      const decoded = Buffer.from(params.paymentSignatureB64, 'base64').toString('utf-8');
      const payload = JSON.parse(decoded) as PaymentSignaturePayload;

      return (
        payload.type === 'mock-payment-signature' &&
        payload.paymentRequiredB64 === params.paymentRequiredB64
      );
    } catch {
      return false;
    }
  }
}