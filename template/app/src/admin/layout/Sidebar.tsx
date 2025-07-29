import {
  Calendar,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  LayoutTemplate,
  Settings,
  Sheet,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../../client/static/logo.webp';
import { cn } from '../../lib/utils';
import SidebarLinkGroup from './SidebarLinkGroup';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true'
  );

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={cn(
        'absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-muted border-r duration-300 ease-linear lg:static lg:translate-x-0',
        {
          'translate-x-0': sidebarOpen,
          '-translate-x-full': !sidebarOpen,
        }
      )}
    >
      {/* <!-- SIDEBAR HEADER --> */}
      <div className='flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5'>
        <NavLink to='/'>
          <img src={Logo} alt='Logo' width={50} />
        </NavLink>

        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls='sidebar'
          aria-expanded={sidebarOpen}
          className='block lg:hidden'
        >
          <X />
        </button>
      </div>
      {/* <!-- SIDEBAR HEADER --> */}

      <div className='no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear'>
        {/* <!-- Sidebar Menu --> */}
        <nav className='mt-5 py-4 px-4 lg:mt-9 lg:px-6'>
          {/* <!-- Menu Group --> */}
          <div>
            <h3 className='mb-4 ml-4 text-sm font-semibold text-muted-foreground'>MENU</h3>

            <ul className='mb-6 flex flex-col gap-1.5'>
              {/* <!-- Menu Item Dashboard --> */}
              <NavLink
                to='/admin'
                end
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-muted-foreground duration-300 ease-in-out hover:bg-accent hover:text-accent-foreground',
                    {
                      'bg-accent text-accent-foreground': isActive,
                    }
                  )
                }
              >
                <LayoutDashboard />
                Dashboard
              </NavLink>

              {/* <!-- Menu Item Dashboard --> */}

              {/* <!-- Menu Item Users --> */}
              <li>
                <NavLink
                  to='/admin/users'
                  end
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-muted-foreground duration-300 ease-in-out hover:bg-accent hover:text-accent-foreground',
                      {
                        'bg-accent text-accent-foreground': isActive,
                      }
                    )
                  }
                >
                  <Sheet />
                  Users
                </NavLink>
              </li>
              {/* <!-- Menu Item Users --> */}

              {/* <!-- Menu Item Settings --> */}
              <li>
                <NavLink
                  to='/admin/settings'
                  end
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-muted-foreground duration-300 ease-in-out hover:bg-accent hover:text-accent-foreground',
                      {
                        'bg-accent text-accent-foreground': isActive,
                      }
                    )
                  }
                >
                  <Settings />
                  Settings
                </NavLink>
              </li>
              {/* <!-- Menu Item Settings --> */}
            </ul>
          </div>

          {/* <!-- Others Group --> */}
          <div>
            <h3 className='mb-4 ml-4 text-sm font-semibold text-muted-foreground'>Extra Components</h3>

            <ul className='mb-6 flex flex-col gap-1.5'>
              {/* <!-- Menu Item Calendar --> */}
              <li>
                <NavLink
                  to='/admin/calendar'
                  end
                  className={({ isActive }) =>
                    cn(
                      'group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-muted-foreground duration-300 ease-in-out hover:bg-accent hover:text-accent-foreground',
                      {
                        'bg-accent text-accent-foreground': isActive,
                      }
                    )
                  }
                >
                  <Calendar />
                  Calendar
                </NavLink>
              </li>
              {/* <!-- Menu Item Calendar --> */}

              {/* <!-- Menu Item Ui Elements --> */}
              <SidebarLinkGroup activeCondition={pathname === '/ui' || pathname.includes('ui')}>
                {(handleClick, open) => {
                  return (
                    <React.Fragment>
                      <NavLink
                        to='#'
                        className={cn(
                          'group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-muted-foreground duration-300 ease-in-out hover:bg-accent hover:text-accent-foreground',
                          {
                            'bg-accent text-accent-foreground': pathname.includes('ui'),
                          }
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          sidebarExpanded ? handleClick() : setSidebarExpanded(true);
                        }}
                      >
                        <LayoutTemplate />
                        UI Elements
                        {open ? <ChevronUp /> : <ChevronDown />}
                      </NavLink>
                      {/* <!-- Dropdown Menu Start --> */}
                      <div className={cn('translate transform overflow-hidden', { hidden: !open })}>
                        <ul className='mt-4 mb-5.5 flex flex-col gap-2.5 pl-6'>
                          <li>
                            <NavLink
                              to='/admin/ui/buttons'
                              end
                              className={({ isActive }) =>
                                cn(
                                  'group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-muted-foreground duration-300 ease-in-out hover:text-accent',
                                  { '!text-accent': isActive }
                                )
                              }
                            >
                              Buttons
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                      {/* <!-- Dropdown Menu End --> */}
                    </React.Fragment>
                  );
                }}
              </SidebarLinkGroup>
              {/* <!-- Menu Item Ui Elements --> */}
            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default Sidebar;
