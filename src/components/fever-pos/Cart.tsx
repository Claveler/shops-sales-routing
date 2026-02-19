import { useState, useCallback } from 'react';
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
  onSetItemQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearAll: () => void;
  isMemberActive?: boolean;
  /** Currently active timeslot per event — used to show mismatch warnings */
  activeTimeslots?: Record<string, EventTimeslot>;
  /** The event currently selected in the tickets tab — used to determine if grouped view should be shown */
  selectedTicketEventId?: string;
  /** Whether the POS is in iMin device preview mode — enables on-screen keyboard */
  isDevicePreview?: boolean;
  /** Switch the active timeslot for an event (used by "Activate time slot" in cart) */
  onSwitchTimeslot?: (eventId: string, timeslotId: string) => void;
}

export function Cart({
  eventGroups,
  onToggleEventExpand,
  onRemoveEvent,
  onIncrementItem,
  onDecrementItem,
  onSetItemQuantity,
  onRemoveItem,
  onClearAll,
  isMemberActive,
  activeTimeslots,
  selectedTicketEventId: _selectedTicketEventId,
  isDevicePreview,
  onSwitchTimeslot,
}: CartProps) {
  // Confirmation modal for group deletion
  const [pendingDeleteGroupId, setPendingDeleteGroupId] = useState<string | null>(null);
  const pendingDeleteGroup = pendingDeleteGroupId
    ? eventGroups.find((g) => g.id === pendingDeleteGroupId) ?? null
    : null;

  // Track whether any cart item has its keyboard open (for adding bottom padding)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const handleKeyboardOpen = useCallback(() => {
    setIsKeyboardOpen(true);
  }, []);

  const handleKeyboardClose = useCallback(() => {
    setIsKeyboardOpen(false);
  }, []);

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
  
  // Multi-timeslot for the same event uses flat layout (no event headers).
  // Grouped layout only when the cart contains items from different events.
  const allSameEvent = eventGroups.length > 0 &&
    new Set(eventGroups.map(g => g.eventId)).size === 1;
  const useGroupedView = !allSameEvent && eventGroups.length > 1;

  // Determine whether venue should be shown on timeslot headers (only when multiple venues)
  const hasMultipleVenues = new Set(eventGroups.map(g => g.location)).size > 1;

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
      <div className={`${styles.cartBody} ${isKeyboardOpen ? styles.cartBodyKeyboardOpen : ''}`}>
        {!hasItems && (
          <div className={styles.emptyCart}>
            <div className={styles.emptyIconWrap}>
              <FontAwesomeIcon icon={faReceipt} className={styles.emptyIcon} />
            </div>
            <p className={styles.emptyText}>The cart is empty</p>
          </div>
        )}

        {/* Single event (possibly multi-timeslot): flat layout, no event header */}
        {hasItems && !useGroupedView && (
          <FlatLayout
            groups={eventGroups}
            onIncrementItem={onIncrementItem}
            onDecrementItem={onDecrementItem}
            onSetItemQuantity={onSetItemQuantity}
            onRemoveItem={onRemoveItem}
            isMemberActive={isMemberActive}
            activeTimeslots={activeTimeslots}
            isDevicePreview={isDevicePreview}
            onKeyboardOpen={handleKeyboardOpen}
            onKeyboardClose={handleKeyboardClose}
            onSwitchTimeslot={onSwitchTimeslot}
            showVenue={hasMultipleVenues}
          />
        )}

        {/* Multiple events (or different event from selector): grouped with event headers */}
        {hasItems && useGroupedView &&
          eventGroups.map((group) => (
            <EventGroupCard
              key={group.id}
              group={group}
              onToggleExpand={onToggleEventExpand}
              onRemoveEvent={setPendingDeleteGroupId}
              onIncrementItem={onIncrementItem}
              onDecrementItem={onDecrementItem}
              onSetItemQuantity={onSetItemQuantity}
              onRemoveItem={onRemoveItem}
              isMemberActive={isMemberActive}
              activeTimeslots={activeTimeslots}
              isDevicePreview={isDevicePreview}
              onKeyboardOpen={handleKeyboardOpen}
              onKeyboardClose={handleKeyboardClose}
              onSwitchTimeslot={onSwitchTimeslot}
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

      {/* Confirmation modal for group deletion */}
      {pendingDeleteGroup && (
        <div className={styles.confirmOverlay} role="presentation" onClick={() => setPendingDeleteGroupId(null)}>
          <div
            className={styles.confirmModal}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm removal"
            onClick={(e) => e.stopPropagation()}
          >
            <p className={styles.confirmTitle}>Remove from cart?</p>
            <p className={styles.confirmText}>
              All items for <strong>{pendingDeleteGroup.eventName}</strong> ({pendingDeleteGroup.date}) will be removed.
            </p>
            <div className={styles.confirmActions}>
              <button
                className={styles.confirmCancelBtn}
                onClick={() => setPendingDeleteGroupId(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className={styles.confirmRemoveBtn}
                onClick={() => {
                  onRemoveEvent(pendingDeleteGroup.id);
                  setPendingDeleteGroupId(null);
                }}
                type="button"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Flat layout (single event, possibly multi-timeslot)                */
/* ------------------------------------------------------------------ */

function FlatLayout({
  groups,
  onIncrementItem,
  onDecrementItem,
  onSetItemQuantity,
  onRemoveItem,
  isMemberActive,
  activeTimeslots,
  isDevicePreview,
  onKeyboardOpen,
  onKeyboardClose,
  onSwitchTimeslot,
  showVenue,
}: {
  groups: CartEventGroup[];
  onIncrementItem: (id: string) => void;
  onDecrementItem: (id: string) => void;
  onSetItemQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  isMemberActive?: boolean;
  activeTimeslots?: Record<string, EventTimeslot>;
  isDevicePreview?: boolean;
  onKeyboardOpen?: () => void;
  onKeyboardClose?: () => void;
  onSwitchTimeslot?: (eventId: string, timeslotId: string) => void;
  showVenue: boolean;
}) {
  // Collect all retail items across groups (shown once at the bottom)
  const allRetailItems = groups.flatMap(g => g.retailItems);

  return (
    <div className={styles.flatItems}>
      {groups.map((group) => {
        const derivedEventId = group.eventId ?? group.id.split('--')[0];
        const derivedTimeslotId = group.timeslotId ?? (group.id.includes('--') ? group.id.split('--')[1] : undefined);
        const activeTs = activeTimeslots?.[derivedEventId];
        const isMismatch = !!(derivedTimeslotId && activeTs && activeTs.id !== derivedTimeslotId);

        if (group.items.length === 0) return null;

        const flatTimeSlotClasses = [
          styles.flatTimeSlot,
          isMismatch ? styles.flatTimeSlotMismatch : '',
        ].filter(Boolean).join(' ');

        const handleActivate = isMismatch && derivedTimeslotId
          ? () => onSwitchTimeslot?.(derivedEventId, derivedTimeslotId)
          : undefined;

        return (
          <div
            key={group.id}
            className={flatTimeSlotClasses}
            onClick={isMismatch ? handleActivate : undefined}
            role={isMismatch ? 'button' : undefined}
            tabIndex={isMismatch ? 0 : undefined}
          >
            <TimeSlotHeader
              date={group.date}
              location={group.location}
              showVenue={showVenue}
            />
            <div className={styles.timeSlotItems}>
              {group.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onIncrement={onIncrementItem}
                  onDecrement={onDecrementItem}
                  onSetQuantity={onSetItemQuantity}
                  onRemove={onRemoveItem}
                  isMemberActive={isMemberActive}
                  isDevicePreview={isDevicePreview}
                  onKeyboardOpen={onKeyboardOpen}
                  onKeyboardClose={onKeyboardClose}
                  isTimeslotMismatch={isMismatch}
                />
              ))}
            </div>
            {isMismatch && handleActivate && (
              <button
                className={styles.activateTimeslotLink}
                onClick={(e) => { e.stopPropagation(); handleActivate(); }}
                type="button"
              >
                Activate time slot
              </button>
            )}
          </div>
        );
      })}

      {/* Retail products (aggregated, shown once) */}
      {allRetailItems.length > 0 && (
        <div className={styles.flatProductsSection}>
          <ProductsSubHeader />
          <div className={styles.timeSlotItems}>
            {allRetailItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrement={onIncrementItem}
                onDecrement={onDecrementItem}
                onSetQuantity={onSetItemQuantity}
                onRemove={onRemoveItem}
                isMemberActive={isMemberActive}
                isDevicePreview={isDevicePreview}
                onKeyboardOpen={onKeyboardOpen}
                onKeyboardClose={onKeyboardClose}
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
  onSetItemQuantity,
  onRemoveItem,
  isMemberActive,
  activeTimeslots,
  isDevicePreview,
  onKeyboardOpen,
  onKeyboardClose,
  onSwitchTimeslot,
}: {
  group: CartEventGroup;
  onToggleExpand: (eventId: string) => void;
  onRemoveEvent: (eventId: string) => void;
  onIncrementItem: (id: string) => void;
  onDecrementItem: (id: string) => void;
  onSetItemQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  isMemberActive?: boolean;
  activeTimeslots?: Record<string, EventTimeslot>;
  isDevicePreview?: boolean;
  onKeyboardOpen?: () => void;
  onKeyboardClose?: () => void;
  onSwitchTimeslot?: (eventId: string, timeslotId: string) => void;
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
          {!group.isExpanded && (
            <div className={styles.eventLocation}>
              <FontAwesomeIcon icon={faLocationDot} className={styles.metaIcon} />
              <span>{group.location}</span>
            </div>
          )}
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
            <div
              className={timeSlotSectionClasses}
              onClick={isMismatch && derivedTimeslotId ? () => onSwitchTimeslot?.(derivedEventId, derivedTimeslotId) : undefined}
              role={isMismatch ? 'button' : undefined}
              tabIndex={isMismatch ? 0 : undefined}
            >
              <TimeSlotHeader
                date={group.date}
                location={group.location}
                showVenue
              />
              <div className={styles.timeSlotItems}>
                {group.items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onIncrement={onIncrementItem}
                    onDecrement={onDecrementItem}
                    onSetQuantity={onSetItemQuantity}
                    onRemove={onRemoveItem}
                    isMemberActive={isMemberActive}
                    isDevicePreview={isDevicePreview}
                    onKeyboardOpen={onKeyboardOpen}
                    onKeyboardClose={onKeyboardClose}
                    isTimeslotMismatch={isMismatch}
                  />
                ))}
              </div>
              {isMismatch && derivedTimeslotId && (
                <button
                  className={styles.activateTimeslotLink}
                  onClick={(e) => { e.stopPropagation(); onSwitchTimeslot?.(derivedEventId, derivedTimeslotId); }}
                  type="button"
                >
                  Activate time slot
                </button>
              )}
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
                    onSetQuantity={onSetItemQuantity}
                    onRemove={onRemoveItem}
                    isMemberActive={isMemberActive}
                    isDevicePreview={isDevicePreview}
                    onKeyboardOpen={onKeyboardOpen}
                    onKeyboardClose={onKeyboardClose}
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
  showVenue = true,
}: {
  date: string;
  location: string;
  showVenue?: boolean;
}) {
  return (
    <div className={styles.timeSlotHeader}>
      <div className={styles.timeSlotLeft}>
        <FontAwesomeIcon icon={faTicket} className={styles.timeSlotIcon} />
        <span className={styles.timeSlotText}>{date}</span>
      </div>
      {showVenue && (
        <div className={styles.timeSlotLocation}>
          <FontAwesomeIcon icon={faLocationDot} className={styles.timeSlotLocationIcon} />
          <span className={styles.timeSlotLocationText}>{location}</span>
        </div>
      )}
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
