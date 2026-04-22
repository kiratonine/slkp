import { Request, Response, Router } from 'express';
import { SellerPaymentService } from '../services/seller-payment.service';

export function createPaidSolRoute(): Router {
  const router = Router();
  const sellerPaymentService = new SellerPaymentService();

  router.get('/paid/sol', (req: Request, res: Response) => {
    const paymentSignatureHeader = req.header('PAYMENT-SIGNATURE');
    const sellerBaseUrl = process.env.SELLER_BASE_URL ?? 'http://localhost:3002';
    const receiverAddress = process.env.SELLER_SOL_RECEIVER ?? '';

    const paymentRequiredB64 = sellerPaymentService.createPaymentRequired({
      seller: sellerBaseUrl,
      amount: '0.001',
      token: 'SOL',
      network: 'solana',
      payTo: receiverAddress,
      purpose: 'premium sol quote',
    });

    if (paymentSignatureHeader === undefined) {
      return res.status(402).json({
        statusCode: 402,
        message: 'Payment Required',
        paymentRequiredB64,
      });
    }

    const isValid = sellerPaymentService.verifyPaymentSignature({
      paymentRequiredB64,
      paymentSignatureB64: paymentSignatureHeader,
    });

    if (!isValid) {
      return res.status(402).json({
        statusCode: 402,
        message: 'Invalid payment signature',
        paymentRequiredB64,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        product: 'premium-sol-quote',
        quote: 'SOL payment accepted, premium data unlocked',
      },
    });
  });

  return router;
}