import type { NavigationItem } from '../NavBar/NavBar';
import { routes } from 'wasp/client/router';
import { BlogUrl, DocsUrl } from '../../../shared/common';
import { useTranslation } from 'react-i18next';

export const useAppNavigationItems = (): NavigationItem[] => {
  const { t, i18n } = useTranslation();
  
  // Debug log
  console.log('Current language:', i18n.language);
  console.log('Translation test:', t('navigation.aiScheduler'));

  return [
    { 
      name: t('navigation.aiScheduler'), 
      to: routes.DemoAppRoute.to 
    },
    { 
      name: t('navigation.fileUpload'), 
      to: routes.FileUploadRoute.to 
    },
    { 
      name: t('navigation.pricing'), 
      to: routes.PricingPageRoute.to 
    },
    { 
      name: t('navigation.documentation'), 
      to: DocsUrl 
    },
    { 
      name: t('navigation.blog'), 
      to: BlogUrl 
    },
  ];
};
