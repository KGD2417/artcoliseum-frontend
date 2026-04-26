import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import SafeImage from "../components/SafeImage";
import { useLocale } from "../context/Locale";
import { ArEyeIcon, SunIcon, TextureIcon } from "../components/Icons";
import i1 from "../assets/i1.png";
import i2 from "../assets/i2.png";
import i3 from "../assets/i3.png";
import i4 from "../assets/i4.png";
import i5 from "../assets/i5.png";
import i6 from "../assets/i6.png";
import i7 from "../assets/i7.png";
import i8 from "../assets/i8.png";

/* prices stored as USD numbers — formatPrice converts to active currency */
const CAROUSEL_ITEMS = [
  { img: i1, title: "Golden Horizon",       medium: "Acrylic on Canvas", price: 2400 },
  { img: i2, title: "Eternal Grace",        medium: "Bronze Sculpture",  price: 3800 },
  { img: i6, title: "Cosmic Flow",          medium: "Mixed Media",       price: 1950 },
  { img: i4, title: "The Golden Tree",      medium: "Oil on Canvas",     price: 2100 },
  { img: i5, title: "Whispers of Silence",  medium: "Oil on Canvas",     price: 1700 },
  { img: i3, title: "Azure Dreams",         medium: "Mixed Media",       price: 2250 },
  { img: i8, title: "Renaissance Study",    medium: "Oil on Panel",      price: 5800 },
  { img: i7, title: "Ocean Depths",         medium: "Digital Print",     price: 1200 },
];

const MEDIUMS = [
  { slug: "paintings",  label: "Paintings",   sub: "Oil, Acrylic & Watercolor",   count: "2,400+ works",
    img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&q=80&auto=format&fit=crop" },
  { slug: "sculptures", label: "Sculptures",  sub: "Bronze, Marble & Mixed Media", count: "840+ works",
    img: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=900&q=80&auto=format&fit=crop" },
  { slug: "photography", label: "Photography", sub: "Fine Art & Documentary",      count: "1,200+ works",
    img: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=900&q=80&auto=format&fit=crop" },
  { slug: "digital",    label: "Digital",     sub: "NFT & Generative Canvas",      count: "3,600+ works",
    img: "https://images.unsplash.com/photo-1633437039415-f3d6611db4d5?w=900&q=80&auto=format&fit=crop" },
];

const AR_FEATURES = [
  { Icon: ArEyeIcon,   label: "True-to-scale projection",    desc: "See exactly how each artwork fits your space in full dimension" },
  { Icon: SunIcon,     label: "Dynamic lighting simulation", desc: "Preview your art under natural, warm, and ambient lighting" },
  { Icon: TextureIcon, label: "Museum-grade texture detail", desc: "Every brushstroke and surface rendered at exhibition fidelity" },
];

const TESTIMONIALS = [
  {
    quote: "Aureum is the only platform where I trust the provenance as much as the curation. My living room has never looked more deliberate.",
    name: "Isabella Moreau", title: "Private Collector, Paris",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop", fbIdx: 1,
  },
  {
    quote: "The AR preview alone changed how I commit to a piece. I placed three pieces virtually before purchasing — every single one was perfect on arrival.",
    name: "Daniel Hoffmann", title: "Architect, Berlin",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop", fbIdx: 2,
  },
  {
    quote: "From inquiry to white-glove delivery, the experience felt like working with a personal curator. This is what art collecting should feel like.",
    name: "Aria Patel", title: "Gallery Director, Mumbai",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop", fbIdx: 3,
  },
];

const STATS = [
  { value: "10,000+", label: "Original Artworks" },
  { value: "2,500+",  label: "Talented Artists"  },
  { value: "50+",     label: "Countries"         },
  { value: "Secure",  label: "Global Delivery"   },
  { value: "100%",    label: "Authentic Artwork" },
];

const AR_PHONE_PHOTO = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1100&q=80&auto=format&fit=crop";

function SectionHeader({ tag, title, italic, sub }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <div ref={ref} style={{ textAlign: "center", marginBottom: "56px" }}>
      <motion.div className="gold-rule" style={{ justifyContent: "center" }}
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>
        <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }} />
        <span className="grt">{tag}</span>
        <div className="grl" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
      </motion.div>
      <motion.h2 className="section-heading"
        initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.15 }}>
        <span className="bold-white">{title} </span><em>{italic}</em>
      </motion.h2>
      {sub && (
        <motion.p
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.3 }}
          style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.6)", maxWidth: 560, margin: "14px auto 0", lineHeight: 1.7 }}>
          {sub}
        </motion.p>
      )}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { formatPrice } = useLocale();
  const [email, setEmail] = useState("");
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startRot = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (!isDragging) setRotation(r => r - 0.25);
    }, 16);
    return () => clearInterval(id);
  }, [isDragging]);

  const handleDown = (e) => {
    setIsDragging(true);
    startX.current = e.clientX ?? e.touches?.[0]?.clientX;
    startRot.current = rotation;
  };
  const handleMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX;
    setRotation(startRot.current + (x - startX.current) * 0.4);
  };
  const handleUp = () => setIsDragging(false);

  return (
    <>
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="hero-glow-2" />

        <motion.div className="hero-text"
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
          <h1 className="hero-h1">
            <motion.span style={{ display: "block", color: "#fff" }}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.1 }}>
              Discover
            </motion.span>
            <motion.span className="hero-gold" style={{ display: "block" }}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.28 }}>
              Timeless Art
            </motion.span>
          </h1>
          <motion.p className="hero-sub"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.52 }}>
            Connecting art. Elevating Creators, Inspiring Places.
          </motion.p>
        </motion.div>

        <motion.div className="concave-divider"
          initial={{ opacity: 0, scaleX: 0.6 }} animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.1, delay: 0.68, ease: [0.22, 1, 0.36, 1] }}>
          <svg viewBox="0 0 1400 72" preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 72, display: "block" }}>
            <defs>
              <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#D4AF37" stopOpacity="0"   />
                <stop offset="25%"  stopColor="#D4AF37" stopOpacity="0.4" />
                <stop offset="50%"  stopColor="#e8c53a" stopOpacity="1"   />
                <stop offset="75%"  stopColor="#D4AF37" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0"   />
              </linearGradient>
              <linearGradient id="fg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#D4AF37" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0"    />
              </linearGradient>
              <filter id="glow" x="-20%" y="-100%" width="140%" height="300%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path d="M0,8 C350,8 500,68 700,68 C900,68 1050,8 1400,8" fill="none" stroke="url(#cg)" strokeWidth="1.8" filter="url(#glow)" />
            <path d="M0,8 C350,8 500,68 700,68 C900,68 1050,8 1400,8 L1400,0 L0,0 Z" fill="url(#fg)" />
            <polygon points="700,64 706,58 700,52 694,58" fill="#D4AF37" opacity="0.8" filter="url(#glow)" />
          </svg>
        </motion.div>

        <motion.div className="hero-buttons"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.88 }}>
          <motion.button className="btn-gold-main"
            whileHover={{ scale: 1.05, boxShadow: "0 0 48px rgba(212,175,55,0.6)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/categories")}>
            EXPLORE MARKETPLACE
          </motion.button>
          <motion.button className="btn-outline"
            whileHover={{ scale: 1.04, borderColor: "#D4AF37", color: "#f0e8d8" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/become-artist")}>
            BECOME AN ARTIST
          </motion.button>
        </motion.div>

        <motion.div className="stats-bar"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.3 }}
          style={{ marginTop: 80 }}>
          {STATS.map(({ value, label }, i) => (
            <div key={i} className="stat-item">
              <div className="stat-value num-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* MEDIUMS */}
      <section className="section-pad">
        <SectionHeader tag="Browse by Medium" title="The" italic="Mediums"
          sub="Four pillars of fine art, each curated by our specialist team. Click a medium to explore its sub-categories." />
        <div className="mediums-grid">
          {MEDIUMS.map(({ slug, label, sub, count, img }, i) => (
            <motion.div
              key={label}
              className="med-card"
              initial={{ opacity: 0, y: 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              onClick={() => navigate(`/categories/${slug}`)}
              style={{ cursor: "pointer" }}>
              <SafeImage src={img} alt={label} fallbackIndex={i} className="med-img" />
              <div className="med-gradient" />
              <div className="med-info">
                <div className="med-label">{label.toUpperCase()}</div>
                <div className="med-sub">{sub}</div>
                <div className="med-count num-value">{count}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HIGHLIGHTS — 3D carousel */}
      <section className="section-pad" style={{ background: "linear-gradient(180deg,#080808 0%,#0c0a07 50%,#080808 100%)" }}>
        <SectionHeader
          tag="Curator's Picks"
          title="Gallery"
          italic="Highlights"
          sub="A rotating selection of the most coveted works in our collection — drag the spiral to explore." />

        <motion.div
          initial={{ opacity: 0, y: 70 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="carousel-wrap"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
          onTouchStart={handleDown}
          onTouchMove={handleMove}
          onTouchEnd={handleUp}>
          <div
            style={{
              position: "relative",
              width: 240, height: 320,
              transformStyle: "preserve-3d",
              transform: `rotateY(${rotation}deg)`,
              transition: isDragging ? "none" : "transform 0.1s linear",
            }}>
            {CAROUSEL_ITEMS.map((item, i) => {
              const angle = (360 / CAROUSEL_ITEMS.length) * i;
              return (
                <div
                  key={i}
                  className="carousel-card"
                  style={{ transform: `rotateY(${angle}deg) translateZ(420px)` }}>
                  <img src={item.img} alt={item.title} className="carousel-card-img" />
                  <div className="carousel-default-info">
                    <span className="carousel-price-tag num-value">{formatPrice(item.price)}</span>
                  </div>
                  <div className="carousel-glass">
                    <div className="carousel-glass-title">{item.title}</div>
                    <div className="carousel-glass-medium">{item.medium}</div>
                    <div className="carousel-glass-price num-value">{formatPrice(item.price)}</div>
                    <button className="carousel-glass-btn" onClick={() => navigate("/gallery")}>
                      View Artwork ›
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ART IN YOUR SPACE — two-column, centered */}
      <section className="ar-section ar-section-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="ar-photo-card">
          <SafeImage src={AR_PHONE_PHOTO} alt="Artwork visualised through phone AR preview" fallbackIndex={5} />
        </motion.div>

        <motion.div
          className="ar-content-col"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
          <div className="gold-rule" style={{ marginBottom: 18 }}>
            <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)", maxWidth: 60 }} />
            <span className="grt">Augmented Reality</span>
            <div className="grl" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)", maxWidth: 60 }} />
          </div>

          <h2 className="ar-heading">Art in Your <em>Space</em></h2>
          <p className="ar-desc">
            Bridge the gap between digital and physical. Our immersive AR preview allows you to visualise any masterpiece in your own environment with perfect scale and lighting fidelity.
          </p>

          <div className="ar-features">
            {AR_FEATURES.map(({ Icon, label, desc }, i) => (
              <motion.div
                key={label}
                className="ar-feature-item"
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.3 + i * 0.14 }}>
                <div className="ar-feature-icon"><Icon size={20} /></div>
                <div>
                  <div className="ar-feature-label">{label.toUpperCase()}</div>
                  <div className="ar-feature-desc">{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            className="btn-outline"
            style={{ marginTop: 36, borderColor: "#D4AF37", color: "#D4AF37" }}
            whileHover={{ scale: 1.04, boxShadow: "0 0 36px rgba(212,175,55,0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/ar")}>
            LAUNCH AR PREVIEW
          </motion.button>
        </motion.div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-pad" style={{ background: "linear-gradient(180deg,#080808 0%,#0d0b08 50%,#080808 100%)" }}>
        <SectionHeader
          tag="Voices"
          title="Collectors'"
          italic="Reflections"
          sub="What our private collectors and curators say about acquiring art with Aureum." />

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
          maxWidth: 1200, margin: "0 auto",
        }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{
                position: "relative",
                padding: "36px 30px 30px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(212,175,55,0.15)",
                borderRadius: 12,
              }}>
              <div style={{
                position: "absolute", top: -10, left: 24,
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 64, lineHeight: 1, color: "#D4AF37", opacity: 0.4,
              }}>“</div>

              <p style={{
                fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic",
                fontSize: 17, lineHeight: 1.7, color: "rgba(220,210,190,0.9)",
                marginBottom: 26,
              }}>{t.quote}</p>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <SafeImage src={t.avatar} alt={t.name} fallbackIndex={t.fbIdx}
                  style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(212,175,55,0.3)" }} />
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", color: "#D4AF37" }}>{t.name.toUpperCase()}</div>
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", marginTop: 4 }}>{t.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <motion.section
        className="newsletter-section"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8 }}>
        <div className="gold-rule" style={{ justifyContent: "center", marginBottom: 22 }}>
          <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }} />
          <span className="grt">Newsletter</span>
          <div className="grl" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
        </div>
        <h2 className="section-heading" style={{ marginBottom: 14 }}>
          Stay <em>Cultivated</em>
        </h2>
        <p className="newsletter-sub">
          Receive exclusive invitations to private viewings and new artist debuts.
        </p>
        <div className="newsletter-form">
          <input
            className="email-input"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <motion.button
            className="btn-gold"
            style={{ borderRadius: "0 60px 60px 0", padding: "15px 32px" }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            Subscribe
          </motion.button>
        </div>
      </motion.section>
    </>
  );
}
