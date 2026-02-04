import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheck, faImage, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { useDemo } from '../../context/DemoContext';
import { getProductsByWarehouseId as getStaticProducts, getProductWarehouseDetails } from '../../data/mockData';
import { SUGGESTED_ONLINE_PRODUCT_IDS } from '../../data/productPool';
import styles from './ProductSelector.module.css';

interface ProductSelectorProps {
  warehouseId: string;
  selectedProductIds: string[];
  onChange: (productIds: string[]) => void;
}

export function ProductSelector({ warehouseId, selectedProductIds, onChange }: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const demo = useDemo();
  
  // Get all products in this warehouse from demo context or static
  const allProducts = useMemo(() => {
    if (demo.isResetMode) {
      const products = demo.getProducts();
      const productWarehouses = demo.getProductWarehouses();
      const productIds = productWarehouses
        .filter(pw => pw.warehouseId === warehouseId)
        .map(pw => pw.productId);
      return products.filter(p => productIds.includes(p.id));
    }
    return getStaticProducts(warehouseId);
  }, [warehouseId, demo.isResetMode, demo.getProducts, demo.getProductWarehouses]);
  
  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return allProducts;
    const query = searchQuery.toLowerCase();
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)
    );
  }, [allProducts, searchQuery]);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const handleToggleProduct = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      onChange(selectedProductIds.filter(id => id !== productId));
    } else {
      onChange([...selectedProductIds, productId]);
    }
  };

  const handleSelectAll = () => {
    const allIds = filteredProducts.map(p => p.id);
    // Merge with existing selection (in case some were selected before filtering)
    const newSelection = [...new Set([...selectedProductIds, ...allIds])];
    onChange(newSelection);
  };

  const handleClearAll = () => {
    // Only clear the filtered products, keep others
    const filteredIds = new Set(filteredProducts.map(p => p.id));
    onChange(selectedProductIds.filter(id => !filteredIds.has(id)));
  };

  const handleSelectSuggested = () => {
    // Select the suggested products that exist in this warehouse
    const availableSuggested = SUGGESTED_ONLINE_PRODUCT_IDS.filter(id => 
      allProducts.some(p => p.id === id)
    );
    onChange(availableSuggested);
  };

  const selectedInView = filteredProducts.filter(p => selectedProductIds.includes(p.id)).length;
  const hasSuggestedProducts = demo.isResetMode && SUGGESTED_ONLINE_PRODUCT_IDS.some(id => 
    allProducts.some(p => p.id === id)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Select products to publish</h2>
          <p className={styles.subtitle}>
            Choose which products from this warehouse to make available as add-ons for this event.
          </p>
        </div>
        {hasSuggestedProducts && (
          <button className={styles.selectSuggestedBtn} onClick={handleSelectSuggested}>
            <FontAwesomeIcon icon={faMagicWandSparkles} />
            Select suggested
          </button>
        )}
      </div>

      {/* Search and bulk actions */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className={styles.bulkActions}>
          <button 
            className={styles.bulkBtn}
            onClick={handleSelectAll}
            disabled={filteredProducts.length === 0}
          >
            Select all
          </button>
          <button 
            className={styles.bulkBtn}
            onClick={handleClearAll}
            disabled={selectedInView === 0}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Product list */}
      <div className={styles.listWrapper}>
        {filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery ? 'No products match your search.' : 'No products in this warehouse.'}
          </div>
        ) : (
          <div className={styles.list}>
            {filteredProducts.map(product => {
              const isSelected = selectedProductIds.includes(product.id);
              const priceInfo = getProductWarehouseDetails(product.id, warehouseId);
              
              return (
                <button
                  key={product.id}
                  className={`${styles.productItem} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleToggleProduct(product.id)}
                >
                  <div className={`${styles.checkbox} ${isSelected ? styles.checked : ''}`}>
                    {isSelected && <FontAwesomeIcon icon={faCheck} />}
                  </div>
                  <div className={styles.productImage}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <FontAwesomeIcon icon={faImage} />
                      </div>
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <span className={styles.productName}>{product.name}</span>
                    <span className={styles.productSku}>{product.sku}</span>
                  </div>
                  {priceInfo && (
                    <span className={styles.productPrice}>
                      {formatPrice(priceInfo.price, priceInfo.currency)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <span className={styles.summaryText}>
          <strong>{selectedProductIds.length}</strong> product{selectedProductIds.length !== 1 ? 's' : ''} selected
        </span>
        {searchQuery && (
          <span className={styles.summaryFilter}>
            (showing {filteredProducts.length} of {allProducts.length})
          </span>
        )}
      </div>
    </div>
  );
}
