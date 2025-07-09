import { LogOut, Settings } from 'lucide-react';
import { MdOutlineSpaceDashboard } from 'react-icons/md';
import { TfiDashboard } from 'react-icons/tfi';
import { logout } from 'wasp/client/auth';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { type User } from 'wasp/entities';
import { DropdownMenuItem } from '../components/ui/dropdown-menu';

export const UserMenuItems = ({ user, onItemClick }: { user?: Partial<User>; onItemClick?: () => void }) => {
  const path = window.location.pathname;
  const landingPagePath = routes.LandingPageRoute.to;
  const adminDashboardPath = routes.AdminRoute.to;

  const isMobileMenu = !!onItemClick;

  if (isMobileMenu) {
    return (
      <>
        {path === landingPagePath || path === adminDashboardPath ? (
          <div className='py-2'>
            <WaspRouterLink
              to={routes.DemoAppRoute.to}
              onClick={onItemClick}
              className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out text-foreground hover:text-primary'
            >
              <MdOutlineSpaceDashboard size='1.1rem' />
              AI Scheduler (Demo App)
            </WaspRouterLink>
          </div>
        ) : null}

        <div className='py-2'>
          <WaspRouterLink
            to={routes.AccountRoute.to}
            onClick={onItemClick}
            className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out text-foreground hover:text-primary'
          >
            <Settings size='1.1rem' />
            Account Settings
          </WaspRouterLink>
        </div>

        {!!user && user.isAdmin && (
          <div className='py-2'>
            <WaspRouterLink
              to={routes.AdminRoute.to}
              onClick={onItemClick}
              className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out text-foreground hover:text-primary'
            >
              <TfiDashboard size='1.1rem' />
              Admin Dashboard
            </WaspRouterLink>
          </div>
        )}

        <div className='py-2'>
          <button
            onClick={() => {
              logout();
              onItemClick?.();
            }}
            className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out text-foreground hover:text-primary'
          >
            <LogOut size='1.1rem' />
            Log Out
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {path === landingPagePath || path === adminDashboardPath ? (
        <DropdownMenuItem asChild>
          <WaspRouterLink
            to={routes.DemoAppRoute.to}
            className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary'
          >
            <MdOutlineSpaceDashboard size='1.1rem' />
            AI Scheduler (Demo App)
          </WaspRouterLink>
        </DropdownMenuItem>
      ) : null}

      <DropdownMenuItem asChild>
        <WaspRouterLink
          to={routes.AccountRoute.to}
          className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary'
        >
          <Settings size='1.1rem' />
          Account Settings
        </WaspRouterLink>
      </DropdownMenuItem>

      {!!user && user.isAdmin && (
        <DropdownMenuItem asChild>
          <WaspRouterLink
            to={routes.AdminRoute.to}
            className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary'
          >
            <TfiDashboard size='1.1rem' />
            Admin Dashboard
          </WaspRouterLink>
        </DropdownMenuItem>
      )}

      <DropdownMenuItem
        onClick={() => logout()}
        className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary'
      >
        <LogOut size='1.1rem' />
        Log Out
      </DropdownMenuItem>
    </>
  );
};
