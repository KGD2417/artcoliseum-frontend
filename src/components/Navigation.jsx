import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

const LINKS = [
  { label: "HOME",        to: "/"           },
  { label: "ARTISTS",     to: "/artists"    },
  { label: "MARKETPLACE", to: "/categories" },
  { label: "ABOUT",       to: "/about"      },
];

const ALL_LINKS = [
  ...LINKS,
  { label: "GALLERY",     to: "/gallery"    },
  { label: "CONTACT",     to: "/contact"    },
];

/* ── SVG nav icons ── */
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

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="nav-container">
        <div className="nav-inner">

          {/* LEFT — logo */}
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

          {/* CENTER — desktop links */}
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

          {/* RIGHT — desktop icons */}
          <div className="nav-right nav-desktop">
            {[
              { icon: <CartIcon />,    title: "Cart",     action: () => navigate("/cart") },
              { icon: <GlobeIcon />,   title: "Language", action: () => navigate("/profile") },
              { icon: <ProfileIcon />, title: "Profile",  action: () => navigate("/signin") },
            ].map(({ icon, title, action }) => (
              <motion.button
                key={title}
                title={title}
                onClick={action}
                className="nav-icon-btn"
                whileHover={{ scale: 1.18, color: "#D4AF37" }}
                whileTap={{ scale: 0.92 }}>
                {icon}
              </motion.button>
            ))}
          </div>

          {/* HAMBURGER — mobile */}
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

      {/* mobile drawer */}
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
              {[
                { icon: <CartIcon />, title: "Cart" },
                { icon: <GlobeIcon />, title: "Language" },
                { icon: <ProfileIcon />, title: "Profile" },
              ].map(({ icon, title }) => (
                <motion.button key={title} className="nav-icon-btn" whileHover={{ scale: 1.15 }}>{icon}</motion.button>
              ))}
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
