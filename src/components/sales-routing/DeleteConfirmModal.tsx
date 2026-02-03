import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../common/Button';
import type { RoutingStatus } from '../../data/mockData';
import styles from './DeleteConfirmModal.module.css';

interface DeleteConfirmModalProps {
  routingName: string;
  routingStatus: RoutingStatus;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ 
  routingName, 
  routingStatus,
  onConfirm, 
  onCancel 
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState('');
  
  const isConfirmValid = confirmText === routingName;
  const isActive = routingStatus === 'active';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfirmValid) {
      onConfirm();
    }
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onCancel} aria-label="Close">
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className={styles.iconWrapper}>
          <FontAwesomeIcon icon={faExclamationTriangle} className={styles.warningIcon} />
        </div>

        <h2 className={styles.title}>Delete sales routing?</h2>
        
        <p className={styles.description}>
          This will permanently delete <strong>{routingName}</strong>. This action cannot be undone.
        </p>

        {isActive && (
          <div className={styles.activeWarning}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>
              This routing is currently <strong>active</strong>. Deleting it will immediately stop all associated sales.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.confirmField}>
            <label className={styles.confirmLabel}>
              Type <strong>{routingName}</strong> to confirm
            </label>
            <input
              type="text"
              className={styles.confirmInput}
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Enter routing name"
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
