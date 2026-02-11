// Types
export interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  city: string;
  status: 'active' | 'draft' | 'ended';
}

export type IntegrationProvider = 'square' | 'shopify';

export interface CatalogIntegration {
  id: string;
  name: string;
  provider: IntegrationProvider;
  externalAccountId: string;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  integration: 'Square' | 'Shopify' | 'Manual';
  externalLocationId: string;
  productCount: number;
  masterCatalogId: string;
}

// Products belong to the catalog integration, not individual warehouses
export interface Product {
  id: string;
  name: string;
  sku: string;
  imageUrl?: string;
  pendingSync?: boolean; // If true, product is hidden until "Sync" is clicked
  syncedAt?: string; // Timestamp when product was synced
}

// ProductWarehouse links products to warehouses with warehouse-specific attributes
export interface ProductWarehouse {
  productId: string;
  warehouseId: string;
  price: number;
  currency: string;
  stock: number;
}

export interface Channel {
  id: string;
  name: string;
  type: 'onsite' | 'marketplace' | 'whitelabel' | 'kiosk' | 'ota';
  icon?: string;
}

// Channel type categories — groups granular channel types into Fever Zone filter categories
export type ChannelTypeCategory = 'box-office' | 'marketplace' | 'kiosk' | 'api';

export const CHANNEL_TYPE_CATEGORIES: Record<Channel['type'], ChannelTypeCategory> = {
  onsite: 'box-office',
  marketplace: 'marketplace',
  whitelabel: 'marketplace',
  kiosk: 'kiosk',
  ota: 'api',
};

export const CHANNEL_TYPE_LABELS: Record<ChannelTypeCategory, string> = {
  'box-office': 'Box Office',
  marketplace: 'Marketplace',
  kiosk: 'Kiosk',
  api: 'API',
};

export function getChannelTypeCategory(channel: Channel): ChannelTypeCategory {
  return CHANNEL_TYPE_CATEGORIES[channel.type];
}

// Product categorization (imported from Square categories)
export interface Hierarchy {
  id: string;
  name: string;
  retailSetupId: string; // FK to CatalogIntegration
}

export interface HierarchyElement {
  id: string;
  hierarchyId: string;
  parentId: string | null; // null = root category
  name: string;
  externalId?: string; // Square's category_id
}

export interface HierarchyElementProduct {
  hierarchyElementId: string;
  productId: string;
}

// Product Channel Visibility - controls which products are visible in each channel
export interface ProductChannelVisibility {
  productId: string;
  channelId: string;
  routingId: string;  // Scoped to a specific sales routing
  visible: boolean;
}

// Default visibility setting for channel-warehouse assignments
export type DefaultVisibility = 'all' | 'none';

// DEPRECATED: Keeping for backwards compatibility during migration
export type RoutingType = 'onsite' | 'online';
export type RoutingStatus = 'active' | 'inactive' | 'draft';

export interface SalesRouting {
  id: string;
  name?: string; // DEPRECATED: Use event name instead (1:1 relationship)
  type?: RoutingType; // DEPRECATED: No longer used in new data model
  eventId: string;
  warehouseIds: string[];
  priceReferenceWarehouseId?: string; // Required when Box-Office channel selected with multiple warehouses
  channelIds: string[]; // All selected channels (including Box-Office)
  channelWarehouseMapping: Record<string, string>; // Maps each channel to one warehouse
  channelDefaultVisibility?: Record<string, DefaultVisibility>; // Default visibility per channel when routing created
  selectedProductIds?: string[]; // DEPRECATED: Product visibility handled separately
  productChannelMapping?: Record<string, string[]>; // DEPRECATED: kept for backwards compat
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

// Mock Catalog Integration (one per partner, or null if none exists)
export const catalogIntegration: CatalogIntegration | null = {
  id: 'ci-001',
  name: 'ES - Shops',
  provider: 'square',
  externalAccountId: 'sq_acc_12345',
  createdAt: '2025-11-15'
};

// Mock Warehouses
export const warehouses: Warehouse[] = [
  {
    id: 'wh-001',
    name: 'ES - Shops Square Testing',
    integration: 'Square',
    externalLocationId: 'LOC_SQ_001',
    productCount: 45,
    masterCatalogId: 'sq0idp-X1_ry5W0fWF9BfDZ5uEPw'
  },
  {
    id: 'wh-002',
    name: 'ES - Shops Shopify Testing',
    integration: 'Shopify',
    externalLocationId: 'LOC_SHOP_001',
    productCount: 32,
    masterCatalogId: 'b08wxf-pi.myshopify.com'
  },
  {
    id: 'wh-003',
    name: 'Deprecated',
    integration: 'Square',
    externalLocationId: 'LOC_SQ_002',
    productCount: 18,
    masterCatalogId: 'sq0idp-z_n59C027k5_B1_C66_7DQ'
  },
  {
    id: 'wh-004',
    name: 'Barcelona Merchandise',
    integration: 'Shopify',
    externalLocationId: 'LOC_SHOP_002',
    productCount: 67,
    masterCatalogId: 'bcn-merch.myshopify.com'
  },
  {
    id: 'wh-005',
    name: 'New Arrivals (No Routing)',
    integration: 'Square',
    externalLocationId: 'LOC_SQ_003',
    productCount: 5,
    masterCatalogId: 'sq0idp-new-arrivals'
  },
  {
    id: 'wh-006',
    name: 'Online-Only Merchandise',
    integration: 'Square',
    externalLocationId: 'LOC_SQ_004',
    productCount: 12,
    masterCatalogId: 'sq0idp-online-merch'
  }
];

// Mock Products - catalog-level (same across all warehouses)
// Some products have imageUrl (via Pexels) for realistic thumbnails, others use placeholder
export const products: Product[] = [
  { id: 'p-001', name: 'Candlelight T-Shirt (Black)', sku: 'TSH-BLK-001', imageUrl: '/images/products/p-001.jpeg' },
  { id: 'p-002', name: 'Candlelight T-Shirt (White)', sku: 'TSH-WHT-001', imageUrl: '/images/products/p-002.jpeg' },
  { id: 'p-003', name: 'Concert Poster (A2)', sku: 'POS-A2-001', imageUrl: '/images/products/p-003.jpeg' },
  { id: 'p-004', name: 'Vinyl Record - Classical Hits', sku: 'VNL-CLS-001' },
  { id: 'p-005', name: 'Scented Candle Set (3 pack)', sku: 'CND-SET-001', imageUrl: '/images/products/p-005.jpeg' },
  { id: 'p-006', name: 'Tote Bag - Candlelight Design', sku: 'BAG-TOT-001' },
  { id: 'p-007', name: 'Van Gogh Starry Night Print', sku: 'VG-PRT-001', imageUrl: '/images/products/p-007.jpeg' },
  { id: 'p-008', name: 'Van Gogh Sunflowers Mug', sku: 'VG-MUG-001' },
  { id: 'p-009', name: 'Art Book - Van Gogh Collection', sku: 'VG-BK-001', imageUrl: '/images/products/p-009.jpeg' },
  { id: 'p-010', name: 'Puzzle - Starry Night (1000pc)', sku: 'VG-PZL-001' },
  { id: 'p-011', name: 'VR Headset Rental', sku: 'VG-VR-001' },
  { id: 'p-012', name: 'Barcelona City Map Poster', sku: 'BCN-MAP-001', imageUrl: '/images/products/p-012.jpeg' },
  { id: 'p-013', name: 'Tapas Recipe Book', sku: 'BCN-BK-001' },
  { id: 'p-014', name: 'Wine Tasting Set', sku: 'BCN-WINE-001', imageUrl: '/images/products/p-014.jpeg' }, // In wh-005 (no routing) - unpublished
  
  // Pending sync products - hidden until "Sync products" is clicked
  // p-new-001: In wh-001 (has onsite routing) → auto-published after sync
  // p-new-002: In wh-002 (has online routing sr-002) but not in selectedProductIds → "Not in online routing"
  // p-new-003: In wh-005 (no routing) → "No routing configured"
  { id: 'p-new-001', name: 'Limited Edition Poster', sku: 'LTD-POST-001', pendingSync: true, imageUrl: '/images/products/p-new-001.jpeg' },
  { id: 'p-new-002', name: 'VIP Experience Package', sku: 'VIP-EXP-001', pendingSync: true },
  { id: 'p-new-003', name: 'Exclusive Vinyl Record', sku: 'VINYL-EXC-001', pendingSync: true },
];

// Mock ProductWarehouses - warehouse-specific stock and prices
// A product can exist in multiple warehouses with different stock/price
export const productWarehouses: ProductWarehouse[] = [
  // Products in wh-001 (ES - Shops Square Testing)
  { productId: 'p-001', warehouseId: 'wh-001', price: 29.99, currency: 'EUR', stock: 150 },
  { productId: 'p-002', warehouseId: 'wh-001', price: 29.99, currency: 'EUR', stock: 120 },
  { productId: 'p-003', warehouseId: 'wh-001', price: 15.00, currency: 'EUR', stock: 200 },
  { productId: 'p-004', warehouseId: 'wh-001', price: 34.99, currency: 'EUR', stock: 50 },
  { productId: 'p-005', warehouseId: 'wh-001', price: 24.99, currency: 'EUR', stock: 80 },
  { productId: 'p-006', warehouseId: 'wh-001', price: 19.99, currency: 'EUR', stock: 100 },
  
  // Some products also in wh-003 (Deprecated) - with different prices/stock
  { productId: 'p-001', warehouseId: 'wh-003', price: 27.99, currency: 'EUR', stock: 45 },
  { productId: 'p-002', warehouseId: 'wh-003', price: 27.99, currency: 'EUR', stock: 30 },
  { productId: 'p-004', warehouseId: 'wh-003', price: 32.99, currency: 'EUR', stock: 20 },
  
  // Products in wh-002 (ES - Shops Shopify Testing)
  { productId: 'p-007', warehouseId: 'wh-002', price: 45.00, currency: 'EUR', stock: 75 },
  { productId: 'p-008', warehouseId: 'wh-002', price: 18.00, currency: 'EUR', stock: 200 },
  { productId: 'p-009', warehouseId: 'wh-002', price: 39.99, currency: 'EUR', stock: 40 },
  { productId: 'p-010', warehouseId: 'wh-002', price: 22.00, currency: 'EUR', stock: 60 },
  { productId: 'p-011', warehouseId: 'wh-002', price: 10.00, currency: 'EUR', stock: 30 },
  
  // Products in wh-004 (Barcelona Merchandise)
  { productId: 'p-012', warehouseId: 'wh-004', price: 12.00, currency: 'EUR', stock: 150 },
  { productId: 'p-013', warehouseId: 'wh-004', price: 28.00, currency: 'EUR', stock: 45 },
  
  // Products in wh-005 (New Arrivals - NO ROUTING configured)
  { productId: 'p-014', warehouseId: 'wh-005', price: 55.00, currency: 'EUR', stock: 25 }, // Wine Tasting Set - unpublished
  
  // Pending sync products - warehouse assignments
  { productId: 'p-new-001', warehouseId: 'wh-001', price: 25.00, currency: 'EUR', stock: 100 }, // → auto-published via sr-001 (onsite)
  { productId: 'p-new-002', warehouseId: 'wh-006', price: 89.00, currency: 'EUR', stock: 50 },  // → wh-006 has online routing sr-005, but not in selectedProductIds
  { productId: 'p-new-003', warehouseId: 'wh-005', price: 42.00, currency: 'EUR', stock: 30 },  // → wh-005 has no routing
];

// Mock Channels - Box-Office is a special onsite channel
export const channels: Channel[] = [
  { id: 'box-office', name: 'Box Office', type: 'onsite' },
  { id: 'ch-001', name: 'Fever Marketplace', type: 'marketplace' },
  { id: 'ch-002', name: 'Whitelabel', type: 'whitelabel' },
  { id: 'ch-003', name: 'Kiosk', type: 'kiosk' },
  { id: 'ch-004', name: 'GetYourGuide', type: 'ota' },
  { id: 'ch-005', name: 'Viator', type: 'ota' },
  { id: 'ch-006', name: 'Tiqets', type: 'ota' },
];

// Helper to check if a channel is the Box Office (onsite)
export function isBoxOfficeChannel(channelId: string): boolean {
  return channelId === 'box-office';
}

// Helper to check if any selected channels are online (not Box Office)
export function hasOnlineChannels(channelIds: string[]): boolean {
  return channelIds.some(id => id !== 'box-office');
}

// Helper to check if Box Office is selected
export function hasBoxOfficeChannel(channelIds: string[]): boolean {
  return channelIds.includes('box-office');
}

// Mock Hierarchy (Product Categories) - imported from Square
export const hierarchies: Hierarchy[] = [
  { id: 'hier-001', name: 'Square Categories', retailSetupId: 'ci-001' }
];

export const hierarchyElements: HierarchyElement[] = [
  // Root categories
  { id: 'he-001', hierarchyId: 'hier-001', parentId: null, name: 'Apparel', externalId: 'SQ_CAT_APPAREL' },
  { id: 'he-002', hierarchyId: 'hier-001', parentId: null, name: 'Art & Prints', externalId: 'SQ_CAT_ART' },
  { id: 'he-003', hierarchyId: 'hier-001', parentId: null, name: 'Music', externalId: 'SQ_CAT_MUSIC' },
  { id: 'he-004', hierarchyId: 'hier-001', parentId: null, name: 'Home & Living', externalId: 'SQ_CAT_HOME' },
  { id: 'he-005', hierarchyId: 'hier-001', parentId: null, name: 'Books', externalId: 'SQ_CAT_BOOKS' },
  { id: 'he-006', hierarchyId: 'hier-001', parentId: null, name: 'Experiences', externalId: 'SQ_CAT_EXP' },
  { id: 'he-007', hierarchyId: 'hier-001', parentId: null, name: 'Food & Wine', externalId: 'SQ_CAT_FOOD' },
  
  // Subcategories under Apparel
  { id: 'he-001-1', hierarchyId: 'hier-001', parentId: 'he-001', name: 'T-Shirts', externalId: 'SQ_CAT_TSHIRTS' },
  { id: 'he-001-2', hierarchyId: 'hier-001', parentId: 'he-001', name: 'Bags', externalId: 'SQ_CAT_BAGS' },
  
  // Subcategories under Home & Living
  { id: 'he-004-1', hierarchyId: 'hier-001', parentId: 'he-004', name: 'Candles', externalId: 'SQ_CAT_CANDLES' },
  { id: 'he-004-2', hierarchyId: 'hier-001', parentId: 'he-004', name: 'Mugs', externalId: 'SQ_CAT_MUGS' },
  { id: 'he-004-3', hierarchyId: 'hier-001', parentId: 'he-004', name: 'Puzzles', externalId: 'SQ_CAT_PUZZLES' },
];

// Product-Category assignments
export const hierarchyElementProducts: HierarchyElementProduct[] = [
  // Apparel > T-Shirts
  { hierarchyElementId: 'he-001-1', productId: 'p-001' }, // Candlelight T-Shirt (Black)
  { hierarchyElementId: 'he-001-1', productId: 'p-002' }, // Candlelight T-Shirt (White)
  // Apparel > Bags
  { hierarchyElementId: 'he-001-2', productId: 'p-006' }, // Tote Bag
  
  // Art & Prints
  { hierarchyElementId: 'he-002', productId: 'p-003' },   // Concert Poster
  { hierarchyElementId: 'he-002', productId: 'p-007' },   // Van Gogh Starry Night Print
  { hierarchyElementId: 'he-002', productId: 'p-012' },   // Barcelona City Map Poster
  { hierarchyElementId: 'he-002', productId: 'p-new-001' }, // Limited Edition Poster
  
  // Music
  { hierarchyElementId: 'he-003', productId: 'p-004' },   // Vinyl Record - Classical Hits
  { hierarchyElementId: 'he-003', productId: 'p-new-003' }, // Exclusive Vinyl Record
  
  // Home & Living > Candles
  { hierarchyElementId: 'he-004-1', productId: 'p-005' }, // Scented Candle Set
  // Home & Living > Mugs
  { hierarchyElementId: 'he-004-2', productId: 'p-008' }, // Van Gogh Sunflowers Mug
  // Home & Living > Puzzles
  { hierarchyElementId: 'he-004-3', productId: 'p-010' }, // Puzzle - Starry Night
  
  // Books
  { hierarchyElementId: 'he-005', productId: 'p-009' },   // Art Book - Van Gogh Collection
  { hierarchyElementId: 'he-005', productId: 'p-013' },   // Tapas Recipe Book
  
  // Experiences
  { hierarchyElementId: 'he-006', productId: 'p-011' },   // VR Headset Rental
  { hierarchyElementId: 'he-006', productId: 'p-new-002' }, // VIP Experience Package
  
  // Food & Wine
  { hierarchyElementId: 'he-007', productId: 'p-014' },   // Wine Tasting Set
];

// Helper to get category for a product
export function getProductCategory(productId: string): HierarchyElement | null {
  const assignment = hierarchyElementProducts.find(hep => hep.productId === productId);
  if (!assignment) return null;
  return hierarchyElements.find(he => he.id === assignment.hierarchyElementId) || null;
}

// Helper to get full category path (e.g., "Apparel > T-Shirts")
export function getProductCategoryPath(productId: string): string {
  const category = getProductCategory(productId);
  if (!category) return 'Uncategorized';
  
  if (category.parentId) {
    const parent = hierarchyElements.find(he => he.id === category.parentId);
    if (parent) {
      return `${parent.name} > ${category.name}`;
    }
  }
  return category.name;
}

// Helper to get root categories only
export function getRootCategories(): HierarchyElement[] {
  return hierarchyElements.filter(he => he.parentId === null);
}

// Helper to get all categories (flat list for filter dropdown)
export function getAllCategories(): HierarchyElement[] {
  return hierarchyElements;
}

// Mock Sales Routings - Updated to new data model with channelWarehouseMapping
export const salesRoutings: SalesRouting[] = [
  {
    id: 'sr-001',
    eventId: 'evt-001',
    warehouseIds: ['wh-001', 'wh-002'],
    priceReferenceWarehouseId: 'wh-001',
    channelIds: ['box-office', 'ch-001'],
    channelWarehouseMapping: {
      'box-office': 'wh-001', // Box Office uses wh-001 (configured per setup later)
      'ch-001': 'wh-002', // Fever Marketplace uses wh-002
    },
    status: 'active',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-20T14:45:00Z'
  },
  {
    id: 'sr-002',
    eventId: 'evt-002',
    warehouseIds: ['wh-002'],
    channelIds: ['ch-001', 'ch-002'],
    channelWarehouseMapping: {
      'ch-001': 'wh-002',
      'ch-002': 'wh-002',
    },
    status: 'active',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-25T16:20:00Z'
  },
  {
    id: 'sr-003',
    eventId: 'evt-003',
    warehouseIds: ['wh-001'],
    channelIds: ['ch-001', 'ch-004', 'ch-005'],
    channelWarehouseMapping: {
      'ch-001': 'wh-001',
      'ch-004': 'wh-001',
      'ch-005': 'wh-001',
    },
    status: 'draft',
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-01T11:00:00Z'
  },
  {
    id: 'sr-004',
    eventId: 'evt-004',
    warehouseIds: ['wh-004'],
    channelIds: ['box-office'],
    channelWarehouseMapping: {
      'box-office': 'wh-004',
    },
    status: 'inactive',
    createdAt: '2025-12-20T08:30:00Z',
    updatedAt: '2026-01-05T10:00:00Z'
  },
  {
    id: 'sr-005',
    eventId: 'evt-005',
    warehouseIds: ['wh-006'],
    channelIds: ['ch-001', 'ch-002'],
    channelWarehouseMapping: {
      'ch-001': 'wh-006',
      'ch-002': 'wh-006',
    },
    status: 'active',
    createdAt: '2026-01-28T09:00:00Z',
    updatedAt: '2026-01-28T09:00:00Z'
  },
];

// Helper functions
export function getEventById(id: string): Event | undefined {
  return events.find(e => e.id === id);
}

export function getWarehouseById(id: string): Warehouse | undefined {
  return warehouses.find(w => w.id === id);
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

// Get all products in the catalog
export function getAllProducts(): Product[] {
  return products;
}

// Get products that exist in a specific warehouse
export function getProductsByWarehouseId(warehouseId: string): Product[] {
  const productIds = productWarehouses
    .filter(pw => pw.warehouseId === warehouseId)
    .map(pw => pw.productId);
  return products.filter(p => productIds.includes(p.id));
}

// Get products that exist in any of the given warehouses
export function getProductsByWarehouseIds(warehouseIds: string[]): Product[] {
  const productIds = productWarehouses
    .filter(pw => warehouseIds.includes(pw.warehouseId))
    .map(pw => pw.productId);
  // Remove duplicates
  const uniqueProductIds = [...new Set(productIds)];
  return products.filter(p => uniqueProductIds.includes(p.id));
}

// Get all warehouses that contain a specific product
export interface ProductWarehouseDetails {
  warehouse: Warehouse;
  price: number;
  currency: string;
  stock: number;
}

export function getWarehousesForProduct(productId: string): ProductWarehouseDetails[] {
  return productWarehouses
    .filter(pw => pw.productId === productId)
    .map(pw => {
      const warehouse = getWarehouseById(pw.warehouseId);
      if (!warehouse) return null;
      return {
        warehouse,
        price: pw.price,
        currency: pw.currency,
        stock: pw.stock,
      };
    })
    .filter((item): item is ProductWarehouseDetails => item !== null);
}

// Get warehouse-specific details for a product
export function getProductWarehouseDetails(productId: string, warehouseId: string): ProductWarehouse | undefined {
  return productWarehouses.find(pw => pw.productId === productId && pw.warehouseId === warehouseId);
}

export function getChannelById(id: string): Channel | undefined {
  return channels.find(c => c.id === id);
}

export function getSalesRoutingById(id: string): SalesRouting | undefined {
  return salesRoutings.find(sr => sr.id === id);
}

// Box Office Setups (for onsite routings)
export interface BoxOfficeSetup {
  id: string;
  name: string;
  salesRoutingId: string;
  warehouseId: string; // Which warehouse this setup consumes stock from
}

// Product Publications - links products to session types via sales routings
export interface ProductPublication {
  productId: string;
  salesRoutingId: string;
  sessionTypeId: string; // 8-digit ID in Fever's system
}

export const boxOfficeSetups: BoxOfficeSetup[] = [
  { id: 'bos-001', name: 'Main Entrance POS', salesRoutingId: 'sr-001', warehouseId: 'wh-001' },
  { id: 'bos-002', name: 'Gift Shop', salesRoutingId: 'sr-001', warehouseId: 'wh-002' },
  { id: 'bos-003', name: 'VIP Lounge', salesRoutingId: 'sr-001', warehouseId: 'wh-001' },
  { id: 'bos-004', name: 'Food Court Kiosk', salesRoutingId: 'sr-004', warehouseId: 'wh-004' },
];

export function getBoxOfficeSetupsByRoutingId(routingId: string): BoxOfficeSetup[] {
  return boxOfficeSetups.filter(setup => setup.salesRoutingId === routingId);
}

// Catalog Integration helpers
export function getCatalogIntegration(): CatalogIntegration | null {
  return catalogIntegration;
}

export function getWarehousesByIntegration(provider: IntegrationProvider): Warehouse[] {
  const providerName = provider === 'square' ? 'Square' : 'Shopify';
  return warehouses.filter(w => w.integration === providerName);
}

// Mock Product Publications
// These are created when a sales routing is set up - each product gets a session type in the event
export const productPublications: ProductPublication[] = [
  // Products from wh-001 published via sr-001 (Candlelight Taylor Swift - Onsite)
  { productId: 'p-001', salesRoutingId: 'sr-001', sessionTypeId: '10234567' },
  { productId: 'p-002', salesRoutingId: 'sr-001', sessionTypeId: '10234568' },
  { productId: 'p-003', salesRoutingId: 'sr-001', sessionTypeId: '10234569' },
  { productId: 'p-004', salesRoutingId: 'sr-001', sessionTypeId: '10234570' },
  { productId: 'p-005', salesRoutingId: 'sr-001', sessionTypeId: '10234571' },
  { productId: 'p-006', salesRoutingId: 'sr-001', sessionTypeId: '10234572' },
  
  // Products from wh-001 also published via sr-003 (Hans Zimmer - VIP Merchandise)
  { productId: 'p-001', salesRoutingId: 'sr-003', sessionTypeId: '30567891' },
  { productId: 'p-002', salesRoutingId: 'sr-003', sessionTypeId: '30567892' },
  { productId: 'p-004', salesRoutingId: 'sr-003', sessionTypeId: '30567893' },
  
  // Products from wh-002 published via sr-001 (Candlelight Taylor Swift - uses both warehouses)
  { productId: 'p-007', salesRoutingId: 'sr-001', sessionTypeId: '10234580' },
  { productId: 'p-008', salesRoutingId: 'sr-001', sessionTypeId: '10234581' },
  
  // Products from wh-002 published via sr-002 (Van Gogh Experience - Online Store)
  { productId: 'p-007', salesRoutingId: 'sr-002', sessionTypeId: '20456789' },
  { productId: 'p-008', salesRoutingId: 'sr-002', sessionTypeId: '20456790' },
  { productId: 'p-009', salesRoutingId: 'sr-002', sessionTypeId: '20456791' },
  { productId: 'p-010', salesRoutingId: 'sr-002', sessionTypeId: '20456792' },
  { productId: 'p-011', salesRoutingId: 'sr-002', sessionTypeId: '20456793' },
  
  // Products from wh-004 published via sr-004 (Tapas Tour - Food & Gifts)
  { productId: 'p-012', salesRoutingId: 'sr-004', sessionTypeId: '40123456' },
  { productId: 'p-013', salesRoutingId: 'sr-004', sessionTypeId: '40123457' },
  // Note: p-014 (Wine Tasting Set) is NOT published - in wh-005 which has no routing
  
  // Pending sync product p-new-001 - auto-published via onsite routing sr-001
  // (Hidden until sync because product has pendingSync: true)
  { productId: 'p-new-001', salesRoutingId: 'sr-001', sessionTypeId: '10234599' },
];

// Get all publications for a product with resolved data
export interface ResolvedProductPublication {
  sessionTypeId: string;
  salesRouting: SalesRouting;
  event: Event;
}

export function getProductPublications(productId: string): ResolvedProductPublication[] {
  return productPublications
    .filter(pub => pub.productId === productId)
    .map(pub => {
      const salesRouting = getSalesRoutingById(pub.salesRoutingId);
      const event = salesRouting ? getEventById(salesRouting.eventId) : undefined;
      
      if (!salesRouting || !event) return null;
      
      return {
        sessionTypeId: pub.sessionTypeId,
        salesRouting,
        event,
      };
    })
    .filter((pub): pub is ResolvedProductPublication => pub !== null);
}

// Publication status helpers
export type UnpublishedReason = 
  | { type: 'no-routing' }  // Warehouse has no routing at all
  | { type: 'not-selected'; routings: SalesRouting[] };  // Routing exists but product not in selected channels

/**
 * Check if a product is published anywhere.
 * A product is published if it's in a warehouse that's mapped to at least one channel.
 */
export function isProductPublished(productId: string): boolean {
  // Get warehouses this product is in
  const productWarehouseIds = productWarehouses
    .filter(pw => pw.productId === productId)
    .map(pw => pw.warehouseId);
  
  return salesRoutings.some(routing => {
    // Check if any of the product's warehouses is used in this routing's channel mappings
    return Object.values(routing.channelWarehouseMapping).some(warehouseId => 
      productWarehouseIds.includes(warehouseId)
    );
  });
}

/**
 * Returns the reason why a product is unpublished, or null if published.
 * Distinguishes between:
 * - 'no-routing': No sales routing exists for the product's warehouses
 * - 'not-selected': Routing(s) exist for warehouse but product not in channel mapping
 */
export function getUnpublishedReason(productId: string): UnpublishedReason | null {
  if (isProductPublished(productId)) return null;
  
  // Get warehouses this product is in
  const productWarehouseIds = productWarehouses
    .filter(pw => pw.productId === productId)
    .map(pw => pw.warehouseId);
  
  // Find routings that use any of this product's warehouses
  const availableRoutings = salesRoutings.filter(routing => 
    routing.warehouseIds.some(whId => productWarehouseIds.includes(whId))
  );
  
  if (availableRoutings.length > 0) {
    // Routing exists but product's warehouse isn't mapped to any channel
    return { type: 'not-selected', routings: availableRoutings };
  }
  
  // No routing exists for this product's warehouses
  return { type: 'no-routing' };
}

/**
 * Get all unpublished products (excluding pending sync products)
 */
export function getUnpublishedProducts(includePendingSync = false): Product[] {
  return products.filter(p => {
    if (!includePendingSync && p.pendingSync) return false;
    return !isProductPublished(p.id);
  });
}
