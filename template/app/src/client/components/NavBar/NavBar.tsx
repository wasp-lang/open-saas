import { Link } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import { useState, Dispatch, SetStateAction } from 'react';
import { Dialog } from '@headlessui/react';
import { BiLogIn } from 'react-icons/bi';
import { AiFillCloseCircle } from 'react-icons/ai';
import { HiBars3 } from 'react-icons/hi2';
import logo from '../../static/logo.png';
import DropdownUser from '../../../user/DropdownUser';
import { UserMenuItems } from '../../../user/UserMenuItems';
import DarkModeSwitcher from '../DarkModeSwitcher';
import { useIsLandingPage } from '../../hooks/useIsLandingPage';
import { cn } from '../../cn';
import { type Routes } from 'wasp/client/router';

interface NavigationItem {
  name: string;
  to: string; // TODO: fix this
}

const NavLogo = () => <img className='h-8 w-8' src={logo} alt='Your SaaS App' />;

export default function AppNavBar({ navigation }: { navigation: NavigationItem[] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLandingPage = useIsLandingPage();

  const { data: user, isLoading: isUserLoading } = useAuth();
  return (
    <header
      className={cn('absolute inset-x-0 top-0 z-50 dark:bg-boxdark-2', {
        'shadow sticky bg-white bg-opacity-50 backdrop-blur-lg backdrop-filter dark:border dark:border-gray-100/10':
          !isLandingPage,
      })}
    >
      <nav className='flex items-center justify-between p-6 lg:px-8' aria-label='Global'>
        <div className='flex items-center lg:flex-1'>
          <Link
            to='/'
            className='flex items-center -m-1.5 p-1.5 text-gray-900 duration-300 ease-in-out hover:text-yellow-500'
          >
            <NavLogo />
            {isLandingPage && (
              <span className='ml-2 text-sm font-semibold leading-6 dark:text-white'>Your Saas</span>
            )}
          </Link>
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
        <div className='hidden lg:flex lg:gap-x-12'>{renderNavigationItems(navigation)}</div>
        <div className='hidden lg:flex lg:flex-1 gap-3 justify-end items-center'>
          <ul className='flex justify-center items-center gap-2 sm:gap-4'>
            <DarkModeSwitcher />
          </ul>
          {isUserLoading ? null : !user ? (
            <Link to='/login' className='text-sm font-semibold leading-6 ml-3'>
              <div className='flex items-center duration-300 ease-in-out text-gray-900 hover:text-yellow-500 dark:text-white'>
                Log in <BiLogIn size='1.1rem' className='ml-1 mt-[0.1rem]' />
              </div>
            </Link>
          ) : (
            <div className='ml-3'>
              <DropdownUser user={user} />
            </div>
          )}
        </div>
      </nav>
      <Dialog as='div' className='lg:hidden' open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className='fixed inset-0 z-50' />
        <Dialog.Panel className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:text-white dark:bg-boxdark px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
          <div className='flex items-center justify-between'>
            <Link to='/' className='-m-1.5 p-1.5'>
              <span className='sr-only'>Your SaaS</span>
              <NavLogo />
            </Link>
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
              <div className='space-y-2 py-6'>{renderNavigationItems(navigation, setMobileMenuOpen)}</div>
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

function renderNavigationItems(
  navigation: NavigationItem[],
  setMobileMenuOpen?: Dispatch<SetStateAction<boolean>>
) {
  const menuStyles = cn({
    '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-boxdark-2':
      !!setMobileMenuOpen,
    'text-sm font-semibold leading-6 text-gray-900 duration-300 ease-in-out hover:text-yellow-500 dark:text-white':
      !setMobileMenuOpen,
  });

  return navigation.map((item) => {
    return (
      <Link
        to={item.to}
        className={menuStyles}
        key={item.name}
        onClick={() => setMobileMenuOpen?.(false)}
      >
        {item.name}
      </Link>
    );
  });
}
