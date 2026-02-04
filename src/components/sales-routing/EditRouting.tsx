import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Card, CardHeader, CardTitle, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Breadcrumb } from '../common/Breadcrumb';
import { ImmutableSection } from './ImmutableSection';
import { WarehouseSelector } from './WarehouseSelector';
import { ProductSelector } from './ProductSelector';
import { ChannelSelector } from './ChannelSelector';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useDemo } from '../../context/DemoContext';
import { 
  getSalesRoutingById, 
  getEventById,
  type RoutingStatus,
  type SalesRouting 
} from '../../data/mockData';
import styles from './EditRouting.module.css';

const statusOptions: { value: RoutingStatus; label: string; description: string }[] = [
  { value: 'draft', label: 'Draft', description: 'Not yet published, visible only in Fever Zone' },
  { value: 'active', label: 'Active', description: 'Live and accepting orders' },
  { value: 'inactive', label: 'Inactive', description: 'Paused, not accepting new orders' }
];

const statusVariantMap: Record<RoutingStatus, 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  draft: 'warning',
  inactive: 'secondary'
};

export function EditRouting() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const demo = useDemo();
  
  // Load routing data
  const [routing, setRouting] = useState<SalesRouting | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<string[]>([]);
  const [priceReferenceWarehouseId, setPriceReferenceWarehouseId] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
  const [status, setStatus] = useState<RoutingStatus>('draft');
  
  // UI state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load routing data on mount
  useEffect(() => {
    if (id) {
      // Check demo context first, then fall back to static data
      let foundRouting: SalesRouting | undefined;
      if (demo.isResetMode) {
        foundRouting = demo.getSalesRoutings().find(r => r.id === id);
      } else {
        foundRouting = getSalesRoutingById(id);
      }
      
      if (foundRouting) {
        setRouting(foundRouting);
        setName(foundRouting.name);
        setSelectedWarehouseIds(foundRouting.warehouseIds);
        setPriceReferenceWarehouseId(foundRouting.priceReferenceWarehouseId || null);
        setSelectedProductIds(foundRouting.selectedProductIds || []);
        setSelectedChannelIds(foundRouting.channelIds || []);
        setStatus(foundRouting.status);
      } else {
        setNotFound(true);
      }
    }
    setLoading(false);
  }, [id, demo.isResetMode, demo]);

  // Track changes
  useEffect(() => {
    if (!routing) return;
    
    const nameChanged = name !== routing.name;
    const warehousesChanged = JSON.stringify(selectedWarehouseIds.sort()) !== JSON.stringify([...routing.warehouseIds].sort());
    const priceRefChanged = priceReferenceWarehouseId !== (routing.priceReferenceWarehouseId || null);
    const productsChanged = JSON.stringify([...selectedProductIds].sort()) !== JSON.stringify([...(routing.selectedProductIds || [])].sort());
    const channelsChanged = JSON.stringify([...selectedChannelIds].sort()) !== JSON.stringify([...(routing.channelIds || [])].sort());
    const statusChanged = status !== routing.status;
    
    setHasChanges(nameChanged || warehousesChanged || priceRefChanged || productsChanged || channelsChanged || statusChanged);
  }, [routing, name, selectedWarehouseIds, priceReferenceWarehouseId, selectedProductIds, selectedChannelIds, status]);

  const event = routing ? getEventById(routing.eventId) : null;

  // Handle warehouse selection changes and auto-manage price reference
  const handleWarehouseChange = (warehouseIds: string[]) => {
    setSelectedWarehouseIds(warehouseIds);
    
    // Auto-manage price reference for onsite routings
    if (routing?.type === 'onsite') {
      if (warehouseIds.length === 0) {
        setPriceReferenceWarehouseId(null);
      } else if (warehouseIds.length === 1) {
        setPriceReferenceWarehouseId(warehouseIds[0]);
      } else if (!priceReferenceWarehouseId || !warehouseIds.includes(priceReferenceWarehouseId)) {
        setPriceReferenceWarehouseId(warehouseIds[0]);
      }
    }
  };

  const handleSave = () => {
    // In a real app, this would make an API call
    console.log('Saving routing:', {
      id: routing?.id,
      name,
      warehouseIds: selectedWarehouseIds,
      priceReferenceWarehouseId: routing?.type === 'onsite' && selectedWarehouseIds.length > 1 ? priceReferenceWarehouseId : undefined,
      selectedProductIds: routing?.type === 'online' ? selectedProductIds : undefined,
      channelIds: routing?.type === 'online' ? selectedChannelIds : undefined,
      status
    });
    
    navigate('/products/sales-routing');
  };

  const handleCancel = () => {
    navigate('/products/sales-routing');
  };

  const handleDelete = () => {
    // In a real app, this would make an API call
    console.log('Deleting routing:', routing?.id);
    navigate('/products/sales-routing');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (notFound || !routing || !event) {
    return (
      <div className={styles.container}>
        <Breadcrumb 
          items={[
            { label: 'Products', path: '/products' },
            { label: 'Sales routing', path: '/products/sales-routing' },
            { label: 'Not found' }
          ]} 
        />
        <Card>
          <CardBody>
            <div className={styles.notFound}>
              <h2>Sales routing not found</h2>
              <p>The sales routing you're looking for doesn't exist or has been deleted.</p>
              <Button variant="primary" onClick={() => navigate('/products/sales-routing')}>
                Back to list
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Breadcrumb 
        items={[
          { label: 'Products', path: '/products' },
          { label: 'Sales routing', path: '/products/sales-routing' },
          { label: 'Edit' }
        ]} 
      />
      
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <h1 className={styles.pageTitle}>Edit sales routing</h1>
          <Badge variant={statusVariantMap[routing.status]} size="md">
            {routing.status.charAt(0).toUpperCase() + routing.status.slice(1)}
          </Badge>
        </div>
      </div>

      <Card padding="none">
        <div className={styles.cardInner}>
          <CardHeader>
            <CardTitle subtitle={`ID: ${routing.id}`}>
              {routing.name}
            </CardTitle>
          </CardHeader>

          <CardBody>
            {/* Immutable Configuration Section */}
            <ImmutableSection type={routing.type} event={event} />

            {/* Editable Settings Section */}
            <div className={styles.editableSection}>
              <h3 className={styles.sectionTitle}>Operational Settings</h3>
              <p className={styles.sectionSubtitle}>
                These settings can be modified at any time.
              </p>

              {/* Name Field */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Routing Name</label>
                <input
                  type="text"
                  className={styles.input}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter a name for this routing"
                />
              </div>

              {/* Warehouse Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  {routing.type === 'online' ? 'Stock Source (Warehouse)' : 'Stock Sources (Warehouses)'}
                </label>
                <div className={styles.selectorWrapper}>
                  <WarehouseSelector
                    value={selectedWarehouseIds}
                    onChange={handleWarehouseChange}
                    routingType={routing.type}
                    priceReferenceId={priceReferenceWarehouseId}
                    onPriceReferenceChange={setPriceReferenceWarehouseId}
                  />
                </div>
              </div>

              {/* Product Selection (Online only) */}
              {routing.type === 'online' && selectedWarehouseIds.length > 0 && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Published Products</label>
                  <div className={styles.selectorWrapper}>
                    <ProductSelector
                      warehouseId={selectedWarehouseIds[0]}
                      selectedProductIds={selectedProductIds}
                      onChange={setSelectedProductIds}
                    />
                  </div>
                </div>
              )}

              {/* Channel Selection (Online only) */}
              {routing.type === 'online' && selectedProductIds.length > 0 && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Sales Channels</label>
                  <div className={styles.selectorWrapper}>
                    <ChannelSelector
                      selectedChannelIds={selectedChannelIds}
                      onChange={setSelectedChannelIds}
                      productCount={selectedProductIds.length}
                    />
                  </div>
                </div>
              )}

              {/* Status Selection */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Status</label>
                <div className={styles.statusOptions}>
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.statusOption} ${status === option.value ? styles.selected : ''}`}
                      onClick={() => setStatus(option.value)}
                    >
                      <span className={styles.statusLabel}>{option.label}</span>
                      <span className={styles.statusDescription}>{option.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
                disabled={
                  !hasChanges || 
                  !name.trim() || 
                  selectedWarehouseIds.length === 0 ||
                  (routing.type === 'online' && (selectedProductIds.length === 0 || selectedChannelIds.length === 0))
                }
              >
                Save changes
              </Button>
            </div>

            {/* Danger Zone */}
            <div className={styles.dangerZone}>
              <div className={styles.dangerContent}>
                <div className={styles.dangerIcon}>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
                <div className={styles.dangerInfo}>
                  <h4 className={styles.dangerTitle}>Delete this sales routing</h4>
                  <p className={styles.dangerDescription}>
                    Once deleted, this routing cannot be recovered. All configuration will be permanently removed.
                  </p>
                </div>
              </div>
              <Button 
                variant="danger" 
                icon={faTrash}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete routing
              </Button>
            </div>
          </CardBody>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmModal
          routingName={routing.name}
          routingStatus={routing.status}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
