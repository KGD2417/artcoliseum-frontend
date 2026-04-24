import { useState, useEffect, useRef } from 'react';

const FEATURED_ARTWORKS = [
    { title: 'GOLDEN HORIZON', medium: 'Acrylic on Canvas', price: '$2,400', bg: 'linear-gradient(135deg, #c8860a, #1a3a5c)' },
    { title: 'ETERNAL GRACE', medium: 'Bronze Sculpture', price: '$3,800', bg: 'linear-gradient(135deg, #2C1810, #8B4513)' },
    { title: 'COSMIC FLOW', medium: 'Mixed Media', price: '$1,950', bg: 'linear-gradient(135deg, #1a0a2e, #4B1D6E)' },
    { title: 'THE GOLDEN TREE', medium: 'Oil on Canvas', price: '$2,100', bg: 'linear-gradient(135deg, #0a1a0a, #1a4a1a)' },
    { title: 'WHISPERS OF SILENCE', medium: 'Oil on Canvas', price: '$1,700', bg: 'linear-gradient(135deg, #1a1a0a, #3a3a1a)' },
];

const STATS = [
    { value: '10,000+', label: 'Original Artworks' },
    { value: '2,500+', label: 'Talented Artists' },
    { value: '50+', label: 'Countries' },
    { value: '100%', label: 'Authentic Artwork' },
];

const MEDIUMS = [
    { label: 'PAINTINGS', sub: 'Oil, Acrylic & Watercolor', count: '2,400+ works', img: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80' },
    { label: 'SCULPTURES', sub: 'Bronze, Marble & Mixed Media', count: '840+ works', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
    { label: 'PHOTOGRAPHY', sub: 'Fine Art & Documentary', count: '1,200+ works', img: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&q=80' },
    { label: 'DIGITAL', sub: 'NFT & Digital Canvas', count: '3,600+ works', img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&q=80' },
];

const ARTISTS = [
    { name: 'Marcus Thomas', role: 'ABSTRACT EXPRESSIONISM', works: '142 works', initials: 'MT' },
    { name: 'Elena Rossi', role: 'DIGITAL SURREALISM', works: '98 works', initials: 'ER' },
    { name: 'Hideo Tanaka', role: 'KINETIC SCULPTURE', works: '67 works', initials: 'HT' },
];

const CAROUSEL_ITEMS = [
    { img: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800", title: "Golden Horizon", price: "$2,400" },
    { img: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800", title: "Eternal Grace", price: "$3,800" },
    { img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800", title: "Cosmic Flow", price: "$1,950" },
    { img: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=800", title: "Golden Tree", price: "$2,100" },
    { img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800", title: "Whispers", price: "$1,700" },
    { img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800", title: "Whispers", price: "$1,700" },

    { img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800", title: "Whispers", price: "$1,700" },
    { img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800", title: "Cosmic Flow", price: "$1,950" },
    { img: "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800", title: "Whispers", price: "$1,700" },
];

export default function Home() {
    const [email, setEmail] = useState('');
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const startX = useRef(0);
    const startRot = useRef(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isDragging) {
                setRotation((r) => r - 0.2);
            }
        }, 16);

        return () => clearInterval(interval);
    }, [isDragging]);

    const handleDown = (e) => {
        setIsDragging(true);
        startX.current = e.clientX;
        startRot.current = rotation;
    };

    const handleMove = (e) => {
  if (!isDragging) return;
  const delta = e.clientX - startX.current;
  setRotation(startRot.current + delta * 2);
};

    const handleUp = () => {
        setIsDragging(false);
    };
    return (
        <>
            {/* Hero Section */}
            <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 52px 80px', background: 'radial-gradient(ellipse at 50% 25%, #1a1510 0%, #080808 65%)', overflow: 'hidden' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(80px, 15vw, 160px)', fontWeight: 700, lineHeight: 0.9, color: '#f0e8d8', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                        COLISEUM
                    </h1>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: 'clamp(14px, 2vw, 20px)', letterSpacing: '0.2em', color: '#D4AF37', marginTop: '20px' }}>Own Timeless Art</p>
                    <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '14px', lineHeight: 1.8, color: 'rgba(138,128,112,0.78)', maxWidth: '500px', margin: '20px auto 0', letterSpacing: '0.03em' }}>
                        Discover, collect and cherish extraordinary artworks from talented artists around the world.
                    </p>
                    <button className="btn-gold" style={{ marginTop: '40px' }}>EXPLORE GALLERY</button>
                </div>

                {/* Artwork Grid */}
                <div
                    style={{
                        perspective: "1200px",
                        height: "400px",
                        marginTop: "40px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: isDragging ? "grabbing" : "grab"
                    }}
                    onMouseDown={handleDown}
                    onMouseMove={handleMove}
                    onMouseUp={handleUp}
                    onMouseLeave={handleUp}
                >
                    <div
                        style={{
                            position: "relative",
                            width: "240px",
                            height: "320px",
                            transformStyle: "preserve-3d",
                            transform: `rotateY(${rotation}deg)`,
                            transition: isDragging ? "none" : "transform 0.1s linear"
                        }}
                    >
                        {CAROUSEL_ITEMS.map((item, i) => {
                            const angle = (360 / CAROUSEL_ITEMS.length) * i;
                            const radius = 420;

                            return (
                                <div
                                    key={i}
                                    style={{
                                        position: "absolute",
                                        width: "240px",
                                        height: "320px",
                                        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
                                        border: "1px solid rgba(212,175,55,0.2)"
                                    }}
                                >
                                    <img
                                        src={item.img}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />

                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: "10px",
                                            left: "10px",
                                            right: "10px",
                                            background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                                            padding: "10px"
                                        }}
                                    >
                                        <div style={{ color: "#fff", fontSize: "14px" }}>{item.title}</div>
                                        <div style={{ color: "#D4AF37", fontSize: "12px" }}>{item.price}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap', marginTop: '80px', paddingTop: '40px', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
                    {STATS.map(stat => (
                        <div key={stat.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '28px', fontWeight: 600, color: '#D4AF37', letterSpacing: '0.02em' }}>{stat.value}</div>
                            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '11px', letterSpacing: '0.1em', color: 'rgba(200,191,160,0.6)', textTransform: 'uppercase' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* The Mediums Section */}
            <section style={{ padding: '80px 52px 100px', position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                    <div className="gold-rule" style={{ justifyContent: 'center' }}>
                        <div className="grl" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37)' }} />
                        <span className="grt">Browse by Medium</span>
                        <div className="grl" style={{ background: 'linear-gradient(90deg, #D4AF37, transparent)' }} />
                    </div>
                    <h2 className="section-heading">
                        <span className="bold-white">The</span> <em>Mediums</em>
                    </h2>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {MEDIUMS.map(({ label, sub, count, img }) => (
                        <div key={label} className="med-card" style={{ flex: 1, minWidth: '200px', position: 'relative', overflow: 'hidden', borderRadius: '4px', border: '1px solid rgba(139,122,69,0.1)', cursor: 'pointer' }}>
                            <img src={img} alt={label} style={{ width: '100%', height: '340px', objectFit: 'cover', display: 'block' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 60%)' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(8,8,8,0.6)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(212,175,55,0.2)', padding: '18px 20px' }}>
                                <div style={{ fontFamily: "'Cinzel', serif", fontSize: '13px', letterSpacing: '0.14em', color: '#fff', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
                                <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '11px', color: 'rgba(200,191,160,0.7)', marginBottom: '6px' }}>{sub}</div>
                                <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', color: '#D4AF37', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{count}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Artists */}
            <section style={{ padding: '80px 52px 100px', background: 'linear-gradient(180deg, #080808 0%, #0d0b08 50%, #080808 100%)' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div className="gold-rule" style={{ justifyContent: 'center' }}>
                        <div className="grl" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37)' }} />
                        <span className="grt">Featured Artists</span>
                        <div className="grl" style={{ background: 'linear-gradient(90deg, #D4AF37, transparent)' }} />
                    </div>
                    <h2 className="section-heading">
                        <span className="bold-white">The</span> <em>Visionaries</em>
                    </h2>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {ARTISTS.map(({ name, role, works, initials }) => (
                        <div key={name} className="artist-card" style={{ flex: 1, padding: '40px 28px', border: '1px solid rgba(139,122,69,0.15)', background: 'rgba(255,255,255,0.02)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.4s', borderRadius: '4px' }}>
                            <div style={{ width: '92px', height: '92px', borderRadius: '50%', border: '2px solid #D4AF37', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cinzel', serif", fontSize: '20px', fontWeight: 600, color: '#D4AF37', background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.03))', boxShadow: '0 0 28px rgba(212,175,55,0.18)' }}>
                                {initials}
                            </div>
                            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: '#f0e8d8', marginBottom: '7px', fontWeight: 600 }}>{name}</div>
                            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '10px', letterSpacing: '0.18em', color: '#D4AF37', marginBottom: '14px', textTransform: 'uppercase' }}>{role}</div>
                            <div style={{ fontFamily: "'Raleway', sans-serif", fontSize: '12px', color: 'rgba(138,128,112,0.6)' }}>{works}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Newsletter */}
            <section style={{ padding: '100px 52px', textAlign: 'center', borderTop: '1px solid rgba(139,122,69,0.1)', background: 'radial-gradient(ellipse at 50% 100%, rgba(212,175,55,0.05) 0%, transparent 60%)' }}>
                <div className="gold-rule" style={{ justifyContent: 'center', marginBottom: '22px' }}>
                    <div className="grl" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37)' }} />
                    <span className="grt">Newsletter</span>
                    <div className="grl" style={{ background: 'linear-gradient(90deg, #D4AF37, transparent)' }} />
                </div>
                <h2 className="section-heading" style={{ marginBottom: '14px' }}>Stay <em>Cultivated</em></h2>
                <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: '14px', color: 'rgba(138,128,112,0.7)', letterSpacing: '0.05em', marginBottom: '40px' }}>
                    Receive exclusive invitations to private viewings and new artist debuts.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <input className="email-input" type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} />
                    <button className="btn-gold" style={{ borderRadius: '0 60px 60px 0', padding: '15px 32px' }}>Subscribe</button>
                </div>
            </section>
        </>
    );
}