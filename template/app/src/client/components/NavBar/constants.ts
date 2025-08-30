import { routes } from 'wasp/client/router';
import { BlogUrl, DocsUrl } from '../../../shared/common';
import type { NavigationItem } from './NavBar';

// 使用函数来获取翻译后的导航项
export const getMarketingNavigationItems = (t: (key: string) => string): NavigationItem[] => [
  { name: t('navigation.features'), to: '/#features' },
  { name: t('navigation.pricing'), to: routes.PricingPageRoute.to },
  { name: 'Documentation', to: DocsUrl },
  { name: 'Blog', to: BlogUrl },
];

export const getDemoNavigationItems = (t: (key: string) => string): NavigationItem[] => [
  { name: 'AI Scheduler', to: routes.DemoAppRoute.to },
  { name: 'File Upload', to: routes.FileUploadRoute.to },
  { name: t('navigation.pricing'), to: routes.PricingPageRoute.to },
  { name: 'Documentation', to: DocsUrl },
  { name: 'Blog', to: BlogUrl },
];

// 保留旧的导出以保持向后兼容性
const staticNavigationItems: NavigationItem[] = [
  { name: 'Documentation', to: DocsUrl },
  { name: 'Blog', to: BlogUrl },
];

export const marketingNavigationItems: NavigationItem[] = [
  { name: 'Features', to: '/#features' },
  { name: 'Pricing', to: routes.PricingPageRoute.to },
  ...staticNavigationItems,
] as const;

export const demoNavigationitems: NavigationItem[] = [
  { name: 'AI Scheduler', to: routes.DemoAppRoute.to },
  { name: 'File Upload', to: routes.FileUploadRoute.to },
  { name: 'Pricing', to: routes.PricingPageRoute.to },
  ...staticNavigationItems,
] as const;
