import type { Product, ProductWarehouse, HierarchyElementProduct } from './mockData';

// Demo warehouse IDs (created during integration wizard)
export const DEMO_WAREHOUSE_1_ID = 'wh-demo-main';
export const DEMO_WAREHOUSE_2_ID = 'wh-demo-gift';
export const DEMO_WAREHOUSE_3_ID = 'wh-demo-popup';

// Products for initial sync (20 products)
export const DEMO_PRODUCTS: Product[] = [
  // Apparel (6)
  { id: 'demo-p-001', name: 'Event T-Shirt (Black)', sku: 'TSH-BLK-001' },
  { id: 'demo-p-002', name: 'Event T-Shirt (White)', sku: 'TSH-WHT-001' },
  { id: 'demo-p-003', name: 'Premium Hoodie (Gray)', sku: 'HOOD-GRY-001' },
  { id: 'demo-p-004', name: 'Vintage Cap', sku: 'CAP-VTG-001' },
  { id: 'demo-p-005', name: 'Concert Jacket', sku: 'JKT-CNT-001' },
  { id: 'demo-p-006', name: 'Limited Edition Beanie', sku: 'BNE-LTD-001' },
  
  // Accessories (4)
  { id: 'demo-p-007', name: 'Canvas Tote Bag', sku: 'BAG-TOT-001' },
  { id: 'demo-p-008', name: 'Enamel Pin Set', sku: 'PIN-SET-001' },
  { id: 'demo-p-009', name: 'Wristband Pack (3)', sku: 'WRB-PCK-001' },
  { id: 'demo-p-010', name: 'Lanyard with Badge Holder', sku: 'LNY-BDG-001' },
  
  // Home & Decor (4)
  { id: 'demo-p-011', name: 'Concert Poster (A2)', sku: 'POS-A2-001' },
  { id: 'demo-p-012', name: 'Scented Candle Set', sku: 'CND-SET-001' },
  { id: 'demo-p-013', name: 'Art Print Collection', sku: 'ART-PRT-001' },
  { id: 'demo-p-014', name: 'Photo Book', sku: 'PHO-BK-001' },
  
  // Collectibles (3)
  { id: 'demo-p-015', name: 'Vinyl Record - Live Album', sku: 'VNL-LIV-001' },
  { id: 'demo-p-016', name: 'Commemorative Coin', sku: 'CON-CMM-001' },
  { id: 'demo-p-017', name: 'Signed Photograph', sku: 'PHO-SGN-001' },
  
  // Food & Beverage (3)
  { id: 'demo-p-018', name: 'Gourmet Chocolate Box', sku: 'CHO-BOX-001' },
  { id: 'demo-p-019', name: 'Premium Coffee Blend', sku: 'COF-PRM-001' },
  { id: 'demo-p-020', name: 'Wine Tasting Set', sku: 'WIN-SET-001' },
];

// Product-Warehouse mappings for initial sync
// Main Store: 14 products, Gift Shop: 10 products, Pop-up Store: 6 products (some overlap)
export const DEMO_PRODUCT_WAREHOUSES: ProductWarehouse[] = [
  // Main Store products (14)
  { productId: 'demo-p-001', warehouseId: DEMO_WAREHOUSE_1_ID, price: 29.99, currency: 'EUR', stock: 150 },
  { productId: 'demo-p-002', warehouseId: DEMO_WAREHOUSE_1_ID, price: 29.99, currency: 'EUR', stock: 120 },
  { productId: 'demo-p-003', warehouseId: DEMO_WAREHOUSE_1_ID, price: 59.99, currency: 'EUR', stock: 80 },
  { productId: 'demo-p-004', warehouseId: DEMO_WAREHOUSE_1_ID, price: 24.99, currency: 'EUR', stock: 100 },
  { productId: 'demo-p-005', warehouseId: DEMO_WAREHOUSE_1_ID, price: 89.99, currency: 'EUR', stock: 40 },
  { productId: 'demo-p-006', warehouseId: DEMO_WAREHOUSE_1_ID, price: 19.99, currency: 'EUR', stock: 200 },
  { productId: 'demo-p-007', warehouseId: DEMO_WAREHOUSE_1_ID, price: 15.99, currency: 'EUR', stock: 180 },
  { productId: 'demo-p-008', warehouseId: DEMO_WAREHOUSE_1_ID, price: 12.99, currency: 'EUR', stock: 250 },
  { productId: 'demo-p-011', warehouseId: DEMO_WAREHOUSE_1_ID, price: 18.00, currency: 'EUR', stock: 300 },
  { productId: 'demo-p-012', warehouseId: DEMO_WAREHOUSE_1_ID, price: 34.99, currency: 'EUR', stock: 60 },
  { productId: 'demo-p-015', warehouseId: DEMO_WAREHOUSE_1_ID, price: 39.99, currency: 'EUR', stock: 50 },
  { productId: 'demo-p-016', warehouseId: DEMO_WAREHOUSE_1_ID, price: 49.99, currency: 'EUR', stock: 100 },
  { productId: 'demo-p-017', warehouseId: DEMO_WAREHOUSE_1_ID, price: 99.99, currency: 'EUR', stock: 25 },
  { productId: 'demo-p-018', warehouseId: DEMO_WAREHOUSE_1_ID, price: 24.99, currency: 'EUR', stock: 75 },
  
  // Gift Shop products (10) - some overlap with Main Store (different prices)
  { productId: 'demo-p-001', warehouseId: DEMO_WAREHOUSE_2_ID, price: 32.99, currency: 'EUR', stock: 80 },
  { productId: 'demo-p-002', warehouseId: DEMO_WAREHOUSE_2_ID, price: 32.99, currency: 'EUR', stock: 60 },
  { productId: 'demo-p-007', warehouseId: DEMO_WAREHOUSE_2_ID, price: 17.99, currency: 'EUR', stock: 100 },
  { productId: 'demo-p-008', warehouseId: DEMO_WAREHOUSE_2_ID, price: 14.99, currency: 'EUR', stock: 150 },
  { productId: 'demo-p-009', warehouseId: DEMO_WAREHOUSE_2_ID, price: 9.99, currency: 'EUR', stock: 200 },
  { productId: 'demo-p-010', warehouseId: DEMO_WAREHOUSE_2_ID, price: 8.99, currency: 'EUR', stock: 300 },
  { productId: 'demo-p-013', warehouseId: DEMO_WAREHOUSE_2_ID, price: 45.00, currency: 'EUR', stock: 40 },
  { productId: 'demo-p-014', warehouseId: DEMO_WAREHOUSE_2_ID, price: 35.00, currency: 'EUR', stock: 55 },
  { productId: 'demo-p-019', warehouseId: DEMO_WAREHOUSE_2_ID, price: 18.99, currency: 'EUR', stock: 90 },
  { productId: 'demo-p-020', warehouseId: DEMO_WAREHOUSE_2_ID, price: 55.00, currency: 'EUR', stock: 30 },
  
  // Pop-up Store products (6) - limited selection for pop-up events
  { productId: 'demo-p-001', warehouseId: DEMO_WAREHOUSE_3_ID, price: 34.99, currency: 'EUR', stock: 50 },
  { productId: 'demo-p-003', warehouseId: DEMO_WAREHOUSE_3_ID, price: 64.99, currency: 'EUR', stock: 30 },
  { productId: 'demo-p-007', warehouseId: DEMO_WAREHOUSE_3_ID, price: 19.99, currency: 'EUR', stock: 60 },
  { productId: 'demo-p-011', warehouseId: DEMO_WAREHOUSE_3_ID, price: 22.00, currency: 'EUR', stock: 100 },
  { productId: 'demo-p-015', warehouseId: DEMO_WAREHOUSE_3_ID, price: 44.99, currency: 'EUR', stock: 25 },
  { productId: 'demo-p-016', warehouseId: DEMO_WAREHOUSE_3_ID, price: 54.99, currency: 'EUR', stock: 40 },
];

// Products for second sync (5 new products)
export const SECOND_SYNC_PRODUCTS: Product[] = [
  { id: 'demo-p-021', name: 'Anniversary Edition T-Shirt', sku: 'TSH-ANV-001' },
  { id: 'demo-p-022', name: 'Exclusive Poster Bundle', sku: 'POS-BND-001' },
  { id: 'demo-p-023', name: 'VIP Experience Add-on', sku: 'VIP-ADD-001' },
  { id: 'demo-p-024', name: 'Collector\'s Box Set', sku: 'COL-BOX-001' },
  { id: 'demo-p-025', name: 'Digital Download Card', sku: 'DIG-DWN-001' },
];

// Product-Warehouse mappings for second sync
export const SECOND_SYNC_PRODUCT_WAREHOUSES: ProductWarehouse[] = [
  // Main Store gets 2 (will be auto-published via onsite routing)
  { productId: 'demo-p-021', warehouseId: DEMO_WAREHOUSE_1_ID, price: 34.99, currency: 'EUR', stock: 100 },
  { productId: 'demo-p-022', warehouseId: DEMO_WAREHOUSE_1_ID, price: 49.99, currency: 'EUR', stock: 50 },
  
  // Gift Shop gets 1 (will be auto-published via onsite routing)
  { productId: 'demo-p-023', warehouseId: DEMO_WAREHOUSE_2_ID, price: 149.99, currency: 'EUR', stock: 20 },
  
  // Pop-up Store gets 2 (shows "Not added to sales routing" - online routing exists but not selected)
  { productId: 'demo-p-024', warehouseId: DEMO_WAREHOUSE_3_ID, price: 79.99, currency: 'EUR', stock: 30 },
  { productId: 'demo-p-025', warehouseId: DEMO_WAREHOUSE_3_ID, price: 14.99, currency: 'EUR', stock: 500 },
];

// Suggested products for online routing (subset of Pop-up Store products)
// These are the products that will be pre-selected when creating the online routing
// Note: Pop-up Store products are: demo-p-001, 003, 007, 011, 015, 016
export const SUGGESTED_ONLINE_PRODUCT_IDS = [
  'demo-p-001', // Event T-Shirt (Black) - in Pop-up Store
  'demo-p-003', // Premium Hoodie - in Pop-up Store
  'demo-p-007', // Canvas Tote Bag - in Pop-up Store
  'demo-p-011', // Concert Poster - in Pop-up Store
];

// Category assignments for demo products
// Uses same category IDs from mockData.ts hierarchyElements
export const DEMO_HIERARCHY_ELEMENT_PRODUCTS: HierarchyElementProduct[] = [
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

// Demo data for auto-fill buttons
export const DEMO_INTEGRATION_DATA = {
  name: 'Demo Store Integration',
  provider: 'square' as const,
  externalAccountId: 'sq_merchant_demo_12345',
};

export const DEMO_WAREHOUSE_DATA = [
  {
    id: DEMO_WAREHOUSE_1_ID,
    name: 'Main Store',
    integration: 'Square' as const,
    externalLocationId: 'LOC_MAIN_001',
    productCount: 14,
    masterCatalogId: 'sq_merchant_demo_12345',
  },
  {
    id: DEMO_WAREHOUSE_2_ID,
    name: 'Gift Shop',
    integration: 'Square' as const,
    externalLocationId: 'LOC_GIFT_001',
    productCount: 10,
    masterCatalogId: 'sq_merchant_demo_12345',
  },
  {
    id: DEMO_WAREHOUSE_3_ID,
    name: 'Pop-up Store',
    integration: 'Square' as const,
    externalLocationId: 'LOC_POPUP_001',
    productCount: 6,
    masterCatalogId: 'sq_merchant_demo_12345',
  },
];
