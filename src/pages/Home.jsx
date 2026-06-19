import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { api } from "../utils/api";
import { useAuth } from "../context/Auth";
import SafeImage from "../components/SafeImage";
import ColiseumCarousel from "../components/ColiseumCarousel";
import { CircularTestimonials } from "../components/ui/CircularTestimonials";
import TestimonialColumns from "../components/ui/TestimonialColumns";
import { GlowCard } from "../components/ui/SpotlightCard";
import {
  ContainerStagger,
  ContainerAnimated,
  GalleryGrid,
  GalleryGridCell,
} from "../components/ui/CtaSectionGallery";
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

/* ── Flip gallery images ─────────────────────────────────────────── */
const FLIP_IMAGES = [
  { title: "Golden Horizon", url: i1 },
  { title: "Eternal Grace", url: i2 },
  { title: "Azure Dreams", url: i3 },
  { title: "The Golden Tree", url: i4 },
  { title: "Whispers of Silence", url: i5 },
  { title: "Cosmic Flow", url: i6 },
];

/* ── About stacked cards ─────────────────────────────────────────── */
const ABOUT_IMAGES = [p8, a1, p3];

/* ── Preservation floating images ────────────────────────────────── */
// Scattered all around the centre panel — across the top & bottom bands and
// down both sides at varied depths — but never behind the panel itself.
const FLOAT_ART = [
  // top band — spans the full width, above the panel
  { src: p1, top: "3%", left: "11%", size: 96 },
  { src: p3, top: "2%", left: "41%", size: 72, mobileHide: true },
  { src: p5, top: "4%", left: "59%", size: 70, mobileHide: true },
  { src: p4, top: "3%", right: "12%", size: 104 },
  // left region — varied depth
  { src: p2, top: "26%", left: "3%", size: 90, mobileHide: true },
  { src: p7, top: "48%", left: "8%", size: 104, mobileHide: true },
  { src: p6, top: "70%", left: "2%", size: 84, mobileHide: true },
  { src: p3, top: "40%", left: "21%", size: 62, mobileHide: true },
  // right region — varied depth
  { src: p5, top: "28%", right: "5%", size: 86, mobileHide: true },
  { src: p6, top: "52%", right: "2%", size: 100, mobileHide: true },
  { src: p2, top: "72%", right: "8%", size: 76, mobileHide: true },
  { src: p4, top: "44%", right: "21%", size: 60, mobileHide: true },
  // bottom band — spans the full width, below the panel
  { src: p4, bottom: "3%", left: "13%", size: 80 },
  { src: p2, bottom: "2%", left: "42%", size: 72, mobileHide: true },
  { src: p6, bottom: "4%", left: "60%", size: 74, mobileHide: true },
  { src: p1, bottom: "3%", right: "13%", size: 86 },
];

const FLOAT_PARAMS = FLOAT_ART.map((_, i) => ({
  y: [0, -(8 + ((i * 3) % 12)), 0],
  duration: 5 + ((i * 0.7) % 4),
}));

/* ── MEDIUMS ─────────────────────────────────────────────────────── */
const MEDIUMS = [
  {
    slug: "paintings",
    label: "Paintings",
    sub: "Oil, Acrylic & Watercolor",
    count: "2,400+ works",
    Icon: PaletteIcon,
    img: m1,
  },
  {
    slug: "sculptures",
    label: "Sculptures",
    sub: "Bronze, Marble & Mixed Media",
    count: "840+ works",
    Icon: ChiselIcon,
    img: m2,
  },
  {
    slug: "photography",
    label: "Photography",
    sub: "Fine Art & Documentary",
    count: "1,200+ works",
    Icon: CameraIcon,
    img: m3,
  },
  {
    slug: "digital",
    label: "Digital",
    sub: "NFT & Generative Canvas",
    count: "3,600+ works",
    Icon: ChipIcon,
    img: m4,
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
  const [dims, setDims] = useState({ w: 185, h: 247, r: 296 });
  const [isMobile, setIsMobile] = useState(false);
  const wrapRef = useRef(null);
  const startX = useRef(0);
  const startRot = useRef(0);

  useEffect(() => {
    const recompute = () => {
      const vw = window.innerWidth;
      setIsMobile(vw <= 640);
      const avail = Math.min(vw - 32, 1100);
      // Reduced from 0.38 / max 240 → 0.24 / max 160 for smaller cards
      const w = Math.round(Math.max(140, Math.min(200, avail * 0.28)));
      const h = Math.round(w * (320 / 240));
      // Radius tied to card width so gap stays tight regardless of viewport
      const r = Math.round(w * 1.6);
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
        <div
          style={{
            display: "flex",
            gap: 14,
            overflowX: "auto",
            paddingBottom: 12,
            paddingLeft: 20,
            paddingRight: 20,
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}>
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              onClick={() =>
                navigate(item.id ? `/product/${item.id}` : "/categories")
              }
              style={{
                flex: "0 0 200px",
                height: 270,
                borderRadius: 14,
                overflow: "hidden",
                position: "relative",
                cursor: "pointer",
                border: "1px solid rgba(212,175,55,0.2)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
                scrollSnapAlign: "start",
              }}>
              <img
                src={item.img}
                alt={item.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.1) 55%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "14px 16px",
                }}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#fff",
                    lineHeight: 1.2,
                  }}>
                  {item.title}
                </div>
                <div
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: 8,
                    letterSpacing: "0.14em",
                    color: "#D4AF37",
                    marginTop: 4,
                  }}>
                  {item.medium}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: 20,
            fontFamily: "'Cinzel',serif",
            fontSize: 9,
            letterSpacing: "0.16em",
            color: "rgba(200,191,160,0.35)",
          }}>
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
      <div
        style={{
          position: "relative",
          width: dims.w,
          height: dims.h,
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotation}deg)`,
          transition: isDragging ? "none" : "transform 0.1s linear",
        }}>
        {items.map((item, i) => (
          <div
            key={i}
            className="carousel-card"
            style={{
              width: dims.w,
              height: dims.h,
              transform: `rotateY(${(360 / items.length) * i}deg) translateZ(${dims.r}px)`,
              cursor: item.id ? "pointer" : "grab",
            }}
            onClick={() => {
              if (!isDragging && item.id) navigate(`/product/${item.id}`);
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
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(item.id ? `/product/${item.id}` : "/categories");
                }}>
                View Artwork ›
              </button>
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
  const STACK = [
    { rotate: -7, x: -14, y: 8 },
    { rotate: 0, x: 0, y: 0 },
    { rotate: 7, x: 14, y: 8 },
  ];
  const SPREAD = [
    { rotate: -16, x: -90, y: 18 },
    { rotate: 0, x: 0, y: -26 },
    { rotate: 16, x: 90, y: 18 },
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

/* ═══════════════ PRESERVATION — FLOATING ART IMAGES ═══════════════ */
// Default photos; admin can replace the set (Admin → Homepage). They cycle
// across the fixed floating positions.
const DEFAULT_PRES_IMAGES = [p1, p2, p3, p4, p5, p6, p7, p8];

function AnimatedPreservation({ navigate, images }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const pics = images && images.length ? images : DEFAULT_PRES_IMAGES;
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
              src={pics[i % pics.length] || src}
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
            CONNECT PRESERVATION TEAM →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════ 3D TILT EVENT CARD ════════════════════════════════ */
function TiltCard({ event, index, onRegister, registered }) {
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
          {(event.tag === "UPCOMING" || event.tag === "ONGOING") && (
            <motion.button
              className="event-register-btn"
              whileHover={{ scale: registered ? 1 : 1.04 }}
              whileTap={{ scale: registered ? 1 : 0.97 }}
              disabled={registered}
              style={
                registered ? { opacity: 0.85, cursor: "default" } : undefined
              }
              onClick={(e) => {
                e.stopPropagation();
                if (!registered) onRegister();
              }}>
              {registered ? "REGISTERED ✓" : "REGISTER NOW →"}
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
  const { user } = useAuth();
  const [heroGallery, setHeroGallery] = useState([]);
  const [carouselItems, setCarouselItems] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [news, setNews] = useState([]);
  const [preservationImgs, setPreservationImgs] = useState([]); // admin-editable
  const [featured, setFeatured] = useState(null); // Artist of the Month
  const [newLaunch, setNewLaunch] = useState([]); // newest products, from backend
  const [email, setEmail] = useState("");
  const [registerEvent, setRegisterEvent] = useState(null);
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [regDone, setRegDone] = useState(false);
  const [regBusy, setRegBusy] = useState(false);
  const [regProfile, setRegProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [registeredIds, setRegisteredIds] = useState(() => new Set());

  // Logged-in collectors: prefill the registration form and load which events
  // they've already registered for (mirrors the Events page).
  useEffect(() => {
    if (!user) return;
    api.auth
      .me()
      .then((m) =>
        setRegProfile({
          name: m?.full_name || "",
          email: m?.user?.email || user.email || "",
          phone: m?.phone || "",
        }),
      )
      .catch(() => {});
    api.events
      .myRegistrations()
      .then((rows) => setRegisteredIds(new Set((rows || []).map((r) => r.id))))
      .catch(() => {});
  }, [user]);

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
        setHeroGallery(
          src.map((a) => ({ image: a.images?.[0], text: a.title, id: a.id })),
        );
        setCarouselItems(
          src.map((a) => ({
            img: a.images?.[0],
            title: a.title,
            medium: a.medium || "",
            id: a.id,
          })),
        );
      } catch {
        /* keep fallback assets */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Preservation-section images — admin-editable (Admin → Homepage).
  useEffect(() => {
    api.site
      .getPreservation()
      .then((d) => {
        if (d?.images?.length) setPreservationImgs(d.images);
      })
      .catch(() => {});
  }, []);

  // Artist of the Month spotlight — a real artist from the catalog (prefers one
  // with the most works + a photo). Section hides itself when there are none.
  useEffect(() => {
    let cancelled = false;
    api.catalog
      .artists()
      .then((rows) => {
        if (cancelled || !rows || rows.length === 0) return;
        const ranked = [...rows].sort(
          (a, b) => (b.works_count || 0) - (a.works_count || 0),
        );
        setFeatured(ranked.find((a) => a.image_url) || ranked[0]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // "Launch of New Product" — the most recently added live artworks, so a new
  // product appears here automatically the moment it goes live. Falls back to
  // the editorial cards only when the catalog is empty.
  useEffect(() => {
    let cancelled = false;
    api.catalog
      .artworks({})
      .then((arts) => {
        if (cancelled || !arts || arts.length === 0) return;
        // Backend returns active works oldest→newest; take the most recent few.
        const withImg = arts.filter((a) => a.images && a.images.length);
        const newest = (withImg.length ? withImg : arts).slice(-6).reverse();
        setNewLaunch(
          newest.map((a) => ({
            id: a.id,
            src: a.images?.[0],
            name: a.title,
            designation: [a.artist_name, a.medium].filter(Boolean).join(" · "),
            quote:
              a.narrative ||
              a.description ||
              "A new work, fresh from the studio.",
            tag: "NEW",
          })),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
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
          const d1 = new Date(s).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          });
          const d2 = e
            ? new Date(e).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "";
          return d2 ? `${d1} – ${d2}` : d1;
        };
        // Stored in UTC → render in the viewer's timezone, with the zone shown.
        const tzShort = (d) => {
          try {
            return (
              new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
                .formatToParts(d)
                .find((p) => p.type === "timeZoneName")?.value || ""
            );
          } catch {
            return "";
          }
        };
        const fmtTime = (s, e) => {
          if (!s) return "";
          const t1 = new Date(s);
          const opt = { hour: "numeric", minute: "2-digit", hour12: true };
          const tz = tzShort(t1);
          const str1 = t1.toLocaleTimeString("en-US", opt);
          const t2 = e ? new Date(e) : null;
          if (!t2) return `${str1} ${tz}`;
          return `${str1} – ${t2.toLocaleTimeString("en-US", opt)} ${tz}`;
        };
        // Ongoing first, then upcoming — both are registerable; past is excluded.
        const order = { ongoing: 0, upcoming: 1 };
        const mapped = data
          .filter((r) => r.status !== "past")
          .sort((a, b) => (order[a.status] ?? 2) - (order[b.status] ?? 2))
          .slice(0, 3)
          .map((r) => ({
            id: r.id,
            title: r.title,
            date: fmtDate(r.starts_at, r.ends_at),
            time: fmtTime(r.starts_at, r.ends_at),
            location: r.location || "",
            desc: r.description || "",
            img: r.image_url || e1,
            tag: (r.status || "ongoing").toUpperCase(),
          }));
        if (mapped.length) setEventsData(mapped);
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Collector testimonials are admin-managed (Admin → Testimonials).
  // Falls back to the curated defaults only if none are published / API is down.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.testimonials.list();
        if (cancelled || !rows || rows.length === 0) return;
        setTestimonials(
          rows.map((r) => ({
            quote: r.quote,
            name: r.name,
            designation: r.designation || "",
            src: r.image_url || logo,
            tag: r.tag || "COLLECTOR",
          })),
        );
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Latest news is admin-managed (Admin → News). No fake fallback — the section
  // only renders when there are real published items.
  useEffect(() => {
    let cancelled = false;
    api.news
      .list()
      .then((rows) => {
        if (!cancelled) setNews(rows || []);
      })
      .catch(() => {
        if (!cancelled) setNews([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Open the registration modal, prefilling from the collector's profile.
  const openRegister = (ev) => {
    setRegisterEvent(ev);
    setRegDone(false);
    setRegForm({
      name: regProfile.name,
      email: regProfile.email,
      phone: regProfile.phone,
      message: "",
    });
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    if (regBusy) return;
    // Real backend events carry an id — persist the registration. Demo fallback
    // events (no id) just show the confirmation.
    if (registerEvent?.id) {
      setRegBusy(true);
      try {
        await api.events.register(registerEvent.id, {
          name: regForm.name,
          email: regForm.email,
          phone: regForm.phone,
          message: regForm.message,
        });
        setRegisteredIds((prev) => new Set(prev).add(registerEvent.id));
      } catch (err) {
        alert(err.message);
        setRegBusy(false);
        return;
      }
      setRegBusy(false);
    }
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
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "clamp(16px, 1.45vw, 22px)",
              letterSpacing: "0.18em",
              lineHeight: 1.7,
              color: "rgba(246,242,234,0.85)",
              marginTop: 18,
              padding: "0 18px",
            }}>
            <span style={{ color: "#D4AF37" }}>Timeless</span> &nbsp;and&nbsp;{" "}
            <span style={{ color: "#D4AF37" }}>Priceless</span> Art &nbsp;at
            your space
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
              About <em>the Platform</em>
            </h2>
            <p className="ar-desc" style={{ marginBottom: 18 }}>
              Art Coliseum is not a marketplace — it is a sanctuary for art. We
              believe that great art does not need a price tag to prove its
              worth; it speaks through silence, through texture, through the
              quiet authority of a well-considered composition.
            </p>
            <p className="ar-desc" style={{ marginBottom: 28 }}>
              We bring together artists and admirers in a space designed to
              honour the essence of creative work — where every piece is
              presented with the reverence it deserves.
            </p>
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
          ART OF SEASONS — Gallery Highlights
      ═══════════════════════════════════════════════ */}
      <section
        className="home-sec"
        style={{
          background:
            "linear-gradient(180deg,#080808 0%,#0c0a07 50%,#080808 100%)",
          overflowX: "hidden",
        }}>
        <SectionHeader
          tag="Curator's Picks"
          title="Art of"
          italic="Seasons"
          sub="Explore a rotating showcase of remarkable pieces from our featured collection."
        />
        <CylinderCarousel items={carouselItems} navigate={navigate} />
      </section>

      {/* Section divider */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          background: "#080808",
        }}>
        <div
          style={{
            width: "min(480px, 60%)",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(212,175,55,0.25), transparent)",
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════
          LAUNCH OF NEW PRODUCT
      ═══════════════════════════════════════════════ */}
      {newLaunch.length > 0 && (
        <section
          className="home-sec home-inline-section"
          style={{
            background:
              "linear-gradient(180deg,#080808 0%,#0d0a06 50%,#080808 100%)",
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
                cardHeight="380px"
                testimonials={newLaunch}
                autoplay={true}
                colors={{
                  arrowBackground: "#1a1612",
                  arrowForeground: "#D4AF37",
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
              transition={{
                duration: 0.9,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}>
              <h2 className="ar-heading" style={{ margin: "0 0 16px" }}>
                Launch of <em>New Product</em>
              </h2>

              <p
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 18,
                  color: "rgba(200,191,160,0.75)",
                  lineHeight: 1.8,
                  marginBottom: 28,
                }}>
                A new chapter in art begins. Our latest curated collection
                brings together emerging and established artists — each piece a
                testament to the enduring power of human expression.
              </p>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}>
                {["Verified provenance, direct from each artist's studio"].map(
                  (b, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#D4AF37",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'Raleway',sans-serif",
                          fontSize: 14,
                          color: "rgba(200,191,160,0.75)",
                          letterSpacing: "0.03em",
                        }}>
                        {b}
                      </span>
                    </li>
                  ),
                )}
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
      )}

      {/* ═══════════════════════════════════════════════
          EVENTS
      ═══════════════════════════════════════════════ */}
      {eventsData.length > 0 && (
        <section
          className="home-sec"
          style={{
            background:
              "linear-gradient(180deg,#080808 0%,#0d0b08 60%,#080808 100%)",
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
                registered={!!ev.id && registeredIds.has(ev.id)}
                onRegister={() => openRegister(ev)}
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
      )}

      {/* ═══════════════════════════════════════════════
          ARTIST OF THE MONTH
      ═══════════════════════════════════════════════ */}
      {featured && (
        <section
          className="home-sec"
          style={{
            background:
              "linear-gradient(180deg,#080808 0%,#0c0a07 50%,#080808 100%)",
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
                <div
                  className="grl"
                  style={{
                    background: "linear-gradient(90deg, transparent, #D4AF37)",
                  }}
                />
                <span className="grt">ARTIST OF THE MONTH</span>
                <div
                  className="grl"
                  style={{
                    background: "linear-gradient(90deg, #D4AF37, transparent)",
                  }}
                />
              </div>

              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: "italic",
                  fontSize: "clamp(32px,3.4vw,50px)",
                  fontWeight: 400,
                  color: "#D4AF37",
                  lineHeight: 1.1,
                  margin: "0 0 14px",
                }}>
                {featured.name}
              </h2>

              <p
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: "italic",
                  fontSize: 17,
                  color: "#D4AF37",
                  marginBottom: 24,
                }}>
                {[featured.location, featured.art_type]
                  .filter(Boolean)
                  .join(" · ") ||
                  featured.role ||
                  "Art Coliseum Artist"}
              </p>

              <p
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 18,
                  color: "rgba(200,191,160,0.75)",
                  lineHeight: 1.8,
                  marginBottom: 28,
                }}>
                {featured.bio ||
                  "An Art Coliseum artist — their full monograph is being prepared."}
              </p>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}>
                {[
                  featured.works_count
                    ? `${featured.works_count} works in the collection`
                    : null,
                  featured.location ? `Based in ${featured.location}` : null,
                  featured.art_type || null,
                ]
                  .filter(Boolean)
                  .map((b, i) => (
                    <li
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#D4AF37",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "'Raleway',sans-serif",
                          fontSize: 14,
                          color: "rgba(200,191,160,0.75)",
                          letterSpacing: "0.03em",
                        }}>
                        {b}
                      </span>
                    </li>
                  ))}
              </ul>

              <motion.button
                className="btn-secondary"
                style={{ marginTop: 40 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/artists/${featured.id}`)}>
                VIEW ARTIST PROFILE →
              </motion.button>
            </motion.div>

            {/* Right: photo with light golden glow */}
            <motion.div
              className="home-launch-visual"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.9,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
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
                }}>
                <SafeImage
                  src={featured.image_url || b2}
                  alt={featured.name}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 14,
                  }}
                />
              </GlowCard>
            </motion.div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          PRESERVATION OF ART
      ═══════════════════════════════════════════════ */}
      <section
        className="home-sec"
        style={{
          background:
            "linear-gradient(180deg,#080808 0%,#0c0a07 50%,#080808 100%)",
        }}>
        <AnimatedPreservation navigate={navigate} images={preservationImgs} />
      </section>

      {/* ═══════════════════════════════════════════════
          ART IN YOUR SPACE — CTA Gallery
      ═══════════════════════════════════════════════ */}
      <section
        className="home-sec"
        style={{
          background:
            "linear-gradient(180deg,#080808 0%,#0d0a06 50%,#080808 100%)",
        }}>
        <div
          className="home-art-space-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "center",
            gap: 64,
            maxWidth: 1200,
            margin: "0 auto",
          }}>
          {/* Left: staggered text */}
          <ContainerStagger
            style={{ display: "flex", flexDirection: "column" }}>
            <ContainerAnimated>
              <div className="gold-rule" style={{ marginBottom: 24 }}>
                <div
                  className="grl"
                  style={{
                    background: "linear-gradient(90deg, transparent, #D4AF37)",
                  }}
                />
                <span className="grt">ART IN YOUR SPACE</span>
                <div
                  className="grl"
                  style={{
                    background: "linear-gradient(90deg, #D4AF37, transparent)",
                  }}
                />
              </div>
            </ContainerAnimated>

            <ContainerAnimated>
              <h2 className="ar-heading" style={{ margin: "0 0 18px" }}>
                Art in <em>Your Space</em>
              </h2>
            </ContainerAnimated>

            <ContainerAnimated>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 18,
                  color: "rgba(200,191,160,0.75)",
                  lineHeight: 1.8,
                  marginBottom: 28,
                }}>
                Visualise any masterpiece in your own environment with
                millimetre-accurate scale and shadow simulation — before it ever
                leaves the studio.
              </p>
            </ContainerAnimated>

            <ContainerAnimated>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 36px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}>
                {[
                  "Millimetre-accurate scale & shadow simulation",
                  "Save preview rooms and share with your designer",
                  "Works on any modern smartphone — no app needed",
                ].map((b, i) => (
                  <li
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#D4AF37",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Raleway',sans-serif",
                        fontSize: 14,
                        color: "rgba(200,191,160,0.75)",
                        letterSpacing: "0.03em",
                      }}>
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </ContainerAnimated>

            <ContainerAnimated>
              <motion.button
                className="btn-secondary"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/categories")}>
                EXPLORE GALLERY →
              </motion.button>
            </ContainerAnimated>
          </ContainerStagger>

          {/* Right: gallery grid */}
          <GalleryGrid>
            {[m1, m2, m3, m4].map((src, index) => (
              <GalleryGridCell
                key={index}
                index={index}
                src={src}
                alt={`Gallery ${index + 1}`}
              />
            ))}
          </GalleryGrid>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          LATEST NEWS (admin-managed — Admin → News)
      ═══════════════════════════════════════════════ */}
      {news.length > 0 && (
        <section
          className="home-sec"
          style={{
            background:
              "linear-gradient(180deg,#080808 0%,#0d0b08 60%,#080808 100%)",
          }}>
          <SectionHeader
            tag="Dispatches"
            title="Latest"
            italic="News"
            sub="Discover the stories, insights, voices, and trends shaping the industry across India and the world."
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(300px,100%), 1fr))",
              gap: 22,
              maxWidth: 1100,
              margin: "0 auto",
            }}>
            {news.map((n, i) => {
              const isLink = !!n.link_url;
              const go = () => {
                if (!isLink) return;
                if (/^https?:\/\//.test(n.link_url))
                  window.open(n.link_url, "_blank", "noopener");
                else navigate(n.link_url);
              };
              const date = n.created_at
                ? new Date(n.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";
              return (
                <motion.article
                  key={n.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
                  onClick={go}
                  style={{
                    background: "rgba(255,255,255,0.022)",
                    border: "1px solid rgba(212,175,55,0.14)",
                    borderRadius: 14,
                    overflow: "hidden",
                    cursor: isLink ? "pointer" : "default",
                    display: "flex",
                    flexDirection: "column",
                  }}>
                  {n.image_url && (
                    <div style={{ height: 180, overflow: "hidden" }}>
                      <SafeImage
                        src={n.image_url}
                        alt={n.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  )}
                  <div
                    style={{
                      padding: "18px 20px 20px",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}>
                    {date && (
                      <div
                        style={{
                          fontFamily: "'Cinzel',serif",
                          fontSize: 9,
                          letterSpacing: "0.16em",
                          color: "#D4AF37",
                          marginBottom: 8,
                        }}>
                        {date.toUpperCase()}
                      </div>
                    )}
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 21,
                        fontWeight: 700,
                        color: "#f0e8d8",
                        margin: "0 0 8px",
                        lineHeight: 1.25,
                      }}>
                      {n.title}
                    </h3>
                    {n.summary && (
                      <p
                        style={{
                          fontFamily: "'Raleway',sans-serif",
                          fontSize: 13,
                          color: "rgba(200,191,160,0.65)",
                          lineHeight: 1.7,
                          margin: 0,
                        }}>
                        {n.summary}
                      </p>
                    )}
                    {isLink && (
                      <span
                        style={{
                          marginTop: 14,
                          fontFamily: "'Cinzel',serif",
                          fontSize: 9,
                          letterSpacing: "0.14em",
                          color: "#D4AF37",
                        }}>
                        READ MORE →
                      </span>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS — What Collectors Say
      ═══════════════════════════════════════════════ */}
      {testimonials.length > 0 && (
        <section
          className="home-sec"
          style={{
            background:
              "linear-gradient(180deg,#080808 0%,#0c0a07 50%,#080808 100%)",
            overflowX: "hidden",
          }}>
          <SectionHeader
            tag="In Their Words"
            title="What Collectors"
            italic="Say"
            sub="Voices from the patrons, designers and collectors who have made Art Coliseum part of their world."
          />
          <TestimonialColumns testimonials={testimonials} />
        </section>
      )}

      {/* Section divider */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          background: "#080808",
        }}>
        <div
          style={{
            width: "min(480px, 60%)",
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(212,175,55,0.25), transparent)",
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════
          NEWSLETTER
      ═══════════════════════════════════════════════ */}
      <motion.section
        className="newsletter-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8 }}>
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
                    {registerEvent.time && (
                      <div
                        className="reg-modal-meta"
                        style={{ color: "rgba(212,175,55,0.85)" }}>
                        {registerEvent.time}
                      </div>
                    )}
                  </div>
                  <form className="reg-form" onSubmit={handleRegSubmit}>
                    {user && (
                      <div
                        style={{
                          fontFamily: "'Raleway',sans-serif",
                          fontSize: 11,
                          color: "rgba(212,175,55,0.8)",
                          marginBottom: 4,
                        }}>
                        Prefilled from your account — edit if needed.
                      </div>
                    )}
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
                      style={{
                        width: "100%",
                        marginTop: 8,
                        opacity: regBusy ? 0.7 : 1,
                      }}
                      disabled={regBusy}
                      whileHover={{ scale: regBusy ? 1 : 1.02 }}
                      whileTap={{ scale: regBusy ? 1 : 0.98 }}>
                      {regBusy ? "REGISTERING…" : "CONFIRM REGISTRATION →"}
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
