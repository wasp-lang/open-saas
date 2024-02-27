import { DOCS_URL, BLOG_URL } from '../../shared/constants';
import daBoiAvatar from '../static/da-boi.png';
import avatarPlaceholder from '../static/avatar-placeholder.png';

export const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Documentation', href: DOCS_URL },
  { name: 'Blog', href: BLOG_URL },
];
export const features = [
  {
    name: 'Cool Feature #1',
    description: 'Describe your cool feature here.',
    icon: '🤝',
    href: DOCS_URL,
  },
  {
    name: 'Cool Feature #2',
    description: 'Describe your cool feature here.',
    icon: '🔐',
    href: DOCS_URL,
  },
  {
    name: 'Cool Feature #3',
    description: 'Describe your cool feature here.',
    icon: '🥞',
    href: DOCS_URL,
  },
  {
    name: 'Cool Feature #4',
    description: 'Describe your cool feature here.',
    icon: '💸',
    href: DOCS_URL,
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
    { name: 'Documentation', href: DOCS_URL },
    { name: 'Blog', href: BLOG_URL },
  ],
  company: [
    { name: 'About', href: 'https://wasp-lang.dev' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms of Service', href: '#' },
  ],
};
