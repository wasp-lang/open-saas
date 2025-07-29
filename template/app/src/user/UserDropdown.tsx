import { ChevronDown, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { logout } from 'wasp/client/auth';
import { Link as WaspRouterLink } from 'wasp/client/router';
import { type User as UserEntity } from 'wasp/entities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { userMenuItems } from './constants';

export function UserDropdown({ user }: { user: Partial<UserEntity> }) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className='flex items-center duration-300 ease-in-out text-foreground hover:text-primary transition-colors'>
          <span className='hidden mr-2 text-right lg:block text-sm font-medium text-foreground'>
            {user.username}
          </span>
          <User className='size-5' />
          <ChevronDown className='size-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {userMenuItems.map((item) => {
          if (item.isAuthRequired && !user) return null;
          if (item.isAdminOnly && (!user || !user.isAdmin)) return null;

          return (
            <DropdownMenuItem asChild>
              <WaspRouterLink
                to={item.to}
                onClick={() => {
                  setOpen(false);
                }}
                className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary'
              >
                <item.icon size='1.1rem' />
                {item.name}
              </WaspRouterLink>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuItem
          onClick={() => logout()}
          className='flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary'
        >
          <LogOut size='1.1rem' />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
