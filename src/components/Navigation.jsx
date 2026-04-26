import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";
import { useLocale, LANGS } from "../context/Locale";
import { CheckIcon } from "./Icons";

const LINKS = [
  { label: "HOME",        to: "/"           },
  { label: "ARTISTS",     to: "/artists"    },
  { label: "MARKETPLACE", to: "/categories" },
  { label: "ABOUT",       to: "/about"      },
];

const ALL_LINKS = [
  ...LINKS,
  { label: "GALLERY",  to: "/gallery" },
  { label: "CONTACT",  to: "/contact" },
];

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function LangButton({ compact }) {
  const { lang, setLang, currency } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <motion.button
        title="Language"
        onClick={() => setOpen(v => !v)}
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
            <div style={{
              fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.2em",
              color: "#D4AF37", padding: "8px 12px 10px",
              borderBottom: "1px solid rgba(212,175,55,0.15)",
              marginBottom: 6,
            }}>
              LANGUAGE & CURRENCY
            </div>
            {Object.entries(LANGS).map(([code, l]) => (
              <button
                key={code}
                onClick={() => { setLang(code); setOpen(false); }}
                className={`lang-pop-row ${lang === code ? "active" : ""}`}>
                <span>{l.label}</span>
                <span style={{
                  fontFamily: "'Raleway',sans-serif", fontSize: 11,
                  letterSpacing: "0.08em",
                  color: lang === code ? "#D4AF37" : "rgba(200,191,160,0.5)",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {l.currency}
                  {lang === code && <CheckIcon size={12} />}
                </span>
              </button>
            ))}
            <div style={{
              padding: "8px 12px", marginTop: 6,
              borderTop: "1px solid rgba(212,175,55,0.12)",
              fontFamily: "'Raleway',sans-serif", fontSize: 10,
              color: "rgba(200,191,160,0.5)", letterSpacing: "0.05em",
            }}>
              Showing prices in <span style={{ color: "#D4AF37" }}>{currency}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
              whileHover={{ filter: "drop-shadow(0 0 14px rgba(212,175,55,0.7))" }}
            />
          </div>

          <div className="nav-center nav-desktop">
            {LINKS.map(({ label, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) => "nav-link" + (isActive ? " nav-active" : "")}>
                {label}
              </NavLink>
            ))}
          </div>

          <div className="nav-right nav-desktop">
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
            onClick={() => setMenuOpen(v => !v)}
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
            transition={{ type: "tween", duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
            {ALL_LINKS.map(({ label, to }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) => "mobile-nav-link" + (isActive ? " nav-active" : "")}
                  onClick={() => setMenuOpen(false)}>
                  {label}
                </NavLink>
              </motion.div>
            ))}
            <motion.div
              style={{ display: "flex", gap: 16, marginTop: 32, justifyContent: "center" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.38 }}>
              <motion.button title="Cart" className="nav-icon-btn" onClick={() => { navigate("/cart"); setMenuOpen(false); }}>
                <CartIcon />
              </motion.button>
              <LangButton compact />
              <motion.button title="Profile" className="nav-icon-btn" onClick={() => { navigate("/signin"); setMenuOpen(false); }}>
                <ProfileIcon />
              </motion.button>
            </motion.div>
            <motion.button
              className="btn-outline"
              style={{ marginTop: 24, width: "100%" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.44 }}
              onClick={() => { navigate("/ar"); setMenuOpen(false); }}>
              TRY AR VIEWER
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="drawer-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
