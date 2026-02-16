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

// ---------------------------------------------------------------------------
// Variant types — shared across catalog and POS
// ---------------------------------------------------------------------------

/** A single variant axis, e.g. { name: "Size", values: ["S","M","L","XL"] } */
export interface VariantAxis {
  name: string;
  values: string[];
}

/** One concrete variant combination for a parent product */
export interface ProductVariant {
  id: string;                         // e.g. 'p-001-s'
  parentProductId: string;
  sku: string;
  attributes: Record<string, string>; // e.g. { Size: "S" }
  label: string;                      // display string, e.g. "S"
}

// Products belong to the catalog integration, not individual warehouses
export interface Product {
  id: string;
  name: string;
  sku: string;
  imageUrl?: string;
  pendingSync?: boolean; // If true, product is hidden until "Sync" is clicked
  syncedAt?: string; // Timestamp when product was synced
  variantAxes?: VariantAxis[];     // undefined = simple product (no variants)
  variants?: ProductVariant[];     // the concrete variant combinations
}

// ProductWarehouse links products to warehouses with warehouse-specific attributes
export interface ProductWarehouse {
  productId: string;
  warehouseId: string;
  price: number;
  memberPrice?: number; // Discounted price for identified members
  currency: string;
  stock: number;
  variantId?: string; // references ProductVariant.id; omitted for simple products
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

// Mock Warehouses — matches demo warehouses from productPool.ts
export const warehouses: Warehouse[] = [
  {
    id: 'wh-demo-main',
    name: 'Main Store',
    integration: 'Square',
    externalLocationId: 'LOC_MAIN_001',
    productCount: 25,
    masterCatalogId: 'sq_merchant_demo_12345'
  },
  {
    id: 'wh-demo-gift',
    name: 'Gift Shop',
    integration: 'Square',
    externalLocationId: 'LOC_GIFT_001',
    productCount: 10,
    masterCatalogId: 'sq_merchant_demo_12345'
  },
  {
    id: 'wh-demo-popup',
    name: 'Pop-up Store',
    integration: 'Square',
    externalLocationId: 'LOC_POPUP_001',
    productCount: 6,
    masterCatalogId: 'sq_merchant_demo_12345'
  }
];

// Mock Products — matches demo products from productPool.ts (DEMO_PRODUCTS + SECOND_SYNC_PRODUCTS)
// ~30% intentionally have no image to show realistic placeholder mix
export const products: Product[] = [
  // Apparel (6) — first 3 have size variants
  {
    id: 'demo-p-001', name: 'Event T-Shirt (Black)', sku: 'TSH-BLK-001', imageUrl: '/images/products/demo-p-001.jpeg',
    variantAxes: [{ name: 'Size', values: ['S', 'M', 'L', 'XL'] }],
    variants: [
      { id: 'demo-p-001-s',  parentProductId: 'demo-p-001', sku: 'TSH-BLK-S',  attributes: { Size: 'S' },  label: 'S' },
      { id: 'demo-p-001-m',  parentProductId: 'demo-p-001', sku: 'TSH-BLK-M',  attributes: { Size: 'M' },  label: 'M' },
      { id: 'demo-p-001-l',  parentProductId: 'demo-p-001', sku: 'TSH-BLK-L',  attributes: { Size: 'L' },  label: 'L' },
      { id: 'demo-p-001-xl', parentProductId: 'demo-p-001', sku: 'TSH-BLK-XL', attributes: { Size: 'XL' }, label: 'XL' },
    ],
  },
  {
    id: 'demo-p-002', name: 'Event T-Shirt (White)', sku: 'TSH-WHT-001', imageUrl: '/images/products/demo-p-002.jpeg',
    variantAxes: [{ name: 'Size', values: ['S', 'M', 'L', 'XL'] }],
    variants: [
      { id: 'demo-p-002-s',  parentProductId: 'demo-p-002', sku: 'TSH-WHT-S',  attributes: { Size: 'S' },  label: 'S' },
      { id: 'demo-p-002-m',  parentProductId: 'demo-p-002', sku: 'TSH-WHT-M',  attributes: { Size: 'M' },  label: 'M' },
      { id: 'demo-p-002-l',  parentProductId: 'demo-p-002', sku: 'TSH-WHT-L',  attributes: { Size: 'L' },  label: 'L' },
      { id: 'demo-p-002-xl', parentProductId: 'demo-p-002', sku: 'TSH-WHT-XL', attributes: { Size: 'XL' }, label: 'XL' },
    ],
  },
  {
    id: 'demo-p-003', name: 'Premium Hoodie (Gray)', sku: 'HOOD-GRY-001', imageUrl: '/images/products/demo-p-003.jpeg',
    variantAxes: [{ name: 'Size', values: ['S', 'M', 'L', 'XL'] }],
    variants: [
      { id: 'demo-p-003-s',  parentProductId: 'demo-p-003', sku: 'HOOD-GRY-S',  attributes: { Size: 'S' },  label: 'S' },
      { id: 'demo-p-003-m',  parentProductId: 'demo-p-003', sku: 'HOOD-GRY-M',  attributes: { Size: 'M' },  label: 'M' },
      { id: 'demo-p-003-l',  parentProductId: 'demo-p-003', sku: 'HOOD-GRY-L',  attributes: { Size: 'L' },  label: 'L' },
      { id: 'demo-p-003-xl', parentProductId: 'demo-p-003', sku: 'HOOD-GRY-XL', attributes: { Size: 'XL' }, label: 'XL' },
    ],
  },
  { id: 'demo-p-004', name: 'Vintage Cap', sku: 'CAP-VTG-001' },
  { id: 'demo-p-005', name: 'Concert Jacket', sku: 'JKT-CNT-001', imageUrl: '/images/products/demo-p-005.jpeg' },
  { id: 'demo-p-006', name: 'Limited Edition Beanie', sku: 'BNE-LTD-001' },
  
  // Accessories (4)
  { id: 'demo-p-007', name: 'Canvas Tote Bag', sku: 'BAG-TOT-001', imageUrl: '/images/products/demo-p-007.jpeg' },
  { id: 'demo-p-008', name: 'Enamel Pin Set', sku: 'PIN-SET-001', imageUrl: '/images/products/demo-p-008.jpeg' },
  { id: 'demo-p-009', name: 'Wristband Pack (3)', sku: 'WRB-PCK-001' },
  { id: 'demo-p-010', name: 'Lanyard with Badge Holder', sku: 'LNY-BDG-001' },
  
  // Home & Decor (4)
  { id: 'demo-p-011', name: 'Concert Poster (A2)', sku: 'POS-A2-001', imageUrl: '/images/products/demo-p-011.jpeg' },
  { id: 'demo-p-012', name: 'Scented Candle Set', sku: 'CND-SET-001', imageUrl: '/images/products/demo-p-012.jpeg' },
  { id: 'demo-p-013', name: 'Art Print Collection', sku: 'ART-PRT-001' },
  { id: 'demo-p-014', name: 'Photo Book', sku: 'PHO-BK-001', imageUrl: '/images/products/demo-p-014.jpeg' },
  
  // Collectibles (3)
  { id: 'demo-p-015', name: 'Vinyl Record - Live Album', sku: 'VNL-LIV-001', imageUrl: '/images/products/demo-p-015.jpeg' },
  { id: 'demo-p-016', name: 'Commemorative Coin', sku: 'CON-CMM-001' },
  { id: 'demo-p-017', name: 'Signed Photograph', sku: 'PHO-SGN-001', imageUrl: '/images/products/demo-p-017.jpeg' },
  
  // Food & Beverage (3)
  { id: 'demo-p-018', name: 'Gourmet Chocolate Box', sku: 'CHO-BOX-001', imageUrl: '/images/products/demo-p-018.jpeg' },
  { id: 'demo-p-019', name: 'Premium Coffee Blend', sku: 'COF-PRM-001' },
  { id: 'demo-p-020', name: 'Wine Tasting Set', sku: 'WIN-SET-001', imageUrl: '/images/products/demo-p-020.jpeg' },

  // Second sync products (5)
  {
    id: 'demo-p-021', name: 'Anniversary Edition T-Shirt', sku: 'TSH-ANV-001', imageUrl: '/images/products/demo-p-021.jpeg',
    variantAxes: [{ name: 'Size', values: ['S', 'M', 'L', 'XL'] }],
    variants: [
      { id: 'demo-p-021-s',  parentProductId: 'demo-p-021', sku: 'TSH-ANV-S',  attributes: { Size: 'S' },  label: 'S' },
      { id: 'demo-p-021-m',  parentProductId: 'demo-p-021', sku: 'TSH-ANV-M',  attributes: { Size: 'M' },  label: 'M' },
      { id: 'demo-p-021-l',  parentProductId: 'demo-p-021', sku: 'TSH-ANV-L',  attributes: { Size: 'L' },  label: 'L' },
      { id: 'demo-p-021-xl', parentProductId: 'demo-p-021', sku: 'TSH-ANV-XL', attributes: { Size: 'XL' }, label: 'XL' },
    ],
  },
  { id: 'demo-p-022', name: 'Exclusive Poster Bundle', sku: 'POS-BND-001', imageUrl: '/images/products/demo-p-022.jpeg' },
  { id: 'demo-p-023', name: 'VIP Experience Add-on', sku: 'VIP-ADD-001' },
  { id: 'demo-p-024', name: 'Collector\'s Box Set', sku: 'COL-BOX-001', imageUrl: '/images/products/demo-p-024.jpeg' },
  { id: 'demo-p-025', name: 'Digital Download Card', sku: 'DIG-DWN-001' },
];

// Mock ProductWarehouses — matches demo data from productPool.ts
// A product can exist in multiple warehouses with different stock/price
export const productWarehouses: ProductWarehouse[] = [
  // Main Store products (14) — variant products have per-variant rows
  // demo-p-001 Event T-Shirt (Black)
  { productId: 'demo-p-001', variantId: 'demo-p-001-s',  warehouseId: 'wh-demo-main', price: 29.99, memberPrice: 24.99, currency: 'EUR', stock: 30 },
  { productId: 'demo-p-001', variantId: 'demo-p-001-m',  warehouseId: 'wh-demo-main', price: 29.99, memberPrice: 24.99, currency: 'EUR', stock: 50 },
  { productId: 'demo-p-001', variantId: 'demo-p-001-l',  warehouseId: 'wh-demo-main', price: 29.99, memberPrice: 24.99, currency: 'EUR', stock: 45 },
  { productId: 'demo-p-001', variantId: 'demo-p-001-xl', warehouseId: 'wh-demo-main', price: 32.99, memberPrice: 27.99, currency: 'EUR', stock: 25 },
  // demo-p-002 Event T-Shirt (White)
  { productId: 'demo-p-002', variantId: 'demo-p-002-s',  warehouseId: 'wh-demo-main', price: 29.99, currency: 'EUR', stock: 25 },
  { productId: 'demo-p-002', variantId: 'demo-p-002-m',  warehouseId: 'wh-demo-main', price: 29.99, currency: 'EUR', stock: 40 },
  { productId: 'demo-p-002', variantId: 'demo-p-002-l',  warehouseId: 'wh-demo-main', price: 29.99, currency: 'EUR', stock: 35 },
  { productId: 'demo-p-002', variantId: 'demo-p-002-xl', warehouseId: 'wh-demo-main', price: 32.99, currency: 'EUR', stock: 20 },
  // demo-p-003 Premium Hoodie (Gray)
  { productId: 'demo-p-003', variantId: 'demo-p-003-s',  warehouseId: 'wh-demo-main', price: 59.99, currency: 'EUR', stock: 15 },
  { productId: 'demo-p-003', variantId: 'demo-p-003-m',  warehouseId: 'wh-demo-main', price: 59.99, currency: 'EUR', stock: 25 },
  { productId: 'demo-p-003', variantId: 'demo-p-003-l',  warehouseId: 'wh-demo-main', price: 59.99, currency: 'EUR', stock: 25 },
  { productId: 'demo-p-003', variantId: 'demo-p-003-xl', warehouseId: 'wh-demo-main', price: 64.99, currency: 'EUR', stock: 15 },
  { productId: 'demo-p-004', warehouseId: 'wh-demo-main', price: 24.99, memberPrice: 19.99, currency: 'EUR', stock: 100 },
  { productId: 'demo-p-005', warehouseId: 'wh-demo-main', price: 89.99, currency: 'EUR', stock: 40 },
  { productId: 'demo-p-006', warehouseId: 'wh-demo-main', price: 19.99, currency: 'EUR', stock: 200 },
  { productId: 'demo-p-007', warehouseId: 'wh-demo-main', price: 15.99, memberPrice: 12.99, currency: 'EUR', stock: 180 },
  { productId: 'demo-p-008', warehouseId: 'wh-demo-main', price: 12.99, currency: 'EUR', stock: 250 },
  { productId: 'demo-p-011', warehouseId: 'wh-demo-main', price: 18.00, currency: 'EUR', stock: 300 },
  { productId: 'demo-p-012', warehouseId: 'wh-demo-main', price: 34.99, memberPrice: 29.99, currency: 'EUR', stock: 60 },
  { productId: 'demo-p-015', warehouseId: 'wh-demo-main', price: 39.99, currency: 'EUR', stock: 50 },
  { productId: 'demo-p-016', warehouseId: 'wh-demo-main', price: 49.99, currency: 'EUR', stock: 100 },
  { productId: 'demo-p-017', warehouseId: 'wh-demo-main', price: 99.99, currency: 'EUR', stock: 25 },
  { productId: 'demo-p-018', warehouseId: 'wh-demo-main', price: 24.99, memberPrice: 19.99, currency: 'EUR', stock: 75 },
  // Products that were previously only in Gift Shop — now also in Main Store
  { productId: 'demo-p-009', warehouseId: 'wh-demo-main', price: 8.99, currency: 'EUR', stock: 150 },  // Wristband Pack (3)
  { productId: 'demo-p-010', warehouseId: 'wh-demo-main', price: 7.99, currency: 'EUR', stock: 200 },  // Lanyard with Badge Holder
  { productId: 'demo-p-013', warehouseId: 'wh-demo-main', price: 42.00, currency: 'EUR', stock: 35 },  // Art Print Collection
  { productId: 'demo-p-014', warehouseId: 'wh-demo-main', price: 32.00, currency: 'EUR', stock: 45 },  // Photo Book
  { productId: 'demo-p-019', warehouseId: 'wh-demo-main', price: 16.99, currency: 'EUR', stock: 80 },  // Premium Coffee Blend
  { productId: 'demo-p-020', warehouseId: 'wh-demo-main', price: 52.00, currency: 'EUR', stock: 25 },  // Wine Tasting Set
  // Products that were only in other warehouses — now also in Main Store
  { productId: 'demo-p-023', warehouseId: 'wh-demo-main', price: 139.99, currency: 'EUR', stock: 15 }, // VIP Experience Add-on
  { productId: 'demo-p-024', warehouseId: 'wh-demo-main', price: 74.99, currency: 'EUR', stock: 25 },  // Collector's Box Set
  { productId: 'demo-p-025', warehouseId: 'wh-demo-main', price: 12.99, currency: 'EUR', stock: 400 }, // Digital Download Card
  
  // Gift Shop products (10) - some overlap with Main Store (different prices)
  // demo-p-001 Event T-Shirt (Black)
  { productId: 'demo-p-001', variantId: 'demo-p-001-s',  warehouseId: 'wh-demo-gift', price: 32.99, currency: 'EUR', stock: 15 },
  { productId: 'demo-p-001', variantId: 'demo-p-001-m',  warehouseId: 'wh-demo-gift', price: 32.99, currency: 'EUR', stock: 25 },
  { productId: 'demo-p-001', variantId: 'demo-p-001-l',  warehouseId: 'wh-demo-gift', price: 32.99, currency: 'EUR', stock: 25 },
  { productId: 'demo-p-001', variantId: 'demo-p-001-xl', warehouseId: 'wh-demo-gift', price: 35.99, currency: 'EUR', stock: 15 },
  // demo-p-002 Event T-Shirt (White)
  { productId: 'demo-p-002', variantId: 'demo-p-002-s',  warehouseId: 'wh-demo-gift', price: 32.99, currency: 'EUR', stock: 12 },
  { productId: 'demo-p-002', variantId: 'demo-p-002-m',  warehouseId: 'wh-demo-gift', price: 32.99, currency: 'EUR', stock: 20 },
  { productId: 'demo-p-002', variantId: 'demo-p-002-l',  warehouseId: 'wh-demo-gift', price: 32.99, currency: 'EUR', stock: 18 },
  { productId: 'demo-p-002', variantId: 'demo-p-002-xl', warehouseId: 'wh-demo-gift', price: 35.99, currency: 'EUR', stock: 10 },
  { productId: 'demo-p-007', warehouseId: 'wh-demo-gift', price: 17.99, currency: 'EUR', stock: 100 },
  { productId: 'demo-p-008', warehouseId: 'wh-demo-gift', price: 14.99, currency: 'EUR', stock: 150 },
  { productId: 'demo-p-009', warehouseId: 'wh-demo-gift', price: 9.99, currency: 'EUR', stock: 200 },
  { productId: 'demo-p-010', warehouseId: 'wh-demo-gift', price: 8.99, currency: 'EUR', stock: 300 },
  { productId: 'demo-p-013', warehouseId: 'wh-demo-gift', price: 45.00, currency: 'EUR', stock: 40 },
  { productId: 'demo-p-014', warehouseId: 'wh-demo-gift', price: 35.00, currency: 'EUR', stock: 55 },
  { productId: 'demo-p-019', warehouseId: 'wh-demo-gift', price: 18.99, currency: 'EUR', stock: 90 },
  { productId: 'demo-p-020', warehouseId: 'wh-demo-gift', price: 55.00, currency: 'EUR', stock: 30 },
  
  // Pop-up Store products (6) - limited selection for pop-up events
  // demo-p-001 Event T-Shirt (Black)
  { productId: 'demo-p-001', variantId: 'demo-p-001-s',  warehouseId: 'wh-demo-popup', price: 34.99, currency: 'EUR', stock: 10 },
  { productId: 'demo-p-001', variantId: 'demo-p-001-m',  warehouseId: 'wh-demo-popup', price: 34.99, currency: 'EUR', stock: 15 },
  { productId: 'demo-p-001', variantId: 'demo-p-001-l',  warehouseId: 'wh-demo-popup', price: 34.99, currency: 'EUR', stock: 15 },
  { productId: 'demo-p-001', variantId: 'demo-p-001-xl', warehouseId: 'wh-demo-popup', price: 37.99, currency: 'EUR', stock: 10 },
  // demo-p-003 Premium Hoodie (Gray)
  { productId: 'demo-p-003', variantId: 'demo-p-003-s',  warehouseId: 'wh-demo-popup', price: 64.99, currency: 'EUR', stock: 5 },
  { productId: 'demo-p-003', variantId: 'demo-p-003-m',  warehouseId: 'wh-demo-popup', price: 64.99, currency: 'EUR', stock: 10 },
  { productId: 'demo-p-003', variantId: 'demo-p-003-l',  warehouseId: 'wh-demo-popup', price: 64.99, currency: 'EUR', stock: 10 },
  { productId: 'demo-p-003', variantId: 'demo-p-003-xl', warehouseId: 'wh-demo-popup', price: 69.99, currency: 'EUR', stock: 5 },
  { productId: 'demo-p-007', warehouseId: 'wh-demo-popup', price: 19.99, currency: 'EUR', stock: 60 },
  { productId: 'demo-p-011', warehouseId: 'wh-demo-popup', price: 22.00, currency: 'EUR', stock: 100 },
  { productId: 'demo-p-015', warehouseId: 'wh-demo-popup', price: 44.99, currency: 'EUR', stock: 25 },
  { productId: 'demo-p-016', warehouseId: 'wh-demo-popup', price: 54.99, currency: 'EUR', stock: 40 },

  // Second sync — Main Store gets 2
  // demo-p-021 Anniversary Edition T-Shirt — per-variant
  { productId: 'demo-p-021', variantId: 'demo-p-021-s',  warehouseId: 'wh-demo-main', price: 34.99, currency: 'EUR', stock: 20 },
  { productId: 'demo-p-021', variantId: 'demo-p-021-m',  warehouseId: 'wh-demo-main', price: 34.99, currency: 'EUR', stock: 30 },
  { productId: 'demo-p-021', variantId: 'demo-p-021-l',  warehouseId: 'wh-demo-main', price: 34.99, currency: 'EUR', stock: 30 },
  { productId: 'demo-p-021', variantId: 'demo-p-021-xl', warehouseId: 'wh-demo-main', price: 37.99, currency: 'EUR', stock: 20 },
  { productId: 'demo-p-022', warehouseId: 'wh-demo-main', price: 49.99, currency: 'EUR', stock: 50 },
  
  // Second sync — Gift Shop gets 1
  { productId: 'demo-p-023', warehouseId: 'wh-demo-gift', price: 149.99, currency: 'EUR', stock: 20 },
  
  // Second sync — Pop-up Store gets 2
  { productId: 'demo-p-024', warehouseId: 'wh-demo-popup', price: 79.99, currency: 'EUR', stock: 30 },
  { productId: 'demo-p-025', warehouseId: 'wh-demo-popup', price: 14.99, currency: 'EUR', stock: 500 },
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

// Product-Category assignments — matches DEMO_HIERARCHY_ELEMENT_PRODUCTS from productPool.ts
export const hierarchyElementProducts: HierarchyElementProduct[] = [
  // Apparel > T-Shirts (he-001-1)
  { hierarchyElementId: 'he-001-1', productId: 'demo-p-001' }, // Event T-Shirt (Black)
  { hierarchyElementId: 'he-001-1', productId: 'demo-p-002' }, // Event T-Shirt (White)
  { hierarchyElementId: 'he-001-1', productId: 'demo-p-021' }, // Anniversary Edition T-Shirt
  // Apparel (he-001) - other apparel
  { hierarchyElementId: 'he-001', productId: 'demo-p-003' }, // Premium Hoodie
  { hierarchyElementId: 'he-001', productId: 'demo-p-004' }, // Vintage Cap
  { hierarchyElementId: 'he-001', productId: 'demo-p-005' }, // Concert Jacket
  { hierarchyElementId: 'he-001', productId: 'demo-p-006' }, // Limited Edition Beanie
  
  // Apparel > Bags (he-001-2)
  { hierarchyElementId: 'he-001-2', productId: 'demo-p-007' }, // Canvas Tote Bag
  
  // Art & Prints (he-002)
  { hierarchyElementId: 'he-002', productId: 'demo-p-011' }, // Concert Poster
  { hierarchyElementId: 'he-002', productId: 'demo-p-013' }, // Art Print Collection
  { hierarchyElementId: 'he-002', productId: 'demo-p-022' }, // Exclusive Poster Bundle
  
  // Music (he-003)
  { hierarchyElementId: 'he-003', productId: 'demo-p-015' }, // Vinyl Record
  { hierarchyElementId: 'he-003', productId: 'demo-p-025' }, // Digital Download Card
  
  // Home & Living > Candles (he-004-1)
  { hierarchyElementId: 'he-004-1', productId: 'demo-p-012' }, // Scented Candle Set
  
  // Books (he-005)
  { hierarchyElementId: 'he-005', productId: 'demo-p-014' }, // Photo Book
  
  // Experiences (he-006)
  { hierarchyElementId: 'he-006', productId: 'demo-p-023' }, // VIP Experience Add-on
  
  // Food & Wine (he-007)
  { hierarchyElementId: 'he-007', productId: 'demo-p-018' }, // Gourmet Chocolate Box
  { hierarchyElementId: 'he-007', productId: 'demo-p-019' }, // Premium Coffee Blend
  { hierarchyElementId: 'he-007', productId: 'demo-p-020' }, // Wine Tasting Set
  
  // Accessories (no specific category, use root)
  { hierarchyElementId: 'he-001', productId: 'demo-p-008' }, // Enamel Pin Set
  { hierarchyElementId: 'he-001', productId: 'demo-p-009' }, // Wristband Pack
  { hierarchyElementId: 'he-001', productId: 'demo-p-010' }, // Lanyard
  
  // Collectibles - put under Music for now
  { hierarchyElementId: 'he-003', productId: 'demo-p-016' }, // Commemorative Coin
  { hierarchyElementId: 'he-002', productId: 'demo-p-017' }, // Signed Photograph
  { hierarchyElementId: 'he-003', productId: 'demo-p-024' }, // Collector's Box Set
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

// Mock Sales Routings — updated to use demo warehouse IDs
export const salesRoutings: SalesRouting[] = [
  {
    id: 'sr-001',
    eventId: 'evt-001',
    warehouseIds: ['wh-demo-main', 'wh-demo-gift'],
    priceReferenceWarehouseId: 'wh-demo-main',
    channelIds: ['box-office', 'ch-001'],
    channelWarehouseMapping: {
      'box-office': 'wh-demo-main',
      'ch-001': 'wh-demo-gift', // Fever Marketplace uses Gift Shop
    },
    status: 'active',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-20T14:45:00Z'
  },
  {
    id: 'sr-002',
    eventId: 'evt-002',
    warehouseIds: ['wh-demo-gift'],
    channelIds: ['ch-001', 'ch-002'],
    channelWarehouseMapping: {
      'ch-001': 'wh-demo-gift',
      'ch-002': 'wh-demo-gift',
    },
    status: 'active',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-25T16:20:00Z'
  },
  {
    id: 'sr-003',
    eventId: 'evt-003',
    warehouseIds: ['wh-demo-main'],
    channelIds: ['ch-001', 'ch-004', 'ch-005'],
    channelWarehouseMapping: {
      'ch-001': 'wh-demo-main',
      'ch-004': 'wh-demo-main',
      'ch-005': 'wh-demo-main',
    },
    status: 'draft',
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-01T11:00:00Z'
  },
  {
    id: 'sr-004',
    eventId: 'evt-004',
    warehouseIds: ['wh-demo-popup'],
    channelIds: ['box-office'],
    channelWarehouseMapping: {
      'box-office': 'wh-demo-popup',
    },
    status: 'inactive',
    createdAt: '2025-12-20T08:30:00Z',
    updatedAt: '2026-01-05T10:00:00Z'
  },
  {
    id: 'sr-005',
    eventId: 'evt-005',
    warehouseIds: ['wh-demo-popup'],
    channelIds: ['ch-001', 'ch-002'],
    channelWarehouseMapping: {
      'ch-001': 'wh-demo-popup',
      'ch-002': 'wh-demo-popup',
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
  { id: 'bos-001', name: 'Main Entrance POS', salesRoutingId: 'sr-001', warehouseId: 'wh-demo-main' },
  { id: 'bos-002', name: 'Gift Shop', salesRoutingId: 'sr-001', warehouseId: 'wh-demo-gift' },
  { id: 'bos-003', name: 'VIP Lounge', salesRoutingId: 'sr-001', warehouseId: 'wh-demo-main' },
  { id: 'bos-004', name: 'Pop-up Kiosk', salesRoutingId: 'sr-004', warehouseId: 'wh-demo-popup' },
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

// Mock Product Publications — derived from routing warehouse mappings
// sr-001: wh-demo-main (box-office) + wh-demo-gift (ch-001) → union of products in both warehouses
// sr-002: wh-demo-gift (ch-001, ch-002) → products in Gift Shop
// sr-003: wh-demo-main (ch-001, ch-004, ch-005) → products in Main Store
// sr-004: wh-demo-popup (box-office) → products in Pop-up Store
// sr-005: wh-demo-popup (ch-001, ch-002) → products in Pop-up Store
export const productPublications: ProductPublication[] = [
  // sr-001 — Candlelight Taylor Swift: Main Store (box-office) + Gift Shop (marketplace)
  // Main Store products: 001-008, 011, 012, 015-018, 021, 022
  // Gift Shop products: 001, 002, 007-010, 013, 014, 019, 020, 023
  // Union (deduplicated):
  { productId: 'demo-p-001', salesRoutingId: 'sr-001', sessionTypeId: '10234501' },
  { productId: 'demo-p-002', salesRoutingId: 'sr-001', sessionTypeId: '10234502' },
  { productId: 'demo-p-003', salesRoutingId: 'sr-001', sessionTypeId: '10234503' },
  { productId: 'demo-p-004', salesRoutingId: 'sr-001', sessionTypeId: '10234504' },
  { productId: 'demo-p-005', salesRoutingId: 'sr-001', sessionTypeId: '10234505' },
  { productId: 'demo-p-006', salesRoutingId: 'sr-001', sessionTypeId: '10234506' },
  { productId: 'demo-p-007', salesRoutingId: 'sr-001', sessionTypeId: '10234507' },
  { productId: 'demo-p-008', salesRoutingId: 'sr-001', sessionTypeId: '10234508' },
  { productId: 'demo-p-009', salesRoutingId: 'sr-001', sessionTypeId: '10234509' },
  { productId: 'demo-p-010', salesRoutingId: 'sr-001', sessionTypeId: '10234510' },
  { productId: 'demo-p-011', salesRoutingId: 'sr-001', sessionTypeId: '10234511' },
  { productId: 'demo-p-012', salesRoutingId: 'sr-001', sessionTypeId: '10234512' },
  { productId: 'demo-p-013', salesRoutingId: 'sr-001', sessionTypeId: '10234513' },
  { productId: 'demo-p-014', salesRoutingId: 'sr-001', sessionTypeId: '10234514' },
  { productId: 'demo-p-015', salesRoutingId: 'sr-001', sessionTypeId: '10234515' },
  { productId: 'demo-p-016', salesRoutingId: 'sr-001', sessionTypeId: '10234516' },
  { productId: 'demo-p-017', salesRoutingId: 'sr-001', sessionTypeId: '10234517' },
  { productId: 'demo-p-018', salesRoutingId: 'sr-001', sessionTypeId: '10234518' },
  { productId: 'demo-p-019', salesRoutingId: 'sr-001', sessionTypeId: '10234519' },
  { productId: 'demo-p-020', salesRoutingId: 'sr-001', sessionTypeId: '10234520' },
  { productId: 'demo-p-021', salesRoutingId: 'sr-001', sessionTypeId: '10234521' },
  { productId: 'demo-p-022', salesRoutingId: 'sr-001', sessionTypeId: '10234522' },
  { productId: 'demo-p-023', salesRoutingId: 'sr-001', sessionTypeId: '10234523' },
  
  // sr-002 — Van Gogh Experience: Gift Shop (marketplace + whitelabel)
  // Gift Shop products: 001, 002, 007-010, 013, 014, 019, 020, 023
  { productId: 'demo-p-001', salesRoutingId: 'sr-002', sessionTypeId: '20456701' },
  { productId: 'demo-p-002', salesRoutingId: 'sr-002', sessionTypeId: '20456702' },
  { productId: 'demo-p-007', salesRoutingId: 'sr-002', sessionTypeId: '20456707' },
  { productId: 'demo-p-008', salesRoutingId: 'sr-002', sessionTypeId: '20456708' },
  { productId: 'demo-p-009', salesRoutingId: 'sr-002', sessionTypeId: '20456709' },
  { productId: 'demo-p-010', salesRoutingId: 'sr-002', sessionTypeId: '20456710' },
  { productId: 'demo-p-013', salesRoutingId: 'sr-002', sessionTypeId: '20456713' },
  { productId: 'demo-p-014', salesRoutingId: 'sr-002', sessionTypeId: '20456714' },
  { productId: 'demo-p-019', salesRoutingId: 'sr-002', sessionTypeId: '20456719' },
  { productId: 'demo-p-020', salesRoutingId: 'sr-002', sessionTypeId: '20456720' },
  { productId: 'demo-p-023', salesRoutingId: 'sr-002', sessionTypeId: '20456723' },
  
  // sr-003 — Hans Zimmer: Main Store (marketplace + OTAs)
  // Main Store products: 001-008, 011, 012, 015-018, 021, 022
  { productId: 'demo-p-001', salesRoutingId: 'sr-003', sessionTypeId: '30567801' },
  { productId: 'demo-p-002', salesRoutingId: 'sr-003', sessionTypeId: '30567802' },
  { productId: 'demo-p-003', salesRoutingId: 'sr-003', sessionTypeId: '30567803' },
  { productId: 'demo-p-004', salesRoutingId: 'sr-003', sessionTypeId: '30567804' },
  { productId: 'demo-p-005', salesRoutingId: 'sr-003', sessionTypeId: '30567805' },
  { productId: 'demo-p-006', salesRoutingId: 'sr-003', sessionTypeId: '30567806' },
  { productId: 'demo-p-007', salesRoutingId: 'sr-003', sessionTypeId: '30567807' },
  { productId: 'demo-p-008', salesRoutingId: 'sr-003', sessionTypeId: '30567808' },
  { productId: 'demo-p-011', salesRoutingId: 'sr-003', sessionTypeId: '30567811' },
  { productId: 'demo-p-012', salesRoutingId: 'sr-003', sessionTypeId: '30567812' },
  { productId: 'demo-p-015', salesRoutingId: 'sr-003', sessionTypeId: '30567815' },
  { productId: 'demo-p-016', salesRoutingId: 'sr-003', sessionTypeId: '30567816' },
  { productId: 'demo-p-017', salesRoutingId: 'sr-003', sessionTypeId: '30567817' },
  { productId: 'demo-p-018', salesRoutingId: 'sr-003', sessionTypeId: '30567818' },
  { productId: 'demo-p-021', salesRoutingId: 'sr-003', sessionTypeId: '30567821' },
  { productId: 'demo-p-022', salesRoutingId: 'sr-003', sessionTypeId: '30567822' },
  
  // sr-004 — Tapas Tour: Pop-up Store (box-office only)
  // Pop-up Store products: 001, 003, 007, 011, 015, 016, 024, 025
  { productId: 'demo-p-001', salesRoutingId: 'sr-004', sessionTypeId: '40123401' },
  { productId: 'demo-p-003', salesRoutingId: 'sr-004', sessionTypeId: '40123403' },
  { productId: 'demo-p-007', salesRoutingId: 'sr-004', sessionTypeId: '40123407' },
  { productId: 'demo-p-011', salesRoutingId: 'sr-004', sessionTypeId: '40123411' },
  { productId: 'demo-p-015', salesRoutingId: 'sr-004', sessionTypeId: '40123415' },
  { productId: 'demo-p-016', salesRoutingId: 'sr-004', sessionTypeId: '40123416' },
  { productId: 'demo-p-024', salesRoutingId: 'sr-004', sessionTypeId: '40123424' },
  { productId: 'demo-p-025', salesRoutingId: 'sr-004', sessionTypeId: '40123425' },
  
  // sr-005 — Stranger Things: Pop-up Store (marketplace + whitelabel)
  // Pop-up Store products: 001, 003, 007, 011, 015, 016, 024, 025
  { productId: 'demo-p-001', salesRoutingId: 'sr-005', sessionTypeId: '50234501' },
  { productId: 'demo-p-003', salesRoutingId: 'sr-005', sessionTypeId: '50234503' },
  { productId: 'demo-p-007', salesRoutingId: 'sr-005', sessionTypeId: '50234507' },
  { productId: 'demo-p-011', salesRoutingId: 'sr-005', sessionTypeId: '50234511' },
  { productId: 'demo-p-015', salesRoutingId: 'sr-005', sessionTypeId: '50234515' },
  { productId: 'demo-p-016', salesRoutingId: 'sr-005', sessionTypeId: '50234516' },
  { productId: 'demo-p-024', salesRoutingId: 'sr-005', sessionTypeId: '50234524' },
  { productId: 'demo-p-025', salesRoutingId: 'sr-005', sessionTypeId: '50234525' },
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
 * Get all unpublished products
 */
export function getUnpublishedProducts(): Product[] {
  return products.filter(p => !isProductPublished(p.id));
}
