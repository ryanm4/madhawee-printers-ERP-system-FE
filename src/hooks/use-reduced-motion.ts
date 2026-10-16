'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribes to a CSS media query from React.
 *
 * Built on useSyncExternalStore rather than useEffect + setState: a media query
 * is external state React should subscribe to, and reading it through a
 * snapshot avoids both the extra render after mount and a hydration mismatch.
 *
 * The server cannot evaluate a media query, so getServerSnapshot reports false
 * and anything gated on this mounts after hydration. That is only safe for
 * decoration — never gate content or behaviour on it.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/**
 * Whether the viewer has asked for reduced motion.
 *
 * CSS handles this for anything driven by keyframes. This hook is for what CSS
 * cannot reach — a WebGL canvas running its own animation loop, which has to be
 * told not to mount at all.
 *
 * Assuming motion is fine before hydration matches CSS's own default.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
