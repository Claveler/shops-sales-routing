import { useMarquee } from './useMarquee';
import styles from './MarqueeText.module.css';

interface MarqueeTextProps {
  /** The text to display (and scroll if it overflows). */
  text: string;
  /** Extra CSS class applied to the outer viewport container. */
  className?: string;
  /** If true, auto-play the scroll once on mount. Default true. */
  autoPlay?: boolean;
}

/**
 * A self-contained marquee text component.
 *
 * Measures whether `text` overflows its container. If it does, it scrolls
 * once automatically (configurable) and replays on click/tap.
 */
export function MarqueeText({ text, className, autoPlay = true }: MarqueeTextProps) {
  const {
    viewportRef,
    measureRef,
    isAnimating,
    runKey,
    marqueeStyle,
    replay,
    handleAnimationEnd,
  } = useMarquee({ text, autoPlay });

  return (
    <div
      ref={viewportRef}
      className={`${styles.viewport} ${className ?? ''}`}
      onClick={replay}
      role="button"
      tabIndex={0}
      aria-label="Replay scroll"
    >
      {isAnimating ? (
        <span
          key={runKey}
          className={styles.animated}
          style={marqueeStyle}
          onAnimationEnd={handleAnimationEnd}
        >
          {text}
        </span>
      ) : (
        <span className={styles.static}>{text}</span>
      )}
      <span ref={measureRef} className={styles.measure} aria-hidden="true">
        {text}
      </span>
    </div>
  );
}
