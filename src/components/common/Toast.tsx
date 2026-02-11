import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faExclamationTriangle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from './Toast.module.css';

export type ToastVariant = 'success' | 'warning' | 'info' | 'error';

interface ToastProps {
  variant?: ToastVariant;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  autoDismiss?: number; // milliseconds, 0 to disable
}

const iconMap = {
  success: faCheck,
  warning: faExclamationTriangle,
  info: faInfoCircle,
  error: faExclamationTriangle,
};

export function Toast({
  variant = 'success',
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
  autoDismiss = 10000,
}: ToastProps) {
  useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(onDismiss, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss]);

  return (
    <div className={`${styles.toast} ${styles[variant]}`}>
      <div className={styles.iconWrapper}>
        <FontAwesomeIcon icon={iconMap[variant]} className={styles.icon} />
      </div>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        {message && <div className={styles.message}>{message}</div>}
        {actionLabel && onAction && (
          <button className={styles.actionBtn} onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
      <button className={styles.dismissBtn} onClick={onDismiss} aria-label="Dismiss">
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
}
