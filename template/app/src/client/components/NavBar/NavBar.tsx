import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { BiLogIn } from 'react-icons/bi';
import { HiBars3 } from 'react-icons/hi2';
import { Link as ReactRouterLink } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../../components/ui/sheet';
import DropdownUser from '../../../user/DropdownUser';
import { UserMenuItems } from '../../../user/UserMenuItems';
import { cn } from '../../cn';
import { useIsLandingPage } from '../../hooks/useIsLandingPage';
import logo from '../../static/logo.webp';
import DarkModeSwitcher from '../DarkModeSwitcher';

export interface NavigationItem {
  name: string;
  to: string;
}

const NavLogo = ({ isScrolled }: { isScrolled: boolean }) => (
  <img
    className={cn('transition-all duration-500', {
      'h-8 w-8': !isScrolled,
      'h-6 w-6': isScrolled,
    })}
    src={logo}
    alt='Your SaaS App'
  />
);

export default function AppNavBar({ navigationItems }: { navigationItems: NavigationItem[] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isLandingPage = useIsLandingPage();

  const { data: user, isLoading: isUserLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {isLandingPage && <Announcement />}
      <header className='sticky top-4 z-50 transition-all duration-300'>
        <div
          className={cn('transition-all duration-300', {
            'mx-4 md:mx-20 rounded-full shadow-lg bg-background/90 backdrop-blur-lg border border-border mt-4':
              isScrolled,
            'mx-0 bg-background/80 backdrop-blur-lg border-b border-border': !isScrolled,
          })}
        >
          <nav
            className={cn('flex items-center justify-between transition-all duration-300', {
              'p-3 lg:px-6': isScrolled,
              'p-6 lg:px-8': !isScrolled,
            })}
            aria-label='Global'
          >
            <div className='flex items-center lg:flex-1'>
              <WaspRouterLink
                to={routes.LandingPageRoute.to}
                className='flex items-center -m-1.5 p-1.5 text-foreground duration-300 ease-in-out hover:text-primary transition-colors'
              >
                <NavLogo isScrolled={isScrolled} />
                {isLandingPage && (
                  <span
                    className={cn('font-semibold leading-6 text-foreground transition-all duration-300', {
                      'ml-2 text-sm': !isScrolled,
                      'ml-2 text-xs opacity-0': isScrolled,
                    })}
                  >
                    Your SaaS
                  </span>
                )}
              </WaspRouterLink>
            </div>
            <div className='flex lg:hidden'>
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    type='button'
                    className={cn(
                      'inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors',
                      {
                        '-m-2.5 p-2.5': !isScrolled,
                        '-m-1.5 p-1.5': isScrolled,
                      }
                    )}
                  >
                    <span className='sr-only'>Open main menu</span>
                    <HiBars3
                      className={cn('transition-all duration-300', {
                        'h-6 w-6': !isScrolled,
                        'h-5 w-5': isScrolled,
                      })}
                      aria-hidden='true'
                    />
                  </button>
                </SheetTrigger>
                <SheetContent side='right' className='w-[300px] sm:w-[400px]'>
                  <SheetHeader>
                    <SheetTitle className='flex items-center'>
                      <WaspRouterLink to={routes.LandingPageRoute.to} className='-m-1.5 p-1.5'>
                        <span className='sr-only'>Your SaaS</span>
                        <NavLogo isScrolled={false} />
                      </WaspRouterLink>
                    </SheetTitle>
                  </SheetHeader>
                  <div className='mt-6 flow-root'>
                    <div className='-my-6 divide-y divide-border'>
                      <div className='space-y-2 py-6'>
                        {renderNavigationItems(navigationItems, setMobileMenuOpen)}
                      </div>
                      <div className='py-6'>
                        {isUserLoading ? null : !user ? (
                          <WaspRouterLink to={routes.LoginRoute.to}>
                            <div className='flex justify-end items-center duration-300 ease-in-out text-foreground hover:text-primary transition-colors'>
                              Log in <BiLogIn size='1.1rem' className='ml-1' />
                            </div>
                          </WaspRouterLink>
                        ) : (
                          <div className='space-y-2'>
                            <UserMenuItems user={user} onItemClick={() => setMobileMenuOpen(false)} />
                          </div>
                        )}
                      </div>
                      <div className='py-6'>
                        <DarkModeSwitcher />
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div
              className={cn('hidden lg:flex transition-all duration-300', {
                'lg:gap-x-8': !isScrolled,
                'lg:gap-x-6': isScrolled,
              })}
            >
              {renderNavigationItems(navigationItems)}
            </div>
            <div className='hidden lg:flex lg:flex-1 gap-3 justify-end items-center'>
              <ul className='flex justify-center items-center gap-2 sm:gap-4'>
                <DarkModeSwitcher />
              </ul>
              {isUserLoading ? null : !user ? (
                <WaspRouterLink
                  to={routes.LoginRoute.to}
                  className={cn('font-semibold leading-6 ml-3 transition-all duration-300', {
                    'text-sm': !isScrolled,
                    'text-xs': isScrolled,
                  })}
                >
                  <div className='flex items-center duration-300 ease-in-out text-foreground hover:text-primary transition-colors'>
                    Log in{' '}
                    <BiLogIn
                      size={isScrolled ? '1rem' : '1.1rem'}
                      className={cn('transition-all duration-300', {
                        'ml-1 mt-[0.1rem]': !isScrolled,
                        'ml-1': isScrolled,
                      })}
                    />
                  </div>
                </WaspRouterLink>
              ) : (
                <div className='ml-3'>
                  <DropdownUser user={user} />
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

function renderNavigationItems(
  navigationItems: NavigationItem[],
  setMobileMenuOpen?: Dispatch<SetStateAction<boolean>>
) {
  const menuStyles = cn({
    '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors':
      !!setMobileMenuOpen,
    'text-sm font-semibold leading-6 text-foreground duration-300 ease-in-out hover:text-primary transition-colors':
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
    <div className='flex justify-center items-center gap-3 p-3 w-full bg-gradient-to-r from-accent to-secondary font-semibold text-primary-foreground text-center z-49'>
      <p
        onClick={() => window.open(ContestURL, '_blank')}
        className='hidden lg:block cursor-pointer hover:opacity-90 hover:drop-shadow transition-opacity'
      >
        Support Open-Source Software!
      </p>
      <div className='hidden lg:block self-stretch w-0.5 bg-primary-foreground/20'></div>
      <div
        onClick={() => window.open(ContestURL, '_blank')}
        className='hidden lg:block cursor-pointer rounded-full bg-background/20 px-2.5 py-1 text-xs hover:bg-background/30 transition-colors tracking-wider'
      >
        Star Our Repo on Github ⭐️ →
      </div>
      <div
        onClick={() => window.open(ContestURL, '_blank')}
        className='lg:hidden cursor-pointer rounded-full bg-background/20 px-2.5 py-1 text-xs hover:bg-background/30 transition-colors'
      >
        ⭐️ Star the Our Repo on Github and Support Open-Source! ⭐️
      </div>
    </div>
  );
}
