import { useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import { routes } from 'wasp/client/router';
import { landingPageNavigationItems } from '../landing-page/contentSections';
import './Main.css';
import NavBar from './components/NavBar/NavBar';
import { appNavigationItems } from './components/NavBar/contentSections';
import CookieConsentBanner from './components/cookie-consent/Banner';
import { useIsLandingPage } from './hooks/useIsLandingPage';

/**
 * use this component to wrap all child components
 * this is useful for templates, themes, and context
 */
export default function App() {
  const location = useLocation();
  const { data: user } = useAuth();
  const isLandingPage = useIsLandingPage();
  const navigationItems = isLandingPage ? landingPageNavigationItems : appNavigationItems;

  const shouldDisplayAppNavBar = useMemo(() => {
    return (
      location.pathname !== routes.LoginRoute.build() && location.pathname !== routes.SignupRoute.build()
    );
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
      <div className='min-h-screen bg-background text-foreground'>
        {isAdminDashboard ? (
          <Outlet />
        ) : (
          <>
            {shouldDisplayAppNavBar && <NavBar navigationItems={navigationItems} />}
            <div className='mx-auto max-w-7xl'>
              <Outlet />
            </div>
          </>
        )}
      </div>
      <CookieConsentBanner />
    </>
  );
}
