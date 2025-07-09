import { LogOut, Settings } from 'lucide-react';
import { MdOutlineSpaceDashboard } from 'react-icons/md';
import { TfiDashboard } from 'react-icons/tfi';
import { logout } from 'wasp/client/auth';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { type User } from 'wasp/entities';
import { DropdownMenuItem } from '../components/ui/dropdown-menu';

export const UserMenuItems = ({ user }: { user?: Partial<User> }) => {
  const path = window.location.pathname;
  const landingPagePath = routes.LandingPageRoute.to;
  const adminDashboardPath = routes.AdminRoute.to;

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
