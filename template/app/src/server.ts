import type { Express } from 'express';
import { applySecurityMiddleware } from './server/middleware/security';

export function serverSetupFn(app: Express) {
  applySecurityMiddleware(app);
}
