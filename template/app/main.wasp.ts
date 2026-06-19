import { fileBased } from "@wasp.sh/file-based-routing/spec";
import { api, app, page, ref, route } from "@wasp.sh/spec";

import { App } from "./src/client/App" with { type: "ref" };
import { NotFoundPage } from "./src/client/components/NotFoundPage" with { type: "ref" };
import { serverEnvValidationSchema } from "./src/env" with { type: "ref" };
import {
  paymentsMiddlewareConfigFn,
  paymentsWebhook,
} from "./src/payment/webhook" with { type: "ref" };
import { seedMockUsers } from "./src/server/scripts/dbSeeds" with { type: "ref" };

import { authConfig } from "./src/auth/auth.wasp";
import { head } from "./src/client/head.wasp";
import { emailSender } from "./src/server/emailSender.wasp";

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
  spec: [
    // The catch-all NotFound route is hand-written: the file-based router only
    // produces a `/*` route, not React Router's bare `*`.
    route("NotFoundRoute", "*", page(NotFoundPage)),
    // The payments webhook is hand-written: the file-based router can't yet
    // express an api's `middlewareConfigFn` ref through an options file.
    api("POST", "/payments-webhook", paymentsWebhook, {
      entities: ["User"],
      middlewareConfigFn: paymentsMiddlewareConfigFn,
    }),
    // Pages, routes, queries, actions, and jobs are discovered from the
    // filesystem under `src/app/`: https://github.com/wasp-lang/file-based-routing
    await fileBased({ ref }),
  ],
});
