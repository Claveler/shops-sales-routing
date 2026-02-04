import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare } from '@fortawesome/free-solid-svg-icons';
import { faShopify } from '@fortawesome/free-brands-svg-icons';
import type { IntegrationProvider } from '../../data/mockData';
import styles from './ProviderSelector.module.css';

interface ProviderSelectorProps {
  value: IntegrationProvider | null;
  onChange: (provider: IntegrationProvider) => void;
}

const providers: { id: IntegrationProvider; name: string; icon: typeof faSquare; description: string }[] = [
  {
    id: 'square',
    name: 'Square',
    icon: faSquare,
    description: 'Connect your Square catalog to import products and manage inventory from your Square POS system.'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: faShopify,
    description: 'Connect your Shopify store to import products and sync inventory with your e-commerce platform.'
  }
];

export function ProviderSelector({ value, onChange }: ProviderSelectorProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select integration provider</h2>
      <p className={styles.subtitle}>Choose the platform where your product catalog is managed</p>
      
      <div className={styles.providers}>
        {providers.map((provider) => (
          <button
            key={provider.id}
            className={`${styles.providerCard} ${value === provider.id ? styles.selected : ''}`}
            onClick={() => onChange(provider.id)}
          >
            <div className={styles.providerIcon}>
              <FontAwesomeIcon icon={provider.icon} />
            </div>
            <div className={styles.providerContent}>
              <h3 className={styles.providerName}>{provider.name}</h3>
              <p className={styles.providerDescription}>{provider.description}</p>
            </div>
            <div className={styles.radioIndicator}>
              <div className={styles.radioOuter}>
                {value === provider.id && <div className={styles.radioInner} />}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
