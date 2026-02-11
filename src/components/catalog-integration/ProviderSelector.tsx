import type { IntegrationProvider } from '../../data/mockData';
import styles from './ProviderSelector.module.css';

interface ProviderSelectorProps {
  value: IntegrationProvider | null;
  onChange: (provider: IntegrationProvider) => void;
}

const providers: { id: IntegrationProvider; name: string; logo: string; description: string }[] = [
  {
    id: 'square',
    name: 'Square',
    logo: '/square-logo.png',
    description: 'Connect your Square catalog to import products and manage inventory.'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    logo: '/shopify-logo.png',
    description: 'Connect your Shopify store to import products and manage inventory.'
  }
];

export function ProviderSelector({ value, onChange }: ProviderSelectorProps) {
  return (
    <div className={styles.container}>
      <div className={styles.fieldset}>
        {providers.map((provider, index) => (
          <button
            key={provider.id}
            className={`${styles.listItem} ${value === provider.id ? styles.selected : ''} ${index < providers.length - 1 ? styles.bordered : ''}`}
            onClick={() => onChange(provider.id)}
          >
            <div className={styles.providerIcon}>
              <img src={provider.logo} alt={provider.name} className={styles.providerLogo} />
            </div>
            <div className={styles.providerContent}>
              <span className={styles.providerName}>{provider.name}</span>
              <span className={styles.providerDescription}>{provider.description}</span>
            </div>
            <div className={styles.radioIndicator}>
              {value === provider.id ? (
                <div className={styles.radioActive}>
                  <div className={styles.radioDot} />
                </div>
              ) : (
                <div className={styles.radioDefault} />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
