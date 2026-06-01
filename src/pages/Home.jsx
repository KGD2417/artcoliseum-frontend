import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { api } from "../utils/api";
import SafeImage from "../components/SafeImage";
import ColiseumCarousel from "../components/ColiseumCarousel";
import { CircularTestimonials } from "../components/ui/CircularTestimonials";
import { GlowCard } from "../components/ui/SpotlightCard";
import { ContainerStagger, ContainerAnimated, GalleryGrid, GalleryGridCell } from "../components/ui/CtaSectionGallery";
import {
  PaletteIcon, ChiselIcon, CameraIcon, ChipIcon,
  FrameIcon, ArtistFigureIcon, GlobeIcon, ShieldIcon, SparkIcon,
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
import m1 from "../assets/mediums/m1.png";
import m2 from "../assets/mediums/m2.png";
import m3 from "../assets/mediums/m3.png";
import m4 from "../assets/mediums/m4.png";
import p1 from "../assets/preservation/p1.png";
import p2 from "../assets/preservation/p2.png";
import p3 from "../assets/preservation/p3.png";
import p4 from "../assets/preservation/p4.png";
import p5 from "../assets/preservation/p5.png";
import p6 from "../assets/preservation/p6.png";
import p7 from "../assets/preservation/p7.png";
import p8 from "../assets/preservation/p8.png";
import a1 from "../assets/About/a1.png";
import b2 from "../assets/3images/b2.png";
import e1 from "../assets/events/e1.png";
import e2 from "../assets/events/e2.png";
import e3 from "../assets/events/e3.png";

/* ── Hero gallery ────────────────────────────────────────────────── */
const HERO_GALLERY = [
  { image: i1, text: "Ethereal Horizon", id: "p1" },
  { image: i2, text: "Eternal Grace", id: null },
  { image: i6, text: "Cosmic Flow", id: "p5" },
  { image: i4, text: "The Golden Tree", id: "p6" },
  { image: i5, text: "Whispers of Silence", id: "p7" },
  {
    image:
      "https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=900&q=80&auto=format&fit=crop",
    text: "Crimson Reverie",
    id: null,
  },
  {
    image:
      "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=900&q=80&auto=format&fit=crop",
    text: "Velvet Mirage",
    id: null,
  },
  { image: i8, text: "Renaissance Study", id: "p8" },
  {
    image:
      "https://images.unsplash.com/photo-1549887534-1541e9326642?w=900&q=80&auto=format&fit=crop",
    text: "Crimson Tides",
    id: null,
  },
  { image: i3, text: "The Infinite Stair", id: "p4" },
  {
    image:
      "https://images.unsplash.com/photo-1551913902-c92207136625?w=900&q=80&auto=format&fit=crop",
    text: "Solstice",
    id: null,
  },
  { image: i7, text: "Ocean Depths", id: "p9" },
];

const FALLBACK_HERO_GALLERY = HERO_GALLERY;

/* ── Highlights carousel ─────────────────────────────────────────── */
const CAROUSEL_ITEMS = [
  { img: p1, title: "Golden Horizon",     medium: "Acrylic on Canvas" },
  { img: p4, title: "Eternal Grace",      medium: "Bronze Sculpture" },
  { img: p6, title: "Cosmic Flow",        medium: "Mixed Media" },
  { img: p7, title: "The Golden Tree",    medium: "Oil on Canvas" },
  { img: p5, title: "Whispers of Silence",medium: "Oil on Canvas" },
  { img: p3, title: "Azure Dreams",       medium: "Mixed Media" },
  { img: p8, title: "Renaissance Study",  medium: "Oil on Panel" },
  { img: p2, title: "Ocean Depths",       medium: "Digital Print" },
];

const FALLBACK_CAROUSEL = CAROUSEL_ITEMS;

/* ── Launch of New Product — circular testimonials ───────────────── */
const PRODUCT_TESTIMONIALS = [
  {
    quote: "Forty-eight new works. Eighteen artists. One season. Each piece a testament to the enduring power of human expression — verified provenance, direct from the artist's studio.",
    name: "New Collection",
    designation: "48 works · Oil, Sculpture & Photography",
    src: i4,
    tag: "NEW ARRIVALS",
  },
  {
    quote: "The most coveted works of this season — from emerging masters whose voices are reshaping contemporary art. Members receive 48-hour early access before public launch.",
    name: "Early Access",
    designation: "Members-only · 48 hrs before public",
    src: i1,
    tag: "EXCLUSIVE",
  },
  {
    quote: "A new chapter in art begins. Every work presented with full documentation, artist monograph, and our authenticity guarantee. Art that will endure for generations.",
    name: "Guaranteed Authentic",
    designation: "Provenance-verified · Framing included",
    src: i6,
    tag: "COLLECTION",
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

/* ── Flip gallery images ─────────────────────────────────────────── */
const FLIP_IMAGES = [
  { title: "Golden Horizon",    url: i1 },
  { title: "Eternal Grace",     url: i2 },
  { title: "Azure Dreams",      url: i3 },
  { title: "The Golden Tree",   url: i4 },
  { title: "Whispers of Silence", url: i5 },
  { title: "Cosmic Flow",       url: i6 },
];

/* ── About stacked cards ─────────────────────────────────────────── */
const ABOUT_IMAGES = [p8, a1, p3];

/* ── Preservation floating images ────────────────────────────────── */
const FLOAT_ART = [
  { src: p1, top: "8%",   left: "10%",  size: 108 },
  { src: p2, top: "20%",  left: "30%",  size: 84,  mobileHide: true },
  { src: p3, top: "5%",   left: "50%",  size: 70,  mobileHide: true },
  { src: p4, top: "10%",  right: "12%", size: 116 },
  { src: p5, top: "32%",  right: "5%",  size: 88,  mobileHide: true },
  { src: p6, top: "52%",  right: "9%",  size: 98,  mobileHide: true },
  { src: p7, top: "50%",  left: "4%",   size: 108, mobileHide: true },
  { src: p2, bottom: "8%", left: "18%", size: 86,  mobileHide: true },
  { src: p4, bottom: "16%",left: "44%", size: 68,  mobileHide: true },
  { src: p6, bottom: "6%", right: "28%",size: 96,  mobileHide: true },
  { src: p3, bottom: "3%", right: "12%",size: 80 },
];

const FLOAT_PARAMS = FLOAT_ART.map((_, i) => ({
  y: [0, -(8 + ((i * 3) % 12)), 0],
  duration: 5 + ((i * 0.7) % 4),
}));

/* ── MEDIUMS ─────────────────────────────────────────────────────── */
const MEDIUMS = [
  { slug: "paintings",   label: "Paintings",    sub: "Oil, Acrylic & Watercolor",    count: "2,400+ works", Icon: PaletteIcon, img: m1 },
  { slug: "sculptures",  label: "Sculptures",   sub: "Bronze, Marble & Mixed Media", count: "840+ works",   Icon: ChiselIcon,  img: m2 },
  { slug: "photography", label: "Photography",  sub: "Fine Art & Documentary",       count: "1,200+ works", Icon: CameraIcon,  img: m3 },
  { slug: "digital",     label: "Digital",      sub: "NFT & Generative Canvas",      count: "3,600+ works", Icon: ChipIcon,    img: m4 },
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
        <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }} />
        <span className="grt">{tag}</span>
        <div className="grl" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
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
            fontFamily: "'Raleway',sans-serif", fontSize: 14,
            color: "rgba(200,191,160,0.6)", maxWidth: 560, margin: "14px auto 0", lineHeight: 1.7,
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
  const [dims, setDims] = useState({ w: 240, h: 320, r: 420 });
  const [isMobile, setIsMobile] = useState(false);
  const wrapRef = useRef(null);
  const startX = useRef(0);
  const startRot = useRef(0);

  useEffect(() => {
    const recompute = () => {
      const vw = window.innerWidth;
      setIsMobile(vw <= 640);
      const avail = Math.min(vw - 32, 1100);
      const w = Math.round(Math.max(160, Math.min(240, avail * 0.38)));
      const h = Math.round(w * (320 / 240));
      const r = Math.max(220, Math.round(avail / 2 - w * 0.42));
      setDims({ w, h, r });
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);

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

  /* ── Mobile: horizontal scroll strip ── */
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ marginTop: 32 }}>
        <div style={{
          display: "flex", gap: 14,
          overflowX: "auto", paddingBottom: 12,
          paddingLeft: 20, paddingRight: 20,
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none", scrollbarWidth: "none",
        }}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              onClick={() => navigate("/gallery")}
              style={{
                flex: "0 0 200px", height: 270,
                borderRadius: 14, overflow: "hidden",
                position: "relative", cursor: "pointer",
                border: "1px solid rgba(212,175,55,0.2)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                scrollSnapAlign: "start",
              }}>
              <img src={item.img} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.1) 55%)" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>{item.title}</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.14em", color: "#D4AF37", marginTop: 4 }}>{item.medium}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 20, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,191,160,0.35)" }}>
          SWIPE TO EXPLORE
        </div>
      </motion.div>
    );
  }

  /* ── Desktop: 3D cylinder ── */
  return (
    <motion.div
      ref={wrapRef}
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      className="carousel-wrap"
      style={{ cursor: isDragging ? "grabbing" : "grab", height: dims.h + 120 }}
      onMouseDown={handleDown}
      onMouseMove={handleMove}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      onTouchStart={handleDown}
      onTouchMove={handleMove}
      onTouchEnd={handleUp}>
      <div style={{
        position: "relative", width: dims.w, height: dims.h,
        transformStyle: "preserve-3d",
        transform: `rotateY(${rotation}deg)`,
        transition: isDragging ? "none" : "transform 0.1s linear",
      }}>
        {items.map((item, i) => (
          <div
            key={i}
            className="carousel-card"
            style={{
              width: dims.w, height: dims.h,
              transform: `rotateY(${(360 / items.length) * i}deg) translateZ(${dims.r}px)`,
            }}>
            <img src={item.img} alt={item.title} className="carousel-card-img" />
            <div className="carousel-glass">
              <div className="carousel-glass-title">{item.title}</div>
              <div className="carousel-glass-medium">{item.medium}</div>
              <button className="carousel-glass-btn" onClick={() => navigate("/gallery")}>View Artwork ›</button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════ STACKED CARDS (About) ════════════════════════════ */
function StackedCardsInteraction({ images }) {
  const [hovered, setHovered] = useState(false);
  const STACK  = [{ rotate: -7, x: -16, y: 10 }, { rotate: 0, x: 0, y: 0 }, { rotate: 7, x: 16, y: 10 }];
  const SPREAD = [{ rotate: -20, x: -120, y: 24 }, { rotate: 0, x: 0, y: -34 }, { rotate: 20, x: 120, y: 24 }];
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
      x: ((e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)) * -10,
      y: ((e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)) * 10,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
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
          <div className={`event-card-tag event-tag-${event.tag.toLowerCase()}`}>{event.tag}</div>
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
              onClick={(e) => { e.stopPropagation(); onRegister(); }}>
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
  const [heroGallery,   setHeroGallery]   = useState(FALLBACK_HERO_GALLERY);
  const [carouselItems, setCarouselItems] = useState(FALLBACK_CAROUSEL);
  const [eventsData,    setEventsData]    = useState(EVENTS_DATA);
  const [email, setEmail]                 = useState("");
  const [registerEvent, setRegisterEvent] = useState(null);
  const [regForm, setRegForm]             = useState({ name: "", email: "", phone: "", message: "" });
  const [regDone, setRegDone]             = useState(false);

  // Featured paintings (hero + "Art of Seasons") come from the database.
  // Falls back to the static gallery only if the API is unreachable.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let arts = await api.catalog.artworks({ featured: true });
        if (!arts || arts.length === 0) arts = await api.catalog.artworks({});
        if (cancelled || !arts || arts.length === 0) return;
        const withImg = arts.filter((a) => a.images && a.images.length);
        const src = (withImg.length ? withImg : arts).slice(0, 12);
        setHeroGallery(src.map((a) => ({ image: a.images?.[0], text: a.title, id: a.id })));
        setCarouselItems(src.map((a) => ({ img: a.images?.[0], title: a.title, medium: a.medium || "" })));
      } catch { /* keep fallback assets */ }
    })();
    return () => { cancelled = true; };
  }, []);

  // Events come from the database (ongoing + upcoming).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.events.list();
        if (cancelled || !data || data.length === 0) return;
        const fmtDate = (s, e) => {
          if (!s) return "";
          const d1 = new Date(s).toLocaleDateString("en-US", { month: "long", day: "numeric" });
          const d2 = e ? new Date(e).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
          return d2 ? `${d1} – ${d2}` : d1;
        };
        const mapped = data
          .filter((r) => r.status !== "past")
          .slice(0, 3)
          .map((r) => ({
            title: r.title,
            date: fmtDate(r.starts_at, r.ends_at),
            time: "",
            location: r.location || "",
            desc: r.description || "",
            img: r.image_url || e1,
            tag: (r.status || "ongoing").toUpperCase(),
          }));
        if (mapped.length) setEventsData(mapped);
      } catch { /* keep fallback */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleRegSubmit = (e) => {
    e.preventDefault();
    setRegDone(true);
    setTimeout(() => {
      setRegisterEvent(null);
      setRegDone(false);
      setRegForm({ name: "", email: "", phone: "", message: "" });
    }, 2400);
  };

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
            transition={{ duration: 0.7, delay: 0.4 }}
            style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
              fontSize: "clamp(16px, 1.45vw, 22px)", letterSpacing: "0.18em",
              lineHeight: 1.7, color: "rgba(246,242,234,0.85)", marginTop: 18, padding: "0 18px",
            }}>
            <span style={{ color: "#D4AF37" }}>Timeless</span> &nbsp;and&nbsp;{" "}
            <span style={{ color: "#D4AF37" }}>Priceless</span> Art &nbsp;at your space
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
      </section>

      {/* ═══════════════════════════════════════════════
          ABOUT ART COLISEUM
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
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
            <div className="gold-rule" style={{ marginBottom: 20 }}>
              <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)", maxWidth: 60 }} />
              <span className="grt">Our Story</span>
              <div className="grl" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)", maxWidth: 60 }} />
            </div>
            <h2 className="ar-heading">About <em>Art Coliseum</em></h2>
            <p className="ar-desc" style={{ marginBottom: 18 }}>
              Art Coliseum is not a marketplace — it is a sanctuary for art. We believe that great art does
              not need a price tag to prove its worth; it speaks through silence, through texture, through
              the quiet authority of a well-considered composition.
            </p>
            <p className="ar-desc" style={{ marginBottom: 28 }}>
              We bring together artists and admirers in a space designed to honour the essence of creative
              work — where every piece is presented with the reverence it deserves.
            </p>
            <div className="about-tagline">Connecting Art. Elevating Creators. Inspiring Spaces.</div>
            <div className="about-col-pillars" style={{ marginTop: 28 }}>
              {[
                { num: "01", label: "CURATION",      desc: "Every work chosen for its cultural resonance, not commercial appeal." },
                { num: "02", label: "AUTHENTICITY",  desc: "Provenance, artist narratives, and full documentation for every piece." },
                { num: "03", label: "EXPERIENCE",    desc: "A gallery without walls — art you can live with, not just look at." },
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
          ART OF SEASONS — Gallery Highlights
      ═══════════════════════════════════════════════ */}
      <section className="home-sec" style={{
        background: "linear-gradient(180deg,#080808 0%,#0c0a07 50%,#080808 100%)",
        overflowX: "hidden",
        paddingBottom: 160,
      }}>
        <SectionHeader
          tag="Curator's Picks"
          title="Art of"
          italic="Seasons"
          sub="A rotating selection of the most coveted works in our collection — drag the cylinder to explore."
        />
        <CylinderCarousel items={carouselItems} navigate={navigate} />
      </section>

      {/* Section divider */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", background: "#080808" }}>
        <div style={{ width: "min(480px, 60%)", height: 1, background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.25), transparent)" }} />
      </div>

      {/* ═══════════════════════════════════════════════
          LAUNCH OF NEW PRODUCT
      ═══════════════════════════════════════════════ */}
      <section className="home-sec home-inline-section" style={{
        background: "linear-gradient(180deg,#080808 0%,#0d0a06 50%,#080808 100%)",
        paddingTop: 160,
      }}>
        <div className="home-launch-inner">
          {/* Left: rotating card carousel */}
          <motion.div
            className="home-launch-visual"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <CircularTestimonials
              imagesOnly
              cardHeight="480px"
              testimonials={PRODUCT_TESTIMONIALS}
              autoplay={true}
              colors={{
                arrowBackground:      "#1a1612",
                arrowForeground:      "#D4AF37",
                arrowHoverBackground: "rgba(212,175,55,0.25)",
              }}
            />
          </motion.div>

          {/* Right: text */}
          <motion.div
            className="home-launch-text"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
            <div className="gold-rule" style={{ marginBottom: 24 }}>
              <div className="grl" style={{ background: "linear-gradient(90deg, transparent, #D4AF37)" }} />
              <span className="grt">NEW ARRIVALS</span>
              <div className="grl" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
            </div>

            <h2 style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(36px,4.5vw,64px)", fontWeight: 400,
              color: "#fff", lineHeight: 1.15, margin: "0 0 16px",
            }}>
              Launch of{" "}
              <em style={{ color: "#D4AF37", fontStyle: "italic" }}>New Product</em>
            </h2>

            <p style={{
              fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic",
              fontSize: 18, color: "#D4AF37", marginBottom: 24, lineHeight: 1.6,
            }}>
              Forty-eight new works. Eighteen artists. One season.
            </p>

            <p style={{
              fontFamily: "'Cormorant Garamond',serif", fontSize: 18,
              color: "rgba(200,191,160,0.75)", lineHeight: 1.8, marginBottom: 28,
            }}>
              A new chapter in art begins. Our latest curated collection brings together emerging
              and established artists — each piece a testament to the enduring power of human expression.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 0 0", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                "48 new works across painting, sculpture & photography",
                "Verified provenance, direct from each artist's studio",
                "Members get 48-hour early access",
              ].map((b, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#D4AF37", flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: "'Raleway',sans-serif", fontSize: 14,
                    color: "rgba(200,191,160,0.75)", letterSpacing: "0.03em",
                  }}>{b}</span>
                </li>
              ))}
            </ul>

            <motion.button
              className="btn-secondary"
              style={{ marginTop: 40 }}
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
      <section className="home-sec" style={{
        background: "linear-gradient(180deg,#080808 0%,#0d0b08 60%,#080808 100%)",
      }}>
        <SectionHeader
          tag="Ongoing & Upcoming"
          title=""
          italic="Events"
          sub="Immersive exhibitions and curated experiences from across the globe."
        />
        <div className="events-tilt-grid">
          {eventsData.map((ev, i) => (
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
          ARTIST OF THE MONTH
      ═══════════════════════════════════════════════ */}
      <section className="home-sec" style={{
        background: "linear-gradient(180deg,#080808 0%,#0c0a07 50%,#080808 100%)",
      }}>
        <div className="home-launch-inner">
          {/* Left: text */}
          <motion.div
            className="home-launch-text"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: 520 }}>
            <div className="gold-rule" style={{ marginBottom: 24 }}>
              <div className="grl" style={{ background: "linear-gradient(90deg, transparent, #D4AF37)" }} />
              <span className="grt">ARTIST OF THE MONTH</span>
              <div className="grl" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
            </div>

            <h2 style={{
              fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic",
              fontSize: "clamp(48px,5vw,72px)", fontWeight: 400,
              color: "#D4AF37", lineHeight: 1.1, margin: "0 0 14px",
            }}>Elena Vance</h2>

            <p style={{
              fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic",
              fontSize: 17, color: "#D4AF37", marginBottom: 24,
            }}>
              Florence · Oil &amp; Gold Leaf · Twelve Years in Practice
            </p>

            <p style={{
              fontFamily: "'Cormorant Garamond',serif", fontSize: 18,
              color: "rgba(200,191,160,0.75)", lineHeight: 1.8, marginBottom: 28,
            }}>
              Florence-born Elena Vance brings the Renaissance tradition into the 21st century.
              Her latest series, 'Golden Hours', captures the interplay of light and memory across
              twelve monumental canvases.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 0 0", display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Featured in Vogue Italia & Apollo Magazine",
                "Twelve original canvases — only three remain",
                "Studio film & monograph included with every purchase",
              ].map((b, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#D4AF37", flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: "'Raleway',sans-serif", fontSize: 14,
                    color: "rgba(200,191,160,0.75)", letterSpacing: "0.03em",
                  }}>{b}</span>
                </li>
              ))}
            </ul>

            <motion.button
              className="btn-secondary"
              style={{ marginTop: 40 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/artists/elena-vance")}>
              VIEW ARTIST PROFILE →
            </motion.button>
          </motion.div>

          {/* Right: photo with light golden glow */}
          <motion.div
            className="home-launch-visual"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", justifyContent: "center" }}>
            <GlowCard
              glowColor="gold"
              width={360}
              height={480}
              style={{
                "--lightness": "88",
                "--saturation": "85",
                "--bg-spot-opacity": "0.18",
                "--size": "320",
                "--backup-border": "rgba(212,175,55,0.45)",
                "--backdrop": "rgba(212,175,55,0.06)",
              }}
            >
              <img
                src={b2}
                alt="Elena Vance"
                style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: "cover", borderRadius: 14,
                }}
              />
            </GlowCard>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          PRESERVATION OF ART
      ═══════════════════════════════════════════════ */}
      <section className="home-sec" style={{
        background: "linear-gradient(180deg,#080808 0%,#0c0a07 50%,#080808 100%)",
      }}>
        <AnimatedPreservation navigate={navigate} />
      </section>

      {/* ═══════════════════════════════════════════════
          ART IN YOUR SPACE — CTA Gallery
      ═══════════════════════════════════════════════ */}
      <section className="home-sec" style={{
        background: "linear-gradient(180deg,#080808 0%,#0d0a06 50%,#080808 100%)",
      }}>
        <div className="home-art-space-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: 64,
          maxWidth: 1200,
          margin: "0 auto",
        }}>
          {/* Left: staggered text */}
          <ContainerStagger style={{ display: "flex", flexDirection: "column" }}>
            <ContainerAnimated>
              <div className="gold-rule" style={{ marginBottom: 24 }}>
                <div className="grl" style={{ background: "linear-gradient(90deg, transparent, #D4AF37)" }} />
                <span className="grt">ART IN YOUR SPACE</span>
                <div className="grl" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
              </div>
            </ContainerAnimated>

            <ContainerAnimated>
              <h2 style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: "clamp(38px,4vw,58px)", fontWeight: 400,
                color: "#fff", lineHeight: 1.15, margin: "0 0 18px",
              }}>
                Art in{" "}
                <em style={{ color: "#D4AF37", fontStyle: "italic" }}>Your Space</em>
              </h2>
            </ContainerAnimated>

            <ContainerAnimated>
              <p style={{
                fontFamily: "'Cormorant Garamond',serif", fontSize: 18,
                color: "rgba(200,191,160,0.75)", lineHeight: 1.8, marginBottom: 28,
              }}>
                Visualise any masterpiece in your own environment with millimetre-accurate
                scale and shadow simulation — before it ever leaves the studio.
              </p>
            </ContainerAnimated>

            <ContainerAnimated>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Millimetre-accurate scale & shadow simulation",
                  "Save preview rooms and share with your designer",
                  "Works on any modern smartphone — no app needed",
                ].map((b, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4AF37", flexShrink: 0 }} />
                    <span style={{
                      fontFamily: "'Raleway',sans-serif", fontSize: 14,
                      color: "rgba(200,191,160,0.75)", letterSpacing: "0.03em",
                    }}>{b}</span>
                  </li>
                ))}
              </ul>
            </ContainerAnimated>

            <ContainerAnimated>
              <motion.button
                className="btn-secondary"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/gallery")}>
                EXPLORE GALLERY →
              </motion.button>
            </ContainerAnimated>
          </ContainerStagger>

          {/* Right: gallery grid */}
          <GalleryGrid>
            {[m1, m2, m3, m4].map((src, index) => (
              <GalleryGridCell key={index} index={index} src={src} alt={`Gallery ${index + 1}`} />
            ))}
          </GalleryGrid>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          NEWSLETTER
      ═══════════════════════════════════════════════ */}
      <motion.section
        className="newsletter-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8 }}>
        <div className="gold-rule" style={{ justifyContent: "center", marginBottom: 22 }}>
          <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }} />
          <span className="grt">Newsletter</span>
          <div className="grl" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
        </div>
        <h2 className="section-heading" style={{ marginBottom: 14 }}>Stay <em>Cultivated</em></h2>
        <p className="newsletter-sub">Receive exclusive invitations to private viewings and new artist debuts.</p>
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
                    You've been registered for <em>{registerEvent.title}</em>. We'll be in touch soon.
                  </p>
                </div>
              ) : (
                <>
                  <div className="reg-modal-header">
                    <button className="reg-modal-close" onClick={() => setRegisterEvent(null)}>×</button>
                    <div className="reg-modal-tag">EVENT REGISTRATION</div>
                    <h3 className="reg-modal-title">{registerEvent.title}</h3>
                    <div className="reg-modal-meta">{registerEvent.location} · {registerEvent.date}</div>
                  </div>
                  <form className="reg-form" onSubmit={handleRegSubmit}>
                    <div className="reg-form-row">
                      <input className="reg-input" required placeholder="Full Name" value={regForm.name} onChange={(e) => setRegForm(f => ({ ...f, name: e.target.value }))} />
                      <input className="reg-input" required type="email" placeholder="Email Address" value={regForm.email} onChange={(e) => setRegForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <input className="reg-input" placeholder="Phone Number" value={regForm.phone} onChange={(e) => setRegForm(f => ({ ...f, phone: e.target.value }))} />
                    <textarea className="reg-input reg-textarea" placeholder="Message (optional)" rows={3} value={regForm.message} onChange={(e) => setRegForm(f => ({ ...f, message: e.target.value }))} />
                    <motion.button type="submit" className="btn-primary" style={{ width: "100%", marginTop: 8 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
