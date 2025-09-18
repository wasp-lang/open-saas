import { Moon, Sun } from 'lucide-react';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/utils';
import useColorMode from '../hooks/useColorMode';

const DarkModeSwitcher = () => {
  const [colorMode, setColorMode] = useColorMode();
  const isInLightMode = colorMode === 'light';

  return (
    <div>
      <Label
        className={cn(
          'relative m-0 block h-7.5 w-14 rounded-full transition-colors duration-300 ease-in-out cursor-pointer bg-muted'
        )}
      >
        <input
          type='checkbox'
          onChange={() => {
            if (typeof setColorMode === 'function') {
              setColorMode(isInLightMode ? 'dark' : 'light');
            }
          }}
          className='absolute top-0 z-50 m-0 h-full w-full cursor-pointer opacity-0'
        />
        <span
          className={cn(
            'absolute top-1/2 left-[3px] flex h-6 w-6 -translate-y-1/2 translate-x-0 items-center justify-center rounded-full bg-white shadow-md border border-border transition-all duration-300 ease-in-out',
            {
              '!right-[3px] !translate-x-full': !isInLightMode,
            }
          )}
        >
          <ModeIcon isInLightMode={isInLightMode} />
        </span>
      </Label>
    </div>
  );
};

function ModeIcon({ isInLightMode }: { isInLightMode: boolean }) {
  const iconStyle =
    'absolute inset-0 flex items-center justify-center transition-opacity ease-in-out duration-300';
  return (
    <>
      <span className={cn(iconStyle, isInLightMode ? 'opacity-100' : 'opacity-0')}>
        <Sun className='size-4 stroke-amber-500 fill-amber-500' />
      </span>
      <span className={cn(iconStyle, !isInLightMode ? 'opacity-100' : 'opacity-0')}>
        <Moon className='size-4 stroke-slate-600 fill-slate-600' />
      </span>
    </>
  );
}

export default DarkModeSwitcher;
