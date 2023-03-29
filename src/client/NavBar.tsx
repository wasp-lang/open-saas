
import logo from './static/logo.png'
import { Disclosure } from '@headlessui/react';
import { AiOutlineBars, AiOutlineClose, AiOutlineUser } from 'react-icons/ai';
import useAuth from '@wasp/auth/useAuth';

const active = 'inline-flex items-center border-b-2 border-indigo-300 px-1 pt-1 text-sm font-medium text-gray-900';
const inactive = 'inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700'
const current = window.location.pathname;

export default function NavBar() {
  const { data: user } = useAuth();

  return (
    <Disclosure as='nav' className='bg-white shadow sticky top-0 z-50 '>
      {({ open }) => (
        <>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-16'>
            <div className='flex h-16 justify-between'>
              <div className='flex'>
                <div className='flex flex-shrink-0 items-center'>
                  <a href='/'>
                    <img className='h-8 w-8' src={logo} alt='My SaaS App' />
                  </a>
                </div>
                <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
                  <a href='/' className={current === '/' ? active : inactive}>
                    Landing Page
                  </a>
                  <a href='/pricing' className={current.includes('pricing') ? active : inactive}>
                    Pricing
                  </a>
                  <a href='/gpt' className={current.includes('gpt') ? active : inactive}>
                    GPT
                  </a>
                </div>
              </div>
              <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
                <a href={!!user ? '/account' : '/login'} className={current === '/account' ? active : inactive}>
                  <AiOutlineUser className='h-6 w-6 mr-2' />
                  Account
                </a>
              </div>
              <div className='-mr-2 flex items-center sm:hidden'>
                {/* Mobile menu */}
                <Disclosure.Button className='inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-300'>
                  <span className='sr-only'>Open menu</span>
                  {open ? (
                    <AiOutlineClose className='block h-6 w-6' aria-hidden='true' />
                  ) : (
                    <AiOutlineBars className='block h-6 w-6' aria-hidden='true' />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className='sm:hidden'>
            <div className='space-y-1 pt-2 pb-3'>
              <Disclosure.Button
                as='a'
                href='/'
                className='block border-l-4 border-indigo-300 bg-indigo-50 py-2 pl-3 pr-4 text-base font-medium text-indigo-500'
              >
                Landing Page
              </Disclosure.Button>
              <Disclosure.Button
                as='a'
                href='/pricing'
                className='block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
              >
                Pricing
              </Disclosure.Button>
              <Disclosure.Button
                as='a'
                href='/gpt'
                className='block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
              >
                GPT
              </Disclosure.Button>
              <Disclosure.Button
                as='a'
                href='/account'
                className='block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              >
                Account
              </Disclosure.Button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
