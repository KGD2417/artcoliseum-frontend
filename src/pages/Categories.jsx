const CATEGORIES = [
  { name: 'PAINTINGS', description: 'Oil, Acrylic & Watercolor masterpieces', count: '2,400+ works', icon: '🎨', bg: 'linear-gradient(135deg, #c8860a, #1a3a5c)' },
  { name: 'SCULPTURES', description: 'Bronze, Marble & Mixed Media', count: '840+ works', icon: '🗿', bg: 'linear-gradient(135deg, #2C1810, #8B4513)' },
  { name: 'PHOTOGRAPHY', description: 'Fine Art & Documentary', count: '1,200+ works', icon: '📷', bg: 'linear-gradient(135deg, #1a0a2e, #4B1D6E)' },
  { name: 'DIGITAL', description: 'NFT & Digital Canvas', count: '3,600+ works', icon: '💠', bg: 'linear-gradient(135deg, #0a1a0a, #1a4a1a)' },
  { name: 'DRAWINGS', description: 'Charcoal, Pastel & Ink', count: '950+ works', icon: '✏️', bg: 'linear-gradient(135deg, #1a1a0a, #3a3a1a)' },
  { name: 'PRINTS', description: 'Limited Edition Fine Art Prints', count: '2,100+ works', icon: '🖼️', bg: 'linear-gradient(135deg, #0a1628, #4a7fa0)' },
];

export default function Categories() {
  return (
    <section style={{ padding: '120px 52px 100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div className="gold-rule" style={{ justifyContent: 'center' }}>
          <div className="grl" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37)' }} />
          <span className="grt">Browse by Category</span>
          <div className="grl" style={{ background: 'linear-gradient(90deg, #D4AF37, transparent)' }} />
        </div>
        <h2 className="section-heading">
          <span className="bold-white">Art</span> <em>Categories</em>
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {CATEGORIES.map(cat => (
          <div key={cat.name} style={{ background: cat.bg, padding: '40px 28px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.3s', border: '1px solid rgba(212,175,55,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>{cat.icon}</div>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '12px' }}>{cat.name}</h3>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '13px', color: 'rgba(200,191,160,0.8)', marginBottom: '8px' }}>{cat.description}</p>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '11px', color: '#8B7A45', letterSpacing: '0.05em' }}>{cat.count}</p>
          </div>
        ))}
      </div>
    </section>
  );
}