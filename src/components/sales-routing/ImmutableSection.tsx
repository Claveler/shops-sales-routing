import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faStore, faGlobe, faCalendar, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import type { RoutingType, Event } from '../../data/mockData';
import styles from './ImmutableSection.module.css';

interface ImmutableSectionProps {
  type: RoutingType;
  event: Event;
}

export function ImmutableSection({ type, event }: ImmutableSectionProps) {
  const typeConfig = {
    onsite: { icon: faStore, label: 'Onsite', description: 'Physical event location sales' },
    online: { icon: faGlobe, label: 'Online', description: 'Digital channel distribution' }
  };

  const typeInfo = typeConfig[type];

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
          <span className={styles.fieldLabel}>Routing Type</span>
          <div className={styles.fieldValue}>
            <div className={styles.typeDisplay}>
              <div className={styles.typeIcon}>
                <FontAwesomeIcon icon={typeInfo.icon} />
              </div>
              <div className={styles.typeInfo}>
                <span className={styles.typeName}>{typeInfo.label}</span>
                <span className={styles.typeDescription}>{typeInfo.description}</span>
              </div>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}
