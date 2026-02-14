import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleDown,
  faAngleUp,
  faTrashCan,
  faLocationDot,
  faCalendar,
  faWallet,
  faCreditCard,
  faBox,
  faReceipt,
} from '@fortawesome/free-solid-svg-icons';
import { CartItem } from './CartItem';
import type { CartEventGroup, CartItemData } from '../../data/feverPosData';
import { formatPrice } from '../../data/feverPosData';
import styles from './Cart.module.css';

interface CartProps {
  eventGroups: CartEventGroup[];
  productItems: CartItemData[];
  onToggleEventExpand: (eventId: string) => void;
  onRemoveEvent: (eventId: string) => void;
  onIncrementItem: (itemId: string) => void;
  onDecrementItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onClearAll: () => void;
}

export function Cart({
  eventGroups,
  productItems,
  onToggleEventExpand,
  onRemoveEvent,
  onIncrementItem,
  onDecrementItem,
  onRemoveItem,
  onClearAll,
}: CartProps) {
  // Calculate totals
  const eventItemCount = eventGroups.reduce(
    (sum, group) => sum + group.items.reduce((s, item) => s + item.quantity, 0),
    0
  );
  const productItemCount = productItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalItems = eventItemCount + productItemCount;

  const eventTotal = eventGroups.reduce(
    (sum, group) =>
      sum +
      group.items.reduce((s, item) => s + item.price * item.quantity + (item.bookingFee ?? 0) * item.quantity, 0),
    0
  );
  const productTotal = productItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = eventTotal + productTotal;

  const hasItems = totalItems > 0;

  return (
    <aside className={styles.cart}>
      {/* Header */}
      <div className={styles.cartHeader}>
        <h2 className={styles.cartTitle}>Cart</h2>
        {hasItems && (
          <button className={styles.clearAll} onClick={onClearAll} type="button">
            Clear all
          </button>
        )}
      </div>

      {/* Scrollable content */}
      <div className={styles.cartBody}>
        {!hasItems && (
          <div className={styles.emptyCart}>
            <div className={styles.emptyIconWrap}>
              <FontAwesomeIcon icon={faReceipt} className={styles.emptyIcon} />
            </div>
            <p className={styles.emptyText}>The cart is empty</p>
          </div>
        )}

        {/* Event groups */}
        {eventGroups.map((group) => (
          <div key={group.id} className={styles.eventGroup}>
            <div className={styles.eventHeader}>
                {group.eventImageUrl ? (
                  <img
                    src={group.eventImageUrl}
                    alt={group.eventName}
                    className={styles.eventImage}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.eventImageFallback} aria-hidden="true" />
                )}
              <div className={styles.eventMeta}>
                <span className={styles.eventName}>{group.eventName}</span>
                <div className={styles.eventLocation}>
                  <FontAwesomeIcon icon={faLocationDot} className={styles.metaIcon} />
                  <span>{group.location}</span>
                </div>
              </div>
              <button
                className={styles.eventRemoveBtn}
                onClick={() => onRemoveEvent(group.id)}
                type="button"
                aria-label="Remove event"
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
              <button
                className={styles.eventToggle}
                onClick={() => onToggleEventExpand(group.id)}
                type="button"
                aria-label={group.isExpanded ? 'Collapse' : 'Expand'}
              >
                <FontAwesomeIcon icon={group.isExpanded ? faAngleUp : faAngleDown} />
              </button>
            </div>

            {group.isExpanded && (
              <div className={styles.eventBody}>
                <div className={styles.eventDateRow}>
                  <FontAwesomeIcon icon={faCalendar} className={styles.metaIcon} />
                  <span>{group.date}</span>
                  <span className={styles.eventLocationSmall}>
                    <FontAwesomeIcon icon={faLocationDot} className={styles.metaIcon} />
                    {group.location}
                  </span>
                </div>
                <div className={styles.eventItems}>
                  {group.items.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onIncrement={onIncrementItem}
                      onDecrement={onDecrementItem}
                      onRemove={onRemoveItem}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Product items */}
        {productItems.length > 0 && (
          <div className={styles.productSection}>
            <div className={styles.sectionHeader}>
              <FontAwesomeIcon icon={faBox} className={styles.sectionIcon} />
              <span>Products</span>
            </div>
            <div className={styles.productItems}>
              {productItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onIncrement={onIncrementItem}
                  onDecrement={onDecrementItem}
                  onRemove={onRemoveItem}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.cartFooter}>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Total ({totalItems} items)</span>
          <span className={styles.totalAmount}>{formatPrice(grandTotal)}</span>
        </div>
        <button className={styles.discountLink} type="button">
          Select discount type
        </button>
        <div className={styles.paymentButtons}>
          <button className={styles.cashBtn} type="button">
            <FontAwesomeIcon icon={faWallet} />
            <span>Cash</span>
          </button>
          <button className={styles.cardBtn} type="button">
            <FontAwesomeIcon icon={faCreditCard} />
            <span>Card</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
