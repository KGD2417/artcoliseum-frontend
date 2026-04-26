import { motion } from "framer-motion";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide directly when creating an account, completing a purchase, contacting our concierge team, or subscribing to our newsletter. This includes your name, email address, postal address, phone number, and payment details.",
  },
  {
    title: "2. How We Use Your Information",
    body: "Aureum uses your information to process acquisitions, deliver authenticated artworks, send important account notifications, provide tailored curation suggestions, and protect against fraud. We never sell your data to third parties.",
  },
  {
    title: "3. Data Storage & Security",
    body: "All transaction and personal data is encrypted in transit using TLS 1.3 and stored at rest in SOC-2 compliant infrastructure. Payment instruments are tokenized through our PCI-DSS certified payment processor and are never stored on our servers in raw form.",
  },
  {
    title: "4. Cookies & Tracking",
    body: "We use first-party cookies to remember your session, preferred language, and curation history. Optional analytics cookies help us understand which collections resonate with collectors. You may opt out at any time from your account settings.",
  },
  {
    title: "5. Your Rights",
    body: "You have the right to access, correct, export, or permanently delete your personal data. To exercise these rights, write to privacy@aureum.gallery — we will respond within 30 days.",
  },
  {
    title: "6. Contact",
    body: "Questions about this policy may be directed to our Data Protection Officer at privacy@aureum.gallery or by post to 123 Museum Mile, New York, NY 10028.",
  },
];

export default function PrivacyPolicy() {
  return (
    <section style={{ padding: "120px 24px 100px", maxWidth: 900, margin: "0 auto" }}>
      <motion.div
        style={{ textAlign: "center", marginBottom: "60px" }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <div className="gold-rule" style={{ justifyContent: "center" }}>
          <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }} />
          <span className="grt">Legal</span>
          <div className="grl" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
        </div>
        <h2 className="section-heading">
          <span className="bold-white">Privacy</span> <em>Policy</em>
        </h2>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.55)", marginTop: 12 }}>
          Last updated: January 2026
        </p>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
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
