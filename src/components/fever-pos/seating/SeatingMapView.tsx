/**
 * Main container component for the seating map view.
 * Combines the category filter sidebar, seating chart, and selection modal.
 */

import { useState, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faXmark } from '@fortawesome/free-solid-svg-icons';
import type { SeatingConfig, CartItemData } from '../../../data/feverPosData';
import type { SeatInfo, SeatingChartCallbacks } from './types';
import { MockSeatingChart } from './MockSeatingChart';
import { SeatCategoryFilter } from './SeatCategoryFilter';
import { SeatSelectionModal, type TicketType } from './SeatSelectionModal';
import styles from './SeatingMapView.module.css';

interface SeatingMapViewProps {
  seatingConfig: SeatingConfig;
  onAddToCart: (item: Omit<CartItemData, 'id'>) => void;
  /** Called when a seat is deselected on the map, to remove it from the cart */
  onRemoveSeatedTicket?: (seatId: string) => void;
  eventId: string;
  /** Label for the selected timeslot (e.g., "Sat, Mar 21, 7:30 PM") */
  timeslotLabel?: string;
  /** Called when the calendar button is clicked to open timeslot selector */
  onCalendarClick?: () => void;
  /** Called when the timeslot clear button is clicked */
  onClearTimeslot?: () => void;
  /** When true, disables hover effects (for touch devices like iMin) */
  isDevicePreview?: boolean;
}

export function SeatingMapView({
  seatingConfig,
  onAddToCart,
  onRemoveSeatedTicket,
  eventId: _eventId,
  timeslotLabel,
  onCalendarClick,
  onClearTimeslot,
  isDevicePreview = false,
}: SeatingMapViewProps) {
  // Reserved for future use (e.g., fetching seat availability per event)
  void _eventId;
  const { tiers } = seatingConfig;
  const hasTimeslot = Boolean(timeslotLabel);

  // Selected seats state
  const [selectedSeats, setSelectedSeats] = useState<SeatInfo[]>([]);
  
  // Visible tier IDs for filtering (empty = all visible)
  const [visibleTierIds, setVisibleTierIds] = useState<string[]>([]);
  
  // Seat pending ticket type selection
  const [pendingSeat, setPendingSeat] = useState<SeatInfo | null>(null);

  // Get tier by ID
  const getTier = useCallback((tierId: string) => {
    return tiers.find(t => t.id === tierId);
  }, [tiers]);

  // Toggle tier visibility
  const handleToggleTier = useCallback((tierId: string) => {
    setVisibleTierIds(prev => {
      // If all are visible (empty array), switch to showing only this tier
      if (prev.length === 0) {
        return [tierId];
      }
      
      // If this tier is visible, hide it
      if (prev.includes(tierId)) {
        const next = prev.filter(id => id !== tierId);
        // If we're hiding the last one, show all
        return next.length === 0 ? [] : next;
      }
      
      // Otherwise, show this tier too
      const next = [...prev, tierId];
      // If all tiers are now visible, reset to empty (show all)
      return next.length === tiers.length ? [] : next;
    });
  }, [tiers.length]);

  // Show all tiers
  const handleShowAllTiers = useCallback(() => {
    setVisibleTierIds([]);
  }, []);

  // Clear all selected seats
  const handleClearSelection = useCallback(() => {
    setSelectedSeats([]);
  }, []);

  // Seating chart callbacks
  const chartCallbacks: SeatingChartCallbacks = useMemo(() => ({
    onSeatSelected: (seat: SeatInfo) => {
      setPendingSeat(seat);
    },
    onSeatDeselected: (seatId: string) => {
      setSelectedSeats(prev => prev.filter(s => s.id !== seatId));
      onRemoveSeatedTicket?.(seatId);
    },
    onClearSelection: handleClearSelection,
  }), [handleClearSelection, onRemoveSeatedTicket]);

  // Handle ticket type selection from modal
  const handleSelectTicket = useCallback((seat: SeatInfo, ticketType: TicketType) => {
    const tier = getTier(seat.tierId);
    if (!tier) return;

    const isAdult = ticketType === 'adult';
    const price = isAdult ? tier.adultPrice : tier.childPrice;
    const fee = isAdult ? tier.adultFee : tier.childFee;
    const ticketName = isAdult
      ? tier.name.replace('General Admission', 'General Admission Adult')
      : tier.name.replace('General Admission', 'General Admission Child');

    onAddToCart({
      productId: `seated-${seat.tierId}-${ticketType}`,
      name: ticketName,
      price,
      quantity: 1,
      bookingFee: fee,
      seatTier: tier.name,
      seatInfoList: [{
        seatId: seat.id,
        section: seat.section,
        row: seat.row,
        seat: seat.seat,
      }],
    });

    setSelectedSeats(prev => [...prev, seat]);
    setPendingSeat(null);
  }, [getTier, onAddToCart]);

  // Cancel ticket selection
  const handleCancelSelection = useCallback(() => {
    setPendingSeat(null);
  }, []);

  // Get tier for pending seat
  const pendingSeatTier = pendingSeat ? getTier(pendingSeat.tierId) : null;

  return (
    <div className={styles.container}>
      {/* Category filter sidebar */}
      <SeatCategoryFilter
        tiers={tiers}
        visibleTierIds={visibleTierIds}
        onToggleTier={handleToggleTier}
        onShowAllTiers={handleShowAllTiers}
        selectedSeatCount={selectedSeats.length}
        onClearSelection={handleClearSelection}
      />

      {/* Main content area with timeslot header and chart */}
      <div className={styles.mainContent}>
        {/* Timeslot selector header */}
        <div className={styles.timeslotHeader}>
          <div className={styles.timeslotSpacer} />
          {onCalendarClick && (
            hasTimeslot ? (
              <div className={styles.timeslotPill} role="button" tabIndex={0} onClick={onCalendarClick}>
                <FontAwesomeIcon icon={faCalendar} className={styles.timeslotPillIcon} />
                <span className={styles.timeslotPillLabel}>{timeslotLabel}</span>
                <button
                  type="button"
                  className={styles.timeslotPillClose}
                  aria-label="Clear timeslot"
                  onClick={(e) => { e.stopPropagation(); onClearTimeslot?.(); }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            ) : (
              <button
                className={styles.calendarButton}
                onClick={onCalendarClick}
                type="button"
                aria-label="Select date and time"
              >
                <FontAwesomeIcon icon={faCalendar} />
              </button>
            )
          )}
        </div>

        {/* Seating chart with modal overlay */}
        <div className={styles.chartContainer}>
          <MockSeatingChart
            tiers={tiers}
            selectedSeats={selectedSeats}
            visibleTierIds={visibleTierIds}
            callbacks={chartCallbacks}
            disableHover={isDevicePreview}
          />

          {/* Ticket selection modal - positioned within chart area */}
          {pendingSeat && pendingSeatTier && (
            <SeatSelectionModal
              seat={pendingSeat}
              tier={pendingSeatTier}
              onSelectTicket={handleSelectTicket}
              onCancel={handleCancelSelection}
            />
          )}
        </div>
      </div>
    </div>
  );
}
