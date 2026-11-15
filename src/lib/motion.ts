/**
 * Motion entry point. Runs on every page load (including after
 * view-transition navigations).
 *
 * Phase 3 fills this in: Lenis smooth scroll, SplitText headline
 * reveals, the pinned project card stack, DrawSVG underlines and
 * draggable stickers. Elements opt in with data attributes, e.g.
 *   data-reveal         → fade/slide in on scroll
 *   data-split          → split headline into lines and reveal
 *   data-card-stack     → pinned stacking cards container
 */

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initMotion() {
  if (prefersReducedMotion()) return;
  // Phase 3 starts here.
}
