import { LayoutDashboard, LogOut, Settings, Shield } from 'lucide-react';
import { logout } from 'wasp/client/auth';
import { Link as WaspRouterLink, routes } from 'wasp/client/router';
import { type User } from 'wasp/entities';
import { DropdownMenuItem } from '../../components/ui/dropdown-menu';

export const UserMenuItems = ({ user, onItemClick }: { user?: Partial<User>; onItemClick?: () => void }) => {
  return (
    <>
      <DropdownMenuItem asChild>
        <WaspRouterLink
          to={routes.DemoAppRoute.to}
          onClick={onItemClick}
          className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary'
        >
          <LayoutDashboard size='1.1rem' />
          AI Scheduler (Demo App)
        </WaspRouterLink>
      </DropdownMenuItem>

      <DropdownMenuItem asChild>
        <WaspRouterLink
          to={routes.AccountRoute.to}
          onClick={onItemClick}
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
            onClick={onItemClick}
            className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary'
          >
            <Shield size='1.1rem' />
            Admin Dashboard
          </WaspRouterLink>
        </DropdownMenuItem>
      )}

      <DropdownMenuItem
        onClick={() => {
          logout();
          onItemClick?.();
        }}
        className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary'
      >
        <LogOut size='1.1rem' />
        Log Out
      </DropdownMenuItem>
    </>
  );
};
