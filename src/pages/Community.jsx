import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton, SkeletonText } from "../components/ui/Skeleton";
import DateTimeField from "../components/DateTimeField";
import { api, realtime } from "../utils/api";
import { useAuth } from "../context/Auth";
import { useLocale } from "../context/Locale";

// datetime-local input value (local wall-clock) from a stored ISO/UTC string.
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
}

const COMMUNITIES = [
  {
    id: "all",
    name: "All Communities",
    desc: "Browse everything",
    color: "#D4AF37",
  },
  {
    id: "painting",
    name: "Painting",
    desc: "Oil, acrylic, watercolour and all painted works",
    color: "#8B4513",
  },
  {
    id: "sculpture",
    name: "Sculpture",
    desc: "Clay, bronze, marble and mixed 3D forms",
    color: "#4A7C59",
  },
  {
    id: "digital",
    name: "Digital Art",
    desc: "Digital, generative, NFT and new media",
    color: "#2C5A8E",
  },
  {
    id: "photography",
    name: "Photography",
    desc: "Fine art and documentary photography",
    color: "#6E2C4A",
  },
  {
    id: "mixed",
    name: "Mixed Media",
    desc: "Collage, installation and experimental",
    color: "#4A2C7E",
  },
  {
    id: "marketplace",
    name: "Marketplace",
    desc: "Buy, sell and trade original artworks",
    color: "#B87333",
  },
  {
    id: "general",
    name: "General",
    desc: "Art news, events and open conversations",
    color: "#2C8E6E",
  },
];

const NOTIF_LEVELS = ["All", "Highlights", "Off"];

// ── Helpers: derive presentation from the real backend post ──────────────────
const PALETTE = [
  "#8B4513",
  "#4A7C59",
  "#2C5A8E",
  "#6E2C4A",
  "#4A2C7E",
  "#B87333",
  "#2C8E6E",
  "#2C4A6E",
];
function colorFor(name) {
  let h = 0;
  for (const ch of name || "") h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function initialsOf(name) {
  return (name || "?")
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
    id: p.id,
    community: p.community,
    type: p.type,
    author: p.author || "Member",
    avatar: initialsOf(p.author),
    avatarColor: colorFor(p.author),
    avatarUrl: p.author_avatar || null,
    time: timeAgo(p.created_at),
    text: p.text,
    images: p.images && p.images.length ? p.images : null,
    videos: p.videos && p.videos.length ? p.videos : p.video ? [p.video] : null,
    title: p.title,
    condition: p.condition,
    location: p.location,
    likes: p.likes || 0,
    liked: !!p.liked,
    comments: (p.comments || []).length,
    commentsList: p.comments || [],
    userId: p.user_id,
    // auction state
    isAuction: !!p.is_auction,
    startingBid: p.starting_bid,
    minIncrement: p.min_increment,
    auctionEndsAt: p.auction_ends_at,
    auctionClosed: !!p.auction_closed,
    auctionEnded: !!p.auction_ended,
    winnerUserId: p.winner_user_id,
    winnerName: p.winner_name,
    currentBid: p.current_bid,
    bidCount: p.bid_count || 0,
    topBidderId: p.top_bidder_id,
    bids: p.bids || [],
  };
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ initials, color, size = 40, src }) {
  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "1.5px solid rgba(212,175,55,0.25)",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        border: "1.5px solid rgba(212,175,55,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Cinzel',serif",
        fontSize: size * 0.28,
        color: "#fff",
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: "0.05em",
      }}>
      {initials}
    </div>
  );
}

// ─── Community badge on posts ──────────────────────────────────────────────────
function CommunityBadge({ communityId }) {
  const c = COMMUNITIES.find((x) => x.id === communityId);
  if (!c || communityId === "all") return null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: `${c.color}22`,
        border: `1px solid ${c.color}44`,
        color: c.color,
        borderRadius: 999,
        fontFamily: "'Raleway',sans-serif",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.09em",
        padding: "2px 9px",
        marginBottom: 8,
      }}>
      c/{c.name}
    </span>
  );
}

// ─── Notification icon ─────────────────────────────────────────────────────────
function NotifIcon({ level }) {
  if (level === "Off")
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
        <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
        <path d="M18 8a6 6 0 0 0-9.33-5" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill={level === "All" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// ─── Sidebar community row ─────────────────────────────────────────────────────
function CommunitySidebarRow({
  community,
  joined,
  notifLevel,
  onJoin,
  onNotif,
  active,
  onClick,
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const isAll = community.id === "all";

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 10px",
        borderRadius: 10,
        cursor: "pointer",
        marginBottom: 3,
        background: active ? "rgba(212,175,55,0.08)" : "transparent",
        border: active
          ? "1px solid rgba(212,175,55,0.2)"
          : "1px solid transparent",
        transition: "all 0.17s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!active)
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}>
      {/* Icon */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          flexShrink: 0,
          background: isAll
            ? "linear-gradient(135deg,#D4AF37,#c9a52e)"
            : `${community.color}28`,
          border: `1.5px solid ${isAll ? "#D4AF37" : community.color}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Cinzel',serif",
          fontSize: 9,
          fontWeight: 700,
          color: isAll ? "#0e0c0a" : community.color,
        }}>
        {isAll ? "ALL" : community.name.slice(0, 2).toUpperCase()}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 11,
            fontWeight: 700,
            color: active ? "#D4AF37" : "#e0d8c8",
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
          {community.name}
        </div>
        {community.members && (
          <div
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 9,
              color: "rgba(200,191,160,0.3)",
              marginTop: 1,
            }}>
            {community.members.toLocaleString()} members
          </div>
        )}
      </div>

      {/* Join + Notif — stop click propagation so sidebar row doesn't also fire */}
      {!isAll && (
        <div
          style={{ display: "flex", alignItems: "center", gap: 4 }}
          onClick={(e) => e.stopPropagation()}>
          {joined && (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                title={`Notifications: ${notifLevel}`}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: "none",
                  border: "1px solid rgba(212,175,55,0.2)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color:
                    notifLevel === "Off"
                      ? "rgba(200,191,160,0.3)"
                      : notifLevel === "All"
                        ? "#D4AF37"
                        : "rgba(200,191,160,0.55)",
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
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 6px)",
                      zIndex: 60,
                      background: "#1a1712",
                      border: "1px solid rgba(212,175,55,0.2)",
                      borderRadius: 10,
                      minWidth: 128,
                      overflow: "hidden",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    }}>
                    {NOTIF_LEVELS.map((lv) => (
                      <button
                        key={lv}
                        onClick={() => {
                          onNotif(lv);
                          setNotifOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                          padding: "9px 14px",
                          background:
                            lv === notifLevel
                              ? "rgba(212,175,55,0.08)"
                              : "none",
                          border: "none",
                          cursor: "pointer",
                          color:
                            lv === notifLevel
                              ? "#D4AF37"
                              : "rgba(200,191,160,0.55)",
                          fontFamily: "'Raleway',sans-serif",
                          fontSize: 11,
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => {
                          if (lv !== notifLevel)
                            e.currentTarget.style.background =
                              "rgba(255,255,255,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          if (lv !== notifLevel)
                            e.currentTarget.style.background = "none";
                        }}>
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
              padding: "3px 9px",
              borderRadius: 999,
              background: joined ? "transparent" : `${community.color}28`,
              border: `1px solid ${joined ? "rgba(212,175,55,0.2)" : community.color}`,
              color: joined ? "rgba(200,191,160,0.4)" : community.color,
              fontFamily: "'Raleway',sans-serif",
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: "0.09em",
              cursor: "pointer",
              transition: "all 0.15s",
              flexShrink: 0,
            }}>
            {joined ? "JOINED" : "JOIN"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Live auction countdown (re-renders every second) ──────────────────────────
function LiveCountdown({ endsAt, ended, urgentColor = "#e0703a" }) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (ended || !endsAt) return undefined;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endsAt, ended]);

  if (ended)
    return (
      <span style={{ color: "#D4AF37", letterSpacing: "0.12em" }}>ENDED</span>
    );
  if (!endsAt)
    return (
      <span style={{ color: "#4caf7d", letterSpacing: "0.1em" }}>
        OPEN · NO DEADLINE
      </span>
    );

  const ms = new Date(endsAt).getTime() - now;
  if (ms <= 0)
    return <span style={{ color: "#D4AF37" }}>FINALISING…</span>;

  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const urgent = ms < 3600000; // final hour
  const segs =
    d > 0
      ? [
          ["D", d],
          ["H", h],
          ["M", m],
        ]
      : [
          ["H", h],
          ["M", m],
          ["S", s],
        ];
  const col = urgent ? urgentColor : "#e8c060";

  return (
    <span style={{ display: "inline-flex", gap: 4 }}>
      {segs.map(([label, val]) => (
        <span
          key={label}
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            background: urgent ? "rgba(224,112,58,0.14)" : "rgba(212,175,55,0.1)",
            border: `1px solid ${urgent ? "rgba(224,112,58,0.4)" : "rgba(212,175,55,0.25)"}`,
            borderRadius: 6,
            padding: "3px 6px",
            minWidth: 26,
          }}>
          <span
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 15,
              fontWeight: 700,
              lineHeight: 1,
              color: col,
              fontVariantNumeric: "tabular-nums",
            }}>
            {pad(val)}
          </span>
          <span
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 6,
              letterSpacing: "0.1em",
              color: "rgba(200,191,160,0.45)",
              marginTop: 2,
            }}>
            {label}
          </span>
        </span>
      ))}
    </span>
  );
}

// ─── Full-screen image lightbox ────────────────────────────────────────────────
function Lightbox({ images, index, onClose, onIndex }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft")
        onIndex((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, images.length, onClose, onIndex]);

  const multi = images.length > 1;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(6,5,4,0.94)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}>
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(212,175,55,0.3)",
          color: "#f0e8d8",
          fontSize: 22,
          cursor: "pointer",
          lineHeight: 1,
          zIndex: 2,
        }}>
        ×
      </button>
      {multi && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIndex((index - 1 + images.length) % images.length);
            }}
            style={lightboxArrowStyle("left")}>
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onIndex((index + 1) % images.length);
            }}
            style={lightboxArrowStyle("right")}>
            ›
          </button>
        </>
      )}
      <motion.img
        key={index}
        src={images[index]}
        alt=""
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "92vw",
          maxHeight: "88vh",
          objectFit: "contain",
          borderRadius: 8,
          boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
        }}
      />
      {multi && (
        <div
          style={{
            position: "absolute",
            bottom: 22,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 7,
          }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onIndex(i);
              }}
              style={{
                width: i === index ? 22 : 8,
                height: 8,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: i === index ? "#D4AF37" : "rgba(255,255,255,0.3)",
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
function lightboxArrowStyle(side) {
  return {
    position: "absolute",
    [side]: 18,
    top: "50%",
    transform: "translateY(-50%)",
    width: 46,
    height: 46,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(212,175,55,0.3)",
    color: "#f0e8d8",
    fontSize: 26,
    cursor: "pointer",
    lineHeight: 1,
    zIndex: 2,
  };
}

// ─── Post image gallery — shows full artwork (no crop) + lightbox ───────────────
function PostImages({ images }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  if (!images || images.length === 0) return null;
  const multiple = images.length > 1;
  const src = images[Math.min(active, images.length - 1)];

  return (
    <>
      {/* Main image — full, uncropped, with a soft blurred fill behind */}
      <div
        onClick={() => setZoom(true)}
        style={{
          position: "relative",
          borderRadius: 12,
          overflow: "hidden",
          background: "#0a0907",
          border: "1px solid rgba(212,175,55,0.08)",
          cursor: "zoom-in",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 200,
        }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(34px) brightness(0.42)",
            transform: "scale(1.15)",
          }}
        />
        <img
          src={src}
          alt=""
          style={{
            position: "relative",
            width: "100%",
            maxHeight: "62vh",
            objectFit: "contain",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(0,0,0,0.55)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 999,
            padding: "4px 9px",
            color: "rgba(240,232,216,0.85)",
            fontFamily: "'Raleway',sans-serif",
            fontSize: 9,
            letterSpacing: "0.05em",
            pointerEvents: "none",
          }}>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          {multiple ? `${active + 1} / ${images.length}` : "View"}
        </div>
      </div>

      {/* Thumbnail strip */}
      {multiple && (
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 7,
            overflowX: "auto",
            paddingBottom: 2,
          }}>
          {images.map((thumb, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                flexShrink: 0,
                width: 58,
                height: 58,
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
                padding: 0,
                background: "#0a0907",
                border:
                  i === active
                    ? "2px solid #D4AF37"
                    : "1px solid rgba(212,175,55,0.15)",
                opacity: i === active ? 1 : 0.6,
                transition: "all 0.18s",
              }}>
              <img
                src={thumb}
                alt=""
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {zoom && (
          <Lightbox
            images={images}
            index={active}
            onIndex={setActive}
            onClose={() => setZoom(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Post card ─────────────────────────────────────────────────────────────────
function PostCard({
  post,
  onLike,
  onDelete,
  onEdit,
  onChat,
  onBid,
  onCloseAuction,
  saved,
  onToggleSave,
  isOwn,
  meId,
}) {
  const { formatPrice } = useLocale();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.commentsList);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bidding, setBidding] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [showBids, setShowBids] = useState(false);
  const isListing = post.type === "listing";
  const isAuction = isListing && post.isAuction;
  const ended = post.auctionEnded;
  const inc = Number(post.minIncrement || 0);
  // Smallest acceptable next bid: top + increment (or +1 when no increment), else the starting bid.
  const minNext =
    post.currentBid != null
      ? Number(post.currentBid) + (inc > 0 ? inc : 1)
      : Number(post.startingBid || 0);
  const iWon =
    isAuction &&
    ended &&
    post.winnerUserId &&
    meId &&
    post.winnerUserId === meId;

  // Live bid-status for the signed-in viewer.
  const winning =
    isAuction && !ended && meId && post.topBidderId && post.topBidderId === meId;
  const hasMyBid =
    isAuction && meId && (post.bids || []).some((b) => b.user_id === meId);
  const outbid = isAuction && !ended && hasMyBid && !winning;

  // Quick-bid suggestions built around the minimum next bid.
  const step = inc > 0 ? inc : Math.max(1, Math.round(minNext * 0.05));
  const quickBids = [...new Set([minNext, minNext + step, minNext + step * 2])];

  const placeBid = (amt) => {
    if (!amt || amt < minNext) {
      alert(`Your bid must be at least ${formatPrice(minNext)}.`);
      return;
    }
    onBid(post.id, amt);
    setBidding(false);
    setBidAmount("");
  };
  const submitBid = () => placeBid(Number(bidAmount));

  // After an auction ends, connect the two parties to arrange payment & shipment.
  const openHandoff = () => {
    const ctx = { title: post.title, amount: post.currentBid };
    if (isOwn) {
      onChat({
        name: post.winnerName || "Winning bidder",
        userId: post.winnerUserId,
        avatar: initialsOf(post.winnerName),
        avatarColor: colorFor(post.winnerName),
        context: ctx,
      });
    } else {
      onChat({
        name: post.author,
        userId: post.userId,
        avatar: post.avatar,
        avatarColor: post.avatarColor,
        context: ctx,
      });
    }
  };

  const submitComment = async () => {
    const t = commentText.trim();
    if (!t) return;
    setCommentText("");
    try {
      const updated = await api.community.comment(post.id, t);
      setComments(updated.comments || []);
    } catch (e) {
      alert(e.message);
    }
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
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 18,
        position: "relative",
      }}>
      {/* LISTING badge */}
      {isListing && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 2,
            background: "rgba(184,115,51,0.16)",
            border: "1px solid rgba(184,115,51,0.35)",
            color: "#B87333",
            borderRadius: 999,
            padding: "3px 10px",
            fontFamily: "'Cinzel',serif",
            fontSize: 8,
            letterSpacing: "0.15em",
            fontWeight: 700,
          }}>
          LISTING
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "16px 18px 0" }}>
        <CommunityBadge communityId={post.community} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              cursor: !isOwn ? "pointer" : "default",
            }}
            onClick={() =>
              !isOwn &&
              onChat({
                name: post.author,
                avatar: post.avatar,
                avatarColor: post.avatarColor,
                userId: post.userId,
              })
            }>
            <Avatar initials={post.avatar} color={post.avatarColor} src={post.avatarUrl} />
            <div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#f0e8d8",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isOwn) e.currentTarget.style.color = "#D4AF37";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#f0e8d8";
                }}>
                {post.author}
              </div>
              <div
                style={{
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 10,
                  color: "rgba(200,191,160,0.35)",
                  marginTop: 1,
                }}>
                {post.time}
              </div>
            </div>
          </div>

          {/* Three-dot menu — own posts only */}
          <div
            style={{
              visibility: isOwn ? "visible" : "hidden",
              position: "relative",
              marginRight: isListing ? 68 : 0,
            }}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(200,191,160,0.4)",
                padding: "4px 8px",
                borderRadius: 6,
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D4AF37")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(200,191,160,0.4)")
              }>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -4 }}
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 6px)",
                    background: "#1a1712",
                    border: "1px solid rgba(212,175,55,0.2)",
                    borderRadius: 10,
                    overflow: "hidden",
                    zIndex: 30,
                    minWidth: 130,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                  }}>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(post);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "11px 16px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(200,191,160,0.7)",
                      fontFamily: "'Raleway',sans-serif",
                      fontSize: 12,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(212,175,55,0.08)";
                      e.currentTarget.style.color = "#D4AF37";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.color = "rgba(200,191,160,0.7)";
                    }}>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Post
                  </button>
                  <div
                    style={{
                      height: 1,
                      background: "rgba(212,175,55,0.08)",
                      margin: "0 10px",
                    }}
                  />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(post.id);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "11px 16px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(220,80,80,0.7)",
                      fontFamily: "'Raleway',sans-serif",
                      fontSize: 12,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(220,80,80,0.08)";
                      e.currentTarget.style.color = "#e05555";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                      e.currentTarget.style.color = "rgba(220,80,80,0.7)";
                    }}>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4h6v2" />
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
          <h3
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#f0e8d8",
              margin: "0 0 10px",
            }}>
            {post.title}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 4,
            }}>
            <span
              style={{
                background: "rgba(212,175,55,0.1)",
                border: "1px solid rgba(212,175,55,0.2)",
                color: "rgba(200,191,160,0.6)",
                borderRadius: 999,
                padding: "2px 10px",
                fontFamily: "'Raleway',sans-serif",
                fontSize: 9,
                letterSpacing: "0.08em",
              }}>
              {post.condition}
            </span>
            {post.location && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "rgba(200,191,160,0.42)",
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 10,
                }}>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {post.location}
              </span>
            )}
            {!isAuction && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "rgba(184,115,51,0.65)",
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 9,
                  letterSpacing: "0.07em",
                  fontWeight: 600,
                }}>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                ENQUIRE FOR PRICE
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Auction panel ── */}
      {isAuction && (
        <div
          style={{
            margin: "12px 18px 0",
            padding: 14,
            borderRadius: 12,
            border: `1px solid ${ended ? "rgba(212,175,55,0.3)" : "rgba(184,115,51,0.3)"}`,
            background: ended
              ? "rgba(212,175,55,0.05)"
              : "rgba(184,115,51,0.06)",
          }}>
          {/* Top row: current bid + status */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}>
            <div>
              <div
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 8,
                  letterSpacing: "0.16em",
                  color: ended ? "#D4AF37" : "#B87333",
                  marginBottom: 4,
                }}>
                {ended
                  ? "WINNING BID"
                  : post.currentBid != null
                    ? "CURRENT BID"
                    : "STARTING BID"}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#f0e8d8",
                  lineHeight: 1,
                }}>
                {formatPrice(
                  post.currentBid != null
                    ? post.currentBid
                    : post.startingBid || 0,
                )}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 7,
                  letterSpacing: "0.16em",
                  color: "rgba(200,191,160,0.4)",
                  marginBottom: 5,
                }}>
                {ended ? "CLOSED" : "TIME LEFT"}
              </div>
              <div
                style={{
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                <LiveCountdown endsAt={post.auctionEndsAt} ended={ended} />
              </div>
              <div
                style={{
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 9,
                  color: "rgba(200,191,160,0.45)",
                  marginTop: 6,
                }}>
                {post.bidCount} {post.bidCount === 1 ? "bid" : "bids"}
              </div>
            </div>
          </div>

          {/* Your-position status pill */}
          {(winning || outbid) && (
            <div
              style={{
                marginTop: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "6px 12px",
                borderRadius: 999,
                background: winning
                  ? "rgba(76,175,125,0.12)"
                  : "rgba(224,112,58,0.14)",
                border: `1px solid ${winning ? "rgba(76,175,125,0.4)" : "rgba(224,112,58,0.45)"}`,
              }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: winning ? "#4caf7d" : "#e0703a",
                  boxShadow: `0 0 8px ${winning ? "#4caf7d" : "#e0703a"}`,
                }}
              />
              <span
                style={{
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: winning ? "#6cd49d" : "#e89060",
                }}>
                {winning
                  ? "YOU'RE THE HIGHEST BIDDER"
                  : "YOU'VE BEEN OUTBID — RAISE YOUR BID"}
              </span>
            </div>
          )}

          {/* Ended → winner + handoff to private chat */}
          {ended ? (
            <div
              style={{
                marginTop: 12,
                borderTop: "1px solid rgba(212,175,55,0.12)",
                paddingTop: 12,
              }}>
              {post.winnerUserId ? (
                <>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontSize: 15,
                      color: "rgba(200,191,160,0.85)",
                    }}>
                    Won by{" "}
                    <span style={{ color: "#D4AF37", fontWeight: 700 }}>
                      {iWon ? "you" : post.winnerName}
                    </span>{" "}
                    at {formatPrice(post.currentBid)}.
                  </div>
                  {(isOwn || iWon) && (
                    <>
                      <button
                        onClick={openHandoff}
                        style={{
                          marginTop: 10,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                          color: "#0e0c0a",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "'Cinzel',serif",
                          fontSize: 9,
                          letterSpacing: "0.1em",
                          fontWeight: 700,
                          padding: "9px 16px",
                          borderRadius: 999,
                        }}>
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {isOwn
                          ? "MESSAGE WINNER — ARRANGE DELIVERY"
                          : "MESSAGE SELLER — ARRANGE DELIVERY"}
                      </button>
                      <div
                        style={{
                          fontFamily: "'Raleway',sans-serif",
                          fontSize: 10,
                          color: "rgba(200,191,160,0.4)",
                          marginTop: 7,
                          lineHeight: 1.5,
                        }}>
                        Payment and shipment are arranged privately between
                        buyer and seller in chat.
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 15,
                    color: "rgba(200,191,160,0.6)",
                  }}>
                  Auction ended with no bids.
                </div>
              )}
            </div>
          ) : (
            /* Open → bid / close actions */
            <div
              style={{
                marginTop: 12,
                borderTop: "1px solid rgba(184,115,51,0.14)",
                paddingTop: 12,
              }}>
              {isOwn ? (
                <button
                  onClick={() => onCloseAuction(post.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    background: "transparent",
                    color: "#D4AF37",
                    border: "1px solid rgba(212,175,55,0.4)",
                    cursor: "pointer",
                    fontFamily: "'Cinzel',serif",
                    fontSize: 9,
                    letterSpacing: "0.1em",
                    fontWeight: 700,
                    padding: "9px 16px",
                    borderRadius: 999,
                  }}>
                  END AUCTION NOW{" "}
                  {post.currentBid != null ? "— AWARD HIGHEST" : ""}
                </button>
              ) : bidding ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}>
                  {/* Quick-bid chips */}
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {quickBids.map((amt, i) => (
                      <button
                        key={amt}
                        onClick={() => placeBid(amt)}
                        style={{
                          flex: 1,
                          minWidth: 86,
                          padding: "9px 8px",
                          borderRadius: 10,
                          cursor: "pointer",
                          background:
                            i === 0
                              ? "rgba(184,115,51,0.14)"
                              : "rgba(255,255,255,0.04)",
                          border: `1px solid ${i === 0 ? "rgba(184,115,51,0.45)" : "rgba(212,175,55,0.18)"}`,
                          color: i === 0 ? "#d9974f" : "rgba(200,191,160,0.7)",
                          fontFamily: "'Raleway',sans-serif",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor =
                            "rgba(212,175,55,0.6)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor =
                            i === 0
                              ? "rgba(184,115,51,0.45)"
                              : "rgba(212,175,55,0.18)";
                        }}>
                        <div
                          style={{
                            fontSize: 7,
                            letterSpacing: "0.1em",
                            opacity: 0.7,
                            marginBottom: 3,
                          }}>
                          {i === 0 ? "MIN BID" : `+${formatPrice(step * i)}`}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Cormorant Garamond',serif",
                            fontSize: 17,
                            fontWeight: 700,
                            color: "#f0e8d8",
                            lineHeight: 1,
                          }}>
                          {formatPrice(amt)}
                        </div>
                      </button>
                    ))}
                  </div>
                  {/* Custom amount + confirm */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}>
                    <div style={{ position: "relative", flex: 1, minWidth: 150 }}>
                      <input
                        type="number"
                        min={minNext}
                        value={bidAmount}
                        autoFocus
                        placeholder={`Custom — min ${minNext}`}
                        onChange={(e) => setBidAmount(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitBid()}
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(184,115,51,0.4)",
                          borderRadius: 999,
                          padding: "10px 16px",
                          color: "#e8e0d0",
                          fontFamily: "'Raleway',sans-serif",
                          fontSize: 13,
                          outline: "none",
                        }}
                      />
                    </div>
                    <button
                      onClick={submitBid}
                      style={{
                        background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                        color: "#0e0c0a",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "'Cinzel',serif",
                        fontSize: 9,
                        letterSpacing: "0.1em",
                        fontWeight: 700,
                        padding: "11px 18px",
                        borderRadius: 999,
                      }}>
                      CONFIRM BID
                    </button>
                    <button
                      onClick={() => setBidding(false)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(200,191,160,0.45)",
                        fontFamily: "'Raleway',sans-serif",
                        fontSize: 11,
                      }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setBidAmount("");
                    setBidding(true);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    background: outbid
                      ? "linear-gradient(135deg,#e0703a,#d18a44)"
                      : "linear-gradient(135deg,#B87333,#d18a44)",
                    color: "#0e0c0a",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Cinzel',serif",
                    fontSize: 9,
                    letterSpacing: "0.1em",
                    fontWeight: 700,
                    padding: "11px 20px",
                    borderRadius: 999,
                    boxShadow: "0 6px 18px rgba(184,115,51,0.25)",
                  }}>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M14.5 5.5 18 9l-9.5 9.5L5 19l.5-3.5L15 6z" />
                    <path d="m18 9 2-2-3.5-3.5-2 2" />
                  </svg>
                  {outbid ? "RAISE YOUR BID" : "PLACE BID"} ·{" "}
                  {formatPrice(minNext)}
                </button>
              )}
            </div>
          )}

          {/* Bid history */}
          {post.bidCount > 0 && (
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => setShowBids((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(200,191,160,0.5)",
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.05em",
                  padding: 0,
                }}>
                {showBids ? "▾ Hide" : "▸ View"} bid history ({post.bidCount})
              </button>
              <AnimatePresence>
                {showBids && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: "hidden" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        marginTop: 8,
                      }}>
                      {post.bids.map((b, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "6px 10px",
                            borderRadius: 8,
                            background:
                              i === 0
                                ? "rgba(212,175,55,0.08)"
                                : "rgba(255,255,255,0.02)",
                          }}>
                          <span
                            style={{
                              fontFamily: "'Raleway',sans-serif",
                              fontSize: 11,
                              color:
                                i === 0 ? "#D4AF37" : "rgba(200,191,160,0.6)",
                            }}>
                            {b.user_id === meId ? "You" : b.bidder}
                            {i === 0 ? " · top bid" : ""}
                          </span>
                          <span
                            style={{
                              fontFamily: "'Cormorant Garamond',serif",
                              fontSize: 15,
                              fontWeight: 700,
                              color:
                                i === 0 ? "#f0e8d8" : "rgba(200,191,160,0.7)",
                            }}>
                            {formatPrice(b.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Body text */}
      <div style={{ padding: "12px 18px" }}>
        <p
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 17,
            color: "rgba(200,191,160,0.82)",
            lineHeight: 1.8,
            margin: 0,
            // Preserve line breaks, bullet lists and indentation the author typed.
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
          {post.text}
        </p>
      </div>

      {/* Images — full artwork, no crop, click to zoom */}
      {post.images && post.images.length > 0 && (
        <div style={{ margin: "0 18px 14px" }}>
          <PostImages images={post.images} />
        </div>
      )}

      {/* Videos */}
      {post.videos && post.videos.length > 0 && (
        <div
          style={{
            margin: "0 18px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
          {post.videos.map((src, i) => (
            <div
              key={i}
              style={{
                borderRadius: 10,
                overflow: "hidden",
                background: "#000",
              }}>
              <video
                src={src}
                controls
                style={{ width: "100%", display: "block", maxHeight: 380 }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Actions bar */}
      <div
        style={{
          padding: "10px 14px",
          borderTop: "1px solid rgba(212,175,55,0.07)",
          display: "flex",
          gap: 2,
          alignItems: "center",
        }}>
        {/* Like */}
        <button
          onClick={() => onLike(post.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Raleway',sans-serif",
            fontSize: 12,
            color: post.liked ? "#D4AF37" : "rgba(200,191,160,0.45)",
            padding: "6px 12px",
            borderRadius: 999,
            transition: "all 0.2s",
          }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={post.liked ? "#D4AF37" : "none"}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {post.likes}
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Raleway',sans-serif",
            fontSize: 12,
            color: showComments ? "#D4AF37" : "rgba(200,191,160,0.45)",
            padding: "6px 12px",
            borderRadius: 999,
            transition: "all 0.2s",
          }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {comments.length}
        </button>

        {/* Marketplace actions */}
        {isListing && !(isAuction && ended) && (
          <>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => onToggleSave(post.id, !saved)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Raleway',sans-serif",
                fontSize: 11,
                color: saved ? "#D4AF37" : "rgba(200,191,160,0.4)",
                padding: "6px 10px",
                borderRadius: 999,
                transition: "all 0.2s",
              }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={saved ? "#D4AF37" : "none"}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {saved ? "Saved" : "Save"}
            </button>
            <button
              onClick={() =>
                onChat({
                  name: post.author,
                  avatar: post.avatar,
                  avatarColor: post.avatarColor,
                  userId: post.userId,
                })
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(184,115,51,0.1)",
                border: "1px solid rgba(184,115,51,0.3)",
                cursor: "pointer",
                fontFamily: "'Raleway',sans-serif",
                fontSize: 9,
                letterSpacing: "0.09em",
                fontWeight: 700,
                color: "#B87333",
                padding: "5px 13px",
                borderRadius: 999,
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(184,115,51,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(184,115,51,0.1)";
              }}>
              MESSAGE SELLER
            </button>
          </>
        )}
      </div>

      {/* Comments panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26 }}
            style={{
              overflow: "hidden",
              borderTop: "1px solid rgba(212,175,55,0.07)",
            }}>
            <div
              style={{
                padding: "14px 18px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>
              {comments.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "rgba(212,175,55,0.12)",
                      border: "1px solid rgba(212,175,55,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Cinzel',serif",
                      fontSize: 8,
                      color: "#D4AF37",
                      flexShrink: 0,
                    }}>
                    {c.author
                      .split(" ")
                      .map((s) => s[0])
                      .join("")}
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(212,175,55,0.08)",
                      borderRadius: 9,
                      padding: "9px 13px",
                      flex: 1,
                    }}>
                    <div
                      style={{
                        fontFamily: "'Raleway',sans-serif",
                        fontSize: 10,
                        color: "#D4AF37",
                        marginBottom: 3,
                      }}>
                      {c.author}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 15,
                        color: "rgba(200,191,160,0.78)",
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}>
                      {c.text}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitComment()}
                  placeholder="Add a comment…"
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(212,175,55,0.15)",
                    borderRadius: 999,
                    padding: "8px 14px",
                    color: "#e8e0d0",
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 12,
                    outline: "none",
                  }}
                />
                <button
                  onClick={submitComment}
                  style={{
                    padding: "8px 18px",
                    background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                    color: "#0e0c0a",
                    border: "none",
                    borderRadius: 999,
                    fontFamily: "'Cinzel',serif",
                    fontSize: 8,
                    letterSpacing: "0.14em",
                    cursor: "pointer",
                  }}>
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
function CreatePostModal({
  onClose,
  onPost,
  editingPost,
  defaultCommunity,
  forceListing = false,
}) {
  // A listing when in the marketplace section, or when editing an existing listing.
  const isMarketplace = forceListing || editingPost?.type === "listing";
  const [text, setText] = useState(editingPost?.text || "");
  const [images, setImages] = useState(editingPost?.images || []);
  const [videos, setVideos] = useState(
    editingPost?.videos || (editingPost?.video ? [editingPost.video] : []),
  );
  const [community, setCommunity] = useState(
    editingPost?.community ||
      (isMarketplace ? "marketplace" : defaultCommunity || "general"),
  );
  const [listingTitle, setListingTitle] = useState(editingPost?.title || "");
  const [condition, setCondition] = useState(
    editingPost?.condition || "Excellent",
  );
  const [location, setLocation] = useState(editingPost?.location || "");
  const [isAuction, setIsAuction] = useState(editingPost?.isAuction || false);
  const [startingBid, setStartingBid] = useState(
    editingPost?.startingBid ?? "",
  );
  const [minIncrement, setMinIncrement] = useState(
    editingPost?.minIncrement ?? "",
  );
  const [auctionEndsAt, setAuctionEndsAt] = useState(
    toLocalInput(editingPost?.auctionEndsAt),
  );

  const handleImages = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = "";
    for (const file of files) {
      try {
        const { url } = await api.uploads.file(file, "image");
        setImages((prev) => [...prev, url]);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleVideos = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = "";
    for (const file of files) {
      try {
        const { url } = await api.uploads.file(file, "video");
        setVideos((prev) => [...prev, url]);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const removeImage = (i) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  const removeVideo = (i) =>
    setVideos((prev) => prev.filter((_, idx) => idx !== i));

  const hasContent = text.trim() || images.length > 0 || videos.length > 0;
  const auctionValid = !isAuction || Number(startingBid) > 0;
  const canPost = isMarketplace
    ? hasContent && listingTitle.trim() && auctionValid
    : hasContent;

  const handlePost = () => {
    if (!canPost) return;
    onPost({
      text,
      images,
      videos,
      community,
      type: isMarketplace ? "listing" : "discussion",
      ...(isMarketplace
        ? {
            title: listingTitle,
            condition,
            location,
            is_auction: isAuction,
            ...(isAuction
              ? {
                  starting_bid: Number(startingBid) || 0,
                  min_increment: Number(minIncrement) || 0,
                  auction_ends_at: auctionEndsAt
                    ? new Date(auctionEndsAt).toISOString()
                    : null,
                }
              : {}),
          }
        : {}),
    });
    onClose();
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(212,175,55,0.18)",
    borderRadius: 8,
    padding: "10px 13px",
    color: "#e8e0d0",
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#11100d",
          border: "1px solid rgba(212,175,55,0.22)",
          borderRadius: 18,
          padding: "28px 30px",
          width: "100%",
          maxWidth: 620,
          maxHeight: "92vh",
          overflowY: "auto",
        }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}>
          <h3
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#fff",
              margin: 0,
            }}>
            {editingPost
              ? isMarketplace
                ? "Edit Listing"
                : "Edit Post"
              : isMarketplace
                ? "List an Artwork"
                : "Create Post"}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(200,191,160,0.45)",
              fontSize: 22,
              lineHeight: 1,
            }}>
            ×
          </button>
        </div>

        {/* Community picker — listings always go to the Marketplace */}
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 9,
              letterSpacing: "0.12em",
              color: "rgba(200,191,160,0.38)",
              marginBottom: 8,
            }}>
            {isMarketplace ? "SECTION" : "POST TO COMMUNITY"}
          </div>
          {isMarketplace ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(184,115,51,0.12)",
                border: "1px solid rgba(184,115,51,0.4)",
              }}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d9974f"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round">
                <path d="M3 9l1-5h16l1 5" />
                <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
                <path d="M9 22V12h6v10" />
              </svg>
              <span
                style={{
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: "#d9974f",
                }}>
                Marketplace · For Sale & Auctions
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {COMMUNITIES.filter(
                (c) => c.id !== "all" && c.id !== "marketplace",
              ).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCommunity(c.id)}
                  style={{
                    padding: "5px 13px",
                    borderRadius: 999,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background:
                      community === c.id
                        ? `${c.color}28`
                        : "rgba(255,255,255,0.03)",
                    border: `1px solid ${community === c.id ? c.color : "rgba(212,175,55,0.12)"}`,
                    color:
                      community === c.id ? c.color : "rgba(200,191,160,0.45)",
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                  }}>
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Marketplace fields */}
        {isMarketplace && (
          <div
            style={{
              marginBottom: 16,
              padding: "16px",
              background: "rgba(184,115,51,0.06)",
              border: "1px solid rgba(184,115,51,0.18)",
              borderRadius: 12,
            }}>
            <div
              style={{
                fontFamily: "'Raleway',sans-serif",
                fontSize: 9,
                letterSpacing: "0.12em",
                color: "#B87333",
                marginBottom: 12,
              }}>
              LISTING DETAILS
            </div>
            <div style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 9,
                  color: "rgba(200,191,160,0.38)",
                  marginBottom: 6,
                  letterSpacing: "0.08em",
                }}>
                TITLE *
              </div>
              <input
                value={listingTitle}
                onChange={(e) => setListingTitle(e.target.value)}
                placeholder="e.g. Original Oil on Canvas — 'Amber Threshold'"
                style={inputStyle}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}>
              <div>
                <div
                  style={{
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 9,
                    color: "rgba(200,191,160,0.38)",
                    marginBottom: 6,
                    letterSpacing: "0.08em",
                  }}>
                  CONDITION
                </div>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  style={{
                    ...inputStyle,
                    background: "#181510",
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 12,
                    cursor: "pointer",
                  }}>
                  {["New", "Excellent", "Very Good", "Good", "Fair"].map(
                    (c) => (
                      <option key={c}>{c}</option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 9,
                    color: "rgba(200,191,160,0.38)",
                    marginBottom: 6,
                    letterSpacing: "0.08em",
                  }}>
                  LOCATION
                </div>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  style={{ ...inputStyle, fontSize: 13 }}
                />
              </div>
            </div>

            {/* Auction toggle */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 14,
                cursor: "pointer",
              }}>
              <input
                type="checkbox"
                checked={isAuction}
                onChange={(e) => setIsAuction(e.target.checked)}
                style={{ accentColor: "#B87333", width: 15, height: 15 }}
              />
              <span
                style={{
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 12,
                  color: "#e8e0d0",
                  fontWeight: 600,
                }}>
                Sell by auction — highest bid wins
              </span>
            </label>

            {isAuction && (
              <div
                style={{
                  marginTop: 12,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}>
                <div>
                  <div
                    style={{
                      fontFamily: "'Raleway',sans-serif",
                      fontSize: 9,
                      color: "rgba(200,191,160,0.38)",
                      marginBottom: 6,
                      letterSpacing: "0.08em",
                    }}>
                    STARTING BID (₹) *
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={startingBid}
                    onChange={(e) => setStartingBid(e.target.value)}
                    placeholder="e.g. 10000"
                    style={{
                      ...inputStyle,
                      fontFamily: "'Raleway',sans-serif",
                      fontSize: 13,
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Raleway',sans-serif",
                      fontSize: 9,
                      color: "rgba(200,191,160,0.38)",
                      marginBottom: 6,
                      letterSpacing: "0.08em",
                    }}>
                    MIN. INCREMENT (₹)
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={minIncrement}
                    onChange={(e) => setMinIncrement(e.target.value)}
                    placeholder="e.g. 500"
                    style={{
                      ...inputStyle,
                      fontFamily: "'Raleway',sans-serif",
                      fontSize: 13,
                    }}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <DateTimeField
                    label="ENDS AT (OPTIONAL)"
                    hint="Leave blank to close the auction manually."
                    value={auctionEndsAt}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={setAuctionEndsAt}
                  />
                </div>
                {Number(startingBid) <= 0 && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      fontFamily: "'Raleway',sans-serif",
                      fontSize: 10,
                      color: "rgba(220,140,80,0.8)",
                    }}>
                    Set a starting bid to enable the auction.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Text */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={isMarketplace ? 3 : 5}
          placeholder={
            isMarketplace
              ? "Describe the artwork — dimensions, medium, provenance, condition details…"
              : "Share a thought, a process, a question — anything that connects to the world of art…"
          }
          style={{
            ...inputStyle,
            padding: "13px 15px",
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 16,
            lineHeight: 1.75,
            resize: "none",
            borderRadius: 10,
          }}
        />

        {/* Image previews */}
        {images.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                images.length === 1
                  ? "1fr"
                  : images.length === 3
                    ? "1fr 1fr 1fr"
                    : "1fr 1fr",
              gap: 6,
              marginTop: 12,
              borderRadius: 10,
              overflow: "hidden",
            }}>
            {images.map((src, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  height: 150,
                  overflow: "hidden",
                  borderRadius: 8,
                  background: "#0a0907",
                  border: "1px solid rgba(212,175,55,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${src})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(20px) brightness(0.4)",
                    transform: "scale(1.15)",
                  }}
                />
                <img
                  src={src}
                  alt=""
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
                <button
                  onClick={() => removeImage(i)}
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.65)",
                    border: "none",
                    color: "#fff",
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Video previews */}
        {videos.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 12,
            }}>
            {videos.map((src, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#000",
                }}>
                <video
                  src={src}
                  controls
                  style={{ width: "100%", display: "block", maxHeight: 240 }}
                />
                <button
                  onClick={() => removeVideo(i)}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.72)",
                    border: "none",
                    color: "#fff",
                    fontSize: 16,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
            flexWrap: "wrap",
            gap: 10,
          }}>
          <div style={{ display: "flex", gap: 8 }}>
            {/* Photos */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
                color: "rgba(200,191,160,0.5)",
                fontFamily: "'Raleway',sans-serif",
                fontSize: 11,
                padding: "8px 13px",
                borderRadius: 999,
                border: "1px solid rgba(212,175,55,0.15)",
                background: "rgba(255,255,255,0.03)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#D4AF37";
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(200,191,160,0.5)";
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)";
              }}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {images.length > 0
                ? `${images.length} photo${images.length > 1 ? "s" : ""}`
                : "Photos"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                style={{ display: "none" }}
              />
            </label>

            {/* Videos */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
                color: "rgba(200,191,160,0.5)",
                fontFamily: "'Raleway',sans-serif",
                fontSize: 11,
                padding: "8px 13px",
                borderRadius: 999,
                border: "1px solid rgba(212,175,55,0.15)",
                background: "rgba(255,255,255,0.03)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#D4AF37";
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(200,191,160,0.5)";
                e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)";
              }}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
              {videos.length > 0
                ? `${videos.length} video${videos.length > 1 ? "s" : ""}`
                : "Videos"}
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideos}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "rgba(200,191,160,0.55)",
                border: "1px solid rgba(212,175,55,0.18)",
                borderRadius: 999,
                fontFamily: "'Cinzel',serif",
                fontSize: 9,
                letterSpacing: "0.14em",
                cursor: "pointer",
              }}>
              CANCEL
            </button>
            <button
              onClick={handlePost}
              style={{
                padding: "10px 26px",
                background: canPost
                  ? "linear-gradient(135deg,#D4AF37,#e8c53a)"
                  : "rgba(212,175,55,0.14)",
                color: canPost ? "#0e0c0a" : "rgba(200,191,160,0.3)",
                border: "none",
                borderRadius: 999,
                fontFamily: "'Cinzel',serif",
                fontSize: 9,
                letterSpacing: "0.14em",
                cursor: canPost ? "pointer" : "not-allowed",
              }}>
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
  const { formatPrice } = useLocale();
  const ctx = user.context;
  // When opened from a won auction, prefill a starter message about the piece.
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(() =>
    ctx
      ? `Hi! This is regarding "${ctx.title}" (winning bid ${formatPrice(ctx.amount)}). Let's arrange payment and shipment.`
      : "",
  );
  const bottomRef = useRef(null);
  const peerKey =
    me && user.userId ? `peer:${[me.id, user.userId].sort().join(":")}` : null;

  useEffect(() => {
    if (!peerKey) return;
    let cancelled = false;
    api.chat
      .conversation(peerKey)
      .then((d) => {
        if (!cancelled) setMessages(d);
      })
      .catch(() => {});
    const sub = realtime
      .channel(peerKey)
      .on("message", (m) => {
        setMessages((prev) =>
          prev.find((x) => x.id === m.id) ? prev : [...prev, m],
        );
      })
      .subscribe();
    return () => {
      cancelled = true;
      sub.unsubscribe();
    };
  }, [peerKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const t = input.trim();
    if (!t || !peerKey) return;
    setInput("");
    try {
      const m = await api.chat.send({
        conversation_key: peerKey,
        sender: "me",
        text: t,
      });
      setMessages((prev) =>
        prev.find((x) => x.id === m.id) ? prev : [...prev, m],
      );
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#12100d",
          border: "1px solid rgba(212,175,55,0.22)",
          borderRadius: 18,
          boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "1px solid rgba(212,175,55,0.1)",
            background: "rgba(255,255,255,0.03)",
          }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={user.avatar} color={user.avatarColor} size={34} />
            <div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#f0e8d8",
                }}>
                {user.name}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 1,
                }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4caf7d",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 10,
                    color: "rgba(200,191,160,0.4)",
                  }}>
                  Online
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(200,191,160,0.4)",
              fontSize: 20,
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#D4AF37")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(200,191,160,0.4)")
            }>
            ×
          </button>
        </div>

        {/* Auction handoff context */}
        {ctx && (
          <div
            style={{
              padding: "9px 16px",
              background: "rgba(212,175,55,0.08)",
              borderBottom: "1px solid rgba(212,175,55,0.12)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}>
              <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
              <path d="M2 7h20v5H2z" />
              <path d="M12 22V7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
            <span
              style={{
                fontFamily: "'Raleway',sans-serif",
                fontSize: 11,
                color: "rgba(200,191,160,0.75)",
              }}>
              <strong style={{ color: "#D4AF37" }}>{ctx.title}</strong> · won at{" "}
              {formatPrice(ctx.amount)}
            </span>
          </div>
        )}

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 14px 8px",
            maxHeight: 300,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>
          {!peerKey && (
            <div
              style={{
                textAlign: "center",
                padding: 20,
                fontFamily: "'Raleway',sans-serif",
                fontSize: 12,
                color: "rgba(200,191,160,0.55)",
              }}>
              Please sign in to message {user.name}.
            </div>
          )}
          {peerKey && messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: 20,
                fontFamily: "'Raleway',sans-serif",
                fontSize: 12,
                color: "rgba(200,191,160,0.45)",
              }}>
              Say hello to start the conversation.
            </div>
          )}
          {messages.map((msg) => {
            const mine = me && msg.user_id === me.id;
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: mine ? "flex-end" : "flex-start",
                }}>
                <div
                  style={{
                    maxWidth: "78%",
                    padding: "9px 13px",
                    borderRadius: mine
                      ? "12px 12px 2px 12px"
                      : "12px 12px 12px 2px",
                    background: mine
                      ? "linear-gradient(135deg,#D4AF37,#c9a52e)"
                      : "rgba(255,255,255,0.06)",
                    border: mine ? "none" : "1px solid rgba(212,175,55,0.12)",
                    color: mine ? "#0e0c0a" : "rgba(200,191,160,0.85)",
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 15,
                    lineHeight: 1.5,
                  }}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "10px 12px",
            borderTop: "1px solid rgba(212,175,55,0.1)",
            background: "rgba(0,0,0,0.2)",
          }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={peerKey ? "Type a message…" : "Sign in to chat"}
            disabled={!peerKey}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(212,175,55,0.15)",
              borderRadius: 999,
              padding: "8px 14px",
              color: "#e8e0d0",
              fontFamily: "'Raleway',sans-serif",
              fontSize: 12,
              outline: "none",
            }}
          />
          <button
            onClick={send}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              flexShrink: 0,
              background: input.trim()
                ? "linear-gradient(135deg,#D4AF37,#c9a52e)"
                : "rgba(212,175,55,0.15)",
              border: "none",
              cursor: input.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke={input.trim() ? "#0e0c0a" : "rgba(212,175,55,0.4)"}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function Community() {
  const { user, role } = useAuth();
  const [posts, setPosts] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [feedLoading, setFeedLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const [activeCommunity, setActiveCommunity] = useState("all");
  const [joined, setJoined] = useState(new Set());
  const [notifications, setNotifications] = useState({});
  const [, setCommTick] = useState(0);
  // Two top-level sections: "community" (chat / discussion) and "marketplace" (bidding).
  const [mode, setMode] = useState("community");
  // Marketplace listing filter: all | auction | buy | ending.
  const [mktFilter, setMktFilter] = useState("all");

  // Load the admin-managed community list (replaces the in-place defaults).
  useEffect(() => {
    api.community
      .communities()
      .then((rows) => {
        if (!rows || rows.length === 0) return;
        const next = [
          {
            id: "all",
            name: "All Communities",
            desc: "Browse everything",
            color: "#D4AF37",
          },
          ...rows.map((c) => ({
            id: c.slug,
            name: c.name,
            desc: c.description,
            color: c.color || "#D4AF37",
          })),
        ];
        COMMUNITIES.splice(0, COMMUNITIES.length, ...next);
        setCommTick((t) => t + 1);
      })
      .catch(() => {});
  }, []);

  // Which listings the signed-in buyer has already saved for later.
  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    api.wishlist
      .listingIds()
      .then((ids) => setSavedIds(new Set(ids || [])))
      .catch(() => {});
  }, [user]);

  // Load the real feed — marketplace pulls listings, community pulls discussions.
  useEffect(() => {
    let cancelled = false;
    setFeedLoading(true);
    const target = mode === "marketplace" ? "marketplace" : activeCommunity;
    api.community
      .posts(target)
      .then((rows) => {
        if (!cancelled) setPosts((rows || []).map(mapPost));
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      })
      .finally(() => {
        if (!cancelled) setFeedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCommunity, mode]);

  const handleJoin = (id) => {
    setJoined((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNotif = (id, level) =>
    setNotifications((prev) => ({ ...prev, [id]: level }));

  // Derive the visible feed from the active section.
  let filteredPosts;
  if (mode === "marketplace") {
    const listings = posts.filter((p) => p.type === "listing");
    if (mktFilter === "auction") {
      filteredPosts = listings.filter((p) => p.isAuction && !p.auctionEnded);
    } else if (mktFilter === "buy") {
      filteredPosts = listings.filter((p) => !p.isAuction);
    } else if (mktFilter === "ending") {
      filteredPosts = listings
        .filter((p) => p.isAuction && !p.auctionEnded && p.auctionEndsAt)
        .sort((a, b) => new Date(a.auctionEndsAt) - new Date(b.auctionEndsAt));
    } else {
      filteredPosts = listings;
    }
  } else {
    // Community / chat — discussions only (never marketplace listings).
    filteredPosts = posts.filter((p) => p.type !== "listing");
  }

  // Live marketplace stats for the section banner.
  const allListings = posts.filter((p) => p.type === "listing");
  const liveAuctions = allListings.filter(
    (p) => p.isAuction && !p.auctionEnded,
  ).length;

  const handleLike = async (id) => {
    if (!user) {
      alert("Please sign in to like posts.");
      return;
    }
    try {
      const updated = await api.community.like(id);
      setPosts((prev) => prev.map((p) => (p.id === id ? mapPost(updated) : p)));
    } catch (e) {
      alert(e.message);
    }
  };

  // Save-for-later for marketplace listings — appears in Profile → Saved.
  const handleToggleSave = async (id, next) => {
    if (!user) {
      alert("Please sign in to save listings.");
      return;
    }
    setSavedIds((prev) => {
      const s = new Set(prev);
      if (next) s.add(id);
      else s.delete(id);
      return s;
    });
    try {
      if (next) await api.wishlist.saveListing(id);
      else await api.wishlist.removeListing(id);
    } catch (e) {
      // Revert on failure.
      setSavedIds((prev) => {
        const s = new Set(prev);
        if (next) s.delete(id);
        else s.add(id);
        return s;
      });
      alert(e.message);
    }
  };

  const handlePost = async (data) => {
    try {
      const created = await api.community.createPost(data);
      setPosts((prev) => [mapPost(created), ...prev]);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.community.deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setShowModal(true);
  };

  const handleEditSave = async (data) => {
    try {
      const updated = await api.community.updatePost(editingPost.id, data);
      setPosts((prev) =>
        prev.map((p) => (p.id === editingPost.id ? mapPost(updated) : p)),
      );
    } catch (e) {
      alert(e.message);
    }
    setEditingPost(null);
  };

  const handleBid = async (id, amount) => {
    if (!user) {
      alert("Please sign in to place a bid.");
      return;
    }
    try {
      const updated = await api.community.bid(id, amount);
      setPosts((prev) => prev.map((p) => (p.id === id ? mapPost(updated) : p)));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCloseAuction = async (id) => {
    if (
      !window.confirm(
        "End this auction now and award the highest bidder? This cannot be undone.",
      )
    )
      return;
    try {
      const updated = await api.community.closeAuction(id);
      setPosts((prev) => prev.map((p) => (p.id === id ? mapPost(updated) : p)));
    } catch (e) {
      alert(e.message);
    }
  };

  const openChat = (target) => {
    if (!user) {
      alert("Please sign in to send messages.");
      return;
    }
    if (!target.userId || target.userId === user.id) return;
    setChatUser(target);
  };

  const openCreate = () => {
    if (!user) {
      alert("Please sign in to create a post.");
      return;
    }
    setShowModal(true);
  };

  const activeCommunityData = COMMUNITIES.find((c) => c.id === activeCommunity);

  return (
    <div style={{ background: "#080808", minHeight: "100vh" }}>
      {/* Hero */}
      <div
        className="community-hero"
        style={{
          background: "linear-gradient(180deg, #0e0c0a 0%, #080808 100%)",
          borderBottom: "1px solid rgba(212,175,55,0.1)",
          padding: "140px 48px 60px",
          textAlign: "center",
        }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}>
          <div className="gold-rule" style={{ justifyContent: "center" }}>
            <div
              className="grl"
              style={{
                background: "linear-gradient(90deg, transparent, #D4AF37)",
              }}
            />
            <span className="grt">Connecting Collectors & Artists</span>
            <div
              className="grl"
              style={{
                background: "linear-gradient(90deg, #D4AF37, transparent)",
              }}
            />
          </div>
          <h1 className="section-heading">
            <span className="bold-white">Arrt Coliseum</span>{" "}
            <em>{mode === "marketplace" ? "Marketplace" : "Community"}</em>
          </h1>
          <p
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 15,
              color: "rgba(200,191,160,0.55)",
              maxWidth: 540,
              margin: "14px auto 0",
              lineHeight: 1.75,
            }}>
            {mode === "marketplace"
              ? "Discover, bid on and acquire original artworks — direct from artists and collectors. Win an auction and arrange delivery privately in chat."
              : "A thriving community where artists, collectors, curators and industry professionals connect, collaborate and support each other."}
          </p>

          {/* ── Two main sections: Community (chat) vs Marketplace (bidding) ── */}
          <div className="comm-mode-toggle">
            {[
              {
                id: "community",
                label: "Community",
                sub: "Chat & discuss",
                icon: (
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                ),
              },
              {
                id: "marketplace",
                label: "Marketplace",
                sub: "Buy, sell & bid",
                icon: (
                  <>
                    <path d="M3 9l1-5h16l1 5" />
                    <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
                    <path d="M9 22V12h6v10" />
                  </>
                ),
              },
            ].map((m) => {
              const on = mode === m.id;
              const accent = m.id === "marketplace" ? "#B87333" : "#D4AF37";
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className="comm-mode-btn"
                  style={{
                    background: on
                      ? `linear-gradient(135deg, ${accent}22, ${accent}0d)`
                      : "transparent",
                    border: `1px solid ${on ? `${accent}88` : "rgba(212,175,55,0.14)"}`,
                    boxShadow: on ? `0 8px 26px ${accent}26` : "none",
                  }}>
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: on ? accent : "rgba(255,255,255,0.04)",
                      color: on ? "#0e0c0a" : "rgba(200,191,160,0.5)",
                      transition: "all 0.2s",
                    }}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      {m.icon}
                    </svg>
                  </span>
                  <span style={{ textAlign: "left" }}>
                    <span
                      style={{
                        display: "block",
                        fontFamily: "'Cinzel',serif",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        color: on ? "#f4ecdc" : "rgba(200,191,160,0.7)",
                      }}>
                      {m.label}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontFamily: "'Raleway',sans-serif",
                        fontSize: 9.5,
                        letterSpacing: "0.05em",
                        color: on ? accent : "rgba(200,191,160,0.35)",
                        marginTop: 2,
                      }}>
                      {m.sub}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Layout: sidebar + feed */}
      <div className="comm-layout">
        {/* ── Sidebar ── */}
        <aside className="comm-sidebar">
          {mode === "community" ? (
            <>
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(212,175,55,0.1)",
                  borderRadius: 14,
                  padding: "14px 10px",
                }}>
                <div
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: 8,
                    letterSpacing: "0.18em",
                    color: "rgba(200,191,160,0.3)",
                    marginBottom: 10,
                    paddingLeft: 4,
                  }}>
                  COMMUNITIES
                </div>
                {COMMUNITIES.filter((c) => c.id !== "marketplace").map((c) => (
                  <CommunitySidebarRow
                    key={c.id}
                    community={c}
                    joined={joined.has(c.id)}
                    notifLevel={notifications[c.id] || "Off"}
                    onJoin={handleJoin}
                    onNotif={(lv) => handleNotif(c.id, lv)}
                    active={activeCommunity === c.id}
                    onClick={() => setActiveCommunity(c.id)}
                  />
                ))}
              </div>

              {role === "admin" && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px dashed rgba(212,175,55,0.2)",
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 11,
                    color: "rgba(200,191,160,0.45)",
                    lineHeight: 1.5,
                  }}>
                  Manage communities in the{" "}
                  <strong style={{ color: "#D4AF37" }}>
                    Admin → Categories
                  </strong>{" "}
                  panel.
                </div>
              )}
            </>
          ) : (
            <>
              {/* Sell CTA */}
              <button
                onClick={openCreate}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "13px 14px",
                  marginBottom: 12,
                  borderRadius: 13,
                  cursor: "pointer",
                  background: "linear-gradient(135deg,#B87333,#d18a44)",
                  border: "none",
                  boxShadow: "0 8px 24px rgba(184,115,51,0.28)",
                }}>
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: "rgba(0,0,0,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#1a1208",
                  }}>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
                <span style={{ textAlign: "left" }}>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "'Cinzel',serif",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      color: "#1a1208",
                    }}>
                    SELL AN ARTWORK
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "'Raleway',sans-serif",
                      fontSize: 9,
                      color: "rgba(26,18,8,0.65)",
                      marginTop: 1,
                    }}>
                    List for sale or auction
                  </span>
                </span>
              </button>

              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(184,115,51,0.18)",
                  borderRadius: 14,
                  padding: "14px 10px",
                }}>
                <div
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: 8,
                    letterSpacing: "0.18em",
                    color: "rgba(200,191,160,0.3)",
                    marginBottom: 10,
                    paddingLeft: 4,
                  }}>
                  BROWSE
                </div>
                {[
                  { id: "all", name: "All Listings", count: allListings.length },
                  {
                    id: "auction",
                    name: "Live Auctions",
                    count: liveAuctions,
                  },
                  {
                    id: "ending",
                    name: "Ending Soon",
                    count: allListings.filter(
                      (p) => p.isAuction && !p.auctionEnded && p.auctionEndsAt,
                    ).length,
                  },
                  {
                    id: "buy",
                    name: "Buy & Enquire",
                    count: allListings.filter((p) => !p.isAuction).length,
                  },
                ].map((f) => {
                  const on = mktFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setMktFilter(f.id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        padding: "10px 11px",
                        marginBottom: 3,
                        borderRadius: 10,
                        cursor: "pointer",
                        background: on ? "rgba(184,115,51,0.12)" : "transparent",
                        border: `1px solid ${on ? "rgba(184,115,51,0.4)" : "transparent"}`,
                        transition: "all 0.16s",
                      }}
                      onMouseEnter={(e) => {
                        if (!on)
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        if (!on)
                          e.currentTarget.style.background = "transparent";
                      }}>
                      <span
                        style={{
                          fontFamily: "'Raleway',sans-serif",
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          color: on ? "#d9974f" : "#e0d8c8",
                        }}>
                        {f.name}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Raleway',sans-serif",
                          fontSize: 9,
                          fontWeight: 700,
                          color: on ? "#d9974f" : "rgba(200,191,160,0.4)",
                          background: on
                            ? "rgba(184,115,51,0.18)"
                            : "rgba(255,255,255,0.05)",
                          borderRadius: 999,
                          padding: "2px 8px",
                          minWidth: 18,
                          textAlign: "center",
                        }}>
                        {f.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  marginTop: 12,
                  padding: "12px 13px",
                  borderRadius: 12,
                  background: "rgba(212,175,55,0.05)",
                  border: "1px solid rgba(212,175,55,0.12)",
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 10.5,
                  color: "rgba(200,191,160,0.5)",
                  lineHeight: 1.55,
                }}>
                <strong style={{ color: "#D4AF37" }}>How bidding works</strong>
                <br />
                Place a bid above the minimum. When the auction ends, the
                highest bidder wins and arranges payment &amp; delivery privately
                with the seller in chat.
              </div>
            </>
          )}
        </aside>

        {/* ── Feed ── */}
        <main className="comm-feed">
          {/* Marketplace stats banner */}
          {mode === "marketplace" && (
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 18,
                flexWrap: "wrap",
              }}>
              {[
                {
                  label: "Listings",
                  value: allListings.length,
                  color: "#D4AF37",
                },
                {
                  label: "Live Auctions",
                  value: liveAuctions,
                  color: "#4caf7d",
                  live: true,
                },
                {
                  label: "For Sale",
                  value: allListings.filter((p) => !p.isAuction).length,
                  color: "#B87333",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    flex: 1,
                    minWidth: 96,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(212,175,55,0.1)",
                  }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}>
                    {s.live && (
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: s.color,
                          boxShadow: `0 0 7px ${s.color}`,
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 26,
                        fontWeight: 700,
                        color: s.color,
                        lineHeight: 1,
                      }}>
                      {s.value}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'Raleway',sans-serif",
                      fontSize: 9,
                      letterSpacing: "0.08em",
                      color: "rgba(200,191,160,0.4)",
                      marginTop: 5,
                    }}>
                    {s.label.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Feed header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 22,
              gap: 12,
            }}>
            <div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#f0e8d8",
                  margin: 0,
                }}>
                {mode === "marketplace"
                  ? {
                      all: "All Listings",
                      auction: "Live Auctions",
                      ending: "Ending Soon",
                      buy: "Buy & Enquire",
                    }[mktFilter]
                  : activeCommunityData?.name || "All Communities"}
              </h2>
              {mode === "community" &&
                activeCommunity !== "all" &&
                activeCommunityData?.desc && (
                  <p
                    style={{
                      fontFamily: "'Raleway',sans-serif",
                      fontSize: 10,
                      color: "rgba(200,191,160,0.35)",
                      margin: "4px 0 0",
                      letterSpacing: "0.03em",
                    }}>
                    {activeCommunityData.desc}
                  </p>
                )}
              {mode === "marketplace" && (
                <p
                  style={{
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 10,
                    color: "rgba(200,191,160,0.35)",
                    margin: "4px 0 0",
                    letterSpacing: "0.03em",
                  }}>
                  {filteredPosts.length}{" "}
                  {filteredPosts.length === 1 ? "artwork" : "artworks"}{" "}
                  available
                </p>
              )}
            </div>
            <motion.button
              whileHover={{
                scale: 1.04,
                boxShadow:
                  mode === "marketplace"
                    ? "0 8px 24px rgba(184,115,51,0.3)"
                    : "0 8px 24px rgba(212,175,55,0.22)",
              }}
              whileTap={{ scale: 0.97 }}
              onClick={openCreate}
              style={{
                padding: "10px 20px",
                background:
                  mode === "marketplace"
                    ? "linear-gradient(135deg,#B87333,#d18a44)"
                    : "linear-gradient(135deg,#D4AF37,#e8c53a)",
                color: "#0e0c0a",
                border: "none",
                borderRadius: 999,
                fontFamily: "'Cinzel',serif",
                fontSize: 9,
                letterSpacing: "0.18em",
                cursor: "pointer",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {mode === "marketplace" ? "LIST ARTWORK" : "CREATE POST"}
            </motion.button>
          </div>

          {feedLoading ? (
            <div
              className={
                mode === "marketplace" ? "marketplace-grid" : undefined
              }
              style={
                mode === "marketplace"
                  ? undefined
                  : { display: "flex", flexDirection: "column", gap: 16 }
              }>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid rgba(212,175,55,0.12)",
                    borderRadius: 14,
                    padding: 18,
                  }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 14,
                    }}>
                    <Skeleton width={42} height={42} radius={999} />
                    <div style={{ flex: 1, maxWidth: 200 }}>
                      <Skeleton width="60%" height={12} />
                      <Skeleton
                        width="35%"
                        height={10}
                        style={{ marginTop: 8 }}
                      />
                    </div>
                  </div>
                  <SkeletonText lines={2} />
                  <Skeleton
                    height={240}
                    radius={10}
                    style={{ marginTop: 14 }}
                  />
                </div>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div
              className={
                mode === "marketplace" ? "marketplace-grid" : undefined
              }>
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onChat={openChat}
                    onBid={handleBid}
                    onCloseAuction={handleCloseAuction}
                    saved={savedIds.has(post.id)}
                    onToggleSave={handleToggleSave}
                    isOwn={!!user && post.userId === user.id}
                    meId={user?.id}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: "center",
                padding: "70px 20px",
                color: "rgba(200,191,160,0.4)",
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 19,
              }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  margin: "0 auto 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    mode === "marketplace"
                      ? "rgba(184,115,51,0.1)"
                      : "rgba(212,175,55,0.1)",
                  border: `1px solid ${mode === "marketplace" ? "rgba(184,115,51,0.3)" : "rgba(212,175,55,0.25)"}`,
                  color: mode === "marketplace" ? "#B87333" : "#D4AF37",
                }}>
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  {mode === "marketplace" ? (
                    <>
                      <path d="M3 9l1-5h16l1 5" />
                      <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
                      <path d="M9 22V12h6v10" />
                    </>
                  ) : (
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  )}
                </svg>
              </div>
              {mode === "marketplace"
                ? mktFilter === "auction"
                  ? "No live auctions right now."
                  : mktFilter === "ending"
                    ? "Nothing ending soon."
                    : mktFilter === "buy"
                      ? "No items for sale yet."
                      : "No listings yet."
                : "No posts in this community yet."}
              <br />
              <span
                style={{
                  fontSize: 14,
                  color: "rgba(200,191,160,0.3)",
                  fontFamily: "'Raleway',sans-serif",
                }}>
                {mode === "marketplace"
                  ? "Be the first to list an artwork for sale or auction."
                  : "Be the first to share something."}
              </span>
            </motion.div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {showModal && (
          <CreatePostModal
            onClose={() => {
              setShowModal(false);
              setEditingPost(null);
            }}
            onPost={editingPost ? handleEditSave : handlePost}
            editingPost={editingPost}
            forceListing={mode === "marketplace"}
            defaultCommunity={
              mode === "community" && activeCommunity !== "all"
                ? activeCommunity
                : "general"
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatUser && (
          <DirectChat user={chatUser} onClose={() => setChatUser(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
