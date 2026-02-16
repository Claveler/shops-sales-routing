/**
 * Sidebar component for filtering seating chart by price tier.
 * Shows checkboxes for each tier with color indicators and price ranges.
 */

import { useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faCheck, faMagnifyingGlassPlus, faMagnifyingGlassMinus } from '@fortawesome/free-solid-svg-icons';
import type { SeatingTier } from '../../../data/feverPosData';
import styles from './SeatCategoryFilter.module.css';

interface SeatCategoryFilterProps {
  tiers: SeatingTier[];
  visibleTierIds: string[];
  onToggleTier: (tierId: string) => void;
  onShowAllTiers: () => void;
  selectedSeatCount: number;
  onClearSelection: () => void;
}

export function SeatCategoryFilter({
  tiers,
  visibleTierIds,
  onToggleTier,
  onShowAllTiers: _onShowAllTiers,
  selectedSeatCount,
  onClearSelection,
}: SeatCategoryFilterProps) {
  // Reserved for future use
  void _onShowAllTiers;

  const handleTierClick = useCallback((tierId: string) => {
    onToggleTier(tierId);
  }, [onToggleTier]);

  const isTierVisible = useCallback((tierId: string): boolean => {
    return visibleTierIds.length === 0 || visibleTierIds.includes(tierId);
  }, [visibleTierIds]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.assignedLabel}>Assigned seats</span>
          <span className={styles.assignedCount}>{selectedSeatCount}</span>
        </div>
        {selectedSeatCount > 0 && (
          <button
            className={styles.clearButton}
            onClick={onClearSelection}
            type="button"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Filter info */}
      <div className={styles.filterInfo}>
        <button className={styles.infoButton} type="button">
          <FontAwesomeIcon icon={faCircleInfo} />
        </button>
        <span className={styles.filterLabel}>Click to filter categories</span>
      </div>

      {/* Tier list */}
      <div className={styles.tierList}>
        {tiers.map((tier) => {
          const isVisible = isTierVisible(tier.id);

          return (
            <button
              key={tier.id}
              className={`${styles.tierItem} ${isVisible ? styles.tierItemActive : ''}`}
              onClick={() => handleTierClick(tier.id)}
              type="button"
            >
              <span
                className={styles.tierDot}
                style={{ backgroundColor: tier.color }}
              />
              <div className={styles.tierInfo}>
                <span className={styles.tierName}>{tier.name}</span>
                <span className={styles.tierPrice}>{tier.priceRange}</span>
              </div>
              <span className={`${styles.tierCheck} ${isVisible ? styles.tierCheckVisible : ''}`}>
                <FontAwesomeIcon icon={faCheck} />
              </span>
            </button>
          );
        })}
      </div>

      {/* Zoom controls (decorative for now) */}
      <div className={styles.zoomControls}>
        <button className={styles.zoomButton} type="button" disabled>
          <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
        </button>
        <button className={styles.zoomButton} type="button" disabled>
          <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
        </button>
      </div>
    </div>
  );
}
