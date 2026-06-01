import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "../components/SafeImage";
import { useLocale } from "../context/Locale";
import { useAuth } from "../context/Auth";
import { api } from "../utils/api";

const FULFILLMENTS = [
  { id: "transport_setup", label: "Transport + Installation", desc: "White-glove delivery and on-site setup" },
  { id: "transport_only", label: "Transport only", desc: "We deliver; you install it yourself" },
  { id: "self_pickup", label: "Self-pickup", desc: "Collect from our vault — no transport fee" },
];

export default function Cart() {
  const navigate = useNavigate();
  const { formatPrice } = useLocale();
  const { user, loading } = useAuth();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => api.cart.breakdown().then(setData).catch(() => setData(null));

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/signin"); return; }
    refresh();
  }, [user, loading]);

  const setFulfillment = async (id, fulfillment) => {
    setBusy(true);
    try { setData(await api.cart.updateItem(id, fulfillment)); } finally { setBusy(false); }
  };
  const remove = async (id) => {
    setBusy(true);
    try { setData(await api.cart.removeItem(id)); } finally { setBusy(false); }
  };

  const items = data?.items || [];

  return (
    <section style={{ padding: "100px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ marginBottom: 38 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 8 }}>YOUR CART</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 56, fontWeight: 700, color: "#fff", lineHeight: 1.05 }}>
          Your Acquisitions
        </h1>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)", marginTop: 10 }}>
          {items.length} {items.length === 1 ? "piece" : "pieces"} approved & ready
        </p>
      </motion.div>

      {items.length === 0 ? (
        <div style={{ padding: "80px 30px", textAlign: "center", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 12 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: "#fff", marginBottom: 14 }}>Your cart is empty</div>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)", marginBottom: 26 }}>
            Enquire on a piece — once a curator approves your purchase, it appears here.
          </p>
          <Link to="/gallery" className="btn-gold-main" style={{ textDecoration: "none", padding: "14px 30px", fontSize: 12 }}>
            BROWSE COLLECTION
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 36 }} className="cart-grid">
          <div>
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.id} layout initial={{ opacity: 1 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }}
                  style={{ padding: 20, marginBottom: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 8 }}>
                  <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
                    <SafeImage src={item.image} alt={item.title}
                      style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)" }}>{(item.artist_name || "").toUpperCase()}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: "#fff", marginTop: 4 }}>{item.title}</div>
                      <button onClick={() => remove(item.id)} disabled={busy}
                        style={{ background: "transparent", border: "none", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "#D4AF37", marginTop: 10, padding: 0 }}>REMOVE</button>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="num-value" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: "#D4AF37" }}>
                        {formatPrice(item.line_total)}
                      </div>
                      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(200,191,160,0.45)", marginTop: 2 }}>
                        incl. delivery
                      </div>
                    </div>
                  </div>

                  {/* Fulfillment choice */}
                  <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {FULFILLMENTS.map(f => {
                      const active = item.fulfillment === f.id;
                      return (
                        <button key={f.id} onClick={() => setFulfillment(item.id, f.id)} disabled={busy}
                          style={{
                            textAlign: "left", padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                            background: active ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.02)",
                            border: `1px solid ${active ? "#D4AF37" : "rgba(212,175,55,0.18)"}`,
                          }}>
                          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: "0.1em", color: active ? "#D4AF37" : "#e8e0d0" }}>{f.label}</div>
                          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(200,191,160,0.5)", marginTop: 3, lineHeight: 1.4 }}>{f.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                  {/* per-item line breakdown */}
                  <div style={{ marginTop: 12, display: "flex", gap: 18, fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)" }}>
                    <span>Artwork {formatPrice(item.artwork_price)}</span>
                    <span>Transport {item.transport_cost ? formatPrice(item.transport_cost) : "—"}</span>
                    <span>Setup {item.setup_cost ? formatPrice(item.setup_cost) : "—"}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* summary */}
          <div style={{ height: "fit-content", padding: 28, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 12, position: "sticky", top: 100 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 18 }}>PRICE BREAKDOWN</div>
            <SumRow label="Artwork subtotal" value={formatPrice(data.artwork_subtotal)} />
            <SumRow label="Transportation" value={data.transport_subtotal ? formatPrice(data.transport_subtotal) : "—"} />
            <SumRow label="Installation / setup" value={data.setup_subtotal ? formatPrice(data.setup_subtotal) : "—"} />
            <div style={{ height: 1, background: "rgba(212,175,55,0.18)", margin: "8px 0 18px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22, alignItems: "baseline" }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", color: "#fff" }}>TOTAL</span>
              <span className="num-value" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: "#D4AF37" }}>{formatPrice(data.total)}</span>
            </div>
            <motion.button
              onClick={() => navigate("/checkout")}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.2em", border: "none", borderRadius: 999, cursor: "pointer", boxShadow: "0 8px 24px rgba(212,175,55,0.25)", marginBottom: 12 }}>
              PROCEED TO CHECKOUT →
            </motion.button>
            <Link to="/gallery" style={{ display: "block", textAlign: "center", padding: "12px", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "rgba(200,191,160,0.7)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 999, textDecoration: "none" }}>CONTINUE BROWSING</Link>
          </div>
        </div>
      )}

      <style>{`@media (max-width: 900px){.cart-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

function SumRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)" }}>
      <span>{label}</span>
      <span className="num-value" style={{ color: "#e8e0d0" }}>{value}</span>
    </div>
  );
}
