export enum SubscriptionPlanId {
  Hobby = 'hobby',
  Pro = 'pro',
}

export enum CreditsPlanId {
  Credits10 = 'credits10',
  // Credits20 = 'credits20'
}

export enum PaymentPlanId {
  SubscriptionHobby = SubscriptionPlanId.Hobby,
  SubscriptionPro = SubscriptionPlanId.Pro,
  Credits10 = CreditsPlanId.Credits10,
  // Credits20 = CreditsPlanId.Credits20
}

export const DOCS_URL = 'https://docs.opensaas.sh';
export const BLOG_URL = 'https://docs.opensaas.sh/blog';
