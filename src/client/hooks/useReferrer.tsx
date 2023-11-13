import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useLocalStorage from './useLocalStorage';

const REFERRER_KEY = 'ref';
export const UNKOWN_REFERRER = 'unknown';

export function useReferrer() {
  const history = useHistory();
  const urlParams = new URLSearchParams(window.location.search);
  const refValue = urlParams.get(REFERRER_KEY);

  const [referrer, setReferrer] = useLocalStorage(REFERRER_KEY, refValue);

  useEffect(() => {
    console.log('referrer', referrer);
    if (!!refValue && refValue !== UNKOWN_REFERRER) {
      setReferrer(refValue);
    }
    history.replace({
      search: '',
    });
  }, [referrer]);

  return [referrer, setReferrer] as const;
}
