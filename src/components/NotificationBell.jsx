import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/Auth";
import { api, realtime } from "../utils/api";

const gold = "#D4AF37";

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const refresh = () => {
    api.notifications.unread().then((r) => setUnread(r.unread || 0)).catch(() => {});
    api.notifications.list().then(setItems).catch(() => {});
  };

  // Load + poll + live refresh while signed in.
  useEffect(() => {
    if (!user) { setItems([]); setUnread(0); return undefined; }
    refresh();
    const poll = setInterval(refresh, 30000);
    const sub = realtime
      .channel("*")
      .on("message", (m) => { if (m?.type === "notification") refresh(); })
      .subscribe();
    return () => { clearInterval(poll); sub.unsubscribe(); };
  }, [user]);

  // Close the panel on outside click.
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!user) return null;

  const markAll = async () => {
    try { await api.notifications.markAllRead(); } catch { /* ignore */ }
    setUnread(0);
    setItems((xs) => xs.map((x) => ({ ...x, read: true })));
  };

  const openItem = (n) => {
    setOpen(false);
    if (!n.read) {
      api.notifications.markRead(n.id).catch(() => {});
      setUnread((u) => Math.max(0, u - 1));
    }
    if (n.link) navigate(n.link);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <motion.button
        title="Notifications"
        onClick={() => { const n = !open; setOpen(n); if (n) refresh(); }}
        className="nav-icon-btn"
        whileHover={{ scale: 1.15, color: gold }}
        whileTap={{ scale: 0.92 }}
        style={{ position: "relative" }}>
        <BellIcon />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -3, right: -3, minWidth: 16, height: 16, padding: "0 4px",
            borderRadius: 999, background: gold, color: "#111", fontSize: 9, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Raleway',sans-serif",
            boxShadow: "0 0 0 2px rgba(8,8,8,0.9)",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            style={{
              position: "absolute", right: 0, top: "calc(100% + 12px)", width: 350, maxHeight: 460, overflowY: "auto", zIndex: 7000,
              background: "rgba(14,11,7,0.98)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 12,
              boxShadow: "0 24px 64px rgba(0,0,0,0.65)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderBottom: "1px solid rgba(212,175,55,0.15)", position: "sticky", top: 0, background: "rgba(14,11,7,0.98)" }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", color: gold }}>NOTIFICATIONS</span>
              {items.some((i) => !i.read) && (
                <button onClick={markAll} style={{ background: "none", border: "none", color: "rgba(200,191,160,0.7)", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 11 }}>Mark all read</button>
              )}
            </div>
            {items.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.5)" }}>No notifications yet.</div>
            ) : items.map((n) => (
              <button key={n.id} onClick={() => openItem(n)}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", border: "none", cursor: "pointer", borderBottom: "1px solid rgba(212,175,55,0.08)", background: n.read ? "transparent" : "rgba(212,175,55,0.06)" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {!n.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: gold, flexShrink: 0 }} />}
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "#f0e8d8", fontWeight: 600, lineHeight: 1.25 }}>{n.title}</span>
                </div>
                {n.body && <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.6)", marginTop: 3, lineHeight: 1.45 }}>{n.body}</div>}
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(200,191,160,0.4)", marginTop: 4 }}>{timeAgo(n.created_at)}</div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
