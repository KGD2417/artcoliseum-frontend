import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import e4 from "../assets/events/e4.png";
import e5 from "../assets/events/e5.png";
import e6 from "../assets/events/e6.png";
import e7 from "../assets/events/e7.png";
import e8 from "../assets/events/e8.png";
import e9 from "../assets/events/e9.png";

const ONGOING = [
  {
    title: "The Golden Age Exhibition",
    date: "May 15 – June 30, 2025",
    time: "10:00 AM – 8:00 PM · Daily",
    location: "Mumbai, India",
    desc: "A curated journey through contemporary Indian masters exploring gold as medium, metaphor, and memory. Works spanning oil, mixed media and bronze sculpture.",
    img: e4,
    curator: "Elena Vance",
  },
  {
    title: "Silence in Motion",
    date: "June 5 – July 20, 2025",
    time: "11:00 AM – 7:00 PM · Tue – Sun",
    location: "Florence, Italy",
    desc: "Dynamic sculptures and kinetic installations that blur the boundary between stillness and movement. Nine artists, one shared language.",
    img: e5,
    curator: "Hideo Tanaka",
  },
  {
    title: "Chromatic Resonance",
    date: "April 1 – May 18, 2026",
    time: "10:30 AM – 6:30 PM · Wed – Mon",
    location: "Paris, France",
    desc: "A symphony of colour — how pigment, light, and surface unite to create experiences that transcend the visual.",
    img: e6,
    curator: "Lena Bach",
  },
];

const UPCOMING = [
  {
    title: "Digital Frontiers",
    date: "July 1 – August 15, 2026",
    time: "12:00 PM – 9:00 PM · Daily",
    location: "Berlin, Germany",
    desc: "Generative art and digital works redefining what it means to own and experience art in the modern era.",
    img: e7,
    curator: "Aria Voss",
  },
  {
    title: "Monochrome Dialogues",
    date: "September 1 – October 15, 2026",
    time: "11:00 AM – 7:00 PM · Tue – Sun",
    location: "London, UK",
    desc: "Exploring the infinite range of black, white, and shadow through photography, etching, and charcoal.",
    img: e8,
    curator: "Julian Voss",
  },
  {
    title: "Ocean Meditations",
    date: "October 5 – November 30, 2026",
    time: "10:00 AM – 8:00 PM · Daily",
    location: "Sydney, Australia",
    desc: "Works inspired by the sea — its depth, its fury, its silence. A multi-sensory exhibition spanning three pavilions.",
    img: e9,
    curator: "Chen Wei",
  },
];

function EventCard({ event, index, status, onAction }) {
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
        <div className={`ev-page-tag ev-page-tag-${status.toLowerCase()}`}>{status}</div>
      </div>
      <div className="ev-page-body">
        <div className="ev-page-date">{event.date}</div>
        <div className="ev-page-time">{event.time}</div>
        <div className="ev-page-title">{event.title}</div>
        <div className="ev-page-location">{event.location}</div>
        <div className="ev-page-desc">{event.desc}</div>
        <div className="ev-page-curator">Curated by <span>{event.curator}</span></div>
        {status === "UPCOMING" && (
          <div className="ev-page-actions">
            <motion.button
              className="btn-primary ev-page-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAction(event, "register")}>
              REGISTER →
            </motion.button>
            <motion.button
              className="btn-secondary ev-page-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAction(event, "enquire")}>
              ENQUIRE
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Events() {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  const [activeEvent, setActiveEvent] = useState(null);
  const [activeMode, setActiveMode] = useState("register");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [done, setDone] = useState(false);

  const open = (event, mode) => {
    setActiveEvent(event);
    setActiveMode(mode);
    setDone(false);
    setForm({ name: "", email: "", phone: "", message: "" });
  };
  const close = () => { if (!done) setActiveEvent(null); };

  const submit = (e) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => { setActiveEvent(null); setDone(false); }, 2400);
  };

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
          <span className="grt">Ongoing & Upcoming</span>
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

      {/* ONGOING */}
      <section className="ev-section">
        <div className="ev-section-head">
          <span className="ev-section-dot ev-section-dot-on" />
          <h2 className="ev-section-title">Ongoing <em>Exhibitions</em></h2>
          <div className="ev-section-count">{ONGOING.length} events</div>
        </div>
        <div className="ev-page-grid">
          {ONGOING.map((ev, i) => (
            <EventCard key={ev.title} event={ev} index={i} status="ONGOING" onAction={open} />
          ))}
        </div>
      </section>

      {/* UPCOMING */}
      <section className="ev-section">
        <div className="ev-section-head">
          <span className="ev-section-dot ev-section-dot-up" />
          <h2 className="ev-section-title">Upcoming <em>Exhibitions</em></h2>
          <div className="ev-section-count">{UPCOMING.length} events</div>
        </div>
        <div className="ev-page-grid">
          {UPCOMING.map((ev, i) => (
            <EventCard key={ev.title} event={ev} index={i} status="UPCOMING" onAction={open} />
          ))}
        </div>
      </section>

      <div className="ev-page-cta">
        <motion.button
          className="btn-primary"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/categories")}>
          EXPLORE THE COLLECTION →
        </motion.button>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {activeEvent && (
          <motion.div
            className="reg-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}>
            <motion.div
              className="reg-modal"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}>
              {done ? (
                <div className="reg-success">
                  <div className="reg-success-icon">✓</div>
                  <h3 className="reg-success-title">
                    {activeMode === "register" ? "Registered!" : "Enquiry Received"}
                  </h3>
                  <p className="reg-success-desc">
                    {activeMode === "register"
                      ? <>You've been registered for <em>{activeEvent.title}</em>. We'll be in touch soon.</>
                      : <>Thank you for your interest in <em>{activeEvent.title}</em>. Our curator will respond within 24 hours.</>}
                  </p>
                </div>
              ) : (
                <>
                  <div className="reg-modal-header">
                    <button className="reg-modal-close" onClick={() => setActiveEvent(null)}>×</button>
                    <div className="reg-modal-tag">
                      {activeMode === "register" ? "EVENT REGISTRATION" : "EVENT ENQUIRY"}
                    </div>
                    <h3 className="reg-modal-title">{activeEvent.title}</h3>
                    <div className="reg-modal-meta">
                      {activeEvent.location} · {activeEvent.date}
                    </div>
                    <div className="reg-modal-meta" style={{ color: "rgba(212,175,55,0.85)" }}>
                      {activeEvent.time}
                    </div>
                  </div>
                  <form className="reg-form" onSubmit={submit}>
                    <div className="reg-form-row">
                      <input className="reg-input" required placeholder="Full Name"
                        value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                      <input className="reg-input" required type="email" placeholder="Email Address"
                        value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                    </div>
                    <input className="reg-input" placeholder="Phone Number"
                      value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                    <textarea className="reg-input reg-textarea" rows={3}
                      placeholder={activeMode === "register" ? "Message (optional)" : "Tell us what you'd like to know"}
                      value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
                    <motion.button type="submit" className="btn-primary"
                      style={{ width: "100%", marginTop: 8 }}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      {activeMode === "register" ? "CONFIRM REGISTRATION →" : "SEND ENQUIRY →"}
                    </motion.button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
