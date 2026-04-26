import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const TABS = [
  { id: "details",  label: "Account Details" },
  { id: "orders",   label: "Order Tracking" },
  { id: "cart",     label: "Cart Items" },
  { id: "help",     label: "Help Desk" },
  { id: "notifs",   label: "Notifications" },
  { id: "language", label: "Language" },
];

const INITIAL_USER = {
  name: "Kshitij Desai",
  email: "kshitijdesai179@gmail.com",
  phone: "+91 98765 43210",
  address: "Bandra West, Mumbai, India 400050",
  password: "••••••••••",
};

const ORDERS = [
  { id: "AU-99281", item: "Solstice in Obsidian — Julian Voss",   total: "$42,500", status: "OUT FOR DELIVERY",   eta: "Expected today 6 PM" },
  { id: "AU-99244", item: "Echoes of Silence — Elara Vance",       total: "$18,400", status: "DELIVERED",          eta: "Mar 22, 2026" },
  { id: "AU-99201", item: "Structural Gravity II — Julian Marx",   total: "$12,200", status: "IN TRANSIT",         eta: "Apr 3, 2026" },
];

const CART = [
  { id: "p-101", title: "Fragmented Memory", artist: "Soren Klein", price: "$8,400", img: "src/assets/i6.png" },
  { id: "p-102", title: "Architectural Echo", artist: "Elena Vance", price: "$4,200", img: "src/assets/i3.png" },
];

const NOTIFS = [
  { type: "ORDER",      msg: "Your order #AU-99281 is out for white-glove delivery.",      time: "2h ago" },
  { type: "ARTIST",     msg: "Elena Vance just released a new collection: Renaissance Echoes.", time: "1d ago" },
  { type: "PROMO",      msg: "Early access: private viewing of The Modernists & The Muses opens Friday.", time: "3d ago" },
  { type: "REVIEW",     msg: "Tell us about Echoes of Silence — your review helps fellow collectors.", time: "1w ago" },
];

const LANGUAGES = [
  { code: "EN", label: "English"   },
  { code: "FR", label: "Français"  },
  { code: "ES", label: "Español"   },
  { code: "DE", label: "Deutsch"   },
  { code: "IT", label: "Italiano"  },
  { code: "JP", label: "日本語"    },
  { code: "HI", label: "हिन्दी"   },
];

export default function Profile() {
  const [tab, setTab] = useState("details");
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(INITIAL_USER);
  const [draft, setDraft] = useState(INITIAL_USER);
  const [language, setLanguage] = useState("EN");

  const startEdit = () => { setDraft(user); setEditing(true); };
  const save = () => { setUser(draft); setEditing(false); };

  return (
    <section style={{ padding: "100px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 40, flexWrap: "wrap" }}>
        <div style={{
          width: 78, height: 78, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))",
          border: "2px solid #D4AF37",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Cinzel',serif", fontSize: 26, fontWeight: 700, color: "#D4AF37",
          boxShadow: "0 0 28px rgba(212,175,55,0.18)",
        }}>
          {user.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
        </div>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "#D4AF37" }}>COLLECTOR PROFILE</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 700, color: "#fff", marginTop: 4 }}>{user.name}</h1>
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)" }}>{user.email}</div>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 32 }} className="profile-grid">
        {/* sidebar */}
        <aside style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(212,175,55,0.12)",
          borderRadius: 12, padding: "20px 14px", height: "fit-content",
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "12px 16px", marginBottom: 4,
                background: tab === t.id ? "rgba(212,175,55,0.10)" : "transparent",
                border: "none", borderRadius: 8, cursor: "pointer",
                fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em",
                color: tab === t.id ? "#D4AF37" : "rgba(200,191,160,0.65)",
                transition: "all 0.2s",
              }}>
              {t.label.toUpperCase()}
            </button>
          ))}
        </aside>

        {/* content */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}>

              {tab === "details" && (
                <Card title="Account Details" action={
                  editing
                    ? <button onClick={save} className="btn-gold-main" style={{ padding: "10px 22px", fontSize: 11 }}>SAVE</button>
                    : <button onClick={startEdit} className="btn-outline" style={{ padding: "10px 22px", fontSize: 11 }}>EDIT</button>
                }>
                  <Field label="Name"     value={editing ? draft.name     : user.name}     editing={editing} onChange={v => setDraft({ ...draft, name: v })} />
                  <Field label="Email"    value={editing ? draft.email    : user.email}    editing={editing} onChange={v => setDraft({ ...draft, email: v })} type="email" />
                  <Field label="Phone"    value={editing ? draft.phone    : user.phone}    editing={editing} onChange={v => setDraft({ ...draft, phone: v })} type="tel" />
                  <Field label="Address"  value={editing ? draft.address  : user.address}  editing={editing} onChange={v => setDraft({ ...draft, address: v })} />
                  <Field label="Password" value={editing ? draft.password : user.password} editing={editing} onChange={v => setDraft({ ...draft, password: v })} type="password" />
                </Card>
              )}

              {tab === "orders" && (
                <Card title="Order Tracking">
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {ORDERS.map(o => (
                      <div key={o.id} style={{
                        padding: "18px 20px",
                        border: "1px solid rgba(212,175,55,0.12)",
                        borderRadius: 8,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                          <div>
                            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", color: "#D4AF37" }}>{o.id}</div>
                            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#f0e8d8", marginTop: 4 }}>{o.item}</div>
                            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginTop: 4 }}>{o.eta}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: "#D4AF37" }}>{o.total}</div>
                            <div style={{
                              display: "inline-block", marginTop: 8, padding: "5px 12px", borderRadius: 999,
                              fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em",
                              background: o.status === "DELIVERED" ? "rgba(74,222,128,0.12)" : "rgba(212,175,55,0.12)",
                              color: o.status === "DELIVERED" ? "#4ade80" : "#D4AF37",
                              border: o.status === "DELIVERED" ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(212,175,55,0.3)",
                            }}>{o.status}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {tab === "cart" && (
                <Card title="Cart Items" action={
                  <Link to="/cart" className="btn-gold-main" style={{ padding: "10px 22px", fontSize: 11, textDecoration: "none" }}>VIEW CART</Link>
                }>
                  {CART.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: "rgba(200,191,160,0.5)" }}>Your cart is empty.</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {CART.map(c => (
                        <div key={c.id} style={{
                          display: "flex", gap: 16, alignItems: "center", padding: 14,
                          border: "1px solid rgba(212,175,55,0.1)", borderRadius: 8,
                        }}>
                          <img src={c.img} alt={c.title} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 4 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#f0e8d8" }}>{c.title}</div>
                            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", marginTop: 2 }}>{c.artist}</div>
                          </div>
                          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: "#D4AF37" }}>{c.price}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {tab === "help" && (
                <Card title="Help Desk" action={
                  <Link to="/help" className="btn-outline" style={{ padding: "10px 22px", fontSize: 11, textDecoration: "none" }}>OPEN FULL DESK</Link>
                }>
                  <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.7)", lineHeight: 1.7, marginBottom: 18 }}>
                    Need help with an order, an artwork, or your account? Our concierge team is available 24/7. Submit a ticket below or browse our FAQ.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 12 }}>
                    {[
                      { label: "Order Issue",   desc: "Track or modify an existing order" },
                      { label: "Artwork Inquiry", desc: "Authenticity, condition, provenance" },
                      { label: "Account",       desc: "Login, password, billing" },
                      { label: "General",       desc: "Anything else we can help with" },
                    ].map(c => (
                      <div key={c.label} style={{
                        padding: "16px 18px",
                        border: "1px solid rgba(212,175,55,0.12)",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em", color: "#D4AF37", marginBottom: 6 }}>{c.label.toUpperCase()}</div>
                        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.6)" }}>{c.desc}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {tab === "notifs" && (
                <Card title="Notifications">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {NOTIFS.map((n, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: 14,
                        padding: "14px 16px",
                        border: "1px solid rgba(212,175,55,0.1)",
                        borderRadius: 8,
                      }}>
                        <div style={{
                          padding: "4px 10px", borderRadius: 999,
                          fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em",
                          background: "rgba(212,175,55,0.1)", color: "#D4AF37",
                          border: "1px solid rgba(212,175,55,0.2)", flexShrink: 0,
                        }}>{n.type}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "#e8e0d0" }}>{n.msg}</div>
                          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.45)", marginTop: 4 }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {tab === "language" && (
                <Card title="Language Preferences">
                  <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.65)", marginBottom: 20 }}>
                    Choose how Aureum should appear across the site, in receipts, and in delivery communication.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => setLanguage(l.code)}
                        style={{
                          padding: "14px 18px", borderRadius: 8, cursor: "pointer",
                          background: language === l.code ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.02)",
                          border: language === l.code ? "1px solid #D4AF37" : "1px solid rgba(212,175,55,0.15)",
                          color: language === l.code ? "#D4AF37" : "#e8e0d0",
                          fontFamily: "'Raleway',sans-serif", fontSize: 14,
                          textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                        <span>{l.label}</span>
                        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", opacity: 0.6 }}>{l.code}</span>
                      </button>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function Card({ title, action, children }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(212,175,55,0.12)",
      borderRadius: 12, padding: "26px 28px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, editing, onChange, type = "text" }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 8 }}>{label.toUpperCase()}</div>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,175,55,0.2)",
            padding: "12px 14px",
            color: "#e8e0d0",
            fontFamily: "'Raleway',sans-serif", fontSize: 14,
            borderRadius: 6, outline: "none",
          }}
        />
      ) : (
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 15, color: "#f0e8d8", padding: "8px 0" }}>{value}</div>
      )}
    </div>
  );
}
