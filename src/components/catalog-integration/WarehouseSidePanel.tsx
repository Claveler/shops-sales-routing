import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faWarehouse } from '@fortawesome/free-solid-svg-icons';
import type { ProductWarehouseDetails, ProductVariant, ProductWarehouse } from '../../data/mockData';
import styles from './WarehouseSidePanel.module.css';

interface WarehouseSidePanelProps {
  isOpen: boolean;
  productName: string;
  warehouses: ProductWarehouseDetails[];
  /** Optional: pass variants + raw warehouse entries for variant-level breakdown */
  variants?: ProductVariant[];
  rawProductWarehouses?: ProductWarehouse[];
  onClose: () => void;
}

export function WarehouseSidePanel({
  isOpen,
  productName,
  warehouses,
  variants,
  rawProductWarehouses,
  onClose,
}: WarehouseSidePanelProps) {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const hasVariants = !!(variants && variants.length > 0 && rawProductWarehouses);

  return (
    <>
      {/* Backdrop / Scrim */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.open : ''}`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        {/* Safe area for clicking outside */}
        <div className={styles.safeArea} onClick={onClose} />

        {/* Card */}
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <span className={styles.title}>{productName}</span>
              <button className={styles.closeBtn} onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className={styles.divider} />
          </div>

          {/* Body */}
          <div className={styles.body}>
            <p className={styles.description}>
              This product is available in{' '}
              <strong>{warehouses.length} warehouse{warehouses.length !== 1 ? 's' : ''}:</strong>
            </p>

            <div className={styles.list}>
              {warehouses.map((wh) => {
                // For variant products, show per-variant breakdown within each warehouse
                const variantRows = hasVariants
                  ? variants!.map((v) => {
                      const pw = rawProductWarehouses!.find(
                        (e) => e.variantId === v.id && e.warehouseId === wh.warehouse.id
                      );
                      return pw ? { variant: v, stock: pw.stock, price: pw.price } : null;
                    }).filter(Boolean) as Array<{ variant: ProductVariant; stock: number; price: number }>
                  : [];

                return (
                  <div key={wh.warehouse.id} className={styles.listItem}>
                    <div className={styles.listItemRow}>
                      <div className={styles.leadingIcon}>
                        <FontAwesomeIcon icon={faWarehouse} />
                      </div>
                      <div className={styles.textWrapper}>
                        <span className={styles.warehouseName}>{wh.warehouse.name}</span>
                        <span className={styles.stockText}>{wh.stock} in stock</span>
                      </div>
                      <span className={styles.price}>{formatPrice(wh.price, wh.currency)}</span>
                    </div>
                    {/* Variant breakdown within this warehouse */}
                    {variantRows.length > 0 && (
                      <div className={styles.variantBreakdown}>
                        {variantRows.map((vr) => (
                          <div key={vr.variant.id} className={styles.variantRow}>
                            <span className={styles.variantPill}>{vr.variant.label}</span>
                            <span className={styles.variantDetail}>
                              {vr.stock} in stock · {formatPrice(vr.price, wh.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={styles.itemDivider} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button className={styles.closeAction} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
