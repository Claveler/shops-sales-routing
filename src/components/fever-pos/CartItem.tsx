import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPlus, faCrown } from '@fortawesome/free-solid-svg-icons';
import type { CartItemData } from '../../data/feverPosData';
import { formatPrice } from '../../data/feverPosData';
import styles from './CartItem.module.css';

interface CartItemProps {
  item: CartItemData;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onIncrement, onDecrement, onRemove }: CartItemProps) {
  return (
    <div className={styles.cartItem}>
      <div className={styles.itemInfo}>
        <p className={styles.itemName}>{item.name}</p>
        <div className={styles.priceRow}>
          {item.originalPrice && (
            <span className={styles.originalPrice}>{formatPrice(item.originalPrice)}</span>
          )}
          <span className={styles.price}>{formatPrice(item.price)}</span>
          {item.isPremium && (
            <FontAwesomeIcon icon={faCrown} className={styles.premiumIcon} />
          )}
        </div>
        {item.bookingFee !== undefined && item.bookingFee > 0 && (
          <p className={styles.bookingFee}>+ {formatPrice(item.bookingFee)} booking fee</p>
        )}
      </div>
      <div className={styles.quantityControls}>
        <button
          className={styles.removeBtn}
          onClick={() => item.quantity <= 1 ? onRemove(item.id) : onDecrement(item.id)}
          type="button"
          aria-label={item.quantity <= 1 ? 'Remove item' : 'Decrease quantity'}
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
        <span className={styles.quantity}>{item.quantity}</span>
        <button
          className={styles.addBtn}
          onClick={() => onIncrement(item.id)}
          type="button"
          aria-label="Increase quantity"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>
    </div>
  );
}
