import { action, api, page, query, route, type Part } from '@wasp.sh/spec'

import { PricingPage } from './PricingPage' with { type: 'ref' }
import { CheckoutResultPage } from './CheckoutResultPage' with { type: 'ref' }
import { getCustomerPortalUrl, generateCheckoutSession } from './operations' with { type: 'ref' }
import { paymentsWebhook, paymentsMiddlewareConfigFn } from './webhook' with { type: 'ref' }

export const paymentParts: Part[] = [
  // Prerendering routes with static content creates HTML files at build time that are served immediately,
  // improving SEO, search engine/AI crawling, and performance: https://wasp.sh/docs/advanced/prerendering
  route('PricingPageRoute', '/pricing', page(PricingPage), { prerender: true }),
  route('CheckoutResultRoute', '/checkout', page(CheckoutResultPage, { authRequired: true })),
  query(getCustomerPortalUrl, { entities: ['User'] }),
  action(generateCheckoutSession, { entities: ['User'] }),
  api('POST', '/payments-webhook', paymentsWebhook, {
    entities: ['User'],
    middlewareConfigFn: paymentsMiddlewareConfigFn,
  }),
]
