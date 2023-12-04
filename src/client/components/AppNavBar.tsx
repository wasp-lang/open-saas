import { useState } from 'react';
import { BiLogIn } from 'react-icons/bi';
import { HiBars3 } from 'react-icons/hi2';
import useAuth from '@wasp/auth/useAuth';
import logo from '../static/logo.png';
import DropdownUser from './DropdownUser';
import { DOCS_URL, BLOG_URL } from '@wasp/shared/constants';

const navigation = [
  { name: 'GPT Wrapper', href: '/gpt' },
  { name: 'Documentation', href: DOCS_URL }, 
  { name: 'Blog', href: BLOG_URL }, 
]; 

export default function AppNavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user, isLoading: isUserLoading } = useAuth();
  return (
    <header className='absolute inset-x-0 top-0 z-50 shadow sticky bg-white bg-opacity-50 backdrop-blur-lg backdrop-filter'>
      <nav className='flex items-center justify-between p-6 lg:px-8' aria-label='Global'>
        <div className='flex lg:flex-1'>
          <a href='/' className='-m-1.5 p-1.5'>
            <img className='h-8 w-8' src={logo} alt='My SaaS App' />
          </a>
        </div>
        <div className='flex lg:hidden'>
          <button
            type='button'
            className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700'
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className='sr-only'>Open main menu</span>
            <HiBars3 className='h-6 w-6' aria-hidden='true' />
          </button>
        </div>
        <div className='hidden lg:flex lg:gap-x-12'>
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className='text-sm font-semibold leading-6 text-gray-900 duration-300 ease-in-out hover:text-yellow-500'
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className='hidden lg:flex lg:flex-1 lg:justify-end lg:align-end'>
          {isUserLoading ? null : !user ? (
            <a
              href={!user ? '/login' : '/account'}
              className='flex justify-end items-center text-sm  font-semibold leading-6 '
            >
              <div className='duration-300 ease-in-out text-gray-900 hover:text-yellow-500'>
                Log in <BiLogIn size='1.1rem' className='ml-1 mt-[0.1rem]' />
              </div>
            </a>
          ) : (
            <DropdownUser user={user} />
          )}
        </div>
      </nav>
    </header>
  );
}
