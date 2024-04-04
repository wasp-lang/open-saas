import { useState } from 'react';
import { cn } from '../../../shared/utils';

const CheckboxOne = () => {
  const [isChecked, setIsChecked] = useState<boolean>(false);

  return (
    <div>
      <label
        htmlFor="checkboxLabelOne"
        className="flex cursor-pointer select-none items-center"
      >
        <div className="relative">
          <input
            type="checkbox"
            id="checkboxLabelOne"
            className="sr-only"
            onChange={() => {
              setIsChecked(!isChecked);
            }}
          />
          <div
            className={cn('mr-4 flex h-5 w-5 items-center justify-center rounded-full border', {
              'border-primary': isChecked,
            })}
          >
            <span
              className={cn('h-2.5 w-2.5 rounded-full bg-transparent', {
                '!bg-primary': isChecked,
              })}
            >
              {' '}
            </span>
          </div>
        </div>
        Checkbox Text
      </label>
    </div>
  );
};

export default CheckboxOne;
