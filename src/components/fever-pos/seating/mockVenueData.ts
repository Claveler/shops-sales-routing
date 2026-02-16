/**
 * Mock venue data for the seating chart.
 * Defines a circular amphitheatre layout similar to the Cirque du Soleil screenshots.
 */

import type { MockSectionData, MockSeatData } from './types';

// Venue dimensions (SVG viewBox)
export const VENUE_WIDTH = 800;
export const VENUE_HEIGHT = 600;
export const STAGE_CENTER_X = 400;
export const STAGE_CENTER_Y = 480;
export const STAGE_RADIUS = 80;

/**
 * Sections arranged in a semi-circle around the stage.
 * Each section is assigned to a tier for pricing.
 */
export const MOCK_SECTIONS: MockSectionData[] = [
  // Front row sections (closest to stage) - higher tiers
  {
    id: 'section-101',
    name: 'Section 101',
    tierId: 'tier-6',
    path: 'M 280 380 L 320 340 L 360 360 L 340 400 Z',
    labelX: 320,
    labelY: 370,
  },
  {
    id: 'section-102',
    name: 'Section 102',
    tierId: 'tier-6',
    path: 'M 360 360 L 400 330 L 440 360 L 400 380 Z',
    labelX: 400,
    labelY: 360,
  },
  {
    id: 'section-103',
    name: 'Section 103',
    tierId: 'tier-6',
    path: 'M 440 360 L 480 340 L 520 380 L 460 400 Z',
    labelX: 480,
    labelY: 370,
  },
  
  // Second row sections - mid-high tiers
  {
    id: 'section-201',
    name: 'Door 1 - Section 201',
    tierId: 'tier-5',
    path: 'M 200 340 L 260 280 L 320 320 L 280 380 Z',
    labelX: 260,
    labelY: 330,
  },
  {
    id: 'section-202',
    name: 'Door 2 - Section 202',
    tierId: 'tier-4',
    path: 'M 320 320 L 360 280 L 440 280 L 480 320 L 440 360 L 360 360 Z',
    labelX: 400,
    labelY: 320,
  },
  {
    id: 'section-203',
    name: 'Door 3 - Section 203',
    tierId: 'tier-5',
    path: 'M 480 320 L 540 280 L 600 340 L 520 380 Z',
    labelX: 540,
    labelY: 330,
  },
  
  // Third row sections - mid tiers
  {
    id: 'section-301',
    name: 'Section 301',
    tierId: 'tier-3',
    path: 'M 140 300 L 200 220 L 280 260 L 260 340 L 200 340 Z',
    labelX: 200,
    labelY: 280,
  },
  {
    id: 'section-302',
    name: 'Section 302',
    tierId: 'tier-3',
    path: 'M 280 260 L 340 220 L 460 220 L 520 260 L 540 280 L 480 320 L 320 320 L 260 280 Z',
    labelX: 400,
    labelY: 270,
  },
  {
    id: 'section-303',
    name: 'Section 303',
    tierId: 'tier-3',
    path: 'M 520 260 L 600 220 L 660 300 L 600 340 L 540 280 Z',
    labelX: 600,
    labelY: 280,
  },
  
  // Back row sections - lower tiers
  {
    id: 'section-401',
    name: 'Section 401',
    tierId: 'tier-2',
    path: 'M 100 260 L 160 160 L 240 200 L 200 280 L 140 300 Z',
    labelX: 160,
    labelY: 230,
  },
  {
    id: 'section-402',
    name: 'Section 402',
    tierId: 'tier-1',
    path: 'M 240 200 L 320 160 L 480 160 L 560 200 L 520 260 L 460 220 L 340 220 L 280 260 Z',
    labelX: 400,
    labelY: 200,
  },
  {
    id: 'section-403',
    name: 'Section 403',
    tierId: 'tier-2',
    path: 'M 560 200 L 640 160 L 700 260 L 660 300 L 600 280 L 520 260 Z',
    labelX: 640,
    labelY: 230,
  },
  
  // Upper balcony sections - budget tiers
  {
    id: 'section-501',
    name: 'Balcony Left',
    tierId: 'tier-1',
    path: 'M 80 220 L 120 100 L 200 140 L 160 220 L 100 260 Z',
    labelX: 140,
    labelY: 170,
  },
  {
    id: 'section-502',
    name: 'Balcony Center',
    tierId: 'tier-1',
    path: 'M 200 140 L 280 100 L 520 100 L 600 140 L 560 200 L 480 160 L 320 160 L 240 200 Z',
    labelX: 400,
    labelY: 140,
  },
  {
    id: 'section-503',
    name: 'Balcony Right',
    tierId: 'tier-1',
    path: 'M 600 140 L 680 100 L 720 220 L 700 260 L 640 220 L 560 200 Z',
    labelX: 660,
    labelY: 170,
  },
];

/**
 * Parse SVG path to get polygon vertices.
 */
function parsePathToPolygon(path: string): { x: number; y: number }[] {
  const coords = path.match(/\d+/g)?.map(Number) || [];
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < coords.length; i += 2) {
    points.push({ x: coords[i], y: coords[i + 1] });
  }
  return points;
}

/**
 * Check if a point is inside a polygon using ray casting algorithm.
 */
function isPointInPolygon(x: number, y: number, polygon: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Generate seats for a specific section.
 * Creates a grid of seats within the section polygon bounds.
 */
export function generateSeatsForSection(section: MockSectionData, rowCount: number, seatsPerRow: number): MockSeatData[] {
  const seats: MockSeatData[] = [];
  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Parse the path to get polygon vertices
  const polygon = parsePathToPolygon(section.path);
  
  // Get bounding box
  const xs = polygon.map(p => p.x);
  const ys = polygon.map(p => p.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  // Smaller padding to fit more seats inside
  const paddingX = width * 0.1;
  const paddingY = height * 0.1;
  
  // Generate more candidate positions than needed, then filter
  const candidateRows = rowCount + 2;
  const candidateSeats = seatsPerRow + 4;
  
  for (let r = 0; r < candidateRows; r++) {
    const rowLabel = rowLabels[r] || `R${r + 1}`;
    const y = minY + paddingY + (r / (candidateRows - 1 || 1)) * (height - 2 * paddingY);
    
    let rowSeats: MockSeatData[] = [];
    
    for (let s = 0; s < candidateSeats; s++) {
      const x = minX + paddingX + (s / (candidateSeats - 1 || 1)) * (width - 2 * paddingX);
      
      // Only add seat if it's inside the polygon
      if (isPointInPolygon(x, y, polygon)) {
        rowSeats.push({
          id: `${section.id}-row-${rowLabel}-seat-${rowSeats.length + 1}`,
          section: section.name,
          sectionId: section.id,
          row: rowLabel,
          seat: String(rowSeats.length + 1),
          tierId: section.tierId,
          x,
          y,
        });
      }
    }
    
    // Only add rows that have seats
    if (rowSeats.length > 0) {
      seats.push(...rowSeats);
    }
  }
  
  return seats;
}

/**
 * Pre-generated seats for all sections.
 * Front sections have fewer rows, back sections have more.
 */
export const MOCK_SEATS: MockSeatData[] = [
  // Front sections (3 rows, 8 seats each)
  ...generateSeatsForSection(MOCK_SECTIONS[0], 3, 8),
  ...generateSeatsForSection(MOCK_SECTIONS[1], 3, 10),
  ...generateSeatsForSection(MOCK_SECTIONS[2], 3, 8),
  
  // Second row sections (4 rows, 10-12 seats each)
  ...generateSeatsForSection(MOCK_SECTIONS[3], 4, 10),
  ...generateSeatsForSection(MOCK_SECTIONS[4], 4, 14),
  ...generateSeatsForSection(MOCK_SECTIONS[5], 4, 10),
  
  // Third row sections (5 rows, 12-16 seats each)
  ...generateSeatsForSection(MOCK_SECTIONS[6], 5, 12),
  ...generateSeatsForSection(MOCK_SECTIONS[7], 5, 18),
  ...generateSeatsForSection(MOCK_SECTIONS[8], 5, 12),
  
  // Back row sections (6 rows, 14-20 seats each)
  ...generateSeatsForSection(MOCK_SECTIONS[9], 6, 14),
  ...generateSeatsForSection(MOCK_SECTIONS[10], 6, 22),
  ...generateSeatsForSection(MOCK_SECTIONS[11], 6, 14),
  
  // Balcony sections (4 rows, 12-18 seats each)
  ...generateSeatsForSection(MOCK_SECTIONS[12], 4, 12),
  ...generateSeatsForSection(MOCK_SECTIONS[13], 4, 20),
  ...generateSeatsForSection(MOCK_SECTIONS[14], 4, 12),
];

/**
 * Get all seats for a specific section.
 */
export function getSeatsForSection(sectionId: string): MockSeatData[] {
  return MOCK_SEATS.filter(seat => seat.sectionId === sectionId);
}
