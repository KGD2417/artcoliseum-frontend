import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";
import { useLocale, LANGS } from "../context/Locale";
import { useAuth } from "../context/Auth";
import { api } from "../utils/api";
import { CheckIcon, SearchIcon, MessageIcon } from "./Icons";
import NotificationBell from "./NotificationBell";

const LINKS = [
  { label: "COLLECTION", to: "/categories" },
  { label: "EVENTS", to: "/events" },
  { label: "EXHIBITION", to: "/exhibition" },
  { label: "ARTISTS", to: "/artists" },
  { label: "COMPETITION", to: "/competition" },
  { label: "COMMUNITY", to: "/community" },
];

const SETU_LINKS = [
  { label: "SAMAN SETU", to: "/saman-setu" },
  { label: "SWAD SETU", to: "/swad-setu" },
  { label: "SARJAAN SETU", to: "/sarjaan-setu" },
  { label: "SHILP SETU", to: "/shilp-setu" },
  { label: "RENTAL", to: "/rental" },
  { label: "Disposal Management", to: "/waste-management" },
];

const ALL_LINKS = [
  ...LINKS,
  ...SETU_LINKS,
  { label: "ESTIMATE", to: "/estimate" },
  { label: "CONTACT", to: "/contact" },
  { label: "HELP DESK", to: "/help" },
];

/* ── page shortcuts for search (artworks, artists & mediums come live from the API) ── */
const SEARCH_INDEX = [
  { type: "PAGE", title: "Collection", sub: "Browse by medium", to: "/categories" },
  { type: "PAGE", title: "Artists", sub: "Meet our artists", to: "/artists" },
  { type: "PAGE", title: "Events", sub: "Exhibitions & experiences", to: "/events" },
  { type: "PAGE", title: "Exhibition", sub: "The online exhibition", to: "/exhibition" },
  { type: "PAGE", title: "Competition", sub: "Juried art competition", to: "/competition" },
  { type: "PAGE", title: "Become an Artist", sub: "Artist portal", to: "/become-artist" },
  { type: "PAGE", title: "Cart", sub: "Your acquisitions", to: "/cart" },
  { type: "PAGE", title: "Help Desk", sub: "Concierge support", to: "/help" },
  { type: "PAGE", title: "Privacy Policy", sub: "Legal", to: "/privacy" },
  { type: "PAGE", title: "Refund Policy", sub: "Buyer protection", to: "/refund" },
  { type: "PAGE", title: "Profile", sub: "Collector profile", to: "/profile" },
  { type: "PAGE", title: "About Art Coliseum", sub: "Our story", to: "/about" },
  { type: "PAGE", title: "Contact", sub: "Get in touch", to: "/contact" },
  { type: "PAGE", title: "Community", sub: "Artists & collectors hub", to: "/community" },
  { type: "PAGE", title: "Chat Rooms", sub: "Art discussion rooms", to: "/chat" },
  { type: "PAGE", title: "Estimate Calculator", sub: "Get artwork price estimate", to: "/estimate" },
];

/**
 * Live site search: real artworks, artists and mediums from the catalog API,
 * merged with the static page shortcuts. Debounced; falls back gracefully if
 * the API is unreachable. `loading` lets the UI show a searching state.
 */
function useSiteSearch(q, limit = 8) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cats, setCats] = useState([]);

  // Categories (mediums) load once and power the medium shortcuts.
  useEffect(() => {
    api.catalog.categories().then((c) => setCats(c || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (!term) { setResults([]); setLoading(false); return; }
    const lc = term.toLowerCase();

    // Real mediums from the catalog (so the links always resolve).
    const mediumHits = (cats || [])
      .filter((c) => c.kind === "main" && `${c.label} ${c.id} ${c.description || ""}`.toLowerCase().includes(lc))
      .slice(0, 4)
      .map((c) => ({
        type: "MEDIUM", title: c.label,
        sub: c.description || "Browse the collection",
        to: `/categories/${c.id}`, img: c.image_url || null,
      }));

    // Static page shortcuts (Cart, Profile, Become an Artist, Help…).
    const pageHits = SEARCH_INDEX.filter(
      (r) => r.type === "PAGE" && `${r.title} ${r.sub}`.toLowerCase().includes(lc),
    );

    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      let live = [];
      try {
        const [arts, artists] = await Promise.all([
          api.catalog.artworks({ q: term }),
          api.catalog.artists(),
        ]);
        const artHits = (arts || []).slice(0, 6).map((a) => ({
          type: "ARTWORK",
          title: a.title,
          sub: (a.artist_name || "").toUpperCase(),
          to: `/product/${a.id}`,
          img: a.images?.[0] || null,
        }));
        const artistHits = (artists || [])
          .filter((ar) => `${ar.name} ${ar.location || ""} ${ar.art_type || ""}`.toLowerCase().includes(lc))
          .slice(0, 4)
          .map((ar) => ({
            type: "ARTIST",
            title: ar.name,
            sub: ar.location || ar.art_type || "Art Coliseum Artist",
            to: `/artists/${ar.id}`,
            img: ar.image_url || null,
          }));
        live = [...artHits, ...artistHits];
      } catch { /* API down → show medium/page shortcuts only */ }
      if (!cancelled) { setResults([...live, ...mediumHits, ...pageHits].slice(0, limit)); setLoading(false); }
    }, 180);

    return () => { cancelled = true; clearTimeout(t); };
  }, [q, limit, cats]);

  return { results, loading };
}

function NavSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const inputRef = useRef(null);

  const { results, loading } = useSiteSearch(q, 8);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Keep the highlighted row valid as results change.
  useEffect(() => { setActive(0); }, [results]);

  const go = (r) => {
    if (!r) return;
    navigate(r.to);
    setQ("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(results[active] || results[0]); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  const grouped = useMemo(() => {
    const g = {};
    for (const r of results) (g[r.type] ||= []).push(r);
    return g;
  }, [results]);

  // Walk groups in the same order as `results` so keyboard indices line up.
  let flatIdx = -1;

  return (
    <div ref={ref} className="nav-search nav-search-sm" onClick={() => { setOpen(true); inputRef.current?.focus(); }}>
      <span className="nav-search-icon"><SearchIcon size={12} /></span>
      <input
        ref={inputRef}
        className="nav-search-input"
        placeholder="Search art, artists…"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      <AnimatePresence>
        {open && q.trim() && (
          <motion.div
            className="nav-search-results"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}>
            {results.length === 0 ? (
              <div className="nav-search-empty">{loading ? "Searching…" : `No matches for "${q.trim()}"`}</div>
            ) : (
              <>
                {Object.entries(grouped).map(([type, rows]) => (
                  <div key={type}>
                    <div className="nav-search-section-title">{type}</div>
                    {rows.map((r) => {
                      flatIdx++;
                      const idx = flatIdx;
                      return (
                        <div
                          key={r.to + r.title}
                          className={`nav-search-row ${active === idx ? "is-active" : ""}`}
                          onMouseEnter={() => setActive(idx)}
                          onClick={() => go(r)}>
                          <div className="nav-search-row-thumb">
                            {r.img ? <img src={r.img} alt="" /> : r.title.slice(0, 1)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="nav-search-row-title">{r.title}</div>
                            <div className="nav-search-row-sub">{r.sub}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div className="nav-search-hint">↑ ↓ TO NAVIGATE · ↵ TO OPEN</div>
              </>
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
function SparkBolt() {
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
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function PaletteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
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
  const { results } = useSiteSearch(q, 6);

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
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { user, role, artistStatus } = useAuth();
  const profileTo = user ? "/profile" : "/signin";
  const isAdmin = role === "admin";
  const isArtist = role === "artist" || artistStatus === "verified";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the mobile drawer is open, hide the floating chat/messages FABs so they
  // don't sit on top of the drawer's own links and bottom icon row.
  useEffect(() => {
    document.body.classList.toggle("nav-drawer-open", menuOpen);
    return () => document.body.classList.remove("nav-drawer-open");
  }, [menuOpen]);

  return (
    <>
      <nav className={"nav-container" + (scrolled ? " is-scrolled" : "")}>
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

          <div
            className="nav-center nav-desktop"
            style={{
              flex: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
            }}>
            <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
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
            <div
              style={{
                display: "flex",
                gap: 40,
                alignItems: "center",
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px solid rgba(212,175,55,0.1)",
                flexWrap: "nowrap",
              }}>
              {SETU_LINKS.map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " nav-active" : "")
                  }
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: "italic",
                    fontSize: "16px",
                    letterSpacing: "0.06em",
                    textTransform: "none",
                    opacity: 0.92,
                    whiteSpace: "nowrap",
                  }}>
                  {label.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="nav-right nav-desktop">
            <NavSearch />

            <span className="nav-divider" aria-hidden />

            <LangButton />

            <motion.button
              title="Cart"
              onClick={() => navigate("/cart")}
              className="nav-icon-btn"
              whileHover={{ scale: 1.15, color: "#D4AF37" }}
              whileTap={{ scale: 0.92 }}>
              <CartIcon />
            </motion.button>

            <NotificationBell />

            {isAdmin && (
              <motion.button
                title="Admin Panel"
                onClick={() => navigate("/admin")}
                className="nav-icon-btn"
                whileHover={{ scale: 1.15, color: "#D4AF37" }}
                whileTap={{ scale: 0.92 }}>
                <ShieldIcon />
              </motion.button>
            )}

            {!isAdmin && isArtist && (
              <motion.button
                title="Artist Studio"
                onClick={() => navigate("/become-artist")}
                className="nav-icon-btn"
                whileHover={{ scale: 1.15, color: "#D4AF37" }}
                whileTap={{ scale: 0.92 }}>
                <PaletteIcon />
              </motion.button>
            )}

            <motion.button
              title={user ? "Profile" : "Sign in"}
              onClick={() => navigate(profileTo)}
              className="nav-icon-btn"
              whileHover={{ scale: 1.15, color: "#D4AF37" }}
              whileTap={{ scale: 0.92 }}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(212,175,55,0.5)" }} />
              ) : (
                <ProfileIcon />
              )}
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
              <LangButton compact />
              {isAdmin && (
                <motion.button
                  title="Admin Panel"
                  className="nav-icon-btn"
                  onClick={() => { navigate("/admin"); setMenuOpen(false); }}
                  whileHover={{ scale: 1.15, color: "#D4AF37" }}
                  whileTap={{ scale: 0.92 }}>
                  <ShieldIcon />
                </motion.button>
              )}
              {!isAdmin && isArtist && (
                <motion.button
                  title="Artist Studio"
                  className="nav-icon-btn"
                  onClick={() => { navigate("/become-artist"); setMenuOpen(false); }}
                  whileHover={{ scale: 1.15, color: "#D4AF37" }}
                  whileTap={{ scale: 0.92 }}>
                  <PaletteIcon />
                </motion.button>
              )}
              <motion.button
                title={user ? "Profile" : "Sign in"}
                className="nav-icon-btn"
                onClick={() => {
                  navigate(profileTo);
                  setMenuOpen(false);
                }}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(212,175,55,0.5)" }} />
                ) : (
                  <ProfileIcon />
                )}
              </motion.button>
            </motion.div>
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
