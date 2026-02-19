import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

export interface UseMarqueeOptions {
  /** The text whose overflow is measured. Changing this re-measures. */
  text: string;
  /** If true, auto-play fires once when overflow is first detected. Default true. */
  autoPlay?: boolean;
}

export interface UseMarqueeReturn {
  /** Ref for the visible viewport container (clips the text). */
  viewportRef: React.RefObject<HTMLDivElement | null>;
  /** Ref for the hidden measurement span (full-width text). */
  measureRef: React.RefObject<HTMLSpanElement | null>;
  /** Whether the text overflows and can animate. */
  canAnimate: boolean;
  /** Whether an animation is currently running. */
  isAnimating: boolean;
  /** Incrementing key — change triggers a fresh CSS animation run. */
  runKey: number;
  /** CSS custom properties to apply on the animated element. */
  marqueeStyle: CSSProperties;
  /** Call to replay the scroll animation on demand (e.g. tap). */
  replay: () => void;
  /** Handler to attach to the animated element's onAnimationEnd. */
  handleAnimationEnd: () => void;
}

/**
 * Encapsulates the "marquee" scroll-on-overflow logic used by the POS UI.
 *
 * The hook measures whether `text` overflows its viewport container, computes
 * the CSS custom properties that drive the `@keyframes` animation, and exposes
 * a `replay()` function for tap-to-replay behaviour.
 */
export function useMarquee({ text, autoPlay = true }: UseMarqueeOptions): UseMarqueeReturn {
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
    // Pablo's spec: 30% scroll-left, 40% pause (3s), 30% scroll-back.
    // scrollTime = overflow / 50 (clamped 1–3s). total = 3s_pause / 0.4
    const scrollTime = Math.min(3, Math.max(1, overflowPx / 50));
    return scrollTime / 0.3;
  }, [overflowPx]);

  // ---- Measure overflow ----
  const measureOverflow = useCallback(() => {
    if (!viewportRef.current || !measureRef.current) return;
    const viewportWidth = viewportRef.current.clientWidth;
    // Use scrollWidth instead of getBoundingClientRect().width because BCR
    // returns the *visually rendered* size after CSS transforms (e.g. matrix3d
    // in the iMin device preview), which would incorrectly report a smaller
    // width and prevent the marquee from detecting overflow.
    const textWidth = measureRef.current.scrollWidth;
    setOverflowPx(Math.max(0, Math.ceil(textWidth - viewportWidth)));
  }, []);

  // ---- Reduced-motion preference ----
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  // ---- ResizeObserver for re-measuring ----
  useEffect(() => {
    if (typeof window === 'undefined') return;
    measureOverflow();
    const ro = new ResizeObserver(() => measureOverflow());
    if (viewportRef.current) ro.observe(viewportRef.current);
    if (measureRef.current) ro.observe(measureRef.current);
    return () => ro.disconnect();
  }, [measureOverflow, text]);

  // ---- Reset auto-play when text changes (e.g. event switch) ----
  useEffect(() => {
    hasAutoPlayedRef.current = false;
  }, [text]);

  // ---- Auto-play once ----
  useEffect(() => {
    if (!autoPlay || hasAutoPlayedRef.current || !canAnimate) return;
    hasAutoPlayedRef.current = true;
    setRunKey((k) => k + 1);
    setIsAnimating(true);
  }, [autoPlay, canAnimate]);

  // ---- Cancel stale rAF on unmount ----
  useEffect(() => {
    if (!prefersReducedMotion) return;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsAnimating(false);
  }, [prefersReducedMotion]);

  // ---- Animation end ----
  const handleAnimationEnd = useCallback(() => {
    setIsAnimating(false);
  }, []);

  // ---- Replay ----
  const replay = useCallback(() => {
    if (!canAnimate || isAnimating) return;
    rafRef.current = requestAnimationFrame(() => {
      setRunKey((k) => k + 1);
      setIsAnimating(true);
      rafRef.current = null;
    });
  }, [canAnimate, isAnimating]);

  // ---- CSS custom props ----
  const marqueeStyle = useMemo<CSSProperties>(
    () => ({
      '--marquee-shift': `-${overflowPx}px`,
      '--marquee-duration': `${marqueeDurationSec.toFixed(2)}s`,
      '--marquee-delay': '1s',
    } as CSSProperties),
    [overflowPx, marqueeDurationSec],
  );

  return {
    viewportRef,
    measureRef,
    canAnimate,
    isAnimating,
    runKey,
    marqueeStyle,
    replay,
    handleAnimationEnd,
  };
}
