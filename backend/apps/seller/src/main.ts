import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { getSellerConfig } from './config/seller.config.js';
import { createHealthRoute } from './routes/health.route.js';
import { createPaidSolRoute } from './routes/paid-sol.route.js';
import { createX402PaymentMiddleware } from './x402/payment-middleware.js';

const app = express();
const config = getSellerConfig();

app.use(cors());
app.use(express.json());

app.use(createX402PaymentMiddleware());

app.use(createHealthRoute());
app.use(createPaidSolRoute());

app.listen(config.port, () => {
  console.log(`Seller service listening on ${config.baseUrl}`);
});