import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
const LOREM_FEATURES = [
  "Lorem ipsum dolor sit amet consectetur adipiscing elit",
  "Sed do eiusmod tempor incididunt ut labore et dolore magna",
  "Ut enim ad minim veniam quis nostrud exercitation ullamco",
  "Duis aute irure dolor in reprehenderit in voluptate velit",
];

const PAGE_INFO = {
  "saman-setu": {
    title: "Saman Setu",
    subtitle: "Lorem ipsum dolor sit amet",
    description: LOREM,
    icon: "🎨",
    features: LOREM_FEATURES,
  },
  "swad-setu": {
    title: "Swad Setu",
    subtitle: "Lorem ipsum dolor sit amet",
    description: LOREM,
    icon: "🍛",
    features: LOREM_FEATURES,
  },
  "sarjaan-setu": {
    title: "Sarjaan Setu",
    subtitle: "Lorem ipsum dolor sit amet",
    description: LOREM,
    icon: "📚",
    features: LOREM_FEATURES,
  },
  "shilp-setu": {
    title: "Shilp Setu",
    subtitle: "Lorem ipsum dolor sit amet",
    description: LOREM,
    icon: "🏺",
    features: LOREM_FEATURES,
  },
  rental: {
    title: "Art Rental",
    subtitle: "Lorem ipsum dolor sit amet",
    description: LOREM,
    icon: "🖼️",
    features: LOREM_FEATURES,
  },
  "waste-management": {
    title: "Art Waste Management",
    subtitle: "Lorem ipsum dolor sit amet",
    description: LOREM,
    icon: "♻️",
    features: LOREM_FEATURES,
  },
};

function NotifyForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    setDone(true);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ padding: "16px 24px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "#4ade80", fontSize: 14 }}>✓</span>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em", color: "#4ade80" }}>YOU'RE ON THE LIST</span>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: 0, maxWidth: 440, margin: "0 auto", borderRadius: 999, overflow: "hidden", border: "1px solid rgba(212,175,55,0.3)" }}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        style={{
          flex: 1, padding: "14px 20px",
          background: "rgba(255,255,255,0.03)",
          border: "none", outline: "none",
          color: "#e8e0d0", fontFamily: "'Raleway',sans-serif",
          fontSize: 13,
        }}
      />
      <button
        type="submit"
        style={{
          padding: "14px 24px",
          background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
          border: "none", cursor: "pointer",
          fontFamily: "'Cinzel',serif", fontSize: 10,
          letterSpacing: "0.14em", color: "#111", fontWeight: 700,
          whiteSpace: "nowrap",
        }}>
        NOTIFY ME
      </button>
    </form>
  );
}

export default function ComingSoon({ page }) {
  const navigate = useNavigate();
  const info = PAGE_INFO[page] || {
    title: "Coming Soon",
    subtitle: "Something Extraordinary Is Being Crafted",
    description: LOREM,
    icon: "✦",
    features: [],
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", padding: "120px 24px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        <motion.div
          style={{ textAlign: "center", marginBottom: 72 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>

          <motion.div
            style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(212,175,55,0.08)",
              border: "1px solid rgba(212,175,55,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, margin: "0 auto 32px",
              boxShadow: "0 0 40px rgba(212,175,55,0.12)",
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
            {info.icon}
          </motion.div>

          <div className="gold-rule" style={{ justifyContent: "center", marginBottom: 20 }}>
            <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }} />
            <span className="grt">COMING SOON</span>
            <div className="grl" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: "clamp(42px,6vw,72px)",
            fontWeight: 400, color: "#fff",
            lineHeight: 1.1, marginBottom: 16,
          }}>
            {info.title}
          </h1>

          <p style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontStyle: "italic", fontSize: 20,
            color: "#D4AF37", marginBottom: 24, letterSpacing: "0.05em",
          }}>
            {info.subtitle}
          </p>

          <p style={{
            fontFamily: "'Raleway',sans-serif", fontSize: 15,
            color: "rgba(200,191,160,0.7)", maxWidth: 620,
            margin: "0 auto", lineHeight: 1.8,
          }}>
            {info.description}
          </p>
        </motion.div>

        {info.features.length > 0 && (
          <motion.div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: 20, marginBottom: 72,
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}>
            {info.features.map((feat, i) => (
              <motion.div
                key={i}
                style={{
                  padding: "24px 26px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(212,175,55,0.15)",
                  borderRadius: 12,
                }}
                whileHover={{ borderColor: "rgba(212,175,55,0.35)", background: "rgba(212,175,55,0.04)" }}
                transition={{ duration: 0.2 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#D4AF37", flexShrink: 0, marginTop: 8,
                  }} />
                  <span style={{
                    fontFamily: "'Raleway',sans-serif", fontSize: 14,
                    color: "rgba(200,191,160,0.8)", lineHeight: 1.6,
                  }}>{feat}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          style={{
            textAlign: "center",
            padding: "48px 40px",
            background: "rgba(212,175,55,0.04)",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: 20,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 32, fontWeight: 400, color: "#fff",
            marginBottom: 12,
          }}>
            Be the <em style={{ color: "#D4AF37" }}>First to Know</em>
          </h3>
          <p style={{
            fontFamily: "'Raleway',sans-serif", fontSize: 13,
            color: "rgba(200,191,160,0.6)", marginBottom: 28, lineHeight: 1.7,
          }}>
            {info.title} is being carefully built. Register your interest and we'll notify you the moment it launches.
          </p>

          <NotifyForm />

          <button
            onClick={() => navigate("/")}
            style={{
              display: "block", margin: "24px auto 0",
              background: "transparent",
              border: "none", fontFamily: "'Cinzel',serif",
              fontSize: 10, letterSpacing: "0.18em",
              color: "rgba(200,191,160,0.4)", cursor: "pointer",
            }}>
            ← RETURN TO ART COLISEUM
          </button>
        </motion.div>
      </div>
    </div>
  );
}
