import { TierIds } from '@wasp/shared/const';

export const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Documentation', href: 'https://saas-template.gitbook.io/test' },
  { name: 'Blog', href: 'https://saas-template.gitbook.io/posts/' },
];
export const features = [
  {
    name: 'Auto-magic Auth',
    description:
      'Not only is Auth pre-configured, but you can integrate more providers with just a few lines of code, thanks to the power of Wasp.',
    icon: '🔐',
  },
  {
    name: 'Full-stack Type Safety',
    description:
      'Because Wasp understands your app, it provides end-to-end type safety out of the box. Nothing to configure!',
    icon: '🥞',
  },
  {
    name: 'Stripe Integration',
    description:
      "No SaaS is complete without payments. That's why subscriptions and there necessary webhooks are built-in!",
    icon: '💸',
  },
  {
    name: 'Email Sending',
    description:
      "Email sending is built-in and pre-configured. Combine it with Wasp's cron jobs feature to easily send emails to your customers.",
    icon: '📧',
  },
  {
    name: 'Deploy Anywhere',
    description: 'You own all your code, so deploy it wherever you want!',
    icon: '🚀 ',
  },
  {
    name: 'Complete Documentation & Support',
    description: "We don't leave you hanging. We have tons of docs, and a Discord community to help!",
    icon: '🫂',
  },
];
export const tiers = [
  {
    name: 'Hobby',
    id: TierIds.HOBBY,
    priceMonthly: '$9.99',
    description: 'All you need to get started',
    features: ['Limited monthly usage', 'Basic support'],
  },
  {
    name: 'Pro',
    id: TierIds.PRO,
    priceMonthly: '$19.99',
    description: 'Our most popular plan',
    features: ['Unlimited monthly usage', 'Priority customer support'],
    bestDeal: true,
  },
  {
    name: 'Enterprise',
    id: TierIds.ENTERPRISE,
    priceMonthly: '$500',
    description: 'Big business means big money',
    features: ['Unlimited monthly usage', '24/7 customer support', 'Advanced analytics'],
  },
];
export const faqs = [
  {
    id: 1,
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  // More questions...
];
export const footerNavigation = {
  solutions: [
    { name: 'Hosting', href: '#' },
    { name: 'Data Services', href: '#' },
    { name: 'Uptime Monitoring', href: '#' },
    { name: 'Enterprise Services', href: '#' },
  ],
  support: [
    { name: 'Pricing', href: '#' },
    { name: 'Documentation', href: '#' },
    { name: 'Guides', href: '#' },
    { name: 'API Reference', href: '#' },
  ],
  company: [
    { name: 'About', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Jobs', href: '#' },
    { name: 'Press', href: '#' },
    { name: 'Partners', href: '#' },
  ],
  legal: [
    { name: 'Claim', href: '#' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
  ],
};
