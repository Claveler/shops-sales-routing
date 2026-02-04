import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendar, 
  faCircleCheck, 
  faBookmark,
  faAddressCard,
  faHeart,
  faClock
} from '@fortawesome/free-regular-svg-icons';
import { 
  faDollarSign, 
  faBullhorn,
  faUsers,
  faTag,
  faQrcode,
  faChartBar,
  faBox,
  faCog,
  faReceipt,
  faDesktop,
  faMapMarkerAlt,
  faChevronDown,
  faChevronRight,
  faCube
} from '@fortawesome/free-solid-svg-icons';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  icon: typeof faCalendar;
  label: string;
  path?: string;
  children?: { label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { icon: faCalendar, label: 'Events', path: '/events' },
  { icon: faCube, label: 'Asset-Based con...', path: '/assets' },
  { icon: faCircleCheck, label: 'Validation', path: '/validation' },
  { icon: faDollarSign, label: 'Orders', path: '/orders' },
  { icon: faBookmark, label: 'Reservations', path: '/reservations' },
  { icon: faBullhorn, label: 'Marketing', path: '/marketing' },
  { icon: faUsers, label: 'Affiliations', path: '/affiliations' },
  { icon: faAddressCard, label: 'Memberships', path: '/memberships' },
  { icon: faHeart, label: 'Fundraising', path: '/fundraising' },
  { icon: faTag, label: 'Box Office', path: '/box-office' },
  { icon: faQrcode, label: 'Ticketing', path: '/ticketing' },
  { icon: faChartBar, label: 'Stats', path: '/stats' },
  { icon: faClock, label: 'Shifts', path: '/shifts' },
  { icon: faBox, label: 'Stock Management', path: '/stock-management' },
  { 
    icon: faCube, 
    label: 'Products',
    children: [
      { label: 'Catalog integration', path: '/products/catalog-integration' },
      { label: 'Sales routing', path: '/products/sales-routing' }
    ]
  },
  { icon: faCog, label: 'Settings', path: '/settings' },
  { icon: faReceipt, label: 'Cash Register Repo...', path: '/cash-register' },
  { icon: faDesktop, label: 'Kiosks', path: '/kiosks' },
  { icon: faMapMarkerAlt, label: 'Venues', path: '/venues' },
];

export function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Products']);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isChildActive = (children?: { path: string }[]) => {
    if (!children) return false;
    return children.some(child => location.pathname.startsWith(child.path));
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.collapsed}`}>
      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.label} className={styles.menuItem}>
              {item.children ? (
                <>
                  <button
                    className={`${styles.menuLink} ${isChildActive(item.children) ? styles.active : ''}`}
                    onClick={() => toggleExpand(item.label)}
                  >
                    <FontAwesomeIcon icon={item.icon} className={styles.menuIcon} />
                    <span className={styles.menuLabel}>{item.label}</span>
                    <FontAwesomeIcon 
                      icon={expandedItems.includes(item.label) ? faChevronDown : faChevronRight} 
                      className={styles.expandIcon}
                    />
                  </button>
                  {expandedItems.includes(item.label) && (
                    <ul className={styles.subMenu}>
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <NavLink
                            to={child.path}
                            className={({ isActive }) => 
                              `${styles.subMenuLink} ${isActive ? styles.active : ''}`
                            }
                          >
                            {child.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path!}
                  className={({ isActive }) => 
                    `${styles.menuLink} ${isActive ? styles.active : ''}`
                  }
                >
                  <FontAwesomeIcon icon={item.icon} className={styles.menuIcon} />
                  <span className={styles.menuLabel}>{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
