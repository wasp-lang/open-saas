import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { useTranslation } from 'react-i18next';
import { ResetPasswordForm } from 'wasp/client/auth';
import { AuthPageLayout } from '../AuthPageLayout';

export function PasswordResetPage() {
  const { t } = useTranslation();
  
  return (
    <AuthPageLayout>
      <ResetPasswordForm />
      <br />
      <span className='text-sm font-medium text-gray-900'>
        {t('admin.ifEverythingIsOkay')} <WaspRouterLink to={routes.LoginRoute.to}>{t('admin.goToLogin')}</WaspRouterLink>
      </span>
    </AuthPageLayout>
  );
}
