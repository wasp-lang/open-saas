import './Main.css';
import NavBar from './NavBar';
import { useMemo, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useReferrer, UNKOWN_REFERRER } from './hooks/useReferrer';
import useAuth from '@wasp/auth/useAuth';
import updateUser from '@wasp/actions/updateUser.js';

/**
 * use this component to wrap all child components
 * this is useful for templates, themes, and context
 */
export default function App({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data: user } = useAuth();
  const [referrer, setReferrer] = useReferrer();

  const shouldDisplayAppNavBar = useMemo(() => {
    return location.pathname !== '/';
  }, [location]);

  const isAdminDashboard = useMemo(() => {
    return location.pathname.startsWith('/admin');
  }, [location]);

  useEffect(() => {
    if (user) {
      const lastSeenAt = new Date(user.lastActiveTimestamp);
      const today = new Date();
      if (lastSeenAt.getDate() === today.getDate()) return;
      updateUser({ lastActiveTimestamp: today });
    }
  }, [user]);

  useEffect(() => {
    if (user && referrer && referrer !== UNKOWN_REFERRER) {
      updateUser({ referrer });
      setReferrer(null);
    }
  }, [user, referrer]);

  return (
    <>
      {isAdminDashboard ? (
        <>{children}</>
      ) : (
        <>
          {shouldDisplayAppNavBar && <NavBar />}
          <div className='mx-auto max-w-7xl sm:px-6 lg:px-8 '>{children}</div>
        </>
      )}
    </>
  );
}
