import { useEffect, useRef, useState } from "react";
import {
  validateForm,
  isValid,
  required,
  email as emailRule,
  phoneIN,
} from "../utils/validation";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { api } from "../utils/api";
import { useAuth } from "../context/Auth";

// A Google-Maps directions link for a venue location string.
const directionsUrl = (loc) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc || "")}`;

// Short timezone label for the viewer's locale, e.g. "GMT+5:30" / "EST".
const tzLabel = (d) => {
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
import e4 from "../assets/events/e4.png";
import e5 from "../assets/events/e5.png";
import e6 from "../assets/events/e6.png";
import e7 from "../assets/events/e7.png";
import e8 from "../assets/events/e8.png";
import e9 from "../assets/events/e9.png";

function EventCard({
  event,
  index,
  status,
  registered,
  onAction,
  onOpenDetail,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  // Carry the card's status into the detail view so the modal labels it correctly
  // even for the demo fallback events (which don't carry a status field).
  const openDetail = () =>
    onOpenDetail &&
    onOpenDetail({ ...event, status: event.status || status.toLowerCase() });

  return (
    <motion.div
      ref={ref}
      className="ev-page-card"
      onClick={openDetail}
      style={{ cursor: "pointer", opacity: status === "PAST" ? 0.82 : 1 }}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: (index % 3) * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}>
      <div className="ev-page-img-wrap">
        <img src={event.img} alt={event.title} />
        <div className="ev-page-img-overlay" />
        <div className={`ev-page-tag ev-page-tag-${status.toLowerCase()}`}>
          {status}
        </div>
      </div>
      <div className="ev-page-body">
        <div className="ev-page-date">{event.date}</div>
        {event.time && (
          <div className="ev-page-time">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {event.time}
          </div>
        )}
        <div className="ev-page-title">{event.title}</div>
        {registered && (
          <div
            style={{
              display: "inline-block",
              margin: "4px 0",
              padding: "3px 10px",
              borderRadius: 999,
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.5)",
              color: "#4ade80",
              fontFamily: "'Cinzel',serif",
              fontSize: 9,
              letterSpacing: "0.14em",
            }}>
            REGISTERED ✓
          </div>
        )}
        <div className="ev-page-location">{event.location}</div>
        <div className="ev-page-desc">{event.desc}</div>
        <div className="ev-page-curator">
          Curated by <span>{event.curator}</span>
        </div>
        {status === "UPCOMING" && (
          <div className="ev-page-actions">
            <motion.button
              className="btn-primary ev-page-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                onAction(event, "register");
              }}>
              {registered ? "REGISTERED ✓" : "REGISTER →"}
            </motion.button>
            <motion.button
              className="btn-secondary ev-page-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                onAction(event, "enquire");
              }}>
              ENQUIRE
            </motion.button>
          </div>
        )}
        {status === "ONGOING" && (
          <div className="ev-page-actions">
            <motion.button
              className="btn-primary ev-page-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                onAction(event, "register");
              }}>
              {registered ? "REGISTERED ✓" : "REGISTER →"}
            </motion.button>
            <motion.button
              className="btn-secondary ev-page-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                openDetail();
              }}>
              VIEW DETAILS →
            </motion.button>
          </div>
        )}
        {status === "PAST" && (
          <div className="ev-page-actions">
            <motion.button
              className="btn-secondary ev-page-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                openDetail();
              }}>
              VIEW DETAILS →
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EventInfo({ event }) {
  const rows = [
    ["Address", event.address],
    ["Parking", event.parking],
    ["Details", event.details],
  ].filter(([, v]) => v);
  if (rows.length === 0) return null;
  return (
    <div style={{ display: "grid", gap: 12, marginTop: 4 }}>
      {rows.map(([label, val]) => (
        <div key={label}>
          <div
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 9,
              letterSpacing: "0.16em",
              color: "#D4AF37",
              marginBottom: 4,
            }}>
            {label.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 13,
              color: "rgba(220,210,190,0.78)",
              lineHeight: 1.6,
              whiteSpace: "pre-line",
            }}>
            {val}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Events() {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  const { user } = useAuth();
  const [tab, setTab] = useState("ongoing");
  const [activeEvent, setActiveEvent] = useState(null);
  const [activeMode, setActiveMode] = useState("register");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [registeredIds, setRegisteredIds] = useState(() => new Set());
  const [done, setDone] = useState(false);
  const [past, setPast] = useState([]);
  const [ongoing, setOngoing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [detailEvent, setDetailEvent] = useState(null);
  const [search, setSearch] = useState("");

  // Logged-in collectors: prefill the registration form from their profile, and
  // load which events they've already registered for.
  useEffect(() => {
    if (!user) return;
    api.auth
      .me()
      .then((m) =>
        setProfile({
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

  const isRegistered = (ev) => !!ev?.id && registeredIds.has(ev.id);

  useEffect(() => {
    (async () => {
      let data;
      try {
        data = await api.events.list();
      } catch (e) {
        console.error(e);
        return;
      }
      if (!data || data.length === 0) return; // no events → show empty state
      const fmt = (s, e) => {
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
      // Times are stored in UTC and rendered in the viewer's own timezone, with
      // the zone shown (e.g. "2:30 PM – 8:00 PM GMT+5:30") so it's unambiguous.
      const fmtTime = (s, e) => {
        if (!s) return "";
        const t1 = new Date(s);
        const t2 = e ? new Date(e) : null;
        const opt = { hour: "numeric", minute: "2-digit", hour12: true };
        const tz = tzLabel(t1);
        const str1 = t1.toLocaleTimeString("en-US", opt);
        if (!t2) return `${str1} ${tz}`;
        const str2 = t2.toLocaleTimeString("en-US", opt);
        return `${str1} – ${str2} ${tz}`;
      };
      const map = (r) => ({
        id: r.id,
        status: r.status,
        title: r.title,
        date: fmt(r.starts_at, r.ends_at),
        time: fmtTime(r.starts_at, r.ends_at),
        location: r.location,
        desc: r.description,
        img: r.image_url,
        curator: r.curator,
        address: r.address,
        parking: r.parking,
        maps_url: r.maps_url,
        details: r.details,
      });
      setPast(data.filter((r) => r.status === "past").map(map));
      setOngoing(data.filter((r) => r.status === "ongoing").map(map));
      setUpcoming(data.filter((r) => r.status === "upcoming").map(map));
    })();
  }, []);

  const open = (event, mode) => {
    setActiveEvent(event);
    setActiveMode(mode);
    setDone(false);
    // Prefill from the collector's profile so they don't re-enter known details.
    setForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      message: "",
    });
  };
  const close = () => {
    setActiveEvent(null);
    setDone(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateForm(form, {
      name: [required("Name")],
      email: [required("Email"), emailRule],
      phone: [phoneIN],
    });
    if (!isValid(errs)) {
      alert(Object.values(errs)[0]);
      return;
    }
    if (activeEvent?.id) {
      try {
        await api.events.register(activeEvent.id, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
        });
        if (activeMode === "register")
          setRegisteredIds((prev) => new Set(prev).add(activeEvent.id));
      } catch (err) {
        alert(err.message);
        return;
      }
    }
    setDone(true);
  };

  const tabStatus = tab === "past" ? "PAST" : tab === "ongoing" ? "ONGOING" : "UPCOMING";
  const visibleEvents = (tab === "past" ? past : tab === "ongoing" ? ongoing : upcoming).filter(
    (ev) =>
      !search.trim()
        ? true
        : `${ev.title} ${ev.location} ${ev.desc || ""}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
  );

  return (
    <div className="ev-page-root">
      <div ref={headerRef} className="ev-page-hero">
        <motion.div
          className="gold-rule"
          style={{ justifyContent: "center", marginBottom: 24 }}
          initial={{ opacity: 0 }}
          animate={headerInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7 }}>
          <div
            className="grl"
            style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }}
          />
          <span className="grt">Past, Ongoing & Upcoming</span>
          <div
            className="grl"
            style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }}
          />
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
          Celebrating past milestones, showcasing ongoing events , and unveiling
          upcoming experiences from across India and globe.
        </motion.p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          margin: "0 auto 28px",
          maxWidth: 460,
          padding: "0 24px",
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "10px 18px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,175,55,0.25)",
            borderRadius: 999,
          }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(212,175,55,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#e8e0d0",
              fontFamily: "'Raleway',sans-serif",
              fontSize: 13,
            }}
          />
        </div>
      </div>

      <div className="ev-tabs">
        <button
          className={`ev-tab ${tab === "past" ? "is-active" : ""}`}
          onClick={() => setTab("past")}>
          <span className="ev-section-dot ev-section-dot-past" />
          PAST
          <span className="ev-tab-count">{past.length}</span>
        </button>
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
          {visibleEvents.length === 0 ? (
            <div className="ev-empty">
              <div className="ev-empty-icon" aria-hidden>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="17" rx="2" />
                  <path d="M8 2v4M16 2v4M3 10h18" />
                </svg>
              </div>
              <div className="ev-empty-title">
                {search.trim()
                  ? "No events match your search"
                  : `No ${tab} events right now`}
              </div>
              <div className="ev-empty-sub">
                {search.trim()
                  ? "Try a different keyword."
                  : "New exhibitions and experiences are added regularly — check back soon."}
              </div>
            </div>
          ) : (
            <div
              className="ev-page-grid"
              style={tab === "past" ? { opacity: 0.75 } : {}}>
              {visibleEvents.map((ev, i) => (
                <EventCard
                  key={ev.title}
                  event={ev}
                  index={i}
                  status={tabStatus}
                  registered={isRegistered(ev)}
                  onAction={open}
                  onOpenDetail={setDetailEvent}
                />
              ))}
            </div>
          )}
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
                <button
                  className="reg-modal-close"
                  onClick={() => setDetailEvent(null)}>
                  ×
                </button>
                <div className="reg-modal-tag">
                  {(detailEvent.status || "event").toUpperCase()} EVENT
                </div>
                <h3 className="reg-modal-title">{detailEvent.title}</h3>
                <div className="reg-modal-meta">
                  {[detailEvent.location, detailEvent.date]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
                {detailEvent.time && (
                  <div
                    className="reg-modal-meta"
                    style={{ color: "rgba(212,175,55,0.85)" }}>
                    {detailEvent.time}
                  </div>
                )}
              </div>
              <div style={{ padding: "0 28px 28px" }}>
                {detailEvent.img && (
                  <div
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      overflow: "hidden",
                      marginBottom: 18,
                      aspectRatio: "16/9",
                    }}>
                    <img
                      src={detailEvent.img}
                      alt={detailEvent.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                <p
                  style={{
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 14,
                    color: "rgba(220,210,190,0.75)",
                    lineHeight: 1.75,
                    marginBottom: 16,
                  }}>
                  {detailEvent.desc}
                </p>
                <EventInfo event={detailEvent} />
                {(detailEvent.maps_url ||
                  detailEvent.address ||
                  detailEvent.location) && (
                  <a
                    href={
                      detailEvent.maps_url ||
                      directionsUrl(detailEvent.address || detailEvent.location)
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{
                      display: "inline-block",
                      marginTop: 16,
                      textDecoration: "none",
                    }}>
                    GET DIRECTIONS →
                  </a>
                )}
                {detailEvent.curator && (
                  <div
                    style={{
                      fontFamily: "'Cinzel',serif",
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      color: "#D4AF37",
                      marginTop: 16,
                    }}>
                    Curated by{" "}
                    <span style={{ color: "#fff" }}>{detailEvent.curator}</span>
                  </div>
                )}
                {(detailEvent.status === "ongoing" ||
                  detailEvent.status === "upcoming") && (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      marginTop: 20,
                    }}>
                    <button
                      className="btn-primary"
                      style={{ flex: 1, minWidth: 160 }}
                      onClick={() => {
                        const ev = detailEvent;
                        setDetailEvent(null);
                        open(ev, "register");
                      }}>
                      {isRegistered(detailEvent)
                        ? "REGISTERED ✓"
                        : "REGISTER →"}
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1, minWidth: 120 }}
                      onClick={() => {
                        const ev = detailEvent;
                        setDetailEvent(null);
                        open(ev, "enquire");
                      }}>
                      ENQUIRE
                    </button>
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
              {activeMode === "register" &&
              (done || isRegistered(activeEvent)) ? (
                <div className="reg-success">
                  <button
                    className="reg-modal-close"
                    onClick={() => {
                      setActiveEvent(null);
                      setDone(false);
                    }}>
                    ×
                  </button>
                  <div className="reg-success-icon">✓</div>
                  <h3 className="reg-success-title">You're Registered</h3>
                  <p className="reg-success-desc">
                    Your spot for <em>{activeEvent.title}</em> is confirmed.
                    Head to the venue on the day — we'll see you there.
                  </p>
                  <div
                    style={{
                      marginTop: 18,
                      padding: "16px 18px",
                      borderRadius: 10,
                      background: "rgba(212,175,55,0.06)",
                      border: "1px solid rgba(212,175,55,0.25)",
                      textAlign: "left",
                    }}>
                    <div
                      style={{
                        fontFamily: "'Cinzel',serif",
                        fontSize: 9,
                        letterSpacing: "0.18em",
                        color: "#D4AF37",
                        marginBottom: 8,
                      }}>
                      VENUE
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 18,
                        color: "#fff",
                      }}>
                      {activeEvent.location || "To be announced"}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Raleway',sans-serif",
                        fontSize: 12,
                        color: "rgba(220,210,190,0.7)",
                        marginTop: 4,
                      }}>
                      {activeEvent.date}
                      {activeEvent.time ? ` · ${activeEvent.time}` : ""}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <EventInfo event={activeEvent} />
                    </div>
                  </div>
                  {(activeEvent.maps_url ||
                    activeEvent.address ||
                    activeEvent.location) && (
                    <a
                      href={
                        activeEvent.maps_url ||
                        directionsUrl(
                          activeEvent.address || activeEvent.location,
                        )
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{
                        display: "inline-block",
                        marginTop: 16,
                        textDecoration: "none",
                      }}>
                      GET DIRECTIONS →
                    </a>
                  )}
                </div>
              ) : done ? (
                <div className="reg-success">
                  <div className="reg-success-icon">✓</div>
                  <h3 className="reg-success-title">Enquiry Received</h3>
                  <p className="reg-success-desc">
                    Thank you for your interest in <em>{activeEvent.title}</em>.
                    Our curator will respond within 24 hours.
                  </p>
                </div>
              ) : (
                <>
                  <div className="reg-modal-header">
                    <button
                      className="reg-modal-close"
                      onClick={() => setActiveEvent(null)}>
                      ×
                    </button>
                    <div className="reg-modal-tag">
                      {activeMode === "register"
                        ? "EVENT REGISTRATION"
                        : "EVENT ENQUIRY"}
                    </div>
                    <h3 className="reg-modal-title">{activeEvent.title}</h3>
                    <div className="reg-modal-meta">
                      {activeEvent.location} · {activeEvent.date}
                    </div>
                    <div
                      className="reg-modal-meta"
                      style={{ color: "rgba(212,175,55,0.85)" }}>
                      {activeEvent.time}
                    </div>
                  </div>
                  <form className="reg-form" onSubmit={submit}>
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
                        value={form.name}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, name: e.target.value }))
                        }
                      />
                      <input
                        className="reg-input"
                        required
                        type="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, email: e.target.value }))
                        }
                      />
                    </div>
                    <input
                      className="reg-input"
                      placeholder="Phone Number"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                    />
                    <textarea
                      className="reg-input reg-textarea"
                      rows={3}
                      placeholder={
                        activeMode === "register"
                          ? "Message (optional)"
                          : "Tell us what you'd like to know"
                      }
                      value={form.message}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, message: e.target.value }))
                      }
                    />
                    <motion.button
                      type="submit"
                      className="btn-primary"
                      style={{ width: "100%", marginTop: 8 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      {activeMode === "register"
                        ? "CONFIRM REGISTRATION →"
                        : "SEND ENQUIRY →"}
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
