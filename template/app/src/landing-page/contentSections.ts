import { routes } from 'wasp/client/router';
import type { NavigationItem } from '../client/components/NavBar/NavBar';
import avatarPlaceholder from '../client/static/avatar-placeholder.webp';
import daBoiAvatar from '../client/static/da-boi.webp';
import openSaasBannerWebp from '../client/static/open-saas-banner.webp';
import { BlogUrl, DocsUrl } from '../shared/common';
import type { GridFeature } from './components/FeaturesGrid';

export const landingPageNavigationItems: NavigationItem[] = [
  { name: 'Features', to: '#features' },
  { name: 'Pricing', to: routes.PricingPageRoute.to },
  { name: 'Documentation', to: DocsUrl },
  { name: 'Blog', to: BlogUrl },
];
export const features: GridFeature[] = [
  {
    name: 'Cool Feature 1',
    description: 'Your feature',
    emoji: '🤝',
    href: DocsUrl,
    size: 'small',
  },
  {
    name: 'Cool Feature 2',
    description: 'Feature description',
    emoji: '🔐',
    href: DocsUrl,
    size: 'small',
  },
  {
    name: 'Cool Feature 3',
    description: 'Describe your cool feature here',
    emoji: '🥞',
    href: DocsUrl,
    size: 'medium',
  },
  {
    name: 'Cool Feature 4',
    description: 'Describe your cool feature here',
    emoji: '💸',
    href: DocsUrl,
    size: 'large',
  },
  {
    name: 'Cool Feature 5',
    description: 'Describe your cool feature here',
    emoji: '💼',
    href: DocsUrl,
    size: 'large',
  },
  {
    name: 'Cool Feature 6',
    description: 'It is cool',
    emoji: '📈',
    href: DocsUrl,
    size: 'small',
  },
  {
    name: 'Cool Feature 7',
    description: 'Cool feature',
    emoji: '📧',
    href: DocsUrl,
    size: 'small',
  },
  {
    name: 'Cool Feature 8',
    description: 'Describe your cool feature here',
    emoji: '🤖',
    href: DocsUrl,
    size: 'medium',
  },
  {
    name: 'Cool Feature 9',
    description: 'Describe your cool feature here',
    emoji: '🚀',
    href: DocsUrl,
    size: 'medium',
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
    href: '#',
  },
  {
    name: 'Example #2',
    description: 'Describe your example here.',
    imageSrc: openSaasBannerWebp,
    href: '#',
  },
  {
    name: 'Example #3',
    description: 'Describe your example here.',
    imageSrc: openSaasBannerWebp,
    href: '#',
  },
  {
    name: 'Example #4',
    description: 'Describe your example here.',
    imageSrc: openSaasBannerWebp,
    href: '#',
  },
  {
    name: 'Example #5',
    description: 'Describe your example here.',
    imageSrc: openSaasBannerWebp,
    href: '#',
  },
  {
    name: 'Example #6',
    description: 'Describe your example here.',
    imageSrc: openSaasBannerWebp,
    href: '#',
  },
  {
    name: 'Example #7',
    description: 'Describe your example here.',
    imageSrc: openSaasBannerWebp,
    href: '#',
  },
];
