import { useEffect, useState } from 'react';
import { storage } from '../../shared/storageAdapter';

type SetValue<T> = T | ((val: T) => T);

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void] {
  // State to store our value
  // Pass  initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    storage.get(key).then((item) => {
      if (item !== null) {
        setStoredValue(item);
      }
    });
  }, [key]);

  // Persist value when it changes
  useEffect(() => {
    const valueToStore =
      typeof storedValue === 'function' ? storedValue(storedValue) : storedValue;
    storage.set(key, valueToStore).catch((err) => {
      console.error(err);
    });
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
