import './Main.css';
import AppNavBar from './components/AppNavBar';
import { useMemo, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useReferrer, UNKOWN_REFERRER } from './hooks/useReferrer';
import useAuth from '@wasp/auth/useAuth';
import updateCurrentUser from '@wasp/actions/updateCurrentUser'; // TODO fix
import updateUserReferrer from '@wasp/actions/UpdateUserReferrer';
import saveReferrer from '@wasp/actions/saveReferrer';

/**
 * use this component to wrap all child components
 * this is useful for templates, themes, and context
 */
export default function App({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data: user } = useAuth();
  const [referrer, setReferrer] = useReferrer();

  const shouldDisplayAppNavBar = useMemo(() => {
    return location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup';
  }, [location]);

  const isAdminDashboard = useMemo(() => {
    return location.pathname.startsWith('/admin');
  }, [location]);

  useEffect(() => {
    if (user) {
      const lastSeenAt = new Date(user.lastActiveTimestamp);
      const today = new Date();
      if (lastSeenAt.getDate() === today.getDate()) return;
      updateCurrentUser({ lastActiveTimestamp: today });
    }
  }, [user]);

  useEffect(() => {
    if (referrer && referrer.ref !== UNKOWN_REFERRER && !referrer.isSavedInDB) {
      saveReferrer({ name: referrer.ref });
      setReferrer({
        ...referrer,
        isSavedInDB: true,
      });
    }
  }, [referrer]);

  useEffect(() => {
    if (user && referrer && !referrer.isSavedToUser && referrer.ref !== UNKOWN_REFERRER) {
      updateUserReferrer({ name: referrer.ref });
      setReferrer({
        ...referrer,
        isSavedToUser: true,
      });
    }
  }, [user, referrer]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }
  }, [location]);

  return (
    <>
      {isAdminDashboard ? (
        <>{children}</>
      ) : (
        <>
          {shouldDisplayAppNavBar && <AppNavBar />}
          <div className='mx-auto max-w-7xl sm:px-6 lg:px-8 '>{children}</div>
        </>
      )}
    </>
  );
}
