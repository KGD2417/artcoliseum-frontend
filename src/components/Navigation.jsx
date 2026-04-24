import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { name: 'ART', path: '/' },
  { name: 'HOME', path: '/' },
  { name: 'GALLERY', path: '/gallery' },
  { name: 'ARTISTS', path: '/artists' },
  { name: 'CATEGORIES', path: '/categories' },
  { name: 'ABOUT US', path: '/about' },
  { name: 'CONTACT', path: '/contact' },
  { name: 'SIGN IN', path: '/signin' },
];

export default function Navigation() {
  return (
    <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 52px', height: '60px' }}>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: '13px', letterSpacing: '0.28em', color: '#D4AF37', fontWeight: 700, textTransform: 'uppercase', textShadow: '0 0 20px rgba(212,175,55,0.28)' }}>
        COLISEUM
      </div>
      <div style={{ display: 'flex', gap: '38px', alignItems: 'center' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive && item.path !== '/' ? 'nav-active' : ''}`}
            end
          >
            {item.name}
          </NavLink>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,191,160,0.7)" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(200,191,160,0.7)" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
    </nav>
  );
}