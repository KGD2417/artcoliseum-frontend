import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../utils/api";

// A stable anonymous id so a visitor's page views group into one journey,
// persisted across reloads (and upgraded with the user_id server-side once
// they sign in).
function sessionId() {
  try {
    let id = localStorage.getItem("coli_sid");
    if (!id) {
      id =
        (crypto?.randomUUID?.() ||
          `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem("coli_sid", id);
    }
    return id;
  } catch {
    return null;
  }
}

/**
 * Records every client-side route change as a page view. IP, geo and device
 * are captured server-side. Renders nothing.
 */
export default function VisitTracker() {
  const location = useLocation();
  const prevPath = useRef(
    typeof document !== "undefined" ? document.referrer || null : null,
  );

  useEffect(() => {
    const path = location.pathname + (location.search || "");
    api.track.view({
      path,
      referrer: prevPath.current,
      session_id: sessionId(),
    });
    prevPath.current = path;
  }, [location.pathname, location.search]);

  return null;
}
