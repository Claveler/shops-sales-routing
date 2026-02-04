import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faCalendar, faMapMarkerAlt, faBox, faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { getWarehouseById } from '../../data/mockData';
import { useDemo } from '../../context/DemoContext';
import type { Event } from '../../data/mockData';
import styles from './ImmutableSection.module.css';

interface ImmutableSectionProps {
  warehouseIds: string[];
  event: Event;
}

export function ImmutableSection({ warehouseIds, event }: ImmutableSectionProps) {
  const demo = useDemo();
  const demoWarehouses = demo.getWarehouses();

  // Helper to get warehouse by ID - check demo context first
  const getWarehouse = (id: string) => {
    const demoWarehouse = demoWarehouses.find(w => w.id === id);
    return demoWarehouse || getWarehouseById(id);
  };

  const warehouses = warehouseIds.map(id => getWarehouse(id)).filter(Boolean);

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3 className={styles.title}>Configuration</h3>
          <p className={styles.subtitle}>
            These settings were defined when this routing was created and cannot be modified.
          </p>
        </div>
        <div className={styles.lockBadge} title="To change these settings, create a new sales routing and delete this one.">
          <FontAwesomeIcon icon={faLock} />
          <span>Locked</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Event</span>
          <div className={styles.fieldValue}>
            <div className={styles.eventDisplay}>
              <span className={styles.eventName}>{event.name}</span>
              <div className={styles.eventMeta}>
                <span className={styles.eventDetail}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.metaIcon} />
                  {event.venue}, {event.city}
                </span>
                <span className={styles.eventDetail}>
                  <FontAwesomeIcon icon={faCalendar} className={styles.metaIcon} />
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Warehouses</span>
          <div className={styles.fieldValue}>
            <div className={styles.typeDisplay}>
              <div className={styles.typeIcon}>
                <FontAwesomeIcon icon={faWarehouse} />
              </div>
              <div className={styles.typeInfo}>
                <div className={styles.warehouseList}>
                  {warehouses.map(warehouse => (
                    <span key={warehouse!.id} className={styles.warehouseBadge}>
                      <FontAwesomeIcon icon={faBox} />
                      {warehouse!.name}
                    </span>
                  ))}
                </div>
                <span className={styles.typeDescription}>
                  Stock will be pulled from {warehouses.length === 1 ? 'this warehouse' : 'these warehouses'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
