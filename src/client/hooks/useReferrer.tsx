import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useLocalStorage from './useLocalStorage';

const REFERRER_KEY = 'ref';
export const UNKOWN_REFERRER = 'unknown';

export function useReferrer() {
  const history = useHistory();
  const urlParams = new URLSearchParams(window.location.search);
  const refValue = urlParams.get(REFERRER_KEY);

  const values = {
    [REFERRER_KEY]: refValue || UNKOWN_REFERRER,
    isSavedInDB: false,
    isSavedToUser: false,
  }

  const [referrer, setReferrer] = useLocalStorage(REFERRER_KEY, values);

  useEffect(() => {
    console.log('referrer', referrer);
    if (!!refValue && refValue !== UNKOWN_REFERRER) {
      setReferrer(values);
    }
    history.replace({
      search: '',
    });
  }, [referrer]);

  return [referrer, setReferrer] as const;
}
