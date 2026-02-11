import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './EditIntegrationSidePanel.module.css';

interface EditIntegrationSidePanelProps {
  isOpen: boolean;
  currentName: string;
  onSave: (newName: string) => void;
  onClose: () => void;
}

export function EditIntegrationSidePanel({ isOpen, currentName, onSave, onClose }: EditIntegrationSidePanelProps) {
  const [name, setName] = useState(currentName);

  // Reset name when panel opens
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  const trimmedName = name.trim();
  const hasChanged = trimmedName !== currentName;
  const isValid = trimmedName.length > 0;

  const handleSave = () => {
    if (isValid && hasChanged) {
      onSave(trimmedName);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && hasChanged) {
      handleSave();
    }
  };

  return (
    <>
      {/* Backdrop / Scrim */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.open : ''}`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        {/* Safe area for clicking outside */}
        <div className={styles.safeArea} onClick={onClose} />

        {/* Card */}
        <div className={styles.card}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.titleRow}>
              <span className={styles.title}>Edit integration</span>
              <button className={styles.closeBtn} onClick={onClose}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className={styles.divider} />
          </div>

          {/* Body */}
          <div className={styles.body}>
            <div className={styles.field}>
              <div className={styles.fieldInner}>
                <span className={styles.fieldLabel}>Integration name</span>
                <input
                  type="text"
                  className={styles.fieldInput}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter integration name"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={!isValid || !hasChanged}
            >
              Save changes
            </button>
            <button className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
