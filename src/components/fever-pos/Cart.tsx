import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleDown,
  faAngleUp,
  faTrashCan,
  faLocationDot,
  faTicket,
  faGift,
  faWallet,
  faCreditCard,
  faReceipt,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { CartItem } from './CartItem';
import { MarqueeText } from './MarqueeText';
import type { CartEventGroup, EventTimeslot } from '../../data/feverPosData';
import { formatPrice } from '../../data/feverPosData';
import styles from './Cart.module.css';

interface CartProps {
  eventGroups: CartEventGroup[];
  onToggleEventExpand: (eventId: string) => void;
  onRemoveEvent: (eventId: string) => void;
  onIncrementItem: (itemId: string) => void;
  onDecrementItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onClearAll: () => void;
  isMemberActive?: boolean;
  /** Currently active timeslot per event — used to show mismatch warnings */
  activeTimeslots?: Record<string, EventTimeslot>;
}

export function Cart({
  eventGroups,
  onToggleEventExpand,
  onRemoveEvent,
  onIncrementItem,
  onDecrementItem,
  onRemoveItem,
  onClearAll,
  isMemberActive,
  activeTimeslots,
}: CartProps) {
  // Calculate totals across all groups (tickets + retail)
  const totalItems = eventGroups.reduce(
    (sum, group) =>
      sum +
      group.items.reduce((s, item) => s + item.quantity, 0) +
      group.retailItems.reduce((s, item) => s + item.quantity, 0),
    0
  );

  const grandTotal = eventGroups.reduce(
    (sum, group) =>
      sum +
      group.items.reduce(
        (s, item) => s + item.price * item.quantity + (item.bookingFee ?? 0) * item.quantity,
        0
      ) +
      group.retailItems.reduce((s, item) => s + item.price * item.quantity, 0),
    0
  );

  const hasItems = totalItems > 0;
  const isSingleEvent = eventGroups.length === 1;

  return (
    <aside className={styles.cart}>
      {/* Header — only shown when cart has items */}
      {hasItems && (
        <div className={styles.cartHeader}>
          <h2 className={styles.cartTitle}>Cart</h2>
          <button className={styles.clearAll} onClick={onClearAll} type="button">
            Clear all
          </button>
        </div>
      )}

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

        {/* Single event: flat layout, no event header */}
        {hasItems && isSingleEvent && (
          <SingleEventLayout
            group={eventGroups[0]}
            onIncrementItem={onIncrementItem}
            onDecrementItem={onDecrementItem}
            onRemoveItem={onRemoveItem}
            isMemberActive={isMemberActive}
            activeTimeslots={activeTimeslots}
          />
        )}

        {/* Multiple events: grouped with event headers */}
        {hasItems && !isSingleEvent &&
          eventGroups.map((group) => (
            <EventGroupCard
              key={group.id}
              group={group}
              onToggleExpand={onToggleEventExpand}
              onRemoveEvent={onRemoveEvent}
              onIncrementItem={onIncrementItem}
              onDecrementItem={onDecrementItem}
              onRemoveItem={onRemoveItem}
              isMemberActive={isMemberActive}
              activeTimeslots={activeTimeslots}
            />
          ))
        }
      </div>

      {/* Footer — hidden when cart is empty */}
      {hasItems && (
        <div className={styles.cartFooter}>
          <div className={styles.totalsSection}>
            <div className={styles.footerDivider} />
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total ({totalItems} items)</span>
              <div className={styles.totalRight}>
                <span className={styles.totalAmount}>{formatPrice(grandTotal)}</span>
                <button className={styles.discountLink} type="button">
                  Select discount type
                </button>
              </div>
            </div>
            <div className={styles.footerDivider} />
          </div>
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
      )}
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Single-event flat layout                                           */
/* ------------------------------------------------------------------ */

function SingleEventLayout({
  group,
  onIncrementItem,
  onDecrementItem,
  onRemoveItem,
  isMemberActive,
  activeTimeslots,
}: {
  group: CartEventGroup;
  onIncrementItem: (id: string) => void;
  onDecrementItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  isMemberActive?: boolean;
  activeTimeslots?: Record<string, EventTimeslot>;
}) {
  // Derive eventId / timeslotId from the composite id if the explicit fields are missing
  const derivedEventId = group.eventId ?? group.id.split('--')[0];
  const derivedTimeslotId = group.timeslotId ?? (group.id.includes('--') ? group.id.split('--')[1] : undefined);

  // Determine if the active timeslot differs from this group's timeslot
  const activeTs = activeTimeslots?.[derivedEventId];
  const isMismatch = !!(derivedTimeslotId && activeTs && activeTs.id !== derivedTimeslotId);

  const flatTimeSlotClasses = [
    styles.flatTimeSlot,
    isMismatch ? styles.flatTimeSlotMismatch : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.flatItems}>
      {/* Ticket / add-on items with time-slot header */}
      {group.items.length > 0 && (
        <div className={flatTimeSlotClasses}>
          <TimeSlotHeader date={group.date} location={group.location} isMismatch={isMismatch} />
          <div className={styles.timeSlotItems}>
            {group.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrement={onIncrementItem}
                onDecrement={onDecrementItem}
                onRemove={onRemoveItem}
                isMemberActive={isMemberActive}
              />
            ))}
          </div>
        </div>
      )}

      {/* Retail products */}
      {group.retailItems.length > 0 && (
        <div className={styles.flatProductsSection}>
          <ProductsSubHeader />
          <div className={styles.timeSlotItems}>
            {group.retailItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrement={onIncrementItem}
                onDecrement={onDecrementItem}
                onRemove={onRemoveItem}
                isMemberActive={isMemberActive}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Multi-event group card                                             */
/* ------------------------------------------------------------------ */

function EventGroupCard({
  group,
  onToggleExpand,
  onRemoveEvent,
  onIncrementItem,
  onDecrementItem,
  onRemoveItem,
  isMemberActive,
  activeTimeslots,
}: {
  group: CartEventGroup;
  onToggleExpand: (eventId: string) => void;
  onRemoveEvent: (eventId: string) => void;
  onIncrementItem: (id: string) => void;
  onDecrementItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  isMemberActive?: boolean;
  activeTimeslots?: Record<string, EventTimeslot>;
}) {
  // Derive eventId / timeslotId from the composite id if the explicit fields are missing
  // (handles groups created before the multi-timeslot refactor or surviving HMR)
  const derivedEventId = group.eventId ?? group.id.split('--')[0];
  const derivedTimeslotId = group.timeslotId ?? (group.id.includes('--') ? group.id.split('--')[1] : undefined);

  // Determine if the active timeslot differs from this group's timeslot
  const activeTs = activeTimeslots?.[derivedEventId];
  const isMismatch = !!(derivedTimeslotId && activeTs && activeTs.id !== derivedTimeslotId);

  const headerClasses = [
    styles.eventHeader,
    group.isExpanded ? styles.eventHeaderExpanded : '',
  ]
    .filter(Boolean)
    .join(' ');

  const timeSlotSectionClasses = [
    styles.timeSlotSection,
    isMismatch ? styles.timeSlotSectionMismatch : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.eventGroup}>
      {/* Collapsible header */}
      <div className={headerClasses}>
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
          <MarqueeText
            text={group.eventName}
            className={styles.eventName}
            autoPlay={false}
          />
          <div className={styles.eventLocation}>
            <FontAwesomeIcon icon={faLocationDot} className={styles.metaIcon} />
            <span>{group.location}</span>
          </div>
        </div>
        <button
          className={`${styles.eventIconBtn} ${styles.eventDeleteBtn}`}
          onClick={() => onRemoveEvent(group.id)}
          type="button"
          aria-label="Remove event"
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
        <button
          className={styles.eventIconBtn}
          onClick={() => onToggleExpand(group.id)}
          type="button"
          aria-label={group.isExpanded ? 'Collapse' : 'Expand'}
        >
          <FontAwesomeIcon icon={group.isExpanded ? faAngleUp : faAngleDown} />
        </button>
      </div>

      {/* Expanded body */}
      {group.isExpanded && (
        <div className={styles.eventBody}>
          {/* Time-slot section (tickets + add-ons) */}
          {group.items.length > 0 && (
            <div className={timeSlotSectionClasses}>
              <TimeSlotHeader date={group.date} location={group.location} isMismatch={isMismatch} />
              <div className={styles.timeSlotItems}>
                {group.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onIncrement={onIncrementItem}
                    onDecrement={onDecrementItem}
                    onRemove={onRemoveItem}
                    isMemberActive={isMemberActive}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Products sub-section */}
          {group.retailItems.length > 0 && (
            <div className={styles.productsSubSection}>
              <ProductsSubHeader />
              <div className={styles.timeSlotItems}>
                {group.retailItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onIncrement={onIncrementItem}
                    onDecrement={onDecrementItem}
                    onRemove={onRemoveItem}
                    isMemberActive={isMemberActive}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared sub-components                                              */
/* ------------------------------------------------------------------ */

function TimeSlotHeader({
  date,
  location,
  isMismatch,
}: {
  date: string;
  location: string;
  /** When true, the active timeslot differs from this group's timeslot */
  isMismatch?: boolean;
}) {
  return (
    <div className={styles.timeSlotHeader}>
      <div className={styles.timeSlotLeft}>
        <FontAwesomeIcon icon={faTicket} className={styles.timeSlotIcon} />
        <span className={styles.timeSlotText}>{date}</span>
        {isMismatch && (
          <span className={styles.timeslotMismatch} title="Active timeslot is different">
            <FontAwesomeIcon icon={faCircleExclamation} className={styles.timeslotMismatchIcon} />
            <span className={styles.timeslotMismatchText}>Different timeslot</span>
          </span>
        )}
      </div>
      <div className={styles.timeSlotLocation}>
        <FontAwesomeIcon icon={faLocationDot} className={styles.timeSlotLocationIcon} />
        <span className={styles.timeSlotLocationText}>{location}</span>
      </div>
    </div>
  );
}

function ProductsSubHeader() {
  return (
    <div className={styles.productsSubHeader}>
      <FontAwesomeIcon icon={faGift} className={styles.productsSubIcon} />
      <span className={styles.productsSubLabel}>Products</span>
    </div>
  );
}
