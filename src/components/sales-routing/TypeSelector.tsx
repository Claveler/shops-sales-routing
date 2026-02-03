import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faGlobe } from '@fortawesome/free-solid-svg-icons';
import type { RoutingType } from '../../data/mockData';
import styles from './TypeSelector.module.css';

interface TypeSelectorProps {
  value: RoutingType | null;
  onChange: (type: RoutingType) => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select routing type</h2>
      <p className={styles.subtitle}>Choose where you want to make products available</p>
      
      <div className={styles.options}>
        <button
          className={`${styles.option} ${value === 'onsite' ? styles.selected : ''}`}
          onClick={() => onChange('onsite')}
        >
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faStore} className={styles.icon} />
          </div>
          <div className={styles.content}>
            <h3 className={styles.optionTitle}>Onsite</h3>
            <p className={styles.optionDescription}>
              Sell products at physical event locations through POS systems. You can select multiple warehouses; each Box Office setup will choose which one to consume stock from.
            </p>
          </div>
          <div className={styles.radioIndicator}>
            <div className={styles.radioInner} />
          </div>
        </button>

        <button
          className={`${styles.option} ${value === 'online' ? styles.selected : ''}`}
          onClick={() => onChange('online')}
        >
          <div className={styles.iconWrapper}>
            <FontAwesomeIcon icon={faGlobe} className={styles.icon} />
          </div>
          <div className={styles.content}>
            <h3 className={styles.optionTitle}>Online</h3>
            <p className={styles.optionDescription}>
              Sell products through digital channels (Fever Marketplace, Whitelabel, OTAs). Only one warehouse can be selected per routing. In the next steps, you'll choose which channels to publish each product to.
            </p>
          </div>
          <div className={styles.radioIndicator}>
            <div className={styles.radioInner} />
          </div>
        </button>
      </div>
    </div>
  );
}
