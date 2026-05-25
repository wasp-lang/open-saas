import { app, page, type Part, route } from "@wasp.sh/spec";

import { App } from "./src/client/App" with { type: "ref" };
import { NotFoundPage } from "./src/client/components/NotFoundPage" with { type: "ref" };
import { serverEnvValidationSchema } from "./src/env" with { type: "ref" };
import { LandingPage } from "./src/landing-page/LandingPage" with { type: "ref" };
import { seedMockUsers } from "./src/server/scripts/dbSeeds" with { type: "ref" };

import { adminParts } from "./src/admin/admin.wasp";
import { analyticsParts } from "./src/analytics/analytics.wasp";
import { auth, authParts } from "./src/auth/auth.wasp";
import { demoAiAppParts } from "./src/demo-ai-app/demo-ai-app.wasp";
import { fileUploadParts } from "./src/file-upload/file-upload.wasp";
import { paymentParts } from "./src/payment/payment.wasp";
import { userParts } from "./src/user/user.wasp";

export default app({
  name: "OpenSaaS",
  wasp: { version: "^0.24.0" },
  title: "My Open SaaS App",
  head: [
    "<link rel='icon' href='/favicon.ico' />",

    "<meta name='description' content='Your apps main description and features.' />",
    "<meta name='author' content='Your (App) Name' />",
    "<meta name='keywords' content='saas, solution, product, app, service' />",

    "<meta property='og:type' content='website' />",
    "<meta property='og:title' content='Your Open SaaS App' />",
    "<meta property='og:site_name' content='Your Open SaaS App' />",
    "<meta property='og:url' content='https://your-saas-app.com' />",
    "<meta property='og:description' content='Your apps main description and features.' />",
    "<meta property='og:image' content='https://your-saas-app.com/public-banner.webp' />",
    "<meta name='twitter:image' content='https://your-saas-app.com/public-banner.webp' />",
    "<meta name='twitter:image:width' content='800' />",
    "<meta name='twitter:image:height' content='400' />",
    "<meta name='twitter:card' content='summary_large_image' />",
    // TODO: You can put your Plausible analytics scripts below (https://docs.opensaas.sh/guides/analytics/):
    // NOTE: Plausible does not use Cookies, so you can simply add the scripts here.
    // Google, on the other hand, does, so you must instead add the script dynamically
    // via the Cookie Consent component after the user clicks the "Accept" cookies button.
    "<script async data-domain='<your-site-id>' src='https://plausible.io/js/script.js'></script>", // for production
    "<script async data-domain='<your-site-id>' src='https://plausible.io/js/script.local.js'></script>", // for development
  ],
  auth,
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
  emailSender: {
    // NOTE: "Dummy" provider is just for local development purposes.
    //   Make sure to check the server logs for the email confirmation url (it will not be sent to an address)!
    //   Once you are ready for production, switch to e.g. "SendGrid" or "Mailgun" providers. Check out https://docs.opensaas.sh/guides/email-sending/ .
    provider: "Dummy",
    defaultFrom: {
      name: "Open SaaS App",
      // When using a real provider, e.g. SendGrid, you must use the same email address that you configured your account to send out emails with!
      email: "me@example.com",
    },
  },
  parts: [
    // Prerendering routes with static content creates HTML files at build time that are served immediately,
    // improving SEO, search engine/AI crawling, and performance: https://wasp.sh/docs/advanced/prerendering
    route("LandingPageRoute", "/", page(LandingPage), { prerender: true }),
    route("NotFoundRoute", "*", page(NotFoundPage)),

    ...authParts,
    ...userParts,
    ...demoAiAppParts,
    ...paymentParts,
    ...fileUploadParts,
    ...analyticsParts,
    ...adminParts,
  ],
});

export function group<SomePart extends Part>(
  sharedState: Partial<SomePart>,
  parts: SomePart[],
) {
  return parts.map((part) => ({
    ...part,
    ...sharedState,
  }));
}
