import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { faBars, faPlay, faUserCircle, faTabletScreenButton } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import styles from './FeverPosHeader.module.css';
import feverLogo from '../../assets/fever-logo.svg';

interface FeverPosHeaderProps {
  isDevicePreview?: boolean;
  onToggleDevicePreview?: () => void;
}

function formatHeaderDate(date: Date): string {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${dayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function FeverPosHeader({ isDevicePreview = false, onToggleDevicePreview }: FeverPosHeaderProps) {
  const navigate = useNavigate();
  const [dateStr, setDateStr] = useState(() => formatHeaderDate(new Date()));

  useEffect(() => {
    const updateTime = () => setDateStr(formatHeaderDate(new Date()));
    updateTime();
    const timerId = window.setInterval(updateTime, 30_000);
    return () => window.clearInterval(timerId);
  }, []);

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

      {onToggleDevicePreview && (
        <div className={styles.centerSection}>
          <div className={styles.devicePreviewWrap}>
            <button
              className={`${styles.devicePreviewBtn} ${isDevicePreview ? styles.devicePreviewBtnActive : ''}`}
              onClick={onToggleDevicePreview}
              type="button"
              aria-label="Toggle iMin device preview"
              aria-pressed={isDevicePreview}
            >
              <FontAwesomeIcon icon={faTabletScreenButton} />
              <span>iMin Swan 1 Pro</span>
            </button>
            <span className={styles.devicePreviewTooltip}>
              Simulate the iMin Swan 1 Pro display (1397&times;786 dp)
            </span>
          </div>
        </div>
      )}

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
