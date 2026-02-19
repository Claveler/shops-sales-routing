import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faChevronRight, faCrown, faHouse } from '@fortawesome/free-solid-svg-icons';
import type { Category } from '../../data/feverPosData';
import styles from './CategoryFilter.module.css';

interface BreadcrumbItem {
  id: string;
  label: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onCalendarClick?: () => void;
  onClearTimeslot?: () => void;
  timeslotLabel?: string;
  showBreadcrumbs?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  onBreadcrumbClick?: (id: string) => void;
  onHomeClick?: () => void;
  isHomeDisabled?: boolean;
  isMemberActive?: boolean;
  /** Hide the home button entirely (e.g., for seating tab) */
  hideHomeButton?: boolean;
}

export function CategoryFilter({
  categories,
  activeCategoryId,
  onCategoryChange,
  onCalendarClick,
  onClearTimeslot: _onClearTimeslot,
  timeslotLabel,
  showBreadcrumbs = false,
  breadcrumbs = [],
  onBreadcrumbClick,
  onHomeClick,
  isHomeDisabled = true,
  isMemberActive = false,
  hideHomeButton = false,
}: CategoryFilterProps) {
  return (
    <div className={styles.filterBar}>
      {!hideHomeButton && (
        <button
          className={styles.homeButton}
          type="button"
          aria-label="Back to root category"
          onClick={onHomeClick}
          disabled={isHomeDisabled}
        >
          <FontAwesomeIcon icon={faHouse} />
        </button>
      )}

      <div className={styles.primaryNav}>
        {showBreadcrumbs ? (
          <div className={styles.breadcrumbs}>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <button
                  key={crumb.id}
                  type="button"
                  className={`${styles.breadcrumbItem} ${isLast ? styles.breadcrumbCurrent : ''}`}
                  onClick={() => onBreadcrumbClick?.(crumb.id)}
                  disabled={isLast}
                >
                  {index > 0 && <FontAwesomeIcon icon={faChevronRight} className={styles.breadcrumbSeparator} />}
                  <span>{crumb.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className={styles.chips}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.chip} ${cat.id === activeCategoryId ? styles.active : ''}`}
                onClick={() => onCategoryChange(cat.id)}
                type="button"
              >
                {cat.name}
                {isMemberActive && cat.hasMemberPricing && (
                  <FontAwesomeIcon icon={faCrown} className={styles.chipCrown} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.trailingControl}>
        {onCalendarClick ? (
          timeslotLabel ? (
            <div className={styles.timeslotPill} role="button" tabIndex={0} onClick={onCalendarClick}>
              <span className={styles.timeslotPillLabel}>{timeslotLabel}</span>
              <FontAwesomeIcon icon={faCalendar} className={styles.timeslotPillIcon} />
            </div>
          ) : (
            <button
              className={styles.clearButton}
              onClick={onCalendarClick}
              type="button"
              aria-label="Select date and time"
            >
              <FontAwesomeIcon icon={faCalendar} />
            </button>
          )
        ) : (
          <span className={styles.clearButtonPlaceholder} aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
