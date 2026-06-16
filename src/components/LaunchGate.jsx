import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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

// A few floating motes of gold light — cheap, GPU-friendly ambience.
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 61) % 100,
  size: 2 + ((i * 7) % 4),
  delay: (i % 8) * 0.7,
  dur: 9 + (i % 6) * 2,
  drift: (i % 2 ? 1 : -1) * (10 + (i % 5) * 6),
}));

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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const offsetRef = useRef(0); // serverNow - clientNow

  useEffect(() => {
    if (!gateActive || launched) return undefined;
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

  // Subtle parallax — the content gently tilts toward the cursor (pseudo-3D).
  const onMove = (e) => {
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    setTilt({ x: (e.clientY - cy) / cy * -4, y: (e.clientX - cx) / cx * 4 });
  };

  return (
    <div
      onMouseMove={onMove}
      style={{
        position: "relative", minHeight: "100vh", overflow: "hidden",
        background: "radial-gradient(ellipse at 50% 28%, #181206 0%, #0a0805 55%, #050505 100%)",
        color: "#fff", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "40px 24px",
        perspective: 1000,
      }}>

      {/* Pulsing ambient glow */}
      <motion.div aria-hidden style={{
        position: "absolute", top: "20%", left: "50%", width: 760, height: 760, marginLeft: -380,
        borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0) 65%)",
      }} animate={{ opacity: [0.5, 0.9, 0.5], scale: [0.95, 1.08, 0.95] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />

      {/* Slow-rotating conic ring (coliseum halo) */}
      <motion.div aria-hidden style={{
        position: "absolute", top: "calc(28% - 230px)", left: "50%", width: 460, height: 460, marginLeft: -230,
        borderRadius: "50%", pointerEvents: "none", opacity: 0.25,
        background: "conic-gradient(from 0deg, transparent, rgba(212,175,55,0.5), transparent 40%)",
        maskImage: "radial-gradient(circle, transparent 60%, #000 61%, #000 70%, transparent 72%)",
        WebkitMaskImage: "radial-gradient(circle, transparent 60%, #000 61%, #000 70%, transparent 72%)",
      }} animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }} />

      {/* Floating gold motes */}
      {PARTICLES.map((p, i) => (
        <motion.span key={i} aria-hidden style={{
          position: "absolute", bottom: -10, left: `${p.left}%`, width: p.size, height: p.size,
          borderRadius: "50%", background: GOLD, boxShadow: `0 0 ${p.size * 3}px ${GOLD}`, pointerEvents: "none",
        }} animate={{ y: [-0, -window.innerHeight * 0.9], x: [0, p.drift, 0], opacity: [0, 0.8, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      {/* Content (parallax tilt) */}
      <motion.div
        style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, transformStyle: "preserve-3d" }}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }} transition={{ type: "spring", stiffness: 60, damping: 18 }}>
        <motion.img src={logo} alt="Art Coliseum" style={{ width: 104, height: "auto" }}
          initial={{ opacity: 0, y: 18, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />

        <motion.div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.4em", color: GOLD }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25, duration: 0.8 }}>
          ARRT COLISEUM
        </motion.div>

        <motion.h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(34px,6vw,72px)", lineHeight: 1.04, margin: 0 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
          A new era in art <br /> is about to{" "}
          <em style={{
            fontStyle: "italic",
            background: "linear-gradient(110deg, #8a6d1f 0%, #f4e0a0 35%, #fff7df 50%, #f4e0a0 65%, #8a6d1f 100%)",
            backgroundSize: "200% auto", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            animation: "coli-shimmer 3.5s linear infinite",
          }}>open</em>
        </motion.h1>

        <motion.p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 15, color: "rgba(200,191,160,0.7)", maxWidth: 560, lineHeight: 1.7, margin: 0 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
          Timeless and priceless art, at your space. We open our doors at{" "}
          <strong style={{ color: GOLD }}>11:11 AM</strong>.
        </motion.p>

        <motion.div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }}>
          {units.map(([v, l]) => (
            <div key={l} style={{
              minWidth: 92, padding: "18px 14px", borderRadius: 14,
              background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
              border: "1px solid rgba(212,175,55,0.28)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.5)",
            }}>
              <div style={{ height: 48, overflow: "hidden", position: "relative" }}>
                <motion.div key={`${l}-${v}`} className="num-value"
                  initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 46, fontWeight: 700, color: GOLD, lineHeight: "48px" }}>
                  {pad(v)}
                </motion.div>
              </div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: "0.2em", color: "rgba(200,191,160,0.6)", marginTop: 8 }}>{l}</div>
            </div>
          ))}
        </motion.div>

        <motion.div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.22em", color: "rgba(200,191,160,0.4)", marginTop: 18 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.8 }}>
          OPENING 11:11 AM IST · 17 JUNE 2026
        </motion.div>
      </motion.div>

      <style>{`@keyframes coli-shimmer { to { background-position: 200% center; } }`}</style>
    </div>
  );
}
