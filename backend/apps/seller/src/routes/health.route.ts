import { Request, Response, Router } from 'express';

export function createHealthRoute(): Router {
  const router = Router();

  router.get('/health', (_req: Request, res: Response) => {
    return res.status(200).json({
      ok: true,
      service: 'seller',
    });
  });

  return router;
}