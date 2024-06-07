import { Link, routes } from 'wasp/client/router';
import { useAuth } from 'wasp/client/auth';
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { BiLogIn } from 'react-icons/bi';
import { AiFillCloseCircle } from 'react-icons/ai';
import { HiBars3 } from 'react-icons/hi2';
import logo from '../static/logo.png';
import DropdownUser from './DropdownUser';
import { DOCS_URL, BLOG_URL } from '../../shared/constants';
import DarkModeSwitcher from '../admin/components/DarkModeSwitcher';
import { UserMenuItems } from '../components/UserMenuItems';

const navigation = [
  { name: 'AI Scheduler (Demo App)', href: routes.DemoAppRoute.build() },
  { name: 'File Upload (AWS S3)', href: routes.FileUploadRoute.build() },
  { name: 'Pricing', href: routes.PricingPageRoute.build() },
  { name: 'Documentation', href: DOCS_URL },
  { name: 'Blog', href: BLOG_URL },
];

const NavLogo = () => <img className='h-8 w-8' src={logo} alt='Your SaaS App' />;

export default function AppNavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: user, isLoading: isUserLoading } = useAuth();
  return (
    <header className='absolute inset-x-0 top-0 z-50 shadow bg-white bg-opacity-50 backdrop-blur-lg backdrop-filter dark:border dark:border-gray-100/10 dark:bg-boxdark-2'>
      <nav className='flex items-center justify-between p-6 lg:px-8' aria-label='Global'>
        <div className='flex lg:flex-1'>
          <a href='/' className='-m-1.5 p-1.5'>
            <img className='h-8 w-8' src={logo} alt='My SaaS App' />
          </a>
        </div>
        <div className='flex lg:hidden'>
          <button
            type='button'
            className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-white'
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
              className='text-sm font-semibold leading-6 text-gray-900 duration-300 ease-in-out hover:text-yellow-500 dark:text-white'
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className='hidden lg:flex lg:flex-1 gap-3 justify-end items-center'>
          <ul className='flex justify-center items-center gap-2 sm:gap-4'>
            <DarkModeSwitcher />
          </ul>

          {isUserLoading ? null : !user ? (
            <a href={!user ? routes.LoginRoute.build() : routes.AccountRoute.build()} className='text-sm font-semibold leading-6 ml-4'>
              <div className='flex items-center duration-300 ease-in-out text-gray-900 hover:text-yellow-500 dark:text-white'>
                Log in <BiLogIn size='1.1rem' className='ml-1 mt-[0.1rem]' />
              </div>
            </a>
          ) : (
            <div className='ml-4'>
              <DropdownUser user={user} />
            </div>
          )}
        </div>
      </nav>
      <Dialog as='div' className='lg:hidden' open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className='fixed inset-0 z-50' />
        <Dialog.Panel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:text-white dark:bg-boxdark px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
          <div className='flex items-center justify-between'>
            <a href='/' className='-m-1.5 p-1.5'>
              <span className='sr-only'>Your SaaS</span>
              <NavLogo />
            </a>
            <button
              type='button'
              className='-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-50'
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className='sr-only'>Close menu</span>
              <AiFillCloseCircle className='h-6 w-6' aria-hidden='true' />
            </button>
          </div>
          <div className='mt-6 flow-root'>
            <div className='-my-6 divide-y divide-gray-500/10'>
              <div className='space-y-2 py-6'>
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-white hover:dark:bg-boxdark-2'
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className='py-6'>
                {isUserLoading ? null : !user ? (
                  <Link to='/login'>
                    <div className='flex justify-end items-center duration-300 ease-in-out text-gray-900 hover:text-yellow-500 dark:text-white'>
                      Log in <BiLogIn size='1.1rem' className='ml-1' />
                    </div>
                  </Link>
                ) : (
                  <UserMenuItems user={user} setMobileMenuOpen={setMobileMenuOpen} />
                )}
              </div>
              <div className='py-6'>
                <DarkModeSwitcher />
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
