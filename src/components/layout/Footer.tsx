import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { useDemo } from '../../context/DemoContext';
import styles from './Footer.module.css';
import feverLogo from '../../assets/fever-logo-only.svg';

export function Footer() {
  const navigate = useNavigate();
  const { isResetMode, resetDemo } = useDemo();

  const handleResetDemo = () => {
    resetDemo();
    navigate('/products/catalog-integration');
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <img src={feverLogo} alt="Fever" className={styles.brand} />
        
        <div className={styles.columns}>
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>How Fever Works</h4>
            <a href="#" className={styles.link}>FeverZone Guide</a>
            <a href="#" className={styles.link}>Frequently Asked Questions</a>
            <a href="#" className={styles.link}>Validation Guide</a>
            <a href="#" className={styles.link}>How to validate tickets</a>
          </div>
          
          <div className={styles.column}>
            <h4 className={styles.columnTitle}>Partners' support contact</h4>
            <p className={styles.text}>(667) 244-3490</p>
            <p className={styles.text}>Monday to Friday (08:00 - 20:30)</p>
            <a href="#" className={styles.link}>Send us a message</a>
          </div>
        </div>
        
      </div>
      <div className={styles.divider} />
      <div className={styles.bottomRow}>
        <div className={styles.copyright}>©2026 Fever</div>
        <button 
          className={`${styles.resetBtn} ${isResetMode ? styles.active : ''}`}
          onClick={handleResetDemo}
        >
          <FontAwesomeIcon icon={faRotateLeft} />
          {isResetMode ? 'Demo Mode Active' : 'Reset Demo'}
        </button>
      </div>
    </footer>
  );
}
