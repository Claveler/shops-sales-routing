import { useEffect, useRef } from 'react';
import type { Product, ProductVariant } from '../../data/feverPosData';
import { formatPrice } from '../../data/feverPosData';
import styles from './VariantPicker.module.css';

interface VariantPickerProps {
  product: Product;
  /** Called when the cashier taps a variant pill */
  onSelectVariant: (product: Product, variant: ProductVariant) => void;
  /** Called when the picker is dismissed without selection */
  onClose: () => void;
  /** Optional: per-variant stock info. Key = variantId, value = stock count. 0 = out of stock. */
  variantStock?: Record<string, number>;
  /** Optional: per-variant price overrides (e.g. from warehouse). Key = variantId. */
  variantPrices?: Record<string, number>;
}

export function VariantPicker({
  product,
  onSelectVariant,
  onClose,
  variantStock,
  variantPrices,
}: VariantPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid the same click that opened the picker from closing it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!product.variants || product.variants.length === 0) return null;

  const axisName = product.variantAxes?.[0]?.name ?? 'Variant';

  return (
    <div className={styles.backdrop}>
      <div className={styles.picker} ref={panelRef}>
        <div className={styles.header}>
          <span className={styles.productName}>{product.name}</span>
          <span className={styles.axisLabel}>Select {axisName}</span>
        </div>
        <div className={styles.pills}>
          {product.variants.map((variant) => {
            const stock = variantStock?.[variant.id];
            const isOutOfStock = stock !== undefined && stock <= 0;
            const price = variantPrices?.[variant.id] ?? product.price;

            return (
              <button
                key={variant.id}
                className={`${styles.pill} ${isOutOfStock ? styles.pillDisabled : ''}`}
                disabled={isOutOfStock}
                onClick={() => onSelectVariant(product, variant)}
                type="button"
              >
                <span className={styles.pillLabel}>{variant.label}</span>
                {variantPrices && variantPrices[variant.id] !== undefined && (
                  <span className={styles.pillPrice}>{formatPrice(price)}</span>
                )}
                {isOutOfStock && (
                  <span className={styles.pillOos}>Out of stock</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
