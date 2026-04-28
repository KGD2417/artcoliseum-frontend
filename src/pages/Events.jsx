import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import i1 from "../assets/i1.png";
import i2 from "../assets/i2.png";
import i3 from "../assets/i3.png";
import i4 from "../assets/i4.png";
import i5 from "../assets/i5.png";
import i6 from "../assets/i6.png";
import i7 from "../assets/i7.png";
import i8 from "../assets/i8.png";

const ALL_EVENTS = [
  {
    title: "The Golden Age Exhibition",
    date: "May 15 – June 30, 2025",
    location: "Mumbai, India",
    desc: "A curated journey through contemporary Indian masters exploring gold as medium, metaphor, and memory. Works spanning oil, mixed media and bronze sculpture.",
    img: i4,
    tag: "ONGOING",
    curator: "Elena Vance",
  },
  {
    title: "Silence in Motion",
    date: "June 5 – July 20, 2025",
    location: "Florence, Italy",
    desc: "Dynamic sculptures and kinetic installations that blur the boundary between stillness and movement. Nine artists, one shared language.",
    img: i2,
    tag: "ONGOING",
    curator: "Hideo Tanaka",
  },
  {
    title: "Digital Frontiers",
    date: "July 1 – August 15, 2025",
    location: "Berlin, Germany",
    desc: "Generative art and digital works redefining what it means to own and experience art in the modern era.",
    img: i6,
    tag: "UPCOMING",
    curator: "Aria Voss",
  },
  {
    title: "Chromatic Resonance",
    date: "August 10 – September 28, 2025",
    location: "Paris, France",
    desc: "A symphony of colour — how pigment, light, and surface unite to create experiences that transcend the visual.",
    img: i1,
    tag: "UPCOMING",
    curator: "Lena Bach",
  },
  {
    title: "Monochrome Dialogues",
    date: "September 1 – October 15, 2025",
    location: "London, UK",
    desc: "Exploring the infinite range of black, white, and shadow through photography, etching, and charcoal.",
    img: i5,
    tag: "UPCOMING",
    curator: "Julian Voss",
  },
  {
    title: "Ocean Meditations",
    date: "October 5 – November 30, 2025",
    location: "Sydney, Australia",
    desc: "Works inspired by the sea — its depth, its fury, its silence. A multi-sensory exhibition spanning three pavilions.",
    img: i7,
    tag: "UPCOMING",
    curator: "Chen Wei",
  },
];

function EventCard({ event, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="ev-page-card"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: (index % 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}>
      <div className="ev-page-img-wrap">
        <img src={event.img} alt={event.title} />
        <div className="ev-page-img-overlay" />
        <div className={`ev-page-tag ev-page-tag-${event.tag.toLowerCase()}`}>{event.tag}</div>
      </div>
      <div className="ev-page-body">
        <div className="ev-page-date">{event.date}</div>
        <div className="ev-page-title">{event.title}</div>
        <div className="ev-page-location">{event.location}</div>
        <div className="ev-page-desc">{event.desc}</div>
        <div className="ev-page-curator">Curated by <span>{event.curator}</span></div>
      </div>
    </motion.div>
  );
}

export default function Events() {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  return (
    <div className="ev-page-root">
      <div ref={headerRef} className="ev-page-hero">
        <motion.div
          className="gold-rule"
          style={{ justifyContent: "center", marginBottom: 24 }}
          initial={{ opacity: 0 }}
          animate={headerInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7 }}>
          <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }} />
          <span className="grt">Upcoming & Ongoing</span>
          <div className="grl" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
        </motion.div>
        <motion.h1
          className="ev-page-h1"
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}>
          Art <em>Events</em>
        </motion.h1>
        <motion.p
          className="ev-page-sub"
          initial={{ opacity: 0 }}
          animate={headerInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}>
          Immersive exhibitions and curated experiences from across the globe.
        </motion.p>
      </div>

      <div className="ev-page-grid">
        {ALL_EVENTS.map((ev, i) => (
          <EventCard key={ev.title} event={ev} index={i} />
        ))}
      </div>

      <div className="ev-page-cta">
        <motion.button
          className="btn-primary"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/categories")}>
          EXPLORE THE COLLECTION →
        </motion.button>
      </div>
    </div>
  );
}
