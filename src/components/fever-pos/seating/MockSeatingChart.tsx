/**
 * Mock seating chart component using SVG.
 * Provides a visual representation of a circular amphitheatre venue.
 * Designed to be swappable with seats.io SeatsioSeatingChart.
 */

import { useState, useCallback, useMemo } from 'react';
import type { SeatingChartProps, SeatInfo, MockSeatData } from './types';
import {
  MOCK_SECTIONS,
  MOCK_SEATS,
  getSeatsForSection,
  VENUE_WIDTH,
  VENUE_HEIGHT,
  STAGE_CENTER_X,
  STAGE_CENTER_Y,
  STAGE_RADIUS,
} from './mockVenueData';
import styles from './MockSeatingChart.module.css';

type ViewMode = 'overview' | 'section';

interface HoveredItem {
  type: 'section' | 'seat';
  id: string;
  x: number;
  y: number;
}

interface MockSeatingChartProps extends SeatingChartProps {
  onClearSelection?: () => void;
  showClearSelection?: boolean;
}

export function MockSeatingChart({
  tiers,
  selectedSeats,
  visibleTierIds,
  callbacks,
  disableHover = false,
  onClearSelection,
  showClearSelection = false,
}: MockSeatingChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<HoveredItem | null>(null);

  // Create a tier lookup map
  const tierMap = useMemo(() => {
    const map = new Map<string, typeof tiers[0]>();
    for (const tier of tiers) {
      map.set(tier.id, tier);
    }
    return map;
  }, [tiers]);

  // Get color for a tier
  const getTierColor = useCallback((tierId: string): string => {
    return tierMap.get(tierId)?.color ?? '#CCD2D8';
  }, [tierMap]);

  // Check if a tier is visible
  const isTierVisible = useCallback((tierId: string): boolean => {
    return visibleTierIds.length === 0 || visibleTierIds.includes(tierId);
  }, [visibleTierIds]);

  // Check if a seat is selected
  const isSeatSelected = useCallback((seatId: string): boolean => {
    return selectedSeats.some(s => s.id === seatId);
  }, [selectedSeats]);

  // Handle section click (zoom in)
  const handleSectionClick = useCallback((sectionId: string) => {
    const section = MOCK_SECTIONS.find(s => s.id === sectionId);
    if (!section || !isTierVisible(section.tierId)) return;
    
    setActiveSectionId(sectionId);
    setViewMode('section');
    setHoveredItem(null);
  }, [isTierVisible]);

  // Handle back button (zoom out)
  const handleBackClick = useCallback(() => {
    setViewMode('overview');
    setActiveSectionId(null);
    setHoveredItem(null);
  }, []);

  // Handle seat click
  const handleSeatClick = useCallback((seat: MockSeatData) => {
    const tier = tierMap.get(seat.tierId);
    if (!tier || !isTierVisible(seat.tierId)) return;

    const seatInfo: SeatInfo = {
      id: seat.id,
      section: seat.section,
      row: seat.row,
      seat: seat.seat,
      tierId: seat.tierId,
      tierName: tier.name,
      tierColor: tier.color,
    };

    if (isSeatSelected(seat.id)) {
      callbacks.onSeatDeselected(seat.id);
    } else {
      callbacks.onSeatSelected(seatInfo);
    }
  }, [tierMap, isTierVisible, isSeatSelected, callbacks]);

  // Handle section hover (disabled for touch devices)
  const handleSectionHover = useCallback((sectionId: string, x: number, y: number) => {
    if (disableHover) return;
    setHoveredItem({ type: 'section', id: sectionId, x, y });
  }, [disableHover]);

  // Handle seat hover (disabled for touch devices)
  const handleSeatHover = useCallback((seat: MockSeatData, x: number, y: number) => {
    if (disableHover) return;
    setHoveredItem({ type: 'seat', id: seat.id, x, y });
  }, [disableHover]);

  // Clear hover
  const handleMouseLeave = useCallback(() => {
    if (disableHover) return;
    setHoveredItem(null);
  }, [disableHover]);

  // Get seats for the active section
  const sectionSeats = useMemo(() => {
    if (!activeSectionId) return [];
    return getSeatsForSection(activeSectionId);
  }, [activeSectionId]);

  // Get the active section data
  const activeSection = useMemo(() => {
    return MOCK_SECTIONS.find(s => s.id === activeSectionId);
  }, [activeSectionId]);

  // Render tooltip content (disabled for touch devices)
  const renderTooltip = () => {
    if (disableHover || !hoveredItem) return null;

    if (hoveredItem.type === 'section') {
      const section = MOCK_SECTIONS.find(s => s.id === hoveredItem.id);
      const tier = section ? tierMap.get(section.tierId) : null;
      if (!section || !tier) return null;

      return (
        <div
          className={styles.tooltip}
          style={{ left: hoveredItem.x + 10, top: hoveredItem.y - 10 }}
        >
          <div className={styles.tooltipSection}>{section.name}</div>
          <div className={styles.tooltipTier} style={{ color: tier.color }}>
            {tier.name}
          </div>
          <div className={styles.tooltipPrice}>{tier.priceRange}</div>
        </div>
      );
    }

    // Seat tooltip
    const seat = MOCK_SEATS.find(s => s.id === hoveredItem.id);
    const tier = seat ? tierMap.get(seat.tierId) : null;
    if (!seat || !tier) return null;

    return (
      <div
        className={styles.tooltip}
        style={{ left: hoveredItem.x + 10, top: hoveredItem.y - 10 }}
      >
        <div className={styles.tooltipHeader}>
          <span className={styles.tooltipLabel}>SECTION</span>
          <span className={styles.tooltipSection}>{seat.section}</span>
          <span className={styles.tooltipRowSeat}>{seat.row}</span>
          <span className={styles.tooltipRowSeat}>{seat.seat}</span>
        </div>
        <div className={styles.tooltipFee}>+ ${tier.adultFee.toFixed(2)} fee</div>
        <div className={styles.tooltipTier} style={{ backgroundColor: tier.color }}>
          {tier.name}
        </div>
        <div className={styles.tooltipPrice}>{tier.priceRange}</div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Toolbar row: back button + clear selection on same line */}
      <div className={styles.chartToolbar}>
        {viewMode === 'section' ? (
          <button
            className={styles.backButton}
            onClick={handleBackClick}
            type="button"
          >
            ← Back to overview
          </button>
        ) : (
          <div />
        )}
        {showClearSelection && onClearSelection && (
          <button
            className={styles.clearSelectionButton}
            onClick={onClearSelection}
            type="button"
          >
            Clear selection
          </button>
        )}
      </div>

      <svg
        className={styles.chart}
        viewBox={`0 0 ${VENUE_WIDTH} ${VENUE_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {viewMode === 'overview' ? (
          // Overview mode: show sections
          <>
            {/* Stage */}
            <ellipse
              cx={STAGE_CENTER_X}
              cy={STAGE_CENTER_Y}
              rx={STAGE_RADIUS * 1.5}
              ry={STAGE_RADIUS}
              className={styles.stage}
            />
            <text
              x={STAGE_CENTER_X}
              y={STAGE_CENTER_Y + 5}
              className={styles.stageLabel}
            >
              STAGE
            </text>

            {MOCK_SECTIONS.map((section) => {
              const isVisible = isTierVisible(section.tierId);
              const isHovered = hoveredItem?.id === section.id;

              return (
                <g key={section.id}>
                  <path
                    d={section.path}
                    fill={isVisible ? getTierColor(section.tierId) : '#E5E7EB'}
                    stroke={isHovered && !disableHover ? '#0079CA' : '#FFFFFF'}
                    strokeWidth={isHovered && !disableHover ? 3 : 1.5}
                    className={`${styles.section} ${!isVisible ? styles.sectionDisabled : ''} ${disableHover ? styles.noHover : ''}`}
                    onClick={() => handleSectionClick(section.id)}
                    onMouseEnter={disableHover ? undefined : (e) => handleSectionHover(section.id, e.clientX, e.clientY)}
                    onMouseMove={disableHover ? undefined : (e) => handleSectionHover(section.id, e.clientX, e.clientY)}
                    onMouseLeave={disableHover ? undefined : handleMouseLeave}
                  />
                  {isVisible && (
                    <text
                      x={section.labelX}
                      y={section.labelY}
                      className={styles.sectionLabel}
                      pointerEvents="none"
                    >
                      {section.name.replace(/^(Door \d+ - )?/, '')}
                    </text>
                  )}
                </g>
              );
            })}
          </>
        ) : (
          // Section view: show individual seats
          (() => {
            // Calculate zoom transform based on section center
            const zoomScale = 2.5;
            const offsetX = activeSection ? -activeSection.labelX * zoomScale + VENUE_WIDTH / 2 : 0;
            const offsetY = activeSection ? -activeSection.labelY * zoomScale + VENUE_HEIGHT / 2 : 0;

            return (
              <>
                {/* Stage - transformed for zoomed view */}
                <ellipse
                  cx={STAGE_CENTER_X * zoomScale + offsetX}
                  cy={STAGE_CENTER_Y * zoomScale + offsetY}
                  rx={STAGE_RADIUS * 1.5 * zoomScale}
                  ry={STAGE_RADIUS * zoomScale}
                  className={styles.stage}
                />
                <text
                  x={STAGE_CENTER_X * zoomScale + offsetX}
                  y={STAGE_CENTER_Y * zoomScale + offsetY + 5 * zoomScale}
                  className={styles.stageLabel}
                  style={{ fontSize: `${14 * zoomScale}px` }}
                >
                  STAGE
                </text>

                {/* Section background - use same transform as seats */}
                {activeSection && (
                  <path
                    d={activeSection.path}
                    fill="none"
                    stroke={getTierColor(activeSection.tierId)}
                    strokeWidth={1}
                    strokeDasharray="4 2"
                    className={styles.sectionOutline}
                    transform={`translate(${offsetX}, ${offsetY}) scale(${zoomScale})`}
                    style={{ transformOrigin: '0 0' }}
                  />
                )}

                {/* Seats */}
                {sectionSeats.map((seat) => {
                  const isSelected = isSeatSelected(seat.id);
                  const isHovered = !disableHover && hoveredItem?.id === seat.id;

                  // Transform coordinates for zoomed view
                  const x = seat.x * zoomScale + offsetX;
                  const y = seat.y * zoomScale + offsetY;

                  return (
                    <g key={seat.id}>
                      {/* Larger invisible hit area for easier clicking */}
                      <circle
                        cx={x}
                        cy={y}
                        r={20}
                        fill="transparent"
                        className={`${styles.seat} ${disableHover ? styles.noHover : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSeatClick(seat);
                        }}
                        onMouseEnter={disableHover ? undefined : (e) => handleSeatHover(seat, e.clientX, e.clientY)}
                        onMouseMove={disableHover ? undefined : (e) => handleSeatHover(seat, e.clientX, e.clientY)}
                        onMouseLeave={disableHover ? undefined : handleMouseLeave}
                      />
                      {/* Visible seat circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 14 : 12}
                        fill={isSelected ? '#0079CA' : getTierColor(seat.tierId)}
                        stroke={isSelected ? '#004679' : isHovered ? '#0079CA' : '#FFFFFF'}
                        strokeWidth={isSelected ? 3 : 2}
                        style={{ pointerEvents: 'none' }}
                      />
                      {isSelected && (
                        <text
                          x={x}
                          y={y + 4}
                          className={styles.seatSelectedLabel}
                          pointerEvents="none"
                        >
                          ✓
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Row labels */}
                {activeSection && (() => {
                  const rows = [...new Set(sectionSeats.map(s => s.row))];

                  return rows.map(row => {
                    const rowSeats = sectionSeats.filter(s => s.row === row);
                    const firstSeat = rowSeats[0];
                    if (!firstSeat) return null;

                    const x = firstSeat.x * zoomScale + offsetX - 30;
                    const y = firstSeat.y * zoomScale + offsetY + 4;

                    return (
                      <text
                        key={row}
                        x={x}
                        y={y}
                        className={styles.rowLabel}
                      >
                        {row}
                      </text>
                    );
                  });
                })()}
              </>
            );
          })()
        )}
      </svg>

      {renderTooltip()}
    </div>
  );
}
