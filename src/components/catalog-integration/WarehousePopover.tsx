import type { ProductWarehouseDetails } from '../../data/mockData';
import styles from './WarehousePopover.module.css';

interface WarehousePopoverProps {
  warehouses: ProductWarehouseDetails[];
  onClose: () => void;
}

export function WarehousePopover({ warehouses }: WarehousePopoverProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <div className={styles.popover}>
      <div className={styles.header}>
        <span className={styles.title}>Available in {warehouses.length} warehouse{warehouses.length > 1 ? 's' : ''}</span>
      </div>
      <div className={styles.list}>
        {warehouses.map((wh) => (
          <div key={wh.warehouse.id} className={styles.item}>
            <div className={styles.warehouseName}>{wh.warehouse.name}</div>
            <div className={styles.details}>
              <span className={styles.price}>{formatPrice(wh.price, wh.currency)}</span>
              <span className={styles.stock}>{wh.stock} in stock</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
