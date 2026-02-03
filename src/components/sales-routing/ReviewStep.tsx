import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faGlobe, faCalendar, faMapMarkerAlt, faBox, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Badge } from '../common/Badge';
import { 
  getEventById, 
  getWarehouseById, 
  getProductsByWarehouseIds,
  channels 
} from '../../data/mockData';
import type { RoutingType, RoutingStatus } from '../../data/mockData';
import styles from './ReviewStep.module.css';

interface ReviewStepProps {
  type: RoutingType;
  eventId: string;
  warehouseIds: string[];
  channelMapping: Record<string, string[]>;
  status: RoutingStatus;
  onStatusChange: (status: RoutingStatus) => void;
}

export function ReviewStep({ 
  type, 
  eventId, 
  warehouseIds, 
  channelMapping,
  status,
  onStatusChange 
}: ReviewStepProps) {
  const event = getEventById(eventId);
  const warehouses = warehouseIds.map(id => getWarehouseById(id)).filter(Boolean);
  const products = getProductsByWarehouseIds(warehouseIds);
  
  const configuredProducts = Object.values(channelMapping).filter(c => c.length > 0).length;
  const selectedChannels = [...new Set(Object.values(channelMapping).flat())];

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

        {/* Warehouses */}
        <div className={styles.section}>
          <div className={styles.sectionIcon}>
            <FontAwesomeIcon icon={faBox} />
          </div>
          <div className={styles.sectionContent}>
            <h3 className={styles.sectionTitle}>
              Warehouse{warehouses.length > 1 ? 's' : ''} ({warehouses.length})
            </h3>
            <div className={styles.warehouseList}>
              {warehouses.map(warehouse => (
                <Badge key={warehouse!.id} variant="info" size="sm">
                  {warehouse!.name} ({warehouse!.productCount} products)
                </Badge>
              ))}
            </div>
          </div>
          <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
        </div>

        {/* Channels (Online only) */}
        {type === 'online' && (
          <div className={styles.section}>
            <div className={styles.sectionIcon}>
              <FontAwesomeIcon icon={faGlobe} />
            </div>
            <div className={styles.sectionContent}>
              <h3 className={styles.sectionTitle}>Channel Distribution</h3>
              <p className={styles.sectionValue}>
                {configuredProducts} of {products.length} products configured
              </p>
              <div className={styles.channelList}>
                {channels
                  .filter(c => selectedChannels.includes(c.id))
                  .map(channel => (
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
    </div>
  );
}
