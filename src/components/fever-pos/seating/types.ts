/**
 * Shared types for seating chart components.
 * This abstraction layer enables swapping between MockSeatingChart and seats.io.
 */

import type { SeatingTier } from '../../../data/feverPosData';

/** Information about a selected seat */
export interface SeatInfo {
  id: string;               // Unique seat identifier (e.g., "section-200-row-P-seat-25")
  section: string;          // Section name (e.g., "Door 2 - Section 200")
  row: string;              // Row letter (e.g., "P")
  seat: string;             // Seat number (e.g., "25")
  tierId: string;           // Reference to SeatingTier.id
  tierName: string;         // Display name (e.g., "General Admission - Tier 6")
  tierColor: string;        // Hex color for display
}

/** Callbacks for seating chart interactions */
export interface SeatingChartCallbacks {
  /** Called when a seat is clicked/selected */
  onSeatSelected: (seat: SeatInfo) => void;
  /** Called when a seat is deselected */
  onSeatDeselected: (seatId: string) => void;
  /** Called when all selections are cleared */
  onClearSelection: () => void;
}

/** Props for any seating chart implementation (mock or seats.io) */
export interface SeatingChartProps {
  /** Seating tiers with pricing info */
  tiers: SeatingTier[];
  /** Currently selected seats */
  selectedSeats: SeatInfo[];
  /** Tier IDs that should be visible (for filtering) */
  visibleTierIds: string[];
  /** Interaction callbacks */
  callbacks: SeatingChartCallbacks;
}

/** Seat data for the mock chart (defines venue layout) */
export interface MockSeatData {
  id: string;
  section: string;
  sectionId: string;
  row: string;
  seat: string;
  tierId: string;
  x: number;  // SVG x coordinate
  y: number;  // SVG y coordinate
}

/** Section data for the mock chart overview */
export interface MockSectionData {
  id: string;
  name: string;
  tierId: string;
  /** SVG path data for the section polygon */
  path: string;
  /** Center point for label positioning */
  labelX: number;
  labelY: number;
}
