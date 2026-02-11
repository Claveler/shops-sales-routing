import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import { useDemo } from '../../context/DemoContext';
import { EmptyState } from './EmptyState';
import { IntegrationDetails } from './IntegrationDetails';
import { ProviderModal } from './ProviderModal';
import type { IntegrationProvider } from '../../data/mockData';
import styles from './CatalogIntegrationPage.module.css';

export function CatalogIntegrationPage() {
  const navigate = useNavigate();
  const { getIntegration } = useDemo();
  const integration = getIntegration();
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

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
          <IntegrationDetails integration={integration} />
        ) : (
          <EmptyState onCreateNew={handleCreateNew} />
        )}
      </div>
      <ProviderModal
        isOpen={isProviderModalOpen}
        onSelect={handleProviderSelect}
        onCancel={() => setIsProviderModalOpen(false)}
      />
    </div>
  );
}
