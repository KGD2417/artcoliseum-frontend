import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";
import { useLocale, LANGS } from "../context/Locale";
import { CheckIcon, SearchIcon, MessageIcon } from "./Icons";
import i1 from "../assets/i1.png";
import i3 from "../assets/i3.png";
import i4 from "../assets/i4.png";
import i5 from "../assets/i5.png";
import i6 from "../assets/i6.png";

const LINKS = [
  { label: "HOME", to: "/" },
  { label: "ARTISTS", to: "/artists" },
  { label: "COLLECTION", to: "/categories" },
  { label: "COMMUNITY", to: "/community" },
  { label: "EVENTS", to: "/events" },
  { label: "CHAT", to: "/chat" },
  { label: "AR VIEWER", to: "/ar" },
];

const ALL_LINKS = [
  ...LINKS,
  { label: "GALLERY", to: "/gallery" },
  { label: "ESTIMATE", to: "/estimate" },
  { label: "CONTACT", to: "/contact" },
  { label: "HELP DESK", to: "/help" },
];

/* ── universal search index ── */
const SEARCH_INDEX = [
  {
    type: "ARTWORK",
    title: "Solstice in Obsidian",
    sub: "Julian Voss",
    to: "/product/default",
    img: i4,
  },
  {
    type: "ARTWORK",
    title: "Echoes of Silence",
    sub: "Elara Vance",
    to: "/product/default",
    img: i1,
  },
  {
    type: "ARTWORK",
    title: "Fragmented Memory",
    sub: "Soren Klein",
    to: "/product/default",
    img: i6,
  },
  {
    type: "ARTWORK",
    title: "Architectural Echo",
    sub: "Elena Vance",
    to: "/product/default",
    img: i3,
  },
  {
    type: "ARTWORK",
    title: "Cosmic Flow",
    sub: "Hideo Tanaka",
    to: "/product/default",
    img: i6,
  },
  {
    type: "ARTWORK",
    title: "Whispers of Silence",
    sub: "Lena Bach",
    to: "/product/default",
    img: i5,
  },
  {
    type: "ARTWORK",
    title: "The Golden Tree",
    sub: "Chen Wei",
    to: "/product/default",
    img: i4,
  },
  {
    type: "ARTIST",
    title: "Elena Vance",
    sub: "Florence, Italy",
    to: "/artists/elena-vance",
  },
  {
    type: "ARTIST",
    title: "Elena Rossi",
    sub: "Milan, Italy",
    to: "/artists/elena-rossi",
  },
  {
    type: "ARTIST",
    title: "Hideo Tanaka",
    sub: "Kyoto, Japan",
    to: "/artists/hideo-tanaka",
  },
  {
    type: "ARTIST",
    title: "Aria Voss",
    sub: "Berlin, Germany",
    to: "/artists/aria-voss",
  },
  {
    type: "ARTIST",
    title: "Chen Wei",
    sub: "Shanghai, China",
    to: "/artists/chen-wei",
  },
  {
    type: "ARTIST",
    title: "Lena Bach",
    sub: "Zurich, Switzerland",
    to: "/artists/lena-bach",
  },
  {
    type: "MEDIUM",
    title: "Paintings",
    sub: "Oil, Acrylic & Watercolor",
    to: "/categories/paintings",
  },
  {
    type: "MEDIUM",
    title: "Sculptures",
    sub: "Bronze, Marble & Mixed",
    to: "/categories/sculptures",
  },
  {
    type: "MEDIUM",
    title: "Photography",
    sub: "Fine Art & Documentary",
    to: "/categories/photography",
  },
  {
    type: "MEDIUM",
    title: "Digital",
    sub: "NFT & Generative Canvas",
    to: "/categories/digital",
  },
  {
    type: "PAGE",
    title: "Become an Artist",
    sub: "Artist portal",
    to: "/become-artist",
  },
  { type: "PAGE", title: "AR Viewer", sub: "Try art in your space", to: "/ar" },
  { type: "PAGE", title: "Cart", sub: "Your acquisitions", to: "/cart" },
  { type: "PAGE", title: "Help Desk", sub: "Concierge support", to: "/help" },
  { type: "PAGE", title: "Privacy Policy", sub: "Legal", to: "/privacy" },
  {
    type: "PAGE",
    title: "Refund Policy",
    sub: "Buyer protection",
    to: "/refund",
  },
  { type: "PAGE", title: "Profile", sub: "Collector profile", to: "/profile" },
  { type: "PAGE", title: "About Art Coliseum", sub: "Our story", to: "/about" },
  { type: "PAGE", title: "Contact", sub: "Get in touch", to: "/contact" },
  { type: "PAGE", title: "Community", sub: "Artists & collectors hub", to: "/community" },
  { type: "PAGE", title: "Chat Rooms", sub: "Art discussion rooms", to: "/chat" },
  { type: "PAGE", title: "Estimate Calculator", sub: "Get artwork price estimate", to: "/estimate" },
];

function NavSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return SEARCH_INDEX.filter((r) =>
      `${r.title} ${r.sub} ${r.type}`.toLowerCase().includes(term),
    ).slice(0, 8);
  }, [q]);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (r) => {
    navigate(r.to);
    setQ("");
    setOpen(false);
  };

  const grouped = useMemo(() => {
    const g = {};
    for (const r of results) (g[r.type] ||= []).push(r);
    return g;
  }, [results]);

  return (
    <div ref={ref} className="nav-search" onClick={() => setOpen(true)}>
      <span className="nav-search-icon">
        <SearchIcon size={14} />
      </span>
      <input
        className="nav-search-input"
        placeholder="Search artworks, artists, mediums…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results[0]) go(results[0]);
          if (e.key === "Escape") setOpen(false);
        }}
      />
      <AnimatePresence>
        {open && q && (
          <motion.div
            className="nav-search-results"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}>
            {results.length === 0 ? (
              <div className="nav-search-empty">No matches for "{q}"</div>
            ) : (
              Object.entries(grouped).map(([type, rows]) => (
                <div key={type}>
                  <div className="nav-search-section-title">{type}</div>
                  {rows.map((r, i) => (
                    <div
                      key={`${type}-${i}`}
                      className="nav-search-row"
                      onClick={() => go(r)}>
                      <div className="nav-search-row-thumb">
                        {r.img ? (
                          <img src={r.img} alt="" />
                        ) : (
                          r.title.slice(0, 1)
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="nav-search-row-title">{r.title}</div>
                        <div className="nav-search-row-sub">{r.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LangButton({ compact }) {
  const { lang, setLang } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <motion.button
        title="Language"
        onClick={() => setOpen((v) => !v)}
        className="nav-icon-btn"
        whileHover={{ scale: 1.18, color: "#D4AF37" }}
        whileTap={{ scale: 0.92 }}>
        <GlobeIcon />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="lang-pop"
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            style={compact ? { right: "auto", left: 0 } : {}}>
            <div
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "#D4AF37",
                padding: "8px 12px 10px",
                borderBottom: "1px solid rgba(212,175,55,0.15)",
                marginBottom: 6,
              }}>
              LANGUAGE
            </div>
            {Object.entries(LANGS).map(([code, l]) => (
              <button
                key={code}
                onClick={() => {
                  setLang(code);
                  setOpen(false);
                }}
                className={`lang-pop-row ${lang === code ? "active" : ""}`}>
                <span>{l.label}</span>
                {lang === code && <CheckIcon size={12} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* mobile-drawer search box (compact) */
function MobileSearch({ onSelect }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return SEARCH_INDEX.filter((r) =>
      `${r.title} ${r.sub}`.toLowerCase().includes(t),
    ).slice(0, 6);
  }, [q]);

  return (
    <div style={{ marginTop: 18, marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 14px",
          height: 40,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(212,175,55,0.25)",
          borderRadius: 999,
        }}>
        <span style={{ color: "#D4AF37", display: "flex" }}>
          <SearchIcon size={14} />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
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
      {results.length > 0 && (
        <div
          style={{
            marginTop: 8,
            padding: 8,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(212,175,55,0.15)",
            borderRadius: 8,
            maxHeight: 220,
            overflowY: "auto",
          }}>
          {results.map((r, i) => (
            <div
              key={i}
              onClick={() => {
                navigate(r.to);
                onSelect && onSelect();
              }}
              style={{
                padding: "8px 10px",
                cursor: "pointer",
                borderRadius: 6,
                fontFamily: "'Raleway',sans-serif",
                fontSize: 13,
                color: "#e8e0d0",
              }}>
              <div>{r.title}</div>
              <div
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 9,
                  letterSpacing: "0.16em",
                  color: "rgba(200,191,160,0.55)",
                  marginTop: 2,
                }}>
                {r.type} · {r.sub}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="nav-container">
        <div className="nav-inner">
          <div className="nav-left">
            <motion.img
              src={logo}
              alt="Art Coliseum"
              className="nav-logo-img"
              onClick={() => navigate("/")}
              style={{ cursor: "pointer" }}
              whileHover={{
                filter: "drop-shadow(0 0 14px rgba(212,175,55,0.7))",
              }}
            />
          </div>

          <div className="nav-center nav-desktop">
            {LINKS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " nav-active" : "")
                }>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="nav-right nav-desktop">
            <NavSearch />

            <motion.button
              title="Cart"
              onClick={() => navigate("/cart")}
              className="nav-icon-btn"
              whileHover={{ scale: 1.18, color: "#D4AF37" }}
              whileTap={{ scale: 0.92 }}>
              <CartIcon />
            </motion.button>

            <LangButton />

            <motion.button
              title="Profile"
              onClick={() => navigate("/signin")}
              className="nav-icon-btn"
              whileHover={{ scale: 1.18, color: "#D4AF37" }}
              whileTap={{ scale: 0.92 }}>
              <ProfileIcon />
            </motion.button>
          </div>

          <button
            className="hamburger nav-mobile"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu">
            <span className={menuOpen ? "ham-line open-1" : "ham-line"} />
            <span className={menuOpen ? "ham-line open-2" : "ham-line"} />
            <span className={menuOpen ? "ham-line open-3" : "ham-line"} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "tween",
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}>
            <MobileSearch onSelect={() => setMenuOpen(false)} />

            {ALL_LINKS.map(({ label, to }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    "mobile-nav-link" + (isActive ? " nav-active" : "")
                  }
                  onClick={() => setMenuOpen(false)}>
                  {label}
                </NavLink>
              </motion.div>
            ))}
            <motion.div
              style={{
                display: "flex",
                gap: 16,
                marginTop: 32,
                justifyContent: "center",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.38 }}>
              <motion.button
                title="Cart"
                className="nav-icon-btn"
                onClick={() => {
                  navigate("/cart");
                  setMenuOpen(false);
                }}>
                <CartIcon />
              </motion.button>
              <LangButton compact />
              <motion.button
                title="Profile"
                className="nav-icon-btn"
                onClick={() => {
                  navigate("/signin");
                  setMenuOpen(false);
                }}>
                <ProfileIcon />
              </motion.button>
            </motion.div>
            <motion.button
              className="btn-outline"
              style={{ marginTop: 24, width: "100%" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.44 }}
              onClick={() => {
                navigate("/ar");
                setMenuOpen(false);
              }}>
              TRY AR VIEWER
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
