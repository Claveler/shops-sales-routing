import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import {
  catalogIntegration as staticIntegration,
  warehouses as staticWarehouses,
  products as staticProducts,
  productWarehouses as staticProductWarehouses,
  salesRoutings as staticSalesRoutings,
  productPublications as staticProductPublications,
  boxOfficeSetups as staticBoxOfficeSetups,
  events,
  channels,
  isBoxOfficeChannel,
  type CatalogIntegration,
  type Warehouse,
  type Product,
  type ProductWarehouse,
  type SalesRouting,
  type ProductPublication,
  type BoxOfficeSetup,
} from '../data/mockData';
import { DEMO_PRODUCTS, DEMO_PRODUCT_WAREHOUSES, SECOND_SYNC_PRODUCTS, SECOND_SYNC_PRODUCT_WAREHOUSES } from '../data/productPool';

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
  
  // Helper to check if product is published
  isProductPublished: (productId: string) => boolean;
  getUnpublishedReason: (productId: string) => { type: 'no-routing' } | null;
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
      if (!prev.hasSynced) {
        // First sync - add initial products
        newProducts = DEMO_PRODUCTS;
        newProductWarehouses = DEMO_PRODUCT_WAREHOUSES.filter(pw => 
          prev.warehouses.some(w => w.id === pw.warehouseId)
        );
        newProductIds = newProducts.map(p => p.id);
        
        return {
          ...prev,
          products: newProducts,
          productWarehouses: newProductWarehouses,
          hasSynced: true,
          syncedProductIds: newProductIds,
        };
      } else if (!prev.secondSyncDone) {
        // Second sync - add more products
        newProducts = SECOND_SYNC_PRODUCTS;
        newProductWarehouses = SECOND_SYNC_PRODUCT_WAREHOUSES.filter(pw => 
          prev.warehouses.some(w => w.id === pw.warehouseId)
        );
        newProductIds = newProducts.map(p => p.id);
        
        // Also create publications for products that are in mapped warehouses
        const newPublications: ProductPublication[] = [];
        newProducts.forEach(product => {
          const productWarehouseIds = newProductWarehouses
            .filter(pw => pw.productId === product.id)
            .map(pw => pw.warehouseId);
          
          prev.salesRoutings.forEach(routing => {
            // Check if any of the product's warehouses is mapped to a channel in this routing
            const mappedWarehouseIds = Object.values(routing.channelWarehouseMapping);
            const isInRouting = mappedWarehouseIds.some(whId => productWarehouseIds.includes(whId));
            
            if (isInRouting) {
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
      
      // Get all warehouse IDs that are used in the channel mapping
      const mappedWarehouseIds = Object.values(newRouting.channelWarehouseMapping);
      const uniqueMappedWarehouseIds = [...new Set(mappedWarehouseIds)];
      
      // Get all products in the mapped warehouses
      const warehouseProductIds = prev.productWarehouses
        .filter(pw => uniqueMappedWarehouseIds.includes(pw.warehouseId))
        .map(pw => pw.productId);
      const uniqueProductIds = [...new Set(warehouseProductIds)];
      
      uniqueProductIds.forEach(productId => {
        newPublications.push({
          productId,
          salesRoutingId: newRouting.id,
          sessionTypeId: String(Math.floor(10000000 + Math.random() * 90000000)),
        });
      });

      return {
        ...prev,
        salesRoutings: [...prev.salesRoutings, newRouting],
        productPublications: [...prev.productPublications, ...newPublications],
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
    isProductPublished,
    getUnpublishedReason,
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
    isProductPublished,
    getUnpublishedReason,
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
export { events, channels };
