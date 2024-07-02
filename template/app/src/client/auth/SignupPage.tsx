import { SignupForm } from 'wasp/client/auth';
import { Link } from 'wasp/client/router';
import { AuthWrapper } from './authWrapper';

export function Signup() {
  return (
    <AuthWrapper>
      <SignupForm />
      <br />
      <span className='text-sm font-medium text-gray-900'>
        I already have an account (
        <Link to='/login' className='underline'>
          go to login
        </Link>
        ).
      </span>
      <br />
    </AuthWrapper>
  );
}
