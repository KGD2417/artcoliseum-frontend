/**
 * Responsive breakpoint hooks built on window.matchMedia.
 *
 * Standard breakpoints for the whole app:
 *   mobile  ≤ 640px
 *   tablet  641–1024px
 *   desktop > 1024px
 *
 * Usage:
 *   const isMobile = useIsMobile();
 *   const isNarrow = useMediaQuery("(max-width: 900px)");
 */
import { useEffect, useState } from "react";

export function useMediaQuery(query) {
  const get = () =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(get);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    // addEventListener is the modern API; addListener is the Safari < 14 fallback.
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);

  return matches;
}

export const useIsMobile = () => useMediaQuery("(max-width: 640px)");
export const useIsTablet = () => useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
export const useIsTabletOrBelow = () => useMediaQuery("(max-width: 1024px)");

export default useIsMobile;
