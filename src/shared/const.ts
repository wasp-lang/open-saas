// get your own link from your stripe dashboard: https://dashboard.stripe.com/settings/billing/portal
// and your own test link: https://dashboard.stripe.com/test/settings/billing/portal
const isDev = process.env.NODE_ENV === 'development';
export const CUSTOMER_PORTAL_LINK = isDev
  ? 'https://billing.stripe.com/p/login/test_8wM8x17JN7DT4zC000'
  : '<insert-prod-link-here>';

export enum TierIds {
  HOBBY = 'hobby-tier',
  PRO = 'pro-tier',
  ENTERPRISE = 'enterprise-tier',
}