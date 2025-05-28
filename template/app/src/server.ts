import type { Application } from 'express';
import { setupMiddleware } from './server/middleware/security'

export default function serverSetupFn(app: Application) {
  setupMiddleware(app as any)
}