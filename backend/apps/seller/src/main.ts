import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { createPaidSolRoute } from './routes/paid-sol.route';

const app = express();

app.use(cors());
app.use(express.json());

app.use(createPaidSolRoute());

app.get('/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'seller',
  });
});

const port = Number(process.env.PORT ?? 3002);

app.listen(port, () => {
  console.log(`Seller service listening on http://localhost:${port}`);
});