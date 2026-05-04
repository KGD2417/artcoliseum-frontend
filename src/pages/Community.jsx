import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Data ─────────────────────────────────────────── */
const SAMPLE_POSTS = [
  {
    id: 1,
    author: "Elena Vance",
    role: "Artist",
    avatar: "EV",
    avatarColor: "#8B4513",
    time: "2 hours ago",
    category: "Artists",
    text: "Just finished the underpainting for my latest oil piece — 'Amber Threshold'. The warm ochre ground is doing something magical with the cadmium layers. There's a quality of light I haven't achieved before. Can't sleep. Posting the first look tomorrow morning.",
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=700&q=80",
    likes: 142,
    comments: 18,
    shares: 7,
    liked: false,
    commentsList: [
      { author: "Daniel Hoffmann", text: "The ochre ground trick is everything. Rembrandt knew it too." },
      { author: "Aria Patel", text: "Can't wait to see the final! Your colour work is extraordinary." },
    ],
  },
  {
    id: 2,
    author: "Daniel Hoffmann",
    role: "Collector",
    avatar: "DH",
    avatarColor: "#2C4A6E",
    time: "5 hours ago",
    category: "All Posts",
    text: "I recently acquired a 1.2m bronze figure and I'm genuinely struggling with placement in my apartment. The light by the east window seems too harsh in the morning, and the corner feels like it diminishes the work. Any collectors here with experience placing monumental sculpture in residential spaces? Deeply grateful for any guidance.",
    image: null,
    likes: 67,
    comments: 24,
    shares: 3,
    liked: false,
    commentsList: [
      { author: "Chen Wei", text: "I had the same challenge. Indirect northern light completely transformed my Brâncuși-influenced piece. Try the north wall if you have one." },
      { author: "Elena Vance", text: "I'd suggest a small focused spotlight from below — it creates extraordinary shadow play without the harshness." },
    ],
  },
  {
    id: 3,
    author: "Chen Wei",
    role: "Artist",
    avatar: "CW",
    avatarColor: "#4A2C6E",
    time: "1 day ago",
    category: "Events",
    text: "Thrilled to announce my solo exhibition 'Meridian Lines' opens in Florence on May 15th. Three years of work distilled into 22 paintings and 4 sculptures. If you're in Italy — or if this is the reason to go — I would love to see you there. DM for private preview invitations.",
    image: "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=700&q=80",
    likes: 334,
    comments: 41,
    shares: 58,
    liked: false,
    commentsList: [
      { author: "Aria Patel", text: "Florence! The perfect backdrop for your work. Congratulations, Chen." },
      { author: "Marcus Reyes", text: "Booking flights. This is not a drill." },
    ],
  },
  {
    id: 4,
    author: "Aria Patel",
    role: "Curator",
    avatar: "AP",
    avatarColor: "#2C6E4A",
    time: "1 day ago",
    category: "Collections",
    text: "I've been thinking about the 'post-digital' moment we're in. The most interesting artists I'm seeing right now are those who use digital tools but deliberately reintroduce physical imperfection — grain, handwriting, material texture. It's as if they're mourning something that hasn't quite died yet. What's everyone's take?",
    image: null,
    likes: 211,
    comments: 52,
    shares: 23,
    liked: false,
    commentsList: [
      { author: "Elena Vance", text: "The yearning for the haptic is real. I catch myself running my hands over screens sometimes. It's an uncanny age." },
      { author: "Daniel Hoffmann", text: "As a collector, I notice it too. The most sought-after digital pieces have a deliberate 'flaw' language." },
    ],
  },
  {
    id: 5,
    author: "Marcus Reyes",
    role: "Artist",
    avatar: "MR",
    avatarColor: "#6E2C2C",
    time: "2 days ago",
    category: "Artists",
    text: "Six months of making nothing. Not a block — more like waiting for something to clarify. Then this week, three drawings in a row that felt right. I think the silence was necessary. There's something to be said for trusting the fallow period.",
    image: "https://images.unsplash.com/photo-1520420097861-e4959843b682?w=700&q=80",
    likes: 178,
    comments: 29,
    shares: 14,
    liked: false,
    commentsList: [
      { author: "Aria Patel", text: "The fallow period is where the real work happens. Six months is nothing in the arc of a serious practice." },
    ],
  },
  {
    id: 6,
    author: "Yuki Tanaka",
    role: "Collector",
    avatar: "YT",
    avatarColor: "#2C5A6E",
    time: "3 days ago",
    category: "Collections",
    text: "My Art Coliseum collection now spans 12 works across 4 mediums. What started as a single impulse purchase — a small graphite drawing — has become something I genuinely build my life around. The framing consultation service was exceptional. Sharing my full collection for the first time.",
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=700&q=80",
    likes: 89,
    comments: 11,
    shares: 5,
    liked: false,
    commentsList: [
      { author: "Chen Wei", text: "This is beautiful. A collection with integrity and intention." },
    ],
  },
  {
    id: 7,
    author: "Sophia Brennan",
    role: "Artist",
    avatar: "SB",
    avatarColor: "#6E4A2C",
    time: "4 days ago",
    category: "Artists",
    text: "Experimenting with cyanotype this month — the sun does the work and the results are haunting. There's something deeply poetic about a photographic process that requires actual sunlight. My studio smells of chemistry and old libraries. Absolutely obsessed.",
    image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=700&q=80",
    likes: 124,
    comments: 16,
    shares: 9,
    liked: false,
    commentsList: [
      { author: "Marcus Reyes", text: "The smell of chemistry in a studio is one of the great underrated pleasures." },
    ],
  },
  {
    id: 8,
    author: "Aria Patel",
    role: "Curator",
    avatar: "AP",
    avatarColor: "#2C6E4A",
    time: "5 days ago",
    category: "Events",
    text: "Our panel 'The Value of Uncertainty in Art Markets' is confirmed for the Art Coliseum Summer Forum, July 12th. I'll be in conversation with three artists and two collectors about what drives intrinsic versus speculative value. Tickets available through the events page. It promises to be a spirited afternoon.",
    image: null,
    likes: 156,
    comments: 22,
    shares: 31,
    liked: false,
    commentsList: [
      { author: "Daniel Hoffmann", text: "Registered. This is the conversation the art world is having behind closed doors — glad it's finally in the open." },
    ],
  },
];

const FEATURED_ARTISTS = [
  { name: "Elena Vance", specialty: "Oil & Mixed Media", avatar: "EV", avatarColor: "#8B4513", followers: "2.4k" },
  { name: "Chen Wei", specialty: "Sculpture & Painting", avatar: "CW", avatarColor: "#4A2C6E", followers: "1.8k" },
  { name: "Marcus Reyes", specialty: "Drawing & Charcoal", avatar: "MR", avatarColor: "#6E2C2C", followers: "1.1k" },
  { name: "Sophia Brennan", specialty: "Photography & Print", avatar: "SB", avatarColor: "#6E4A2C", followers: "940" },
];

const UPCOMING_EVENTS = [
  { name: "Meridian Lines — Solo Exhibition", date: "May 15, 2026", location: "Florence, Italy" },
  { name: "Art Coliseum Summer Forum", date: "July 12, 2026", location: "London, UK" },
  { name: "Digital Frontiers Opening Night", date: "July 1, 2026", location: "Berlin, Germany" },
];

const TABS = ["All Posts", "Artists", "Events", "Collections"];

/* ─── Sub-components ────────────────────────────────── */
function Avatar({ initials, color, size = 42 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color,
      border: "1.5px solid rgba(212,175,55,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cinzel',serif", fontSize: size * 0.28,
      color: "#fff", fontWeight: 700, flexShrink: 0,
      letterSpacing: "0.05em",
    }}>
      {initials}
    </div>
  );
}

function RoleBadge({ role }) {
  const colors = {
    Artist: { bg: "rgba(139,69,19,0.18)", border: "rgba(139,69,19,0.4)", text: "#c8956a" },
    Collector: { bg: "rgba(44,74,110,0.18)", border: "rgba(44,74,110,0.4)", text: "#6fa0c8" },
    Curator: { bg: "rgba(44,110,74,0.18)", border: "rgba(44,110,74,0.4)", text: "#6fc8a0" },
  };
  const c = colors[role] || colors.Collector;
  return (
    <span style={{
      fontFamily: "'Cinzel',serif", fontSize: 8,
      letterSpacing: "0.14em", padding: "3px 10px",
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 999, color: c.text,
    }}>
      {role.toUpperCase()}
    </span>
  );
}

function ActionBtn({ icon, count, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6,
      background: "none", border: "none", cursor: "pointer",
      fontFamily: "'Raleway',sans-serif", fontSize: 12,
      color: active ? "#D4AF37" : "rgba(200,191,160,0.5)",
      padding: "6px 10px", borderRadius: 999,
      transition: "all 0.2s",
    }}>
      {icon}
      <span>{count}</span>
    </button>
  );
}

function PostCard({ post, onLike }) {
  const [showComments, setShowComments] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.45 }}
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(212,175,55,0.12)",
        borderRadius: 16, overflow: "hidden",
        marginBottom: 20,
      }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar initials={post.avatar} color={post.avatarColor} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontFamily: "'Cormorant Garamond',serif", fontSize: 17,
                fontWeight: 600, color: "#fff",
              }}>{post.author}</span>
              <RoleBadge role={post.role} />
            </div>
            <div style={{
              fontFamily: "'Raleway',sans-serif", fontSize: 11,
              color: "rgba(200,191,160,0.4)", marginTop: 2,
            }}>{post.time}</div>
          </div>
        </div>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(200,191,160,0.4)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 24px" }}>
        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 17,
          color: "rgba(200,191,160,0.85)", lineHeight: 1.8,
        }}>
          {post.text}
        </p>
      </div>

      {/* Image */}
      {post.image && (
        <div style={{ margin: "0 24px 16px", borderRadius: 10, overflow: "hidden", maxHeight: 320 }}>
          <img src={post.image} alt="Post" style={{ width: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}

      {/* Actions */}
      <div style={{
        padding: "12px 24px",
        borderTop: "1px solid rgba(212,175,55,0.08)",
        display: "flex", alignItems: "center", gap: 4,
      }}>
        <ActionBtn
          active={post.liked}
          onClick={() => onLike(post.id)}
          count={post.likes}
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill={post.liked ? "#D4AF37" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          }
        />
        <ActionBtn
          count={post.comments}
          onClick={() => setShowComments(v => !v)}
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
        <ActionBtn
          count={post.shares}
          onClick={() => {}}
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          }
        />
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              padding: "0 24px 20px",
              borderTop: "1px solid rgba(212,175,55,0.08)",
              overflow: "hidden",
            }}>
            <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {post.commentsList.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "rgba(212,175,55,0.15)",
                    border: "1px solid rgba(212,175,55,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Cinzel',serif", fontSize: 9, color: "#D4AF37",
                    flexShrink: 0,
                  }}>
                    {c.author.split(" ").map(s => s[0]).join("")}
                  </div>
                  <div style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(212,175,55,0.1)",
                    borderRadius: 10, padding: "10px 14px", flex: 1,
                  }}>
                    <div style={{
                      fontFamily: "'Raleway',sans-serif", fontSize: 11,
                      color: "#D4AF37", marginBottom: 4,
                    }}>{c.author}</div>
                    <div style={{
                      fontFamily: "'Cormorant Garamond',serif", fontSize: 15,
                      color: "rgba(200,191,160,0.8)", lineHeight: 1.6,
                    }}>{c.text}</div>
                  </div>
                </div>
              ))}
              {/* Comment input */}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <input
                  placeholder="Add a comment…"
                  style={{
                    flex: 1, background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(212,175,55,0.18)",
                    borderRadius: 999, padding: "9px 16px",
                    color: "#e8e0d0", fontFamily: "'Raleway',sans-serif",
                    fontSize: 13, outline: "none",
                  }}
                />
                <button style={{
                  padding: "9px 20px",
                  background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                  color: "#0e0c0a", border: "none",
                  borderRadius: 999,
                  fontFamily: "'Cinzel',serif", fontSize: 9,
                  letterSpacing: "0.14em", cursor: "pointer",
                }}>REPLY</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Create Post Modal ─────────────────────────────── */
function CreatePostModal({ onClose }) {
  const [text, setText] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.75)", display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "#12100d",
          border: "1px solid rgba(212,175,55,0.25)",
          borderRadius: 20, padding: "36px 40px",
          width: "100%", maxWidth: 580,
        }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond',serif", fontSize: 26,
            fontWeight: 700, color: "#fff",
          }}>Share with the Community</h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(200,191,160,0.5)", fontSize: 22, lineHeight: 1,
          }}>×</button>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          placeholder="Share a thought, a process, a question — anything that connects to the world of art…"
          style={{
            width: "100%", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: 10, padding: "14px 16px",
            color: "#e8e0d0", fontFamily: "'Cormorant Garamond',serif",
            fontSize: 16, lineHeight: 1.7, resize: "vertical", outline: "none",
          }}
        />
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginTop: 20,
        }}>
          <span style={{
            fontFamily: "'Raleway',sans-serif", fontSize: 11,
            color: "rgba(200,191,160,0.35)",
          }}>{text.length} characters</span>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{
              padding: "11px 24px", background: "transparent",
              color: "rgba(200,191,160,0.6)",
              border: "1px solid rgba(212,175,55,0.2)", borderRadius: 999,
              fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em",
              cursor: "pointer",
            }}>CANCEL</button>
            <button onClick={onClose} style={{
              padding: "11px 28px",
              background: text.trim() ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "rgba(212,175,55,0.2)",
              color: text.trim() ? "#0e0c0a" : "rgba(200,191,160,0.4)",
              border: "none", borderRadius: 999,
              fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em",
              cursor: text.trim() ? "pointer" : "not-allowed",
            }}>POST</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main ──────────────────────────────────────────── */
export default function Community() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Posts");
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [showModal, setShowModal] = useState(false);
  const [following, setFollowing] = useState({});

  const handleLike = (id) => {
    setPosts(prev => prev.map(p =>
      p.id === id
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  };

  const filtered = posts.filter(p =>
    activeTab === "All Posts" ? true : p.category === activeTab
  );

  return (
    <div style={{ background: "#080808", minHeight: "100vh" }}>
      {/* HERO */}
      <div style={{
        background: "linear-gradient(180deg, #0e0c0a 0%, #080808 100%)",
        borderBottom: "1px solid rgba(212,175,55,0.12)",
        padding: "100px 48px 60px",
        textAlign: "center",
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}>
          <div className="gold-rule" style={{ justifyContent: "center" }}>
            <div className="grl" style={{ background: "linear-gradient(90deg, transparent, #D4AF37)" }} />
            <span className="grt">Connecting Collectors & Artists</span>
            <div className="grl" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
          </div>
          <h1 className="section-heading">
            <span className="bold-white">Art Coliseum</span> <em>Community</em>
          </h1>
          <p style={{
            fontFamily: "'Raleway',sans-serif", fontSize: 15,
            color: "rgba(200,191,160,0.6)", maxWidth: 560, margin: "16px auto 0", lineHeight: 1.7,
          }}>
            A gathering place for artists, collectors, and curators — where great works and
            great conversations begin.
          </p>
        </motion.div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 48px 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 40 }}>

          {/* ── MAIN FEED ── */}
          <div>
            {/* Filter tabs + Create Post */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 28, flexWrap: "wrap", gap: 16,
            }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "9px 18px",
                      background: activeTab === tab ? "rgba(212,175,55,0.12)" : "transparent",
                      color: activeTab === tab ? "#D4AF37" : "rgba(200,191,160,0.5)",
                      border: `1px solid ${activeTab === tab ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.12)"}`,
                      borderRadius: 999,
                      fontFamily: "'Cinzel',serif", fontSize: 9,
                      letterSpacing: "0.16em", cursor: "pointer",
                      transition: "all 0.2s",
                    }}>
                    {tab.toUpperCase()}
                  </button>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(212,175,55,0.25)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowModal(true)}
                style={{
                  padding: "10px 22px",
                  background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                  color: "#0e0c0a", border: "none",
                  borderRadius: 999,
                  fontFamily: "'Cinzel',serif", fontSize: 9,
                  letterSpacing: "0.18em", cursor: "pointer", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                CREATE POST
              </motion.button>
            </div>

            {/* Posts */}
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    textAlign: "center", padding: "60px 0",
                    color: "rgba(200,191,160,0.35)",
                    fontFamily: "'Raleway',sans-serif", fontSize: 14,
                  }}>
                  No posts in this category yet.
                </motion.div>
              ) : (
                filtered.map(post => (
                  <PostCard key={post.id} post={post} onLike={handleLike} />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div>
            {/* Featured Artists */}
            <div style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(212,175,55,0.12)",
              borderRadius: 16, padding: "24px",
              marginBottom: 24,
            }}>
              <div style={{
                fontFamily: "'Cinzel',serif", fontSize: 10,
                letterSpacing: "0.2em", color: "#D4AF37",
                marginBottom: 20,
              }}>FEATURED ARTISTS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {FEATURED_ARTISTS.map(a => (
                  <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar initials={a.avatar} color={a.avatarColor} size={38} />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "'Cormorant Garamond',serif", fontSize: 16,
                        color: "#fff", lineHeight: 1.2,
                      }}>{a.name}</div>
                      <div style={{
                        fontFamily: "'Raleway',sans-serif", fontSize: 11,
                        color: "rgba(200,191,160,0.45)",
                      }}>{a.specialty}</div>
                    </div>
                    <button
                      onClick={() => setFollowing(p => ({ ...p, [a.name]: !p[a.name] }))}
                      style={{
                        padding: "6px 14px",
                        background: following[a.name] ? "rgba(212,175,55,0.1)" : "transparent",
                        color: following[a.name] ? "#D4AF37" : "rgba(200,191,160,0.6)",
                        border: `1px solid ${following[a.name] ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.2)"}`,
                        borderRadius: 999,
                        fontFamily: "'Cinzel',serif", fontSize: 8,
                        letterSpacing: "0.14em", cursor: "pointer",
                        transition: "all 0.2s",
                      }}>
                      {following[a.name] ? "FOLLOWING" : "FOLLOW"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(212,175,55,0.12)",
              borderRadius: 16, padding: "24px",
              marginBottom: 24,
            }}>
              <div style={{
                fontFamily: "'Cinzel',serif", fontSize: 10,
                letterSpacing: "0.2em", color: "#D4AF37",
                marginBottom: 20,
              }}>UPCOMING EVENTS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {UPCOMING_EVENTS.map((ev, i) => (
                  <div key={i} style={{
                    paddingBottom: i < UPCOMING_EVENTS.length - 1 ? 16 : 0,
                    borderBottom: i < UPCOMING_EVENTS.length - 1 ? "1px solid rgba(212,175,55,0.08)" : "none",
                  }}>
                    <div style={{
                      fontFamily: "'Cormorant Garamond',serif", fontSize: 15,
                      color: "#fff", marginBottom: 4, lineHeight: 1.3,
                    }}>{ev.name}</div>
                    <div style={{
                      fontFamily: "'Raleway',sans-serif", fontSize: 11,
                      color: "#D4AF37", marginBottom: 2,
                    }}>{ev.date}</div>
                    <div style={{
                      fontFamily: "'Raleway',sans-serif", fontSize: 11,
                      color: "rgba(200,191,160,0.4)",
                    }}>{ev.location}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/events")}
                style={{
                  marginTop: 20, width: "100%", padding: "10px",
                  background: "transparent",
                  color: "rgba(200,191,160,0.5)",
                  border: "1px solid rgba(212,175,55,0.15)",
                  borderRadius: 999,
                  fontFamily: "'Cinzel',serif", fontSize: 9,
                  letterSpacing: "0.16em", cursor: "pointer",
                }}>
                VIEW ALL EVENTS
              </button>
            </div>

            {/* Who to Follow */}
            <div style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(212,175,55,0.12)",
              borderRadius: 16, padding: "24px",
            }}>
              <div style={{
                fontFamily: "'Cinzel',serif", fontSize: 10,
                letterSpacing: "0.2em", color: "#D4AF37",
                marginBottom: 20,
              }}>WHO TO FOLLOW</div>
              {[
                { name: "Aria Patel", role: "Curator", avatar: "AP", avatarColor: "#2C6E4A" },
                { name: "Daniel Hoffmann", role: "Collector", avatar: "DH", avatarColor: "#2C4A6E" },
                { name: "Yuki Tanaka", role: "Collector", avatar: "YT", avatarColor: "#2C5A6E" },
              ].map(p => (
                <div key={p.name} style={{
                  display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
                }}>
                  <Avatar initials={p.avatar} color={p.avatarColor} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "#fff",
                    }}>{p.name}</div>
                    <div style={{
                      fontFamily: "'Raleway',sans-serif", fontSize: 10,
                      color: "rgba(200,191,160,0.4)",
                    }}>{p.role}</div>
                  </div>
                  <button
                    onClick={() => setFollowing(f => ({ ...f, [p.name]: !f[p.name] }))}
                    style={{
                      padding: "5px 12px",
                      background: "transparent",
                      color: "rgba(200,191,160,0.55)",
                      border: "1px solid rgba(212,175,55,0.18)",
                      borderRadius: 999,
                      fontFamily: "'Cinzel',serif", fontSize: 8,
                      letterSpacing: "0.12em", cursor: "pointer",
                    }}>
                    {following[p.name] ? "✓" : "+"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && <CreatePostModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
