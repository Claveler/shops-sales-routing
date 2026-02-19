import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faCalendarDay,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import type { EventTimeslot, AvailabilityLevel } from '../../data/feverPosData';
import {
  getAvailableDatesForEvent,
  getDateAvailabilityMap,
  getTimeslotsForDate,
  groupTimeslotsByTimeOfDay,
  formatTimeslotTime,
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
  selectedTimeslot?: EventTimeslot | null;
  onConfirm: (timeslot: EventTimeslot) => void;
  onClose: () => void;
}

const MAX_VISIBLE_PILLS = 5;

function isToday(isoDate: string): boolean {
  const d = new Date(isoDate + 'T12:00:00');
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatPillDayName(isoDate: string): string {
  if (isToday(isoDate)) return 'TODAY';
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
}

function formatPillDate(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  const day = d.getDate();
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  return `${day} ${month}`;
}

function getTodayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

const PILL_BAR_CLASS: Partial<Record<AvailabilityLevel, string>> = {
  filling: styles.pillBarFilling,
  low: styles.pillBarLow,
  sold_out: styles.pillBarSoldOut,
};

export function TimeslotModal({
  isOpen,
  eventId,
  selectedTimeslot,
  onConfirm,
  onClose,
}: TimeslotModalProps) {
  const availableDates = useMemo(
    () => getAvailableDatesForEvent(eventId),
    [eventId],
  );

  const dateAvailability = useMemo(
    () => getDateAvailabilityMap(eventId),
    [eventId],
  );

  const [activeDate, setActiveDate] = useState<string>('');
  const [pendingSlotId, setPendingSlotId] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const dateStripRef = useRef<HTMLDivElement>(null);
  const timeslotSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setShowCalendar(false);
    if (selectedTimeslot && availableDates.includes(selectedTimeslot.date)) {
      setActiveDate(selectedTimeslot.date);
      setPendingSlotId(selectedTimeslot.id);
    } else {
      setActiveDate(availableDates[0] ?? '');
      setPendingSlotId(null);
    }
  }, [isOpen, eventId, availableDates, selectedTimeslot]);

  const slotsForDate = useMemo(
    () => getTimeslotsForDate(eventId, activeDate),
    [eventId, activeDate],
  );

  const groups = useMemo(
    () => groupTimeslotsByTimeOfDay(slotsForDate),
    [slotsForDate],
  );

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
    setShowCalendar(false);
    requestAnimationFrame(() => scrollStripToDate(date));
  }, [handleDateClick, scrollStripToDate]);

  const handleSlotClick = useCallback((slot: EventTimeslot) => {
    if (slot.availability === 'sold_out') return;
    setPendingSlotId(slot.id);
  }, []);

  const handleConfirm = useCallback(() => {
    if (!pendingSlotId) return;
    const slot = slotsForDate.find((ts) => ts.id === pendingSlotId);
    if (slot) onConfirm(slot);
  }, [pendingSlotId, slotsForDate, onConfirm]);

  const handleTodayClick = useCallback(() => {
    const today = getTodayIso();
    const target = availableDates.includes(today)
      ? today
      : availableDates.find((d) => d >= today) ?? availableDates[0];
    if (!target) return;

    handleDateClick(target);
    if (showCalendar) setShowCalendar(false);
    requestAnimationFrame(() => scrollStripToDate(target));
  }, [availableDates, handleDateClick, showCalendar, scrollStripToDate]);

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
          {showCalendar && (
            <button
              type="button"
              className={styles.headerBackButton}
              aria-label="Back to date selection"
              onClick={() => {
                setShowCalendar(false);
                requestAnimationFrame(() => scrollStripToDate(activeDate));
              }}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          )}
          <h2 className={styles.title}>
            {showCalendar ? 'More dates' : 'Select date & time'}
          </h2>
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

        {/* Content */}
        <div className={styles.content}>
          {availableDates.length === 0 ? (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faCalendarDay} className={styles.emptyIcon} />
              <p className={styles.emptyText}>No sessions available for this event.</p>
            </div>
          ) : showCalendar ? (
            <MiniCalendar
              availableDates={availableDates}
              dateAvailability={dateAvailability}
              activeDate={activeDate}
              confirmedDate={selectedTimeslot?.date}
              onSelectDate={handleCalendarSelect}
            />
          ) : (
            <div className={styles.block}>
              {/* Legend */}
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <span className={styles.legendLabelLow}>Low availability</span>
                  <span className={`${styles.legendBar} ${styles.legendBarLow}`} />
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendLabelSoldOut}>Sold out</span>
                  <span className={`${styles.legendBar} ${styles.legendBarSoldOut}`} />
                </div>
              </div>

              {/* Date strip + More dates */}
              <div className={styles.dateStripRow}>
                <div className={styles.dateStrip} ref={dateStripRef}>
                  {visibleDates.map((date) => {
                    const isSelected = date === activeDate;
                    const avail = dateAvailability.get(date);
                    const barClass = avail ? PILL_BAR_CLASS[avail] : undefined;

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
                        <span className={styles.datePillDay}>{formatPillDayName(date)}</span>
                        <span className={styles.datePillDate}>{formatPillDate(date)}</span>
                        {barClass && (
                          <span className={`${styles.pillBar} ${barClass}`} />
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
              </div>

              {/* Divider */}
              <div className={styles.sectionDivider} />

              {/* Timeslot groups */}
              <div className={styles.timeslotSection} ref={timeslotSectionRef}>
                {groups.map((group) => (
                  <div key={group.timeOfDay} className={styles.timeslotGroup}>
                    <p className={styles.groupLabel}>
                      {formatDateLong(activeDate)} - {group.label}
                    </p>
                    <div className={styles.slotGrid}>
                      {group.slots.map((slot) => {
                        const isSoldOut = slot.availability === 'sold_out';
                        const isFilling = slot.availability === 'filling';
                        const isLow = slot.availability === 'low';
                        const isPending = pendingSlotId === slot.id;
                        const remaining = slot.capacity - slot.sold;

                        const cardClasses = [
                          styles.slotCard,
                          isFilling ? styles.slotCardFilling : '',
                          isLow ? styles.slotCardLow : '',
                          isSoldOut ? styles.slotCardSoldOut : '',
                          isPending ? styles.slotCardSelected : '',
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
                            {(isFilling || isLow) && (
                              <span className={`${styles.slotInfo} ${isFilling ? styles.slotInfoFilling : styles.slotInfoLow}`}>
                                <span className={styles.slotInfoDot} />
                                <span className={styles.slotInfoCount}>{remaining} left</span>
                              </span>
                            )}
                            {isSoldOut && (
                              <span className={styles.slotInfoSoldOut}>Sold out</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {availableDates.length > 0 && !showCalendar && (
          <div className={styles.footer}>
            <button
              type="button"
              className={styles.todayButton}
              onClick={handleTodayClick}
            >
              <FontAwesomeIcon icon={faCalendarDay} className={styles.todayButtonIcon} />
              Today
            </button>
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
