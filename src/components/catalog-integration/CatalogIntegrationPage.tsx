import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../common/PageHeader';
import { useDemo } from '../../context/DemoContext';
import { EmptyState } from './EmptyState';
import { IntegrationDetails } from './IntegrationDetails';
import styles from './CatalogIntegrationPage.module.css';

export function CatalogIntegrationPage() {
  const navigate = useNavigate();
  const { getIntegration } = useDemo();
  const integration = getIntegration();

  const handleCreateNew = () => {
    navigate('/products/catalog-integration/create');
  };

  return (
    <>
      <PageHeader
        breadcrumbItems={[
          { label: 'Products', path: '/products' },
          { label: 'Catalog integration' }
        ]}
        title="Catalog integration"
      />
      <div className={styles.pageBody}>
        {integration ? (
          <IntegrationDetails integration={integration} />
        ) : (
          <EmptyState onCreateNew={handleCreateNew} />
        )}
      </div>
    </>
  );
}
