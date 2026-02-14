import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faChevronRight, faHouse } from '@fortawesome/free-solid-svg-icons';
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
  onClear?: () => void;
  showBreadcrumbs?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  onBreadcrumbClick?: (id: string) => void;
  onHomeClick?: () => void;
  isHomeDisabled?: boolean;
}

export function CategoryFilter({
  categories,
  activeCategoryId,
  onCategoryChange,
  onClear,
  showBreadcrumbs = false,
  breadcrumbs = [],
  onBreadcrumbClick,
  onHomeClick,
  isHomeDisabled = true,
}: CategoryFilterProps) {
  return (
    <div className={styles.filterBar}>
      <button
        className={styles.homeButton}
        type="button"
        aria-label="Back to root category"
        onClick={onHomeClick}
        disabled={isHomeDisabled}
      >
        <FontAwesomeIcon icon={faHouse} />
      </button>

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
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.trailingControl}>
        {onClear ? (
          <button
            className={styles.clearButton}
            onClick={onClear}
            type="button"
            aria-label="Open calendar"
          >
            <FontAwesomeIcon icon={faCalendar} />
          </button>
        ) : (
          <span className={styles.clearButtonPlaceholder} aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
