import { LayoutDashboard, Settings, Shield } from 'lucide-react';
import { routes } from 'wasp/client/router';

// 使用函数来获取翻译后的用户菜单项
export const getUserMenuItems = (t: (key: string) => string) => [
  {
    name: t('user.aiScheduler'),
    to: routes.DemoAppRoute.to,
    icon: LayoutDashboard,
    isAdminOnly: false,
    isAuthRequired: true,
  },
  {
    name: t('user.accountSettings'),
    to: routes.AccountRoute.to,
    icon: Settings,
    isAuthRequired: false,
    isAdminOnly: false,
  },
  {
    name: t('user.adminDashboard'),
    to: routes.AdminRoute.to,
    icon: Shield,
    isAuthRequired: false,
    isAdminOnly: true,
  },
];

// 保留旧的导出以保持向后兼容性
export const userMenuItems = [
  {
    name: 'AI Scheduler (Demo App)',
    to: routes.DemoAppRoute.to,
    icon: LayoutDashboard,
    isAdminOnly: false,
    isAuthRequired: true,
  },
  {
    name: 'Account Settings',
    to: routes.AccountRoute.to,
    icon: Settings,
    isAuthRequired: false,
    isAdminOnly: false,
  },
  {
    name: 'Admin Dashboard',
    to: routes.AdminRoute.to,
    icon: Shield,
    isAuthRequired: false,
    isAdminOnly: true,
  },
] as const;
