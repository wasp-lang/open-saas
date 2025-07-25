import { LayoutDashboard, LogOut, Settings, Shield } from 'lucide-react';
import { logout } from 'wasp/client/auth';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { type User } from 'wasp/entities';
import { DropdownMenuItem } from '../components/ui/dropdown-menu';

export const UserMenuItems = ({ user, onItemClick }: { user?: Partial<User>; onItemClick?: () => void }) => {
  const isMobileMenu = !!onItemClick;

  if (isMobileMenu) {
    return (
      <>
        <div className='py-2'>
          <WaspRouterLink
            to={routes.DemoAppRoute.to}
            onClick={onItemClick}
            className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out text-foreground hover:text-primary'
          >
            <LayoutDashboard size='1.1rem' />
            AI Scheduler (Demo App)
          </WaspRouterLink>
        </div>

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
              <Shield size='1.1rem' />
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
      <DropdownMenuItem asChild>
        <WaspRouterLink
          to={routes.DemoAppRoute.to}
          className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary'
        >
          <LayoutDashboard size='1.1rem' />
          AI Scheduler (Demo App)
        </WaspRouterLink>
      </DropdownMenuItem>

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
            <Shield size='1.1rem' />
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
