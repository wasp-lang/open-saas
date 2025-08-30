import daBoiAvatar from '../client/static/da-boi.webp';
import kivo from '../client/static/examples/kivo.webp';
import messync from '../client/static/examples/messync.webp';
import microinfluencerClub from '../client/static/examples/microinfluencers.webp';
import promptpanda from '../client/static/examples/promptpanda.webp';
import reviewradar from '../client/static/examples/reviewradar.webp';
import scribeist from '../client/static/examples/scribeist.webp';
import searchcraft from '../client/static/examples/searchcraft.webp';
import { BlogUrl, DocsUrl } from '../shared/common';
import type { GridFeature } from './components/FeaturesGrid';

// 使用函数来获取翻译后的功能列表
export const getFeatures = (t: (key: string) => string): GridFeature[] => [
  {
    name: t('landing.features.feature1.name'),
    description: t('landing.features.feature1.description'),
    emoji: '🤝',
    href: DocsUrl,
    size: 'small',
  },
  {
    name: t('landing.features.feature2.name'),
    description: t('landing.features.feature2.description'),
    emoji: '🔐',
    href: DocsUrl,
    size: 'small',
  },
  {
    name: t('landing.features.feature3.name'),
    description: t('landing.features.feature3.description'),
    emoji: '🥞',
    href: DocsUrl,
    size: 'medium',
  },
  {
    name: t('landing.features.feature4.name'),
    description: t('landing.features.feature4.description'),
    emoji: '💸',
    href: DocsUrl,
    size: 'large',
  },
  {
    name: t('landing.features.feature5.name'),
    description: t('landing.features.feature5.description'),
    emoji: '💼',
    href: DocsUrl,
    size: 'large',
  },
  {
    name: t('landing.features.feature6.name'),
    description: t('landing.features.feature6.description'),
    emoji: '📈',
    href: DocsUrl,
    size: 'small',
  },
  {
    name: t('landing.features.feature7.name'),
    description: t('landing.features.feature7.description'),
    emoji: '📧',
    href: DocsUrl,
    size: 'small',
  },
  {
    name: t('landing.features.feature8.name'),
    description: t('landing.features.feature8.description'),
    emoji: '🤖',
    href: DocsUrl,
    size: 'medium',
  },
  {
    name: t('landing.features.feature9.name'),
    description: t('landing.features.feature9.description'),
    emoji: '🚀',
    href: DocsUrl,
    size: 'medium',
  },
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
    avatarSrc: daBoiAvatar,
    socialUrl: '',
    quote: 'This product makes me cooler than I already am.',
  },
  {
    name: 'Jamie',
    role: 'Happy Customer',
    avatarSrc: daBoiAvatar,
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
    imageSrc: kivo,
    href: '#',
  },
  {
    name: 'Example #2',
    description: 'Describe your example here.',
    imageSrc: messync,
    href: '#',
  },
  {
    name: 'Example #3',
    description: 'Describe your example here.',
    imageSrc: microinfluencerClub,
    href: '#',
  },
  {
    name: 'Example #4',
    description: 'Describe your example here.',
    imageSrc: promptpanda,
    href: '#',
  },
  {
    name: 'Example #5',
    description: 'Describe your example here.',
    imageSrc: reviewradar,
    href: '#',
  },
  {
    name: 'Example #6',
    description: 'Describe your example here.',
    imageSrc: scribeist,
    href: '#',
  },
  {
    name: 'Example #7',
    description: 'Describe your example here.',
    imageSrc: searchcraft,
    href: '#',
  },
];
