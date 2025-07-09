import { ChevronDown } from 'lucide-react';
import { CgProfile } from 'react-icons/cg';
import { type User } from 'wasp/entities';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { UserMenuItems } from './UserMenuItems';

const DropdownUser = ({ user }: { user: Partial<User> }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='flex items-center gap-4 duration-300 ease-in-out text-foreground hover:text-primary transition-colors'>
          <span className='hidden text-right lg:block'>
            <span className='block text-sm font-medium text-foreground'>{user.username}</span>
          </span>
          <CgProfile size='1.1rem' className='ml-1 mt-[0.1rem]' />
          <ChevronDown className='h-4 w-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-62.5'>
        <UserMenuItems user={user} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownUser;
