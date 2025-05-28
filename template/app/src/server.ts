import type { Application } from 'express';
import { applySecurityMiddleware } from './server/middleware/security';

export default function serverSetupFn(app: Application) {
  applySecurityMiddleware(app);
}
