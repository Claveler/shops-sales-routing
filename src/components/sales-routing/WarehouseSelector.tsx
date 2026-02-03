import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faBox, faSquare } from '@fortawesome/free-solid-svg-icons';
import { faShopify } from '@fortawesome/free-brands-svg-icons';
import { Badge } from '../common/Badge';
import { warehouses } from '../../data/mockData';
import styles from './WarehouseSelector.module.css';

interface WarehouseSelectorProps {
  value: string[];
  onChange: (warehouseIds: string[]) => void;
}

const integrationIcons: Record<string, typeof faSquare> = {
  Square: faSquare,
  Shopify: faShopify,
  Manual: faBox
};

export function WarehouseSelector({ value, onChange }: WarehouseSelectorProps) {
  const handleToggle = (warehouseId: string) => {
    if (value.includes(warehouseId)) {
      onChange(value.filter(id => id !== warehouseId));
    } else {
      onChange([...value, warehouseId]);
    }
  };

  const handleSelectAll = () => {
    if (value.length === warehouses.length) {
      onChange([]);
    } else {
      onChange(warehouses.map(w => w.id));
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select warehouse(s)</h2>
      <p className={styles.subtitle}>Choose which catalogs to make available for sale</p>

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

      <div className={styles.warehouseList}>
        {warehouses.map((warehouse) => (
          <button
            key={warehouse.id}
            className={`${styles.warehouseItem} ${value.includes(warehouse.id) ? styles.selected : ''}`}
            onClick={() => handleToggle(warehouse.id)}
          >
            <div className={`${styles.checkbox} ${value.includes(warehouse.id) ? styles.checked : ''}`}>
              {value.includes(warehouse.id) && <FontAwesomeIcon icon={faCheck} />}
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
