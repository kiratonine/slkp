import axios from 'axios';

export type Seller402Response = {
  statusCode: number;
  message: string;
  paymentRequiredB64: string;
};

export type SellerSuccessResponse = {
  success: true;
  data: {
    product: string;
    quote: string;
  };
};

export class SellerClientService {
  private readonly sellerUrl: string;

  public constructor() {
    this.sellerUrl = process.env.SELLER_URL ?? 'http://localhost:3002';
  }

  public async requestPaidSol(): Promise<SellerSuccessResponse> {
    const response = await axios.get<SellerSuccessResponse>(`${this.sellerUrl}/paid/sol`);
    return response.data;
  }

  public async requestPaidSolWithSignature(
    paymentSignatureB64: string,
  ): Promise<SellerSuccessResponse> {
    const response = await axios.get<SellerSuccessResponse>(`${this.sellerUrl}/paid/sol`, {
      headers: {
        'PAYMENT-SIGNATURE': paymentSignatureB64,
      },
    });

    return response.data;
  }
}