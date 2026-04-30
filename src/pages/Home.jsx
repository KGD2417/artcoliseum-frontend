import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import SafeImage from "../components/SafeImage";
import ColiseumCarousel from "../components/ColiseumCarousel";
import { supabase } from "../utils/supabase";
import {
  PaletteIcon,
  ChiselIcon,
  CameraIcon,
  ChipIcon,
  FrameIcon,
  ArtistFigureIcon,
  GlobeIcon,
  ShieldIcon,
  SparkIcon,
} from "../components/Icons";
import logo from "../assets/logo.png";
import i1 from "../assets/i1.png";
import i2 from "../assets/i2.png";
import i3 from "../assets/i3.png";
import i4 from "../assets/i4.png";
import i5 from "../assets/i5.png";
import i6 from "../assets/i6.png";
import i7 from "../assets/i7.png";
import i8 from "../assets/i8.png";
import p1 from "../assets/preservation/p1.png";
import p2 from "../assets/preservation/p2.png";
import p3 from "../assets/preservation/p3.png";
import p4 from "../assets/preservation/p4.png";
import p5 from "../assets/preservation/p5.png";
import p6 from "../assets/preservation/p6.png";
import p7 from "../assets/preservation/p7.png";
import p8 from "../assets/preservation/p8.png";
import a1 from "../assets/About/a1.png";
import b1 from "../assets/3images/b1.png";
import b2 from "../assets/3images/b2.png";
import e1 from "../assets/events/e1.png";
import e2 from "../assets/events/e2.png";
import e3 from "../assets/events/e3.png";

// Fallback data when database is empty
const FALLBACK_HERO_GALLERY = [
  { image: i1, text: "Golden Horizon" },
  { image: i2, text: "Eternal Grace" },
  { image: i6, text: "Cosmic Flow" },
  { image: i4, text: "The Golden Tree" },
  { image: i5, text: "Whispers of Silence" },
  {
    image:
      "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=900&q=80&auto=format&fit=crop",
    text: "Crimson Reverie",
  },
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

const FALLBACK_CAROUSEL = [
  { img: p1, title: "Golden Horizon", medium: "Acrylic on Canvas" },
  { img: p4, title: "Eternal Grace", medium: "Bronze Sculpture" },
  { img: p6, title: "Cosmic Flow", medium: "Mixed Media" },
  { img: p7, title: "The Golden Tree", medium: "Oil on Canvas" },
  { img: p5, title: "Whispers of Silence", medium: "Oil on Canvas" },
  { img: p3, title: "Azure Dreams", medium: "Mixed Media" },
  { img: p8, title: "Renaissance Study", medium: "Oil on Panel" },
  { img: p2, title: "Ocean Depths", medium: "Digital Print" },
];

/* ── Hero gallery ────────────────────────────────────────────────── */
const HERO_GALLERY = [
  { image: i1, text: "Golden Horizon" },
  { image: i2, text: "Eternal Grace" },
  { image: i6, text: "Cosmic Flow" },
  { image: i4, text: "The Golden Tree" },
  { image: i5, text: "Whispers of Silence" },
  {
    image:
      "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=900&q=80&auto=format&fit=crop",
    text: "Crimson Reverie",
  },
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

const HERO_STATS = [
  { Icon: FrameIcon, value: "10,000+", label: "Original Artworks" },
  { Icon: ArtistFigureIcon, value: "2,500+", label: "Talented Artists" },
  { Icon: GlobeIcon, value: "50+", label: "Countries" },
  { Icon: ShieldIcon, value: "Secure", label: "Global Delivery" },
  { Icon: SparkIcon, value: "100%", label: "Authentic Artwork" },
];

/* ── Highlights carousel ─────────────────────────────────────────── */
const CAROUSEL_ITEMS = [
  { img: p1, title: "Golden Horizon", medium: "Acrylic on Canvas" },
  { img: p4, title: "Eternal Grace", medium: "Bronze Sculpture" },
  { img: p6, title: "Cosmic Flow", medium: "Mixed Media" },
  { img: p7, title: "The Golden Tree", medium: "Oil on Canvas" },
  { img: p5, title: "Whispers of Silence", medium: "Oil on Canvas" },
  { img: p3, title: "Azure Dreams", medium: "Mixed Media" },
  { img: p8, title: "Renaissance Study", medium: "Oil on Panel" },
  { img: p2, title: "Ocean Depths", medium: "Digital Print" },
];

const MEDIUMS = [
  {
    slug: "paintings",
    label: "Paintings",
    sub: "Oil, Acrylic & Watercolor",
    count: "2,400+ works",
    Icon: PaletteIcon,
    img: "src/assets/mediums/m1.png",
  },
  {
    slug: "sculptures",
    label: "Sculptures",
    sub: "Bronze, Marble & Mixed Media",
    count: "840+ works",
    Icon: ChiselIcon,
    img: "src/assets/mediums/m2.png",
  },
  {
    slug: "photography",
    label: "Photography",
    sub: "Fine Art & Documentary",
    count: "1,200+ works",
    Icon: CameraIcon,
    img: "src/assets/mediums/m3.png",
  },
  {
    slug: "digital",
    label: "Digital",
    sub: "NFT & Generative Canvas",
    count: "3,600+ works",
    Icon: ChipIcon,
    img: "src/assets/mediums/m4.png",
  },
];

/* ── New Arrivals — 3 rotating cards ────────────────────────────── */
const ARRIVALS = [
  {
    image: p8,
    text: "New Collection",
    titleBold: "Launch of",
    titleItalic: "New Product",
    tag: "New Arrivals",
    sub: "Forty-eight new works. Eighteen artists. One season.",
    desc: "A new chapter in art begins. Our latest curated collection brings together emerging and established artists — each piece a testament to the enduring power of human expression.",
    bullets: [
      "48 new works across painting, sculpture & photography",
      "Verified provenance, direct from each artist's studio",
      "Members get 48-hour early access",
    ],
    cta: "EXPLORE COLLECTION →",
    to: "/categories",
  },
  {
    image: b2,
    text: "Artist of the Month",
    titleBold: "",
    titleItalic: "Elena Vance",
    tag: "Artist of the Month",
    sub: "Florence · Oil & Gold Leaf · Twelve Years in Practice",
    desc: "Florence-born Elena Vance brings the Renaissance tradition into the 21st century. Her latest series, 'Golden Hours', captures the interplay of light and memory across twelve monumental canvases.",
    bullets: [
      "Featured in Vogue Italia & Apollo Magazine",
      "Twelve original canvases — only three remain",
      "Studio film & monograph included with every purchase",
    ],
    cta: "VIEW ARTIST PROFILE →",
    to: "/artists/elena-vance",
  },
  {
    image: b1,
    text: "Art in Your Space",
    titleBold: "Art in",
    titleItalic: "Your Space",
    tag: "AR Experience",
    sub: "See it in your room before it ever leaves ours.",
    desc: "Bridge the gap between digital and physical. Visualise any masterpiece in your own environment with perfect scale and lighting fidelity — before it ever leaves the studio.",
    bullets: [
      "Millimetre-accurate scale & shadow simulation",
      "Save preview rooms and share with your designer",
      "Works on any modern iPhone or Android — no app needed",
    ],
    cta: "LAUNCH AR PREVIEW →",
    to: "/ar",
  },
];

/* ── Events ──────────────────────────────────────────────────────── */
const EVENTS_DATA = [
  {
    title: "The Golden Age Exhibition",
    date: "May 15 – June 30, 2025",
    time: "10:00 AM – 8:00 PM · Daily",
    location: "Mumbai, India",
    desc: "A curated journey through contemporary Indian masters exploring gold as medium, metaphor, and memory.",
    img: e1,
    tag: "ONGOING",
  },
  {
    title: "Silence in Motion",
    date: "June 5 – July 20, 2025",
    time: "11:00 AM – 7:00 PM · Tue – Sun",
    location: "Florence, Italy",
    desc: "Kinetic installations that blur the boundary between stillness and movement. Nine artists, one shared language.",
    img: e2,
    tag: "ONGOING",
  },
  {
    title: "Digital Frontiers",
    date: "July 1 – August 15, 2025",
    time: "12:00 PM – 9:00 PM · Daily",
    location: "Berlin, Germany",
    desc: "Generative art redefining what it means to own and experience art in the modern era.",
    img: e3,
    tag: "UPCOMING",
  },
];

/* ── About stacked cards ─────────────────────────────────────────── */
const ABOUT_IMAGES = [p8, a1, p3];

/* ── Preservation floating images (positioned absolutely) ────────── */
const FLOAT_ART = [
  { src: p1, top: "8%", left: "10%", size: 108 },
  { src: p2, top: "20%", left: "30%", size: 84, mobileHide: true },
  { src: p3, top: "5%", left: "50%", size: 70, mobileHide: true },
  { src: p4, top: "10%", right: "12%", size: 116 },
  { src: p5, top: "32%", right: "5%", size: 88, mobileHide: true },
  { src: p6, top: "52%", right: "9%", size: 98, mobileHide: true },
  { src: p7, top: "50%", left: "4%", size: 108, mobileHide: true },
  { src: p2, bottom: "8%", left: "18%", size: 86, mobileHide: true },
  { src: p4, bottom: "16%", left: "44%", size: 68, mobileHide: true },
  { src: p6, bottom: "6%", right: "28%", size: 96, mobileHide: true },
  { src: p3, bottom: "3%", right: "12%", size: 80 },
];

const FLOAT_PARAMS = FLOAT_ART.map((_, i) => ({
  y: [0, -(8 + ((i * 3) % 12)), 0],
  duration: 5 + ((i * 0.7) % 4),
}));

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

/* ═══════════════ SECTION HEADER ═══════════════════════════════════ */
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

/* ═══════════════ CYLINDER CAROUSEL (Highlights) ═══════════════════ */
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
      if (!isDragging) setRotation((r) => r - delta * 0.008);
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
        {items.map((item, i) => (
          <div
            key={i}
            className="carousel-card"
            style={{
              transform: `rotateY(${(360 / items.length) * i}deg) translateZ(420px)`,
            }}>
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
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════ INTERACTIVE MEDIUMS ══════════════════════════════ */
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
            onClick={() => {
              if (isActive) onPick && onPick(m);
              else setActive(i);
            }}
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

/* ═══════════════ TESTIMONIAL COLUMN ═══════════════════════════════ */
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

/* ═══════════════ STACKED CARDS (About) ════════════════════════════ */
function StackedCardsInteraction({ images }) {
  const [hovered, setHovered] = useState(false);
  const STACK = [
    { rotate: -7, x: -16, y: 10 },
    { rotate: 0, x: 0, y: 0 },
    { rotate: 7, x: 16, y: 10 },
  ];
  const SPREAD = [
    { rotate: -20, x: -120, y: 24 },
    { rotate: 0, x: 0, y: -34 },
    { rotate: 20, x: 120, y: 24 },
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

/* ═══════════════ NEW ARRIVALS ROTATOR (3 cards + info) ════════════ */
function NewArrivalsSection({ items, navigate }) {
  const [active, setActive] = useState(0);
  const stageRef = useRef(null);
  const [stageWidth, setStageWidth] = useState(420);
  const timerRef = useRef(null);

  useEffect(() => {
    const onResize = () => {
      if (stageRef.current) setStageWidth(stageRef.current.offsetWidth);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setActive((p) => (p + 1) % items.length),
      4500,
    );
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [items.length]);

  const gap = Math.max(48, Math.min(96, stageWidth * 0.15));
  const stickUp = gap * 0.7;

  const styleFor = (i) => {
    const isActive = i === active;
    const isLeft = (active - 1 + items.length) % items.length === i;
    const isRight = (active + 1) % items.length === i;
    if (isActive)
      return {
        zIndex: 3,
        opacity: 1,
        transform: "translateX(0) translateY(0) scale(1) rotateY(0deg)",
      };
    if (isLeft)
      return {
        zIndex: 2,
        opacity: 1,
        transform: `translateX(-${gap}px) translateY(-${stickUp}px) scale(0.85) rotateY(18deg)`,
      };
    if (isRight)
      return {
        zIndex: 2,
        opacity: 1,
        transform: `translateX(${gap}px) translateY(-${stickUp}px) scale(0.85) rotateY(-18deg)`,
      };
    return { zIndex: 1, opacity: 0, pointerEvents: "none" };
  };

  const current = items[active];

  const advance = () => {
    setActive((p) => (p + 1) % items.length);
    startTimer();
  };

  return (
    <section className="ar-section">
      <div className="ar-inner">
        {/* Left: rotator */}
        <motion.div
          className="ar-rotator-col"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <div className="rot-wrap">
            <div className="rot-glow" />
            <div ref={stageRef} className="rot-stage" onClick={advance}>
              {items.map((it, i) => (
                <div
                  key={i}
                  className="rot-card"
                  style={{
                    ...styleFor(i),
                    transition:
                      "transform 0.9s cubic-bezier(0.4,2,0.3,1), opacity 0.7s ease",
                  }}>
                  <img src={it.image} alt={it.text} />
                  <div className="rot-card-frame" />
                  {it.text && (
                    <div className="rot-card-label">
                      <span>{it.text}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="rot-dots">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActive(i);
                    startTimer();
                  }}
                  className={`rot-dot ${i === active ? "is-active" : ""}`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: animated content per active card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="ar-content-col"
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <div className="gold-rule" style={{ marginBottom: 18 }}>
              <div
                className="grl"
                style={{
                  background: "linear-gradient(90deg,transparent,#D4AF37)",
                  maxWidth: 60,
                }}
              />
              <span className="grt">{current.tag}</span>
              <div
                className="grl"
                style={{
                  background: "linear-gradient(90deg,#D4AF37,transparent)",
                  maxWidth: 60,
                }}
              />
            </div>
            <h2 className="ar-heading">
              {current.titleBold && <>{current.titleBold} </>}
              <em>{current.titleItalic}</em>
            </h2>
            {current.sub && <p className="ar-sub">{current.sub}</p>}
            <p className="ar-desc">{current.desc}</p>
            {current.desc2 && (
              <p className="ar-desc ar-desc-2">{current.desc2}</p>
            )}
            {current.bullets && (
              <ul className="ar-bullets">
                {current.bullets.map((b, i) => (
                  <li key={i} className="ar-bullet">
                    <span className="ar-bullet-mark" />
                    <span className="ar-bullet-text">{b}</span>
                  </li>
                ))}
              </ul>
            )}
            <motion.button
              className="btn-secondary"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(current.to)}>
              {current.cta}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ═══════════════ PRESERVATION — FLOATING ART IMAGES ═══════════════ */
function AnimatedPreservation({ navigate }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="pres-float-section">
      {FLOAT_ART.map(
        ({ src, top, left, right, bottom, size, mobileHide }, i) => (
          <motion.div
            key={i}
            className={`pres-float-img${mobileHide ? " pres-float-hide-mobile" : ""}`}
            style={{ top, left, right, bottom, width: size, height: size }}
            initial={{ opacity: 0, scale: 0.55 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 22,
              delay: i * 0.07,
            }}>
            <motion.img
              src={src}
              alt=""
              draggable={false}
              animate={{ y: FLOAT_PARAMS[i].y }}
              transition={{
                duration: FLOAT_PARAMS[i].duration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </motion.div>
        ),
      )}

      <motion.div
        className="pres-float-center"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.3 }}>
        <div
          className="gold-rule"
          style={{ justifyContent: "center", marginBottom: 20 }}>
          <div
            className="grl"
            style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }}
          />
          <span className="grt">Our Commitment</span>
          <div
            className="grl"
            style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }}
          />
        </div>
        <h2 className="pres-float-heading">
          Preservation
          <br />
          of <em>Art</em>
        </h2>
        <p className="pres-float-desc">
          Art is not merely object — it is memory, culture, and the
          irreplaceable record of human feeling. We are committed to its
          preservation: archiving provenance, supporting restoration, and
          ensuring every work endures for generations to come.
        </p>
        <div className="pres-float-btns">
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/contact")}>
            CONTACT US →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════ 3D TILT EVENT CARD ════════════════════════════════ */
function TiltCard({ event, index, onRegister }) {
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
          {event.time && <div className="event-card-time">{event.time}</div>}
          <div className="event-card-title">{event.title}</div>
          <div className="event-card-loc">{event.location}</div>
          <div className="event-card-desc">{event.desc}</div>
          {event.tag === "UPCOMING" && (
            <motion.button
              className="event-register-btn"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                onRegister();
              }}>
              REGISTER NOW →
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();
  const [heroGallery, setHeroGallery] = useState(FALLBACK_HERO_GALLERY);
  const [carouselItems, setCarouselItems] = useState(FALLBACK_CAROUSEL);
  const [stats, setStats] = useState(HERO_STATS);
  const [loading, setLoading] = useState(true);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured artworks
        const { data: artworks } = await supabase
          .from("artworks")
          .select("id, title, image_url, medium")
          .limit(8);

        if (artworks && artworks.length > 0) {
          // Transform artworks for carousel
          const transformedCarousel = artworks.map((a) => ({
            img: a.image_url || p1,
            title: a.title,
            medium: a.medium || "Artwork",
          }));
          setCarouselItems(transformedCarousel);

          // Transform artworks for hero gallery
          const transformedHero = artworks.slice(0, 12).map((a) => ({
            image: a.image_url || i1,
            text: a.title,
          }));
          if (transformedHero.length > 0) {
            setHeroGallery(transformedHero);
          }
        }

        // Fetch stats
        const [{ count: artworkCount }, { count: artistCount }] =
          await Promise.all([
            supabase
              .from("artworks")
              .select("*", { count: "exact", head: true }),
            supabase
              .from("artists")
              .select("*", { count: "exact", head: true }),
          ]);

        setStats([
          {
            Icon: FrameIcon,
            value: `${artworkCount || 10000}+`,
            label: "Original Artworks",
          },
          {
            Icon: ArtistFigureIcon,
            value: `${artistCount || 2500}+`,
            label: "Talented Artists",
          },
          { Icon: GlobeIcon, value: "50+", label: "Countries" },
          { Icon: ShieldIcon, value: "Secure", label: "Global Delivery" },
          { Icon: SparkIcon, value: "100%", label: "Authentic Artwork" },
        ]);
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const [email, setEmail] = useState("");

  // Register form state
  const [registerEvent, setRegisterEvent] = useState(null);
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [regDone, setRegDone] = useState(false);

  const handleRegSubmit = (e) => {
    e.preventDefault();
    setRegDone(true);
    setTimeout(() => {
      setRegisterEvent(null);
      setRegDone(false);
      setRegForm({ name: "", email: "", phone: "", message: "" });
    }, 2400);
  };

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
          <motion.img
            src={logo}
            alt="Art Coliseum"
            className="hero-logo"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.p
            className="hero-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}>
            Timeless and Priceless Art at your space
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="circ-gallery-wrap">
          <ColiseumCarousel items={heroGallery} />
        </motion.div>

        <motion.div
          className="hero-buttons hero-buttons-below-carousel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}>
          <motion.button
            className="btn-primary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/categories")}>
            EXPLORE GALLERY →
          </motion.button>
        </motion.div>
        {/* 
        <motion.div
          className="stats-bar hero-stats-bar"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.95 }}>
          {HERO_STATS.map(({ Icon, value, label }) => (
            <div className="stat-item hero-stat-item" key={label}>
              <Icon size={28} />
              <span className="stat-value">{value}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </motion.div> */}
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
            <p className="ar-desc" style={{ marginBottom: 18 }}>
              Arrt Coliseum is not a marketplace — it is a sanctuary for art. We
              believe that great art does not need a price tag to prove its
              worth; it speaks through silence, through texture, through the
              quiet authority of a well-considered composition.
            </p>
            <p className="ar-desc" style={{ marginBottom: 28 }}>
              We bring together artists and admirers in a space designed to
              honour the essence of creative work — where every piece is
              presented with the reverence it deserves.
            </p>
            {/* Tagline */}
            <div className="about-tagline">
              Connecting Art. Elevating Creators. Inspiring Spaces.
            </div>
            <div className="about-col-pillars" style={{ marginTop: 28 }}>
              {[
                {
                  num: "01",
                  label: "CURATION",
                  desc: "Every work chosen for its cultural resonance, not commercial appeal.",
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
        <CylinderCarousel items={carouselItems} navigate={navigate} />
      </section>

      {/* ═══════════════════════════════════════════════
          MEDIUMS
      ═══════════════════════════════════════════════ */}
      <section className="section-pad">
        <SectionHeader
          tag="Browse by Medium"
          title="The"
          italic="Mediums"
          sub="Click a medium to expand it — click again to enter the collection."
        />
        <InteractiveMediums
          items={MEDIUMS}
          onPick={(m) => navigate(`/categories/${m.slug}`)}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          NEW ARRIVALS (3-card rotator)
      ═══════════════════════════════════════════════ */}
      <NewArrivalsSection items={ARRIVALS} navigate={navigate} />

      {/* ═══════════════════════════════════════════════
          PRESERVATION OF ART (floating images)
      ═══════════════════════════════════════════════ */}
      <section
        className="section-pad"
        style={{
          background:
            "linear-gradient(180deg,#080808 0%,#0c0a07 50%,#080808 100%)",
          paddingTop: 0,
          paddingBottom: 0,
        }}>
        <AnimatedPreservation navigate={navigate} />
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
            <TiltCard
              key={ev.title}
              event={ev}
              index={i}
              onRegister={() => setRegisterEvent(ev)}
            />
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

      {/* ═══════════════════════════════════════════════
          REGISTER MODAL
      ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {registerEvent && (
          <motion.div
            className="reg-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !regDone && setRegisterEvent(null)}>
            <motion.div
              className="reg-modal"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}>
              {regDone ? (
                <div className="reg-success">
                  <div className="reg-success-icon">✓</div>
                  <h3 className="reg-success-title">Registered!</h3>
                  <p className="reg-success-desc">
                    You've been registered for <em>{registerEvent.title}</em>.
                    We'll be in touch soon.
                  </p>
                </div>
              ) : (
                <>
                  <div className="reg-modal-header">
                    <button
                      className="reg-modal-close"
                      onClick={() => setRegisterEvent(null)}>
                      ×
                    </button>
                    <div className="reg-modal-tag">EVENT REGISTRATION</div>
                    <h3 className="reg-modal-title">{registerEvent.title}</h3>
                    <div className="reg-modal-meta">
                      {registerEvent.location} · {registerEvent.date}
                    </div>
                  </div>
                  <form className="reg-form" onSubmit={handleRegSubmit}>
                    <div className="reg-form-row">
                      <input
                        className="reg-input"
                        required
                        placeholder="Full Name"
                        value={regForm.name}
                        onChange={(e) =>
                          setRegForm((f) => ({ ...f, name: e.target.value }))
                        }
                      />
                      <input
                        className="reg-input"
                        required
                        type="email"
                        placeholder="Email Address"
                        value={regForm.email}
                        onChange={(e) =>
                          setRegForm((f) => ({ ...f, email: e.target.value }))
                        }
                      />
                    </div>
                    <input
                      className="reg-input"
                      placeholder="Phone Number"
                      value={regForm.phone}
                      onChange={(e) =>
                        setRegForm((f) => ({ ...f, phone: e.target.value }))
                      }
                    />
                    <textarea
                      className="reg-input reg-textarea"
                      placeholder="Message (optional)"
                      rows={3}
                      value={regForm.message}
                      onChange={(e) =>
                        setRegForm((f) => ({ ...f, message: e.target.value }))
                      }
                    />
                    <motion.button
                      type="submit"
                      className="btn-primary"
                      style={{ width: "100%", marginTop: 8 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      CONFIRM REGISTRATION →
                    </motion.button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
