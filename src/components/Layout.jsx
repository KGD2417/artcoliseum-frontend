import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from './Navigation';
import logo from '../assets/logo.png';

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
    <footer
      style={{
        borderTop: "1px solid rgba(212,175,55,0.12)",
        padding: "24px 32px",
        background: "#080808",
      }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}>
        <img
          src={logo}
          alt="Art Coliseum"
          style={{ height: 38, width: "auto", display: "block" }}
        />
        <div
          style={{
            display: "flex",
            gap: 22,
            flexWrap: "wrap",
            justifyContent: "center",
          }}>
          {LEGAL_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: 11,
                letterSpacing: "0.12em",
                color: "rgba(200,191,160,0.55)",
                textDecoration: "none",
              }}>
              {label}
            </a>
          ))}
        </div>
        <div
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "rgba(138,128,112,0.55)",
          }}>
          @ 2026 Trisparc
        </div>
      </div>
    </footer>
  );
}
