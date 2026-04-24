const GALLERY_ITEMS = [
  { title: 'GOLDEN HORIZON', medium: 'Acrylic on Canvas', artist: 'Marcus Thomas', year: '2024', price: '$2,400', bg: 'linear-gradient(135deg, #c8860a, #1a3a5c)' },
  { title: 'ETERNAL GRACE', medium: 'Bronze Sculpture', artist: 'Elena Rossi', year: '2023', price: '$3,800', bg: 'linear-gradient(135deg, #2C1810, #8B4513)' },
  { title: 'COSMIC FLOW', medium: 'Mixed Media', artist: 'Hideo Tanaka', year: '2024', price: '$1,950', bg: 'linear-gradient(135deg, #1a0a2e, #4B1D6E)' },
  { title: 'THE GOLDEN TREE', medium: 'Oil on Canvas', artist: 'Chen Wei', year: '2024', price: '$2,100', bg: 'linear-gradient(135deg, #0a1a0a, #1a4a1a)' },
  { title: 'WHISPERS OF SILENCE', medium: 'Oil on Canvas', artist: 'Lena Bach', year: '2025', price: '$1,700', bg: 'linear-gradient(135deg, #1a1a0a, #3a3a1a)' },
  { title: 'Abstract Realism', medium: 'Acrylic & Oil', artist: 'Marcus Thomas', year: '2024', price: '$4,200', bg: 'linear-gradient(135deg, #c8860a, #1a3a5c)' },
  { title: 'Renaissance Portraits', medium: 'Oil on Panel', artist: 'Elena Rossi', year: '2023', price: '$5,800', bg: 'linear-gradient(135deg, #2C1810, #D2691E)' },
  { title: 'Ocean Depths', medium: 'Digital Print', artist: 'Hideo Tanaka', year: '2024', price: '$1,200', bg: 'linear-gradient(135deg, #0a1628, #4a7fa0)' },
];

export default function Gallery() {
  return (
    <section style={{ padding: '120px 52px 100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div className="gold-rule" style={{ justifyContent: 'center' }}>
          <div className="grl" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37)' }} />
          <span className="grt">Collection</span>
          <div className="grl" style={{ background: 'linear-gradient(90deg, #D4AF37, transparent)' }} />
        </div>
        <h2 className="section-heading">
          <span className="bold-white">Explore</span> <em>Gallery</em>
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {GALLERY_ITEMS.map(item => (
          <div key={item.title} style={{ background: item.bg, height: '360px', borderRadius: '4px', position: 'relative', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(212,175,55,0.15)', transition: 'transform 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)' }} />
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{item.title}</div>
              <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '11px', color: 'rgba(212,175,55,0.8)', letterSpacing: '0.1em' }}>{item.medium} · {item.artist}</div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: '15px', color: '#D4AF37', marginTop: '8px' }}>{item.price}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}