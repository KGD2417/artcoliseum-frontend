import { useEffect, useRef, useState } from "react";
import logo from "../assets/logo.png";

/**
 * Holds the site behind a branded countdown until the launch moment, then
 * auto-reveals it — no deploy or manual action needed at launch time.
 *
 *  • Active only in production builds (local `npm run dev` is never gated).
 *  • Team preview before launch: open the domain with ?preview=1 once
 *    (persists in this browser); ?preview=0 re-locks it.
 *  • Uses the backend's server time (Date header) to correct for a visitor's
 *    wrong clock, so everyone is revealed at the same real instant.
 *
 * Configure the moment with VITE_LAUNCH_AT (ISO 8601); defaults to 11:11 IST.
 */
const LAUNCH_AT = new Date(
  import.meta.env.VITE_LAUNCH_AT || "2026-06-17T11:11:00+05:30",
).getTime();

const GOLD = "#D4AF37";
const pad = (n) => String(n).padStart(2, "0");

export default function LaunchGate({ children }) {
  // One-time preview bypass via ?preview=1 (kept in localStorage for this browser).
  if (typeof window !== "undefined") {
    const p = new URLSearchParams(window.location.search).get("preview");
    if (p === "1") localStorage.setItem("coli_launch_preview", "1");
    if (p === "0") localStorage.removeItem("coli_launch_preview");
  }
  const previewing =
    typeof window !== "undefined" &&
    localStorage.getItem("coli_launch_preview") === "1";

  const gateActive = import.meta.env.PROD && !previewing && Number.isFinite(LAUNCH_AT);

  const [launched, setLaunched] = useState(!gateActive || Date.now() >= LAUNCH_AT);
  const [remaining, setRemaining] = useState(Math.max(0, LAUNCH_AT - Date.now()));
  const offsetRef = useRef(0); // serverNow - clientNow

  useEffect(() => {
    if (!gateActive || launched) return undefined;

    // Correct for the visitor's clock skew using the server's Date header
    // (non-blocking — the countdown starts immediately, then self-corrects).
    const base = import.meta.env.VITE_API_BASE || "/api";
    fetch(`${base}/health`, { cache: "no-store" })
      .then((r) => {
        const d = r.headers.get("date");
        if (d) offsetRef.current = new Date(d).getTime() - Date.now();
      })
      .catch(() => {});

    const tick = () => {
      const rem = LAUNCH_AT - (Date.now() + offsetRef.current);
      setRemaining(Math.max(0, rem));
      if (rem <= 0) setLaunched(true);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [gateActive, launched]);

  if (launched) return children;

  const s = Math.floor(remaining / 1000);
  const days = Math.floor(s / 86400);
  const units = [
    ...(days > 0 ? [[days, "DAYS"]] : []),
    [Math.floor((s % 86400) / 3600), "HOURS"],
    [Math.floor((s % 3600) / 60), "MINUTES"],
    [s % 60, "SECONDS"],
  ];

  return (
    <div
      style={{
        minHeight: "100vh", background: "radial-gradient(ellipse at 50% 30%, #14100a 0%, #080808 70%)",
        color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "40px 24px", gap: 26,
      }}>
      <img src={logo} alt="Art Coliseum" style={{ width: 96, height: "auto", opacity: 0.95 }} />
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.4em", color: GOLD }}>
        ARRT COLISEUM
      </div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(34px,6vw,68px)", lineHeight: 1.05, margin: 0 }}>
        A new era in art <br /> is about to <em style={{ color: GOLD, fontStyle: "italic" }}>open</em>
      </h1>
      <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 15, color: "rgba(200,191,160,0.7)", maxWidth: 540, lineHeight: 1.7, margin: 0 }}>
        Timeless and priceless art, at your space. We open our doors at <strong style={{ color: GOLD }}>11:11 AM</strong>.
      </p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
        {units.map(([v, l]) => (
          <div key={l} style={{
            minWidth: 84, padding: "16px 12px", borderRadius: 12,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.25)",
          }}>
            <div className="num-value" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 44, fontWeight: 700, color: GOLD, lineHeight: 1 }}>
              {pad(v)}
            </div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: "0.2em", color: "rgba(200,191,160,0.6)", marginTop: 8 }}>
              {l}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.22em", color: "rgba(200,191,160,0.4)", marginTop: 18 }}>
        OPENING 11:11 AM IST · 17 JUNE 2026
      </div>
    </div>
  );
}
