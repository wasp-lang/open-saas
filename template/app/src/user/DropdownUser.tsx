import { ChevronDown, User } from 'lucide-react';
import { useState } from 'react';
import { type User as UserEntity } from 'wasp/entities';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { UserMenuItems } from './UserMenuItems';

const DropdownUser = ({ user }: { user: Partial<UserEntity> }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = () => {
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className='flex items-center gap-4 duration-300 ease-in-out text-foreground hover:text-primary transition-colors'>
          <span className='hidden text-right lg:block'>
            <span className='block text-sm font-medium text-foreground'>{user.username}</span>
          </span>
          <User />
          <ChevronDown className='h-4 w-4' />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-62.5'>
        <UserMenuItems user={user} onItemClick={handleItemClick} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DropdownUser;
