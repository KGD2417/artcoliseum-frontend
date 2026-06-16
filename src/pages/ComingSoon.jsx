import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GlowCard } from "../components/ui/SpotlightCard";

const PAGE_INFO = {
  "saman-setu": {
    title: "Saman Setu",
    subtitle: "Connecting You with Trusted Vendors",
    description:
      "A unique platform that helps you find verified and trusted vendors for your needs. Browse genuine testimonials and authentic unpaid reviews to make confident decisions.",
    icon: "✦",
    features: [
      "Search vendors by area and category",
      "Connect with vendors and place orders securely",
      "Track your order status from start to finish",
    ],
  },

  "swad-setu": {
    title: "Swad Setu",
    subtitle: "Quality Food Delivered to Your Team",
    description:
      "A unique platform that connects you with experienced food specialists who can provide tasty, high-quality meals for your staff, events, or teams at reasonable prices.",
    icon: "❖",
    features: [
      "Search food providers by cuisine and area",
      "Place your order and make payments online",
      "Track your food delivery in real time",
    ],
  },

  "sarjaan-setu": {
    title: "Sarjaan Setu",
    subtitle: "Finding the Right Expert for Your Needs",
    description:
      "A unqiue platform that helps you connect with nearby and Sarjaans based on your requirements. View detailed profiles and choose the best match as per your requirements.",
    icon: "✧",
    features: [
      "Search Sarjaans by area and specialization",
      "View detailed profiles and experience",
      "Compare options and choose the right expert",
    ],
  },

  "shilp-setu": {
    title: "Shilp Setu",
    subtitle: "Connecting You with Skilled Contractors",
    description:
      "A unique platform that connects you with verified and trusted contractors. Check genuine testimonials and authentic reviews before assigning your projects.",
    icon: "◈",
    features: [
      "Search contractors by area and category",
      "Connect with contractors and assign tasks",
      "Share reviews, ratings, and project photos",
    ],
  },

  rental: {
    title: "Rental",
    subtitle: "Easy Access to Equipment and Machinery",
    description:
      "A unique platform where you can rent equipment, machinery, tools, and other resources with useful data insights to help you make better rental decisions.",
    icon: "◆",
    features: [
      "Search equipment and rental providers in your area",
      "Compare options and review rental insights",
      "Track rentals and manage payments easily",
    ],
  },

  "waste-management": {
    title: "Disposal Management",
    subtitle: "Smart Waste Collection and Disposal",
    description:
      "A unique platform that helps you find reliable waste disposal agencies in your area. Compare services, track progress, and manage payments through a simple process.",
    icon: "♢",
    features: [
      "Find waste disposal agencies based on location",
      "Upload photos and compare service options",
      "Track task completion and make secure payments",
    ],
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
        style={{
          padding: "16px 24px",
          background: "rgba(74,222,128,0.08)",
          border: "1px solid rgba(74,222,128,0.3)",
          borderRadius: 999,
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
        }}>
        <span style={{ color: "#4ade80", fontSize: 14 }}>✓</span>
        <span
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "#4ade80",
          }}>
          YOU'RE ON THE LIST
        </span>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{
        display: "flex",
        gap: 0,
        maxWidth: 440,
        margin: "0 auto",
        borderRadius: 999,
        overflow: "hidden",
        border: "1px solid rgba(212,175,55,0.3)",
      }}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        style={{
          flex: 1,
          padding: "14px 20px",
          background: "rgba(255,255,255,0.03)",
          border: "none",
          outline: "none",
          color: "#e8e0d0",
          fontFamily: "'Raleway',sans-serif",
          fontSize: 13,
        }}
      />
      <button
        type="submit"
        style={{
          padding: "14px 24px",
          background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
          border: "none",
          cursor: "pointer",
          fontFamily: "'Cinzel',serif",
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "#111",
          fontWeight: 700,
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
    description:
      "This chapter of Art Coliseum is still being shaped by our curators and craftspeople. We'd rather take the time to get it right than rush an unfinished experience to your screen — join the waitlist and we'll let you know the moment it opens.",
    icon: "✦",
    features: [],
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        padding: "120px 24px 80px",
      }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <motion.div
          style={{ textAlign: "center", marginBottom: 72 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(212,175,55,0.08)",
              border: "1px solid rgba(212,175,55,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              margin: "0 auto 32px",
              boxShadow: "0 0 40px rgba(212,175,55,0.12)",
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
            {info.icon}
          </motion.div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(42px,6vw,72px)",
              fontWeight: 400,
              color: "#fff",
              lineHeight: 1.1,
              marginBottom: 16,
            }}>
            {info.title}
          </h1>

          <p
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontStyle: "italic",
              fontSize: 20,
              color: "#D4AF37",
              marginBottom: 24,
              letterSpacing: "0.05em",
            }}>
            {info.subtitle}
          </p>

          <p
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 15,
              color: "rgba(200,191,160,0.7)",
              maxWidth: 620,
              margin: "0 auto",
              lineHeight: 1.8,
            }}>
            {info.description}
          </p>
        </motion.div>

        {info.features.length > 0 && (
          <motion.div
            className="setu-feature-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 20,
              marginBottom: 72,
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}>
            {info.features.map((feat, i) => (
              <GlowCard
                key={i}
                glowColor="gold"
                style={{ padding: "22px 24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                  }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#D4AF37",
                      flexShrink: 0,
                      marginTop: 8,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Raleway',sans-serif",
                      fontSize: 15,
                      color: "rgba(220,210,190,0.85)",
                      lineHeight: 1.6,
                    }}>
                    {feat}
                  </span>
                </div>
              </GlowCard>
            ))}
          </motion.div>
        )}
      </div>
      <style>{`
        @media (max-width: 760px) {
          .setu-feature-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
