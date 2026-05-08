import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SAMPLE_POSTS = [
  {
    id: 1,
    author: "Elena Vance",
    avatar: "EV",
    avatarColor: "#8B4513",
    time: "2 hours ago",
    text: "Just finished the underpainting for my latest oil piece — 'Amber Threshold'. The warm ochre ground is doing something magical with the cadmium layers. There's a quality of light I haven't achieved before. Can't sleep. Posting the first look tomorrow morning.",
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=700&q=80",
    likes: 142,
    comments: 18,
    liked: false,
    commentsList: [
      { author: "Daniel Hoffmann", text: "The ochre ground trick is everything. Rembrandt knew it too." },
      { author: "Aria Patel", text: "Can't wait to see the final! Your colour work is extraordinary." },
    ],
  },
  {
    id: 2,
    author: "Daniel Hoffmann",
    avatar: "DH",
    avatarColor: "#2C4A6E",
    time: "5 hours ago",
    text: "I recently acquired a 1.2m bronze figure and I'm genuinely struggling with placement in my apartment. The light by the east window seems too harsh in the morning, and the corner feels like it diminishes the work. Any collectors here with experience placing monumental sculpture in residential spaces?",
    image: null,
    likes: 67,
    comments: 24,
    liked: false,
    commentsList: [
      { author: "Chen Wei", text: "Indirect northern light completely transformed my Brâncuși-influenced piece. Try the north wall if you have one." },
      { author: "Elena Vance", text: "A small focused spotlight from below — it creates extraordinary shadow play without the harshness." },
    ],
  },
  {
    id: 3,
    author: "Chen Wei",
    avatar: "CW",
    avatarColor: "#4A2C6E",
    time: "1 day ago",
    text: "Thrilled to announce my solo exhibition 'Meridian Lines' opens in Florence on May 15th. Three years of work distilled into 22 paintings and 4 sculptures. If you're in Italy — or if this is the reason to go — I would love to see you there. DM for private preview invitations.",
    image: "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=700&q=80",
    likes: 334,
    comments: 41,
    liked: false,
    commentsList: [
      { author: "Aria Patel", text: "Florence! The perfect backdrop for your work. Congratulations, Chen." },
      { author: "Marcus Reyes", text: "Booking flights. This is not a drill." },
    ],
  },
  {
    id: 4,
    author: "Aria Patel",
    avatar: "AP",
    avatarColor: "#2C6E4A",
    time: "1 day ago",
    text: "I've been thinking about the 'post-digital' moment we're in. The most interesting artists I'm seeing right now are those who use digital tools but deliberately reintroduce physical imperfection — grain, handwriting, material texture. It's as if they're mourning something that hasn't quite died yet.",
    image: null,
    likes: 211,
    comments: 52,
    liked: false,
    commentsList: [
      { author: "Elena Vance", text: "The yearning for the haptic is real. I catch myself running my hands over screens sometimes." },
      { author: "Daniel Hoffmann", text: "As a collector, I notice it too. The most sought-after digital pieces have a deliberate 'flaw' language." },
    ],
  },
  {
    id: 5,
    author: "Marcus Reyes",
    avatar: "MR",
    avatarColor: "#6E2C2C",
    time: "2 days ago",
    text: "Six months of making nothing. Not a block — more like waiting for something to clarify. Then this week, three drawings in a row that felt right. I think the silence was necessary. There's something to be said for trusting the fallow period.",
    image: "https://images.unsplash.com/photo-1520420097861-e4959843b682?w=700&q=80",
    likes: 178,
    comments: 29,
    liked: false,
    commentsList: [
      { author: "Aria Patel", text: "The fallow period is where the real work happens. Six months is nothing in the arc of a serious practice." },
    ],
  },
  {
    id: 6,
    author: "Yuki Tanaka",
    avatar: "YT",
    avatarColor: "#2C5A6E",
    time: "3 days ago",
    text: "My Art Coliseum collection now spans 12 works across 4 mediums. What started as a single impulse purchase — a small graphite drawing — has become something I genuinely build my life around. Sharing my full collection for the first time.",
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=700&q=80",
    likes: 89,
    comments: 11,
    liked: false,
    commentsList: [
      { author: "Chen Wei", text: "This is beautiful. A collection with integrity and intention." },
    ],
  },
];


function Avatar({ initials, color, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, border: "1.5px solid rgba(212,175,55,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Cinzel',serif", fontSize: size * 0.28,
      color: "#fff", fontWeight: 700, flexShrink: 0, letterSpacing: "0.05em",
    }}>
      {initials}
    </div>
  );
}

function PostCard({ post, onLike, onDelete, onEdit, onChat }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4 }}
      style={{
        background: "rgba(255,255,255,0.022)",
        border: "1px solid rgba(212,175,55,0.1)",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 18,
        position: "relative",
      }}>

      {/* Header */}
      <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: post.author !== "You" ? "pointer" : "default" }}
          onClick={() => post.author !== "You" && onChat({ name: post.author, avatar: post.avatar, avatarColor: post.avatarColor })}>
          <Avatar initials={post.avatar} color={post.avatarColor} />
          <div>
            <div style={{
              fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 600, color: "#f0e8d8",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => { if (post.author !== "You") e.currentTarget.style.color = "#D4AF37"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#f0e8d8"; }}>
              {post.author}
            </div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.38)", marginTop: 1 }}>
              {post.time}
            </div>
          </div>
        </div>

        {/* Three-dot menu — only on own posts */}
        <div style={{ position: "relative", visibility: post.author === "You" ? "visible" : "hidden", pointerEvents: post.author === "You" ? "auto" : "none" }}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(200,191,160,0.4)", padding: "4px 8px", borderRadius: 6,
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#D4AF37"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(200,191,160,0.4)"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute", right: 0, top: "calc(100% + 6px)",
                  background: "#1a1712", border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: 10, overflow: "hidden", zIndex: 10, minWidth: 130,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}>
                <button
                  onClick={() => { setMenuOpen(false); onEdit(post); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "11px 16px", background: "none", border: "none",
                    cursor: "pointer", color: "rgba(200,191,160,0.7)",
                    fontFamily: "'Raleway',sans-serif", fontSize: 12, transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,175,55,0.08)"; e.currentTarget.style.color = "#D4AF37"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "rgba(200,191,160,0.7)"; }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Post
                </button>
                <div style={{ height: 1, background: "rgba(212,175,55,0.08)", margin: "0 10px" }} />
                <button
                  onClick={() => { setMenuOpen(false); onDelete(post.id); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, width: "100%",
                    padding: "11px 16px", background: "none", border: "none",
                    cursor: "pointer", color: "rgba(220,80,80,0.7)",
                    fontFamily: "'Raleway',sans-serif", fontSize: 12, transition: "all 0.15s",
                  }}
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

      {/* Text */}
      <div style={{ padding: "14px 20px" }}>
        <p style={{
          fontFamily: "'Cormorant Garamond',serif", fontSize: 17,
          color: "rgba(200,191,160,0.82)", lineHeight: 1.8, margin: 0,
        }}>
          {post.text}
        </p>
      </div>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div style={{ margin: "0 20px 14px" }}>
          {post.images.length === 1 ? (
            <div style={{ borderRadius: 10, overflow: "hidden", maxHeight: 320 }}>
              <img src={post.images[0]} alt="" style={{ width: "100%", objectFit: "cover", display: "block" }} />
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: post.images.length === 2 ? "1fr 1fr" : post.images.length === 3 ? "1fr 1fr 1fr" : "1fr 1fr",
              gap: 4, borderRadius: 10, overflow: "hidden",
            }}>
              {post.images.map((src, i) => (
                <div key={i} style={{ aspectRatio: "1", overflow: "hidden" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Legacy single image support */}
      {!post.images && post.image && (
        <div style={{ margin: "0 20px 14px", borderRadius: 10, overflow: "hidden", maxHeight: 300 }}>
          <img src={post.image} alt="" style={{ width: "100%", objectFit: "cover", display: "block" }} />
        </div>
      )}

      {/* Actions */}
      <div style={{
        padding: "10px 14px",
        borderTop: "1px solid rgba(212,175,55,0.07)",
        display: "flex", gap: 2,
      }}>
        {/* Like */}
        <button
          onClick={() => onLike(post.id)}
          style={{
            display: "flex", alignItems: "center", gap: 6, background: "none",
            border: "none", cursor: "pointer", fontFamily: "'Raleway',sans-serif",
            fontSize: 12, color: post.liked ? "#D4AF37" : "rgba(200,191,160,0.45)",
            padding: "6px 12px", borderRadius: 999, transition: "all 0.2s",
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={post.liked ? "#D4AF37" : "none"}
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {post.likes}
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 6, background: "none",
            border: "none", cursor: "pointer", fontFamily: "'Raleway',sans-serif",
            fontSize: 12, color: "rgba(200,191,160,0.45)",
            padding: "6px 12px", borderRadius: 999, transition: "all 0.2s",
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {post.comments}
        </button>
      </div>

      {/* Comments panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28 }}
            style={{ overflow: "hidden", borderTop: "1px solid rgba(212,175,55,0.07)" }}>
            <div style={{ padding: "14px 20px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              {post.commentsList.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Cinzel',serif", fontSize: 8, color: "#D4AF37", flexShrink: 0,
                  }}>
                    {c.author.split(" ").map(s => s[0]).join("")}
                  </div>
                  <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.08)",
                    borderRadius: 9, padding: "9px 13px", flex: 1,
                  }}>
                    <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "#D4AF37", marginBottom: 3 }}>
                      {c.author}
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "rgba(200,191,160,0.78)", lineHeight: 1.6 }}>
                      {c.text}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Add a comment…"
                  style={{
                    flex: 1, background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(212,175,55,0.15)", borderRadius: 999,
                    padding: "8px 14px", color: "#e8e0d0",
                    fontFamily: "'Raleway',sans-serif", fontSize: 12, outline: "none",
                  }}
                />
                <button style={{
                  padding: "8px 18px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                  color: "#0e0c0a", border: "none", borderRadius: 999,
                  fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.14em", cursor: "pointer",
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

function CreatePostModal({ onClose, onPost, editingPost }) {
  const [text, setText] = useState(editingPost?.text || "");
  const [images, setImages] = useState(editingPost?.images || []);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setImages(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (i) => setImages(prev => prev.filter((_, idx) => idx !== i));

  const canPost = text.trim() || images.length > 0;

  const handlePost = () => {
    if (!canPost) return;
    onPost({ text, images });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.75)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "#11100d", border: "1px solid rgba(212,175,55,0.22)",
          borderRadius: 18, padding: "28px 32px", width: "100%", maxWidth: 580,
          maxHeight: "90vh", overflowY: "auto",
        }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>
            {editingPost ? "Edit Post" : "Share with the Community"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(200,191,160,0.45)", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {/* Text */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          placeholder="Share a thought, a process, a question — anything that connects to the world of art…"
          style={{
            width: "100%", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,175,55,0.18)", borderRadius: 10,
            padding: "13px 15px", color: "#e8e0d0",
            fontFamily: "'Cormorant Garamond',serif", fontSize: 16,
            lineHeight: 1.7, resize: "none", outline: "none", boxSizing: "border-box",
          }}
        />

        {/* Image previews */}
        {images.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: images.length === 1 ? "1fr" : images.length === 3 ? "1fr 1fr 1fr" : "1fr 1fr",
            gap: 6, marginTop: 12, borderRadius: 10, overflow: "hidden",
          }}>
            {images.map((src, i) => (
              <div key={i} style={{ position: "relative", aspectRatio: "1", overflow: "hidden", borderRadius: 8 }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <button
                  onClick={() => removeImage(i)}
                  style={{
                    position: "absolute", top: 6, right: 6,
                    width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(0,0,0,0.65)", border: "none",
                    color: "#fff", fontSize: 14, lineHeight: 1,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
          {/* Add images button */}
          <label style={{
            display: "flex", alignItems: "center", gap: 7,
            cursor: "pointer", color: "rgba(200,191,160,0.5)",
            fontFamily: "'Raleway',sans-serif", fontSize: 12,
            padding: "8px 14px", borderRadius: 999,
            border: "1px solid rgba(212,175,55,0.15)",
            background: "rgba(255,255,255,0.03)",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "#D4AF37"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(200,191,160,0.5)"; e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            {images.length > 0 ? `${images.length} image${images.length > 1 ? "s" : ""} added` : "Add Images"}
            <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: "none" }} />
          </label>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{
              padding: "10px 20px", background: "transparent",
              color: "rgba(200,191,160,0.55)", border: "1px solid rgba(212,175,55,0.18)",
              borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 9,
              letterSpacing: "0.14em", cursor: "pointer",
            }}>CANCEL</button>
            <button onClick={handlePost} style={{
              padding: "10px 26px",
              background: canPost ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "rgba(212,175,55,0.15)",
              color: canPost ? "#0e0c0a" : "rgba(200,191,160,0.3)",
              border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif",
              fontSize: 9, letterSpacing: "0.14em", cursor: canPost ? "pointer" : "not-allowed",
            }}>{editingPost ? "SAVE" : "POST"}</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DirectChat({ user, onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, from: "them", text: `Hi! Thanks for reaching out.`, time: "Just now" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { id: Date.now(), from: "me", text: trimmed, time: "Just now" }]);
    setInput("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}>
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      onClick={e => e.stopPropagation()}
      style={{
        width: "100%", maxWidth: 420, background: "#12100d",
        border: "1px solid rgba(212,175,55,0.22)", borderRadius: 18,
        boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 16px", borderBottom: "1px solid rgba(212,175,55,0.1)",
        background: "rgba(255,255,255,0.03)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar initials={user.avatar} color={user.avatarColor} size={34} />
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 600, color: "#f0e8d8" }}>
              {user.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4caf7d" }} />
              <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(200,191,160,0.4)" }}>Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(200,191,160,0.4)", fontSize: 20, lineHeight: 1, transition: "color 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#D4AF37"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(200,191,160,0.4)"}>
          ×
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px", maxHeight: 300, display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "78%", padding: "9px 13px", borderRadius: msg.from === "me" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background: msg.from === "me" ? "linear-gradient(135deg,#D4AF37,#c9a52e)" : "rgba(255,255,255,0.06)",
              border: msg.from === "me" ? "none" : "1px solid rgba(212,175,55,0.12)",
              color: msg.from === "me" ? "#0e0c0a" : "rgba(200,191,160,0.85)",
              fontFamily: "'Cormorant Garamond',serif", fontSize: 15, lineHeight: 1.5,
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: "flex", gap: 8, padding: "10px 12px",
        borderTop: "1px solid rgba(212,175,55,0.1)", background: "rgba(0,0,0,0.2)",
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type a message…"
          style={{
            flex: 1, background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(212,175,55,0.15)", borderRadius: 999,
            padding: "8px 14px", color: "#e8e0d0",
            fontFamily: "'Raleway',sans-serif", fontSize: 12, outline: "none",
          }}
        />
        <button onClick={send} style={{
          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
          background: input.trim() ? "linear-gradient(135deg,#D4AF37,#c9a52e)" : "rgba(212,175,55,0.15)",
          border: "none", cursor: input.trim() ? "pointer" : "default",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={input.trim() ? "#0e0c0a" : "rgba(212,175,55,0.4)"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </motion.div>
    </motion.div>
  );
}

export default function Community() {
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [chatUser, setChatUser] = useState(null);

  const handleLike = (id) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handlePost = ({ text, images }) => {
    const newPost = {
      id: Date.now(),
      author: "You",
      avatar: "YO",
      avatarColor: "#4A3728",
      time: "Just now",
      text,
      images: images.length > 0 ? images : undefined,
      likes: 0,
      comments: 0,
      liked: false,
      commentsList: [],
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const handleDelete = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setShowModal(true);
  };

  const handleEditSave = ({ text, images }) => {
    setPosts(prev => prev.map(p =>
      p.id === editingPost.id
        ? { ...p, text, images: images.length > 0 ? images : p.images }
        : p
    ));
    setEditingPost(null);
  };

  return (
    <div style={{ background: "#080808", minHeight: "100vh" }}>

      {/* Hero */}
      <div className="community-hero" style={{
        background: "linear-gradient(180deg, #0e0c0a 0%, #080808 100%)",
        borderBottom: "1px solid rgba(212,175,55,0.1)",
        padding: "140px 48px 60px",
        textAlign: "center",
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
          <p style={{
            fontFamily: "'Raleway',sans-serif", fontSize: 15,
            color: "rgba(200,191,160,0.55)", maxWidth: 520,
            margin: "14px auto 0", lineHeight: 1.75,
          }}>
            A gathering place for artists, collectors, and curators — where great works and great conversations begin.
          </p>
        </motion.div>
      </div>

      {/* Body */}
      <div className="community-body" style={{ maxWidth: 760, margin: "0 auto", padding: "44px 48px 100px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 8px 24px rgba(212,175,55,0.22)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            style={{
              padding: "10px 22px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
              color: "#0e0c0a", border: "none", borderRadius: 999,
              fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em",
              cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
            }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            CREATE POST
          </motion.button>
        </div>

        <AnimatePresence mode="popLayout">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onLike={handleLike} onDelete={handleDelete} onEdit={handleEdit} onChat={setChatUser} />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
          <CreatePostModal
            onClose={() => { setShowModal(false); setEditingPost(null); }}
            onPost={editingPost ? handleEditSave : handlePost}
            editingPost={editingPost}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatUser && <DirectChat user={chatUser} onClose={() => setChatUser(null)} />}
      </AnimatePresence>
    </div>
  );
}
