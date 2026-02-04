import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus, faTrash, faExclamationTriangle, faSquare, faImage, faSync, faSpinner, faCheck, faSearch } from '@fortawesome/free-solid-svg-icons';
import { faShopify } from '@fortawesome/free-brands-svg-icons';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Table, TableHead, TableBody, TableRow, TableCell } from '../common/Table';
import { Toast } from '../common/Toast';
import { DeleteIntegrationModal } from './DeleteIntegrationModal';
import { PublicationModal } from './PublicationModal';
import { WarehousePopover } from './WarehousePopover';
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

export function IntegrationDetails({ integration }: IntegrationDetailsProps) {
  const navigate = useNavigate();
  const demo = useDemo();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'products' | 'warehouses'>('products');
  
  // UI state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [, setEditingWarehouse] = useState<string | null>(null);
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [newWarehouseName, setNewWarehouseName] = useState('');
  const [newWarehouseLocationId, setNewWarehouseLocationId] = useState('');
  const [openWarehousePopover, setOpenWarehousePopover] = useState<string | null>(null);
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
  
  // Local sync UI state
  const [isSyncing, setIsSyncing] = useState(false);
  const [localSyncedProductIds, setLocalSyncedProductIds] = useState<string[]>([]);
  
  // Toast state
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [syncResult, setSyncResult] = useState<{ newCount: number; unpublishedCount: number } | null>(null);

  // Get data from demo context
  const allWarehouses = demo.getWarehouses();
  const allProducts = demo.getProducts();
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
      // Simple hash function to generate consistent 8-digit number
      const str = `${routingId}-${prodId}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      // Ensure positive 8-digit number
      return String(Math.abs(hash) % 90000000 + 10000000);
    };
    
    routings.forEach(routing => {
      const routingUsesProductWarehouse = routing.warehouseIds.some(whId => 
        productWarehouseIds.includes(whId)
      );
      
      if (!routingUsesProductWarehouse) return;
      
      const event = getEventById(routing.eventId);
      if (!event) return;
      
      // New logic: Check channels instead of deprecated type field
      const hasBoxOffice = routing.channelIds.some(id => isBoxOfficeChannel(id));
      const mappedWarehouseIds = Object.values(routing.channelWarehouseMapping);
      const isInOnlineChannel = mappedWarehouseIds.some(whId => productWarehouseIds.includes(whId));
      
      // Product is published if:
      // 1. Routing has Box Office and product's warehouse is in the routing
      // 2. Product's warehouse is mapped to an online channel
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
  
  // Apply all filters
  const filteredProducts = useMemo(() => {
    let products = allProducts;
    
    // 1. Text search (name or SKU)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q)
      );
    }
    
    // 2. Filter by warehouse
    if (warehouseFilter !== 'all') {
      products = getProductsByWarehouse(warehouseFilter);
      // Re-apply search filter after warehouse filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.sku.toLowerCase().includes(q)
        );
      }
    }
    
    // 3. Filter by publication status
    if (publishedFilter === 'unpublished') {
      products = products.filter(p => !demo.isProductPublished(p.id));
    } else if (publishedFilter === 'published') {
      products = products.filter(p => demo.isProductPublished(p.id));
    }
    
    // 4. Filter by event
    if (eventFilter !== 'all') {
      products = products.filter(p => {
        const pubs = demo.isResetMode 
          ? getPublicationsFromRoutings(p.id)
          : getStaticProductPublications(p.id);
        return pubs.some(pub => pub.event?.id === eventFilter);
      });
    }
    
    // 5. Filter by channel
    if (channelFilter !== 'all') {
      products = products.filter(p => {
        const pubs = demo.isResetMode 
          ? getPublicationsFromRoutings(p.id)
          : getStaticProductPublications(p.id);
        return pubs.some(pub => pub.salesRouting?.channelIds.includes(channelFilter));
      });
    }
    
    return products;
  }, [allProducts, searchQuery, warehouseFilter, publishedFilter, eventFilter, channelFilter, productWarehouses, demo.isResetMode]);
  
  const providerIcon = integration.provider === 'square' ? faSquare : faShopify;
  const providerClass = integration.provider === 'square' ? styles.square : styles.shopify;

  const handleDeleteIntegration = () => {
    // In real app, would delete via API
    console.log('Deleting integration:', integration.id);
    setShowDeleteModal(false);
  };

  const handleAddWarehouse = () => {
    if (newWarehouseName.trim() && newWarehouseLocationId.trim()) {
      console.log('Adding warehouse:', { name: newWarehouseName, locationId: newWarehouseLocationId });
      setNewWarehouseName('');
      setNewWarehouseLocationId('');
      setShowAddWarehouse(false);
    }
  };

  const handleDeleteWarehouse = (warehouseId: string) => {
    console.log('Deleting warehouse:', warehouseId);
  };

  const handleSyncProducts = () => {
    if (isSyncing) return;
    
    // In reset mode, use demo context sync
    // In normal mode, use static data sync (for pending products)
    if (demo.isResetMode) {
      if (demo.hasSynced && demo.secondSyncDone) return;
    }
    
    setIsSyncing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (demo.isResetMode) {
        // Use demo context sync
        const { newCount, newProductIds } = demo.syncProducts();
        const unpublishedCount = newProductIds.filter(id => !demo.isProductPublished(id)).length;
        
        setLocalSyncedProductIds(newProductIds);
        setSyncResult({ newCount, unpublishedCount });
        setShowSyncToast(newCount > 0);
      } else {
        // Use static data sync for pending products
        const pendingProducts = allProducts.filter(p => p.pendingSync);
        const newProductIds = pendingProducts.map(p => p.id);
        const unpublishedCount = pendingProducts.filter(p => !demo.isProductPublished(p.id)).length;
        
        setLocalSyncedProductIds(newProductIds);
        setSyncResult({
          newCount: pendingProducts.length,
          unpublishedCount
        });
        setShowSyncToast(pendingProducts.length > 0);
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
    // If published, show clickable badge
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
          Distributed to {publications.length} event{publications.length > 1 ? 's' : ''}
        </button>
      );
    }

    // Not published - warehouse has no sales routing configured
    return (
      <div className={styles.unpublishedWarning}>
        <div className={`${styles.unpublishedBadge} ${styles.noRouting}`}>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          No sales routing
        </div>
        <div className={styles.unpublishedHint}>
          This warehouse has no sales routing configured
        </div>
        <button 
          className={styles.createRoutingBtn}
          onClick={() => navigate('/products/sales-routing/create')}
        >
          Create sales routing
        </button>
      </div>
    );
  };

  // Determine sync button state based on mode and sync status
  const getSyncButtonState = () => {
    if (isSyncing) {
      return { variant: 'primary' as const, disabled: true, icon: faSpinner, label: 'Syncing...' };
    }
    
    if (demo.isResetMode) {
      // Reset mode: first sync, then second sync
      if (!demo.hasSynced) {
        return { variant: 'primary' as const, disabled: false, icon: faSync, label: 'Sync products' };
      }
      if (!demo.secondSyncDone) {
        return { variant: 'primary' as const, disabled: false, icon: faSync, label: 'Sync new products' };
      }
      return { variant: 'outline' as const, disabled: true, icon: faCheck, label: 'Synced' };
    }
    
    // Normal mode: only one sync for pending products
    if (localSyncedProductIds.length > 0) {
      return { variant: 'outline' as const, disabled: true, icon: faCheck, label: 'Synced' };
    }
    return { variant: 'primary' as const, disabled: false, icon: faSync, label: 'Sync products' };
  };

  return (
    <div className={styles.container}>
      {/* Integration Info Card */}
      <Card padding="none">
        <div className={styles.integrationHeader}>
          <div className={styles.headerLeft}>
            <div className={`${styles.providerIcon} ${providerClass}`}>
              <FontAwesomeIcon icon={providerIcon} />
            </div>
            <div className={styles.headerInfo}>
              <div className={styles.headerTop}>
                <h2 className={styles.integrationName}>{integration.name}</h2>
                <span className={`${styles.providerLabel} ${providerClass}`}>{providerName}</span>
              </div>
              <div className={styles.headerMeta}>
                <span className={styles.metaItem}>
                  <strong>Master catalog ID:</strong> {integration.externalAccountId}
                </span>
                <span className={styles.metaItem}>
                  <strong>Created:</strong> {new Date(integration.createdAt).toLocaleDateString()}
                </span>
                <span className={styles.metaSeparator}>·</span>
                <span className={styles.metaStat}>{allProducts.length} products</span>
                <span className={styles.metaSeparator}>·</span>
                <span className={styles.metaStat}>{integrationWarehouses.length} warehouses</span>
              </div>
            </div>
          </div>
          <div className={styles.headerActions}>
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
            <Button variant="outline" size="sm">
              <FontAwesomeIcon icon={faEdit} />
              Edit details
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs + Content Card */}
      <Card padding="none">
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

        {/* Warehouses Tab Content */}
        {activeTab === 'warehouses' && (
        <>
        <CardHeader 
          title="Warehouses" 
          subtitle={`Manage warehouses linked to your ${providerName} account`}
          action={
            <Button variant="primary" size="sm" onClick={() => setShowAddWarehouse(true)}>
              <FontAwesomeIcon icon={faPlus} />
              Add warehouse
            </Button>
          }
        />
        <CardBody padding="none">
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
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {integrationWarehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell>
                      <span className={styles.warehouseName}>{warehouse.name}</span>
                    </TableCell>
                    <TableCell>
                      <code className={styles.locationId}>{warehouse.externalLocationId}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" size="sm">
                        {getProductsByWarehouse(warehouse.id).length} products
                      </Badge>
                    </TableCell>
                    <TableCell align="right">
                      <div className={styles.actions}>
                        <button 
                          className={styles.actionBtn}
                          onClick={() => setEditingWarehouse(warehouse.id)}
                          title="Edit warehouse"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button 
                          className={`${styles.actionBtn} ${styles.danger}`}
                          onClick={() => handleDeleteWarehouse(warehouse.id)}
                          title="Delete warehouse"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
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
        </CardBody>
        </>
        )}

        {/* Products Tab Content */}
        {activeTab === 'products' && (
        <>
        <CardHeader 
          title="Products" 
          subtitle={`All products from your ${providerName} catalog`}
        />
        <div className={styles.filterBar}>
          <div className={styles.searchWrapper}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.filterDropdown}>
            <span className={styles.filterDropdownLabel}>Warehouse</span>
            <select 
              className={styles.filterSelect}
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
            >
              <option value="all">All</option>
              {integrationWarehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterDropdown}>
            <span className={styles.filterDropdownLabel}>Status</span>
            <select 
              className={styles.filterSelect}
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="published">Distributed</option>
              <option value="unpublished">Not distributed</option>
            </select>
          </div>
          <div className={styles.filterDropdown}>
            <span className={styles.filterDropdownLabel}>Event</span>
            <select 
              className={styles.filterSelect}
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            >
              <option value="all">All</option>
              {availableEvents.map(evt => (
                <option key={evt.id} value={evt.id}>{evt.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterDropdown}>
            <span className={styles.filterDropdownLabel}>Channel</span>
            <select 
              className={styles.filterSelect}
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
            >
              <option value="all">All</option>
              {availableChannels.map(channel => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <CardBody padding="none">
          {filteredProducts.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Warehouses</TableCell>
                  <TableCell>Distribution</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.map((product) => {
                  const productWarehouseDetails = getWarehousesForProductLocal(product.id);
                  const isNew = localSyncedProductIds.includes(product.id) || demo.syncedProductIds.includes(product.id);
                  const unpublishedReason = demo.getUnpublishedReason(product.id);
                  
                  // Get publications - in demo mode, derive from routings; otherwise use static
                  const publications = demo.isResetMode 
                    ? getPublicationsFromRoutings(product.id)
                    : getStaticProductPublications(product.id);
                  
                  return (
                    <TableRow key={product.id} className={isNew ? styles.newProductRow : undefined}>
                      <TableCell>
                        <div className={styles.productImage}>
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} />
                          ) : (
                            <div className={styles.imagePlaceholder}>
                              <FontAwesomeIcon icon={faImage} />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={styles.productNameCell}>
                          {isNew && <span className={styles.newBadge}>New</span>}
                          <span className={styles.productName}>{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className={styles.sku}>{product.sku}</code>
                      </TableCell>
                      <TableCell>
                        {productWarehouseDetails.length === 0 ? (
                          <Badge variant="secondary" size="sm">
                            Not in any warehouse
                          </Badge>
                        ) : (
                          <div 
                            className={styles.warehouseCell}
                            onMouseEnter={() => setOpenWarehousePopover(product.id)}
                            onMouseLeave={() => setOpenWarehousePopover(null)}
                          >
                            <span className={styles.warehouseBadge}>
                              In {productWarehouseDetails.length} warehouse{productWarehouseDetails.length > 1 ? 's' : ''}
                            </span>
                            {openWarehousePopover === product.id && (
                              <WarehousePopover
                                warehouses={productWarehouseDetails}
                                onClose={() => setOpenWarehousePopover(null)}
                              />
                            )}
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
              <p>
                {warehouseFilter === 'all' && publishedFilter === 'all'
                  ? 'No products in the catalog yet.'
                  : warehouseFilter !== 'all' && publishedFilter !== 'all'
                    ? 'No products match the selected filters.'
                    : warehouseFilter !== 'all'
                      ? 'No products in this warehouse.'
                      : 'No products with this status.'}
              </p>
            </div>
          )}
        </CardBody>
        </>
        )}
      </Card>

      {/* Danger Zone */}
      <Card padding="none">
        <div className={styles.dangerZone}>
          <div className={styles.dangerContent}>
            <div className={styles.dangerIcon}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </div>
            <div className={styles.dangerInfo}>
              <h4 className={styles.dangerTitle}>Delete integration</h4>
              <p className={styles.dangerDescription}>
                Permanently delete this catalog integration and all its warehouses. 
                This will affect any sales routings using these warehouses.
              </p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
            <FontAwesomeIcon icon={faTrash} />
            Delete integration
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteIntegrationModal
        isOpen={showDeleteModal}
        integrationName={integration.name}
        warehouseCount={integrationWarehouses.length}
        onConfirm={handleDeleteIntegration}
        onCancel={() => setShowDeleteModal(false)}
      />

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

      {/* Sync Toast Notification */}
      {showSyncToast && syncResult && (
        <div className={styles.toastContainer}>
          <Toast
            variant={syncResult.unpublishedCount > 0 ? 'warning' : 'success'}
            title={`Synced ${syncResult.newCount} new product${syncResult.newCount !== 1 ? 's' : ''}`}
            message={
              syncResult.unpublishedCount > 0 
                ? `${syncResult.unpublishedCount} product${syncResult.unpublishedCount !== 1 ? 's are' : ' is'} not published to any sales channel`
                : 'All products are published'
            }
            actionLabel={syncResult.unpublishedCount > 0 ? 'View unpublished' : undefined}
            onAction={() => {
              setWarehouseFilter('unpublished');
              setShowSyncToast(false);
            }}
            onDismiss={() => setShowSyncToast(false)}
            autoDismiss={15000}
          />
        </div>
      )}
    </div>
  );
}
