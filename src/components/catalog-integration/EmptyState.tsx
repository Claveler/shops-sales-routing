import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlug, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  onCreateNew: () => void;
}

export function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <Card>
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <FontAwesomeIcon icon={faPlug} className={styles.icon} />
        </div>
        
        <h2 className={styles.title}>No catalog integration configured</h2>
        
        <p className={styles.description}>
          Connect your external product catalog from Square or Shopify to start selling 
          merchandise through Fever. Once connected, you'll be able to create warehouses 
          that map to locations in your external system.
        </p>
        
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>1</span>
            <span className={styles.featureText}>Choose your integration provider (Square or Shopify)</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>2</span>
            <span className={styles.featureText}>Connect your external account</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>3</span>
            <span className={styles.featureText}>Create warehouses linked to your locations</span>
          </div>
        </div>
        
        <Button variant="primary" size="lg" onClick={onCreateNew}>
          <FontAwesomeIcon icon={faPlus} />
          Create catalog integration
        </Button>
      </div>
    </Card>
  );
}
