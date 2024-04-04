import { type User } from 'wasp/entities';
import { useState } from 'react';
import { cn } from '../../../shared/utils';

const SwitcherOne = ({ user, updateUserById }: { user?: Partial<User>; updateUserById?: any }) => {
  const [enabled, setEnabled] = useState<boolean>(user?.isAdmin || false);

  return (
    <div className='relative'>
      <label htmlFor={`toggle1-${user?.id}`} className='flex cursor-pointer select-none items-center'>
        <div className='relative'>
          <input
            type='checkbox'
            id={`toggle1-${user?.id}`}
            className='sr-only'
            onChange={() => {
              setEnabled(!enabled);
              updateUserById && updateUserById({ id: user?.id, data: { isAdmin: !enabled } });
            }}
          />
          <div className='reblock h-8 w-14 rounded-full bg-meta-9 dark:bg-[#5A616B]'></div>
          <div
            className={cn('absolute left-1 top-1 h-6 w-6 rounded-full bg-white dark:bg-gray-400 transition', {
              '!right-1 !translate-x-full !bg-primary dark:!bg-white': enabled,
            })}
          ></div>
        </div>
      </label>
    </div>
  );
};

export default SwitcherOne;
