
import type { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';

export function setupMiddleware(app: Application) {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS middleware
  app.use(cors({
    origin: process.env.WASP_WEB_CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }));
}
