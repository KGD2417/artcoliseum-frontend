import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCompare, clearCompare, onCompareChange, MAX_COMPARE } from "../utils/compareStore";

/**
 * Global floating "Compare" tray. Appears whenever the buyer has ticked artworks
 * to compare (from product or browse pages) and links to /compare.
 */
export default function CompareTray() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ids, setIds] = useState(getCompare());
  useEffect(() => onCompareChange(() => setIds(getCompare())), []);

  // Don't overlay the compare page itself.
  if (ids.length === 0 || location.pathname === "/compare") return null;

  return (
    <div style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 24, zIndex: 5000, display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderRadius: 999, background: "rgba(20,17,11,0.95)", border: "1px solid rgba(212,175,55,0.4)", boxShadow: "0 14px 40px rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em", color: "#e8e0d0" }}>
        COMPARE · {ids.length}/{MAX_COMPARE}
      </span>
      <button onClick={() => navigate("/compare")}
        style={{ padding: "8px 18px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", fontWeight: 700, cursor: "pointer" }}>
        COMPARE NOW →
      </button>
      <button onClick={() => clearCompare()} title="Clear"
        style={{ background: "transparent", border: "none", color: "rgba(200,191,160,0.6)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  );
}
