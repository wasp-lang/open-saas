import { type AuthUser } from 'wasp/auth';
import MessageButton from '../../messages/MessageButton';
import DropdownUser from '../../user/DropdownUser';
import { cn } from '../../client/cn';
import DarkModeSwitcher from '../../client/components/DarkModeSwitcher';

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
  user: AuthUser;
}) => {
  return (
    <header className='sticky top-0 z-999 flex w-full bg-white dark:bg-boxdark dark:drop-shadow-none'>
      <div className='flex flex-grow items-center justify-between sm:justify-end sm:gap-5 px-8 py-5 shadow '>
        <div className='flex items-center gap-2 sm:gap-4 lg:hidden'>
          {/* <!-- Hamburger Toggle BTN --> */}

          <button
            aria-controls='sidebar'
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className='z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden'
          >
            <span className='relative block h-5.5 w-5.5 cursor-pointer'>
              <span className='du-block absolute right-0 h-full w-full'>
                <span
                  className={cn(
                    'relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white',
                    {
                      '!w-full delay-300': !props.sidebarOpen,
                    }
                  )}
                ></span>
                <span
                  className={cn(
                    'relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white',
                    {
                      'delay-400 !w-full': !props.sidebarOpen,
                    }
                  )}
                ></span>
                <span
                  className={cn(
                    'relative top-0 left-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white',
                    {
                      '!w-full delay-500': !props.sidebarOpen,
                    }
                  )}
                ></span>
              </span>
              <span className='absolute right-0 h-full w-full rotate-45'>
                <span
                  className={cn(
                    'absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white',
                    {
                      '!h-0 !delay-[0]': !props.sidebarOpen,
                    }
                  )}
                ></span>
                <span
                  className={cn(
                    'delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white',
                    {
                      '!h-0 !delay-200': !props.sidebarOpen,
                    }
                  )}
                ></span>
              </span>
            </span>
          </button>

          {/* <!-- Hamburger Toggle BTN --> */}
        </div>

        <ul className='flex items-center gap-2 2xsm:gap-4'>
          {/* <!-- Dark Mode Toggler --> */}
          <DarkModeSwitcher />
          {/* <!-- Dark Mode Toggler --> */}

          {/* <!-- Chat Notification Area --> */}
          <MessageButton />
          {/* <!-- Chat Notification Area --> */}
        </ul>

        <div className='flex items-center gap-3 2xsm:gap-7'>
          {/* <!-- User Area --> */}
          <DropdownUser user={props.user} />
          {/* <!-- User Area --> */}
        </div>
      </div>
    </header>
  );
};

export default Header;
