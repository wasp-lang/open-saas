import './Main.css';
import NavBar from './NavBar';
import { ReactNode } from 'react';

export default function App({ children }: { children: ReactNode }) {
  /**
   * use this component to wrap all child components
   * this is useful for templates, themes, and context
   * in this case the NavBar will always be rendered
   */
  return (
    <div>
      <NavBar />
      <div className='mx-auto max-w-7xl sm:px-6 lg:px-8 '>{children}</div>
    </div>
  );
}
