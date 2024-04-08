import { ForgotPasswordForm } from 'wasp/client/auth';
import { AuthWrapper } from './authWrapper';

export function RequestPasswordReset() {
  return (
    <AuthWrapper>
      <ForgotPasswordForm />
    </AuthWrapper>
  );
}
