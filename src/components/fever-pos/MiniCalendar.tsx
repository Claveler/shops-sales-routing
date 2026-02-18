import { useState, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './MiniCalendar.module.css';

interface MiniCalendarProps {
  availableDates: string[];
  activeDate: string;
  confirmedDate?: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseIso(iso: string): { year: number; month: number } {
  const d = new Date(iso + 'T12:00:00');
  return { year: d.getFullYear(), month: d.getMonth() };
}

function formatMonthLabel(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
}

export function MiniCalendar({
  availableDates,
  activeDate,
  confirmedDate,
  onSelectDate,
}: MiniCalendarProps) {
  const initial = activeDate ? parseIso(activeDate) : { year: new Date().getFullYear(), month: new Date().getMonth() };
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  // Determine which months have available dates (for the pill toggle)
  const availableMonths = useMemo(() => {
    const months = new Map<string, { year: number; month: number }>();
    for (const d of availableDates) {
      const { year, month } = parseIso(d);
      const key = `${year}-${month}`;
      if (!months.has(key)) months.set(key, { year, month });
    }
    return Array.from(months.values()).sort(
      (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
    );
  }, [availableDates]);

  const handleMonthTab = useCallback((year: number, month: number) => {
    setViewYear(year);
    setViewMonth(month);
  }, []);

  // Build the grid of day cells (Sunday-start week)
  const dayCells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    // getDay() returns 0=Sun, which is our first column
    const startDow = firstOfMonth.getDay();

    const cells: Array<{ day: number; iso: string } | null> = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, iso: toIso(viewYear, viewMonth, d) });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const handleDayClick = useCallback((iso: string) => {
    onSelectDate(iso);
  }, [onSelectDate]);

  return (
    <div className={styles.container}>
      {/* Month pill toggle (Fever B2C style) */}
      <div className={styles.monthToggle}>
        {availableMonths.map(({ year, month }) => {
          const isActive = year === viewYear && month === viewMonth;
          return (
            <button
              key={`${year}-${month}`}
              type="button"
              className={`${styles.monthPill} ${isActive ? styles.monthPillActive : ''}`}
              onClick={() => handleMonthTab(year, month)}
            >
              {formatMonthLabel(year, month)}
            </button>
          );
        })}
      </div>

      <div className={styles.divider} />

      {/* Weekday row */}
      <div className={styles.weekdayRow}>
        {WEEKDAYS.map((wd, i) => (
          <span key={i} className={styles.weekdayCell}>{wd}</span>
        ))}
      </div>

      {/* Day grid */}
      <div className={styles.dayGrid}>
        {dayCells.map((cell, i) => {
          if (!cell) return <span key={`blank-${i}`} className={styles.blankCell} />;

          const hasSession = availableSet.has(cell.iso);
          const isActive = cell.iso === activeDate;
          const isConfirmed = cell.iso === confirmedDate;

          const cellClasses = [
            styles.dayCell,
            hasSession ? styles.dayCellAvailable : styles.dayCellDisabled,
            isActive ? styles.dayCellActive : '',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={cell.iso}
              type="button"
              className={cellClasses}
              disabled={!hasSession}
              onClick={() => handleDayClick(cell.iso)}
              aria-label={`${cell.day}${hasSession ? '' : ' (no sessions)'}`}
              aria-pressed={isActive}
            >
              <span className={styles.dayNumber}>{cell.day}</span>
              {isConfirmed && !isActive && (
                <FontAwesomeIcon icon={faCheck} className={styles.confirmedCheck} />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
