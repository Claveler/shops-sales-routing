import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCalendar, faMapMarkerAlt, faCheck, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { useDemo } from '../../context/DemoContext';
import { events } from '../../data/mockData';
import type { RoutingType } from '../../data/mockData';
import styles from './EventSelector.module.css';

// Demo event IDs for different routing types
const DEMO_ONSITE_EVENT_ID = 'evt-001'; // Candlelight: Tribute to Taylor Swift
const DEMO_ONLINE_EVENT_ID = 'evt-002'; // Van Gogh: The Immersive Experience

interface EventSelectorProps {
  value: string | null;
  onChange: (eventId: string) => void;
  routingType?: RoutingType | null;
}

export function EventSelector({ value, onChange, routingType }: EventSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const demo = useDemo();

  const handleFillDemoData = () => {
    const eventId = routingType === 'online' ? DEMO_ONLINE_EVENT_ID : DEMO_ONSITE_EVENT_ID;
    onChange(eventId);
  };

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(event => 
      event.name.toLowerCase().includes(query) ||
      event.venue.toLowerCase().includes(query) ||
      event.city.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Select event</h2>
          <p className={styles.subtitle}>Choose the event where products will be available</p>
        </div>
        {demo.isResetMode && (
          <button className={styles.fillDemoBtn} onClick={handleFillDemoData}>
            <FontAwesomeIcon icon={faMagicWandSparkles} />
            Select suggested
          </button>
        )}
      </div>

      <div className={styles.searchWrapper}>
        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search events by name, venue, or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.eventList}>
        {filteredEvents.map((event) => (
          <button
            key={event.id}
            className={`${styles.eventItem} ${value === event.id ? styles.selected : ''}`}
            onClick={() => onChange(event.id)}
          >
            <div className={styles.eventContent}>
              <h3 className={styles.eventName}>{event.name}</h3>
              <div className={styles.eventMeta}>
                <span className={styles.metaItem}>
                  <FontAwesomeIcon icon={faCalendar} />
                  {formatDate(event.date)}
                </span>
                <span className={styles.metaItem}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  {event.venue}, {event.city}
                </span>
              </div>
            </div>
            <div className={styles.checkIndicator}>
              {value === event.id && <FontAwesomeIcon icon={faCheck} />}
            </div>
          </button>
        ))}

        {filteredEvents.length === 0 && (
          <div className={styles.emptyState}>
            <p>No events found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
