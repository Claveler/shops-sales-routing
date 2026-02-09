import { useState, useMemo, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch,
  faImage,
  faEye,
  faEyeSlash,
  faInfoCircle,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import { useDemo } from '../../context/DemoContext';
import { getChannelById, isBoxOfficeChannel } from '../../data/mockData';
import styles from './ChannelProductList.module.css';

interface ChannelProductListProps {
  channelId: string;
  routingId: string;
}

export function ChannelProductList({ channelId, routingId }: ChannelProductListProps) {
  const demo = useDemo();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Track local visibility overrides (pending changes)
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  
  // Reset pending changes when switching channel or routing
  useEffect(() => {
    setPendingChanges({});
  }, [channelId, routingId]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = Object.keys(pendingChanges).length > 0;

  const channel = getChannelById(channelId);
  const isBoxOffice = isBoxOfficeChannel(channelId);

  // Get the specific routing
  const routing = useMemo(() => {
    return demo.getSalesRoutings().find(r => r.id === routingId);
  }, [demo, routingId]);

  // Get all products available in this channel (from connected warehouses)
  const channelProducts = useMemo(() => {
    if (!routing) return [];
    
    const productIds = new Set<string>();
    const productWarehouses = demo.getProductWarehouses();
    
    // Get warehouse(s) for this channel
    let warehouseIds: string[] = [];
    
    if (isBoxOffice) {
      // Box Office uses all warehouses in the routing
      warehouseIds = routing.warehouseIds;
    } else {
      // Online channels use the specific mapped warehouse
      const mappedWarehouseId = routing.channelWarehouseMapping[channelId];
      if (mappedWarehouseId) {
        warehouseIds = [mappedWarehouseId];
      }
    }
    
    // Get products in these warehouses
    productWarehouses
      .filter(pw => warehouseIds.includes(pw.warehouseId))
      .forEach(pw => productIds.add(pw.productId));
    
    return demo.getProducts().filter(p => productIds.has(p.id));
  }, [demo, channelId, routing, isBoxOffice]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set<string>();
    channelProducts.forEach(product => {
      const category = demo.getProductCategory(product.id);
      if (category) {
        cats.add(category.name);
      }
    });
    return Array.from(cats).sort();
  }, [channelProducts, demo]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return channelProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (categoryFilter === 'all') return matchesSearch;
      
      const category = demo.getProductCategory(product.id);
      return matchesSearch && category?.name === categoryFilter;
    });
  }, [channelProducts, searchQuery, categoryFilter, demo]);

  // Get visibility status for products (checks pending changes first)
  const getProductVisibility = (productId: string) => {
    // Check pending changes first
    if (productId in pendingChanges) {
      return pendingChanges[productId];
    }
    // Fall back to stored state
    if (!routing) return true;
    return demo.isProductVisibleInChannel(productId, channelId, routingId);
  };

  // Toggle product visibility (stages changes locally)
  const toggleVisibility = (productId: string) => {
    const currentVisibility = getProductVisibility(productId);
    setPendingChanges(prev => ({
      ...prev,
      [productId]: !currentVisibility
    }));
  };

  // Save all pending changes
  const handleSave = () => {
    Object.entries(pendingChanges).forEach(([productId, visible]) => {
      demo.setProductChannelVisibility(productId, channelId, routingId, visible);
    });
    setPendingChanges({});
  };

  // Discard all pending changes
  const handleDiscard = () => {
    setPendingChanges({});
  };


  if (!channel) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>Channel not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Product card */}
      <div className={styles.productCard}>
        <div className={styles.productSectionHeader}>
          <p className={styles.productSectionDescription}>
            Toggle visibility for the products you want to sell through <strong>{channel.name}</strong>.
          </p>
        </div>

        {isBoxOffice && (
          <div className={styles.infoBar}>
            <FontAwesomeIcon icon={faInfoCircle} />
            <span>Box Office products are available across all connected POS devices.</span>
          </div>
        )}

        <div className={styles.productTableHeader}>
          <span className={styles.productTableTitle}>Product</span>
          {hasUnsavedChanges && (
            <div className={styles.headerActions}>
              <button className={styles.discardBtn} onClick={handleDiscard}>
                Discard
              </button>
              <button className={styles.saveBtn} onClick={handleSave}>
                <FontAwesomeIcon icon={faSave} />
                Save
              </button>
            </div>
          )}
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          {categories.length > 0 && (
            <select 
              className={styles.filterSelect}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>

        <div className={styles.productList}>
          {filteredProducts.length === 0 ? (
            <div className={styles.emptyState}>
              {channelProducts.length === 0 ? (
                <p>No products are connected to this channel through sales routing.</p>
              ) : (
                <p>No products match your search.</p>
              )}
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.visibilityCol}>Visible</th>
                  <th className={styles.imageCol}>Image</th>
                  <th className={styles.nameCol}>Product</th>
                  <th className={styles.skuCol}>SKU</th>
                  <th className={styles.categoryCol}>Category</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const isVisible = getProductVisibility(product.id);
                  const category = demo.getProductCategoryPath(product.id);
                  
                  return (
                    <tr 
                      key={product.id} 
                      className={`${styles.productRow} ${!isVisible ? styles.hidden : ''}`}
                    >
                      <td className={styles.visibilityCol}>
                        <button
                          className={`${styles.visibilityToggle} ${isVisible ? styles.visible : styles.hidden}`}
                          onClick={() => toggleVisibility(product.id)}
                          title={isVisible ? 'Hide product' : 'Show product'}
                        >
                          <FontAwesomeIcon icon={isVisible ? faEye : faEyeSlash} />
                        </button>
                      </td>
                      <td className={styles.imageCol}>
                        <div className={styles.productImage}>
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} />
                          ) : (
                            <FontAwesomeIcon icon={faImage} className={styles.imagePlaceholder} />
                          )}
                        </div>
                      </td>
                      <td className={styles.nameCol}>
                        <span className={styles.productName}>{product.name}</span>
                      </td>
                      <td className={styles.skuCol}>
                        <span className={styles.productSku}>{product.sku}</span>
                      </td>
                      <td className={styles.categoryCol}>
                        <span className={styles.productCategory}>{category}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
