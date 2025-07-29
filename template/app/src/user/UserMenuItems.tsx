import { LogOut } from 'lucide-react';
import { logout } from 'wasp/client/auth';
import { Link as WaspRouterLink } from 'wasp/client/router';
import { type User } from 'wasp/entities';
import { userMenuItems } from './constants';

export const UserMenuItems = ({ user, onItemClick }: { user?: Partial<User>; onItemClick?: () => void }) => {
  return (
    <>
      {userMenuItems.map((item) => {
        if (item.isAuthRequired && !user) return null;
        if (item.isAdminOnly && (!user || !user.isAdmin)) return null;

        return (
          <div key={item.name} className='py-2'>
            <WaspRouterLink
              to={item.to}
              onClick={onItemClick}
              className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out text-foreground hover:text-primary'
            >
              <item.icon size='1.1rem' />
              {item.name}
            </WaspRouterLink>
          </div>
        );
      })}
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
};
