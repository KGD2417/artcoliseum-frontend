import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from './Navigation';

export default function Layout() {
  return (
    <div style={{ background: '#080808', minHeight: '100vh' }}>
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/* ── SVG social icons ── */
function IgIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function TwIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 12a4 4 0 1 0 8 0c0-2.21-1.79-4-4-4s-4 1.79-4 4zm4 4v6m0-16V2"/>
    </svg>
  );
}
function YtIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
    </svg>
  );
}

const SOCIALS = [
  { icon: <IgIcon />,  label: "Instagram" },
  { icon: <TwIcon />,  label: "Twitter / X" },
  { icon: <PinIcon />, label: "Pinterest" },
  { icon: <YtIcon />,  label: "YouTube" },
];

const NAV_LINKS = [
  { label: "Gallery",     href: "/gallery" },
  { label: "Artists",     href: "/artists" },
  { label: "Categories",  href: "/categories" },
  { label: "About Us",    href: "/about" },
  { label: "Contact",     href: "/contact" },
  { label: "AR Viewer",   href: "/ar" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy",    href: "/privacy" },
  { label: "Refund Policy",     href: "/refund" },
  { label: "Help Desk",         href: "/help" },
  { label: "Cookie Settings",   href: "/" },
  { label: "Shipping & Returns",href: "/" },
];

function Footer() {
  return (
    <footer className="footer-root">
      <div className="footer-inner">

        {/* top grid: brand | navigation | connect */}
        <div className="footer-top">

          {/* brand */}
          <div>
            <div className="footer-brand-name">ART COLISEUM</div>
            <p className="footer-brand-tagline">
              A curated sanctuary where extraordinary art finds its home.
              Connecting creators with collectors across the world.
            </p>
            {/* gold divider line */}
            <div style={{
              width: 48, height: 1,
              background: "linear-gradient(90deg,#D4AF37,transparent)",
              margin: "20px 0",
            }} />
            <div className="footer-socials">
              {SOCIALS.map(({ icon, label }) => (
                <motion.button
                  key={label}
                  className="footer-social-btn"
                  title={label}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.92 }}>
                  {icon}
                </motion.button>
              ))}
            </div>
          </div>

          {/* navigation */}
          <div>
            <div className="footer-col-title">Navigation</div>
            <nav className="footer-links">
              {NAV_LINKS.map(({ label, href }) => (
                <a key={label} href={href} className="footer-link">{label}</a>
              ))}
            </nav>
          </div>

          {/* connect */}
          <div>
            <div className="footer-col-title">Connect</div>
            <div className="footer-links">
              <a href="mailto:hello@artcoliseum.com" className="footer-link">hello@artcoliseum.com</a>
              <span className="footer-link" style={{ cursor: "default" }}>+1 (212) 555-0192</span>
              <span className="footer-link" style={{ cursor: "default", lineHeight: 1.6, color: "rgba(138,128,112,0.45)" }}>
                123 Museum Mile<br />New York, NY 10028
              </span>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="footer-bottom">
          <div className="footer-copy num-value">
            © 2026 Made by <span style={{ color: "#D4AF37", letterSpacing: "0.18em" }}>TRISPARC</span>. All Rights Reserved.
          </div>
          <div className="footer-bottom-links">
            {LEGAL_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className="footer-link" style={{ fontSize: "11px" }}>{label}</a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
