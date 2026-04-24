const ARTISTS_LIST = [
  { name: 'Marcus Thomas', role: 'ABSTRACT EXPRESSIONISM', bio: 'Known for bold color fields and emotional depth.', image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80', works: 142 },
  { name: 'Elena Rossi', role: 'DIGITAL SURREALISM', bio: 'Blends classical techniques with digital innovation.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', works: 98 },
  { name: 'Hideo Tanaka', role: 'KINETIC SCULPTURE', bio: 'Creates movement and light in metal and glass.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', works: 67 },
  { name: 'Aria Voss', role: 'DIGITAL SURREALISM', bio: 'Dreamlike compositions exploring consciousness.', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80', works: 55 },
  { name: 'Chen Wei', role: 'FOREST ETHEREAL', bio: 'Captures the spirit of nature in oil and ink.', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80', works: 89 },
  { name: 'Lena Bach', role: 'GOLD ABSTRACTIONS', bio: 'Contemporary minimalism with metallic textures.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80', works: 73 },
];

export default function Artists() {
  return (
    <section style={{ padding: '120px 52px 100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div className="gold-rule" style={{ justifyContent: 'center' }}>
          <div className="grl" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37)' }} />
          <span className="grt">Our Collective</span>
          <div className="grl" style={{ background: 'linear-gradient(90deg, #D4AF37, transparent)' }} />
        </div>
        <h2 className="section-heading">
          <span className="bold-white">Featured</span> <em>Artists</em>
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        {ARTISTS_LIST.map(artist => (
          <div key={artist.name} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '8px', overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
            <img src={artist.image} alt={artist.name} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 600, marginBottom: '8px' }}>{artist.name}</h3>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.15em', color: '#D4AF37', marginBottom: '12px' }}>{artist.role}</div>
              <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '13px', color: 'rgba(200,191,160,0.7)', lineHeight: 1.5, marginBottom: '16px' }}>{artist.bio}</p>
              <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '11px', color: '#8B7A45' }}>{artist.works} works available</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}