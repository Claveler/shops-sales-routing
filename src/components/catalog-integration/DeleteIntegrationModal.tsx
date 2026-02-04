import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../common/Button';
import styles from './DeleteIntegrationModal.module.css';

interface DeleteIntegrationModalProps {
  isOpen: boolean;
  integrationName: string;
  warehouseCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteIntegrationModal({ 
  isOpen,
  integrationName, 
  warehouseCount,
  onConfirm, 
  onCancel 
}: DeleteIntegrationModalProps) {
  const [confirmText, setConfirmText] = useState('');
  
  const isConfirmValid = confirmText === integrationName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfirmValid) {
      onConfirm();
    }
  };

  // Reset confirm text when modal closes
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onCancel} aria-label="Close">
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className={styles.iconWrapper}>
          <FontAwesomeIcon icon={faExclamationTriangle} className={styles.warningIcon} />
        </div>

        <h2 className={styles.title}>Delete catalog integration?</h2>
        
        <p className={styles.description}>
          This will permanently delete <strong>{integrationName}</strong>. This action cannot be undone.
        </p>

        {warehouseCount > 0 && (
          <div className={styles.warning}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>
              This will also delete <strong>{warehouseCount} warehouse{warehouseCount > 1 ? 's' : ''}</strong> and 
              may affect sales routings using these warehouses.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.confirmField}>
            <label className={styles.confirmLabel}>
              Type <strong>{integrationName}</strong> to confirm
            </label>
            <input
              type="text"
              className={styles.confirmInput}
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Enter integration name"
              autoFocus
            />
          </div>

          <div className={styles.actions}>
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button 
              variant="danger" 
              disabled={!isConfirmValid}
              type="submit"
            >
              Delete permanently
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
