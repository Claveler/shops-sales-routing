/**
 * Mock data for the Fever POS (One-Stop Shop) interface.
 * Models tickets and retail products organized by categories,
 * along with sample cart state grouped by event.
 */

import type { VariantAxis, ProductVariant } from './mockData';

export type { VariantAxis, ProductVariant };

export type ProductType = 'ticket' | 'addon' | 'food' | 'retail';

export interface Category {
  id: string;
  name: string;
  color: string; // left-stripe color on tiles
  hasMemberPricing?: boolean; // true when category contains member-priced products
}

export interface Product {
  id: string;
  name: string;
  price: number;
  memberPrice?: number;
  type: ProductType;
  categoryId: string;
  imageUrl?: string;
  tab: 'tickets' | 'shop';
  variantAxes?: VariantAxis[];     // undefined = simple product (no variants)
  variants?: ProductVariant[];     // the concrete variant combinations
}

export interface CartItemData {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number; // Set when member pricing is active — stores the non-discounted price for display
  quantity: number;
  bookingFee?: number;
  variantId?: string;       // which variant was selected
  variantLabel?: string;    // e.g. "L" — for display in cart
  /** Seat information for assigned seating events */
  seatInfo?: {
    section: string;        // e.g. "Door 2 - Section 200"
    row: string;            // e.g. "P"
    seat: string;           // e.g. "25"
    tier: string;           // e.g. "General Admission - Tier 6"
  };
}

// ---------------------------------------------------------------------------
// Seating configuration for assigned seating events
// ---------------------------------------------------------------------------

export interface SeatingTier {
  id: string;
  name: string;             // e.g. "General Admission - Tier 6"
  color: string;            // Hex color for map display
  priceRange: string;       // e.g. "$111.00-$121.00"
  adultPrice: number;
  childPrice: number;
  adultFee: number;
  childFee: number;
}

export interface SeatingConfig {
  tiers: SeatingTier[];
  /** Future: seats.io workspace key for real integration */
  seatsioWorkspaceKey?: string;
  /** Future: seats.io event key for real integration */
  seatsioEventKey?: string;
}

export interface CartEventGroup {
  id: string;               // composite key: eventId--timeslotId for ticket groups, plain eventId for retail-only groups
  eventId: string;           // the raw event ID for lookups
  timeslotId?: string;       // which timeslot this group belongs to (ticket groups only)
  eventName: string;
  eventImageUrl?: string;
  location: string;
  date: string;
  isExpanded: boolean;
  items: CartItemData[];
  /** Retail / gift-shop products linked to this event via sales routing */
  retailItems: CartItemData[];
}

export const DEFAULT_EVENT_THUMBNAIL_URL =
  'https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=256&q=80';

export const EVENT_THUMBNAIL_BY_ID: Record<string, string> = {
  'evt-001': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=256&q=80',
  'evt-002': 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=256&q=80',
  'evt-003': 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=256&q=80',
  'evt-004': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=256&q=80',
  'evt-005': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=256&q=80',
  'evt-006': 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=256&q=80',
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export interface EventTicketCatalog {
  categories: Category[];
  products: Product[];
  /** When true, event uses assigned seating (seating map instead of product grid) */
  hasSeating?: boolean;
  /** Seating configuration for assigned seating events */
  seatingConfig?: SeatingConfig;
}

export const eventTicketCatalogs: Record<string, EventTicketCatalog> = {
  'evt-001': {
    categories: [
      { id: 'taylor-general', name: 'General Admission', color: '#0079CA' },
      { id: 'taylor-vip', name: 'VIP Experience', color: '#0079CA' },
    ],
    products: [
      { id: 't-1', name: 'Zone A Ticket', price: 39.00, type: 'ticket', categoryId: 'taylor-general', tab: 'tickets' },
      { id: 't-2', name: 'Zone B Ticket', price: 29.00, type: 'ticket', categoryId: 'taylor-general', tab: 'tickets' },
      { id: 't-3', name: 'Balcony View Ticket', price: 24.00, type: 'ticket', categoryId: 'taylor-general', tab: 'tickets' },
      { id: 't-4', name: 'VIP Front Row Ticket', price: 89.00, memberPrice: 66.75, type: 'ticket', categoryId: 'taylor-vip', tab: 'tickets' },
      { id: 't-5', name: 'VIP Meet & Greet Pass', price: 129.00, memberPrice: 96.75, type: 'ticket', categoryId: 'taylor-vip', tab: 'tickets' },
      { id: 'a-1', name: 'Seat Selection Upgrade', price: 6.00, memberPrice: 4.50, type: 'addon', categoryId: 'taylor-general', tab: 'tickets' },
      { id: 'a-2', name: 'Flexible Ticket Change', price: 9.00, type: 'addon', categoryId: 'taylor-general', tab: 'tickets' },
      { id: 'a-3', name: 'Fast Track Entry', price: 12.00, type: 'addon', categoryId: 'taylor-general', tab: 'tickets' },
    ],
  },
  'evt-002': {
    categories: [],
    products: [
      { id: 'vg-1', name: 'Standard Adult Entry', price: 22.00, type: 'ticket', categoryId: 'all', tab: 'tickets' },
      { id: 'vg-2', name: 'Child Entry (4-12)', price: 14.00, type: 'ticket', categoryId: 'all', tab: 'tickets' },
      { id: 'vg-3', name: 'Student Entry', price: 18.00, type: 'ticket', categoryId: 'all', tab: 'tickets' },
      { id: 'vg-4', name: 'Family Pack (2+2)', price: 62.00, memberPrice: 46.50, type: 'ticket', categoryId: 'all', tab: 'tickets' },
      { id: 'vg-a1', name: 'Audio Narrative Access', price: 5.00, type: 'addon', categoryId: 'all', tab: 'tickets' },
      { id: 'vg-a2', name: 'VR Masterpieces Add-on', price: 8.00, type: 'addon', categoryId: 'all', tab: 'tickets' },
      { id: 'vg-a3', name: 'Priority Access Lane', price: 10.00, type: 'addon', categoryId: 'all', tab: 'tickets' },
    ],
  },
  'evt-003': {
    categories: [
      { id: 'hans-general', name: 'General Admission', color: '#0079CA' },
      { id: 'hans-premium', name: 'Premium', color: '#0079CA' },
    ],
    products: [
      // Tickets are handled via seating map for this event, but we keep add-ons
      { id: 'hz-a1', name: 'Fast Track Check-in', price: 11.00, type: 'addon', categoryId: 'hans-general', tab: 'tickets' },
      { id: 'hz-a2', name: 'Premium Seat Upgrade', price: 7.00, type: 'addon', categoryId: 'hans-general', tab: 'tickets' },
      { id: 'hz-a3', name: 'Aftershow Q&A Access', price: 16.00, type: 'addon', categoryId: 'hans-general', tab: 'tickets' },
      { id: 'hz-a4', name: 'Commemorative Program', price: 15.00, type: 'addon', categoryId: 'hans-general', tab: 'tickets' },
      { id: 'hz-a5', name: 'VIP Lounge Pre-Show', price: 35.00, memberPrice: 26.25, type: 'addon', categoryId: 'hans-premium', tab: 'tickets' },
    ],
    hasSeating: true,
    seatingConfig: {
      tiers: [
        { id: 'tier-1',  name: 'General Admission - Tier 1',  color: '#1E3A5F', priceRange: '$40.00-$50.00',   adultPrice: 50.00,  childPrice: 40.00,  adultFee: 7.50,  childFee: 6.00 },
        { id: 'tier-2',  name: 'General Admission - Tier 2',  color: '#2E5984', priceRange: '$61.00',          adultPrice: 61.00,  childPrice: 51.00,  adultFee: 9.15,  childFee: 7.65 },
        { id: 'tier-3',  name: 'General Admission - Tier 3',  color: '#3D78A8', priceRange: '$62.00-$72.00',   adultPrice: 72.00,  childPrice: 62.00,  adultFee: 10.80, childFee: 9.30 },
        { id: 'tier-4',  name: 'General Admission - Tier 4',  color: '#4A8BBF', priceRange: '$63.00',          adultPrice: 63.00,  childPrice: 53.00,  adultFee: 9.45,  childFee: 7.95 },
        { id: 'tier-5',  name: 'General Admission - Tier 5',  color: '#5A9ED4', priceRange: '$66.00-$76.00',   adultPrice: 76.00,  childPrice: 66.00,  adultFee: 11.40, childFee: 9.90 },
        { id: 'tier-6',  name: 'General Admission - Tier 6',  color: '#6BB1E9', priceRange: '$111.00-$121.00', adultPrice: 121.00, childPrice: 111.00, adultFee: 18.15, childFee: 16.65 },
        { id: 'tier-7',  name: 'General Admission - Tier 7',  color: '#7EC4F5', priceRange: '$73.00-$83.00',   adultPrice: 83.00,  childPrice: 73.00,  adultFee: 12.45, childFee: 10.95 },
        { id: 'tier-8',  name: 'General Admission - Tier 8',  color: '#91D7FF', priceRange: '$79.00-$89.00',   adultPrice: 89.00,  childPrice: 79.00,  adultFee: 13.35, childFee: 11.85 },
        { id: 'tier-9',  name: 'General Admission - Tier 9',  color: '#A4E0FF', priceRange: '$87.00-$97.00',   adultPrice: 97.00,  childPrice: 87.00,  adultFee: 14.55, childFee: 13.05 },
        { id: 'tier-10', name: 'General Admission - Tier 10', color: '#B7E9FF', priceRange: '$92.00-$102.00',  adultPrice: 102.00, childPrice: 92.00,  adultFee: 15.30, childFee: 13.80 },
        { id: 'tier-11', name: 'General Admission - Tier 11', color: '#CAF2FF', priceRange: '$98.00-$108.00',  adultPrice: 108.00, childPrice: 98.00,  adultFee: 16.20, childFee: 14.70 },
        { id: 'tier-12', name: 'General Admission - Tier 12', color: '#DDFBFF', priceRange: '$102.00',         adultPrice: 102.00, childPrice: 92.00,  adultFee: 15.30, childFee: 13.80 },
      ],
    },
  },
  'evt-004': {
    categories: [],
    products: [
      { id: 'sf-1', name: 'Tapas Route Ticket', price: 49.00, type: 'ticket', categoryId: 'all', tab: 'tickets' },
      { id: 'sf-2', name: 'Tapas + Dessert Route', price: 57.00, type: 'ticket', categoryId: 'all', tab: 'tickets' },
      { id: 'sf-3', name: 'Veggie Friendly Route', price: 49.00, type: 'ticket', categoryId: 'all', tab: 'tickets' },
      { id: 'sf-a1', name: 'Private Guide Upgrade', price: 15.00, type: 'addon', categoryId: 'all', tab: 'tickets' },
      { id: 'sf-a2', name: 'Chef-led Market Stop', price: 12.00, type: 'addon', categoryId: 'all', tab: 'tickets' },
      { id: 'sf-a3', name: 'Flexible Route Reschedule', price: 6.00, type: 'addon', categoryId: 'all', tab: 'tickets' },
    ],
  },
  'evt-005': {
    categories: [
      { id: 'st-standard', name: 'Standard Entry', color: '#0079CA' },
      { id: 'st-vip', name: 'VIP Access', color: '#0079CA' },
    ],
    products: [
      { id: 'st-1', name: 'General Entry Pass', price: 36.00, type: 'ticket', categoryId: 'st-standard', tab: 'tickets' },
      { id: 'st-2', name: 'Group Entry (4+)', price: 31.00, type: 'ticket', categoryId: 'st-standard', tab: 'tickets' },
      { id: 'st-3', name: 'Priority Entry Pass', price: 43.00, type: 'ticket', categoryId: 'st-standard', tab: 'tickets' },
      { id: 'st-4', name: 'VIP Hawkins Lab Access', price: 74.00, memberPrice: 55.50, type: 'ticket', categoryId: 'st-vip', tab: 'tickets' },
      { id: 'st-5', name: 'VIP Actor Photo Moment', price: 94.00, memberPrice: 70.50, type: 'ticket', categoryId: 'st-vip', tab: 'tickets' },
      { id: 'st-a1', name: 'Arcade Access Add-on', price: 8.00, type: 'addon', categoryId: 'st-standard', tab: 'tickets' },
      { id: 'st-a2', name: 'Demogorgon Photo Add-on', price: 10.00, type: 'addon', categoryId: 'st-standard', tab: 'tickets' },
      { id: 'st-a3', name: 'Fast Queue Access', price: 5.00, type: 'addon', categoryId: 'st-standard', tab: 'tickets' },
    ],
  },
};

const defaultTicketEventId = 'evt-001';

export const ticketCategories: Category[] = eventTicketCatalogs[defaultTicketEventId].categories;

export const shopCategories: Category[] = [
  { id: 'souvenirs', name: 'Souvenirs', color: '#E74C3C' },
  { id: 'books', name: 'Books', color: '#2ECC71' },
  { id: 'clothing', name: 'Clothing', color: '#9B59B6' },
  { id: 'toys', name: 'Toys', color: '#F1C40F' },
  { id: 'accessories', name: 'Accessories', color: '#1ABC9C' },
];

// ---------------------------------------------------------------------------
// Products — Tickets tab
// ---------------------------------------------------------------------------

export const ticketProducts: Product[] = eventTicketCatalogs[defaultTicketEventId].products;

// ---------------------------------------------------------------------------
// Products — Shop tab
// ---------------------------------------------------------------------------

export const shopProducts: Product[] = [
  { id: 's-1', name: 'HMS Victory Model', price: 24.99, type: 'retail', categoryId: 'souvenirs', tab: 'shop' },
  { id: 's-2', name: 'Fridge Magnet', price: 4.50, type: 'retail', categoryId: 'souvenirs', tab: 'shop' },
  { id: 's-3', name: 'Postcard Set', price: 3.00, type: 'retail', categoryId: 'souvenirs', tab: 'shop' },
  { id: 's-4', name: 'Keyring', price: 5.00, type: 'retail', categoryId: 'souvenirs', tab: 'shop' },
  { id: 's-5', name: 'Dockyard History', price: 12.99, type: 'retail', categoryId: 'books', tab: 'shop' },
  { id: 's-6', name: 'Nelson Biography', price: 9.99, type: 'retail', categoryId: 'books', tab: 'shop' },
  { id: 's-7', name: 'Children\'s Guide', price: 6.99, type: 'retail', categoryId: 'books', tab: 'shop' },
  { id: 's-8', name: 'Map & Guide', price: 4.99, type: 'retail', categoryId: 'books', tab: 'shop' },
  {
    id: 's-9', name: 'Navy T-Shirt', price: 18.00, type: 'retail', categoryId: 'clothing', tab: 'shop',
    variantAxes: [{ name: 'Size', values: ['S', 'M', 'L', 'XL'] }],
    variants: [
      { id: 's-9-s',  parentProductId: 's-9', sku: 'NAV-TSH-S',  attributes: { Size: 'S' },  label: 'S' },
      { id: 's-9-m',  parentProductId: 's-9', sku: 'NAV-TSH-M',  attributes: { Size: 'M' },  label: 'M' },
      { id: 's-9-l',  parentProductId: 's-9', sku: 'NAV-TSH-L',  attributes: { Size: 'L' },  label: 'L' },
      { id: 's-9-xl', parentProductId: 's-9', sku: 'NAV-TSH-XL', attributes: { Size: 'XL' }, label: 'XL' },
    ],
  },
  { id: 's-10', name: 'Cap', price: 12.00, type: 'retail', categoryId: 'clothing', tab: 'shop' },
  {
    id: 's-11', name: 'Hoodie', price: 35.00, type: 'retail', categoryId: 'clothing', tab: 'shop',
    variantAxes: [{ name: 'Size', values: ['S', 'M', 'L', 'XL'] }],
    variants: [
      { id: 's-11-s',  parentProductId: 's-11', sku: 'HOOD-S',  attributes: { Size: 'S' },  label: 'S' },
      { id: 's-11-m',  parentProductId: 's-11', sku: 'HOOD-M',  attributes: { Size: 'M' },  label: 'M' },
      { id: 's-11-l',  parentProductId: 's-11', sku: 'HOOD-L',  attributes: { Size: 'L' },  label: 'L' },
      { id: 's-11-xl', parentProductId: 's-11', sku: 'HOOD-XL', attributes: { Size: 'XL' }, label: 'XL' },
    ],
  },
  { id: 's-12', name: 'Scarf', price: 15.00, type: 'retail', categoryId: 'clothing', tab: 'shop' },
  { id: 's-13', name: 'Toy Battleship', price: 8.99, type: 'retail', categoryId: 'toys', tab: 'shop' },
  { id: 's-14', name: 'Sailor Teddy', price: 14.99, type: 'retail', categoryId: 'toys', tab: 'shop' },
  { id: 's-15', name: 'Puzzle 500pc', price: 11.99, type: 'retail', categoryId: 'toys', tab: 'shop' },
  { id: 's-16', name: 'Pirate Set', price: 7.99, type: 'retail', categoryId: 'toys', tab: 'shop' },
  { id: 's-17', name: 'Tote Bag', price: 8.00, type: 'retail', categoryId: 'accessories', tab: 'shop' },
  { id: 's-18', name: 'Umbrella', price: 15.00, type: 'retail', categoryId: 'accessories', tab: 'shop' },
  { id: 's-19', name: 'Pen Set', price: 6.50, type: 'retail', categoryId: 'accessories', tab: 'shop' },
  { id: 's-20', name: 'Water Bottle', price: 10.00, type: 'retail', categoryId: 'accessories', tab: 'shop' },
];

// ---------------------------------------------------------------------------
// All products combined
// ---------------------------------------------------------------------------

export const allProducts: Product[] = [
  ...ticketProducts,
  ...shopProducts,
];

// ---------------------------------------------------------------------------
// Sample cart state
// ---------------------------------------------------------------------------

export const initialCartEvents: CartEventGroup[] = [
  // Taylor Swift event (Box Office event - source of retail products)
  {
    id: 'evt-001--ts-001-06',
    eventId: 'evt-001',
    timeslotId: 'ts-001-06',
    eventName: 'Candlelight: Tribute to Taylor Swift',
    eventImageUrl: EVENT_THUMBNAIL_BY_ID['evt-001'],
    location: 'St. James Church',
    date: 'Sun, Mar 15, 9:30 PM',
    isExpanded: true,
    items: [
      {
        id: 'ci-1',
        productId: 't-1',
        name: 'Zone A Ticket',
        price: 39.00,
        quantity: 2,
        bookingFee: 0.60,
      },
      {
        id: 'ci-2',
        productId: 'a-1',
        name: 'Seat Selection Upgrade',
        price: 6.00,
        quantity: 2,
      },
    ],
    retailItems: [
      {
        id: 'cp-1',
        productId: 'demo-p-001',
        name: 'Event T-Shirt (Black)',
        price: 29.99,
        quantity: 1,
        variantId: 'demo-p-001-l',
        variantLabel: 'L',
      },
      {
        id: 'cp-2',
        productId: 'demo-p-012',
        name: 'Scented Candle Set',
        price: 34.99,
        quantity: 2,
      },
    ],
  },
  // Hans Zimmer event with seated tickets (demonstrates seating feature)
  {
    id: 'evt-003--ts-003-05',
    eventId: 'evt-003',
    timeslotId: 'ts-003-05',
    eventName: 'Candlelight: Best of Hans Zimmer',
    eventImageUrl: EVENT_THUMBNAIL_BY_ID['evt-003'],
    location: 'Teatro Real',
    date: 'Fri, Mar 27, 7:30 PM',
    isExpanded: true,
    items: [
      {
        id: 'ci-hz-1',
        productId: 'hz-seat-1',
        name: 'General Admission Adult - Tier 1',
        price: 50.00,
        quantity: 1,
        bookingFee: 7.50,
        seatInfo: {
          section: 'Balcony Left',
          row: 'B',
          seat: '6',
          tier: 'General Admission - Tier 1',
        },
      },
      {
        id: 'ci-hz-2',
        productId: 'hz-seat-2',
        name: 'General Admission Child - Tier 1',
        price: 40.00,
        quantity: 1,
        bookingFee: 6.00,
        seatInfo: {
          section: 'Balcony Left',
          row: 'B',
          seat: '11',
          tier: 'General Admission - Tier 1',
        },
      },
    ],
    retailItems: [],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getProductsForTab(tab: 'tickets' | 'shop'): Product[] {
  if (tab === 'tickets') {
    return ticketProducts;
  }
  return allProducts.filter(p => p.tab === tab);
}

export function getCategoriesForTab(tab: 'tickets' | 'shop'): Category[] {
  switch (tab) {
    case 'tickets':
      return ticketCategories;
    case 'shop':
      return shopCategories;
  }
}

export function getTicketProductsForEvent(eventId?: string): Product[] {
  const catalog = (eventId && eventTicketCatalogs[eventId]) ? eventTicketCatalogs[eventId] : eventTicketCatalogs[defaultTicketEventId];
  return catalog.products;
}

export function getTicketCategoriesForEvent(eventId?: string): Category[] {
  const catalog = (eventId && eventTicketCatalogs[eventId]) ? eventTicketCatalogs[eventId] : eventTicketCatalogs[defaultTicketEventId];
  return catalog.categories;
}

export function getEventThumbnailById(eventId?: string): string {
  if (!eventId) {
    return DEFAULT_EVENT_THUMBNAIL_URL;
  }
  return EVENT_THUMBNAIL_BY_ID[eventId] ?? DEFAULT_EVENT_THUMBNAIL_URL;
}

export function getProductsByCategory(products: Product[], categoryId: string): Product[] {
  return products.filter(p => p.categoryId === categoryId);
}

export function formatPrice(amount: number): string {
  return `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Returns true if the event uses assigned seating (seating map instead of product grid).
 */
export function eventHasSeating(eventId?: string): boolean {
  if (!eventId) return false;
  const catalog = eventTicketCatalogs[eventId];
  return catalog?.hasSeating ?? false;
}

/**
 * Returns the seating configuration for an event, or undefined if not a seated event.
 */
export function getSeatingConfigForEvent(eventId?: string): SeatingConfig | undefined {
  if (!eventId) return undefined;
  const catalog = eventTicketCatalogs[eventId];
  return catalog?.seatingConfig;
}

/**
 * Returns only add-on products for an event (excludes tickets).
 * Used for the Add-Ons tab in seated events.
 */
export function getAddOnProductsForEvent(eventId?: string): Product[] {
  const catalog = (eventId && eventTicketCatalogs[eventId]) ? eventTicketCatalogs[eventId] : eventTicketCatalogs[defaultTicketEventId];
  return catalog.products.filter(p => p.type === 'addon');
}

// ---------------------------------------------------------------------------
// Timeslot / Schedule model
// ---------------------------------------------------------------------------

export type AvailabilityLevel = 'available' | 'filling' | 'low' | 'sold_out';

export interface EventTimeslot {
  id: string;
  eventId: string;
  date: string;           // ISO date, e.g. '2026-03-15'
  startTime: string;      // 24h format, e.g. '14:00'
  endTime?: string;       // optional, e.g. '15:30'
  capacity: number;
  sold: number;
  availability: AvailabilityLevel;
}

export interface EventSchedule {
  eventId: string;
  timeslots: EventTimeslot[];
}

// ---------------------------------------------------------------------------
// Mock schedules per event
// ---------------------------------------------------------------------------

export const eventSchedules: Record<string, EventSchedule> = {
  // Taylor Swift — Wed, Fri, Sat evenings (extended run: Mar 13 – Apr 10)
  'evt-001': {
    eventId: 'evt-001',
    timeslots: [
      // Week 1 (Mar 13-15)
      { id: 'ts-001-01', eventId: 'evt-001', date: '2026-03-13', startTime: '19:00', capacity: 200, sold: 142, availability: 'filling' },
      { id: 'ts-001-02', eventId: 'evt-001', date: '2026-03-13', startTime: '21:30', capacity: 200, sold: 48,  availability: 'available' },
      { id: 'ts-001-03', eventId: 'evt-001', date: '2026-03-14', startTime: '19:00', capacity: 200, sold: 190, availability: 'low' },
      { id: 'ts-001-04', eventId: 'evt-001', date: '2026-03-14', startTime: '21:30', capacity: 200, sold: 112, availability: 'filling' },
      { id: 'ts-001-05', eventId: 'evt-001', date: '2026-03-15', startTime: '19:00', capacity: 200, sold: 200, availability: 'sold_out' },
      { id: 'ts-001-06', eventId: 'evt-001', date: '2026-03-15', startTime: '21:30', capacity: 200, sold: 76,  availability: 'available' },
      // Week 2 (Mar 18-21)
      { id: 'ts-001-07', eventId: 'evt-001', date: '2026-03-18', startTime: '19:00', capacity: 200, sold: 30,  availability: 'available' },
      { id: 'ts-001-08', eventId: 'evt-001', date: '2026-03-18', startTime: '21:30', capacity: 200, sold: 12,  availability: 'available' },
      { id: 'ts-001-09', eventId: 'evt-001', date: '2026-03-20', startTime: '19:00', capacity: 200, sold: 165, availability: 'filling' },
      { id: 'ts-001-10', eventId: 'evt-001', date: '2026-03-20', startTime: '21:30', capacity: 200, sold: 88,  availability: 'available' },
      { id: 'ts-001-11', eventId: 'evt-001', date: '2026-03-21', startTime: '19:00', capacity: 200, sold: 195, availability: 'low' },
      { id: 'ts-001-12', eventId: 'evt-001', date: '2026-03-21', startTime: '21:30', capacity: 200, sold: 150, availability: 'filling' },
      // Week 3 (Mar 25-28)
      { id: 'ts-001-13', eventId: 'evt-001', date: '2026-03-25', startTime: '19:00', capacity: 200, sold: 20,  availability: 'available' },
      { id: 'ts-001-14', eventId: 'evt-001', date: '2026-03-25', startTime: '21:30', capacity: 200, sold: 5,   availability: 'available' },
      { id: 'ts-001-15', eventId: 'evt-001', date: '2026-03-27', startTime: '19:00', capacity: 200, sold: 60,  availability: 'available' },
      { id: 'ts-001-16', eventId: 'evt-001', date: '2026-03-27', startTime: '21:30', capacity: 200, sold: 35,  availability: 'available' },
      { id: 'ts-001-17', eventId: 'evt-001', date: '2026-03-28', startTime: '19:00', capacity: 200, sold: 110, availability: 'filling' },
      { id: 'ts-001-18', eventId: 'evt-001', date: '2026-03-28', startTime: '21:30', capacity: 200, sold: 45,  availability: 'available' },
      // Week 4 (Apr 1-4)
      { id: 'ts-001-19', eventId: 'evt-001', date: '2026-04-01', startTime: '19:00', capacity: 200, sold: 10,  availability: 'available' },
      { id: 'ts-001-20', eventId: 'evt-001', date: '2026-04-01', startTime: '21:30', capacity: 200, sold: 0,   availability: 'available' },
      { id: 'ts-001-21', eventId: 'evt-001', date: '2026-04-03', startTime: '19:00', capacity: 200, sold: 25,  availability: 'available' },
      { id: 'ts-001-22', eventId: 'evt-001', date: '2026-04-03', startTime: '21:30', capacity: 200, sold: 8,   availability: 'available' },
      { id: 'ts-001-23', eventId: 'evt-001', date: '2026-04-04', startTime: '19:00', capacity: 200, sold: 70,  availability: 'available' },
      { id: 'ts-001-24', eventId: 'evt-001', date: '2026-04-04', startTime: '21:30', capacity: 200, sold: 15,  availability: 'available' },
      // Week 5 (Apr 8-10)
      { id: 'ts-001-25', eventId: 'evt-001', date: '2026-04-08', startTime: '19:00', capacity: 200, sold: 0,   availability: 'available' },
      { id: 'ts-001-26', eventId: 'evt-001', date: '2026-04-08', startTime: '21:30', capacity: 200, sold: 0,   availability: 'available' },
      { id: 'ts-001-27', eventId: 'evt-001', date: '2026-04-10', startTime: '19:00', capacity: 200, sold: 0,   availability: 'available' },
      { id: 'ts-001-28', eventId: 'evt-001', date: '2026-04-10', startTime: '21:30', capacity: 200, sold: 0,   availability: 'available' },
    ],
  },
  // Van Gogh — daily, morning + afternoon sessions
  'evt-002': {
    eventId: 'evt-002',
    timeslots: [
      { id: 'ts-002-01', eventId: 'evt-002', date: '2026-04-01', startTime: '10:00', capacity: 120, sold: 110, availability: 'low' },
      { id: 'ts-002-02', eventId: 'evt-002', date: '2026-04-01', startTime: '12:00', capacity: 120, sold: 80,  availability: 'filling' },
      { id: 'ts-002-03', eventId: 'evt-002', date: '2026-04-01', startTime: '14:00', capacity: 120, sold: 45,  availability: 'available' },
      { id: 'ts-002-04', eventId: 'evt-002', date: '2026-04-01', startTime: '16:00', capacity: 120, sold: 20,  availability: 'available' },
      { id: 'ts-002-05', eventId: 'evt-002', date: '2026-04-02', startTime: '10:00', capacity: 120, sold: 60,  availability: 'filling' },
      { id: 'ts-002-06', eventId: 'evt-002', date: '2026-04-02', startTime: '12:00', capacity: 120, sold: 30,  availability: 'available' },
      { id: 'ts-002-07', eventId: 'evt-002', date: '2026-04-02', startTime: '14:00', capacity: 120, sold: 120, availability: 'sold_out' },
      { id: 'ts-002-08', eventId: 'evt-002', date: '2026-04-02', startTime: '16:00', capacity: 120, sold: 55,  availability: 'filling' },
      { id: 'ts-002-09', eventId: 'evt-002', date: '2026-04-03', startTime: '10:00', capacity: 120, sold: 15,  availability: 'available' },
      { id: 'ts-002-10', eventId: 'evt-002', date: '2026-04-03', startTime: '12:00', capacity: 120, sold: 10,  availability: 'available' },
      { id: 'ts-002-11', eventId: 'evt-002', date: '2026-04-03', startTime: '14:00', capacity: 120, sold: 5,   availability: 'available' },
      { id: 'ts-002-12', eventId: 'evt-002', date: '2026-04-03', startTime: '16:00', capacity: 120, sold: 0,   availability: 'available' },
    ],
  },
  // Hans Zimmer — Fri + Sat evenings
  'evt-003': {
    eventId: 'evt-003',
    timeslots: [
      { id: 'ts-003-01', eventId: 'evt-003', date: '2026-03-20', startTime: '19:30', capacity: 300, sold: 280, availability: 'low' },
      { id: 'ts-003-02', eventId: 'evt-003', date: '2026-03-21', startTime: '17:00', capacity: 300, sold: 150, availability: 'filling' },
      { id: 'ts-003-03', eventId: 'evt-003', date: '2026-03-21', startTime: '20:00', capacity: 300, sold: 90,  availability: 'available' },
      { id: 'ts-003-04', eventId: 'evt-003', date: '2026-03-22', startTime: '19:30', capacity: 300, sold: 300, availability: 'sold_out' },
      { id: 'ts-003-05', eventId: 'evt-003', date: '2026-03-27', startTime: '19:30', capacity: 300, sold: 60,  availability: 'available' },
      { id: 'ts-003-06', eventId: 'evt-003', date: '2026-03-28', startTime: '17:00', capacity: 300, sold: 30,  availability: 'available' },
      { id: 'ts-003-07', eventId: 'evt-003', date: '2026-03-28', startTime: '20:00', capacity: 300, sold: 10,  availability: 'available' },
    ],
  },
  // Secret Food Tour — Wed + Sat mornings
  'evt-004': {
    eventId: 'evt-004',
    timeslots: [
      { id: 'ts-004-01', eventId: 'evt-004', date: '2026-04-08', startTime: '10:30', capacity: 16, sold: 14,  availability: 'low' },
      { id: 'ts-004-02', eventId: 'evt-004', date: '2026-04-11', startTime: '10:30', capacity: 16, sold: 8,   availability: 'filling' },
      { id: 'ts-004-03', eventId: 'evt-004', date: '2026-04-11', startTime: '13:00', capacity: 16, sold: 3,   availability: 'available' },
      { id: 'ts-004-04', eventId: 'evt-004', date: '2026-04-15', startTime: '10:30', capacity: 16, sold: 0,   availability: 'available' },
      { id: 'ts-004-05', eventId: 'evt-004', date: '2026-04-18', startTime: '10:30', capacity: 16, sold: 16,  availability: 'sold_out' },
      { id: 'ts-004-06', eventId: 'evt-004', date: '2026-04-18', startTime: '13:00', capacity: 16, sold: 6,   availability: 'available' },
    ],
  },
  // Stranger Things — Thu, Fri, Sat, Sun (afternoon + evening)
  'evt-005': {
    eventId: 'evt-005',
    timeslots: [
      { id: 'ts-005-01', eventId: 'evt-005', date: '2026-05-01', startTime: '14:00', capacity: 250, sold: 200, availability: 'filling' },
      { id: 'ts-005-02', eventId: 'evt-005', date: '2026-05-01', startTime: '17:00', capacity: 250, sold: 120, availability: 'filling' },
      { id: 'ts-005-03', eventId: 'evt-005', date: '2026-05-01', startTime: '20:00', capacity: 250, sold: 50,  availability: 'available' },
      { id: 'ts-005-04', eventId: 'evt-005', date: '2026-05-02', startTime: '14:00', capacity: 250, sold: 250, availability: 'sold_out' },
      { id: 'ts-005-05', eventId: 'evt-005', date: '2026-05-02', startTime: '17:00', capacity: 250, sold: 230, availability: 'low' },
      { id: 'ts-005-06', eventId: 'evt-005', date: '2026-05-02', startTime: '20:00', capacity: 250, sold: 80,  availability: 'available' },
      { id: 'ts-005-07', eventId: 'evt-005', date: '2026-05-03', startTime: '14:00', capacity: 250, sold: 30,  availability: 'available' },
      { id: 'ts-005-08', eventId: 'evt-005', date: '2026-05-03', startTime: '17:00', capacity: 250, sold: 10,  availability: 'available' },
      { id: 'ts-005-09', eventId: 'evt-005', date: '2026-05-03', startTime: '20:00', capacity: 250, sold: 5,   availability: 'available' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Timeslot helpers
// ---------------------------------------------------------------------------

/**
 * Returns the schedule for a given event, or undefined if none exists.
 */
export function getScheduleForEvent(eventId: string): EventSchedule | undefined {
  return eventSchedules[eventId];
}

/**
 * Returns the deduplicated, sorted list of dates that have at least one
 * non-sold-out timeslot for the given event.
 */
export function getAvailableDatesForEvent(eventId: string): string[] {
  const schedule = eventSchedules[eventId];
  if (!schedule) return [];

  const datesWithAvailability = new Set<string>();
  for (const ts of schedule.timeslots) {
    // Include the date even if all slots are sold out — the cashier may want to see it
    datesWithAvailability.add(ts.date);
  }

  return Array.from(datesWithAvailability).sort();
}

/**
 * Returns all timeslots for a given event on a specific date.
 */
export function getTimeslotsForDate(eventId: string, date: string): EventTimeslot[] {
  const schedule = eventSchedules[eventId];
  if (!schedule) return [];
  return schedule.timeslots.filter((ts) => ts.date === date);
}

/**
 * Groups timeslots by time-of-day: Morning (before 12:00), Afternoon (12:00-16:59), Evening (17:00+).
 * Returns only groups that have at least one slot.
 */
export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export interface TimeslotGroup {
  label: string;
  timeOfDay: TimeOfDay;
  slots: EventTimeslot[];
}

export function groupTimeslotsByTimeOfDay(timeslots: EventTimeslot[]): TimeslotGroup[] {
  const morning: EventTimeslot[] = [];
  const afternoon: EventTimeslot[] = [];
  const evening: EventTimeslot[] = [];

  for (const ts of timeslots) {
    const hour = parseInt(ts.startTime.split(':')[0], 10);
    if (hour < 12) {
      morning.push(ts);
    } else if (hour < 17) {
      afternoon.push(ts);
    } else {
      evening.push(ts);
    }
  }

  const groups: TimeslotGroup[] = [];
  if (morning.length > 0) groups.push({ label: 'Morning', timeOfDay: 'morning', slots: morning });
  if (afternoon.length > 0) groups.push({ label: 'Afternoon', timeOfDay: 'afternoon', slots: afternoon });
  if (evening.length > 0) groups.push({ label: 'Evening', timeOfDay: 'evening', slots: evening });
  return groups;
}

/**
 * Formats a 24h time string (e.g. '19:00') into a display string (e.g. '7:00 PM').
 */
export function formatTimeslotTime(time24: string): string {
  const [hourStr, minStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minStr} ${suffix}`;
}

/**
 * Formats an ISO date string into a short display format for date pills.
 * e.g. '2026-03-15' -> 'Sat 15'
 */
export function formatDatePill(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00'); // noon to avoid timezone issues
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = d.getDate();
  return `${dayName} ${dayNum}`;
}

/**
 * Formats an ISO date string for the timeslot pill, including month.
 * e.g. '2026-03-15' -> 'Sat, Mar 15'
 */
export function formatDatePillWithMonth(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = d.getDate();
  return `${dayName}, ${month} ${dayNum}`;
}

/**
 * Formats an ISO date string into a longer display format for the modal header.
 * e.g. '2026-03-15' -> 'Saturday, March 15'
 */
export function formatDateLong(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/**
 * Formats a selected timeslot into the cart date string.
 * e.g. date='2026-03-15', startTime='21:30' -> 'Sat, Mar 15, 9:30 PM'
 */
export function formatTimeslotForCart(date: string, startTime: string): string {
  const d = new Date(date + 'T12:00:00');
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = d.getDate();
  const timeStr = formatTimeslotTime(startTime);
  return `${dayName}, ${month} ${dayNum}, ${timeStr}`;
}
