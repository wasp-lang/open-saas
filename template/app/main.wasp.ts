import { app, page, route } from "@wasp.sh/spec";

import { App } from "./src/client/App" with { type: "ref" };
import { NotFoundPage } from "./src/client/components/NotFoundPage" with { type: "ref" };
import { serverEnvValidationSchema } from "./src/env" with { type: "ref" };
import { LandingPage } from "./src/landing-page/LandingPage" with { type: "ref" };
import { seedMockUsers } from "./src/server/scripts/dbSeeds" with { type: "ref" };

import { adminDecls } from "./src/admin/admin.wasp";
import { analyticsDecls } from "./src/analytics/analytics.wasp";
import { authConfig, authDecls } from "./src/auth/auth.wasp";
import { head } from "./src/client/head.wasp";
import { demoAiAppDecls } from "./src/demo-ai-app/demo-ai-app.wasp";
import { fileUploadDecls } from "./src/file-upload/file-upload.wasp";
import { paymentDecls } from "./src/payment/payment.wasp";
import { emailSender } from "./src/server/emailSender.wasp";
import { userDecls } from "./src/user/user.wasp";

export default app({
  name: "OpenSaaS",
  wasp: { version: "^0.24.0" },
  title: "My Open SaaS App",
  head,
  auth: authConfig,
  db: {
    // Run `wasp db seed` to seed the database with the seed functions below:
    seeds: [
      // Populates the database with a bunch of fake users to work with during development.
      seedMockUsers,
    ],
  },
  client: {
    rootComponent: App,
  },
  server: {
    envValidationSchema: serverEnvValidationSchema,
  },
  emailSender,
  decls: [
    // Prerendering routes with static content creates HTML files at build time that are served immediately,
    // improving SEO, search engine/AI crawling, and performance: https://wasp.sh/docs/advanced/prerendering
    route("LandingPageRoute", "/", page(LandingPage), { prerender: true }),
    route("NotFoundRoute", "*", page(NotFoundPage)),

    ...authDecls,
    ...userDecls,
    ...demoAiAppDecls,
    ...paymentDecls,
    ...fileUploadDecls,
    ...analyticsDecls,
    ...adminDecls,
  ],
});
