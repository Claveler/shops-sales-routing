import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faBuildingColumns,
  faCalendarDay,
  faCheck,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import type { EventTimeslot } from '../../data/feverPosData';
import {
  getAvailableDatesForEvent,
  getDateAvailabilityMap,
  getTimeslotsForDate,
  groupTimeslotsByTimeOfDay,
  formatTimeslotTime,
  formatDatePill,
  formatDateLong,
} from '../../data/feverPosData';
import { MiniCalendar } from './MiniCalendar';
import styles from './TimeslotModal.module.css';

interface TimeslotModalProps {
  isOpen: boolean;
  eventId: string;
  eventName: string;
  eventVenue: string;
  eventCity: string;
  eventImageUrl?: string;
  /** Currently confirmed timeslot (if any) */
  selectedTimeslot?: EventTimeslot | null;
  onConfirm: (timeslot: EventTimeslot) => void;
  onClose: () => void;
}

const MAX_VISIBLE_PILLS = 5;

const AVAILABILITY_LABELS: Record<string, string> = {
  available: 'Available',
  filling: 'Filling up',
  low: 'Almost gone',
  sold_out: 'Sold out',
};

const AVAILABILITY_CLASS: Record<string, string> = {
  available: styles.availabilityAvailable,
  filling: styles.availabilityFilling,
  low: styles.availabilityLow,
  sold_out: styles.availabilitySoldOut,
};

export function TimeslotModal({
  isOpen,
  eventId,
  eventName,
  eventVenue,
  eventCity,
  eventImageUrl,
  selectedTimeslot,
  onConfirm,
  onClose,
}: TimeslotModalProps) {
  // All dates with sessions for this event
  const availableDates = useMemo(
    () => getAvailableDatesForEvent(eventId),
    [eventId],
  );

  // Per-date availability level (best across timeslots)
  const dateAvailability = useMemo(
    () => getDateAvailabilityMap(eventId),
    [eventId],
  );

  // Active date in the pill strip
  const [activeDate, setActiveDate] = useState<string>('');

  // Pending slot selection within the modal (not yet confirmed)
  const [pendingSlotId, setPendingSlotId] = useState<string | null>(null);

  // Calendar view toggle
  const [showCalendar, setShowCalendar] = useState(false);
  const dateStripRef = useRef<HTMLDivElement>(null);
  const timeslotSectionRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens or event changes
  useEffect(() => {
    if (!isOpen) return;

    setShowCalendar(false);

    // Pre-select the date of the currently confirmed timeslot, or the first available date
    if (selectedTimeslot && availableDates.includes(selectedTimeslot.date)) {
      setActiveDate(selectedTimeslot.date);
      setPendingSlotId(selectedTimeslot.id);
    } else {
      setActiveDate(availableDates[0] ?? '');
      setPendingSlotId(null);
    }
  }, [isOpen, eventId, availableDates, selectedTimeslot]);

  // Timeslots for the active date, grouped by time-of-day
  const slotsForDate = useMemo(
    () => getTimeslotsForDate(eventId, activeDate),
    [eventId, activeDate],
  );

  const groups = useMemo(
    () => groupTimeslotsByTimeOfDay(slotsForDate),
    [slotsForDate],
  );

  // Show at most MAX_VISIBLE_PILLS in the strip; always include activeDate if it falls outside the window
  const hasMoreDates = availableDates.length > MAX_VISIBLE_PILLS;
  const visibleDates = useMemo(() => {
    if (!hasMoreDates) return availableDates;
    const first = availableDates.slice(0, MAX_VISIBLE_PILLS);
    if (activeDate && !first.includes(activeDate) && availableDates.includes(activeDate)) {
      first[MAX_VISIBLE_PILLS - 1] = activeDate;
    }
    return first;
  }, [availableDates, hasMoreDates, activeDate]);

  const handleDateClick = useCallback((date: string) => {
    setActiveDate(date);
    // Keep pending selection only if it belongs to the new date
    setPendingSlotId((prev) => {
      if (!prev) return null;
      const stillValid = getTimeslotsForDate(eventId, date).some((ts) => ts.id === prev);
      return stillValid ? prev : null;
    });
  }, [eventId]);

  const scrollStripToDate = useCallback((date: string) => {
    if (!dateStripRef.current) return;
    const pill = dateStripRef.current.querySelector(`[data-date="${date}"]`) as HTMLElement | null;
    if (pill) {
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, []);

  const handleCalendarSelect = useCallback((date: string) => {
    handleDateClick(date);
    requestAnimationFrame(() => {
      timeslotSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, [handleDateClick]);

  const handleSlotClick = useCallback((slot: EventTimeslot) => {
    if (slot.availability === 'sold_out') return;
    setPendingSlotId(slot.id);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!pendingSlotId) return;
    const slot = slotsForDate.find((ts) => ts.id === pendingSlotId);
    if (slot) onConfirm(slot);
  }, [pendingSlotId, slotsForDate, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Select date and time"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Select date &amp; time</h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close timeslot selector"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.divider} />

        {/* Event context banner */}
        <div className={styles.eventBanner}>
          {eventImageUrl && (
            <img
              src={eventImageUrl}
              alt={eventName}
              className={styles.eventThumbnail}
            />
          )}
          <div className={styles.eventInfo}>
            <p className={styles.eventName}>{eventName}</p>
            <p className={styles.eventVenue}>
              <FontAwesomeIcon icon={faBuildingColumns} className={styles.venueIcon} />
              <span>{eventVenue}, {eventCity}</span>
            </p>
          </div>
        </div>

        {/* Scrollable content */}
        <div className={styles.content}>
          {availableDates.length === 0 ? (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faCalendarDay} className={styles.emptyIcon} />
              <p className={styles.emptyText}>No sessions available for this event.</p>
            </div>
          ) : (
            <>
              {/* Date selection: pill strip or calendar */}
              <div className={styles.dateSection}>
                {showCalendar ? (
                  <button
                    type="button"
                    className={styles.dateSectionBack}
                    onClick={() => {
                      setShowCalendar(false);
                      requestAnimationFrame(() => scrollStripToDate(activeDate));
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className={styles.dateSectionBackIcon} />
                    Select a date
                  </button>
                ) : (
                  <p className={styles.dateSectionLabel}>Select a date</p>
                )}

                {showCalendar ? (
                  <MiniCalendar
                    availableDates={availableDates}
                    dateAvailability={dateAvailability}
                    activeDate={activeDate}
                    confirmedDate={selectedTimeslot?.date}
                    onSelectDate={handleCalendarSelect}
                  />
                ) : (
                  <>
                    <div className={styles.dateStrip} ref={dateStripRef}>
                      {visibleDates.map((date) => {
                        const isSelected = date === activeDate;
                        const isConfirmedDate = selectedTimeslot?.date === date;
                        const pillLabel = formatDatePill(date);
                        const parts = pillLabel.split(' ');
                        const dayName = parts[0];
                        const dayNum = parts[1];

                        return (
                          <button
                            key={date}
                            type="button"
                            data-date={date}
                            className={`${styles.datePill} ${isSelected ? styles.datePillSelected : ''}`}
                            onClick={() => handleDateClick(date)}
                            aria-pressed={isSelected}
                            title={formatDateLong(date)}
                          >
                            <span className={styles.datePillDay}>{dayName}</span>
                            <span className={styles.datePillDate}>{dayNum}</span>
                            {isConfirmedDate && !isSelected && (
                              <FontAwesomeIcon icon={faCheck} className={styles.datePillCheck} />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className={styles.moreDatesLink}
                      onClick={() => setShowCalendar(true)}
                    >
                      More dates
                    </button>
                  </>
                )}
              </div>

              {/* Timeslot groups */}
              <div className={styles.timeslotSection} ref={timeslotSectionRef}>
                {activeDate && (
                  <p className={styles.dateSectionLabel}>{formatDateLong(activeDate)}</p>
                )}

                {groups.map((group) => (
                  <div key={group.timeOfDay} className={styles.timeslotGroup}>
                    <p className={styles.groupLabel}>{group.label}</p>
                    <div className={styles.slotGrid}>
                      {group.slots.map((slot) => {
                        const isSoldOut = slot.availability === 'sold_out';
                        const isPending = pendingSlotId === slot.id;
                        const isCurrentlyConfirmed = selectedTimeslot?.id === slot.id;

                        const cardClasses = [
                          styles.slotCard,
                          isPending ? styles.slotCardSelected : '',
                          isSoldOut ? styles.slotCardSoldOut : '',
                        ].filter(Boolean).join(' ');

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            className={cardClasses}
                            onClick={() => handleSlotClick(slot)}
                            disabled={isSoldOut}
                            aria-pressed={isPending}
                          >
                            <span className={styles.slotTime}>
                              {formatTimeslotTime(slot.startTime)}
                            </span>
                            <span className={`${styles.availabilityBadge} ${AVAILABILITY_CLASS[slot.availability]}`}>
                              <span className={styles.availabilityDot} />
                              {AVAILABILITY_LABELS[slot.availability]}
                              {(slot.availability === 'filling' || slot.availability === 'low') && (
                                <span className={styles.availabilityCount}>
                                  &mdash; {slot.capacity - slot.sold} left
                                </span>
                              )}
                            </span>
                            {isCurrentlyConfirmed && (
                              <span className={styles.currentBadge}>
                                <FontAwesomeIcon icon={faCheck} className={styles.currentBadgeIcon} />
                                Selected
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer with confirm */}
        {availableDates.length > 0 && (
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.confirmButton}
              disabled={!pendingSlotId}
              onClick={handleConfirm}
            >
              Confirm selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
