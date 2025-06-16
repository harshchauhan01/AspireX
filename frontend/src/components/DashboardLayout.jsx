import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, X, Bell, Mail, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import styles from './CSS/DashboardLayout.module.css';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Messages', path: '/messages' },
    { name: 'Calendar', path: '/calendar' },
    { name: 'Info Session', path: '/info-session' },
    { name: 'Personal Info', path: '/personal-info' },
    { name: 'Login & Security', path: '/login-security' },
  ];

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
      >
        {isSidebarOpen && (
          <div className={styles.sidebarHeader}>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>HS</AvatarFallback>
            </Avatar>
            <div>
              <h2 className={styles.sidebarName}>Hardik Singh</h2>
              <p className={styles.sidebarRole}>Mentor</p>
            </div>
          </div>
        )}

        <nav className={styles.navList}>
          <ul>
            {navItems.map((item, index) => (
              <li key={index} className={styles.navItem}>
                <Link
                  to={item.path}
                  className={styles.navLink}
                >
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div
        className={`${styles.mainContent} ${
          isSidebarOpen ? styles.mainContentOpen : styles.mainContentClosed
        }`}
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              onClick={toggleSidebar}
              className={styles.sidebarToggle}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className={styles.headerTitle}>Welcome back, Hardik!</h1>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.headerButton}>
              <Mail size={20} />
            </button>
            <button className={styles.headerButton}>
              <Bell size={20} />
            </button>
            <div className={styles.profileDropdown}>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>HS</AvatarFallback>
              </Avatar>
              <ChevronDown size={16} className={styles.profileChevron} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;