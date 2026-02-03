// Types
export interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  city: string;
  status: 'active' | 'draft' | 'ended';
}

export interface Warehouse {
  id: string;
  name: string;
  integration: 'Square' | 'Shopify' | 'Manual';
  productCount: number;
  masterCatalogId: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  stock: number;
  imageUrl?: string;
  warehouseId: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'marketplace' | 'whitelabel' | 'kiosk' | 'ota';
  icon?: string;
}

export type RoutingType = 'onsite' | 'online';
export type RoutingStatus = 'active' | 'inactive' | 'draft';

export interface SalesRouting {
  id: string;
  name: string;
  type: RoutingType;
  eventId: string;
  warehouseIds: string[];
  channelIds?: string[];
  productChannelMapping?: Record<string, string[]>;
  status: RoutingStatus;
  createdAt: string;
  updatedAt: string;
}

// Mock Events
export const events: Event[] = [
  {
    id: 'evt-001',
    name: 'Candlelight: Tribute to Taylor Swift',
    date: '2026-03-15',
    venue: 'St. James Church',
    city: 'Madrid',
    status: 'active'
  },
  {
    id: 'evt-002',
    name: 'Van Gogh: The Immersive Experience',
    date: '2026-04-01',
    venue: 'Exhibition Hall',
    city: 'Barcelona',
    status: 'active'
  },
  {
    id: 'evt-003',
    name: 'Candlelight: Best of Hans Zimmer',
    date: '2026-03-22',
    venue: 'Teatro Real',
    city: 'Madrid',
    status: 'active'
  },
  {
    id: 'evt-004',
    name: 'Secret Food Tour: Tapas & Wine',
    date: '2026-04-10',
    venue: 'La Boqueria',
    city: 'Barcelona',
    status: 'active'
  },
  {
    id: 'evt-005',
    name: 'Stranger Things: The Experience',
    date: '2026-05-01',
    venue: 'IFEMA',
    city: 'Madrid',
    status: 'draft'
  },
  {
    id: 'evt-006',
    name: 'Candlelight: A Tribute to Coldplay',
    date: '2026-03-30',
    venue: 'Casa de la Música',
    city: 'Valencia',
    status: 'active'
  }
];

// Mock Warehouses
export const warehouses: Warehouse[] = [
  {
    id: 'wh-001',
    name: 'ES - Shops Square Testing',
    integration: 'Square',
    productCount: 45,
    masterCatalogId: 'sq0idp-X1_ry5W0fWF9BfDZ5uEPw'
  },
  {
    id: 'wh-002',
    name: 'ES - Shops Shopify Testing',
    integration: 'Shopify',
    productCount: 32,
    masterCatalogId: 'b08wxf-pi.myshopify.com'
  },
  {
    id: 'wh-003',
    name: 'Deprecated',
    integration: 'Square',
    productCount: 18,
    masterCatalogId: 'sq0idp-z_n59C027k5_B1_C66_7DQ'
  },
  {
    id: 'wh-004',
    name: 'Barcelona Merchandise',
    integration: 'Shopify',
    productCount: 67,
    masterCatalogId: 'bcn-merch.myshopify.com'
  }
];

// Mock Products
export const products: Product[] = [
  // Products from wh-001
  { id: 'p-001', name: 'Candlelight T-Shirt (Black)', sku: 'TSH-BLK-001', price: 29.99, currency: 'EUR', stock: 150, warehouseId: 'wh-001' },
  { id: 'p-002', name: 'Candlelight T-Shirt (White)', sku: 'TSH-WHT-001', price: 29.99, currency: 'EUR', stock: 120, warehouseId: 'wh-001' },
  { id: 'p-003', name: 'Concert Poster (A2)', sku: 'POS-A2-001', price: 15.00, currency: 'EUR', stock: 200, warehouseId: 'wh-001' },
  { id: 'p-004', name: 'Vinyl Record - Classical Hits', sku: 'VNL-CLS-001', price: 34.99, currency: 'EUR', stock: 50, warehouseId: 'wh-001' },
  { id: 'p-005', name: 'Scented Candle Set (3 pack)', sku: 'CND-SET-001', price: 24.99, currency: 'EUR', stock: 80, warehouseId: 'wh-001' },
  { id: 'p-006', name: 'Tote Bag - Candlelight Design', sku: 'BAG-TOT-001', price: 19.99, currency: 'EUR', stock: 100, warehouseId: 'wh-001' },
  
  // Products from wh-002
  { id: 'p-007', name: 'Van Gogh Starry Night Print', sku: 'VG-PRT-001', price: 45.00, currency: 'EUR', stock: 75, warehouseId: 'wh-002' },
  { id: 'p-008', name: 'Van Gogh Sunflowers Mug', sku: 'VG-MUG-001', price: 18.00, currency: 'EUR', stock: 200, warehouseId: 'wh-002' },
  { id: 'p-009', name: 'Art Book - Van Gogh Collection', sku: 'VG-BK-001', price: 39.99, currency: 'EUR', stock: 40, warehouseId: 'wh-002' },
  { id: 'p-010', name: 'Puzzle - Starry Night (1000pc)', sku: 'VG-PZL-001', price: 22.00, currency: 'EUR', stock: 60, warehouseId: 'wh-002' },
  { id: 'p-011', name: 'VR Headset Rental', sku: 'VG-VR-001', price: 10.00, currency: 'EUR', stock: 30, warehouseId: 'wh-002' },
  
  // Products from wh-004
  { id: 'p-012', name: 'Barcelona City Map Poster', sku: 'BCN-MAP-001', price: 12.00, currency: 'EUR', stock: 150, warehouseId: 'wh-004' },
  { id: 'p-013', name: 'Tapas Recipe Book', sku: 'BCN-BK-001', price: 28.00, currency: 'EUR', stock: 45, warehouseId: 'wh-004' },
  { id: 'p-014', name: 'Wine Tasting Set', sku: 'BCN-WINE-001', price: 55.00, currency: 'EUR', stock: 25, warehouseId: 'wh-004' },
];

// Mock Channels
export const channels: Channel[] = [
  { id: 'ch-001', name: 'Fever Marketplace', type: 'marketplace' },
  { id: 'ch-002', name: 'Whitelabel', type: 'whitelabel' },
  { id: 'ch-003', name: 'Kiosk', type: 'kiosk' },
  { id: 'ch-004', name: 'GetYourGuide', type: 'ota' },
  { id: 'ch-005', name: 'Viator', type: 'ota' },
  { id: 'ch-006', name: 'Tiqets', type: 'ota' },
];

// Mock Sales Routings
export const salesRoutings: SalesRouting[] = [
  {
    id: 'sr-001',
    name: 'Candlelight Taylor Swift - Onsite Merch',
    type: 'onsite',
    eventId: 'evt-001',
    warehouseIds: ['wh-001', 'wh-002'],
    status: 'active',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-20T14:45:00Z'
  },
  {
    id: 'sr-002',
    name: 'Van Gogh Experience - Online Store',
    type: 'online',
    eventId: 'evt-002',
    warehouseIds: ['wh-002'],
    channelIds: ['ch-001', 'ch-002'],
    productChannelMapping: {
      'p-007': ['ch-001', 'ch-002'],
      'p-008': ['ch-001', 'ch-002'],
      'p-009': ['ch-001'],
      'p-010': ['ch-001', 'ch-002'],
      'p-011': ['ch-002'],
    },
    status: 'active',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-25T16:20:00Z'
  },
  {
    id: 'sr-003',
    name: 'Hans Zimmer - VIP Merchandise',
    type: 'online',
    eventId: 'evt-003',
    warehouseIds: ['wh-001'],
    channelIds: ['ch-001', 'ch-004', 'ch-005'],
    status: 'draft',
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-01T11:00:00Z'
  },
  {
    id: 'sr-004',
    name: 'Tapas Tour - Food & Gifts',
    type: 'onsite',
    eventId: 'evt-004',
    warehouseIds: ['wh-004'],
    status: 'inactive',
    createdAt: '2025-12-20T08:30:00Z',
    updatedAt: '2026-01-05T10:00:00Z'
  },
];

// Helper functions
export function getEventById(id: string): Event | undefined {
  return events.find(e => e.id === id);
}

export function getWarehouseById(id: string): Warehouse | undefined {
  return warehouses.find(w => w.id === id);
}

export function getProductsByWarehouseId(warehouseId: string): Product[] {
  return products.filter(p => p.warehouseId === warehouseId);
}

export function getProductsByWarehouseIds(warehouseIds: string[]): Product[] {
  return products.filter(p => warehouseIds.includes(p.warehouseId));
}

export function getChannelById(id: string): Channel | undefined {
  return channels.find(c => c.id === id);
}
