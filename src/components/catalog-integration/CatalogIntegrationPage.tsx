import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import { useDemo } from '../../context/DemoContext';
import { EmptyState } from './EmptyState';
import { IntegrationDetails } from './IntegrationDetails';
import { ProviderModal } from './ProviderModal';
import { SyncingProductsModal } from './SyncingProductsModal';
import type { IntegrationProvider } from '../../data/mockData';
import styles from './CatalogIntegrationPage.module.css';

export function CatalogIntegrationPage() {
  const navigate = useNavigate();
  const demo = useDemo();
  const integration = demo.getIntegration();
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

  // Show syncing modal when we have a fresh integration that hasn't synced yet
  const isFreshIntegration = demo.isResetMode && !demo.hasSynced && integration !== null;
  const [syncModalDismissed, setSyncModalDismissed] = useState(false);
  const showSyncModal = isFreshIntegration && !syncModalDismissed;

  // After modal dismissal, tell IntegrationDetails to auto-sync
  const [autoSync, setAutoSync] = useState(false);

  const handleSyncModalDismiss = useCallback(() => {
    setSyncModalDismissed(true);
    setAutoSync(true);
  }, []);

  const handleCreateNew = () => {
    setIsProviderModalOpen(true);
  };

  const handleProviderSelect = (provider: IntegrationProvider) => {
    setIsProviderModalOpen(false);
    navigate(`/products/catalog-integration/create?provider=${provider}`);
  };

  return (
    <div className={integration ? styles.pageWrapper : styles.pageWrapperEmpty}>
      <PageHeader
        breadcrumbItems={[
          { label: 'Products', path: '/products' },
          { label: 'Catalog integrations' }
        ]}
        title="Catalog integrations"
      />
      <div className={integration ? styles.pageBody : styles.pageBodyEmpty}>
        {integration ? (
          <IntegrationDetails integration={integration} autoSync={autoSync} />
        ) : (
          <EmptyState onCreateNew={handleCreateNew} />
        )}
      </div>
      <ProviderModal
        isOpen={isProviderModalOpen}
        onSelect={handleProviderSelect}
        onCancel={() => setIsProviderModalOpen(false)}
      />
      <SyncingProductsModal
        isOpen={showSyncModal}
        onDismiss={handleSyncModalDismiss}
      />
    </div>
  );
}
