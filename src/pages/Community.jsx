import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, realtime } from "../utils/api";
import { useAuth } from "../context/Auth";

const COMMUNITIES = [
  { id: "all",          name: "All Communities", desc: "Browse everything",                               color: "#D4AF37" },
  { id: "painting",     name: "Painting",         desc: "Oil, acrylic, watercolour and all painted works", color: "#8B4513" },
  { id: "sculpture",    name: "Sculpture",         desc: "Clay, bronze, marble and mixed 3D forms",         color: "#4A7C59" },
  { id: "digital",      name: "Digital Art",       desc: "Digital, generative, NFT and new media",          color: "#2C5A8E" },
  { id: "photography",  name: "Photography",       desc: "Fine art and documentary photography",            color: "#6E2C4A" },
  { id: "mixed",        name: "Mixed Media",       desc: "Collage, installation and experimental",          color: "#4A2C7E" },
  { id: "marketplace",  name: "Marketplace",       desc: "Buy, sell and trade original artworks",           color: "#B87333" },
  { id: "general",      name: "General",           desc: "Art news, events and open conversations",         color: "#2C8E6E" },
];

const NOTIF_LEVELS = ["All", "Highlights", "Off"];

// ── Helpers: derive presentation from the real backend post ──────────────────
const PALETTE = ["#8B4513", "#4A7C59", "#2C5A8E", "#6E2C4A", "#4A2C7E", "#B87333", "#2C8E6E", "#2C4A6E"];
function colorFor(name) {
  let h = 0; for (const ch of (name || "")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function initialsOf(name) {
  return (name || "?").split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase();
}
function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}
function mapPost(p) {
  return {
    id: p.id, community: p.community, type: p.type,
    author: p.author || "Member", avatar: initialsOf(p.author), avatarColor: colorFor(p.author),
    time: timeAgo(p.created_at),
    text: p.text,
    images: p.images && p.images.length ? p.images : null,
    video: p.video || null,
    title: p.title, condition: p.condition, location: p.location,
    likes: p.likes || 0, liked: !!p.liked,
    comments: (p.comments || []).length, commentsList: p.comments || [],
    userId: p.user_id,
  };
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ initials, color, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color,
      border: "1.5px solid rgba(212,175,55,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cinzel',serif", fontSize: size * 0.28,
      color: "#fff", fontWeight: 700, flexShrink: 0, letterSpacing: "0.05em",
    }}>
      {initials}
    </div>
  );
}

// ─── Community badge on posts ──────────────────────────────────────────────────
function CommunityBadge({ communityId }) {
  const c = COMMUNITIES.find(x => x.id === communityId);
  if (!c || communityId === "all") return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: `${c.color}22`, border: `1px solid ${c.color}44`,
      color: c.color, borderRadius: 999,
      fontFamily: "'Raleway',sans-serif", fontSize: 9, fontWeight: 700,
      letterSpacing: "0.09em", padding: "2px 9px", marginBottom: 8,
    }}>
      c/{c.name}
    </span>
  );
}

// ─── Notification icon ─────────────────────────────────────────────────────────
function NotifIcon({ level }) {
  if (level === "Off") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      <path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/>
      <path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={level === "All" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

// ─── Sidebar community row ─────────────────────────────────────────────────────
function CommunitySidebarRow({ community, joined, notifLevel, onJoin, onNotif, active, onClick }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const isAll = community.id === "all";

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "9px 10px",
        borderRadius: 10, cursor: "pointer", marginBottom: 3,
        background: active ? "rgba(212,175,55,0.08)" : "transparent",
        border: active ? "1px solid rgba(212,175,55,0.2)" : "1px solid transparent",
        transition: "all 0.17s", position: "relative",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>

      {/* Icon */}
      <div style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        background: isAll ? "linear-gradient(135deg,#D4AF37,#c9a52e)" : `${community.color}28`,
        border: `1.5px solid ${isAll ? "#D4AF37" : community.color}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Cinzel',serif", fontSize: 9, fontWeight: 700,
        color: isAll ? "#0e0c0a" : community.color,
      }}>
        {isAll ? "ALL" : community.name.slice(0, 2).toUpperCase()}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Raleway',sans-serif", fontSize: 11, fontWeight: 700,
          color: active ? "#D4AF37" : "#e0d8c8", letterSpacing: "0.04em",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {community.name}
        </div>
        {community.members && (
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9, color: "rgba(200,191,160,0.3)", marginTop: 1 }}>
            {community.members.toLocaleString()} members
          </div>
        )}
      </div>

      {/* Join + Notif — stop click propagation so sidebar row doesn't also fire */}
      {!isAll && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} onClick={e => e.stopPropagation()}>
          {joined && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                title={`Notifications: ${notifLevel}`}
                style={{
                  width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                  background: "none", border: "1px solid rgba(212,175,55,0.2)",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: notifLevel === "Off" ? "rgba(200,191,160,0.3)" : notifLevel === "All" ? "#D4AF37" : "rgba(200,191,160,0.55)",
                  transition: "all 0.15s",
                }}>
                <NotifIcon level={notifLevel} />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.88, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.88 }}
                    style={{
                      position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 60,
                      background: "#1a1712", border: "1px solid rgba(212,175,55,0.2)",
                      borderRadius: 10, minWidth: 128, overflow: "hidden",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    }}>
                    {NOTIF_LEVELS.map(lv => (
                      <button key={lv}
                        onClick={() => { onNotif(lv); setNotifOpen(false); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, width: "100%",
                          padding: "9px 14px", background: lv === notifLevel ? "rgba(212,175,55,0.08)" : "none",
                          border: "none", cursor: "pointer",
                          color: lv === notifLevel ? "#D4AF37" : "rgba(200,191,160,0.55)",
                          fontFamily: "'Raleway',sans-serif", fontSize: 11, transition: "background 0.12s",
                        }}
                        onMouseEnter={e => { if (lv !== notifLevel) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                        onMouseLeave={e => { if (lv !== notifLevel) e.currentTarget.style.background = "none"; }}>
                        {lv}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <button
            onClick={() => onJoin(community.id)}
            style={{
              padding: "3px 9px", borderRadius: 999,
              background: joined ? "transparent" : `${community.color}28`,
              border: `1px solid ${joined ? "rgba(212,175,55,0.2)" : community.color}`,
              color: joined ? "rgba(200,191,160,0.4)" : community.color,
              fontFamily: "'Raleway',sans-serif", fontSize: 8, fontWeight: 700,
              letterSpacing: "0.09em", cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
            }}>
            {joined ? "JOINED" : "JOIN"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post, onLike, onDelete, onEdit, onChat, isOwn }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.commentsList);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const isListing = post.type === "listing";

  const submitComment = async () => {
    const t = commentText.trim();
    if (!t) return;
    setCommentText("");
    try {
      const updated = await api.community.comment(post.id, t);
      setComments(updated.comments || []);
    } catch (e) { alert(e.message); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.38 }}
      style={{
        background: "rgba(255,255,255,0.022)",
        border: `1px solid ${isListing ? "rgba(184,115,51,0.22)" : "rgba(212,175,55,0.1)"}`,
        borderRadius: 14, overflow: "hidden", marginBottom: 18, position: "relative",
      }}>

      {/* LISTING badge */}
      {isListing && (
        <div style={{
          position: "absolute", top: 14, right: 14, zIndex: 2,
          background: "rgba(184,115,51,0.16)", border: "1px solid rgba(184,115,51,0.35)",
          color: "#B87333", borderRadius: 999, padding: "3px 10px",
          fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.15em", fontWeight: 700,
        }}>
          LISTING
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "16px 18px 0" }}>
        <CommunityBadge communityId={post.community} />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 11, cursor: !isOwn ? "pointer" : "default" }}
            onClick={() => !isOwn && onChat({ name: post.author, avatar: post.avatar, avatarColor: post.avatarColor, userId: post.userId })}>
            <Avatar initials={post.avatar} color={post.avatarColor} />
            <div>
              <div
                style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 600, color: "#f0e8d8", transition: "color 0.2s" }}
                onMouseEnter={e => { if (!isOwn) e.currentTarget.style.color = "#D4AF37"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#f0e8d8"; }}>
                {post.author}
              </div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(200,191,160,0.35)", marginTop: 1 }}>
                {post.time}
              </div>
            </div>
          </div>

          {/* Three-dot menu — own posts only */}
          <div style={{ visibility: isOwn ? "visible" : "hidden", position: "relative", marginRight: isListing ? 68 : 0 }}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(200,191,160,0.4)", padding: "4px 8px", borderRadius: 6, transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#D4AF37"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(200,191,160,0.4)"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
              </svg>
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: "#1a1712", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 10, overflow: "hidden", zIndex: 30, minWidth: 130, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                  <button onClick={() => { setMenuOpen(false); onEdit(post); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 16px", background: "none", border: "none", cursor: "pointer", color: "rgba(200,191,160,0.7)", fontFamily: "'Raleway',sans-serif", fontSize: 12, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,55,0.08)"; e.currentTarget.style.color = "#D4AF37"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(200,191,160,0.7)"; }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit Post
                  </button>
                  <div style={{ height: 1, background: "rgba(212,175,55,0.08)", margin: "0 10px" }} />
                  <button onClick={() => { setMenuOpen(false); onDelete(post.id); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 16px", background: "none", border: "none", cursor: "pointer", color: "rgba(220,80,80,0.7)", fontFamily: "'Raleway',sans-serif", fontSize: 12, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,80,80,0.08)"; e.currentTarget.style.color = "#e05555"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(220,80,80,0.7)"; }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                    Delete Post
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Listing title + price row */}
      {isListing && (
        <div style={{ padding: "14px 18px 0" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: "#f0e8d8", margin: "0 0 10px" }}>
            {post.title}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", color: "rgba(200,191,160,0.6)", borderRadius: 999, padding: "2px 10px", fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: "0.08em" }}>
              {post.condition}
            </span>
            {post.location && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(200,191,160,0.42)", fontFamily: "'Raleway',sans-serif", fontSize: 10 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {post.location}
              </span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(184,115,51,0.65)", fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: "0.07em", fontWeight: 600 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              ENQUIRE FOR PRICE
            </span>
          </div>
        </div>
      )}

      {/* Body text */}
      <div style={{ padding: "12px 18px" }}>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: "rgba(200,191,160,0.82)", lineHeight: 1.8, margin: 0 }}>
          {post.text}
        </p>
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div style={{ margin: "0 18px 14px" }}>
          {post.images.length === 1 ? (
            <div style={{ borderRadius: 10, overflow: "hidden", maxHeight: 320 }}>
              <img src={post.images[0]} alt="" style={{ width: "100%", objectFit: "cover", display: "block" }} />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: post.images.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr", gap: 4, borderRadius: 10, overflow: "hidden" }}>
              {post.images.map((src, i) => (
                <div key={i} style={{ aspectRatio: "1", overflow: "hidden" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Video */}
      {post.video && (
        <div style={{ margin: "0 18px 14px", borderRadius: 10, overflow: "hidden", background: "#000" }}>
          <video src={post.video} controls style={{ width: "100%", display: "block", maxHeight: 380 }} />
        </div>
      )}

      {/* Actions bar */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(212,175,55,0.07)", display: "flex", gap: 2, alignItems: "center" }}>
        {/* Like */}
        <button onClick={() => onLike(post.id)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 12, color: post.liked ? "#D4AF37" : "rgba(200,191,160,0.45)", padding: "6px 12px", borderRadius: 999, transition: "all 0.2s" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={post.liked ? "#D4AF37" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {post.likes}
        </button>

        {/* Comment */}
        <button onClick={() => setShowComments(v => !v)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 12, color: showComments ? "#D4AF37" : "rgba(200,191,160,0.45)", padding: "6px 12px", borderRadius: 999, transition: "all 0.2s" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {comments.length}
        </button>

        {/* Marketplace actions */}
        {isListing && (
          <>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setSaved(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 11, color: saved ? "#D4AF37" : "rgba(200,191,160,0.4)", padding: "6px 10px", borderRadius: 999, transition: "all 0.2s" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? "#D4AF37" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              {saved ? "Saved" : "Save"}
            </button>
            <button
              onClick={() => onChat({ name: post.author, avatar: post.avatar, avatarColor: post.avatarColor, userId: post.userId })}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(184,115,51,0.1)", border: "1px solid rgba(184,115,51,0.3)", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: "0.09em", fontWeight: 700, color: "#B87333", padding: "5px 13px", borderRadius: 999, transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(184,115,51,0.18)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(184,115,51,0.1)"; }}>
              MESSAGE SELLER
            </button>
          </>
        )}
      </div>

      {/* Comments panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26 }}
            style={{ overflow: "hidden", borderTop: "1px solid rgba(212,175,55,0.07)" }}>
            <div style={{ padding: "14px 18px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {comments.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel',serif", fontSize: 8, color: "#D4AF37", flexShrink: 0 }}>
                    {c.author.split(" ").map(s => s[0]).join("")}
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.08)", borderRadius: 9, padding: "9px 13px", flex: 1 }}>
                    <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "#D4AF37", marginBottom: 3 }}>{c.author}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "rgba(200,191,160,0.78)", lineHeight: 1.6 }}>{c.text}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submitComment()}
                  placeholder="Add a comment…"
                  style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 999, padding: "8px 14px", color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 12, outline: "none" }}
                />
                <button onClick={submitComment} style={{ padding: "8px 18px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#0e0c0a", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.14em", cursor: "pointer" }}>
                  REPLY
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Create / Edit post modal ──────────────────────────────────────────────────
function CreatePostModal({ onClose, onPost, editingPost, defaultCommunity }) {
  const [text, setText] = useState(editingPost?.text || "");
  const [images, setImages] = useState(editingPost?.images || []);
  const [video, setVideo] = useState(editingPost?.video || null);
  const [community, setCommunity] = useState(editingPost?.community || defaultCommunity || "general");
  const [listingTitle, setListingTitle] = useState(editingPost?.title || "");
  const [condition, setCondition] = useState(editingPost?.condition || "Excellent");
  const [location, setLocation] = useState(editingPost?.location || "");

  const isMarketplace = community === "marketplace";

  const handleImages = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = "";
    for (const file of files) {
      try { const { url } = await api.uploads.file(file, "image"); setImages((prev) => [...prev, url]); }
      catch (err) { alert(err.message); }
    }
  };

  const handleVideo = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try { const { url } = await api.uploads.file(file, "video"); setVideo(url); }
    catch (err) { alert(err.message); }
  };

  const removeImage = i => setImages(prev => prev.filter((_, idx) => idx !== i));

  const hasContent = text.trim() || images.length > 0 || video;
  const canPost = isMarketplace ? (hasContent && listingTitle.trim()) : hasContent;

  const handlePost = () => {
    if (!canPost) return;
    onPost({
      text, images, video, community,
      type: isMarketplace ? "listing" : "discussion",
      ...(isMarketplace ? { title: listingTitle, condition, location } : {}),
    });
    onClose();
  };

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.18)",
    borderRadius: 8, padding: "10px 13px", color: "#e8e0d0",
    fontFamily: "'Cormorant Garamond',serif", fontSize: 16, outline: "none", boxSizing: "border-box",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{ background: "#11100d", border: "1px solid rgba(212,175,55,0.22)", borderRadius: 18, padding: "28px 30px", width: "100%", maxWidth: 620, maxHeight: "92vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>
            {editingPost ? "Edit Post" : "Create Post"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(200,191,160,0.45)", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {/* Community picker */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: "0.12em", color: "rgba(200,191,160,0.38)", marginBottom: 8 }}>POST TO COMMUNITY</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {COMMUNITIES.filter(c => c.id !== "all").map(c => (
              <button key={c.id} onClick={() => setCommunity(c.id)}
                style={{
                  padding: "5px 13px", borderRadius: 999, cursor: "pointer", transition: "all 0.15s",
                  background: community === c.id ? `${c.color}28` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${community === c.id ? c.color : "rgba(212,175,55,0.12)"}`,
                  color: community === c.id ? c.color : "rgba(200,191,160,0.45)",
                  fontFamily: "'Raleway',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                }}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Marketplace fields */}
        {isMarketplace && (
          <div style={{ marginBottom: 16, padding: "16px", background: "rgba(184,115,51,0.06)", border: "1px solid rgba(184,115,51,0.18)", borderRadius: 12 }}>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: "0.12em", color: "#B87333", marginBottom: 12 }}>LISTING DETAILS</div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9, color: "rgba(200,191,160,0.38)", marginBottom: 6, letterSpacing: "0.08em" }}>TITLE *</div>
              <input value={listingTitle} onChange={e => setListingTitle(e.target.value)} placeholder="e.g. Original Oil on Canvas — 'Amber Threshold'" style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9, color: "rgba(200,191,160,0.38)", marginBottom: 6, letterSpacing: "0.08em" }}>CONDITION</div>
                <select value={condition} onChange={e => setCondition(e.target.value)}
                  style={{ ...inputStyle, background: "#181510", fontFamily: "'Raleway',sans-serif", fontSize: 12, cursor: "pointer" }}>
                  {["New", "Excellent", "Very Good", "Good", "Fair"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9, color: "rgba(200,191,160,0.38)", marginBottom: 6, letterSpacing: "0.08em" }}>LOCATION</div>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" style={{ ...inputStyle, fontSize: 13 }} />
              </div>
            </div>
          </div>
        )}

        {/* Text */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={isMarketplace ? 3 : 5}
          placeholder={isMarketplace
            ? "Describe the artwork — dimensions, medium, provenance, condition details…"
            : "Share a thought, a process, a question — anything that connects to the world of art…"}
          style={{ ...inputStyle, padding: "13px 15px", fontFamily: "'Cormorant Garamond',serif", fontSize: 16, lineHeight: 1.75, resize: "none", borderRadius: 10 }}
        />

        {/* Image previews */}
        {images.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: images.length === 1 ? "1fr" : images.length === 3 ? "1fr 1fr 1fr" : "1fr 1fr", gap: 6, marginTop: 12, borderRadius: 10, overflow: "hidden" }}>
            {images.map((src, i) => (
              <div key={i} style={{ position: "relative", aspectRatio: "1", overflow: "hidden", borderRadius: 8 }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <button onClick={() => removeImage(i)} style={{ position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.65)", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Video preview */}
        {video && (
          <div style={{ position: "relative", marginTop: 12, borderRadius: 10, overflow: "hidden", background: "#000" }}>
            <video src={video} controls style={{ width: "100%", display: "block", maxHeight: 240 }} />
            <button onClick={() => setVideo(null)} style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: "50%", background: "rgba(0,0,0,0.72)", border: "none", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
        )}

        {/* Bottom bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {/* Photos */}
            <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", color: "rgba(200,191,160,0.5)", fontFamily: "'Raleway',sans-serif", fontSize: 11, padding: "8px 13px", borderRadius: 999, border: "1px solid rgba(212,175,55,0.15)", background: "rgba(255,255,255,0.03)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#D4AF37"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(200,191,160,0.5)"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)"; }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              {images.length > 0 ? `${images.length} photo${images.length > 1 ? "s" : ""}` : "Photos"}
              <input type="file" accept="image/*" multiple onChange={handleImages} style={{ display: "none" }} />
            </label>

            {/* Video */}
            {!video && (
              <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", color: "rgba(200,191,160,0.5)", fontFamily: "'Raleway',sans-serif", fontSize: 11, padding: "8px 13px", borderRadius: 999, border: "1px solid rgba(212,175,55,0.15)", background: "rgba(255,255,255,0.03)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#D4AF37"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(200,191,160,0.5)"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)"; }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                Video
                <input type="file" accept="video/*" onChange={handleVideo} style={{ display: "none" }} />
              </label>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ padding: "10px 20px", background: "transparent", color: "rgba(200,191,160,0.55)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", cursor: "pointer" }}>
              CANCEL
            </button>
            <button onClick={handlePost}
              style={{ padding: "10px 26px", background: canPost ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "rgba(212,175,55,0.14)", color: canPost ? "#0e0c0a" : "rgba(200,191,160,0.3)", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", cursor: canPost ? "pointer" : "not-allowed" }}>
              {editingPost ? "SAVE" : "POST"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Direct chat (real peer thread over the backend) ─────────────────────────────
function DirectChat({ user, onClose }) {
  const { user: me } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const peerKey = me && user.userId ? `peer:${[me.id, user.userId].sort().join(":")}` : null;

  useEffect(() => {
    if (!peerKey) return;
    let cancelled = false;
    api.chat.conversation(peerKey).then((d) => { if (!cancelled) setMessages(d); }).catch(() => {});
    const sub = realtime.channel(peerKey).on("message", (m) => {
      setMessages((prev) => prev.find((x) => x.id === m.id) ? prev : [...prev, m]);
    }).subscribe();
    return () => { cancelled = true; sub.unsubscribe(); };
  }, [peerKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const t = input.trim();
    if (!t || !peerKey) return;
    setInput("");
    try {
      const m = await api.chat.send({ conversation_key: peerKey, sender: "me", text: t });
      setMessages((prev) => prev.find((x) => x.id === m.id) ? prev : [...prev, m]);
    } catch (e) { alert(e.message); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 420, background: "#12100d", border: "1px solid rgba(212,175,55,0.22)", borderRadius: 18, boxShadow: "0 24px 64px rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid rgba(212,175,55,0.1)", background: "rgba(255,255,255,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={user.avatar} color={user.avatarColor} size={34} />
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 600, color: "#f0e8d8" }}>{user.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4caf7d" }} />
                <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(200,191,160,0.4)" }}>Online</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(200,191,160,0.4)", fontSize: 20, lineHeight: 1 }}
            onMouseEnter={e => e.currentTarget.style.color = "#D4AF37"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(200,191,160,0.4)"}>×</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px", maxHeight: 300, display: "flex", flexDirection: "column", gap: 10 }}>
          {!peerKey && (
            <div style={{ textAlign: "center", padding: 20, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)" }}>
              Please sign in to message {user.name}.
            </div>
          )}
          {peerKey && messages.length === 0 && (
            <div style={{ textAlign: "center", padding: 20, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.45)" }}>
              Say hello to start the conversation.
            </div>
          )}
          {messages.map((msg) => {
            const mine = me && msg.user_id === me.id;
            return (
              <div key={msg.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "78%", padding: "9px 13px", borderRadius: mine ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: mine ? "linear-gradient(135deg,#D4AF37,#c9a52e)" : "rgba(255,255,255,0.06)", border: mine ? "none" : "1px solid rgba(212,175,55,0.12)", color: mine ? "#0e0c0a" : "rgba(200,191,160,0.85)", fontFamily: "'Cormorant Garamond',serif", fontSize: 15, lineHeight: 1.5 }}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ display: "flex", gap: 8, padding: "10px 12px", borderTop: "1px solid rgba(212,175,55,0.1)", background: "rgba(0,0,0,0.2)" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder={peerKey ? "Type a message…" : "Sign in to chat"} disabled={!peerKey}
            style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 999, padding: "8px 14px", color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 12, outline: "none" }}
          />
          <button onClick={send} style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: input.trim() ? "linear-gradient(135deg,#D4AF37,#c9a52e)" : "rgba(212,175,55,0.15)", border: "none", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#0e0c0a" : "rgba(212,175,55,0.4)"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [activeCommunity, setActiveCommunity] = useState("all");
  const [joined, setJoined] = useState(new Set());
  const [notifications, setNotifications] = useState({});

  // Load the real feed for the active community.
  useEffect(() => {
    let cancelled = false;
    api.community.posts(activeCommunity)
      .then((rows) => { if (!cancelled) setPosts((rows || []).map(mapPost)); })
      .catch(() => { if (!cancelled) setPosts([]); });
    return () => { cancelled = true; };
  }, [activeCommunity]);

  const handleJoin = id => {
    setJoined(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleNotif = (id, level) => setNotifications(prev => ({ ...prev, [id]: level }));

  const filteredPosts = posts;

  const handleLike = async (id) => {
    if (!user) { alert("Please sign in to like posts."); return; }
    try { const updated = await api.community.like(id); setPosts(prev => prev.map(p => p.id === id ? mapPost(updated) : p)); }
    catch (e) { alert(e.message); }
  };

  const handlePost = async (data) => {
    try { const created = await api.community.createPost(data); setPosts(prev => [mapPost(created), ...prev]); }
    catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => {
    try { await api.community.deletePost(id); setPosts(prev => prev.filter(p => p.id !== id)); }
    catch (e) { alert(e.message); }
  };

  const handleEdit = post => { setEditingPost(post); setShowModal(true); };

  const handleEditSave = async (data) => {
    try { const updated = await api.community.updatePost(editingPost.id, data); setPosts(prev => prev.map(p => p.id === editingPost.id ? mapPost(updated) : p)); }
    catch (e) { alert(e.message); }
    setEditingPost(null);
  };

  const openChat = (target) => {
    if (!user) { alert("Please sign in to send messages."); return; }
    if (target.userId === user.id) return;
    setChatUser(target);
  };

  const openCreate = () => {
    if (!user) { alert("Please sign in to create a post."); return; }
    setShowModal(true);
  };

  const activeCommunityData = COMMUNITIES.find(c => c.id === activeCommunity);

  return (
    <div style={{ background: "#080808", minHeight: "100vh" }}>

      {/* Hero */}
      <div className="community-hero" style={{
        background: "linear-gradient(180deg, #0e0c0a 0%, #080808 100%)",
        borderBottom: "1px solid rgba(212,175,55,0.1)",
        padding: "140px 48px 60px", textAlign: "center",
      }}>
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="gold-rule" style={{ justifyContent: "center" }}>
            <div className="grl" style={{ background: "linear-gradient(90deg, transparent, #D4AF37)" }} />
            <span className="grt">Connecting Collectors & Artists</span>
            <div className="grl" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
          </div>
          <h1 className="section-heading">
            <span className="bold-white">Art Coliseum</span> <em>Community</em>
          </h1>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 15, color: "rgba(200,191,160,0.55)", maxWidth: 540, margin: "14px auto 0", lineHeight: 1.75 }}>
            A gathering place for artists, collectors, and curators — organised by community, open for conversation and commerce.
          </p>
        </motion.div>
      </div>

      {/* Layout: sidebar + feed */}
      <div className="comm-layout">

        {/* ── Sidebar ── */}
        <aside className="comm-sidebar">
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 14, padding: "14px 10px" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.18em", color: "rgba(200,191,160,0.3)", marginBottom: 10, paddingLeft: 4 }}>
              COMMUNITIES
            </div>
            {COMMUNITIES.map(c => (
              <CommunitySidebarRow
                key={c.id}
                community={c}
                joined={joined.has(c.id)}
                notifLevel={notifications[c.id] || "Off"}
                onJoin={handleJoin}
                onNotif={lv => handleNotif(c.id, lv)}
                active={activeCommunity === c.id}
                onClick={() => setActiveCommunity(c.id)}
              />
            ))}
          </div>

          <button
            style={{ width: "100%", marginTop: 12, padding: "11px", background: "transparent", border: "1px dashed rgba(212,175,55,0.15)", borderRadius: 10, color: "rgba(200,191,160,0.32)", fontFamily: "'Raleway',sans-serif", fontSize: 11, letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.35)"; e.currentTarget.style.color = "rgba(200,191,160,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)"; e.currentTarget.style.color = "rgba(200,191,160,0.32)"; }}>
            + Create Community
          </button>
        </aside>

        {/* ── Feed ── */}
        <main className="comm-feed">

          {/* Feed header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, gap: 12 }}>
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: "#f0e8d8", margin: 0 }}>
                {activeCommunityData?.name || "All Communities"}
              </h2>
              {activeCommunity !== "all" && activeCommunityData?.desc && (
                <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(200,191,160,0.35)", margin: "4px 0 0", letterSpacing: "0.03em" }}>
                  {activeCommunityData.desc}
                </p>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(212,175,55,0.22)" }}
              whileTap={{ scale: 0.97 }}
              onClick={openCreate}
              style={{ padding: "10px 20px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#0e0c0a", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              CREATE POST
            </motion.button>
          </div>

          <AnimatePresence mode="popLayout">
            {filteredPosts.length > 0 ? filteredPosts.map(post => (
              <PostCard
                key={post.id} post={post}
                onLike={handleLike} onDelete={handleDelete}
                onEdit={handleEdit} onChat={openChat}
                isOwn={!!user && post.userId === user.id}
              />
            )) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: "center", padding: "70px 0", color: "rgba(200,191,160,0.28)", fontFamily: "'Cormorant Garamond',serif", fontSize: 19 }}>
                No posts in this community yet.<br />
                <span style={{ fontSize: 14, color: "rgba(200,191,160,0.18)", fontFamily: "'Raleway',sans-serif" }}>Be the first to share something.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showModal && (
          <CreatePostModal
            onClose={() => { setShowModal(false); setEditingPost(null); }}
            onPost={editingPost ? handleEditSave : handlePost}
            editingPost={editingPost}
            defaultCommunity={activeCommunity !== "all" ? activeCommunity : "general"}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatUser && <DirectChat user={chatUser} onClose={() => setChatUser(null)} />}
      </AnimatePresence>
    </div>
  );
}
