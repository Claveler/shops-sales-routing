import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashCan, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../common/Button';
import { PageHeader } from '../common/PageHeader';
import { useDemo } from '../../context/DemoContext';
import { DEMO_INTEGRATION_DATA, DEMO_WAREHOUSE_DATA } from '../../data/productPool';
import type { IntegrationProvider, Warehouse } from '../../data/mockData';
import styles from './CreateIntegrationWizard.module.css';

interface WarehouseEntry {
  id: string;
  name: string;
  externalLocationId: string;
}

export function CreateIntegrationWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const demo = useDemo();

  // Read provider from URL query param
  const providerParam = searchParams.get('provider') as IntegrationProvider | null;
  const provider: IntegrationProvider = providerParam === 'square' || providerParam === 'shopify'
    ? providerParam
    : 'square'; // fallback

  const providerName = provider === 'square' ? 'Square' : 'Shopify';
  
  // Form state
  const [integrationName, setIntegrationName] = useState('');
  const [externalAccountId, setExternalAccountId] = useState('');
  const [warehouses, setWarehouses] = useState<WarehouseEntry[]>([]);
  const [newWarehouseName, setNewWarehouseName] = useState('');
  const [newWarehouseLocationId, setNewWarehouseLocationId] = useState('');

  // Fill demo data
  const fillDemoDetails = () => {
    setIntegrationName(DEMO_INTEGRATION_DATA.name);
    setExternalAccountId(DEMO_INTEGRATION_DATA.externalAccountId);
  };

  const fillDemoWarehouses = () => {
    setWarehouses(DEMO_WAREHOUSE_DATA.map(w => ({
      id: w.id,
      name: w.name,
      externalLocationId: w.externalLocationId,
    })));
  };

  const handleCancel = () => {
    navigate('/products/catalog-integration');
  };

  const handleCreate = () => {
    const newIntegration = {
      id: `ci-demo-${Date.now()}`,
      name: integrationName,
      provider: provider,
      externalAccountId,
      createdAt: new Date().toISOString(),
    };

    const newWarehouses: Warehouse[] = warehouses.map((w, index) => ({
      id: w.id.startsWith('temp-') ? `wh-demo-${index === 0 ? 'main' : 'gift'}` : w.id,
      name: w.name,
      integration: providerName,
      externalLocationId: w.externalLocationId,
      productCount: 0,
      masterCatalogId: externalAccountId,
    }));

    demo.createIntegration(newIntegration, newWarehouses);
    navigate('/products/catalog-integration');
  };

  const handleAddWarehouse = () => {
    if (newWarehouseName.trim() && newWarehouseLocationId.trim()) {
      setWarehouses(prev => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          name: newWarehouseName.trim(),
          externalLocationId: newWarehouseLocationId.trim()
        }
      ]);
      setNewWarehouseName('');
      setNewWarehouseLocationId('');
    }
  };

  const handleRemoveWarehouse = (id: string) => {
    setWarehouses(prev => prev.filter(w => w.id !== id));
  };

  const canCreate =
    integrationName.trim() !== '' &&
    externalAccountId.trim() !== '' &&
    warehouses.length > 0;

  return (
    <div className={styles.pageWrapper}>
      <PageHeader
        breadcrumbItems={[
          { label: 'Products', path: '/products' },
          { label: 'Catalog integration', path: '/products/catalog-integration' },
          { label: 'Create new' }
        ]}
        title="New catalog integration"
      />
      <div className={styles.pageBody}>
        {/* Scrollable content */}
        <div className={styles.scrollContent}>
          {/* Section 1: Integration Details */}
          <div className={styles.formSection}>
            <div className={styles.sectionLabelRow}>
              <span className={styles.sectionLabel}>Integration details</span>
              {demo.isResetMode && (
                <button className={styles.fillDemoBtn} onClick={fillDemoDetails}>
                  <FontAwesomeIcon icon={faMagicWandSparkles} />
                  Fill demo data
                </button>
              )}
            </div>
            <div className={styles.fieldset}>
              <div className={styles.formGroup}>
                <div className={`${styles.floatingInputWrapper} ${integrationName ? styles.hasValue : ''}`}>
                  <label className={styles.floatingLabel}>Integration name</label>
                  <input
                    type="text"
                    className={styles.floatingInput}
                    value={integrationName}
                    onChange={(e) => setIntegrationName(e.target.value)}
                  />
                </div>
                <span className={styles.helperText}>A friendly name to identify this integration</span>
              </div>
              
              <div className={styles.formGroup}>
                <div className={`${styles.floatingInputWrapper} ${externalAccountId ? styles.hasValue : ''}`}>
                  <label className={styles.floatingLabel}>Master catalog ID</label>
                  <input
                    type="text"
                    className={styles.floatingInput}
                    value={externalAccountId}
                    onChange={(e) => setExternalAccountId(e.target.value)}
                  />
                </div>
                <span className={styles.helperText}>
                  The master catalog ID from your {providerName} account
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Warehouses */}
          <div className={styles.formSection}>
            <div className={styles.sectionLabelRow}>
              <span className={styles.sectionLabel}>Warehouses</span>
              {demo.isResetMode && warehouses.length === 0 && (
                <button className={styles.fillDemoBtn} onClick={fillDemoWarehouses}>
                  <FontAwesomeIcon icon={faMagicWandSparkles} />
                  Fill demo data
                </button>
              )}
            </div>
            <div className={styles.fieldset}>
              <p className={styles.warehouseMessage}>
                Create warehouses that map to locations in your {providerName} account. You need at least one warehouse to proceed.
              </p>
              
              <div className={styles.warehouseRow}>
                <div className={styles.warehouseInputs}>
                  <div className={`${styles.floatingInputWrapper} ${styles.warehouseInput} ${newWarehouseName ? styles.hasValue : ''}`}>
                    <label className={styles.floatingLabel}>Warehouse name</label>
                    <input
                      type="text"
                      className={styles.floatingInput}
                      value={newWarehouseName}
                      onChange={(e) => setNewWarehouseName(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.floatingInputWrapper} ${styles.warehouseInput} ${newWarehouseLocationId ? styles.hasValue : ''}`}>
                    <label className={styles.floatingLabel}>External Location ID</label>
                    <input
                      type="text"
                      className={styles.floatingInput}
                      value={newWarehouseLocationId}
                      onChange={(e) => setNewWarehouseLocationId(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={handleAddWarehouse}
                  disabled={!newWarehouseName.trim() || !newWarehouseLocationId.trim()}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Add
                </Button>
              </div>
              
              {warehouses.length > 0 && (
                <div className={styles.warehouseList}>
                  {warehouses.map((warehouse) => (
                    <div key={warehouse.id} className={styles.warehouseItem}>
                      <div className={styles.warehouseItemInfo}>
                        <span className={styles.warehouseItemName}>{warehouse.name}</span>
                        <span className={styles.warehouseItemLocation}>{warehouse.externalLocationId}</span>
                      </div>
                      <button 
                        className={styles.removeBtn}
                        onClick={() => handleRemoveWarehouse(warehouse.id)}
                        aria-label="Remove warehouse"
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className={styles.stickyFooter}>
          <Button variant="secondary" size="lg" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            size="lg"
            onClick={handleCreate}
            disabled={!canCreate}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
