import './Main.css';
import NavBar from './NavBar';
import { useMemo, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

export default function App({ children }: { children: ReactNode }) {
  const location = useLocation();

  const shouldDisplayAppNavBar = useMemo(() => {
    return !location.pathname.startsWith('/landing-page');
  }, [location]);
  /**
   * use this component to wrap all child components
   * this is useful for templates, themes, and context
   * in this case the NavBar will always be rendered
   */
  return (
    <div>
      {shouldDisplayAppNavBar && <NavBar />}
      <div className='mx-auto max-w-7xl sm:px-6 lg:px-8 '>{children}</div>
    </div>
  );
}
