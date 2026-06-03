import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets scroll to the top of the page on every route change, so navigating to a
 * new page never lands you halfway down where the previous page was scrolled.
 * Rendered once inside the router (Layout).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // `instant` avoids a jarring animated scroll on route change.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
