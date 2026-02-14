import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { faBars, faPlay, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import styles from './FeverPosHeader.module.css';
import feverLogo from '../../assets/fever-logo.svg';

export function FeverPosHeader() {
  const navigate = useNavigate();
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${dayNames[now.getDay()]} ${now.getDate()} ${monthNames[now.getMonth()]}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <header className={styles.header}>
      <div className={styles.leadSide}>
        <button
          className={styles.menuButton}
          onClick={() => navigate('/products/catalog-integration')}
          aria-label="Back to main menu"
          type="button"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>

        <a href="/" className={styles.logo}>
          <img src={feverLogo} alt="Fever Zone" />
        </a>
      </div>

      <div className={styles.trailSide}>
        <div className={styles.shiftWidget}>
          <div className={styles.dateTime}>
            <FontAwesomeIcon icon={faClock} className={styles.clockIcon} />
            <span>{dateStr}</span>
          </div>
          <button className={styles.startShift} type="button">
            <FontAwesomeIcon icon={faPlay} className={styles.playIcon} />
            <span>Start shift</span>
          </button>
        </div>

        <div className={styles.userMenu}>
          <button className={styles.userButton} aria-label="User menu" type="button">
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
