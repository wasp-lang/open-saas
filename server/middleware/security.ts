import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

/**
 * Applies standard security middleware.
 * Helmet for headers and express-rate-limit (100 req per 15 min).
 * Note: ensure `helmet` and `express-rate-limit` packages are installed.
 */
export function applySecurityMiddleware(app: import('express').Express) {
  app.use(helmet());
  app.use(cors());
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
}
