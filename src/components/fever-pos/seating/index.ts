/**
 * Seating chart components for assigned seating events.
 * 
 * The SeatingMapView is the main entry point, combining:
 * - SeatCategoryFilter: Left sidebar for tier filtering
 * - MockSeatingChart: SVG-based seating chart (swappable with seats.io)
 * - SeatSelectionModal: Ticket type selection modal
 * 
 * To swap to seats.io in the future:
 * 1. Create a SeatsioSeatingChart component implementing SeatingChartProps
 * 2. Replace MockSeatingChart import in SeatingMapView
 */

export { SeatingMapView } from './SeatingMapView';
export { MockSeatingChart } from './MockSeatingChart';
export { SeatCategoryFilter } from './SeatCategoryFilter';
export { SeatSelectionModal } from './SeatSelectionModal';
export type { SeatInfo, SeatingChartProps, SeatingChartCallbacks } from './types';
