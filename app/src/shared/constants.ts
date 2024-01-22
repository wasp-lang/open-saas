export enum TierIds {
  HOBBY = 'hobby-tier',
  PRO = 'pro-tier',
  ENTERPRISE = 'enterprise-tier',
}

export const DOCS_URL = 'https://docs.opensaas.sh';
export const BLOG_URL = 'https://docs.opensaas.sh/blog';
export const GITHUB_URL = 'https://github.com/wasp-lang/open-saas';

//get this link at https://dashboard.stripe.com/test/settings/billing/portal
const isDev = process.env.NODE_ENV !== 'production';
const customerPortalTestUrl = 'https://billing.stripe.com/p/login/test_8wM8x17JN7DT4zC000';
const customerPortalProdUrl = 'https://billing.stripe.com/p/login/test_8wM8x17JN7DT4zC000';

export const STRIPE_CUSTOMER_PORTAL_LINK = isDev ? customerPortalTestUrl : customerPortalProdUrl;

checkStripePortalLinkExists(STRIPE_CUSTOMER_PORTAL_LINK);

function checkStripePortalLinkExists(link: string | undefined) {

  if (!link) {
    if (isDev) console.warn('\x1b[31m%s\x1b[0m', '⚠️ STRIPE_CUSTOMER_PORTAL_LINK is not defined.');
    if (!isDev) throw new Error('🚫 STRIPE_CUSTOMER_PORTAL_LINK is not defined');
  } 
}
