import { useCallback } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faPenToSquare, faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { useMarquee } from './useMarquee';
import styles from './NavigationTabs.module.css';

export type PosTab = 'tickets' | 'seating' | 'addons' | 'gift-shop';

interface NavigationTabsProps {
  activeTab: PosTab;
  onTabChange: (tab: PosTab) => void;
  eventName?: string;
  eventImageUrl?: string;
  onEditEvent?: () => void;
  /** When true, shows Seating + Add-Ons tabs instead of Tickets & Add-Ons */
  eventHasSeating?: boolean;
}

export function NavigationTabs({
  activeTab,
  onTabChange,
  eventName = 'Candlelight: Tribute to Taylor Swift',
  eventImageUrl,
  onEditEvent,
  eventHasSeating = false,
}: NavigationTabsProps) {
  const {
    viewportRef,
    measureRef,
    isAnimating,
    runKey,
    marqueeStyle,
    replay: replayMarquee,
    handleAnimationEnd,
  } = useMarquee({ text: eventName });

  // The first tab is either 'tickets' (non-seated) or 'seating' (seated)
  const firstTab: PosTab = eventHasSeating ? 'seating' : 'tickets';
  const isFirstTabActive = activeTab === firstTab;

  const handleEventNameClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onTabChange(firstTab);
    replayMarquee();
  }, [onTabChange, replayMarquee, firstTab]);

  const handleEditClick = useCallback((event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    onEditEvent?.();
  }, [onEditEvent]);

  const handleEditKeyDown = useCallback((event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    onEditEvent?.();
  }, [onEditEvent]);

  return (
    <div className={styles.navigation}>
      {/* First tab: Event tab (Seating for seated events, Tickets & Add-Ons for non-seated) */}
      <button
        className={`${styles.tab} ${styles.eventTab} ${styles.firstTab} ${isFirstTabActive ? styles.active : ''}`}
        onClick={() => onTabChange(firstTab)}
        type="button"
      >
        <div className={styles.eventInfo}>
          {eventImageUrl ? (
            <img
              src={eventImageUrl}
              alt={eventName}
              className={styles.eventImage}
              loading="eager"
            />
          ) : (
            <div className={styles.eventImageFallback} aria-hidden="true" />
          )}
          <div
            ref={viewportRef}
            className={styles.eventNameViewport}
            onClick={handleEventNameClick}
          >
            {isAnimating ? (
              <span
                key={runKey}
                className={styles.eventNameAnimated}
                style={marqueeStyle}
                onAnimationEnd={handleAnimationEnd}
              >
                {eventName}
              </span>
            ) : (
              <span className={styles.eventNameStatic}>{eventName}</span>
            )}
            <span ref={measureRef} className={styles.eventNameMeasure} aria-hidden="true">
              {eventName}
            </span>
          </div>
          <span
            className={styles.editButton}
            role="button"
            tabIndex={0}
            aria-label="Change event"
            onClick={handleEditClick}
            onKeyDown={handleEditKeyDown}
          >
            <FontAwesomeIcon icon={faPenToSquare} className={styles.editIcon} />
          </span>
        </div>
      </button>

      {/* Add-Ons tab (only shown for seated events) */}
      {eventHasSeating && (
        <button
          className={`${styles.tab} ${styles.standardTab} ${activeTab === 'addons' ? styles.active : ''}`}
          onClick={() => onTabChange('addons')}
          type="button"
        >
          <FontAwesomeIcon icon={faCartPlus} className={styles.tabIcon} />
          <span className={styles.tabLabel}>Add-Ons</span>
        </button>
      )}

      {/* Merch tab */}
      <button
        className={`${styles.tab} ${styles.standardTab} ${activeTab === 'gift-shop' ? styles.active : ''}`}
        onClick={() => onTabChange('gift-shop')}
        type="button"
      >
        <FontAwesomeIcon icon={faGift} className={styles.tabIcon} />
        <span className={styles.tabLabel}>Merch</span>
      </button>
    </div>
  );
}
