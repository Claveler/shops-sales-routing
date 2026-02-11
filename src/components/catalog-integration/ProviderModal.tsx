import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../common/Button';
import { ProviderSelector } from './ProviderSelector';
import type { IntegrationProvider } from '../../data/mockData';
import styles from './ProviderModal.module.css';

interface ProviderModalProps {
  isOpen: boolean;
  onSelect: (provider: IntegrationProvider) => void;
  onCancel: () => void;
}

export function ProviderModal({ isOpen, onSelect, onCancel }: ProviderModalProps) {
  const [selected, setSelected] = useState<IntegrationProvider | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleContinue = () => {
    if (selected) {
      onSelect(selected);
      setSelected(null);
    }
  };

  const handleCancel = () => {
    setSelected(null);
    onCancel();
  };

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button className={styles.closeBtn} onClick={handleCancel} aria-label="Close">
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerTitle}>Create new catalog integration</span>
          <div className={styles.headerDivider} />
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.intro}>
            <h2 className={styles.title}>Let's create a new catalog integration</h2>
            <p className={styles.subtitle}>Choose the platform where your product catalog is managed.</p>
          </div>
          <ProviderSelector value={selected} onChange={setSelected} />
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button variant="outline" size="lg" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="lg" onClick={handleContinue} disabled={!selected}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
