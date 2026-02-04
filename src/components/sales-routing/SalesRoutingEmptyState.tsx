import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute, faPlus, faLink } from '@fortawesome/free-solid-svg-icons';
import { Card } from '../common/Card';
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
      <Card>
        <div className={styles.container}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faLink} className={styles.icon} />
          </div>
          
          <h2 className={styles.title}>No catalog integration configured</h2>
          
          <p className={styles.description}>
            Before creating sales routings, you need to set up a catalog integration to import 
            products and warehouses from your external system (Square or Shopify).
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>1</span>
              <span className={styles.featureText}>Create a catalog integration</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>2</span>
              <span className={styles.featureText}>Add warehouses linked to your locations</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>3</span>
              <span className={styles.featureText}>Return here to create sales routings</span>
            </div>
          </div>
          
          <Button variant="primary" size="lg" onClick={onGoToIntegration}>
            <FontAwesomeIcon icon={faLink} />
            Go to Catalog integration
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <FontAwesomeIcon icon={faRoute} className={styles.icon} />
        </div>
        
        <h2 className={styles.title}>No sales routings configured</h2>
        
        <p className={styles.description}>
          Sales routings connect your product catalog to events. Choose which channels to sell 
          through — Box Office for physical POS terminals, or online channels like Marketplace and Whitelabel.
        </p>
        
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>1</span>
            <span className={styles.featureText}>Select an event to publish products to</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>2</span>
            <span className={styles.featureText}>Choose your sales channels (Box Office, Marketplace, etc.)</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>3</span>
            <span className={styles.featureText}>Connect warehouses to each channel</span>
          </div>
        </div>
        
        <Button variant="primary" size="lg" onClick={onCreateNew}>
          <FontAwesomeIcon icon={faPlus} />
          Create your first sales routing
        </Button>
      </div>
    </Card>
  );
}
