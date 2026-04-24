import { Outlet } from 'react-router-dom';
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

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(139,122,69,0.12)', padding: '48px 52px 28px', background: '#050505' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: '11px', letterSpacing: '0.28em', color: 'rgba(74,69,64,0.8)', textTransform: 'uppercase', marginBottom: '22px' }}>
          Aureum Digital Museum
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginBottom: '26px' }}>
          {['Privacy Policy', 'Cookie Settings', 'Shipping & Returns', 'Contact Us', 'Press'].map(l => (
            <span key={l} className="footer-link">{l}</span>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '26px' }}>
          {[
            "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
            "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z",
          ].map((d, i) => (
            <div key={i} style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,122,69,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(139,122,69,0.7)" strokeWidth="1.5"><path d={d} /></svg>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '11px', color: 'rgba(42,37,32,0.8)', letterSpacing: '0.1em' }}>
          © 2025 Aureum Digital Museum. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}