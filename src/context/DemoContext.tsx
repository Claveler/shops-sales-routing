import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import {
  catalogIntegration as staticIntegration,
  warehouses as staticWarehouses,
  products as staticProducts,
  productWarehouses as staticProductWarehouses,
  salesRoutings as staticSalesRoutings,
  productPublications as staticProductPublications,
  boxOfficeSetups as staticBoxOfficeSetups,
  hierarchyElements as staticHierarchyElements,
  hierarchyElementProducts as staticHierarchyElementProducts,
  events,
  channels,
  isBoxOfficeChannel,
  getRootCategories,
  getAllCategories,
  type CatalogIntegration,
  type Warehouse,
  type Product,
  type ProductWarehouse,
  type SalesRouting,
  type ProductPublication,
  type BoxOfficeSetup,
  type HierarchyElement,
  type HierarchyElementProduct,
  type ProductChannelVisibility,
  type DefaultVisibility,
} from '../data/mockData';
import { DEMO_PRODUCTS, DEMO_PRODUCT_WAREHOUSES, SECOND_SYNC_PRODUCTS, SECOND_SYNC_PRODUCT_WAREHOUSES, DEMO_HIERARCHY_ELEMENT_PRODUCTS } from '../data/productPool';

interface DemoState {
  // Mode
  isResetMode: boolean;
  
  // Dynamic state (used when isResetMode = true)
  catalogIntegration: CatalogIntegration | null;
  warehouses: Warehouse[];
  products: Product[];
  productWarehouses: ProductWarehouse[];
  salesRoutings: SalesRouting[];
  productPublications: ProductPublication[];
  boxOfficeSetups: BoxOfficeSetup[];
  hierarchyElements: HierarchyElement[];
  hierarchyElementProducts: HierarchyElementProduct[];
  productChannelVisibility: ProductChannelVisibility[];
  
  // Sync state
  hasSynced: boolean;
  secondSyncDone: boolean;
  syncedProductIds: string[];
}

interface DemoContextValue extends DemoState {
  // Actions
  resetDemo: () => void;
  exitResetMode: () => void;
  
  // Integration actions
  createIntegration: (integration: CatalogIntegration, newWarehouses: Warehouse[]) => void;
  
  // Sync actions
  syncProducts: () => { newCount: number; newProductIds: string[] };
  
  // Routing actions
  createRouting: (routing: Omit<SalesRouting, 'id' | 'createdAt' | 'updatedAt'>) => SalesRouting;
  updateRouting: (id: string, updates: Partial<SalesRouting>) => void;
  deleteRouting: (id: string) => void;
  
  // Computed getters (unified API that works in both modes)
  getIntegration: () => CatalogIntegration | null;
  getWarehouses: () => Warehouse[];
  getProducts: () => Product[];
  getProductWarehouses: () => ProductWarehouse[];
  getSalesRoutings: () => SalesRouting[];
  getProductPublications: () => ProductPublication[];
  getBoxOfficeSetups: () => BoxOfficeSetup[];
  getHierarchyElements: () => HierarchyElement[];
  getHierarchyElementProducts: () => HierarchyElementProduct[];
  
  // Category helpers
  getProductCategory: (productId: string) => HierarchyElement | null;
  getProductCategoryPath: (productId: string) => string;
  
  // Helper to check if product is published
  isProductPublished: (productId: string) => boolean;
  getUnpublishedReason: (productId: string) => { type: 'no-routing' } | null;
  
  // Product channel visibility
  getProductChannelVisibility: () => ProductChannelVisibility[];
  isProductVisibleInChannel: (productId: string, channelId: string, routingId: string) => boolean;
  setProductChannelVisibility: (productId: string, channelId: string, routingId: string, visible: boolean) => void;
  bulkSetProductChannelVisibility: (productIds: string[], channelIds: string[], routingId: string, visible: boolean) => void;
  initializeChannelVisibility: (routingId: string, channelId: string, defaultVisibility: DefaultVisibility, productIds: string[]) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>({
    isResetMode: false,
    catalogIntegration: null,
    warehouses: [],
    products: [],
    productWarehouses: [],
    salesRoutings: [],
    productPublications: [],
    boxOfficeSetups: [],
    hierarchyElements: [],
    hierarchyElementProducts: [],
    productChannelVisibility: [],
    hasSynced: false,
    secondSyncDone: false,
    syncedProductIds: [],
  });

  // Reset to blank slate
  const resetDemo = useCallback(() => {
    setState({
      isResetMode: true,
      catalogIntegration: null,
      warehouses: [],
      products: [],
      productWarehouses: [],
      salesRoutings: [],
      productPublications: [],
      boxOfficeSetups: [],
      hierarchyElements: [],
      hierarchyElementProducts: [],
      productChannelVisibility: [],
      hasSynced: false,
      secondSyncDone: false,
      syncedProductIds: [],
    });
  }, []);

  // Exit reset mode (return to static data)
  const exitResetMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isResetMode: false,
    }));
  }, []);

  // Create integration with warehouses
  const createIntegration = useCallback((integration: CatalogIntegration, newWarehouses: Warehouse[]) => {
    setState(prev => ({
      ...prev,
      catalogIntegration: integration,
      warehouses: newWarehouses,
    }));
  }, []);

  // Sync products from "external system"
  const syncProducts = useCallback(() => {
    let newProducts: Product[] = [];
    let newProductWarehouses: ProductWarehouse[] = [];
    let newProductIds: string[] = [];

    setState(prev => {
      const syncTimestamp = new Date().toISOString();
      
      if (!prev.hasSynced) {
        // First sync - add initial products with syncedAt timestamp
        newProducts = DEMO_PRODUCTS.map(p => ({ ...p, syncedAt: syncTimestamp }));
        newProductWarehouses = DEMO_PRODUCT_WAREHOUSES.filter(pw => 
          prev.warehouses.some(w => w.id === pw.warehouseId)
        );
        newProductIds = newProducts.map(p => p.id);
        
        // Filter category assignments for synced products
        const newHierarchyElementProducts = DEMO_HIERARCHY_ELEMENT_PRODUCTS.filter(hep =>
          newProductIds.includes(hep.productId)
        );
        
        return {
          ...prev,
          products: newProducts,
          productWarehouses: newProductWarehouses,
          hierarchyElements: staticHierarchyElements, // Use static categories
          hierarchyElementProducts: newHierarchyElementProducts,
          hasSynced: true,
          syncedProductIds: newProductIds,
        };
      } else if (!prev.secondSyncDone) {
        // Second sync - add more products with syncedAt timestamp
        newProducts = SECOND_SYNC_PRODUCTS.map(p => ({ ...p, syncedAt: syncTimestamp }));
        newProductWarehouses = SECOND_SYNC_PRODUCT_WAREHOUSES.filter(pw => 
          prev.warehouses.some(w => w.id === pw.warehouseId)
        );
        newProductIds = newProducts.map(p => p.id);
        
        // Filter category assignments for new products
        const newHierarchyElementProducts = DEMO_HIERARCHY_ELEMENT_PRODUCTS.filter(hep =>
          newProductIds.includes(hep.productId)
        );
        
        // Also create publications for products that are in mapped warehouses
        const newPublications: ProductPublication[] = [];
        newProducts.forEach(product => {
          const productWarehouseIds = newProductWarehouses
            .filter(pw => pw.productId === product.id)
            .map(pw => pw.warehouseId);
          
          prev.salesRoutings.forEach(routing => {
            // Check online channels (via channelWarehouseMapping)
            const mappedWarehouseIds = Object.values(routing.channelWarehouseMapping);
            const isInOnlineChannel = mappedWarehouseIds.some(whId => productWarehouseIds.includes(whId));
            
            // Check Box Office (via warehouseIds)
            const hasBoxOffice = routing.channelIds.includes('box-office');
            const isInBoxOfficeRouting = hasBoxOffice && routing.warehouseIds.some(whId => productWarehouseIds.includes(whId));
            
            if (isInOnlineChannel || isInBoxOfficeRouting) {
              newPublications.push({
                productId: product.id,
                salesRoutingId: routing.id,
                sessionTypeId: String(Math.floor(10000000 + Math.random() * 90000000)),
              });
            }
          });
        });
        
        return {
          ...prev,
          products: [...prev.products, ...newProducts],
          productWarehouses: [...prev.productWarehouses, ...newProductWarehouses],
          productPublications: [...prev.productPublications, ...newPublications],
          hierarchyElementProducts: [...prev.hierarchyElementProducts, ...newHierarchyElementProducts],
          secondSyncDone: true,
          syncedProductIds: newProductIds,
        };
      }
      
      return prev;
    });

    return { newCount: newProducts.length, newProductIds };
  }, []);

  // Create a new routing
  const createRouting = useCallback((routingData: Omit<SalesRouting, 'id' | 'createdAt' | 'updatedAt'>): SalesRouting => {
    const now = new Date().toISOString();
    const newRouting: SalesRouting = {
      ...routingData,
      id: `sr-demo-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    setState(prev => {
      // Create publications for products in this routing
      // Products are published if their warehouse is mapped to at least one channel
      const newPublications: ProductPublication[] = [];
      
      // Get warehouses from online channel mapping
      const mappedWarehouseIds = Object.values(newRouting.channelWarehouseMapping);
      const onlineWarehouseIds = [...new Set(mappedWarehouseIds)].filter(id => id && id !== '');
      
      // Also include Box Office warehouses if Box Office channel selected
      const hasBoxOffice = newRouting.channelIds.includes('box-office');
      const allRelevantWarehouseIds = hasBoxOffice 
        ? [...new Set([...onlineWarehouseIds, ...newRouting.warehouseIds])]
        : onlineWarehouseIds;
      
      // Get all products in the relevant warehouses
      const warehouseProductIds = prev.productWarehouses
        .filter(pw => allRelevantWarehouseIds.includes(pw.warehouseId))
        .map(pw => pw.productId);
      const uniqueProductIds = [...new Set(warehouseProductIds)];
      
      uniqueProductIds.forEach(productId => {
        newPublications.push({
          productId,
          salesRoutingId: newRouting.id,
          sessionTypeId: String(Math.floor(10000000 + Math.random() * 90000000)),
        });
      });

      // Initialize channel visibility based on default settings
      const newVisibilityRecords: ProductChannelVisibility[] = [];
      if (routingData.channelDefaultVisibility) {
        Object.entries(routingData.channelDefaultVisibility).forEach(([channelId, defaultVisibility]) => {
          const visible = defaultVisibility === 'all';
          uniqueProductIds.forEach(productId => {
            newVisibilityRecords.push({
              productId,
              channelId,
              routingId: newRouting.id,
              visible
            });
          });
        });
      }

      return {
        ...prev,
        salesRoutings: [...prev.salesRoutings, newRouting],
        productPublications: [...prev.productPublications, ...newPublications],
        productChannelVisibility: [...prev.productChannelVisibility, ...newVisibilityRecords],
      };
    });

    return newRouting;
  }, []);

  // Update existing routing
  const updateRouting = useCallback((id: string, updates: Partial<SalesRouting>) => {
    setState(prev => ({
      ...prev,
      salesRoutings: prev.salesRoutings.map(r => 
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    }));
  }, []);

  // Delete routing
  const deleteRouting = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      salesRoutings: prev.salesRoutings.filter(r => r.id !== id),
      productPublications: prev.productPublications.filter(p => p.salesRoutingId !== id),
    }));
  }, []);

  // Unified getters that work in both modes
  const getIntegration = useCallback(() => {
    return state.isResetMode ? state.catalogIntegration : staticIntegration;
  }, [state.isResetMode, state.catalogIntegration]);

  const getWarehouses = useCallback(() => {
    return state.isResetMode ? state.warehouses : staticWarehouses;
  }, [state.isResetMode, state.warehouses]);

  const getProducts = useCallback(() => {
    if (state.isResetMode) {
      return state.products;
    }
    // In static mode, filter out pending sync products unless synced
    return staticProducts.filter(p => !p.pendingSync || state.hasSynced);
  }, [state.isResetMode, state.products, state.hasSynced]);

  const getProductWarehouses = useCallback(() => {
    return state.isResetMode ? state.productWarehouses : staticProductWarehouses;
  }, [state.isResetMode, state.productWarehouses]);

  const getSalesRoutings = useCallback(() => {
    return state.isResetMode ? state.salesRoutings : staticSalesRoutings;
  }, [state.isResetMode, state.salesRoutings]);

  const getProductPublications = useCallback(() => {
    return state.isResetMode ? state.productPublications : staticProductPublications;
  }, [state.isResetMode, state.productPublications]);

  const getBoxOfficeSetups = useCallback(() => {
    return state.isResetMode ? state.boxOfficeSetups : staticBoxOfficeSetups;
  }, [state.isResetMode, state.boxOfficeSetups]);

  const getHierarchyElements = useCallback(() => {
    // Categories are synced with products, use static for now (same in both modes)
    return state.isResetMode ? state.hierarchyElements : staticHierarchyElements;
  }, [state.isResetMode, state.hierarchyElements]);

  const getHierarchyElementProducts = useCallback(() => {
    return state.isResetMode ? state.hierarchyElementProducts : staticHierarchyElementProducts;
  }, [state.isResetMode, state.hierarchyElementProducts]);

  // Get category for a product
  const getProductCategory = useCallback((productId: string): HierarchyElement | null => {
    const heps = state.isResetMode ? state.hierarchyElementProducts : staticHierarchyElementProducts;
    const hes = state.isResetMode ? state.hierarchyElements : staticHierarchyElements;
    
    const assignment = heps.find(hep => hep.productId === productId);
    if (!assignment) return null;
    return hes.find(he => he.id === assignment.hierarchyElementId) || null;
  }, [state.isResetMode, state.hierarchyElementProducts, state.hierarchyElements]);

  // Get full category path (e.g., "Apparel > T-Shirts")
  const getProductCategoryPath = useCallback((productId: string): string => {
    const heps = state.isResetMode ? state.hierarchyElementProducts : staticHierarchyElementProducts;
    const hes = state.isResetMode ? state.hierarchyElements : staticHierarchyElements;
    
    const assignment = heps.find(hep => hep.productId === productId);
    if (!assignment) return 'Uncategorized';
    
    const category = hes.find(he => he.id === assignment.hierarchyElementId);
    if (!category) return 'Uncategorized';
    
    if (category.parentId) {
      const parent = hes.find(he => he.id === category.parentId);
      if (parent) {
        return `${parent.name} > ${category.name}`;
      }
    }
    return category.name;
  }, [state.isResetMode, state.hierarchyElementProducts, state.hierarchyElements]);

  // Check if product is published
  const isProductPublished = useCallback((productId: string) => {
    const routings = state.isResetMode ? state.salesRoutings : staticSalesRoutings;
    const productWhs = state.isResetMode ? state.productWarehouses : staticProductWarehouses;
    
    const productWarehouseIds = productWhs
      .filter(pw => pw.productId === productId)
      .map(pw => pw.warehouseId);

    return routings.some(routing => {
      // Check if any of the product's warehouses is used in online channel mappings
      const mappedWarehouseIds = Object.values(routing.channelWarehouseMapping);
      const isInOnlineChannel = mappedWarehouseIds.some(warehouseId => productWarehouseIds.includes(warehouseId));
      
      // Check if product is available via Box Office
      // Box Office uses routing.warehouseIds directly (configured per POS in Box Office Setup)
      const hasBoxOffice = routing.channelIds.some(id => isBoxOfficeChannel(id));
      const isInBoxOfficeRouting = hasBoxOffice && routing.warehouseIds.some(whId => productWarehouseIds.includes(whId));
      
      return isInOnlineChannel || isInBoxOfficeRouting;
    });
  }, [state.isResetMode, state.salesRoutings, state.productWarehouses]);

  // Get reason why product is unpublished
  // With the new model, all products in a mapped warehouse are automatically published
  // So the only reason for being unpublished is having no routing at all
  const getUnpublishedReason = useCallback((productId: string) => {
    if (isProductPublished(productId)) return null;
    return { type: 'no-routing' as const };
  }, [isProductPublished]);

  // Get all product channel visibility records
  const getProductChannelVisibility = useCallback(() => {
    return state.productChannelVisibility;
  }, [state.productChannelVisibility]);

  // Check if a product is visible in a specific channel for a routing
  // If no explicit record exists, defaults to true (visible)
  const isProductVisibleInChannel = useCallback((productId: string, channelId: string, routingId: string) => {
    const record = state.productChannelVisibility.find(
      pcv => pcv.productId === productId && pcv.channelId === channelId && pcv.routingId === routingId
    );
    // Default to visible if no explicit record
    return record ? record.visible : true;
  }, [state.productChannelVisibility]);

  // Set visibility for a single product in a channel
  const setProductChannelVisibility = useCallback((productId: string, channelId: string, routingId: string, visible: boolean) => {
    setState(prev => {
      const existingIndex = prev.productChannelVisibility.findIndex(
        pcv => pcv.productId === productId && pcv.channelId === channelId && pcv.routingId === routingId
      );
      
      if (existingIndex >= 0) {
        // Update existing record
        const updated = [...prev.productChannelVisibility];
        updated[existingIndex] = { ...updated[existingIndex], visible };
        return { ...prev, productChannelVisibility: updated };
      } else {
        // Create new record
        return {
          ...prev,
          productChannelVisibility: [
            ...prev.productChannelVisibility,
            { productId, channelId, routingId, visible }
          ]
        };
      }
    });
  }, []);

  // Bulk set visibility for multiple products across multiple channels
  const bulkSetProductChannelVisibility = useCallback((productIds: string[], channelIds: string[], routingId: string, visible: boolean) => {
    setState(prev => {
      const newVisibility = [...prev.productChannelVisibility];
      
      productIds.forEach(productId => {
        channelIds.forEach(channelId => {
          const existingIndex = newVisibility.findIndex(
            pcv => pcv.productId === productId && pcv.channelId === channelId && pcv.routingId === routingId
          );
          
          if (existingIndex >= 0) {
            newVisibility[existingIndex] = { ...newVisibility[existingIndex], visible };
          } else {
            newVisibility.push({ productId, channelId, routingId, visible });
          }
        });
      });
      
      return { ...prev, productChannelVisibility: newVisibility };
    });
  }, []);

  // Initialize visibility for all products when a routing is created
  const initializeChannelVisibility = useCallback((routingId: string, channelId: string, defaultVisibility: DefaultVisibility, productIds: string[]) => {
    setState(prev => {
      const visible = defaultVisibility === 'all';
      const newRecords: ProductChannelVisibility[] = productIds.map(productId => ({
        productId,
        channelId,
        routingId,
        visible
      }));
      
      return {
        ...prev,
        productChannelVisibility: [...prev.productChannelVisibility, ...newRecords]
      };
    });
  }, []);

  const value = useMemo<DemoContextValue>(() => ({
    ...state,
    resetDemo,
    exitResetMode,
    createIntegration,
    syncProducts,
    createRouting,
    updateRouting,
    deleteRouting,
    getIntegration,
    getWarehouses,
    getProducts,
    getProductWarehouses,
    getSalesRoutings,
    getProductPublications,
    getBoxOfficeSetups,
    getHierarchyElements,
    getHierarchyElementProducts,
    getProductCategory,
    getProductCategoryPath,
    isProductPublished,
    getUnpublishedReason,
    getProductChannelVisibility,
    isProductVisibleInChannel,
    setProductChannelVisibility,
    bulkSetProductChannelVisibility,
    initializeChannelVisibility,
  }), [
    state,
    resetDemo,
    exitResetMode,
    createIntegration,
    syncProducts,
    createRouting,
    updateRouting,
    deleteRouting,
    getIntegration,
    getWarehouses,
    getProducts,
    getProductWarehouses,
    getSalesRoutings,
    getProductPublications,
    getBoxOfficeSetups,
    getHierarchyElements,
    getHierarchyElementProducts,
    getProductCategory,
    getProductCategoryPath,
    isProductPublished,
    getUnpublishedReason,
    getProductChannelVisibility,
    isProductVisibleInChannel,
    setProductChannelVisibility,
    bulkSetProductChannelVisibility,
    initializeChannelVisibility,
  ]);

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

// Re-export static data that doesn't change
export { events, channels, getRootCategories, getAllCategories };
