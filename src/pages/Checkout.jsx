import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import { useLocale } from "../context/Locale";
import { CopyIcon } from "../components/Icons";
import i1 from "../assets/i1.png";
import i6 from "../assets/i6.png";

const INITIAL_ITEMS = [
  { id: "ev-1", artist: "ELARA VANCE", title: "Echoes of Silence, 2023", desc: "Mixed Media on Canvas, 120 x 150 cm", price: 18400, img: i1 },
  { id: "jm-2", artist: "JULIAN MARX", title: "Structural Gravity II",   desc: "Carrara Marble and Polished Brass",   price: 12200, img: i6 },
];

const TIMELINE = [
  { state: "done",    label: "ACQUISITION CONFIRMED",        time: "Sept 12, 2024 — 09:14 AM" },
  { state: "done",    label: "CURATION & CRATING COMPLETE",  time: "Sept 13, 2024 — 02:30 PM" },
  { state: "done",    label: "DISPATCHED VIA GLOBAL EXPRESS", time: "Sept 14, 2024 — 11:00 AM" },
  { state: "active",  label: "OUT FOR WHITE GLOVE DELIVERY",  time: "Expected: Today by 6:00 PM" },
  { state: "pending", label: "FINAL INSTALLATION",            time: "Estimated Sept 16, 2024" },
];

const HISTORY_LOG = [
  { time: "Sept 12, 2024 — 09:14 AM", title: "Acquisition Confirmed",        detail: "Order #AU-99281 received. Payment authorised via Aureum Settlement Protocol." },
  { time: "Sept 12, 2024 — 11:42 AM", title: "Curator Assigned",              detail: "Senior curator Marcel Vidal assigned to oversee crating and shipment." },
  { time: "Sept 13, 2024 — 09:08 AM", title: "Condition Report Issued",       detail: "Pre-shipment condition photographs added to digital ledger certificate." },
  { time: "Sept 13, 2024 — 02:30 PM", title: "Curation & Crating Complete",   detail: "Climate-controlled crate sealed at our New York vault." },
  { time: "Sept 14, 2024 — 06:18 AM", title: "Customs Cleared",                detail: "Export documentation filed and approved." },
  { time: "Sept 14, 2024 — 11:00 AM", title: "Dispatched via Global Express",  detail: "Handed to Aureum Private Logistics. Tracking ID: AUR-7729-BMX-01." },
  { time: "Today — 08:42 AM",         title: "Arrived at Local Hub",           detail: "Final mile dispatch scheduled for white-glove team." },
  { time: "Today — Now",              title: "Out for White-Glove Delivery",   detail: "Expected delivery by 6:00 PM. Installation team in transit." },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { formatPrice } = useLocale();
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [code, setCode] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const fmt = (n) => formatPrice(n, { decimals: 2 });

  const subtotal = items.reduce((s, i) => s + i.price, 0);
  const delivery = 850;
  const insurance = 320;
  const total = subtotal + delivery + insurance;

  const remove = (id) => setItems(items.filter(i => i.id !== id));
  const settle = () => {
    alert(`Settlement initiated for ${fmt(total)}. You'll receive confirmation by email.`);
    navigate("/profile");
  };

  return (
    <section style={{ padding: "100px 24px 80px", maxWidth: 1280, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: 56 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 56, fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 16 }}>
          Curation &amp; Fulfillment
        </h1>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.6)", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
          Review your selected masterpieces and track their journey from our vault to your collection.
        </p>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 36 }} className="ck-grid">
        {/* left side */}
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 22 }}>SELECTED ARTWORKS</div>

          <div>
            {items.map((it, i) => (
              <div key={it.id} style={{
                display: "flex", gap: 22, alignItems: "center",
                padding: "20px 0",
                borderBottom: i !== items.length - 1 ? "1px solid rgba(212,175,55,0.15)" : "none",
              }}>
                <SafeImage src={it.img} alt={it.title}
                  style={{ width: 92, height: 92, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)" }}>{it.artist}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: "#fff", marginTop: 4 }}>{it.title}</div>
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginTop: 4 }}>{it.desc}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="num-value" style={{ fontFamily: "'Raleway',sans-serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>{formatPrice(it.price)}</div>
                  <button
                    onClick={() => remove(it.id)}
                    style={{
                      background: "transparent", border: "none", cursor: "pointer",
                      fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em",
                      color: "#D4AF37", marginTop: 6,
                    }}>REMOVE</button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: "rgba(200,191,160,0.5)" }}>
                Your cart is empty.
              </div>
            )}
          </div>

          {/* summary */}
          <div style={{
            marginTop: 30, padding: 28,
            border: "1px solid rgba(212,175,55,0.18)",
            borderRadius: 8,
          }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 18 }}>ACQUISITION SUMMARY</div>

            <Row label="Subtotal"           value={fmt(subtotal)} />
            <Row label="White Glove Delivery" value={fmt(delivery)} />
            <Row label="Insurance (Valuation)" value={fmt(insurance)} />

            <div style={{ height: 1, background: "rgba(212,175,55,0.18)", margin: "16px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>Total Investment</span>
              <span className="num-value" style={{ fontFamily: "'Raleway',sans-serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>{fmt(total)}</span>
            </div>

            <input
              value={code} onChange={e => setCode(e.target.value)}
              placeholder="GIFT CODE OR COLLECTOR ID"
              style={{
                width: "100%", padding: "12px 0",
                background: "transparent", border: "none",
                borderBottom: "1px solid rgba(212,175,55,0.25)",
                color: "#e8e0d0", outline: "none",
                fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em",
                marginBottom: 24,
              }}
            />

            <motion.button
              onClick={settle}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                width: "100%", padding: "16px",
                background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                color: "#111", fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.2em",
                border: "none", borderRadius: 999, cursor: "pointer",
                boxShadow: "0 8px 24px rgba(212,175,55,0.25)",
              }}>PROCEED TO SECURE SETTLEMENT</motion.button>

            <div style={{ textAlign: "center", marginTop: 14, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(200,191,160,0.4)" }}>
              ENCRYPTED BY AUREUM SECURITY PROTOCOL
            </div>
          </div>
        </div>

        {/* right — shipment */}
        <div style={{
          padding: "30px 28px",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: 12, height: "fit-content",
          background: "rgba(255,255,255,0.02)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37" }}>ACTIVE SHIPMENT</span>
            <span style={{
              padding: "5px 12px", borderRadius: 999,
              fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em",
              background: "rgba(212,175,55,0.1)",
              border: "1px solid rgba(212,175,55,0.3)",
              color: "#D4AF37",
            }}>IN TRANSIT</span>
          </div>

          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 26 }}>Order #AU-99281</h2>

          {/* timeline */}
          <div style={{ position: "relative", marginBottom: 28 }}>
            {TIMELINE.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i !== TIMELINE.length - 1 ? 22 : 0, position: "relative" }}>
                {i !== TIMELINE.length - 1 && (
                  <div style={{
                    position: "absolute", left: 11, top: 24, bottom: 0, width: 1,
                    background: t.state === "done" ? "#D4AF37" : "rgba(212,175,55,0.2)",
                  }} />
                )}
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: t.state === "done" || t.state === "active" ? "#D4AF37" : "rgba(212,175,55,0.15)",
                  color: t.state === "done" || t.state === "active" ? "#111" : "rgba(200,191,160,0.4)",
                  fontSize: 10, fontWeight: 700,
                  boxShadow: t.state === "active" ? "0 0 0 4px rgba(212,175,55,0.2)" : "none",
                }}>{t.state === "done" ? "✓" : t.state === "active" ? "●" : ""}</div>
                <div>
                  <div style={{
                    fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em",
                    color: t.state === "active" ? "#D4AF37" : t.state === "done" ? "#e8e0d0" : "rgba(200,191,160,0.45)",
                  }}>{t.label}</div>
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.5)", marginTop: 4 }}>{t.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "rgba(212,175,55,0.18)", margin: "0 0 22px" }} />

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", color: "rgba(200,191,160,0.55)", marginBottom: 6 }}>TRACKING ID</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="num-value" style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "#D4AF37", letterSpacing: "0.1em" }}>AUR-7729-BMX-01</div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText("AUR-7729-BMX-01");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                title="Copy tracking ID"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "#D4AF37", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em",
                }}>
                <CopyIcon size={14} />{copied && <span>COPIED</span>}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", color: "rgba(200,191,160,0.55)", marginBottom: 6 }}>COURIER</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "#e8e0d0", letterSpacing: "0.12em" }}>AUREUM PRIVATE LOGISTICS</div>
          </div>

          <button
            onClick={() => setHistoryOpen(true)}
            style={{
              width: "100%", padding: "13px",
              background: "transparent", border: "1px solid rgba(212,175,55,0.3)",
              color: "#e8e0d0", fontFamily: "'Cinzel',serif",
              fontSize: 11, letterSpacing: "0.18em",
              borderRadius: 6, cursor: "pointer",
            }}>VIEW DETAILED HISTORY</button>
        </div>
      </div>

      {/* HISTORY MODAL */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setHistoryOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 5000,
              background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 24, overflowY: "auto",
            }}>
            <motion.div
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              style={{
                background: "#0e0c0a",
                border: "1px solid rgba(212,175,55,0.25)",
                borderRadius: 14,
                padding: "32px 32px 28px",
                width: "100%", maxWidth: 640,
                boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 6 }}>SHIPMENT HISTORY</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: "#fff" }}>Order #AU-99281</div>
                </div>
                <button
                  onClick={() => setHistoryOpen(false)}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "transparent", border: "1px solid rgba(212,175,55,0.25)",
                    color: "#D4AF37", cursor: "pointer", fontSize: 16,
                  }}>×</button>
              </div>

              <div style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: 4 }}>
                {HISTORY_LOG.map((h, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 14,
                    paddingBottom: i !== HISTORY_LOG.length - 1 ? 18 : 0,
                    position: "relative",
                  }}>
                    {i !== HISTORY_LOG.length - 1 && (
                      <div style={{
                        position: "absolute", left: 5, top: 18, bottom: 0,
                        width: 1, background: "rgba(212,175,55,0.2)",
                      }} />
                    )}
                    <div style={{
                      width: 12, height: 12, borderRadius: "50%",
                      background: i === HISTORY_LOG.length - 1 ? "#D4AF37" : "rgba(212,175,55,0.45)",
                      flexShrink: 0, marginTop: 6,
                      boxShadow: i === HISTORY_LOG.length - 1 ? "0 0 0 4px rgba(212,175,55,0.18)" : "none",
                    }} />
                    <div style={{ flex: 1 }}>
                      <div className="num-value" style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", letterSpacing: "0.05em" }}>{h.time}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 600, color: "#fff", marginTop: 3 }}>{h.title}</div>
                      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.65)", lineHeight: 1.6, marginTop: 4 }}>{h.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(212,175,55,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)" }}>
                <span>Logged events: <span className="num-value" style={{ color: "#D4AF37" }}>{HISTORY_LOG.length}</span></span>
                <span>Tracking · <span className="num-value" style={{ color: "#D4AF37" }}>AUR-7729-BMX-01</span></span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 900px) {
          .ck-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0",
                  fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)" }}>
      <span>{label}</span><span style={{ color: "#e8e0d0" }}>{value}</span>
    </div>
  );
}
