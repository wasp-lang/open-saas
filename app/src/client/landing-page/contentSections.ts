import { DOCS_URL, BLOG_URL } from '@wasp/shared/constants';
import daBoiAavatar from '../static/da-boi.png';

export const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'Documentation', href: DOCS_URL },
  { name: 'Blog', href: BLOG_URL },
];
export const features = [
  {
    name: 'Open-Source Philosophy',
    description:
      "Forever free and open-source. Create an issue, make a PR, and together let's make the best SaaS template ever!",
    icon: '🤝',
  },
  {
    name: 'Auto-magic Auth',
    description:
      'Not only is full-stack Auth pre-configured, but you can integrate more providers with just a few lines of code.',
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
    description: 'Graphs! Tables! Analytics w/ Plausible or Google! All in one place. Ooooooooooh.',
    icon: '📈',
  },
  {
    name: 'Email Sending',
    description:
      "Email sending built-in and pre-configured. Combine it with Wasp's cron jobs feature to easily send emails to your customers.",
    icon: '📧',
  },
  {
    name: 'OpenAI API Implemented',
    description: "Technology is changing rapidly. Ship your new AI-powered app before it's already obsolete!",
    icon: '🤖',
  },
  {
    name: 'Deploy Anywhere. Easily.',
    description:
      'You own all your code, and can deploy wherever & however you want. Or just let Wasp deploy it for you with a single command.',
    icon: '🚀 ',
  },
  {
    name: 'Complete Documentation & Support',
    description: "We don't leave you hanging. We have tons of docs, and a Discord community to help!",
    icon: '🫂',
  },
];
export const testimonials = [
  // {
  //   name: 'Jason Warner',
  //   role: 'former CTO @ GitHub',
  //   avatarSrc: 'https://pbs.twimg.com/profile_images/1538765024021258240/qXJBzw6U_400x400.jpg',
  //   socialUrl: 'https://twitter.com/jasoncwarner',
  //   quote:
  //     "I've actually had a bunch of fun with [Wasp]... I loved Batman.js back in the day and getting some of those vibes.",
  // },
  {
    name: 'Max Khamrovskyi',
    role: 'Senior Eng @ Red Hat',
    avatarSrc: 'https://pbs.twimg.com/profile_images/1719397191205179392/V_QrGPSO_400x400.jpg',
    socialUrl: 'https://twitter.com/maksim36ua',
    quote: 'I used Wasp to build and sell my AI-augmented SaaS app for marketplace vendors within two months!',
  },
  // {
  //   name: 'Da Boi',
  //   role: 'Wasp Mascot',
  //   avatarSrc: daBoiAavatar,
  //   socialUrl: 'https://twitter.com/wasplang',
  //   quote: "I don't even know how to code. I'm just a plushie.",
  // },
  {
    name: 'Tim Skaggs',
    role: 'Founder @ Antler US',
    avatarSrc: 'https://pbs.twimg.com/profile_images/1486119226771480577/VptdEo6A_400x400.png',
    socialUrl: 'https://twitter.com/tskaggs',
    quote: 'Nearly done with a MVP in 3 days of part-time work... and deployed on Fly.io in 10 minutes.',
  },
  // {
  //   name: 'Fecony',
  //   role: 'Wasp Expert',
  //   avatarSrc: 'https://pbs.twimg.com/profile_images/1560677466749943810/QIFuQMqU_400x400.jpg',
  //   socialUrl: 'https://twitter.com/webrickony',
  //   quote: 'My cats love it!',
  // },
  {
    name: 'Jonathan Cocharan',
    role: 'Entrepreneur',
    avatarSrc: 'https://pbs.twimg.com/profile_images/926142421653753857/o6Hmcbr7_400x400.jpg',
    socialUrl: 'https://twitter.com/jonathancocharan',
    quote:
      'In just 6 nights... my SaaS app is live 🎉! Huge thanks to the amazing @wasplang community 🙌 for their guidance along the way. These tools are incredibly efficient 🤯!',
  },
];

export const faqs = [
  {
    id: 1,
    question: 'Why is this amazing SaaS Template free and open-source?',
    answer: 'Because open-source is cool, and we love you ❤️',
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
    { name: 'Documentation', href: DOCS_URL },
    { name: 'Blog', href: BLOG_URL },
  ],
  company: [
    { name: 'About', href: '#' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms of Service', href: '#' },
  ],
};
