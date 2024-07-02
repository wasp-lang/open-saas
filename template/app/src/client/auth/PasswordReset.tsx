import { ResetPasswordForm } from 'wasp/client/auth';
import { Link } from 'wasp/client/router';
import { AuthWrapper } from './authWrapper';

export function PasswordReset() {
  return (
    <AuthWrapper>
      <ResetPasswordForm />
      <br />
      <span className='text-sm font-medium text-gray-900'>
        If everything is okay, <Link to='/login'>go to login</Link>
      </span>
    </AuthWrapper>
  );
}
