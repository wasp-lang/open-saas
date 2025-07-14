import { routes } from 'wasp/client/router';
import type { NavigationItem } from '../client/components/NavBar/NavBar';
import avatarPlaceholder from '../client/static/avatar-placeholder.webp';
import daBoiAvatar from '../client/static/da-boi.webp';
import openSaasBannerWebp from '../client/static/open-saas-banner.webp';
import { BlogUrl, DocsUrl } from '../shared/common';

export const landingPageNavigationItems: NavigationItem[] = [
  { name: 'Features', to: '#features' },
  { name: 'Pricing', to: routes.PricingPageRoute.to },
  { name: 'Documentation', to: DocsUrl },
  { name: 'Blog', to: BlogUrl },
];
export const features = [
  {
    name: 'Cool Feature 1',
    description: 'Your feature',
    icon: '🤝',
    href: DocsUrl,
    span: 0.5,
  },
  {
    name: 'Cool Feature 2',
    description: 'Feature description',
    icon: '🔐',
    href: DocsUrl,
    span: 0.5,
  },
  {
    name: 'Cool Feature 3',
    description: 'Describe your cool feature here',
    icon: '🥞',
    href: DocsUrl,
    span: 1,
  },
  {
    name: 'Cool Feature 4',
    description: 'Describe your cool feature here',
    icon: '💸',
    href: DocsUrl,
    span: 2,
  },
  {
    name: 'Cool Feature 5',
    description: 'Describe your cool feature here',
    icon: '💼',
    href: DocsUrl,
    span: 2,
  },
  {
    name: 'Cool Feature 6',
    description: 'It is cool',
    icon: '📈',
    href: DocsUrl,
    span: 0.5,
  },
  {
    name: 'Cool Feature 7',
    description: 'Cool feature',
    icon: '📧',
    href: DocsUrl,
    span: 0.5,
  },
  {
    name: 'Cool Feature 8',
    description: 'Describe your cool feature here',
    icon: '🤖',
    href: DocsUrl,
  },
  {
    name: 'Cool Feature 9',
    description: 'Describe your cool feature here',
    icon: '🚀',
    href: DocsUrl,
  },
];

export const testimonials = [
  {
    name: 'Da Boi',
    role: 'Wasp Mascot',
    avatarSrc: daBoiAvatar,
    socialUrl: 'https://twitter.com/wasplang',
    quote: "I don't even know how to code. I'm just a plushie.",
  },
  {
    name: 'Mr. Foobar',
    role: 'Founder @ Cool Startup',
    avatarSrc: avatarPlaceholder,
    socialUrl: '',
    quote: 'This product makes me cooler than I already am.',
  },
  {
    name: 'Jamie',
    role: 'Happy Customer',
    avatarSrc: avatarPlaceholder,
    socialUrl: '#',
    quote: 'My cats love it!',
  },
];

export const faqs = [
  {
    id: 1,
    question: 'Whats the meaning of life?',
    answer: '42.',
    href: 'https://en.wikipedia.org/wiki/42_(number)',
  },
];
export const footerNavigation = {
  app: [
    { name: 'Documentation', href: DocsUrl },
    { name: 'Blog', href: BlogUrl },
  ],
  company: [
    { name: 'About', href: 'https://wasp.sh' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms of Service', href: '#' },
  ],
};

export const examples = [
  {
    name: 'Example #1',
    description: 'Describe your example here.',
    imageSrc: openSaasBannerWebp,
  },
  {
    name: 'Example #2',
    description: 'Describe your example here.',
    imageSrc: openSaasBannerWebp,
  },
  {
    name: 'Example #3',
    description: 'Describe your example here.',
    imageSrc: openSaasBannerWebp,
  },
  {
    name: 'Example #4',
    description: 'Describe your example here.',
    imageSrc: openSaasBannerWebp,
  },
  {
    name: 'Example #5',
    description: 'Describe your example here.',
    imageSrc: openSaasBannerWebp,
  },
];
