import { Request, Response, Router } from 'express';
import { PremiumDataService } from '../services/premium-data.service.js';

export function createPaidSolRoute(): Router {
  const router = Router();
  const premiumDataService = new PremiumDataService();

  router.get('/paid/sol', (_req: Request, res: Response) => {
    return res.status(200).json(premiumDataService.getPremiumSolQuote());
  });

  return router;
}