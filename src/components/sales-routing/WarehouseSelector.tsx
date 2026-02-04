import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faBox, faSquare, faStar as faStarSolid, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons';
import { faShopify } from '@fortawesome/free-brands-svg-icons';
import { Badge } from '../common/Badge';
import { useDemo } from '../../context/DemoContext';
import { warehouses as staticWarehouses } from '../../data/mockData';
import { DEMO_WAREHOUSE_1_ID, DEMO_WAREHOUSE_2_ID, DEMO_WAREHOUSE_3_ID } from '../../data/productPool';
import type { RoutingType } from '../../data/mockData';
import styles from './WarehouseSelector.module.css';

interface WarehouseSelectorProps {
  value: string[];
  onChange: (warehouseIds: string[]) => void;
  routingType: RoutingType;
  priceReferenceId?: string | null;
  onPriceReferenceChange?: (warehouseId: string) => void;
}

const integrationIcons: Record<string, typeof faSquare> = {
  Square: faSquare,
  Shopify: faShopify,
  Manual: faBox
};

export function WarehouseSelector({ 
  value, 
  onChange, 
  routingType,
  priceReferenceId,
  onPriceReferenceChange 
}: WarehouseSelectorProps) {
  const demo = useDemo();
  // Use demo warehouses if in reset mode, otherwise use static
  const warehouses = demo.isResetMode ? demo.getWarehouses() : staticWarehouses;
  const productWarehouses = demo.getProductWarehouses();
  
  // Get product count for a warehouse (from demo context or static)
  const getProductCount = (warehouseId: string) => {
    if (demo.isResetMode) {
      // Count unique products in this warehouse from demo context
      return productWarehouses.filter(pw => pw.warehouseId === warehouseId).length;
    }
    // Use static count from warehouse data
    const warehouse = warehouses.find(w => w.id === warehouseId);
    return warehouse?.productCount || 0;
  };
  
  const isMultiSelect = routingType === 'onsite';
  const showPriceReference = isMultiSelect && value.length >= 2;

  const handleSelect = (warehouseId: string) => {
    if (isMultiSelect) {
      // Multi-select for onsite
      if (value.includes(warehouseId)) {
        onChange(value.filter(id => id !== warehouseId));
      } else {
        onChange([...value, warehouseId]);
      }
    } else {
      // Single-select for online
      onChange([warehouseId]);
    }
  };

  const handleSelectAll = () => {
    if (value.length === warehouses.length) {
      onChange([]);
    } else {
      onChange(warehouses.map(w => w.id));
    }
  };

  const handlePriceReferenceClick = (e: React.MouseEvent, warehouseId: string) => {
    e.stopPropagation(); // Prevent triggering the parent button's onClick
    if (onPriceReferenceChange) {
      onPriceReferenceChange(warehouseId);
    }
  };

  const handleFillDemoData = () => {
    if (isMultiSelect) {
      // Onsite: select Main Store + Gift Shop to demonstrate price reference feature
      // This leaves Pop-up Store without routing (for "No sales routing" demo)
      const demoWarehouseIds = warehouses
        .filter(w => w.id === DEMO_WAREHOUSE_1_ID || w.id === DEMO_WAREHOUSE_2_ID)
        .map(w => w.id);
      onChange(demoWarehouseIds);
      // Set Main Store as price reference
      if (onPriceReferenceChange && demoWarehouseIds.includes(DEMO_WAREHOUSE_1_ID)) {
        onPriceReferenceChange(DEMO_WAREHOUSE_1_ID);
      }
    } else {
      // Online: select Pop-up Store
      // This demonstrates: new products synced to Pop-up Store will show
      // "Not added to sales routing" because they're not in selectedProductIds
      const popupStore = warehouses.find(w => w.id === DEMO_WAREHOUSE_3_ID);
      if (popupStore) {
        onChange([popupStore.id]);
      }
    }
  };

  const title = isMultiSelect ? 'Select warehouse(s)' : 'Select warehouse';
  const subtitle = isMultiSelect
    ? 'Choose which warehouses to pull stock from. The specific warehouse used will be configured per plan in the Box Office. Warehouses are configured in the Catalog integration tab.'
    : 'Choose the warehouse to pull stock from for this routing. Warehouses are configured in the Catalog integration tab.';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        {demo.isResetMode && warehouses.length > 0 && (
          <button className={styles.fillDemoBtn} onClick={handleFillDemoData}>
            <FontAwesomeIcon icon={faMagicWandSparkles} />
            Select suggested
          </button>
        )}
      </div>

      {showPriceReference && (
        <div className={styles.priceReferenceHint}>
          <FontAwesomeIcon icon={faStarSolid} className={styles.hintIcon} />
          <span>
            Click the star on a selected warehouse to set it as the <strong>price reference</strong>. 
            When a product exists in multiple warehouses with different prices, the price reference warehouse's price will be used.
          </span>
        </div>
      )}

      {isMultiSelect && (
        <div className={styles.selectAllWrapper}>
          <button 
            className={styles.selectAllBtn}
            onClick={handleSelectAll}
          >
            <div className={`${styles.checkbox} ${value.length === warehouses.length ? styles.checked : ''}`}>
              {value.length === warehouses.length && <FontAwesomeIcon icon={faCheck} />}
            </div>
            <span>Select all warehouses</span>
          </button>
          <span className={styles.selectedCount}>
            {value.length} of {warehouses.length} selected
          </span>
        </div>
      )}

      <div className={styles.warehouseList}>
        {warehouses.map((warehouse) => {
          const isSelected = value.includes(warehouse.id);
          const isPriceReference = priceReferenceId === warehouse.id;
          
          return (
            <button
              key={warehouse.id}
              className={`${styles.warehouseItem} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleSelect(warehouse.id)}
            >
              <div className={`${isMultiSelect ? styles.checkbox : styles.radio} ${isSelected ? styles.checked : ''}`}>
                {isSelected && (
                  isMultiSelect 
                    ? <FontAwesomeIcon icon={faCheck} />
                    : <div className={styles.radioInner} />
                )}
              </div>
              
              <div className={styles.warehouseContent}>
                <div className={styles.warehouseHeader}>
                  <h3 className={styles.warehouseName}>{warehouse.name}</h3>
                  <div className={styles.headerActions}>
                    {showPriceReference && isSelected && (
                      <button
                        type="button"
                        className={`${styles.priceReferenceBtn} ${isPriceReference ? styles.active : ''}`}
                        onClick={(e) => handlePriceReferenceClick(e, warehouse.id)}
                        title={isPriceReference ? 'Price reference' : 'Set as price reference'}
                      >
                        <FontAwesomeIcon icon={isPriceReference ? faStarSolid : faStarOutline} />
                        {isPriceReference && <span className={styles.priceRefLabel}>Price ref</span>}
                      </button>
                    )}
                    <Badge variant="secondary" size="sm">
                      <FontAwesomeIcon 
                        icon={integrationIcons[warehouse.integration] || faBox} 
                        className={styles.integrationIcon}
                      />
                      {warehouse.integration}
                    </Badge>
                  </div>
                </div>
                <div className={styles.warehouseMeta}>
                  <span className={styles.productCount}>
                    <FontAwesomeIcon icon={faBox} />
                    {getProductCount(warehouse.id)} products
                  </span>
                  <span className={styles.catalogId}>
                    ID: {warehouse.masterCatalogId.substring(0, 20)}...
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {value.length > 0 && (
        <div className={styles.summary}>
          <strong>Total products:</strong>{' '}
          {value.reduce((sum, warehouseId) => sum + getProductCount(warehouseId), 0)
          } from {value.length} warehouse{value.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
