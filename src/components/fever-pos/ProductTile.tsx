import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicket, faCartPlus, faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import type { Product } from '../../data/feverPosData';
import { formatPrice } from '../../data/feverPosData';
import styles from './ProductTile.module.css';

interface ProductTileProps {
  product: Product;
  onClick: (product: Product) => void;
}

/**
 * Stripe color defaults per tile type, matching Fever Zone production:
 *   session (ticket): #0089E3
 *   addon:            #FF8C00
 *   retail/food:       #24A865
 */
const TYPE_STRIPE_DEFAULTS: Record<Product['type'], string> = {
  ticket: '#0089E3',
  addon: '#FF8C00',
  food: '#24A865',
  retail: '#24A865',
};

function getTypeIcon(type: Product['type']) {
  switch (type) {
    case 'ticket':
      return faTicket;
    case 'addon':
    case 'food':
    case 'retail':
      return faCartPlus;
  }
}

export function ProductTile({ product, onClick }: ProductTileProps) {
  const isCategoryTile = product.id.startsWith('cat-');
  const stripeColor = isCategoryTile ? '#AE92ED' : TYPE_STRIPE_DEFAULTS[product.type];
  const hasImage = product.type === 'addon' && product.imageUrl;

  return (
    <button
      className={`${styles.tile} ${isCategoryTile ? styles.categoryTile : ''}`}
      onClick={() => onClick(product)}
      type="button"
    >
      {/* Color stripe — flex child, not absolute */}
      <div
        className={styles.categoryStripe}
        style={{ backgroundColor: stripeColor }}
      />

      {/* Main content */}
      <div className={styles.tileMain}>
        {/* Top: optional image + name */}
        <div className={hasImage ? styles.tileTopWithImage : styles.tileTop}>
          {hasImage && (
            <img
              src={product.imageUrl}
              alt=""
              className={styles.tileImage}
            />
          )}
          <p className={styles.tileName}>{product.name}</p>
        </div>

        {/* Bottom: price + type icon */}
        <div className={styles.tileBottom}>
          <div className={styles.bottomLead}>
            {!isCategoryTile && <span className={styles.tilePrice}>{formatPrice(product.price)}</span>}
          </div>
          <div className={styles.bottomTrail}>
            <FontAwesomeIcon
              icon={isCategoryTile ? faFolderOpen : getTypeIcon(product.type)}
              className={styles.categoryIcon}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
