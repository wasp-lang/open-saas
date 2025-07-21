import { Ellipsis, SquarePen, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../../client/cn';

const DropdownDefault = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <div className='relative'>
      <button ref={trigger} onClick={() => setDropdownOpen(!dropdownOpen)}>
        <Ellipsis className='size-4' />
      </button>
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={cn(
          'absolute right-0 top-full z-40 w-40 space-y-1 rounded-sm border border-border bg-card p-1.5 shadow',
          {
            block: dropdownOpen,
            hidden: !dropdownOpen,
          }
        )}
      >
        <button className='flex w-full items-center gap-2 rounded-sm py-1.5 px-4 text-left text-sm hover:bg-accent hover:text-accent-foreground'>
          <SquarePen className='size-4' />
          Edit
        </button>
        <button className='flex w-full items-center gap-2 rounded-sm py-1.5 px-4 text-left text-sm hover:bg-accent hover:text-accent-foreground'>
          <Trash2 className='size-4' />
          Delete
        </button>
      </div>
    </div>
  );
};

export default DropdownDefault;
