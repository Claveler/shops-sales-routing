/**
 * Modal for selecting ticket type (Adult/Child) when a seat is clicked.
 * Displays seat information and available ticket options with pricing.
 */

import { useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import type { SeatingTier } from '../../../data/feverPosData';
import type { SeatInfo } from './types';
import styles from './SeatSelectionModal.module.css';

export type TicketType = 'adult' | 'child';

interface SeatSelectionModalProps {
  seat: SeatInfo;
  tier: SeatingTier;
  onSelectTicket: (seat: SeatInfo, ticketType: TicketType) => void;
  onCancel: () => void;
}

export function SeatSelectionModal({
  seat,
  tier,
  onSelectTicket,
  onCancel,
}: SeatSelectionModalProps) {
  const handleSelectAdult = useCallback(() => {
    onSelectTicket(seat, 'adult');
  }, [seat, onSelectTicket]);

  const handleSelectChild = useCallback(() => {
    onSelectTicket(seat, 'child');
  }, [seat, onSelectTicket]);

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        {/* Header with seat info */}
        <div className={styles.header}>
          <div className={styles.headerRow}>
            <span className={styles.sectionLabel}>SECTION</span>
            <span className={styles.sectionName}>{seat.section}</span>
            <span className={styles.rowSeatBox}>{seat.row}</span>
            <span className={styles.rowSeatBox}>{seat.seat}</span>
          </div>
        </div>

        {/* Tier name */}
        <div className={styles.tierName} style={{ color: tier.color }}>
          {tier.name}
        </div>

        {/* Ticket options */}
        <div className={styles.ticketOptions}>
          {/* Adult ticket */}
          <button
            className={styles.ticketOption}
            onClick={handleSelectAdult}
            type="button"
          >
            <span className={styles.ticketName}>
              {tier.name.replace('General Admission', 'General Admission Adult')}
            </span>
            <div className={styles.ticketPricing}>
              <span className={styles.ticketPrice}>${tier.adultPrice.toFixed(2)}</span>
              <span className={styles.ticketFee}>+ ${tier.adultFee.toFixed(2)} fee</span>
            </div>
          </button>

          {/* Child ticket */}
          <button
            className={styles.ticketOption}
            onClick={handleSelectChild}
            type="button"
          >
            <span className={styles.ticketName}>
              {tier.name.replace('General Admission', 'General Admission Child')}
            </span>
            <div className={styles.ticketPricing}>
              <span className={styles.ticketPrice}>${tier.childPrice.toFixed(2)}</span>
              <span className={styles.ticketFee}>+ ${tier.childFee.toFixed(2)} fee</span>
            </div>
          </button>
        </div>

        {/* Cancel button */}
        <button
          className={styles.cancelButton}
          onClick={onCancel}
          type="button"
        >
          <FontAwesomeIcon icon={faXmark} />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}
