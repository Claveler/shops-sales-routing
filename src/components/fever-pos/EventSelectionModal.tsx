import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuildingColumns, faTicket, faXmark } from '@fortawesome/free-solid-svg-icons';

import styles from './EventSelectionModal.module.css';

export interface EventSelectionOption {
  id: string;
  city: string;
  name: string;
  venue: string;
  imageUrl: string;
}

interface EventSelectionModalProps {
  isOpen: boolean;
  cities: string[];
  selectedCity: string;
  events: EventSelectionOption[];
  selectedEventId: string;
  onSelectCity: (city: string) => void;
  onSelectEvent: (eventId: string) => void;
  onClose: () => void;
}

export function EventSelectionModal({
  isOpen,
  cities,
  selectedCity,
  events,
  selectedEventId,
  onSelectCity,
  onSelectEvent,
  onClose,
}: EventSelectionModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Select your event" onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Select your event</h2>
          <button type="button" className={styles.closeButton} aria-label="Close event selector" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.intro}>
            <p className={styles.introTitle}>
              <FontAwesomeIcon icon={faTicket} className={styles.ticketIcon} />
              Let&apos;s start selling tickets!
            </p>
            <p className={styles.introBody}>Which event are you looking to sell today?</p>
          </div>

          <div className={styles.selectorPanel}>
            {cities.length > 1 && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Select the city</h3>
                <div className={styles.cityGrid}>
                  {cities.map((city) => {
                    const isSelected = city === selectedCity;

                    return (
                      <button
                        key={city}
                        type="button"
                        className={`${styles.cityButton} ${isSelected ? styles.cityButtonSelected : ''}`}
                        onClick={() => onSelectCity(city)}
                      >
                        {city}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Select the event and the venue</h3>
              <div className={styles.eventGrid}>
                {events.map((event) => {
                  const isSelected = event.id === selectedEventId;

                  return (
                    <button
                      key={event.id}
                      type="button"
                      className={`${styles.eventCard} ${isSelected ? styles.eventCardSelected : ''}`}
                      onClick={() => onSelectEvent(event.id)}
                    >
                      <img src={event.imageUrl} alt={event.name} className={styles.eventImage} />
                      <div className={styles.eventInfo}>
                        <p className={styles.eventName}>{event.name}</p>
                        <p className={styles.eventVenue}>
                          <FontAwesomeIcon icon={faBuildingColumns} />
                          {event.venue}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
