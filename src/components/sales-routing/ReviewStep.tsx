import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faGlobe, faCalendar, faMapMarkerAlt, faBox, faCheckCircle, faStar, faTag, faBullhorn, faMagicWandSparkles, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Badge } from '../common/Badge';
import { useDemo } from '../../context/DemoContext';
import { 
  getEventById, 
  getWarehouseById, 
  getProductById,
  channels 
} from '../../data/mockData';
import type { RoutingType, RoutingStatus } from '../../data/mockData';
import styles from './ReviewStep.module.css';

interface ReviewStepProps {
  type: RoutingType;
  eventId: string;
  warehouseIds: string[];
  priceReferenceWarehouseId?: string | null;
  selectedProductIds?: string[];
  channelIds?: string[];
  status: RoutingStatus;
  onStatusChange: (status: RoutingStatus) => void;
  name: string;
  onNameChange: (name: string) => void;
}

export function ReviewStep({ 
  type, 
  eventId, 
  warehouseIds,
  priceReferenceWarehouseId,
  selectedProductIds = [],
  channelIds = [],
  status,
  onStatusChange,
  name,
  onNameChange
}: ReviewStepProps) {
  const demo = useDemo();
  const event = getEventById(eventId);
  
  // Generate a suggested name based on event
  const handleFillDemoName = () => {
    if (event) {
      const suffix = type === 'onsite' ? 'Box Office' : 'Online Store';
      onNameChange(`${event.name} - ${suffix}`);
    }
  };

  // Helper to look up warehouse - check demo context first, then static data
  const getWarehouse = (id: string) => {
    const demoWarehouse = demo.getWarehouses().find(w => w.id === id);
    return demoWarehouse || getWarehouseById(id);
  };

  // Get actual product count for a warehouse from product-warehouse relationships
  const getWarehouseProductCount = (warehouseId: string) => {
    const productWarehouses = demo.getProductWarehouses();
    return productWarehouses.filter(pw => pw.warehouseId === warehouseId).length;
  };

  const warehouses = warehouseIds.map(id => getWarehouse(id)).filter(Boolean);
  const priceRefWarehouse = priceReferenceWarehouseId ? getWarehouse(priceReferenceWarehouseId) : null;
  
  // Get selected products (for online routings)
  const selectedProducts = selectedProductIds.map(id => getProductById(id)).filter(Boolean);
  
  // Get selected channels (for online routings)
  const selectedChannels = channels.filter(c => channelIds.includes(c.id));

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Review your sales routing</h2>
      <p className={styles.subtitle}>Confirm the details before creating</p>

      <div className={styles.sections}>
        {/* Type */}
        <div className={styles.section}>
          <div className={styles.sectionIcon}>
            <FontAwesomeIcon icon={type === 'onsite' ? faStore : faGlobe} />
          </div>
          <div className={styles.sectionContent}>
            <h3 className={styles.sectionTitle}>Routing Type</h3>
            <p className={styles.sectionValue}>
              {type === 'onsite' ? 'Onsite' : 'Online'} sales
            </p>
          </div>
          <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
        </div>

        {/* Event */}
        <div className={styles.section}>
          <div className={styles.sectionIcon}>
            <FontAwesomeIcon icon={faCalendar} />
          </div>
          <div className={styles.sectionContent}>
            <h3 className={styles.sectionTitle}>Event</h3>
            {event && (
              <>
                <p className={styles.sectionValue}>{event.name}</p>
                <p className={styles.sectionMeta}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  {event.venue}, {event.city} • {formatDate(event.date)}
                </p>
              </>
            )}
          </div>
          <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
        </div>

        {/* Stock Source */}
        <div className={styles.section}>
          <div className={styles.sectionIcon}>
            <FontAwesomeIcon icon={faBox} />
          </div>
          <div className={styles.sectionContent}>
            <h3 className={styles.sectionTitle}>
              Stock Source{warehouses.length > 1 ? 's' : ''}
            </h3>
            <p className={styles.sectionMeta}>
              {warehouses.length > 1 
                ? 'Stock will be pulled from one of these warehouses based on Box Office plan configuration'
                : 'Stock will be pulled from this warehouse'}
            </p>
            <div className={styles.warehouseList}>
              {warehouses.map(warehouse => {
                const isPriceRef = priceReferenceWarehouseId === warehouse!.id;
                return (
                  <div key={warehouse!.id} className={styles.warehouseItem}>
                    <Badge variant="info" size="sm">
                      {warehouse!.name} ({getWarehouseProductCount(warehouse!.id)} products)
                    </Badge>
                    {isPriceRef && warehouses.length > 1 && (
                      <span className={styles.priceRefBadge}>
                        <FontAwesomeIcon icon={faStar} />
                        Price reference
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {warehouses.length > 1 && priceRefWarehouse && (
              <p className={styles.priceRefNote}>
                Product prices will be pulled from <strong>{priceRefWarehouse.name}</strong> in case of conflicts.
              </p>
            )}
          </div>
          <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
        </div>

        {/* Products (Online only) */}
        {type === 'online' && selectedProducts.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionIcon}>
              <FontAwesomeIcon icon={faTag} />
            </div>
            <div className={styles.sectionContent}>
              <h3 className={styles.sectionTitle}>Products to Publish</h3>
              <p className={styles.sectionValue}>
                {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
              </p>
              <div className={styles.productPreview}>
                {selectedProducts.slice(0, 3).map(product => (
                  <Badge key={product!.id} variant="info" size="sm">
                    {product!.name}
                  </Badge>
                ))}
                {selectedProducts.length > 3 && (
                  <span className={styles.moreText}>
                    +{selectedProducts.length - 3} more
                  </span>
                )}
              </div>
            </div>
            <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
          </div>
        )}

        {/* Channels (Online only) */}
        {type === 'online' && selectedChannels.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionIcon}>
              <FontAwesomeIcon icon={faBullhorn} />
            </div>
            <div className={styles.sectionContent}>
              <h3 className={styles.sectionTitle}>Sales Channels</h3>
              <p className={styles.sectionValue}>
                Publishing to {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''}
              </p>
              <div className={styles.channelList}>
                {selectedChannels.map(channel => (
                  <Badge key={channel.id} variant="secondary" size="sm">
                    {channel.name}
                  </Badge>
                ))}
              </div>
            </div>
            <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
          </div>
        )}
      </div>

      {/* Status Selection */}
      <div className={styles.statusSection}>
        <h3 className={styles.statusTitle}>Initial Status</h3>
        <p className={styles.statusSubtitle}>Choose the initial status for this routing</p>
        
        <div className={styles.statusOptions}>
          <button
            className={`${styles.statusOption} ${status === 'draft' ? styles.selected : ''}`}
            onClick={() => onStatusChange('draft')}
          >
            <Badge variant="warning">Draft</Badge>
            <span>Save as draft - won't be active yet</span>
          </button>
          
          <button
            className={`${styles.statusOption} ${status === 'active' ? styles.selected : ''}`}
            onClick={() => onStatusChange('active')}
          >
            <Badge variant="success">Active</Badge>
            <span>Activate immediately</span>
          </button>
        </div>
      </div>

      {/* Name Input - positioned near create button */}
      <div className={styles.nameSection}>
        <div className={styles.nameHeader}>
          <label htmlFor="routing-name" className={styles.nameLabel}>
            <FontAwesomeIcon icon={faEdit} />
            Routing Name <span className={styles.required}>*</span>
          </label>
          {demo.isResetMode && (
            <button 
              type="button"
              className={styles.fillDemoBtn}
              onClick={handleFillDemoName}
            >
              <FontAwesomeIcon icon={faMagicWandSparkles} />
              Fill demo data
            </button>
          )}
        </div>
        <input
          id="routing-name"
          type="text"
          className={`${styles.nameInput} ${!name.trim() ? styles.inputRequired : ''}`}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter a name for this routing..."
        />
        <p className={styles.nameHint}>
          A descriptive name helps identify this routing in lists and reports
        </p>
      </div>
    </div>
  );
}
