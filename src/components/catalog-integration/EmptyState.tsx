import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../common/Button';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  onCreateNew: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.textGroup}>
        <h2 className={styles.title}>No catalog integration configured</h2>
        <p className={styles.description}>
          Connect your external product catalog from Square or Shopify to start selling merchandise through Fever. Once connected, you'll be able to create warehouses that map to locations in your external system.
        </p>
      </div>
      <Button variant="primary" size="lg" onClick={onCreateNew}>
        <FontAwesomeIcon icon={faPlus} />
        Create catalog integration
      </Button>
    </div>
  );
}
