import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "../components/SafeImage";
import i1 from "../assets/i1.png";
import i4 from "../assets/i4.png";
import i6 from "../assets/i6.png";

const INITIAL_CART = [
  { id: "p-101", title: "Solstice in Obsidian", artist: "Julian Voss",  desc: "Oil & 24k Gold on Linen, 180 x 140 cm", img: i4 },
  { id: "p-102", title: "Echoes of Silence",    artist: "Elara Vance",  desc: "Mixed Media on Canvas, 120 x 150 cm",   img: i1 },
  { id: "p-103", title: "Fragmented Memory",    artist: "Soren Klein",  desc: "Plaster and Light Installation",         img: i6 },
];

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(INITIAL_CART);

  const remove = (id) => setCart(cart.filter(i => i.id !== id));

  return (
    <section style={{ padding: "100px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ marginBottom: 38 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 8 }}>YOUR ENQUIRIES</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 56, fontWeight: 700, color: "#fff", lineHeight: 1.05 }}>
          Saved Works
        </h1>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)", marginTop: 10 }}>
          {cart.length} {cart.length === 1 ? "piece" : "pieces"} held for enquiry
        </p>
      </motion.div>

      {cart.length === 0 ? (
        <div style={{
          padding: "80px 30px", textAlign: "center",
          border: "1px solid rgba(212,175,55,0.15)",
          borderRadius: 12,
        }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: "#fff", marginBottom: 14 }}>No saved works yet</div>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)", marginBottom: 26 }}>
            Discover masterpieces curated by our specialist team.
          </p>
          <Link to="/categories" className="btn-gold-main" style={{ textDecoration: "none", padding: "14px 30px", fontSize: 12 }}>
            BROWSE MARKETPLACE
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 36 }} className="cart-grid">
          <div>
            <AnimatePresence>
              {cart.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: "flex", gap: 22, alignItems: "center",
                    padding: 20, marginBottom: 14,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(212,175,55,0.12)",
                    borderRadius: 8,
                  }}>
                  <SafeImage src={item.img} alt={item.title}
                    style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)" }}>{item.artist.toUpperCase()}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: "#fff", marginTop: 4 }}>{item.title}</div>
                    <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginTop: 4 }}>{item.desc}</div>

                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
                      <button
                        onClick={() => remove(item.id)}
                        style={{
                          background: "transparent", border: "none", cursor: "pointer",
                          fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em",
                          color: "#D4AF37",
                        }}>REMOVE</button>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", fontWeight: 600, color: "#D4AF37" }}>ENQUIRE →</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* summary */}
          <div style={{
            height: "fit-content",
            padding: 28,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(212,175,55,0.18)",
            borderRadius: 12,
          }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 18 }}>ENQUIRY SUMMARY</div>

            <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", lineHeight: 1.7, marginBottom: 22 }}>
              Send a single enquiry for all saved works. Our curator will respond within 24 hours with availability, provenance details, and viewing arrangements.
            </p>

            <div style={{ height: 1, background: "rgba(212,175,55,0.18)", margin: "0 0 22px" }} />

            <motion.button
              onClick={() => navigate("/checkout")}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{
                width: "100%", padding: "16px",
                background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                color: "#111", fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.2em",
                border: "none", borderRadius: 999, cursor: "pointer",
                boxShadow: "0 8px 24px rgba(212,175,55,0.25)", marginBottom: 12,
              }}>SEND ENQUIRY FOR ALL</motion.button>

            <Link to="/categories" style={{
              display: "block", textAlign: "center", padding: "12px",
              fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em",
              color: "rgba(200,191,160,0.7)",
              border: "1px solid rgba(212,175,55,0.18)", borderRadius: 999,
              textDecoration: "none",
            }}>CONTINUE BROWSING</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
