import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import SafeImage from "../components/SafeImage";
import CircularGallery from "../components/CircularGallery";
import CircularRotator from "../components/CircularRotator";
import { useLocale } from "../context/Locale";
import {
  ArEyeIcon,
  SunIcon,
  TextureIcon,
  PaletteIcon,
  ChiselIcon,
  CameraIcon,
  ChipIcon,
  ArtistFigureIcon,
  HandshakeIcon,
  ArtSolutionsIcon,
  FrameArtIcon,
  PencilRulerIcon,
  DealIcon,
} from "../components/Icons";
import i1 from "../assets/i1.png";
import i2 from "../assets/i2.png";
import i3 from "../assets/i3.png";
import i4 from "../assets/i4.png";
import i5 from "../assets/i5.png";
import i6 from "../assets/i6.png";
import i7 from "../assets/i7.png";
import i8 from "../assets/i8.png";

/* ── Hero gallery items: gold/red/warm aesthetic ─────────────────── */
const HERO_GALLERY = [
  { image: i4, text: "The Golden Tree" },
  { image: i1, text: "Golden Horizon" },
  { image: i2, text: "Eternal Grace" },
  { image: i6, text: "Cosmic Flow" },
  {
    image:
      "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=900&q=80&auto=format&fit=crop",
    text: "Crimson Reverie",
  },
  { image: i5, text: "Whispers of Silence" },
  {
    image:
      "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=900&q=80&auto=format&fit=crop",
    text: "Velvet Mirage",
  },
  { image: i8, text: "Renaissance Study" },
  {
    image:
      "https://images.unsplash.com/photo-1549887534-1541e9326642?w=900&q=80&auto=format&fit=crop",
    text: "Crimson Tides",
  },
  { image: i3, text: "Azure Dreams" },
  {
    image:
      "https://images.unsplash.com/photo-1551913902-c92207136625?w=900&q=80&auto=format&fit=crop",
    text: "Solstice",
  },
  { image: i7, text: "Ocean Depths" },
];

/* ── 3D carousel (Highlights) ────────────────────────────────────── */
const CAROUSEL_ITEMS = [
  {
    img: i1,
    title: "Golden Horizon",
    medium: "Acrylic on Canvas",
    price: 2400,
  },
  { img: i2, title: "Eternal Grace", medium: "Bronze Sculpture", price: 3800 },
  { img: i6, title: "Cosmic Flow", medium: "Mixed Media", price: 1950 },
  { img: i4, title: "The Golden Tree", medium: "Oil on Canvas", price: 2100 },
  {
    img: i5,
    title: "Whispers of Silence",
    medium: "Oil on Canvas",
    price: 1700,
  },
  { img: i3, title: "Azure Dreams", medium: "Mixed Media", price: 2250 },
  { img: i8, title: "Renaissance Study", medium: "Oil on Panel", price: 5800 },
  { img: i7, title: "Ocean Depths", medium: "Digital Print", price: 1200 },
];

const MEDIUMS = [
  {
    slug: "paintings",
    label: "Paintings",
    sub: "Oil, Acrylic & Watercolor",
    count: "2,400+ works",
    Icon: PaletteIcon,
    img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&q=80&auto=format&fit=crop",
  },
  {
    slug: "sculptures",
    label: "Sculptures",
    sub: "Bronze, Marble & Mixed Media",
    count: "840+ works",
    Icon: ChiselIcon,
    img: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=900&q=80&auto=format&fit=crop",
  },
  {
    slug: "photography",
    label: "Photography",
    sub: "Fine Art & Documentary",
    count: "1,200+ works",
    Icon: CameraIcon,
    img: "src/assets/flower.png",
  },
  {
    slug: "digital",
    label: "Digital",
    sub: "NFT & Generative Canvas",
    count: "3,600+ works",
    Icon: ChipIcon,
    img: "https://images.unsplash.com/photo-1558244661-d248897f7bc4?w=900&q=80&auto=format&fit=crop",
  },
];

const SERVICES = [
  { Icon: ArtistFigureIcon, label: "ARTISTS", to: "/artists" },
  { Icon: HandshakeIcon, label: "CONNECTIONS", to: "/about" },
  { Icon: ArtSolutionsIcon, label: "ART SOLUTIONS", to: "/categories" },
  { Icon: FrameArtIcon, label: "GALLERY", to: "/gallery" },
  { Icon: PencilRulerIcon, label: "CUSTOMISATION", to: "/contact" },
  { Icon: DealIcon, label: "DEAL", to: "/checkout" },
];

const AR_FEATURES = [
  {
    Icon: ArEyeIcon,
    label: "True-to-scale projection",
    desc: "See exactly how each artwork fits your space in full dimension",
  },
  {
    Icon: SunIcon,
    label: "Dynamic lighting simulation",
    desc: "Preview your art under natural, warm, and ambient lighting",
  },
  {
    Icon: TextureIcon,
    label: "Museum-grade texture detail",
    desc: "Every brushstroke and surface rendered at exhibition fidelity",
  },
];

const AR_ROTATOR = [
  { image: i4, text: "Solstice Bedroom" },
  { image: i6, text: "Velvet Study" },
  { image: i1, text: "Golden Lounge" },
  { image: i2, text: "Bronze Atrium" },
];

const TESTIMONIALS = [
  {
    text: "Aureum is the only platform where I trust the provenance as much as the curation. My living room has never looked more deliberate.",
    name: "Isabella Moreau",
    role: "Private Collector, Paris",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop",
    fbIdx: 1,
  },
  {
    text: "The AR preview alone changed how I commit to a piece. I placed three pieces virtually before purchasing — every single one was perfect on arrival.",
    name: "Daniel Hoffmann",
    role: "Architect, Berlin",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop",
    fbIdx: 2,
  },
  {
    text: "From inquiry to white-glove delivery, the experience felt like working with a personal curator. This is what art collecting should feel like.",
    name: "Aria Patel",
    role: "Gallery Director, Mumbai",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop",
    fbIdx: 3,
  },
  {
    text: "Their condition reports and authenticity ledger gave me complete confidence. A modern auction house in your pocket.",
    name: "Lucas Marín",
    role: "Hedge Fund Partner, Madrid",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop",
    fbIdx: 4,
  },
  {
    text: "I commissioned a piece for my Tokyo penthouse. The white-glove install team treated the artwork — and my home — with reverence.",
    name: "Sakura Mori",
    role: "Interior Stylist, Tokyo",
    image:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&q=80&auto=format&fit=crop",
    fbIdx: 5,
  },
  {
    text: "The artist monographs alone are worth the membership. I have learned more about contemporary practice in three months than I had in years.",
    name: "Henrik Almqvist",
    role: "Curator, Stockholm",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&q=80&auto=format&fit=crop",
    fbIdx: 6,
  },
  {
    text: "Discreet, deeply considered, and extraordinarily well-priced for the quality. My only regret is not joining sooner.",
    name: "Victoria Whitfield",
    role: "Family Office, London",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80&auto=format&fit=crop",
    fbIdx: 7,
  },
  {
    text: "Every acquisition has appreciated, but the joy of living with the work is the real return.",
    name: "Faraz Khan",
    role: "Fintech Founder, Dubai",
    image:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80&auto=format&fit=crop",
    fbIdx: 0,
  },
  {
    text: "The strict curation cuts through the noise. Every piece on Aureum has earned its place.",
    name: "Emilia Conti",
    role: "Museum Trustee, Milan",
    image:
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&q=80&auto=format&fit=crop",
    fbIdx: 1,
  },
];

const STATS = [
  { value: "10,000+", label: "Original Artworks" },
  { value: "2,500+", label: "Talented Artists" },
  { value: "50+", label: "Countries" },
  { value: "Secure", label: "Global Delivery" },
  { value: "100%", label: "Authentic Artwork" },
];

function SectionHeader({ tag, title, italic, sub }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <div ref={ref} style={{ textAlign: "center", marginBottom: "56px" }}>
      <motion.div
        className="gold-rule"
        style={{ justifyContent: "center" }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}>
        <div
          className="grl"
          style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }}
        />
        <span className="grt">{tag}</span>
        <div
          className="grl"
          style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }}
        />
      </motion.div>
      <motion.h2
        className="section-heading"
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.15 }}>
        <span className="bold-white">{title} </span>
        <em>{italic}</em>
      </motion.h2>
      {sub && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 14,
            color: "rgba(200,191,160,0.6)",
            maxWidth: 560,
            margin: "14px auto 0",
            lineHeight: 1.7,
          }}>
          {sub}
        </motion.p>
      )}
    </div>
  );
}

/* ── Premium 3D cylinder carousel (Highlights — heading + sub + 3D + glass morph) ── */
function CylinderCarousel({ items, navigate }) {
  const { formatPrice } = useLocale();

  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);
  const startRot = useRef(0);

  // Auto rotate
  useEffect(() => {
    let raf;
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isDragging) {
        setRotation((r) => r - delta * 0.02); // speed control
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isDragging]);

  // Drag handlers
  const handleDown = (e) => {
    setIsDragging(true);
    startX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    startRot.current = rotation;
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    setRotation(startRot.current + (x - startX.current) * 0.4);
  };

  const handleUp = () => setIsDragging(false);

  return (
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
          width: 240,
          height: 320,
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotation}deg)`,
          transition: isDragging ? "none" : "transform 0.1s linear",
        }}>
        {items.map((item, i) => {
          const angle = (360 / items.length) * i;

          return (
            <div
              key={i}
              className="carousel-card"
              style={{
                transform: `rotateY(${angle}deg) translateZ(420px)`,
              }}>
              {/* IMAGE */}
              <img
                src={item.img}
                alt={item.title}
                className="carousel-card-img"
              />

              {/* DEFAULT VIEW */}
              <div className="carousel-default-info">
                <span className="carousel-price-tag num-value">
                  {formatPrice(item.price)}
                </span>
              </div>

              {/* GLASS HOVER */}
              <div className="carousel-glass">
                <div className="carousel-glass-title">{item.title}</div>
                <div className="carousel-glass-medium">{item.medium}</div>
                <div className="carousel-glass-price num-value">
                  {formatPrice(item.price)}
                </div>

                <button
                  className="carousel-glass-btn"
                  onClick={() => navigate("/gallery")}>
                  View Artwork ›
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Interactive medium selector (kept) ────────────────────────────── */
function InteractiveMediums({ items, onPick }) {
  const [active, setActive] = useState(0);
  const [animatedIn, setAnimatedIn] = useState([]);

  useEffect(() => {
    const timers = items.map((_, i) =>
      setTimeout(() => setAnimatedIn((prev) => [...prev, i]), 180 * i),
    );
    return () => timers.forEach(clearTimeout);
  }, [items]);

  return (
    <div className="medsel">
      {items.map((m, i) => {
        const isActive = active === i;
        const isIn = animatedIn.includes(i);
        const Icon = m.Icon;
        return (
          <div
            key={m.slug}
            className={`medsel-opt ${isActive ? "is-active" : ""}`}
            onClick={() => setActive(i)}
            onDoubleClick={() => onPick && onPick(m)}
            style={{
              flex: isActive ? "7 1 0%" : "1 1 0%",
              backgroundImage: `url('${m.img}')`,
              opacity: isIn ? 1 : 0,
              transform: isIn ? "translateX(0)" : "translateX(-60px)",
              borderColor: isActive
                ? "rgba(212,175,55,0.65)"
                : "rgba(212,175,55,0.18)",
              boxShadow: isActive
                ? "0 22px 60px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(212,175,55,0.1)"
                : "0 10px 30px rgba(0,0,0,0.35)",
              zIndex: isActive ? 10 : 1,
            }}>
            <div
              className="medsel-shadow"
              style={{
                boxShadow: isActive
                  ? "inset 0 -160px 140px -100px rgba(0,0,0,0.95), inset 0 -160px 140px -60px rgba(0,0,0,0.85)"
                  : "inset 0 -120px 0px -120px #000",
              }}
            />
            <div className="medsel-label">
              <div className="medsel-icon">
                <Icon size={20} />
              </div>
              <div
                className="medsel-info"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: isActive ? "translateX(0)" : "translateX(20px)",
                }}>
                <div className="medsel-main">{m.label.toUpperCase()}</div>
                <div className="medsel-sub">
                  {m.sub} ·{" "}
                  <span style={{ color: "#D4AF37" }} className="num-value">
                    {m.count}
                  </span>
                </div>
              </div>
              {isActive && (
                <button
                  className="medsel-cta"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPick && onPick(m);
                  }}>
                  EXPLORE →
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Auto-scrolling testimonial column (kept) ─────────────────────── */
function TestimonialColumn({ items, duration = 16, className = "" }) {
  return (
    <div className={`tcol ${className}`}>
      <motion.div
        className="tcol-track"
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}>
        {[0, 1].map((loop) => (
          <div
            key={loop}
            style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {items.map((t, i) => (
              <div className="tcard" key={`${loop}-${i}`}>
                <div className="tcard-quote">{t.text}</div>
                <div className="tcard-meta">
                  <SafeImage
                    src={t.image}
                    alt={t.name}
                    fallbackIndex={t.fbIdx ?? i}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid rgba(212,175,55,0.3)",
                    }}
                  />
                  <div>
                    <div className="tcard-name">{t.name}</div>
                    <div className="tcard-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const col1 = TESTIMONIALS.slice(0, 3);
  const col2 = TESTIMONIALS.slice(3, 6);
  const col3 = TESTIMONIALS.slice(6, 9);

  return (
    <>
      {/* ═══════════════════════════════════════════════
          HERO — heading on one line, OGL bent gallery, two buttons, service strip
      ═══════════════════════════════════════════════ */}
      <section className="hero-section hero-cyl">
        <div className="hero-glow" />
        <div className="hero-glow-2" />

        <motion.div
          className="hero-text"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
          <h1 className="hero-h1 hero-h1-single">
            <span style={{ color: "#fff" }}>Discover </span>
            <span className="hero-gold">Timeless Art</span>
          </h1>
          <motion.p
            className="hero-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}>
            Discover, collect and cherish extraordinary artworks from talented
            artists around the world.
          </motion.p>
        </motion.div>

        {/* OGL bent gallery */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="circ-gallery-wrap">
          <CircularGallery
            items={HERO_GALLERY}
            bend={3}
            borderRadius={0.05}
            scrollEase={0.04}
            scrollSpeed={2}
            autoplay={0.05}
            textColor="#D4AF37"
          />
        </motion.div>

        <motion.div
          className="hero-buttons"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1 }}>
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/categories")}>
            EXPLORE GALLERY →
          </motion.button>
          <motion.button
            className="btn-secondary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/become-artist")}>
            BECOME AN ARTIST
          </motion.button>
        </motion.div>

        {/* Service strip (image1) */}
        <motion.div
          className="service-strip"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <div className="service-divider">
            <span className="sd-line" />
            <span className="sd-ornament">
              <svg
                viewBox="0 0 60 16"
                width="60"
                height="16"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="1.2"
                strokeLinecap="round">
                <path d="M30 2c-3 4-6 6-10 6s-6-2-6-2 2 6 8 6 8-4 8-4" />
                <path d="M30 2c3 4 6 6 10 6s6-2 6-2-2 6-8 6-8-4-8-4" />
                <circle cx="30" cy="8" r="1.5" fill="#D4AF37" stroke="none" />
              </svg>
            </span>
            <span className="sd-line" />
          </div>
          <h3 className="service-strip-title">
            CONNECTING ART. ELEVATING CREATORS. INSPIRING SPACES.
          </h3>
          <div className="service-row">
            {SERVICES.map(({ Icon, label, to }, i) => (
              <motion.button
                key={label}
                onClick={() => navigate(to)}
                className="service-item"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ y: -4 }}>
                <div className="service-icon">
                  <Icon size={50} />
                </div>
                <div className="service-label">{label}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* <motion.div
          className="stats-bar"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}>
          {STATS.map(({ value, label }, i) => (
            <div key={i} className="stat-item">
              <div className="stat-value num-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </motion.div> */}
      </section>

      {/* ═══════════════════════════════════════════════
          HIGHLIGHTS — heading + sub + 3D cards + glass morph
      ═══════════════════════════════════════════════ */}
      <section
        className="section-pad"
        style={{
          background:
            "linear-gradient(180deg,#080808 0%,#0c0a07 50%,#080808 100%)",
        }}>
        <SectionHeader
          tag="Curator's Picks"
          title="Gallery"
          italic="Highlights"
          sub="A rotating selection of the most coveted works in our collection — drag the cylinder to explore."
        />
        <CylinderCarousel items={CAROUSEL_ITEMS} navigate={navigate} />
      </section>

      {/* ═══════════════════════════════════════════════
          MEDIUMS (kept)
      ═══════════════════════════════════════════════ */}
      <section className="section-pad">
        <SectionHeader
          tag="Browse by Medium"
          title="The"
          italic="Mediums"
          sub="Click a medium to expand it — double-click or tap EXPLORE to enter the collection."
        />
        <InteractiveMediums
          items={MEDIUMS}
          onPick={(m) => navigate(`/categories/${m.slug}`)}
        />
      </section>
      {/* ═══════════════════════════════════════════════
          ART IN YOUR SPACE — circular rotator animation
      ═══════════════════════════════════════════════ */}
      <section className="ar-section">
        <div className="ar-inner">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="ar-rotator-col">
            <CircularRotator items={AR_ROTATOR} autoplay interval={4000} />
          </motion.div>

          <motion.div
            className="ar-content-col"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}>
            <div className="gold-rule" style={{ marginBottom: 18 }}>
              <div
                className="grl"
                style={{
                  background: "linear-gradient(90deg,transparent,#D4AF37)",
                  maxWidth: 60,
                }}
              />
              <span className="grt">Augmented Reality</span>
              <div
                className="grl"
                style={{
                  background: "linear-gradient(90deg,#D4AF37,transparent)",
                  maxWidth: 60,
                }}
              />
            </div>

            <h2 className="ar-heading">
              Art in Your <em>Space</em>
            </h2>

            <p className="ar-desc">
              Bridge the gap between digital and physical. Our immersive AR
              preview allows you to visualise any masterpiece in your own
              environment with perfect scale and lighting fidelity.
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
                  <div className="ar-feature-icon">
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="ar-feature-label">
                      {label.toUpperCase()}
                    </div>
                    <div className="ar-feature-desc">{desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              className="btn-secondary"
              style={{ marginTop: 36 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/ar")}>
              LAUNCH AR PREVIEW
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS (kept)
      ═══════════════════════════════════════════════ */}
      <section
        className="section-pad"
        style={{
          background:
            "linear-gradient(180deg,#080808 0%,#0d0b08 50%,#080808 100%)",
        }}>
        <SectionHeader
          tag="Voices"
          title="Collectors'"
          italic="Reflections"
          sub="What our private collectors and curators say about acquiring art with Aureum."
        />

        <div className="tcols-wrap">
          <TestimonialColumn items={col1} duration={22} />
          <TestimonialColumn items={col2} duration={28} className="tcol-md" />
          <TestimonialColumn items={col3} duration={25} className="tcol-lg" />
        </div>
      </section>

      {/* NEWSLETTER */}
      <motion.section
        className="newsletter-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8 }}>
        <div
          className="gold-rule"
          style={{ justifyContent: "center", marginBottom: 22 }}>
          <div
            className="grl"
            style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }}
          />
          <span className="grt">Newsletter</span>
          <div
            className="grl"
            style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }}
          />
        </div>
        <h2 className="section-heading" style={{ marginBottom: 14 }}>
          Stay <em>Cultivated</em>
        </h2>
        <p className="newsletter-sub">
          Receive exclusive invitations to private viewings and new artist
          debuts.
        </p>
        <div className="newsletter-form">
          <input
            className="email-input"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <motion.button
            className="btn-gold"
            style={{ borderRadius: "0 60px 60px 0", padding: "15px 32px" }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}>
            Subscribe
          </motion.button>
        </div>
      </motion.section>
    </>
  );
}
