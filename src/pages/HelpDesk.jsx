import { useState } from "react";
import { motion } from "framer-motion";

const FAQS = [
  {
    q: "How is authenticity verified on Aureum?",
    a: "Every artwork is paired with a Digital Ledger Certificate that records provenance, the artist's signature, and chain-of-custody from studio to vault. Originals are physically inspected by our in-house curators before being listed.",
  },
  {
    q: "How long does white-glove delivery take?",
    a: "Domestic shipments are scheduled within 3–5 business days; international shipments typically arrive within 7–14 business days, fully insured and crated by Aureum Private Logistics.",
  },
  {
    q: "Can I view a piece in AR before purchasing?",
    a: "Yes. From any product page, tap VIEW IN AR to project the artwork onto your wall in true-to-scale fidelity using your phone or tablet camera.",
  },
  {
    q: "How do I become a featured artist?",
    a: "Visit the Artists page and select BECOME AN ARTIST. You'll be guided through portfolio submission, where our curators review work weekly. Accepted artists gain access to the Artist Portal.",
  },
  {
    q: "What payment methods do you accept?",
    a: "All major credit cards, ACH/wire transfers for acquisitions over $10,000, and select digital ledger settlements. All transactions are encrypted by the Aureum Security Protocol.",
  },
];

export default function HelpDesk() {
  const [open, setOpen] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const submit = (e) => {
    e.preventDefault();
    alert(`Ticket submitted. Our concierge will respond to ${form.email} within 24 hours.`);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section style={{ padding: "120px 24px 100px", maxWidth: 1100, margin: "0 auto" }}>
      <motion.div
        style={{ textAlign: "center", marginBottom: "56px" }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <div className="gold-rule" style={{ justifyContent: "center" }}>
          <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }} />
          <span className="grt">Concierge Support</span>
          <div className="grl" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
        </div>
        <h2 className="section-heading">
          <span className="bold-white">Help</span> <em>Desk</em>
        </h2>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }} className="help-grid">
        {/* FAQs */}
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 22 }}>FREQUENTLY ASKED</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((f, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(212,175,55,0.12)",
                  borderRadius: 8, overflow: "hidden",
                }}>
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  style={{
                    width: "100%", textAlign: "left", padding: "20px 22px", cursor: "pointer",
                    background: "transparent", border: "none", color: "#f0e8d8",
                    fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 600,
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14,
                  }}>
                  <span>{f.q}</span>
                  <span style={{ color: "#D4AF37", fontSize: 18 }}>{open === i ? "−" : "+"}</span>
                </button>
                {open === i && (
                  <div style={{ padding: "0 22px 20px", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", lineHeight: 1.7 }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* contact form */}
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 22 }}>SUBMIT A TICKET</div>
          <form onSubmit={submit} style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(212,175,55,0.15)",
            borderRadius: 12, padding: 30,
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            <input
              type="text" placeholder="Your Name" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputS}
            />
            <input
              type="email" placeholder="Email Address" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              style={inputS}
            />
            <input
              type="text" placeholder="Subject" required
              value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
              style={inputS}
            />
            <textarea
              placeholder="Describe your inquiry…" required rows={6}
              value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              style={{ ...inputS, resize: "vertical", fontFamily: "'Raleway',sans-serif" }}
            />
            <button type="submit" className="btn-gold-main" style={{ marginTop: 6 }}>SUBMIT TICKET</button>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.5)", textAlign: "center", marginTop: 4 }}>
              Average response time: under 4 hours
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .help-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

const inputS = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(212,175,55,0.2)",
  padding: "13px 16px",
  color: "#e8e0d0",
  fontFamily: "'Raleway',sans-serif",
  fontSize: 13,
  outline: "none",
  borderRadius: 6,
};
