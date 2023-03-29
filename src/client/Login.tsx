import { signInUrl } from '@wasp/auth/helpers/Google';
import { AiOutlineGoogle } from 'react-icons/ai';
import { useHistory } from 'react-router-dom';
import { useEffect } from 'react';
import useAuth from '@wasp/auth/useAuth';

export default function Login() {
  const history = useHistory();

  const { data: user } = useAuth();

  useEffect(() => {
    if (user) {
      history.push('/');
    }
  }, [user, history]);

  return (
    <>
      <div className='flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
          <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>Sign in to your account</h2>
        </div>

        <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
          <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
            <div className='mt-6'>
              <div>
                <a
                  href={signInUrl}
                  className='inline-flex w-full justify-center items-center rounded-md bg-white py-2 px-4 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                >
                  <AiOutlineGoogle className='h-5 w-5 mr-2' />
                  <span >Sign in with Google</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
