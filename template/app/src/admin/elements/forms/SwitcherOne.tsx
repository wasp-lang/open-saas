import { useId } from 'react';
import { cn } from '../../../client/cn';

function SwitcherOne({ isOn, onChange }: { isOn: boolean; onChange: (value: boolean) => void }) {
  const id = useId();

  return (
    <div className='relative'>
      <label htmlFor={id} className='flex cursor-pointer select-none items-center'>
        <div className='relative'>
          <input
            id={id}
            type='checkbox'
            className='sr-only'
            checked={isOn}
            onChange={(e) => onChange(e.target.checked)}
          />
          <div className='reblock h-8 w-14 rounded-full bg-meta-9 dark:bg-[#5A616B]'></div>
          <div
            className={cn('absolute left-1 top-1 h-6 w-6 rounded-full bg-white dark:bg-gray-400 transition', {
              '!right-1 !translate-x-full !bg-primary dark:!bg-white': isOn,
            })}
          ></div>
        </div>
      </label>
    </div>
  );
}

export default SwitcherOne;
