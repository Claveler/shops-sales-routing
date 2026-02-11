import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../common/Button';
import styles from './SalesRoutingEmptyState.module.css';

interface SalesRoutingEmptyStateProps {
  hasIntegration: boolean;
  onCreateNew: () => void;
  onGoToIntegration: () => void;
}

export function SalesRoutingEmptyState({ 
  hasIntegration, 
  onCreateNew, 
  onGoToIntegration 
}: SalesRoutingEmptyStateProps) {
  if (!hasIntegration) {
    return (
      <div className={styles.container}>
        <div className={styles.info}>
          <h2 className={styles.title}>No catalog integration configured</h2>
          <p className={styles.description}>
            Before creating sales routings, you need to set up a catalog integration to import 
            products and warehouses from your external system (Square or Shopify).
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={onGoToIntegration}>
          <FontAwesomeIcon icon={faArrowRight} />
          Go to Catalog integration
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <h2 className={styles.title}>No sales routings configured</h2>
        <p className={styles.description}>
          Sales routings connect your product catalog to events. Choose which channels to sell 
          through — Box Office for physical POS terminals, or online channels like Marketplace 
          and Whitelabel.
        </p>
      </div>
      <Button variant="primary" size="lg" onClick={onCreateNew}>
        <FontAwesomeIcon icon={faPlus} />
        Create a sales routing
      </Button>
    </div>
  );
}
