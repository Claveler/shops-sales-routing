import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCalendar, faMapMarkerAlt, faCheck, faMagicWandSparkles, faLock } from '@fortawesome/free-solid-svg-icons';
import { useDemo } from '../../context/DemoContext';
import { events } from '../../data/mockData';
import styles from './EventSelector.module.css';

// Demo event IDs for the demo flow (3 routings with different channel configurations)
const DEMO_EVENT_1_ID = 'evt-001'; // Candlelight: Tribute to Taylor Swift - Onsite + Online
const DEMO_EVENT_2_ID = 'evt-002'; // Van Gogh: The Immersive Experience - Onsite only
const DEMO_EVENT_3_ID = 'evt-003'; // Candlelight: Best of Hans Zimmer - Online only

interface EventSelectorProps {
  value: string | null;
  onChange: (eventId: string) => void;
}

export function EventSelector({ value, onChange }: EventSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const demo = useDemo();

  // Get events that already have a routing (1:1 constraint)
  const existingRoutings = demo.getSalesRoutings();
  const usedEventIds = useMemo(() => 
    existingRoutings.map(r => r.eventId),
    [existingRoutings]
  );

  // Select suggested picks the next available demo event
  const handleFillDemoData = () => {
    if (!usedEventIds.includes(DEMO_EVENT_1_ID)) {
      onChange(DEMO_EVENT_1_ID);
    } else if (!usedEventIds.includes(DEMO_EVENT_2_ID)) {
      onChange(DEMO_EVENT_2_ID);
    } else if (!usedEventIds.includes(DEMO_EVENT_3_ID)) {
      onChange(DEMO_EVENT_3_ID);
    }
  };

  // Check if there's a suggested event available
  const hasSuggestedAvailable = 
    !usedEventIds.includes(DEMO_EVENT_1_ID) || 
    !usedEventIds.includes(DEMO_EVENT_2_ID) || 
    !usedEventIds.includes(DEMO_EVENT_3_ID);

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
        {demo.isResetMode && hasSuggestedAvailable && (
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
        {filteredEvents.map((event) => {
          const isDisabled = usedEventIds.includes(event.id);
          const isSelected = value === event.id;

          return (
            <button
              key={event.id}
              className={`${styles.eventItem} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
              onClick={() => !isDisabled && onChange(event.id)}
              disabled={isDisabled}
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
              {isDisabled ? (
                <span className={styles.disabledBadge}>
                  <FontAwesomeIcon icon={faLock} />
                  Already has routing
                </span>
              ) : (
                <div className={styles.checkIndicator}>
                  {isSelected && <FontAwesomeIcon icon={faCheck} />}
                </div>
              )}
            </button>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className={styles.emptyState}>
            <p>No events found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
