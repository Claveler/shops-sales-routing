import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft, faCheck, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import styles from './AlphanumericKeyboard.module.css';

interface AlphanumericKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const QWERTY_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export function AlphanumericKeyboard({ value, onChange, onConfirm, onCancel }: AlphanumericKeyboardProps) {
  const [isShift, setIsShift] = useState(false);

  const handleKeyPress = (key: string) => {
    const char = isShift ? key.toUpperCase() : key.toLowerCase();
    onChange(value + char);
    // Auto-disable shift after typing a character
    if (isShift) setIsShift(false);
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  return (
    <div className={styles.keyboardOverlay}>
      {/* Invisible click-capture layer to dismiss keyboard when tapping outside */}
      <div className={styles.dismissLayer} onClick={onCancel} />
      <div className={styles.keyboardContainer}>
        {/* Row 1: Numbers */}
        <div className={styles.keyboardRow}>
          {QWERTY_ROWS[0].map((key) => (
            <button
              key={key}
              className={styles.key}
              onClick={() => onChange(value + key)}
              type="button"
            >
              {key}
            </button>
          ))}
        </div>

        {/* Row 2: QWERTYUIOP */}
        <div className={styles.keyboardRow}>
          {QWERTY_ROWS[1].map((key) => (
            <button
              key={key}
              className={styles.key}
              onClick={() => handleKeyPress(key)}
              type="button"
            >
              {isShift ? key : key.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Row 3: ASDFGHJKL */}
        <div className={styles.keyboardRow}>
          <div className={styles.keySpacer} />
          {QWERTY_ROWS[2].map((key) => (
            <button
              key={key}
              className={styles.key}
              onClick={() => handleKeyPress(key)}
              type="button"
            >
              {isShift ? key : key.toLowerCase()}
            </button>
          ))}
          <div className={styles.keySpacer} />
        </div>

        {/* Row 4: Shift + ZXCVBNM + Backspace */}
        <div className={styles.keyboardRow}>
          <button
            className={`${styles.key} ${styles.keyFunction} ${isShift ? styles.keyFunctionActive : ''}`}
            onClick={() => setIsShift(!isShift)}
            type="button"
            aria-label="Shift"
          >
            <FontAwesomeIcon icon={faArrowUp} className={styles.keyFunctionIcon} />
          </button>
          {QWERTY_ROWS[3].map((key) => (
            <button
              key={key}
              className={styles.key}
              onClick={() => handleKeyPress(key)}
              type="button"
            >
              {isShift ? key : key.toLowerCase()}
            </button>
          ))}
          <button
            className={`${styles.key} ${styles.keyFunction}`}
            onClick={handleBackspace}
            type="button"
            aria-label="Backspace"
          >
            <FontAwesomeIcon icon={faDeleteLeft} className={styles.keyFunctionIcon} />
          </button>
        </div>

        {/* Row 5: Cancel + Space + Done */}
        <div className={styles.keyboardRow}>
          <button
            className={`${styles.key} ${styles.keyCancel}`}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`${styles.key} ${styles.keySpace}`}
            onClick={() => onChange(value + ' ')}
            type="button"
            aria-label="Space"
          />
          <button
            className={`${styles.key} ${styles.keyDone}`}
            onClick={onConfirm}
            type="button"
          >
            <FontAwesomeIcon icon={faCheck} className={styles.keyDoneIcon} />
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
