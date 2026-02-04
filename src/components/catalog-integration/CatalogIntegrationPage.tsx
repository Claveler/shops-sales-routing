import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../common/Breadcrumb';
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
    <div className={styles.container}>
      <Breadcrumb 
        items={[
          { label: 'Products', path: '/products' },
          { label: 'Catalog integration' }
        ]} 
      />
      
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Catalog integration</h1>
      </div>

      {integration ? (
        <IntegrationDetails integration={integration} />
      ) : (
        <EmptyState onCreateNew={handleCreateNew} />
      )}
    </div>
  );
}
