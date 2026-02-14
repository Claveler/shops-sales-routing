import { useState, useCallback, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressCard, faXmark, faCrosshairs, faMagicWandSparkles } from '@fortawesome/free-solid-svg-icons';
import styles from './MemberIdentifyModal.module.css';

interface MemberIdentifyModalProps {
  isOpen: boolean;
  onIdentify: (member: { id: string; name: string }) => void;
  onClose: () => void;
}

export function MemberIdentifyModal({ isOpen, onIdentify, onClose }: MemberIdentifyModalProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the modal opens
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      // Small delay to let the DOM render
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;
    // Hardcoded member for mockup purposes
    onIdentify({ id: '7261322', name: 'Anderson Collingwood' });
  }, [inputValue, onIdentify]);

  const handleFillDemoMember = useCallback(() => {
    onIdentify({ id: '7261322', name: 'Anderson Collingwood' });
  }, [onIdentify]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Identify member"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Identify member</h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.divider} />

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.block}>
            {/* Instruction */}
            <div className={styles.instruction}>
              <FontAwesomeIcon icon={faAddressCard} className={styles.instructionIcon} />
              <p className={styles.instructionText}>
                Scan the QR code or enter the ID manually
              </p>
            </div>

            {/* Input field */}
            <div className={styles.fieldWrapper}>
              <input
                ref={inputRef}
                type="text"
                className={styles.field}
                placeholder="Member ID"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span className={styles.fieldLabel}>Member ID</span>
              <span className={styles.fieldIcon}>
                <FontAwesomeIcon icon={faCrosshairs} />
              </span>
            </div>

            {/* Demo prefill */}
            <button
              type="button"
              className={styles.fillDemoBtn}
              onClick={handleFillDemoMember}
            >
              <FontAwesomeIcon icon={faMagicWandSparkles} />
              Enter demo member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
