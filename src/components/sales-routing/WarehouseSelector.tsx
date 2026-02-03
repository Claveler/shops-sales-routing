import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faBox, faSquare } from '@fortawesome/free-solid-svg-icons';
import { faShopify } from '@fortawesome/free-brands-svg-icons';
import { Badge } from '../common/Badge';
import { warehouses } from '../../data/mockData';
import type { RoutingType } from '../../data/mockData';
import styles from './WarehouseSelector.module.css';

interface WarehouseSelectorProps {
  value: string[];
  onChange: (warehouseIds: string[]) => void;
  routingType: RoutingType;
}

const integrationIcons: Record<string, typeof faSquare> = {
  Square: faSquare,
  Shopify: faShopify,
  Manual: faBox
};

export function WarehouseSelector({ value, onChange, routingType }: WarehouseSelectorProps) {
  const isMultiSelect = routingType === 'onsite';

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

  const title = isMultiSelect ? 'Select warehouse(s)' : 'Select warehouse';
  const subtitle = isMultiSelect
    ? 'Choose which warehouses to pull stock from. The specific warehouse used will be configured per plan in the Box Office.'
    : 'Choose the warehouse to pull stock from for this routing.';

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle}>{subtitle}</p>

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
        {warehouses.map((warehouse) => (
          <button
            key={warehouse.id}
            className={`${styles.warehouseItem} ${value.includes(warehouse.id) ? styles.selected : ''}`}
            onClick={() => handleSelect(warehouse.id)}
          >
            <div className={`${isMultiSelect ? styles.checkbox : styles.radio} ${value.includes(warehouse.id) ? styles.checked : ''}`}>
              {value.includes(warehouse.id) && (
                isMultiSelect 
                  ? <FontAwesomeIcon icon={faCheck} />
                  : <div className={styles.radioInner} />
              )}
            </div>
            
            <div className={styles.warehouseContent}>
              <div className={styles.warehouseHeader}>
                <h3 className={styles.warehouseName}>{warehouse.name}</h3>
                <Badge variant="secondary" size="sm">
                  <FontAwesomeIcon 
                    icon={integrationIcons[warehouse.integration] || faBox} 
                    className={styles.integrationIcon}
                  />
                  {warehouse.integration}
                </Badge>
              </div>
              <div className={styles.warehouseMeta}>
                <span className={styles.productCount}>
                  <FontAwesomeIcon icon={faBox} />
                  {warehouse.productCount} products
                </span>
                <span className={styles.catalogId}>
                  ID: {warehouse.masterCatalogId.substring(0, 20)}...
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {value.length > 0 && (
        <div className={styles.summary}>
          <strong>Total products:</strong>{' '}
          {warehouses
            .filter(w => value.includes(w.id))
            .reduce((sum, w) => sum + w.productCount, 0)
          } from {value.length} warehouse{value.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
