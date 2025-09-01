import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { useTranslation } from 'react-i18next';
import { SignupForm } from 'wasp/client/auth';
import { AuthPageLayout } from './AuthPageLayout';

export function Signup() {
  const { t } = useTranslation();
  
  return (
    <AuthPageLayout>
      <SignupForm />
      <br />
      <span className='text-sm font-medium text-gray-900'>
        {t('admin.alreadyHaveAccount')}
        <WaspRouterLink to={routes.LoginRoute.to} className='underline'>
          {t('admin.goToLogin')}
        </WaspRouterLink>
        ).
      </span>
      <br />
    </AuthPageLayout>
  );
}
