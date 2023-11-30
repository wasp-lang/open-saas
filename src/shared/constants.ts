export enum TierIds {
  HOBBY = 'hobby-tier',
  PRO = 'pro-tier',
  ENTERPRISE = 'enterprise-tier',
}

//get this link at https://dashboard.stripe.com/test/settings/billing/portal
const isDev = process.env.NODE_ENV === 'development';
const customerPortalTestUrl: string | undefined = 'https://billing.stripe.com/p/login/test_8wM8x17JN7DT4zC000';
const customerPortalProdUrl: string | undefined = undefined;

export const STRIPE_CUSTOMER_PORTAL_LINK = isDev ? customerPortalTestUrl : customerPortalProdUrl;

function checkStripePortalLinkExists(link: string | undefined) {
  if (isDev && link === undefined) {
    console.warn('\x1b[31m%s\x1b[0m', '🚫 STRIPE_CUSTOMER_PORTAL_LINK is not defined.');
  } else if (!isDev && link === undefined) {
    throw new Error('🚫 STRIPE_CUSTOMER_PORTAL_LINK is not defined');
  } else {
    console.log('🎉 STRIPE_CUSTOMER_PORTAL_LINK is defined');
  }
}
checkStripePortalLinkExists(STRIPE_CUSTOMER_PORTAL_LINK);
