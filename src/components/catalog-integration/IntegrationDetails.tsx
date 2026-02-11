import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faExclamationTriangle,
  faImage,
  faSpinner,
  faCheck,
  faSearch,
  faWarehouse,
  faTshirt,
  faCalendar,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { faShopify } from '@fortawesome/free-brands-svg-icons';
import { Button } from '../common/Button';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../common/Table';
import { PublicationModal } from './PublicationModal';
import { WarehouseSidePanel } from './WarehouseSidePanel';
import { FilterSidePanel } from './FilterSidePanel';
import { EditIntegrationSidePanel } from './EditIntegrationSidePanel';
import { useDemo } from '../../context/DemoContext';
import { 
  getProductPublications as getStaticProductPublications,
  getEventById,
  isBoxOfficeChannel,
  channels,
  type Product,
  type CatalogIntegration,
} from '../../data/mockData';
import styles from './IntegrationDetails.module.css';

interface IntegrationDetailsProps {
  integration: CatalogIntegration;
}

const PAGE_SIZE = 10;

export function IntegrationDetails({ integration }: IntegrationDetailsProps) {
  const demo = useDemo();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'products' | 'warehouses'>('products');
  
  // UI state
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [newWarehouseName, setNewWarehouseName] = useState('');
  const [newWarehouseLocationId, setNewWarehouseLocationId] = useState('');
  const [warehousePanelProduct, setWarehousePanelProduct] = useState<{
    id: string;
    name: string;
    warehouses: ReturnType<typeof getWarehousesForProductLocal>;
  } | null>(null);
  const [publicationModalProduct, setPublicationModalProduct] = useState<{
    id: string;
    name: string;
    publications: ReturnType<typeof getStaticProductPublications>;
  } | null>(null);
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Filter panel state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Edit integration panel state
  const [showEditPanel, setShowEditPanel] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
  // Local sync UI state
  const [isSyncing, setIsSyncing] = useState(false);
  const [localSyncedProductIds, setLocalSyncedProductIds] = useState<string[]>([]);

  // Get data from demo context
  const allWarehouses = demo.getWarehouses();
  const allProducts = demo.getProducts()
    .sort((a, b) => {
      if (!a.syncedAt || !b.syncedAt) return 0;
      return new Date(b.syncedAt).getTime() - new Date(a.syncedAt).getTime();
    });
  const productWarehouses = demo.getProductWarehouses();

  // Filter warehouses by integration provider
  const providerName = integration.provider === 'square' ? 'Square' : 'Shopify';
  const integrationWarehouses = allWarehouses.filter(w => w.integration === providerName);
  
  // Get products in a specific warehouse
  const getProductsByWarehouse = (warehouseId: string): Product[] => {
    const productIds = productWarehouses
      .filter(pw => pw.warehouseId === warehouseId)
      .map(pw => pw.productId);
    return allProducts.filter(p => productIds.includes(p.id));
  };

  // Get warehouses for a product with price/stock details (using demo context data)
  const getWarehousesForProductLocal = (productId: string) => {
    const productWarehouseEntries = productWarehouses.filter(pw => pw.productId === productId);
    
    return productWarehouseEntries.map(pw => {
      const warehouse = allWarehouses.find(w => w.id === pw.warehouseId);
      if (!warehouse) return null;
      
      return {
        warehouse,
        price: pw.price,
        currency: pw.currency,
        stock: pw.stock,
      };
    }).filter(Boolean) as Array<{
      warehouse: typeof allWarehouses[0];
      price: number;
      currency: string;
      stock: number;
    }>;
  };

  // Derive publications from demo routings - returns ResolvedProductPublication format
  const getPublicationsFromRoutings = (productId: string) => {
    const routings = demo.getSalesRoutings();
    const productWarehouseIds = productWarehouses
      .filter(pw => pw.productId === productId)
      .map(pw => pw.warehouseId);
    
    const publications: Array<{
      sessionTypeId: string;
      salesRouting: typeof routings[0];
      event: NonNullable<ReturnType<typeof getEventById>>;
    }> = [];
    
    // Generate a deterministic 8-digit session type ID from routing + product
    const generateSessionTypeId = (routingId: string, prodId: string): string => {
      const str = `${routingId}-${prodId}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return String(Math.abs(hash) % 90000000 + 10000000);
    };
    
    routings.forEach(routing => {
      const routingUsesProductWarehouse = routing.warehouseIds.some(whId => 
        productWarehouseIds.includes(whId)
      );
      
      if (!routingUsesProductWarehouse) return;
      
      const event = getEventById(routing.eventId);
      if (!event) return;
      
      const hasBoxOffice = routing.channelIds.some(id => isBoxOfficeChannel(id));
      const mappedWarehouseIds = Object.values(routing.channelWarehouseMapping);
      const isInOnlineChannel = mappedWarehouseIds.some(whId => productWarehouseIds.includes(whId));
      
      if (hasBoxOffice || isInOnlineChannel) {
        publications.push({
          sessionTypeId: generateSessionTypeId(routing.id, productId),
          salesRouting: routing,
          event,
        });
      }
    });
    
    return publications;
  };

  // Derive available events for filter dropdown
  const availableEvents = useMemo(() => {
    const eventMap = new Map<string, NonNullable<ReturnType<typeof getEventById>>>();
    allProducts.forEach(product => {
      const pubs = demo.isResetMode 
        ? getPublicationsFromRoutings(product.id)
        : getStaticProductPublications(product.id);
      pubs.forEach(pub => {
        if (pub.event && !eventMap.has(pub.event.id)) {
          eventMap.set(pub.event.id, pub.event);
        }
      });
    });
    return Array.from(eventMap.values());
  }, [allProducts, demo.isResetMode, productWarehouses]);

  // Derive available channels for filter dropdown (from all routings)
  const availableChannels = useMemo(() => {
    const routings = demo.getSalesRoutings();
    const channelIds = new Set<string>();
    routings.forEach(r => r.channelIds.forEach(id => channelIds.add(id)));
    return channels.filter(c => channelIds.has(c.id));
  }, [demo]);
  
  // Derive available categories for filter dropdown
  const availableCategories = useMemo(() => {
    return demo.getHierarchyElements().filter(he => he.parentId === null);
  }, [demo]);
  
  // Apply all filters
  const filteredProducts = useMemo(() => {
    let products = allProducts;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q)
      );
    }
    
    if (warehouseFilter !== 'all') {
      products = getProductsByWarehouse(warehouseFilter);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.sku.toLowerCase().includes(q)
        );
      }
    }
    
    if (publishedFilter === 'unpublished') {
      products = products.filter(p => !demo.isProductPublished(p.id));
    } else if (publishedFilter === 'published') {
      products = products.filter(p => demo.isProductPublished(p.id));
    }
    
    if (eventFilter !== 'all') {
      products = products.filter(p => {
        const pubs = demo.isResetMode 
          ? getPublicationsFromRoutings(p.id)
          : getStaticProductPublications(p.id);
        return pubs.some(pub => pub.event?.id === eventFilter);
      });
    }
    
    if (channelFilter !== 'all') {
      products = products.filter(p => {
        const pubs = demo.isResetMode 
          ? getPublicationsFromRoutings(p.id)
          : getStaticProductPublications(p.id);
        return pubs.some(pub => pub.salesRouting?.channelIds.includes(channelFilter));
      });
    }
    
    if (categoryFilter !== 'all') {
      products = products.filter(p => {
        const category = demo.getProductCategory(p.id);
        if (!category) return false;
        return category.id === categoryFilter || category.parentId === categoryFilter;
      });
    }
    
    return products;
  }, [allProducts, searchQuery, warehouseFilter, publishedFilter, eventFilter, channelFilter, categoryFilter, productWarehouses, demo.isResetMode]);

  // Pagination derived values
  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalProducts);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, warehouseFilter, publishedFilter, eventFilter, channelFilter, categoryFilter]);
  
  const providerClass = integration.provider === 'square' ? styles.square : styles.shopify;

  const handleAddWarehouse = () => {
    if (newWarehouseName.trim() && newWarehouseLocationId.trim()) {
      console.log('Adding warehouse:', { name: newWarehouseName, locationId: newWarehouseLocationId });
      setNewWarehouseName('');
      setNewWarehouseLocationId('');
      setShowAddWarehouse(false);
    }
  };

  const handleSyncProducts = () => {
    if (isSyncing) return;
    
    if (demo.isResetMode) {
      if (demo.hasSynced && demo.secondSyncDone) return;
    }
    
    setIsSyncing(true);
    
    setTimeout(() => {
      if (demo.isResetMode) {
        const { newProductIds } = demo.syncProducts();
        setLocalSyncedProductIds(newProductIds);
      } else {
        const pendingProducts = allProducts.filter(p => p.pendingSync);
        const newProductIds = pendingProducts.map(p => p.id);
        setLocalSyncedProductIds(newProductIds);
      }
      
      setIsSyncing(false);
    }, 1500);
  };

  // Helper to render publication status
  const renderPublicationStatus = (
    product: Product,
    publications: ReturnType<typeof getStaticProductPublications>,
    _unpublishedReason: ReturnType<typeof demo.getUnpublishedReason>
  ) => {
    if (publications.length > 0) {
      return (
        <button 
          className={styles.publicationBadge}
          onClick={() => setPublicationModalProduct({
            id: product.id,
            name: product.name,
            publications
          })}
        >
          {publications.length} event{publications.length > 1 ? 's' : ''}
        </button>
      );
    }

    return (
      <div className={styles.noRoutingInline}>
        <FontAwesomeIcon icon={faExclamationTriangle} className={styles.noRoutingIcon} />
        <span className={styles.noRoutingText}>No sales routing configured</span>
      </div>
    );
  };

  // Determine sync button state based on mode and sync status
  const getSyncButtonState = () => {
    if (isSyncing) {
      return { variant: 'primary' as const, disabled: true, icon: faSpinner, label: 'Syncing...' };
    }
    
    if (demo.isResetMode) {
      if (!demo.hasSynced) {
        return { variant: 'primary' as const, disabled: false, icon: faPlus, label: 'Sync products' };
      }
      if (!demo.secondSyncDone) {
        return { variant: 'primary' as const, disabled: false, icon: faPlus, label: 'Sync new products' };
      }
      return { variant: 'outline' as const, disabled: true, icon: faCheck, label: 'Synced' };
    }
    
    if (localSyncedProductIds.length > 0) {
      return { variant: 'outline' as const, disabled: true, icon: faCheck, label: 'Synced' };
    }
    return { variant: 'primary' as const, disabled: false, icon: faPlus, label: 'Sync products' };
  };

  // Determine if any sales routing exists
  const hasSalesRouting = demo.getSalesRoutings().length > 0;

  // Count active filters for badge
  const activeFilterCount = [warehouseFilter, publishedFilter, eventFilter, channelFilter, categoryFilter]
    .filter(f => f !== 'all').length;

  // Last sync date
  const lastSyncDate = integration.createdAt
    ? new Date(integration.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className={styles.container}>
      {/* Integration Info Card */}
      <div className={styles.integrationHeaderCard}>
        <div className={styles.headerLeft}>
          <div className={styles.providerIconBox}>
            <div className={`${styles.providerIcon} ${providerClass}`}>
              {integration.provider === 'square' ? (
                <img src="/square-logo.png" alt="Square" className={styles.providerLogoImg} />
              ) : (
                <FontAwesomeIcon icon={faShopify} />
              )}
            </div>
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.integrationName}>{integration.name}</h2>
            <span className={styles.accountId}>{integration.externalAccountId}</span>
            <span className={`${styles.providerTag} ${providerClass}`}>{providerName}</span>
          </div>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statItem}>
            <FontAwesomeIcon icon={faWarehouse} className={styles.statIcon} />
            <span className={styles.statText}>{integrationWarehouses.length} warehouses</span>
          </div>
          <div className={styles.statItem}>
            <FontAwesomeIcon icon={faTshirt} className={styles.statIcon} />
            <span className={styles.statText}>
              {allProducts.length} products{lastSyncDate ? ` (Last sync: ${lastSyncDate})` : ''}
            </span>
          </div>
          <div className={styles.statItem}>
            <FontAwesomeIcon icon={faCalendar} className={styles.statIcon} />
            <span className={styles.statText}>Creation date: {lastSyncDate || 'N/A'}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" size="sm" onClick={() => setShowEditPanel(true)}>
            Edit integration
          </Button>
        </div>
      </div>

      {/* Tabs + Sync Button Row */}
      <div className={styles.tabRow}>
        <div className={styles.tabBar}>
          <button 
            className={`${styles.tab} ${activeTab === 'products' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'warehouses' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('warehouses')}
          >
            Warehouses
          </button>
        </div>
        {activeTab === 'products' && (
          <Button 
            variant={getSyncButtonState().variant} 
            size="sm" 
            onClick={handleSyncProducts}
            disabled={getSyncButtonState().disabled}
          >
            <FontAwesomeIcon 
              icon={getSyncButtonState().icon} 
              spin={isSyncing}
            />
            {getSyncButtonState().label}
          </Button>
        )}
        {activeTab === 'warehouses' && (
          <Button variant="primary" size="sm" onClick={() => setShowAddWarehouse(true)}>
            <FontAwesomeIcon icon={faPlus} />
            Add warehouse
          </Button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'warehouses' && (
        <div className={styles.warehousesContent}>
          {showAddWarehouse && (
            <div className={styles.addWarehouseForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Warehouse name</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g., Main Store"
                    value={newWarehouseName}
                    onChange={(e) => setNewWarehouseName(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>External Location ID</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="LOC_..."
                    value={newWarehouseLocationId}
                    onChange={(e) => setNewWarehouseLocationId(e.target.value)}
                  />
                </div>
                <div className={styles.formActions}>
                  <Button variant="outline" size="sm" onClick={() => setShowAddWarehouse(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={handleAddWarehouse}
                    disabled={!newWarehouseName.trim() || !newWarehouseLocationId.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {integrationWarehouses.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>External Location ID</TableCell>
                  <TableCell>Products</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {integrationWarehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell>
                      {warehouse.name}
                    </TableCell>
                    <TableCell>
                      {warehouse.externalLocationId}
                    </TableCell>
                    <TableCell>
                      {getProductsByWarehouse(warehouse.id).length}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className={styles.emptyWarehouses}>
              <p>No warehouses configured yet.</p>
              <Button variant="primary" size="sm" onClick={() => setShowAddWarehouse(true)}>
                <FontAwesomeIcon icon={faPlus} />
                Add your first warehouse
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className={styles.productsContent}>
          {/* Toolbar: Search + Pagination + Filters */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <div className={styles.searchWrapper}>
                <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search by name, SKU"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.toolbarRight}>
              {/* Pagination */}
              <div className={styles.pagination}>
                <span className={styles.paginationText}>
                  {totalProducts > 0 ? `${startIndex + 1} - ${endIndex}` : '0'} of {totalProducts}
                </span>
                <button
                  className={styles.paginationBtn}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safeCurrentPage <= 1}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                  className={styles.paginationBtn}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage >= totalPages}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
              {/* Filters button */}
              <button
                className={styles.filtersBtn}
                onClick={() => setShowFilterPanel(true)}
              >
                <FontAwesomeIcon icon={faSlidersH} />
                Filters
                {activeFilterCount > 0 && (
                  <span className={styles.filtersBadge}>{activeFilterCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Products Table */}
          {paginatedProducts.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Warehouses</TableCell>
                  <TableCell>Distribution</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.map((product) => {
                  const productWarehouseDetails = getWarehousesForProductLocal(product.id);
                  const isNew = (() => {
                    if (!product.syncedAt) return false;
                    const syncedDate = new Date(product.syncedAt);
                    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
                    return (Date.now() - syncedDate.getTime()) < threeDaysMs;
                  })();
                  const unpublishedReason = demo.getUnpublishedReason(product.id);
                  
                  const publications = demo.isResetMode 
                    ? getPublicationsFromRoutings(product.id)
                    : getStaticProductPublications(product.id);
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className={styles.productNameCell}>
                          <div className={styles.productThumb}>
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} />
                            ) : (
                              <div className={styles.thumbPlaceholder}>
                                <FontAwesomeIcon icon={faImage} />
                              </div>
                            )}
                          </div>
                          {isNew && <span className={styles.newBadge}>New</span>}
                          <div className={styles.productNameContent}>
                            <span className={styles.productName}>{product.name}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className={styles.sku}>{product.sku}</code>
                      </TableCell>
                      <TableCell>
                        <span className={styles.categoryText}>
                          {demo.getProductCategoryPath(product.id)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {productWarehouseDetails.length === 0 ? (
                          <span className={styles.categoryText}>—</span>
                        ) : (
                          <div className={styles.warehouseCell}>
                            <button
                              className={styles.warehouseBadge}
                              onClick={() => setWarehousePanelProduct({
                                id: product.id,
                                name: product.name,
                                warehouses: productWarehouseDetails,
                              })}
                            >
                              {productWarehouseDetails.length} warehouse{productWarehouseDetails.length > 1 ? 's' : ''}
                            </button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {renderPublicationStatus(product, publications, unpublishedReason)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className={styles.emptyProducts}>
              <div className={styles.emptyProductsContent}>
                <h4 className={styles.emptyProductsTitle}>No results</h4>
                <p className={styles.emptyProductsDescription}>
                  {searchQuery.trim() || activeFilterCount > 0
                    ? "Sorry, we couldn't find any product with your search criteria. Please change the filters and try again."
                    : 'No products in the catalog yet. Sync your catalog to see products here.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Publication Details Modal */}
      {publicationModalProduct && (
        <PublicationModal
          isOpen={true}
          productId={publicationModalProduct.id}
          productName={publicationModalProduct.name}
          publications={publicationModalProduct.publications}
          onClose={() => setPublicationModalProduct(null)}
        />
      )}

      {/* Warehouse Info Side Panel */}
      <WarehouseSidePanel
        isOpen={warehousePanelProduct !== null}
        productName={warehousePanelProduct?.name ?? ''}
        warehouses={warehousePanelProduct?.warehouses ?? []}
        onClose={() => setWarehousePanelProduct(null)}
      />

      {/* Edit Integration Side Panel */}
      <EditIntegrationSidePanel
        isOpen={showEditPanel}
        currentName={integration.name}
        onSave={(newName) => demo.updateIntegrationName(newName)}
        onClose={() => setShowEditPanel(false)}
      />

      {/* Filter Side Panel */}
      <FilterSidePanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        warehouseFilter={warehouseFilter}
        setWarehouseFilter={setWarehouseFilter}
        warehouseOptions={integrationWarehouses.map(wh => ({ value: wh.id, label: wh.name }))}
        publishedFilter={publishedFilter}
        setPublishedFilter={setPublishedFilter}
        eventFilter={eventFilter}
        setEventFilter={setEventFilter}
        eventOptions={availableEvents.map(evt => ({ value: evt.id, label: evt.name }))}
        channelFilter={channelFilter}
        setChannelFilter={setChannelFilter}
        channelOptions={availableChannels.map(ch => ({ value: ch.id, label: ch.name }))}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categoryOptions={availableCategories.map(cat => ({ value: cat.id, label: cat.name }))}
        resultCount={filteredProducts.length}
        hasSalesRouting={hasSalesRouting}
      />
    </div>
  );
}
