import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './NumericKeyboard.module.css';

interface NumericKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function NumericKeyboard({ value, onChange, onConfirm, onCancel }: NumericKeyboardProps) {
  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      onChange(value.slice(0, -1));
    } else {
      // Prevent leading zeros (except for single "0")
      if (value === '0' && key !== '0') {
        onChange(key);
      } else if (value === '0' && key === '0') {
        // Keep single zero
        return;
      } else {
        onChange(value + key);
      }
    }
  };

  return (
    <div className={styles.keyboardOverlay}>
      {/* Invisible click-capture layer to dismiss keyboard when tapping outside */}
      <div className={styles.dismissLayer} onClick={onCancel} />
      <div className={styles.keyboardContainer}>
        {/* Keyboard grid - Gboard style 4x3 layout */}
        <div className={styles.keyboardGrid}>
          {/* Row 1 */}
          <button className={styles.key} onClick={() => handleKeyPress('1')} type="button">1</button>
          <button className={styles.key} onClick={() => handleKeyPress('2')} type="button">2</button>
          <button className={styles.key} onClick={() => handleKeyPress('3')} type="button">3</button>
          
          {/* Row 2 */}
          <button className={styles.key} onClick={() => handleKeyPress('4')} type="button">4</button>
          <button className={styles.key} onClick={() => handleKeyPress('5')} type="button">5</button>
          <button className={styles.key} onClick={() => handleKeyPress('6')} type="button">6</button>
          
          {/* Row 3 */}
          <button className={styles.key} onClick={() => handleKeyPress('7')} type="button">7</button>
          <button className={styles.key} onClick={() => handleKeyPress('8')} type="button">8</button>
          <button className={styles.key} onClick={() => handleKeyPress('9')} type="button">9</button>
          
          {/* Row 4 - Gboard style: ABC/special, 0, backspace */}
          <button 
            className={`${styles.key} ${styles.keyFunction}`} 
            onClick={onConfirm}
            type="button"
            aria-label="Done"
          >
            <FontAwesomeIcon icon={faCheck} className={styles.keyFunctionIcon} />
          </button>
          <button className={styles.key} onClick={() => handleKeyPress('0')} type="button">0</button>
          <button 
            className={`${styles.key} ${styles.keyFunction}`} 
            onClick={() => handleKeyPress('backspace')} 
            type="button"
            aria-label="Backspace"
          >
            <FontAwesomeIcon icon={faDeleteLeft} className={styles.keyFunctionIcon} />
          </button>
        </div>

        {/* Spacebar row - mimics Gboard bottom row */}
        <div className={styles.bottomRow}>
          <button className={styles.keyComma} type="button" disabled>,</button>
          <button className={styles.keySpace} onClick={onCancel} type="button">
            <span className={styles.spaceLabel}>Cancel</span>
          </button>
          <button className={styles.keyPeriod} type="button" disabled>.</button>
        </div>
      </div>
    </div>
  );
}
