import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import SafeImage from "../components/SafeImage";
import CircularGallery from "../components/CircularGallery";
import {
  PaletteIcon,
  ChiselIcon,
  CameraIcon,
  ChipIcon,
} from "../components/Icons";
import i1 from "../assets/i1.png";
import i2 from "../assets/i2.png";
import i3 from "../assets/i3.png";
import i4 from "../assets/i4.png";
import i5 from "../assets/i5.png";
import i6 from "../assets/i6.png";
import i7 from "../assets/i7.png";
import i8 from "../assets/i8.png";

/* ── Hero gallery items ─────────────────────────────────────────── */
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

/* ── 3D carousel items ───────────────────────────────────────────── */
const CAROUSEL_ITEMS = [
  { img: i1, title: "Golden Horizon", medium: "Acrylic on Canvas" },
  { img: i2, title: "Eternal Grace", medium: "Bronze Sculpture" },
  { img: i6, title: "Cosmic Flow", medium: "Mixed Media" },
  { img: i4, title: "The Golden Tree", medium: "Oil on Canvas" },
  { img: i5, title: "Whispers of Silence", medium: "Oil on Canvas" },
  { img: i3, title: "Azure Dreams", medium: "Mixed Media" },
  { img: i8, title: "Renaissance Study", medium: "Oil on Panel" },
  { img: i7, title: "Ocean Depths", medium: "Digital Print" },
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

/* About section — 3 stacked art cards */
const ABOUT_IMAGES = [i1, i4, i8];

/* Events data */
const EVENTS_DATA = [
  {
    title: "The Golden Age Exhibition",
    date: "May 15 – June 30, 2025",
    location: "Mumbai, India",
    desc: "A curated journey through contemporary Indian masters exploring gold as medium, metaphor, and memory.",
    img: i4,
    tag: "ONGOING",
  },
  {
    title: "Silence in Motion",
    date: "June 5 – July 20, 2025",
    location: "Florence, Italy",
    desc: "Kinetic installations that blur the boundary between stillness and movement. Nine artists, one shared language.",
    img: i2,
    tag: "ONGOING",
  },
  {
    title: "Digital Frontiers",
    date: "July 1 – August 15, 2025",
    location: "Berlin, Germany",
    desc: "Generative art redefining what it means to own and experience art in the modern era.",
    img: i6,
    tag: "UPCOMING",
  },
];

/* Preservation section images */
const PRES_IMAGES = [i5, i3, i7, i8];

/* ── Section header ─────────────────────────────────────────────── */
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

/* ── Premium 3D cylinder carousel — slower, no price ────────────── */
function CylinderCarousel({ items, navigate }) {
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startRot = useRef(0);

  useEffect(() => {
    let raf;
    let lastTime = performance.now();
    const animate = (time) => {
      const delta = time - lastTime;
      lastTime = time;
      if (!isDragging) {
        setRotation((r) => r - delta * 0.008); // slow, contemplative pace
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isDragging]);

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
              style={{ transform: `rotateY(${angle}deg) translateZ(420px)` }}>
              <img
                src={item.img}
                alt={item.title}
                className="carousel-card-img"
              />
              <div className="carousel-glass">
                <div className="carousel-glass-title">{item.title}</div>
                <div className="carousel-glass-medium">{item.medium}</div>
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

/* ── Interactive medium selector ────────────────────────────────── */
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

/* ── Auto-scrolling testimonial column ──────────────────────────── */
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

/* ── Stacked cards that spread on hover (About section) ─────────── */
function StackedCardsInteraction({ images }) {
  const [hovered, setHovered] = useState(false);

  const STACK = [
    { rotate: -7, x: -14, y: 8 },
    { rotate: 0, x: 0, y: 0 },
    { rotate: 7, x: 14, y: 8 },
  ];
  const SPREAD = [
    { rotate: -18, x: -100, y: 20 },
    { rotate: 0, x: 0, y: -28 },
    { rotate: 18, x: 100, y: 20 },
  ];

  return (
    <div
      className="stacked-cards-wrap"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {images.map((src, i) => {
        const pos = hovered ? SPREAD[i] : STACK[i];
        return (
          <motion.div
            key={i}
            className="stacked-card"
            animate={pos}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{ zIndex: i === 1 ? 3 : i === 0 ? 1 : 2 }}>
            <img src={src} alt="" draggable={false} />
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── 3D tilt card for Events ────────────────────────────────────── */
function TiltCard({ event, index }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const inView = useInView(cardRef, { once: true, margin: "-60px" });

  const handleMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setTilt({
      x: ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -10,
      y: ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 10,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="event-tilt-wrap"
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ perspective: 900 }}>
      <motion.div
        className="event-tilt-card"
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 200, damping: 28 }}
        style={{ transformStyle: "preserve-3d" }}>
        <div className="event-card-img-wrap">
          <img src={event.img} alt={event.title} />
          <div className="event-card-img-overlay" />
        </div>
        <div className="event-card-body">
          <div
            className={`event-card-tag event-tag-${event.tag.toLowerCase()}`}>
            {event.tag}
          </div>
          <div className="event-card-date">{event.date}</div>
          <div className="event-card-title">{event.title}</div>
          <div className="event-card-loc">{event.location}</div>
          <div className="event-card-desc">{event.desc}</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Preservation stagger grid ──────────────────────────────────── */
function PreservationGrid({ items }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <div ref={ref} className="pres-grid">
      {items.map((src, i) => (
        <motion.div
          key={i}
          className="pres-cell"
          initial={{ opacity: 0, filter: "blur(14px)", scale: 0.92 }}
          animate={inView ? { opacity: 1, filter: "blur(0px)", scale: 1 } : {}}
          transition={{
            duration: 0.85,
            delay: i * 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}>
          <img src={src} alt="" draggable={false} />
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const col1 = TESTIMONIALS.slice(0, 3);
  const col2 = TESTIMONIALS.slice(3, 6);
  const col3 = TESTIMONIALS.slice(6, 9);

  return (
    <>
      {/* ═══════════════════════════════════════════════
          HERO
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
            <span className="hero-gold">Arrt Coliseum</span>
          </h1>
          <motion.p
            className="hero-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}>
            Timeless and Priceless Art at Your Space
          </motion.p>
        </motion.div>

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
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
          ABOUT ARRT COLISEUM
      ═══════════════════════════════════════════════ */}
      <section className="about-col-section">
        <div className="about-col-inner">
          <motion.div
            className="about-col-cards"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <StackedCardsInteraction images={ABOUT_IMAGES} />
          </motion.div>

          <motion.div
            className="about-col-content"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}>
            <div className="gold-rule" style={{ marginBottom: 20 }}>
              <div
                className="grl"
                style={{
                  background: "linear-gradient(90deg,transparent,#D4AF37)",
                  maxWidth: 60,
                }}
              />
              <span className="grt">Our Story</span>
              <div
                className="grl"
                style={{
                  background: "linear-gradient(90deg,#D4AF37,transparent)",
                  maxWidth: 60,
                }}
              />
            </div>
            <h2 className="ar-heading">
              About <em>Arrt Coliseum</em>
            </h2>
            <p className="ar-desc" style={{ marginBottom: 20 }}>
              Arrt Coliseum is not a marketplace — it is a sanctuary for art. We
              believe that great art does not need a price tag to prove its
              worth; it speaks through silence, through texture, through the
              quiet authority of a well-considered composition.
            </p>
            <p className="ar-desc" style={{ marginBottom: 32 }}>
              We bring together artists and admirers in a space designed to
              honour the essence of creative work — where every piece is
              presented with the reverence it deserves, and every visitor is
              invited to truly feel what they see.
            </p>
            <div className="about-col-pillars">
              {[
                {
                  num: "01",
                  label: "CURATION",
                  desc: "Every work is chosen for its cultural resonance, not its commercial appeal.",
                },
                {
                  num: "02",
                  label: "AUTHENTICITY",
                  desc: "Provenance, artist narratives, and full documentation for every piece.",
                },
                {
                  num: "03",
                  label: "EXPERIENCE",
                  desc: "A gallery without walls — art you can live with, not just look at.",
                },
              ].map(({ num, label, desc }) => (
                <div key={num} className="about-col-pillar">
                  <div className="about-col-pillar-num">{num}</div>
                  <div>
                    <div className="about-col-pillar-label">{label}</div>
                    <div className="about-col-pillar-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <motion.button
              className="btn-secondary"
              style={{ marginTop: 36 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/artists")}>
              MEET THE ARTISTS →
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          GALLERY HIGHLIGHTS
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
        <div style={{ textAlign: "center", marginTop: 52 }}>
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/categories")}>
            EXPLORE GALLERY →
          </motion.button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          MEDIUMS
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
          LAUNCH OF NEW PRODUCTS
      ═══════════════════════════════════════════════ */}
      <section className="ar-section">
        <div className="ar-inner">
          <motion.div
            className="launch-img-col"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <div className="launch-img-stack">
              <div className="launch-img-back">
                <img src={i7} alt="" />
              </div>
              <div className="launch-img-front">
                <img src={i3} alt="" />
              </div>
            </div>
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
              <span className="grt">New Arrivals</span>
              <div
                className="grl"
                style={{
                  background: "linear-gradient(90deg,#D4AF37,transparent)",
                  maxWidth: 60,
                }}
              />
            </div>
            <h2 className="ar-heading">
              Launch of <em>New Products</em>
            </h2>
            <p className="ar-desc">
              A new chapter in art begins. Our latest curated collection brings
              together emerging and established artists — each piece a testament
              to the enduring power of human expression. Be the first to
              encounter works that transcend their time.
            </p>
            <div className="launch-features">
              {[
                {
                  num: "01",
                  label: "EXCLUSIVE DEBUTS",
                  desc: "First-release works from artists at the height of their craft",
                },
                {
                  num: "02",
                  label: "LIMITED EDITIONS",
                  desc: "Each piece authenticated and numbered for its collector",
                },
                {
                  num: "03",
                  label: "GLOBAL VOICES",
                  desc: "Curated perspectives from across continents and disciplines",
                },
              ].map(({ num, label, desc }, i) => (
                <motion.div
                  key={num}
                  className="launch-feature"
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.3 + i * 0.14 }}>
                  <div className="launch-feature-num">{num}</div>
                  <div>
                    <div className="launch-feature-label">{label}</div>
                    <div className="launch-feature-desc">{desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.button
              className="btn-secondary"
              style={{ marginTop: 36 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/categories")}>
              EXPLORE COLLECTION →
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          EVENTS
      ═══════════════════════════════════════════════ */}
      <section
        className="section-pad"
        style={{
          background:
            "linear-gradient(180deg,#080808 0%,#0d0b08 60%,#080808 100%)",
        }}>
        <SectionHeader
          tag="Ongoing & Upcoming"
          title="Art"
          italic="Events"
          sub="Immersive exhibitions and curated experiences from across the globe."
        />
        <div className="events-tilt-grid">
          {EVENTS_DATA.map((ev, i) => (
            <TiltCard key={ev.title} event={ev} index={i} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 52 }}>
          <motion.button
            className="btn-secondary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/events")}>
            VIEW ALL EVENTS →
          </motion.button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PRESERVATION OF ART
      ═══════════════════════════════════════════════ */}
      <section className="section-pad pres-section">
        <div className="pres-inner">
          <motion.div
            className="pres-text-col"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <div className="gold-rule" style={{ marginBottom: 20 }}>
              <div
                className="grl"
                style={{
                  background: "linear-gradient(90deg,transparent,#D4AF37)",
                  maxWidth: 60,
                }}
              />
              <span className="grt">Our Commitment</span>
              <div
                className="grl"
                style={{
                  background: "linear-gradient(90deg,#D4AF37,transparent)",
                  maxWidth: 60,
                }}
              />
            </div>
            <h2 className="ar-heading">
              Preservation
              <br />
              of <em>Art</em>
            </h2>
            <p className="ar-desc">
              Art is not merely object — it is memory, culture, and the
              irreplaceable record of human feeling. We are committed to its
              preservation: archiving provenance, supporting restoration, and
              ensuring that every work in our collection endures for generations
              to come.
            </p>
            <p className="ar-desc">
              From climate-controlled documentation to partnerships with
              conservation institutes, every piece in our care receives the
              protection its legacy demands.
            </p>
            <motion.button
              className="btn-primary"
              style={{ marginTop: 36 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/about")}>
              LEARN MORE →
            </motion.button>
          </motion.div>
          <div className="pres-grid-col">
            <PreservationGrid items={PRES_IMAGES} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS
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
