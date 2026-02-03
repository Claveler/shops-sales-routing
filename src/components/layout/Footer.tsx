import styles from './Footer.module.css';
import feverLogo from '../../assets/fever-logo-only.svg';

export function Footer() {
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
        
        <div className={styles.copyright}>©2026 Fever</div>
      </div>
    </footer>
  );
}
