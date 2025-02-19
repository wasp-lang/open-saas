import { Link as ReactRouterLink } from 'react-router-dom';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { useAuth } from 'wasp/client/auth';
import { useState, Dispatch, SetStateAction } from 'react';
import { Dialog } from '@headlessui/react';
import { BiLogIn } from 'react-icons/bi';
import { AiFillCloseCircle } from 'react-icons/ai';
import { HiBars3 } from 'react-icons/hi2';
import logo from '../../static/logo.webp';
import DropdownUser from '../../../user/DropdownUser';
import { UserMenuItems } from '../../../user/UserMenuItems';
import DarkModeSwitcher from '../DarkModeSwitcher';
import { useIsLandingPage } from '../../hooks/useIsLandingPage';
import { cn } from '../../cn';

export interface NavigationItem {
  name: string;
  to: string;
}

const NavLogo = () => <img className='h-8 w-8' src={logo} alt='Your SaaS App' />;

export default function AppNavBar({ navigationItems }: { navigationItems: NavigationItem[] }) {
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
      {isLandingPage && <Announcement />}
      <nav className='flex items-center justify-between p-6 lg:px-8' aria-label='Global'>
        <div className='flex items-center lg:flex-1'>
          <WaspRouterLink
            to={routes.LandingPageRoute.to}
            className='flex items-center -m-1.5 p-1.5 text-gray-900 duration-300 ease-in-out hover:text-yellow-500'
          >
            <NavLogo />
            {isLandingPage && (
              <span className='ml-2 text-sm font-semibold leading-6 dark:text-white'>Your Saas</span>
            )}
          </WaspRouterLink>
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
        <div className='hidden lg:flex lg:gap-x-12'>{renderNavigationItems(navigationItems)}</div>
        <div className='hidden lg:flex lg:flex-1 gap-3 justify-end items-center'>
          <ul className='flex justify-center items-center gap-2 sm:gap-4'>
            <DarkModeSwitcher />
          </ul>
          {isUserLoading ? null : !user ? (
            <WaspRouterLink to={routes.LoginRoute.to} className='text-sm font-semibold leading-6 ml-3'>
              <div className='flex items-center duration-300 ease-in-out text-gray-900 hover:text-yellow-500 dark:text-white'>
                Log in <BiLogIn size='1.1rem' className='ml-1 mt-[0.1rem]' />
              </div>
            </WaspRouterLink>
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
            <WaspRouterLink to={routes.LandingPageRoute.to} className='-m-1.5 p-1.5'>
              <span className='sr-only'>Your SaaS</span>
              <NavLogo />
            </WaspRouterLink>
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
              <div className='space-y-2 py-6'>{renderNavigationItems(navigationItems, setMobileMenuOpen)}</div>
              <div className='py-6'>
                {isUserLoading ? null : !user ? (
                  <WaspRouterLink to={routes.LoginRoute.to}>
                    <div className='flex justify-end items-center duration-300 ease-in-out text-gray-900 hover:text-yellow-500 dark:text-white'>
                      Log in <BiLogIn size='1.1rem' className='ml-1' />
                    </div>
                  </WaspRouterLink>
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
  navigationItems: NavigationItem[],
  setMobileMenuOpen?: Dispatch<SetStateAction<boolean>>
) {
  const menuStyles = cn({
    '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-boxdark-2':
      !!setMobileMenuOpen,
    'text-sm font-semibold leading-6 text-gray-900 duration-300 ease-in-out hover:text-yellow-500 dark:text-white':
      !setMobileMenuOpen,
  });

  return navigationItems.map((item) => {
    return (
      <ReactRouterLink
        to={item.to}
        key={item.name}
        className={menuStyles}
        onClick={setMobileMenuOpen && (() => setMobileMenuOpen(false))}
      >
        {item.name}
      </ReactRouterLink>
    );
  });
}

const ContestURL = 'https://github.com/wasp-lang/wasp';

function Announcement() {
  return (
    <div className='flex justify-center items-center gap-3 p-3 w-full bg-gradient-to-r from-[#d946ef] to-[#fc0] font-semibold text-white text-center z-49'>
      <p
        onClick={() => window.open(ContestURL, '_blank')}
        className='hidden lg:block cursor-pointer hover:opacity-90 hover:drop-shadow'
      >
        Support Open-Source Software!
      </p>
      <div className='hidden lg:block self-stretch w-0.5 bg-white'></div>
      <div
        onClick={() => window.open(ContestURL, '_blank')}
        className='hidden lg:block cursor-pointer rounded-full bg-neutral-700 px-2.5 py-1 text-xs hover:bg-neutral-600 tracking-wider'
      >
        Star Our Repo on Github ⭐️ →
      </div>
      <div
        onClick={() => window.open(ContestURL, '_blank')}
        className='lg:hidden cursor-pointer rounded-full bg-neutral-700 px-2.5 py-1 text-xs hover:bg-neutral-600 tracking-wider'
      >
        ⭐️ Star the Our Repo on Github and Support Open-Source! ⭐️
      </div>
    </div>
  );
}
