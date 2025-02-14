import type { NavigationItem } from '../client/components/NavBar/NavBar';
import { routes } from 'wasp/client/router';
import { DocsUrl, BlogUrl } from '../shared/common';
import daBoiAvatar from '../client/static/da-boi.webp';
import avatarPlaceholder from '../client/static/avatar-placeholder.webp';
import { useTranslation } from 'react-i18next';

// Navigation Items
export const landingPageNavigationItems: NavigationItem[] = [
  { name: 'Features', to: '#features' },
  { name: 'Pricing', to: routes.PricingPageRoute.to },
  { name: 'Documentation', to: DocsUrl },
  { name: 'Blog', to: BlogUrl },
];

export const useLandingPageNavigationItems = (): NavigationItem[] => {
  const { t } = useTranslation();
  return [
    { name: t('navigation.features'), to: '#features' },
    { name: t('navigation.pricing'), to: routes.PricingPageRoute.to },
    { name: t('navigation.documentation'), to: DocsUrl },
    { name: t('navigation.blog'), to: BlogUrl },
  ];
};

// Features
export const features = [
  {
    name: 'Cool Feature #1',
    description: 'Describe your cool feature here.',
    icon: '🤝',
    href: DocsUrl,
  },
  {
    name: 'Cool Feature #2',
    description: 'Describe your cool feature here.',
    icon: '🔐',
    href: DocsUrl,
  },
  {
    name: 'Cool Feature #3',
    description: 'Describe your cool feature here.',
    icon: '🥞',
    href: DocsUrl,
  },
  {
    name: 'Cool Feature #4',
    description: 'Describe your cool feature here.',
    icon: '💸',
    href: DocsUrl,
  },
];

export const useFeatures = () => {
  const { t } = useTranslation();
  return [
    {
      name: t('features.feature1.name'),
      description: t('features.feature1.description'),
      icon: '🤝',
      href: DocsUrl,
    },
    {
      name: t('features.feature2.name'),
      description: t('features.feature2.description'),
      icon: '🔐',
      href: DocsUrl,
    },
    {
      name: t('features.feature3.name'),
      description: t('features.feature3.description'),
      icon: '🥞',
      href: DocsUrl,
    },
    {
      name: t('features.feature4.name'),
      description: t('features.feature4.description'),
      icon: '💸',
      href: DocsUrl,
    },
  ];
};

// Testimonials
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

export const useTestimonials = () => {
  const { t } = useTranslation();
  return [
    {
      name: t('testimonials.daBoi.name'),
      role: t('testimonials.daBoi.role'),
      avatarSrc: daBoiAvatar,
      socialUrl: 'https://twitter.com/wasplang',
      quote: t('testimonials.daBoi.quote'),
    },
    {
      name: t('testimonials.mrFoobar.name'),
      role: t('testimonials.mrFoobar.role'),
      avatarSrc: avatarPlaceholder,
      socialUrl: '',
      quote: t('testimonials.mrFoobar.quote'),
    },
    {
      name: t('testimonials.jamie.name'),
      role: t('testimonials.jamie.role'),
      avatarSrc: avatarPlaceholder,
      socialUrl: '#',
      quote: t('testimonials.jamie.quote'),
    },
  ];
};

// Static FAQs for non-translated usage
export const faqs = [
  {
    id: 1,
    question: "What's the meaning of life?",
    answer: "42.",
    href: 'https://en.wikipedia.org/wiki/42_(number)',
  },
];

// Hook for translated FAQs
export const useFaqs = () => {
  const { t } = useTranslation();
  return [
    {
      id: 1,
      question: t('faqs.question1.question'),
      answer: t('faqs.question1.answer'),
      href: 'https://en.wikipedia.org/wiki/42_(number)',
    },
  ];
};

// Static footer navigation for non-translated usage
export const footerNavigation = {
  app: [
    { name: 'Documentation', href: DocsUrl },
    { name: 'Blog', href: BlogUrl },
  ],
  company: [
    { name: 'About', href: 'https://wasp.sh' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
  ],
};

// Hook for translated footer navigation
export const useFooterNavigation = () => {
  const { t } = useTranslation();
  return {
    app: [
      { name: t('footer.app.documentation'), href: DocsUrl },
      { name: t('footer.app.blog'), href: BlogUrl },
    ],
    company: [
      { name: t('footer.company.about'), href: 'https://wasp-lang.dev' },
      { name: t('footer.company.privacy'), href: '#' },
      { name: t('footer.company.terms'), href: '#' },
    ],
  };
};
