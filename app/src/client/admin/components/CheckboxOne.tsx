import { useState } from 'react';
import { clsx } from 'clsx';

const CheckboxOne = () => {
  const [isChecked, setIsChecked] = useState<boolean>( false);

  return (
    <div>
      <label
        htmlFor="checkboxLabelFour"
        className="flex cursor-pointer select-none items-center"
      >
        <div className="relative">
          <input
            type="checkbox"
            id="checkboxLabelFour"
            className="sr-only"
            onChange={() => {
              setIsChecked(!isChecked);
            }}
          />
          <div
            className={clsx('mr-4 flex h-5 w-5 items-center justify-center rounded-full border', {
              'border-primary': isChecked,
            })}
          >
            <span
              className={clsx('h-2.5 w-2.5 rounded-full bg-transparent', {
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
