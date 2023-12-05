import { TierIds, DOCS_URL, BLOG_URL } from '@wasp/shared/constants';

export const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Documentation', href: DOCS_URL },
  { name: 'Blog', href: BLOG_URL },
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
      "No SaaS is complete without payments. That's why subscriptions and the necessary webhooks are built-in.",
    icon: '💸',
  },
  {
    name: 'Admin Dashboard',
    description:
      "Graphs! Tables! Analytics! All in one place. Ooooooooooh.",
    icon: '📈',
  },
  {
    name: 'Email Sending',
    description:
      "Email sending is built-in and pre-configured. Combine it with Wasp's cron jobs feature to easily send emails to your customers.",
    icon: '📧',
  },
  {
    name: 'OpenAI Integration',
    description:
      "Technology is changing rapidly. Ship your new AI-powered app before it's already obsolete!",
    icon: '🤖',
  },
  {
    name: 'Deploy Anywhere. Easily.',
    description: 'You own all your code, so deploy it wherever you want. Or take advantage of Wasp\'s one-command, full-stack deploy.',
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
    question: "Why is this amazing SaaS Template free and open-source?",
    answer:
      "Because open-source is cool, and we love you ❤️",
  },
  {
    id: 2,
    question: "What's Wasp?",
    answer:
      "It's the fastest way to develop full-stack React + NodeJS + Prisma apps. It's what gives this template superpowers.",
  },
];
export const footerNavigation = {
  app: [
    { name: 'Pricing', href: '#pricing' },
    { name: 'Documentation', href: DOCS_URL }, 
    { name: 'Blog', href: BLOG_URL },
  ],
  company: [
    { name: 'About', href: '#' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms of Service', href: '#' },
  ],
};
