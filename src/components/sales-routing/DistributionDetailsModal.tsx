import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCashRegister, faGlobe, faDesktop, faStore, faExternalLinkAlt, faStar, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  getEventById, 
  getWarehouseById, 
  channels, 
  isBoxOfficeChannel,
  type SalesRouting 
} from '../../data/mockData';
import styles from './DistributionDetailsModal.module.css';

interface DistributionDetailsModalProps {
  routing: SalesRouting;
  onClose: () => void;
  // Optional: pass in warehouses from demo context
  getWarehouse?: (id: string) => ReturnType<typeof getWarehouseById>;
}

const channelTypeIcons: Record<string, typeof faGlobe> = {
  onsite: faCashRegister,
  marketplace: faGlobe,
  whitelabel: faDesktop,
  kiosk: faStore,
  ota: faExternalLinkAlt
};

export function DistributionDetailsModal({ 
  routing, 
  onClose,
  getWarehouse: getWarehouseOverride
}: DistributionDetailsModalProps) {
  const event = getEventById(routing.eventId);
  
  const getWarehouse = (id: string) => {
    if (getWarehouseOverride) {
      return getWarehouseOverride(id);
    }
    return getWarehouseById(id);
  };

  // Separate Box Office and online channels
  const boxOfficeChannel = routing.channelIds.find(id => isBoxOfficeChannel(id));
  const onlineChannelIds = routing.channelIds.filter(id => !isBoxOfficeChannel(id));
  
  // Get online channel objects with their mapped warehouses
  const onlineChannelMappings = onlineChannelIds.map(channelId => {
    const channel = channels.find(c => c.id === channelId);
    const warehouseId = routing.channelWarehouseMapping[channelId];
    const warehouse = warehouseId ? getWarehouse(warehouseId) : null;
    return { channel, warehouse };
  }).filter(item => item.channel);

  // Get warehouses for Box Office
  const boxOfficeWarehouses = routing.warehouseIds.map(id => getWarehouse(id)).filter(Boolean);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>Distribution Details</h2>
          {event && (
            <div className={styles.eventInfo}>
              <span className={styles.eventName}>{event.name}</span>
              <span className={styles.eventVenue}>{event.venue}</span>
            </div>
          )}
        </div>

        <div className={styles.content}>
          {/* Box Office Section */}
          {boxOfficeChannel && boxOfficeWarehouses.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <FontAwesomeIcon icon={faCashRegister} className={styles.sectionIcon} />
                <span className={styles.sectionTitle}>Box Office</span>
                <Badge variant="secondary" size="sm">
                  {boxOfficeWarehouses.length} warehouse{boxOfficeWarehouses.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className={styles.sectionContent}>
                <p className={styles.sectionDescription}>
                  Warehouse selection configured per POS device in Box Office Setup
                </p>
                <div className={styles.warehouseList}>
                  {boxOfficeWarehouses.map(warehouse => (
                    <div key={warehouse?.id} className={styles.warehouseItem}>
                      <span className={styles.warehouseName}>{warehouse?.name}</span>
                      {routing.priceReferenceWarehouseId === warehouse?.id && (
                        <span className={styles.priceRef}>
                          <FontAwesomeIcon icon={faStar} />
                          Price Reference
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Online Channels Section */}
          {onlineChannelMappings.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <FontAwesomeIcon icon={faGlobe} className={styles.sectionIcon} />
                <span className={styles.sectionTitle}>Online Channels</span>
                <Badge variant="secondary" size="sm">
                  {onlineChannelMappings.length} channel{onlineChannelMappings.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className={styles.sectionContent}>
                <div className={styles.channelMappingList}>
                  {onlineChannelMappings.map(({ channel, warehouse }) => (
                    <div key={channel?.id} className={styles.channelMappingItem}>
                      <div className={styles.channelInfo}>
                        <FontAwesomeIcon 
                          icon={channelTypeIcons[channel?.type || 'marketplace']} 
                          className={styles.channelIcon}
                        />
                        <span className={styles.channelName}>{channel?.name}</span>
                      </div>
                      <FontAwesomeIcon icon={faArrowRight} className={styles.arrow} />
                      <span className={styles.warehouseTarget}>
                        {warehouse?.name || 'Not configured'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
