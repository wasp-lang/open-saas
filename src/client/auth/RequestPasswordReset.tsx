import { ForgotPasswordForm } from '@wasp/auth/forms/ForgotPassword';
import { AuthWrapper } from './authWrapper';

export function RequestPasswordReset() {
  return (
    <AuthWrapper>
      <ForgotPasswordForm />
    </AuthWrapper>
  );
}
