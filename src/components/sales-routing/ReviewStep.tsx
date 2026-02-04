import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faGlobe, faCalendar, faMapMarkerAlt, faBox, faCheckCircle, faStar, faBullhorn, faArrowRight, faCashRegister, faDesktop, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Badge } from '../common/Badge';
import { useDemo } from '../../context/DemoContext';
import { 
  getEventById, 
  getWarehouseById, 
  channels,
  isBoxOfficeChannel
} from '../../data/mockData';
import type { RoutingStatus } from '../../data/mockData';
import styles from './ReviewStep.module.css';

interface ReviewStepProps {
  eventId: string;
  channelIds: string[];
  warehouseIds: string[];
  priceReferenceWarehouseId?: string | null;
  channelWarehouseMapping: Record<string, string>;
  status: RoutingStatus;
  onStatusChange: (status: RoutingStatus) => void;
}

const channelIcons: Record<string, typeof faGlobe> = {
  onsite: faCashRegister,
  marketplace: faGlobe,
  whitelabel: faDesktop,
  kiosk: faStore,
  ota: faExternalLinkAlt
};

export function ReviewStep({ 
  eventId, 
  channelIds,
  warehouseIds,
  priceReferenceWarehouseId,
  channelWarehouseMapping,
  status,
  onStatusChange
}: ReviewStepProps) {
  const demo = useDemo();
  const event = getEventById(eventId);

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
  
  // Get selected channels
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

        {/* Channels */}
        <div className={styles.section}>
          <div className={styles.sectionIcon}>
            <FontAwesomeIcon icon={faBullhorn} />
          </div>
          <div className={styles.sectionContent}>
            <h3 className={styles.sectionTitle}>Sales Channels</h3>
            <p className={styles.sectionValue}>
              {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected
            </p>
            <div className={styles.channelList}>
              {selectedChannels.map(channel => (
                <Badge 
                  key={channel.id} 
                  variant={isBoxOfficeChannel(channel.id) ? 'warning' : 'secondary'} 
                  size="sm"
                >
                  <FontAwesomeIcon icon={channelIcons[channel.type] || faGlobe} className={styles.channelIcon} />
                  {channel.name}
                </Badge>
              ))}
            </div>
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

        {/* Channel-Warehouse Mapping */}
        <div className={styles.section}>
          <div className={styles.sectionIcon}>
            <FontAwesomeIcon icon={faArrowRight} />
          </div>
          <div className={styles.sectionContent}>
            <h3 className={styles.sectionTitle}>Channel Routing</h3>
            <p className={styles.sectionMeta}>
              How channels are mapped to warehouses
            </p>
            <div className={styles.mappingList}>
              {Object.entries(channelWarehouseMapping).map(([channelId, warehouseId]) => {
                const channel = channels.find(c => c.id === channelId);
                const warehouse = getWarehouse(warehouseId);
                if (!channel || !warehouse) return null;
                
                return (
                  <div key={channelId} className={styles.mappingItem}>
                    <span className={styles.mappingChannel}>
                      <FontAwesomeIcon icon={channelIcons[channel.type] || faGlobe} />
                      {channel.name}
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} className={styles.mappingArrow} />
                    <span className={styles.mappingWarehouse}>
                      {warehouse.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
        </div>
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
    </div>
  );
}
