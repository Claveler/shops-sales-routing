import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faBars } from '@fortawesome/free-solid-svg-icons';
import styles from './Header.module.css';
import feverLogo from '../../assets/fever-logo.svg';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.leadSide}>
        <button 
          className={styles.menuToggle}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
        <a href="/" className={styles.logo}>
          <img src={feverLogo} alt="Fever Zone" />
        </a>
      </div>
      
      <div className={styles.trailSide}>
        <div className={styles.userMenu}>
          <button className={styles.userButton}>
            <span className={styles.userInfo}>
              <span className={styles.userName}>Andres Clavel</span>
              <span className={styles.userOrg}>SO Tests</span>
            </span>
            <FontAwesomeIcon icon={faUserCircle} className={styles.userIcon} />
          </button>
        </div>
      </div>
    </header>
  );
}
