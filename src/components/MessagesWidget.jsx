import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, realtime } from "../utils/api";
import { useAuth } from "../context/Auth";
import { conversationTitle, isPeerKey } from "../utils/chatLabels";

/**
 * Floating "Messages" launcher (bottom-left) giving signed-in users one-tap
 * access to all their real conversations — enquiries with curators, direct
 * messages, support — without digging into the Profile inbox.
 *
 * - Regular users see their own threads and reply as themselves.
 * - Admins see every thread (grouped per user) and reply as the curator.
 * Live updates + unread badge come over the shared WebSocket.
 */
const gold = "#D4AF37";

// Conversation titles come from the shared resolver (src/utils/chatLabels.js).
const titleFor = (key, titles = {}, names = {}, meId = null) =>
  conversationTitle(key, { titles, names, meId });

function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return Math.floor(diff / 60) + "m";
  if (diff < 86400) return Math.floor(diff / 3600) + "h";
  return Math.floor(diff / 86400) + "d";
}

export default function MessagesWidget() {
  const { user, role } = useAuth();
  const isAdmin = role === "admin";
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("list"); // "list" | "thread"
  const [convos, setConvos] = useState([]);
  const [active, setActive] = useState(null); // { key, userId, title }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const [sending, setSending] = useState(false);
  const [titles, setTitles] = useState({}); // artworkId -> title, for enquiry tab names
  const [names, setNames] = useState({});   // userId -> display name, for DM thread titles
  const scrollRef = useRef(null);
  const titlesRef = useRef({});
  titlesRef.current = titles;
  const namesRef = useRef({});
  namesRef.current = names;

  // Keep latest UI state readable inside the (stable) WS handler.
  const stateRef = useRef({ open, view, active });
  stateRef.current = { open, view, active };

  const loadUnread = useCallback(async () => {
    try { const { unread: u } = await api.chat.unread(); setUnread(u || 0); }
    catch { /* ignore */ }
  }, []);

  const loadConvos = useCallback(async () => {
    if (!user) return;
    let msgs = [];
    try { msgs = isAdmin ? await api.chat.adminAll() : await api.chat.mine(); }
    catch { return; }
    const groups = new Map();
    for (const m of msgs) {
      const gkey = isAdmin ? `${m.conversation_key}__${m.user_id}` : m.conversation_key;
      const prev = groups.get(gkey);
      if (!prev || new Date(m.created_at) >= new Date(prev.created_at)) {
        groups.set(gkey, {
          key: m.conversation_key, userId: m.user_id,
          last: m.text, sender: m.sender, created_at: m.created_at,
        });
      }
    }
    const list = [...groups.values()]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setConvos(list);

    // Resolve real artwork titles for enquiry tabs (cached; one fetch per id).
    const ids = [...new Set(
      list.filter((c) => c.key.startsWith("enquiry:")).map((c) => c.key.slice(8)),
    )].filter((id) => id && !(id in titlesRef.current));
    if (ids.length) {
      const fetched = {};
      await Promise.all(ids.map(async (id) => {
        try { const a = await api.catalog.artwork(id); fetched[id] = a?.title || null; }
        catch { fetched[id] = null; }
      }));
      setTitles((prev) => ({ ...prev, ...fetched }));
    }

    // Resolve participant names for direct-message threads (cached per id).
    const peerIds = new Set();
    for (const c of list) {
      if (c.key.startsWith("peer:")) {
        for (const id of c.key.split(":").slice(1, 3)) {
          if (id && !(id in namesRef.current)) peerIds.add(id);
        }
      }
    }
    if (peerIds.size) {
      try {
        const map = await api.chat.names([...peerIds]);
        setNames((prev) => ({ ...prev, ...map }));
      } catch { /* ignore */ }
    }
  }, [user, isAdmin]);

  useEffect(() => { if (user) loadUnread(); }, [user, loadUnread]);
  useEffect(() => { if (open && view === "list") loadConvos(); }, [open, view, loadConvos]);

  // Single shared subscription for the lifetime of a signed-in session.
  useEffect(() => {
    if (!user) return;
    const sub = realtime.channel("*").on("message", (m) => {
      loadUnread();
      const { open: o, view: v, active: a } = stateRef.current;
      if (o && v === "list") loadConvos();
      if (a && m.conversation_key === a.key && (!isAdmin || m.user_id === a.userId)) {
        setMessages((prev) => prev.find((x) => x.id === m.id) ? prev : [...prev, m]);
      }
    }).subscribe();
    return () => sub.unsubscribe();
  }, [user, isAdmin, loadUnread, loadConvos]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const openThread = async (c) => {
    setActive(c); setView("thread"); setMessages([]);
    try { setMessages(await api.chat.conversation(c.key, isAdmin ? c.userId : undefined)); }
    catch { /* ignore */ }
    try { await api.chat.read(c.key); } catch { /* ignore */ }
    loadUnread();
  };

  // Let any page open this widget on a specific thread, e.g. the product page's
  // "Talk to the team" button — so there's no separate chat popup.
  const openThreadRef = useRef();
  openThreadRef.current = openThread;
  useEffect(() => {
    const handler = (e) => {
      const key = e.detail?.key;
      if (!key) return;
      setOpen(true);
      openThreadRef.current?.({ key, userId: user?.id });
    };
    window.addEventListener("coli:open-chat", handler);
    return () => window.removeEventListener("coli:open-chat", handler);
  }, [user]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending || !active) return;
    setSending(true); setInput("");
    try {
      const body = isAdmin
        ? { conversation_key: active.key, sender: "curator", target_user_id: active.userId, text }
        : { conversation_key: active.key, sender: "me", text };
      const m = await api.chat.send(body);
      setMessages((prev) => prev.find((x) => x.id === m.id) ? prev : [...prev, m]);
    } catch (e) { alert(e.message); }
    finally { setSending(false); }
  };

  if (!user) return null;

  // Which side a bubble sits on: the current account's own messages go right.
  // Peer (artist↔artist) messages are all stored sender="me", so direction must be
  // decided by author user_id instead.
  const ownSide = (m) => {
    if (isPeerKey(m.conversation_key)) return String(m.user_id) === String(user?.id);
    return isAdmin ? m.sender !== "me" : m.sender === "me";
  };

  return (
    <div className="messages-widget-root" style={{ position: "fixed", bottom: 28, right: 100, zIndex: 9998, fontFamily: "'Raleway',sans-serif" }}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="msg-panel"
            className="chat-floating-panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute", bottom: 72, right: 0,
              width: 380, height: 520, background: "#111",
              border: "1px solid rgba(212,175,55,0.25)", borderRadius: 16,
              display: "flex", flexDirection: "column", overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.1)",
            }}>
            {/* Header */}
            <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(212,175,55,0.15)", background: "rgba(212,175,55,0.04)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              {view === "thread" && (
                <button onClick={() => { setView("list"); setActive(null); }} aria-label="Back"
                  style={{ background: "transparent", border: "none", color: gold, fontSize: 20, cursor: "pointer", lineHeight: 1, padding: 0 }}>‹</button>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700, color: "#f0e8d8", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {view === "thread" ? titleFor(active?.key, titles, names, user?.id) : "Your Messages"}
                </div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: "rgba(212,175,55,0.7)", marginTop: 2 }}>
                  {view === "thread" ? "ART COLISEUM" : isAdmin ? "ALL CONVERSATIONS" : "CURATORS & SUPPORT"}
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close"
                style={{ background: "transparent", border: "none", color: "rgba(200,191,160,0.5)", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: "4px 6px" }}>×</button>
            </div>

            {/* Body */}
            {view === "list" ? (
              <div style={{ flex: 1, overflowY: "auto" }}>
                {convos.length === 0 && (
                  <div style={{ padding: 28, textAlign: "center", fontSize: 13, color: "rgba(200,191,160,0.5)", lineHeight: 1.7 }}>
                    No conversations yet.<br />Enquire about an artwork to start chatting with a curator.
                  </div>
                )}
                {convos.map((c) => (
                  <button key={`${c.key}__${c.userId}`} onClick={() => openThread(c)}
                    style={{ display: "flex", gap: 12, alignItems: "center", width: "100%", textAlign: "left", padding: "14px 16px", background: "transparent", border: "none", borderBottom: "1px solid rgba(212,175,55,0.08)", cursor: "pointer" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#D4AF37,#a8892a)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontSize: 11, color: "#080808", fontWeight: 700 }}>
                      {(titleFor(c.key, titles, names, user?.id)[0] || "C").toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 600, color: "#f0e8d8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{titleFor(c.key, titles, names, user?.id)}</span>
                        <span style={{ fontSize: 10, color: "rgba(200,191,160,0.4)", flexShrink: 0 }}>{timeAgo(c.created_at)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(200,191,160,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>
                        {c.sender === "me" ? "" : "↩ "}{c.last}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.length === 0 && (
                  <div style={{ padding: 20, textAlign: "center", fontSize: 13, color: "rgba(200,191,160,0.5)" }}>No messages yet.</div>
                )}
                {messages.map((m) => {
                  const own = ownSide(m);
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: own ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "82%", padding: "10px 14px", fontSize: 13, lineHeight: 1.6,
                        borderRadius: own ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                        background: own ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.05)",
                        border: `1px solid rgba(212,175,55,${own ? 0.25 : 0.12})`,
                        color: own ? "#e8e0d0" : "rgba(200,191,160,0.9)",
                      }}>{m.text}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Composer (thread only) */}
            {view === "thread" && (
              <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(212,175,55,0.12)", display: "flex", gap: 10, alignItems: "center", flexShrink: 0, background: "rgba(0,0,0,0.3)" }}>
                <input
                  value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                  placeholder="Write a message…" disabled={sending}
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, padding: "10px 14px", color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, outline: "none" }}
                />
                <button onClick={send} disabled={sending || !input.trim()}
                  style={{ padding: "10px 16px", borderRadius: 8, border: "none", cursor: input.trim() ? "pointer" : "default", background: input.trim() ? gold : "rgba(212,175,55,0.2)", color: "#080808", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.12em", fontWeight: 700 }}>
                  {sending ? "…" : "SEND"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating toggle */}
      <motion.button
        onClick={() => { setOpen((v) => !v); setView("list"); }}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        aria-label="Messages"
        style={{ position: "relative", width: 58, height: 58, borderRadius: "50%", background: "linear-gradient(135deg,#D4AF37,#a8892a)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 28px rgba(212,175,55,0.35), 0 2px 8px rgba(0,0,0,0.5)" }}>
        {open ? (
          <span style={{ fontSize: 24, color: "#080808", lineHeight: 1, fontWeight: 300 }}>×</span>
        ) : (
          /* Chat-with-lines icon — clearly "messages inbox", distinct from the bot sparkle */
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#080808" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <line x1="9" y1="9" x2="15" y2="9"/>
            <line x1="9" y1="13" x2="13" y2="13"/>
          </svg>
        )}
        {!open && unread > 0 && (
          <span style={{ position: "absolute", top: -2, right: -2, minWidth: 20, height: 20, padding: "0 5px", borderRadius: 999, background: "#e2483d", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #080808" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </motion.button>
    </div>
  );
}
