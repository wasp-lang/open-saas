import { DOCS_URL, BLOG_URL, GITHUB_URL } from '../../shared/constants';
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
      'The repo and framework are 100% open-source, and so are the services wherever possible. Still missing something? Contribute!',
    icon: '🤝',
    href: DOCS_URL,
  },
  {
    name: 'DIY Auth, Done For You',
    description: 'Pre-configured full-stack Auth that you own. No 3rd-party services or hidden fees.',
    icon: '🔐',
    href: DOCS_URL + '/guides/authentication/',
  },
  {
    name: 'Full-stack Type Safety',
    description:
      'Full support for TypeScript with auto-generated types that span the whole stack. Nothing to configure!',
    icon: '🥞',
    href: DOCS_URL,
  },
  {
    name: 'Stripe Integration',
    description:
      "No SaaS is complete without payments. That's why subscriptions and the necessary webhooks are built-in.",
    icon: '💸',
    href: DOCS_URL + '/guides/stripe-integration/',
  },
  {
    name: 'Admin Dashboard',
    description: 'Graphs! Tables! Analytics w/ Plausible or Google! All in one place. Ooooooooooh.',
    icon: '📈',
    href: DOCS_URL + '/general/admin-dashboard/',
  },
  {
    name: 'Email Sending',
    description:
      'Email sending built-in. Combine it with the cron jobs feature to easily send emails to your customers.',
    icon: '📧',
    href: DOCS_URL + '/guides/email-sending/',
  },
  {
    name: 'OpenAI API Implemented',
    description: 'Have a sweet AI-powered app concept? Get your idea shipped to potential customers in days!',
    icon: '🤖',
    href: DOCS_URL,
  },
  {
    name: 'File Uploads with AWS',
    description: 'File upload examples with AWS S3 presigned URLs are included and fully documented!',
    icon: '📁',
    href: DOCS_URL + '/guides/file-uploading/',
  },
  {
    name: 'Deploy Anywhere. Easily.',
    description:
      'No vendor lock-in because you own all your code. Deploy yourself, or let Wasp deploy it for you with a single command.',
    icon: '🚀 ',
    href: DOCS_URL + '/guides/deploying/',
  },
  {
    name: 'Blog w/ Astro',
    description:
      'Built-in blog with the Astro framework. Write your posts in Markdown, and watch your SEO performance take off.',
    icon: '📝',
    href: DOCS_URL + '/start/guided-tour/',
  },
  {
    name: 'Complete Documentation & Support',
    description: "We don't leave you hanging. We have detailed docs and a Discord community to help!",
    icon: '🫂',
    href: DOCS_URL,
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
    question: 'Why is this SaaS Template free and open-source?',
    answer:
      'We believe the best product is made when the community puts their heads together. We also believe a quality starting point for a web app should be free and available to everyone. Our hope is that together we can create the best SaaS template out there and bring our ideas to customers quickly.',
  },
  {
    id: 2,
    question: "What's Wasp?",
    href: 'https://wasp-lang.dev',
    answer: "It's the fastest way to develop full-stack React + NodeJS + Prisma apps and it's what gives this template superpowers. Wasp relies on React, NodeJS, and Prisma to define web components and server queries and actions. Wasp's secret sauce is its compiler which takes the client, server code, and config file and outputs the client app, server app and deployment code, supercharging the development experience. Combined with this template, you can build a SaaS app in record time.",
  },
];
export const footerNavigation = {
  app: [
    { name: 'Github', href: GITHUB_URL },
    { name: 'Documentation', href: DOCS_URL },
    { name: 'Blog', href: BLOG_URL },
  ],
  company: [
    { name: 'About', href: 'https://wasp-lang.dev' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms of Service', href: '#' },
  ],
};
