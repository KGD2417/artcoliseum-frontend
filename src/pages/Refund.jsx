import { motion } from "framer-motion";

const SECTIONS = [
  {
    title: "Eligibility Window",
    body: "Acquisitions may be returned within 14 calendar days of delivery, provided the artwork remains in its original packaging and shows no signs of installation, hanging, or environmental exposure beyond unpacking.",
  },
  {
    title: "Initiating a Return",
    body: "To begin a refund, contact your dedicated curator via the Help Desk or write to returns@aureum.gallery with your order ID (e.g., AU-99281). Our concierge will arrange a complimentary white-glove pickup within 3 business days.",
  },
  {
    title: "Refund Processing",
    body: "Once the artwork is received and inspected at our vault, refunds are issued to the original payment method within 7 business days. Insurance and white-glove delivery fees on the original order are non-refundable.",
  },
  {
    title: "Final Sale Items",
    body: "Commissioned works, auction acquisitions, and pieces marked AVAILABLE AT AUCTION are considered final sale and are not eligible for refund. These will be clearly indicated at checkout.",
  },
  {
    title: "Damaged in Transit",
    body: "If your acquisition arrives damaged, photograph the packaging and the artwork immediately and contact us within 48 hours. A full refund or replacement will be issued at no cost — our Aureum Guarantee covers all transit risk.",
  },
];

export default function Refund() {
  return (
    <section style={{ padding: "120px 24px 100px", maxWidth: 900, margin: "0 auto" }}>
      <motion.div
        style={{ textAlign: "center", marginBottom: "60px" }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <div className="gold-rule" style={{ justifyContent: "center" }}>
          <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }} />
          <span className="grt">Buyer Protection</span>
          <div className="grl" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
        </div>
        <h2 className="section-heading">
          <span className="bold-white">Refund</span> <em>Policy</em>
        </h2>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.6)", maxWidth: 560, margin: "16px auto 0", lineHeight: 1.7 }}>
          Every Aureum acquisition is backed by our 14-day collector confidence guarantee. The terms below explain how returns and refunds are processed.
        </p>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {SECTIONS.map(({ title, body }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(212,175,55,0.12)",
              borderRadius: 8, padding: "28px 30px",
            }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, color: "#f0e8d8", marginBottom: 12 }}>{title}</h3>
            <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.7)", lineHeight: 1.75 }}>{body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
