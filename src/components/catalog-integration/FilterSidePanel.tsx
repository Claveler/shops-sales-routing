import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronDown, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import styles from './FilterSidePanel.module.css';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseFilter: string;
  setWarehouseFilter: (value: string) => void;
  warehouseOptions: FilterOption[];
  publishedFilter: string;
  setPublishedFilter: (value: string) => void;
  eventFilter: string;
  setEventFilter: (value: string) => void;
  eventOptions: FilterOption[];
  channelFilter: string;
  setChannelFilter: (value: string) => void;
  channelOptions: FilterOption[];
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categoryOptions: FilterOption[];
  resultCount?: number;
  hasSalesRouting?: boolean;
}

export function FilterSidePanel({
  isOpen,
  onClose,
  warehouseFilter,
  setWarehouseFilter,
  warehouseOptions,
  publishedFilter,
  setPublishedFilter,
  eventFilter,
  setEventFilter,
  eventOptions,
  channelFilter,
  setChannelFilter,
  channelOptions,
  categoryFilter,
  setCategoryFilter,
  categoryOptions,
  resultCount,
  hasSalesRouting = true,
}: FilterSidePanelProps) {
  const [alertDismissed, setAlertDismissed] = useState(false);

  const hasActiveFilters =
    warehouseFilter !== 'all' ||
    publishedFilter !== 'all' ||
    eventFilter !== 'all' ||
    channelFilter !== 'all' ||
    categoryFilter !== 'all';

  const handleClearAll = () => {
    setWarehouseFilter('all');
    setPublishedFilter('all');
    setEventFilter('all');
    setChannelFilter('all');
    setCategoryFilter('all');
  };

  const handleApply = () => {
    onClose();
  };

  const applyLabel = 'Apply filters';

  return createPortal(
    <>
      {/* Scrim / Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.open : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <span className={styles.titleSpacer} />
            <h3 className={styles.title}>Filters</h3>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close filters">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Scrollable body */}
        <div className={styles.body}>
          <div className={styles.filterList}>
            {/* Warning Alert – shown when no sales routing is configured */}
            {!hasSalesRouting && !alertDismissed && (
              <div className={`${styles.alert} ${styles.alertWarning}`}>
                <div className={`${styles.alertBar} ${styles.alertBarWarning}`} />
                <div className={styles.alertContent}>
                  <div className={styles.alertHeader}>
                    <div className={`${styles.alertIcon} ${styles.alertIconWarning}`}>
                      <FontAwesomeIcon icon={faExclamationTriangle} />
                    </div>
                    <span className={`${styles.alertTitle} ${styles.alertTitleWarning}`}>
                      Some filters are disabled
                    </span>
                  </div>
                  <div className={`${styles.alertDescription} ${styles.alertDescriptionWarning}`}>
                    The Status, Event, and Channel filters will remain disabled until the sales routing is configured.
                  </div>
                </div>
                <button
                  className={`${styles.alertClose} ${styles.alertCloseWarning}`}
                  onClick={() => setAlertDismissed(true)}
                  aria-label="Dismiss alert"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            )}

            {/* Warehouse – always enabled */}
            <FloatingField
              label="Warehouse"
              value={warehouseFilter}
              onChange={setWarehouseFilter}
              placeholder="Select option(s)"
              options={[
                { value: 'all', label: 'All warehouses' },
                ...warehouseOptions,
              ]}
            />

            {/* Status – disabled when no sales routing */}
            <FloatingField
              label="Status"
              value={publishedFilter}
              onChange={setPublishedFilter}
              placeholder="Select option(s)"
              disabled={!hasSalesRouting}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'published', label: 'Distributed' },
                { value: 'unpublished', label: 'Not distributed' },
              ]}
            />

            {/* Event – disabled when no sales routing */}
            <FloatingField
              label="Event"
              value={eventFilter}
              onChange={setEventFilter}
              placeholder="Select option(s)"
              disabled={!hasSalesRouting}
              options={[
                { value: 'all', label: 'All events' },
                ...eventOptions,
              ]}
            />

            {/* Channel – disabled when no sales routing */}
            <FloatingField
              label="Channel"
              value={channelFilter}
              onChange={setChannelFilter}
              placeholder="Select option(s)"
              disabled={!hasSalesRouting}
              options={[
                { value: 'all', label: 'All channels' },
                ...channelOptions,
              ]}
            />

            {/* Category (first level) – always enabled */}
            <FloatingField
              label="Category (first level)"
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="Select option(s)"
              options={[
                { value: 'all', label: 'All categories' },
                ...categoryOptions,
              ]}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.applyBtn} onClick={handleApply}>
            {applyLabel}
          </button>
          <button
            className={styles.clearBtn}
            onClick={handleClearAll}
            disabled={!hasActiveFilters}
          >
            Clear filters
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}

/* ─── Floating-label select field ─── */

interface FloatingFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: FilterOption[];
  disabled?: boolean;
}

function FloatingField({ label, value, onChange, placeholder, options, disabled = false }: FloatingFieldProps) {
  const isDefault = value === 'all';

  return (
    <div className={`${styles.field} ${disabled ? styles.fieldDisabled : ''}`}>
      <div className={styles.fieldInner}>
        <span className={`${styles.fieldLabel} ${disabled ? styles.fieldLabelDisabled : ''}`}>
          {label}
        </span>
        <select
          className={`${styles.fieldSelect} ${isDefault ? styles.placeholder : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {isDefault && opt.value === value ? placeholder : opt.label}
            </option>
          ))}
        </select>
      </div>
      <span className={`${styles.fieldChevron} ${disabled ? styles.fieldChevronDisabled : ''}`}>
        <FontAwesomeIcon icon={faChevronDown} />
      </span>
    </div>
  );
}
