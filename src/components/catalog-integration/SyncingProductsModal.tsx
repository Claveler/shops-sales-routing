import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../common/Button';
import styles from './SyncingProductsModal.module.css';

interface SyncingProductsModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export function SyncingProductsModal({ isOpen, onDismiss }: SyncingProductsModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button className={styles.closeBtn} onClick={onDismiss} aria-label="Close">
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerTitle}>Syncing products</span>
          <div className={styles.headerDivider} />
        </div>

        {/* Body */}
        <div className={styles.body}>
          <p className={styles.bodyText}>
            We're in the process of syncing all your products. This may take more than a minute.
          </p>
          <p className={styles.bodyText}>
            You can continue using the app and you'll be notified once the sync is complete.
          </p>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button variant="outline" size="lg" disabled>
            Cancel
          </Button>
          <Button variant="primary" size="lg" onClick={onDismiss}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
