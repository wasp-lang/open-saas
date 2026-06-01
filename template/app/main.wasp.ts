import { app, page, route } from '@wasp.sh/spec';
import { serverEnvValidationSchema } from './src/env' with { type: 'ref' };
import { seedMockUsers } from './src/server/scripts/dbSeeds' with { type: 'ref' };

import { App } from './src/client/App' with { type: 'ref' };
import { LandingPage } from './src/landing-page/LandingPage' with { type: 'ref' };
import { NotFoundPage } from './src/client/components/NotFoundPage' with { type: 'ref' };

import { authConfig, authParts } from './src/auth/auth.wasp';
import { headConfig } from './src/client/head.wasp';
import { emailSenderConfig } from './src/server/emailSender.wasp';
import { userParts } from './src/user/user.wasp';
import { demoAiParts } from './src/demo-ai-app/demoAiApp.wasp';
import { paymentParts } from './src/payment/payment.wasp';
import { fileUploadParts } from './src/file-upload/fileUpload.wasp';
import { analyticsParts } from './src/analytics/analytics.wasp';
import { adminParts } from './src/admin/admin.wasp';

export default app({
  name: 'MyOpenSaaSApp',
  title: 'My Open SaaS App',
  wasp: { version: '^0.24' },
  head: headConfig,
  auth: authConfig, 
  emailSender: emailSenderConfig,
  client: { rootComponent: App },
  server: { envValidationSchema: serverEnvValidationSchema },
  db: {
    // Run `wasp db seed` to seed the database with the seed functions below:
    seeds: [seedMockUsers], // Populates the database with a bunch of fake users to work with during development.
  },
  parts: [
    // Prerendering creates static HTML at build time: https://wasp.sh/docs/advanced/prerendering
    route('LandingPageRoute', '/', page(LandingPage), { prerender: true }),
    route('NotFoundRoute', '*', page(NotFoundPage)),

    authParts,
    userParts,
    demoAiParts,
    paymentParts,
    fileUploadParts,
    analyticsParts,
    adminParts,
  ].flat(),
});
