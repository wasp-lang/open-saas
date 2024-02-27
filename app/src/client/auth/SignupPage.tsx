import { SignupForm } from 'wasp/client/auth';
import { Link } from 'react-router-dom';
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
