import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCalendar, faMapMarkerAlt, faCheck } from '@fortawesome/free-solid-svg-icons';
import { events } from '../../data/mockData';
import styles from './EventSelector.module.css';

interface EventSelectorProps {
  value: string | null;
  onChange: (eventId: string) => void;
}

export function EventSelector({ value, onChange }: EventSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

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
      <h2 className={styles.title}>Select event</h2>
      <p className={styles.subtitle}>Choose the event where products will be available</p>

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
