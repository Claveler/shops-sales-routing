import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import styles from './NavigationTabs.module.css';

export type PosTab = 'tickets' | 'gift-shop';

interface NavigationTabsProps {
  activeTab: PosTab;
  onTabChange: (tab: PosTab) => void;
  eventName?: string;
  eventImageUrl?: string;
  onEditEvent?: () => void;
}

export function NavigationTabs({
  activeTab,
  onTabChange,
  eventName = 'Candlelight: Tribute to Taylor Swift',
  eventImageUrl,
  onEditEvent,
}: NavigationTabsProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const hasAutoPlayedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const [overflowPx, setOverflowPx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [runKey, setRunKey] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const canAnimate = overflowPx > 0 && !prefersReducedMotion;

  const marqueeDurationSec = useMemo(() => {
    // Keep speed perceptually stable across different overflow distances.
    return Math.min(6, Math.max(3, overflowPx / 45 + 2.6));
  }, [overflowPx]);

  const measureOverflow = useCallback(() => {
    if (!viewportRef.current || !measureRef.current) {
      return;
    }

    const viewportWidth = viewportRef.current.clientWidth;
    const textWidth = measureRef.current.getBoundingClientRect().width;
    const nextOverflow = Math.max(0, Math.ceil(textWidth - viewportWidth));
    setOverflowPx(nextOverflow);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updatePreference);
      return () => mediaQuery.removeEventListener('change', updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    measureOverflow();
    const resizeObserver = new ResizeObserver(() => measureOverflow());
    if (viewportRef.current) {
      resizeObserver.observe(viewportRef.current);
    }
    if (measureRef.current) {
      resizeObserver.observe(measureRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [measureOverflow, eventName]);

  useEffect(() => {
    if (hasAutoPlayedRef.current || !canAnimate) {
      return;
    }
    hasAutoPlayedRef.current = true;
    setRunKey((prev) => prev + 1);
    setIsAnimating(true);
  }, [canAnimate]);

  useEffect(() => {
    if (!prefersReducedMotion) {
      return;
    }
    setIsAnimating(false);
  }, [prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const replayMarquee = useCallback(() => {
    if (!canAnimate) {
      return;
    }

    setIsAnimating(false);
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = window.requestAnimationFrame(() => {
      setRunKey((prev) => prev + 1);
      setIsAnimating(true);
    });
  }, [canAnimate]);

  const handleEventNameClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onTabChange('tickets');
    replayMarquee();
  }, [onTabChange, replayMarquee]);

  const marqueeStyle = useMemo(
    () =>
      ({
        '--event-name-marquee-shift': `-${overflowPx}px`,
        '--event-name-marquee-duration': `${marqueeDurationSec.toFixed(2)}s`,
      } as CSSProperties),
    [overflowPx, marqueeDurationSec]
  );

  const handleEditClick = useCallback((event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    onEditEvent?.();
  }, [onEditEvent]);

  const handleEditKeyDown = useCallback((event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    onEditEvent?.();
  }, [onEditEvent]);

  return (
    <div className={styles.navigation}>
      <button
        className={`${styles.tab} ${styles.eventTab} ${activeTab === 'tickets' ? styles.active : ''}`}
        onClick={() => onTabChange('tickets')}
        type="button"
      >
        <div className={styles.eventInfo}>
          {eventImageUrl ? (
            <img
              src={eventImageUrl}
              alt={eventName}
              className={styles.eventImage}
              loading="eager"
            />
          ) : (
            <div className={styles.eventImageFallback} aria-hidden="true" />
          )}
          <div
            ref={viewportRef}
            className={styles.eventNameViewport}
            onClick={handleEventNameClick}
          >
            {isAnimating ? (
              <span
                key={runKey}
                className={styles.eventNameAnimated}
                style={marqueeStyle}
                onAnimationEnd={() => setIsAnimating(false)}
              >
                {eventName}
              </span>
            ) : (
              <span className={styles.eventNameStatic}>{eventName}</span>
            )}
            <span ref={measureRef} className={styles.eventNameMeasure} aria-hidden="true">
              {eventName}
            </span>
          </div>
          <span
            className={styles.editButton}
            role="button"
            tabIndex={0}
            aria-label="Change event"
            onClick={handleEditClick}
            onKeyDown={handleEditKeyDown}
          >
            <FontAwesomeIcon icon={faPenToSquare} className={styles.editIcon} />
          </span>
        </div>
      </button>

      <button
        className={`${styles.tab} ${styles.standardTab} ${activeTab === 'gift-shop' ? styles.active : ''}`}
        onClick={() => onTabChange('gift-shop')}
        type="button"
      >
        <FontAwesomeIcon icon={faGift} className={styles.tabIcon} />
        <span className={styles.tabLabel}>Gift Shop</span>
      </button>
    </div>
  );
}
