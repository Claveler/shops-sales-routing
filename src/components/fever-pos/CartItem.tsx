import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faPlus, faMinus, faCrown } from '@fortawesome/free-solid-svg-icons';
import type { CartItemData } from '../../data/feverPosData';
import { formatPrice } from '../../data/feverPosData';
import { NumericKeyboard } from './NumericKeyboard';
import styles from './CartItem.module.css';

interface CartItemProps {
  item: CartItemData;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onSetQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  isMemberActive?: boolean;
  /** When true, shows on-screen keyboard instead of native input */
  isDevicePreview?: boolean;
  /** Called when the on-screen keyboard opens */
  onKeyboardOpen?: () => void;
  /** Called when the on-screen keyboard closes */
  onKeyboardClose?: () => void;
  /** When true, quantity controls are disabled (item belongs to a different timeslot) */
  isTimeslotMismatch?: boolean;
}

export function CartItem({ item, onIncrement, onDecrement, onSetQuantity, onRemove, isMemberActive, isDevicePreview, onKeyboardOpen, onKeyboardClose, isTimeslotMismatch }: CartItemProps) {
  const isOne = item.quantity <= 1;
  const hasMemberDiscount = isMemberActive && item.originalPrice != null;
  const isSeatedTicket = Boolean(item.seatInfoList?.length);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(item.quantity));
  const inputRef = useRef<HTMLInputElement>(null);
  const cartItemRef = useRef<HTMLDivElement>(null);

  // Keep editValue in sync with item.quantity when not editing
  useEffect(() => {
    if (!isEditing) {
      setEditValue(String(item.quantity));
    }
  }, [item.quantity, isEditing]);

  // Focus input when entering edit mode (only for non-device-preview mode)
  useEffect(() => {
    if (isEditing && inputRef.current && !isDevicePreview) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing, isDevicePreview]);

  // Scroll cart item into view when keyboard opens (device preview mode)
  useEffect(() => {
    if (isEditing && isDevicePreview && cartItemRef.current) {
      // Small delay to let the keyboard animate in
      const timer = setTimeout(() => {
        cartItemRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isEditing, isDevicePreview]);

  const handleQuantityClick = () => {
    // Seated tickets cannot have quantity changed
    if (isSeatedTicket) return;
    
    // In device preview mode, start with empty value for fresh input
    // In regular mode, keep existing value for inline editing
    if (isDevicePreview) {
      setEditValue('');
      onKeyboardOpen?.();
    }
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    setEditValue(value);
  };

  const handleInputBlur = () => {
    // Don't commit on blur when using device preview (keyboard handles it)
    if (!isDevicePreview) {
      commitQuantity();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitQuantity();
    } else if (e.key === 'Escape') {
      setEditValue(String(item.quantity));
      setIsEditing(false);
    }
  };

  const handleKeyboardChange = (value: string) => {
    setEditValue(value);
  };

  const handleKeyboardConfirm = () => {
    onKeyboardClose?.();
    commitQuantity();
  };

  const handleKeyboardCancel = () => {
    onKeyboardClose?.();
    setEditValue(String(item.quantity));
    setIsEditing(false);
  };

  const commitQuantity = () => {
    const newQuantity = parseInt(editValue, 10);
    if (!isNaN(newQuantity)) {
      onSetQuantity(item.id, newQuantity);
    }
    setIsEditing(false);
  };

  return (
    <div ref={cartItemRef} className={`${styles.cartItem} ${isTimeslotMismatch ? styles.cartItemDisabled : ''}`}>
      <div className={styles.itemInfo}>
        <p className={isSeatedTicket ? styles.seatItemName : styles.itemName}>{item.name}</p>
        {item.variantLabel && (
          <span className={styles.variantLabel}>{item.variantLabel}</span>
        )}
        {/* Seat reference list for grouped seated tickets */}
        {isSeatedTicket && item.seatInfoList && (
          <ul className={styles.seatList}>
            {item.seatInfoList.map((s) => (
              <li key={s.seatId} className={styles.seatRef}>
                {s.row}{s.seat} ({s.section}) · {s.ticketType}
              </li>
            ))}
          </ul>
        )}
        {isSeatedTicket && item.seatInfoList ? (
          <div className={styles.seatedPriceBlock}>
            <span className={styles.price}>
              {formatPrice(item.seatInfoList.reduce((sum, s) => sum + s.unitPrice, 0))}
            </span>
            {item.seatInfoList.some((s) => s.bookingFee && s.bookingFee > 0) && (
              <p className={styles.bookingFee}>
                + {formatPrice(item.seatInfoList.reduce((sum, s) => sum + (s.bookingFee ?? 0), 0))} booking fee
              </p>
            )}
          </div>
        ) : (
          <>
            <div className={styles.priceRow}>
              {hasMemberDiscount ? (
                <>
                  <span className={styles.originalPrice}>{formatPrice(item.originalPrice!)}</span>
                  <span className={styles.price}>{formatPrice(item.price)}</span>
                  <FontAwesomeIcon icon={faCrown} className={styles.crownIcon} />
                </>
              ) : (
                <span className={styles.price}>{formatPrice(item.price)}</span>
              )}
            </div>
            {item.bookingFee !== undefined && item.bookingFee > 0 && (
              <p className={styles.bookingFee}>+ {formatPrice(item.bookingFee)} booking fee</p>
            )}
          </>
        )}
      </div>

      {/* Seats badge for grouped seated tickets */}
      {isSeatedTicket ? (
        <div className={styles.seatsBadge}>
          <span className={styles.seatsBadgeLabel}>Seats</span>
          <span className={styles.seatsBadgeCount}>{item.seatInfoList!.length}</span>
        </div>
      ) : (
        <div className={styles.pillCounter}>
          <button
            className={`${styles.pillBtn} ${styles.pillBtnLeft} ${isTimeslotMismatch ? styles.pillBtnDisabled : ''}`}
            onClick={() => !isTimeslotMismatch && (isOne ? onRemove(item.id) : onDecrement(item.id))}
            type="button"
            aria-label={isOne ? 'Remove item' : 'Decrease quantity'}
            disabled={isTimeslotMismatch}
          >
            <FontAwesomeIcon icon={isOne ? faTrashCan : faMinus} />
          </button>
          {isEditing && !isDevicePreview ? (
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              className={styles.pillInput}
              value={editValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              aria-label="Quantity"
            />
          ) : (
            <span 
              className={`${styles.pillCount} ${isEditing && isDevicePreview ? styles.pillCountEditing : ''} ${isTimeslotMismatch ? styles.pillCountDisabled : ''}`}
              onClick={isTimeslotMismatch ? undefined : handleQuantityClick}
              role="button"
              tabIndex={isTimeslotMismatch ? -1 : 0}
              onKeyDown={(e) => !isTimeslotMismatch && e.key === 'Enter' && handleQuantityClick()}
              aria-label={`Quantity ${item.quantity}${isTimeslotMismatch ? ' (switch to this timeslot to edit)' : ', click to edit'}`}
            >
              {isEditing && isDevicePreview ? editValue || '0' : item.quantity}
            </span>
          )}
          <button
            className={`${styles.pillBtn} ${styles.pillBtnRight} ${isTimeslotMismatch ? styles.pillBtnDisabled : ''}`}
            onClick={() => !isTimeslotMismatch && onIncrement(item.id)}
            type="button"
            aria-label="Increase quantity"
            disabled={isTimeslotMismatch}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      )}

      {/* On-screen keyboard for device preview mode */}
      {isEditing && isDevicePreview && (
        <NumericKeyboard
          value={editValue}
          onChange={handleKeyboardChange}
          onConfirm={handleKeyboardConfirm}
          onCancel={handleKeyboardCancel}
        />
      )}
    </div>
  );
}
