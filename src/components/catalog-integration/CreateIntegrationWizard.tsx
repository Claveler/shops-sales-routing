import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheck, faPlus, faTrash, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { PageHeader } from '../common/PageHeader';
import { ProviderSelector } from './ProviderSelector';
import { useDemo } from '../../context/DemoContext';
import { DEMO_INTEGRATION_DATA, DEMO_WAREHOUSE_DATA } from '../../data/productPool';
import type { IntegrationProvider, Warehouse } from '../../data/mockData';
import styles from './CreateIntegrationWizard.module.css';

interface WizardStep {
  id: string;
  title: string;
}

interface WarehouseEntry {
  id: string;
  name: string;
  externalLocationId: string;
}

const steps: WizardStep[] = [
  { id: 'provider', title: 'Provider' },
  { id: 'details', title: 'Details' },
  { id: 'warehouses', title: 'Warehouses' },
  { id: 'review', title: 'Review' },
];

export function CreateIntegrationWizard() {
  const navigate = useNavigate();
  const demo = useDemo();
  
  // Form state
  const [provider, setProvider] = useState<IntegrationProvider | null>(null);
  const [integrationName, setIntegrationName] = useState('');
  const [externalAccountId, setExternalAccountId] = useState('');
  const [warehouses, setWarehouses] = useState<WarehouseEntry[]>([]);
  const [newWarehouseName, setNewWarehouseName] = useState('');
  const [newWarehouseLocationId, setNewWarehouseLocationId] = useState('');
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);

  // Fill demo data for details step
  const fillDemoDetails = () => {
    setIntegrationName(DEMO_INTEGRATION_DATA.name);
    setExternalAccountId(DEMO_INTEGRATION_DATA.externalAccountId);
  };

  // Fill demo data for warehouses step
  const fillDemoWarehouses = () => {
    setWarehouses(DEMO_WAREHOUSE_DATA.map(w => ({
      id: w.id,
      name: w.name,
      externalLocationId: w.externalLocationId,
    })));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCancel = () => {
    navigate('/products/catalog-integration');
  };

  const handleCreate = () => {
    // Create the integration in demo context
    const newIntegration = {
      id: `ci-demo-${Date.now()}`,
      name: integrationName,
      provider: provider!,
      externalAccountId,
      createdAt: new Date().toISOString(),
    };

    const newWarehouses: Warehouse[] = warehouses.map((w, index) => ({
      id: w.id.startsWith('temp-') ? `wh-demo-${index === 0 ? 'main' : 'gift'}` : w.id,
      name: w.name,
      integration: provider === 'square' ? 'Square' : 'Shopify',
      externalLocationId: w.externalLocationId,
      productCount: 0,
      masterCatalogId: externalAccountId,
    }));

    demo.createIntegration(newIntegration, newWarehouses);
    
    console.log('Created integration:', { newIntegration, newWarehouses });
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

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'provider':
        return provider !== null;
      case 'details':
        return integrationName.trim() !== '' && externalAccountId.trim() !== '';
      case 'warehouses':
        return warehouses.length > 0;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (steps[currentStep].id) {
      case 'provider':
        return <ProviderSelector value={provider} onChange={setProvider} />;
      
      case 'details':
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <div>
                <h2 className={styles.stepTitle}>Integration details</h2>
                <p className={styles.stepSubtitle}>
                  Provide the details for your {provider === 'square' ? 'Square' : 'Shopify'} integration
                </p>
              </div>
              {demo.isResetMode && (
                <button className={styles.fillDemoBtn} onClick={fillDemoDetails}>
                  <FontAwesomeIcon icon={faMagicWandSparkles} />
                  Fill demo data
                </button>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Integration name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g., ES - Shops"
                value={integrationName}
                onChange={(e) => setIntegrationName(e.target.value)}
              />
              <span className={styles.hint}>A friendly name to identify this integration</span>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Master catalog ID
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder={provider === 'square' ? 'sq_acc_...' : 'your-store.myshopify.com'}
                value={externalAccountId}
                onChange={(e) => setExternalAccountId(e.target.value)}
              />
              <span className={styles.hint}>
                The master catalog ID from your {provider === 'square' ? 'Square' : 'Shopify'} account
              </span>
            </div>
          </div>
        );
      
      case 'warehouses':
        return (
          <div className={styles.stepContent}>
            <div className={styles.stepHeader}>
              <div>
                <h2 className={styles.stepTitle}>Add warehouses</h2>
                <p className={styles.stepSubtitle}>
                  Create warehouses that map to locations in your {provider === 'square' ? 'Square' : 'Shopify'} account.
                  You need at least one warehouse to proceed.
                </p>
              </div>
              {demo.isResetMode && warehouses.length === 0 && (
                <button className={styles.fillDemoBtn} onClick={fillDemoWarehouses}>
                  <FontAwesomeIcon icon={faMagicWandSparkles} />
                  Fill demo data
                </button>
              )}
            </div>
            
            <div className={styles.warehouseForm}>
              <div className={styles.warehouseInputs}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Warehouse name</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g., Main Store"
                    value={newWarehouseName}
                    onChange={(e) => setNewWarehouseName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>External Location ID</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder={provider === 'square' ? 'LOC_...' : 'location_id'}
                    value={newWarehouseLocationId}
                    onChange={(e) => setNewWarehouseLocationId(e.target.value)}
                  />
                </div>
                <Button 
                  variant="primary" 
                  size="md"
                  onClick={handleAddWarehouse}
                  disabled={!newWarehouseName.trim() || !newWarehouseLocationId.trim()}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Add
                </Button>
              </div>
            </div>
            
            {warehouses.length > 0 && (
              <div className={styles.warehouseList}>
                <h4 className={styles.warehouseListTitle}>Warehouses to create ({warehouses.length})</h4>
                {warehouses.map((warehouse) => (
                  <div key={warehouse.id} className={styles.warehouseItem}>
                    <div className={styles.warehouseInfo}>
                      <span className={styles.warehouseName}>{warehouse.name}</span>
                      <span className={styles.warehouseLocation}>{warehouse.externalLocationId}</span>
                    </div>
                    <button 
                      className={styles.removeBtn}
                      onClick={() => handleRemoveWarehouse(warehouse.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'review':
        return (
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>Review and create</h2>
            <p className={styles.stepSubtitle}>
              Review your integration settings before creating
            </p>
            
            <div className={styles.reviewSections}>
              <div className={styles.reviewSection}>
                <h4 className={styles.reviewLabel}>Provider</h4>
                <p className={styles.reviewValue}>{provider === 'square' ? 'Square' : 'Shopify'}</p>
              </div>
              
              <div className={styles.reviewSection}>
                <h4 className={styles.reviewLabel}>Integration name</h4>
                <p className={styles.reviewValue}>{integrationName}</p>
              </div>
              
              <div className={styles.reviewSection}>
                <h4 className={styles.reviewLabel}>Master catalog ID</h4>
                <p className={styles.reviewValue}>{externalAccountId}</p>
              </div>
              
              <div className={styles.reviewSection}>
                <h4 className={styles.reviewLabel}>Warehouses ({warehouses.length})</h4>
                <div className={styles.reviewWarehouses}>
                  {warehouses.map((warehouse) => (
                    <div key={warehouse.id} className={styles.reviewWarehouse}>
                      <span className={styles.reviewWarehouseName}>{warehouse.name}</span>
                      <span className={styles.reviewWarehouseId}>{warehouse.externalLocationId}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <PageHeader
        breadcrumbItems={[
          { label: 'Products', path: '/products' },
          { label: 'Catalog integration', path: '/products/catalog-integration' },
          { label: 'Create new' }
        ]}
        title="Create catalog integration"
      />
      <div className={styles.pageBody}>
      <Card>
        <div className={styles.cardInner}>
          {/* Progress Bar */}
          <div className={styles.progressBar}>
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`${styles.progressStep} ${index <= currentStep ? styles.active : ''} ${index < currentStep ? styles.completed : ''}`}
              >
                <div className={styles.stepIndicator}>
                  {index < currentStep ? <FontAwesomeIcon icon={faCheck} /> : index + 1}
                </div>
                <span className={styles.stepLabel}>{step.title}</span>
                {index < steps.length - 1 && <div className={styles.stepConnector} />}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Navigation */}
          <div className={styles.navigation}>
            <div className={styles.navLeft}>
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
            <div className={styles.navRight}>
              {currentStep > 0 && (
                <Button variant="outline" onClick={handleBack}>
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button 
                  variant="primary" 
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Next
                  <FontAwesomeIcon icon={faArrowRight} />
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  onClick={handleCreate}
                >
                  <FontAwesomeIcon icon={faCheck} />
                  Create integration
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
      </div>
    </>
  );
}
