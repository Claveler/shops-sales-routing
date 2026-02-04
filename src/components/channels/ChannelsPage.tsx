import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { Breadcrumb } from '../common/Breadcrumb';
import { Card } from '../common/Card';
import styles from './ChannelsPage.module.css';

export function ChannelsPage() {
  return (
    <div className={styles.container}>
      <Breadcrumb 
        items={[
          { label: 'Products', path: '/products' },
          { label: 'Channels' }
        ]} 
      />
      
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Channels</h1>
      </div>

      <Card>
        <div className={styles.emptyContainer}>
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faSlidersH} className={styles.icon} />
          </div>
          
          <h2 className={styles.title}>Product channel visibility</h2>
          
          <p className={styles.description}>
            Configure which products are available in each sales channel. This provides 
            granular control beyond warehouse-level routing — choose exactly which items 
            appear in Marketplace, Whitelabel, or other channels.
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>1</span>
              <span className={styles.featureText}>Select a sales channel to configure</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>2</span>
              <span className={styles.featureText}>Choose which products to show or hide</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>3</span>
              <span className={styles.featureText}>Fine-tune visibility per event if needed</span>
            </div>
          </div>

          <div className={styles.comingSoon}>
            Coming soon
          </div>
        </div>
      </Card>
    </div>
  );
}
