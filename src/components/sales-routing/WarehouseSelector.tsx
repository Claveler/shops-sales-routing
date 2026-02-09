import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faBox, faSquare, faStar as faStarSolid, faMagicWandSparkles, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarOutline } from '@fortawesome/free-regular-svg-icons';
import { faShopify } from '@fortawesome/free-brands-svg-icons';
import { Badge } from '../common/Badge';
import { useDemo } from '../../context/DemoContext';
import { warehouses as staticWarehouses, hasBoxOfficeChannel, isBoxOfficeChannel } from '../../data/mockData';
import { DEMO_WAREHOUSE_1_ID, DEMO_WAREHOUSE_2_ID } from '../../data/productPool';
import styles from './WarehouseSelector.module.css';

interface WarehouseSelectorProps {
  value: string[];
  onChange: (warehouseIds: string[]) => void;
  allowMultiple: boolean;
  maxWarehouses?: number;
  priceReferenceId?: string | null;
  onPriceReferenceChange?: (warehouseId: string) => void;
  selectedChannelIds: string[];
}

const integrationIcons: Record<string, typeof faSquare> = {
  Square: faSquare,
  Shopify: faShopify,
  Manual: faBox
};

export function WarehouseSelector({ 
  value, 
  onChange, 
  allowMultiple,
  maxWarehouses = Infinity,
  priceReferenceId,
  onPriceReferenceChange,
  selectedChannelIds
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
  
  const showPriceReference = allowMultiple && value.length >= 2;

  // Determine explanation text based on channel selection
  const hasBoxOffice = hasBoxOfficeChannel(selectedChannelIds);
  const onlineCount = selectedChannelIds.filter(id => !isBoxOfficeChannel(id)).length;
  const isAtCap = !hasBoxOffice && value.length >= maxWarehouses;
  
  let explanationText = '';
  if (hasBoxOffice) {
    explanationText = 'Box Office removes warehouse limits. You can select as many warehouses as you need. Online channels will be assigned individually in the next step.';
  } else if (onlineCount > 1) {
    explanationText = `You have ${onlineCount} online channels, so you can select up to ${onlineCount} warehouses (one per channel). You'll assign them in the next step.`;
  } else if (onlineCount === 1) {
    explanationText = 'With a single online channel, select one warehouse to provide stock and pricing.';
  }

  const handleSelect = (warehouseId: string) => {
    if (allowMultiple) {
      // Multi-select
      if (value.includes(warehouseId)) {
        onChange(value.filter(id => id !== warehouseId));
      } else {
        // Enforce maxWarehouses cap
        if (value.length >= maxWarehouses) return;
        onChange([...value, warehouseId]);
      }
    } else {
      // Single-select
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
    const routingCount = demo.getSalesRoutings().length;
    
    if (allowMultiple) {
      // Multi-warehouse: Van Gogh (2 online channels) or Hans Zimmer (Box Office)
      // Select both demo warehouses + price ref
      const demoWarehouseIds = warehouses
        .filter(w => w.id === DEMO_WAREHOUSE_1_ID || w.id === DEMO_WAREHOUSE_2_ID)
        .map(w => w.id)
        .slice(0, maxWarehouses === Infinity ? undefined : maxWarehouses);
      onChange(demoWarehouseIds);
      if (onPriceReferenceChange && demoWarehouseIds.includes(DEMO_WAREHOUSE_1_ID)) {
        onPriceReferenceChange(DEMO_WAREHOUSE_1_ID);
      }
    } else {
      // Single warehouse (Taylor Swift: 1 online channel)
      if (routingCount === 0) {
        const squareWarehouse = warehouses.find(w => w.id === DEMO_WAREHOUSE_1_ID);
        onChange([squareWarehouse?.id || warehouses[0]?.id].filter(Boolean) as string[]);
      } else {
        const shopifyWarehouse = warehouses.find(w => w.id === DEMO_WAREHOUSE_2_ID);
        onChange([shopifyWarehouse?.id || warehouses[0]?.id].filter(Boolean) as string[]);
      }
    }
  };

  const title = allowMultiple ? 'Select warehouse(s)' : 'Select warehouse';
  const subtitle = allowMultiple
    ? (hasBoxOffice
      ? 'Choose which warehouses to include in this sales routing.'
      : `Choose up to ${maxWarehouses} warehouse${maxWarehouses > 1 ? 's' : ''} (one per online channel).`)
    : 'Choose the warehouse to use for this sales routing.';
  const showSelectAll = allowMultiple && hasBoxOffice;

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

      {explanationText && (
        <div className={styles.explanationBox}>
          <FontAwesomeIcon icon={faInfoCircle} className={styles.explanationIcon} />
          <span>{explanationText}</span>
        </div>
      )}

      {showPriceReference && (
        <div className={styles.priceReferenceHint}>
          <FontAwesomeIcon icon={faStarSolid} className={styles.hintIcon} />
          <span>
            Click the star on a selected warehouse to set it as the <strong>price reference</strong>. 
            When a product exists in multiple warehouses with different prices, the price reference warehouse's price will be used.
          </span>
        </div>
      )}

      {allowMultiple && (
        <div className={styles.selectAllWrapper}>
          {showSelectAll && (
            <button 
              className={styles.selectAllBtn}
              onClick={handleSelectAll}
            >
              <div className={`${styles.checkbox} ${value.length === warehouses.length ? styles.checked : ''}`}>
                {value.length === warehouses.length && <FontAwesomeIcon icon={faCheck} />}
              </div>
              <span>Select all warehouses</span>
            </button>
          )}
          <span className={styles.selectedCount}>
            {value.length}{maxWarehouses !== Infinity ? ` of ${maxWarehouses} max` : ` of ${warehouses.length}`} selected
          </span>
        </div>
      )}

      <div className={styles.warehouseList}>
        {warehouses.map((warehouse) => {
          const isSelected = value.includes(warehouse.id);
          const isPriceReference = priceReferenceId === warehouse.id;
          const isDisabled = !isSelected && isAtCap;
          
          return (
            <button
              key={warehouse.id}
              className={`${styles.warehouseItem} ${isSelected ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
              onClick={() => handleSelect(warehouse.id)}
              disabled={isDisabled}
            >
              <div className={`${allowMultiple ? styles.checkbox : styles.radio} ${isSelected ? styles.checked : ''}`}>
                {isSelected && (
                  allowMultiple 
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

      <div className={styles.configNote}>
        <p>Warehouses are configured in the <strong>Catalog integration</strong> tab.</p>
      </div>
    </div>
  );
}
