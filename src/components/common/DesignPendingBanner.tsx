import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilRuler } from '@fortawesome/free-solid-svg-icons';
import styles from './DesignPendingBanner.module.css';

interface DesignPendingBannerProps {
  /** Optional custom message to display after the "Design pending" label */
  message?: string;
}

export function DesignPendingBanner({ message }: DesignPendingBannerProps) {
  return (
    <div className={styles.banner}>
      <FontAwesomeIcon icon={faPencilRuler} className={styles.icon} />
      <span className={styles.text}>
        <span className={styles.label}>Design pending</span>
        {' — '}
        {message || 'This page uses placeholder layout. Final design is not yet available.'}
      </span>
    </div>
  );
}
