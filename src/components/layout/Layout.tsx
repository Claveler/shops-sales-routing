import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import styles from './Layout.module.css';

const MOBILE_BREAKPOINT = 768;

function getIsMobile() {
  return typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;
}

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(() => !getIsMobile());
  const contentRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Close sidebar on navigation when on mobile
  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
    if (getIsMobile()) {
      setSidebarOpen(false);
    }
  }, [pathname]);

  // Listen for resize: auto-close sidebar when entering mobile range
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setSidebarOpen(false);
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className={styles.layout}>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <main className={`${styles.main} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed}`}>
        <div ref={contentRef} className={styles.content}>
          <div className={styles.pageWrapper}>
            {children}
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
