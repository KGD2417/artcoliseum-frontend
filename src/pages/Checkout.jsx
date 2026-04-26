import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const INITIAL_ITEMS = [
  { id: "ev-1", artist: "ELARA VANCE",  title: "Echoes of Silence, 2023",     desc: "Mixed Media on Canvas, 120 x 150 cm", price: 18400, img: "src/assets/i1.png" },
  { id: "jm-2", artist: "JULIAN MARX",  title: "Structural Gravity II",       desc: "Carrara Marble and Polished Brass",   price: 12200, img: "src/assets/i6.png" },
];

const TIMELINE = [
  { state: "done",    label: "ACQUISITION CONFIRMED",      time: "Sept 12, 2024 — 09:14 AM" },
  { state: "done",    label: "CURATION & CRATING COMPLETE", time: "Sept 13, 2024 — 02:30 PM" },
  { state: "done",    label: "DISPATCHED VIA GLOBAL EXPRESS", time: "Sept 14, 2024 — 11:00 AM" },
  { state: "active",  label: "OUT FOR WHITE GLOVE DELIVERY", time: "Expected: Today by 6:00 PM" },
  { state: "pending", label: "FINAL INSTALLATION",          time: "Estimated Sept 16, 2024" },
];

const fmt = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Checkout() {
  const navigate = useNavigate();
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [code, setCode] = useState("");

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
                <img src={it.img} alt={it.title}
                  style={{ width: 92, height: 92, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)" }}>{it.artist}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: "#fff", marginTop: 4 }}>{it.title}</div>
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginTop: 4 }}>{it.desc}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: "#fff" }}>${it.price.toLocaleString()}</div>
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
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: "#fff" }}>{fmt(total)}</span>
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
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, color: "#D4AF37", letterSpacing: "0.1em" }}>AUR-7729-BMX-01</div>
              <span style={{ color: "#D4AF37", cursor: "pointer" }}>📋</span>
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", color: "rgba(200,191,160,0.55)", marginBottom: 6 }}>COURIER</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "#e8e0d0", letterSpacing: "0.12em" }}>AUREUM PRIVATE LOGISTICS</div>
          </div>

          <button style={{
            width: "100%", padding: "13px",
            background: "transparent", border: "1px solid rgba(212,175,55,0.3)",
            color: "#e8e0d0", fontFamily: "'Cinzel',serif",
            fontSize: 11, letterSpacing: "0.18em",
            borderRadius: 6, cursor: "pointer",
          }}>VIEW DETAILED HISTORY</button>
        </div>
      </div>

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
