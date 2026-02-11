import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faBars, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useDemo } from '../../context/DemoContext';
import styles from './Header.module.css';
import feverLogo from '../../assets/fever-logo.svg';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const navigate = useNavigate();
  const { isResetMode, resetDemo } = useDemo();

  const handleResetDemo = () => {
    resetDemo();
    navigate('/products/catalog-integration');
  };

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
        <button 
          className={`${styles.resetBtn} ${isResetMode ? styles.resetActive : ''}`}
          onClick={handleResetDemo}
        >
          <FontAwesomeIcon icon={faRotateLeft} />
          {isResetMode ? 'Demo Active' : 'Reset Demo'}
        </button>
        <div className={styles.userMenu}>
          <button className={styles.userButton}>
            <span className={styles.userInfo}>
              <span className={styles.userName}>Andres Clavel</span>
              <span className={styles.userOrg}>Fonck Museum</span>
            </span>
            <FontAwesomeIcon icon={faUserCircle} className={styles.userIcon} />
          </button>
        </div>
      </div>
    </header>
  );
}
