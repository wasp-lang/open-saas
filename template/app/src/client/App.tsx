import './Main.css';
import { type AuthUser } from 'wasp/auth';
import { useAuth } from 'wasp/client/auth';
import { updateCurrentUser } from 'wasp/client/operations';
import AppNavBar from './components/AppNavBar';
import CookieConsentBanner from './components/cookie-consent/Banner';
import { useMemo, useEffect, ReactNode, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * use this component to wrap all child components
 * this is useful for templates, themes, and context
 */
export default function App({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data: user } = useAuth();

  useEffect(() => {
    if (user) {
      const now = Date.now();
      console.log('now: ', now);
      const lastActiveTime = user.lastActiveTimestamp.getTime();
      if (now - lastActiveTime > 5 * 60 * 1000) {
        updateCurrentUser({ lastActiveTimestamp: new Date(now) });
      }
    }
  }, [user]);

  const shouldDisplayAppNavBar = useMemo(() => {
    return location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/signup';
  }, [location]);

  const isAdminDashboard = useMemo(() => {
    return location.pathname.startsWith('/admin');
  }, [location]);

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
      <div className='min-h-screen dark:text-white dark:bg-boxdark-2'>
        {isAdminDashboard ? (
          <>{children}</>
        ) : (
          <>
            {shouldDisplayAppNavBar && <AppNavBar />}
            <div className='mx-auto max-w-7xl sm:px-6 lg:px-8'>{children}</div>
          </>
        )}
      </div>
      <CookieConsentBanner />
    </>
  );
}
