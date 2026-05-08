import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { supabase } from "../utils/supabase";
import e4 from "../assets/events/e4.png";
import e5 from "../assets/events/e5.png";
import e6 from "../assets/events/e6.png";
import e7 from "../assets/events/e7.png";
import e8 from "../assets/events/e8.png";
import e9 from "../assets/events/e9.png";

const FALLBACK_ONGOING = [
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

const FALLBACK_UPCOMING = [
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

function EventCard({ event, index, status, onAction, onOpenDetail }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className="ev-page-card"
      onClick={() => status === "ONGOING" && onOpenDetail && onOpenDetail(event)}
      style={{ cursor: status === "ONGOING" ? "pointer" : "default" }}
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
        {event.time && (
          <div className="ev-page-time">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {event.time}
          </div>
        )}
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
              onClick={(e) => { e.stopPropagation(); onAction(event, "register"); }}>
              REGISTER →
            </motion.button>
            <motion.button
              className="btn-secondary ev-page-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); onAction(event, "enquire"); }}>
              ENQUIRE
            </motion.button>
          </div>
        )}
        {status === "ONGOING" && (
          <div className="ev-page-actions">
            <motion.button
              className="btn-secondary ev-page-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => { e.stopPropagation(); onOpenDetail && onOpenDetail(event); }}>
              VIEW DETAILS →
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

  const [tab, setTab] = useState("ongoing");
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeMode, setActiveMode] = useState("register");
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [done, setDone] = useState(false);
  const [ongoing, setOngoing] = useState(FALLBACK_ONGOING);
  const [upcoming, setUpcoming] = useState(FALLBACK_UPCOMING);
  const [detailEvent, setDetailEvent] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, description, status, starts_at, ends_at, location, image_url");
      if (error) { console.error(error); return; }
      const fmt = (s, e) => {
        if (!s) return "";
        const d1 = new Date(s).toLocaleDateString("en-US", { month: "long", day: "numeric" });
        const d2 = e ? new Date(e).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
        return d2 ? `${d1} – ${d2}` : d1;
      };
      const fmtTime = (s, e) => {
        if (!s) return "";
        const t1 = new Date(s);
        const t2 = e ? new Date(e) : null;
        const mins1 = t1.getHours() * 60 + t1.getMinutes();
        if (mins1 === 0) return "";
        const str1 = t1.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        if (!t2) return str1;
        const mins2 = t2.getHours() * 60 + t2.getMinutes();
        if (mins2 === 0) return str1;
        const str2 = t2.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
        return `${str1} – ${str2}`;
      };
      const map = (r) => ({
        id: r.id,
        title: r.title,
        date: fmt(r.starts_at, r.ends_at),
        time: fmtTime(r.starts_at, r.ends_at),
        location: r.location,
        desc: r.description,
        img: r.image_url,
      });
      setOngoing(data.filter(r => r.status === "ongoing").map(map));
      setUpcoming(data.filter(r => r.status === "upcoming").map(map));
    })();
  }, []);

  const open = (event, mode) => {
    setActiveEvent(event);
    setActiveMode(mode);
    setDone(false);
    setForm({ name: "", email: "", phone: "", message: "" });
  };
  const close = () => { if (!done) setActiveEvent(null); };

  const submit = async (e) => {
    e.preventDefault();
    if (activeEvent?.id) {
      const { error } = await supabase.from("event_registrations").insert({
        event_id: activeEvent.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });
      if (error) { alert(error.message); return; }
    }
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

      <div style={{ display: "flex", justifyContent: "center", margin: "0 auto 28px", maxWidth: 460, padding: "0 24px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, width: "100%",
          padding: "10px 18px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(212,175,55,0.25)",
          borderRadius: 999,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13,
            }}
          />
        </div>
      </div>

      <div className="ev-tabs">
        <button
          className={`ev-tab ${tab === "ongoing" ? "is-active" : ""}`}
          onClick={() => setTab("ongoing")}>
          <span className="ev-section-dot ev-section-dot-on" />
          ONGOING
          <span className="ev-tab-count">{ongoing.length}</span>
        </button>
        <button
          className={`ev-tab ${tab === "upcoming" ? "is-active" : ""}`}
          onClick={() => setTab("upcoming")}>
          <span className="ev-section-dot ev-section-dot-up" />
          UPCOMING
          <span className="ev-tab-count">{upcoming.length}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={tab}
          className="ev-section"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
          <div className="ev-page-grid">
            {(tab === "ongoing" ? ongoing : upcoming)
              .filter((ev) =>
                !search.trim()
                  ? true
                  : `${ev.title} ${ev.location} ${ev.desc || ""}`
                      .toLowerCase()
                      .includes(search.trim().toLowerCase())
              )
              .map((ev, i) => (
                <EventCard
                  key={ev.title}
                  event={ev}
                  index={i}
                  status={tab === "ongoing" ? "ONGOING" : "UPCOMING"}
                  onAction={open}
                  onOpenDetail={setDetailEvent}
                />
              ))}
          </div>
        </motion.section>
      </AnimatePresence>

      <div className="ev-page-cta">
        <motion.button
          className="btn-primary"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/categories")}>
          EXPLORE THE COLLECTION →
        </motion.button>
      </div>

      {/* DETAIL MODAL (Ongoing) */}
      <AnimatePresence>
        {detailEvent && (
          <motion.div
            className="reg-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailEvent(null)}>
            <motion.div
              className="reg-modal"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 640 }}>
              <div className="reg-modal-header">
                <button className="reg-modal-close" onClick={() => setDetailEvent(null)}>×</button>
                <div className="reg-modal-tag">ONGOING EXHIBITION</div>
                <h3 className="reg-modal-title">{detailEvent.title}</h3>
                <div className="reg-modal-meta">
                  {detailEvent.location} · {detailEvent.date}
                </div>
                {detailEvent.time && (
                  <div className="reg-modal-meta" style={{ color: "rgba(212,175,55,0.85)" }}>
                    {detailEvent.time}
                  </div>
                )}
              </div>
              <div style={{ padding: "0 28px 28px" }}>
                {detailEvent.img && (
                  <div style={{ width: "100%", borderRadius: 8, overflow: "hidden", marginBottom: 18, aspectRatio: "16/9" }}>
                    <img src={detailEvent.img} alt={detailEvent.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <p style={{
                  fontFamily: "'Raleway',sans-serif", fontSize: 14,
                  color: "rgba(220,210,190,0.75)", lineHeight: 1.75, marginBottom: 16,
                }}>
                  {detailEvent.desc}
                </p>
                {detailEvent.curator && (
                  <div style={{
                    fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em",
                    color: "#D4AF37",
                  }}>
                    Curated by <span style={{ color: "#fff" }}>{detailEvent.curator}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
