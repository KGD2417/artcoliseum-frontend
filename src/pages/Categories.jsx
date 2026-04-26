import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { slug: 'paintings',   name: 'PAINTINGS',   description: 'Oil, Acrylic & Watercolor masterpieces', count: '2,400+ works', icon: '🎨', bg: 'linear-gradient(135deg, #c8860a, #1a3a5c)' },
  { slug: 'sculptures',  name: 'SCULPTURES',  description: 'Bronze, Marble & Mixed Media',           count: '840+ works',   icon: '🗿', bg: 'linear-gradient(135deg, #2C1810, #8B4513)' },
  { slug: 'photography', name: 'PHOTOGRAPHY', description: 'Fine Art & Documentary',                 count: '1,200+ works', icon: '📷', bg: 'linear-gradient(135deg, #1a0a2e, #4B1D6E)' },
  { slug: 'digital',     name: 'DIGITAL',     description: 'NFT & Digital Canvas',                   count: '3,600+ works', icon: '💠', bg: 'linear-gradient(135deg, #0a1a0a, #1a4a1a)' },
  { slug: 'drawings',    name: 'DRAWINGS',    description: 'Charcoal, Pastel & Ink',                 count: '950+ works',   icon: '✏️', bg: 'linear-gradient(135deg, #1a1a0a, #3a3a1a)' },
  { slug: 'prints',      name: 'PRINTS',      description: 'Limited Edition Fine Art Prints',        count: '2,100+ works', icon: '🖼️', bg: 'linear-gradient(135deg, #0a1628, #4a7fa0)' },
];

export default function Categories() {
  const navigate = useNavigate();

  return (
    <section style={{ padding: '120px 52px 100px' }}>
      <motion.div
        style={{ textAlign: 'center', marginBottom: '60px' }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <div className="gold-rule" style={{ justifyContent: 'center' }}>
          <div className="grl" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37)' }} />
          <span className="grt">Browse by Medium</span>
          <div className="grl" style={{ background: 'linear-gradient(90deg, #D4AF37, transparent)' }} />
        </div>
        <h2 className="section-heading">
          <span className="bold-white">Marketplace</span> <em>Mediums</em>
        </h2>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: 'rgba(200,191,160,0.6)', maxWidth: 520, margin: '14px auto 0' }}>
          Choose a medium to explore its sub-categories and curated collections.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            whileHover={{ y: -6, boxShadow: '0 18px 40px rgba(0,0,0,0.5)' }}
            onClick={() => navigate(`/categories/${cat.slug}`)}
            style={{
              background: cat.bg, padding: '40px 28px', borderRadius: 8,
              textAlign: 'center', cursor: 'pointer',
              border: '1px solid rgba(212,175,55,0.15)',
            }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>{cat.icon}</div>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 18, letterSpacing: '0.15em', color: '#D4AF37', marginBottom: 12 }}>{cat.name}</h3>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 13, color: 'rgba(200,191,160,0.8)', marginBottom: 8 }}>{cat.description}</p>
            <p style={{ fontFamily: "'Raleway', sans-serif", fontSize: 11, color: '#8B7A45', letterSpacing: '0.05em' }}>{cat.count}</p>
            <div style={{ marginTop: 18, fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: '0.18em', color: '#D4AF37' }}>EXPLORE →</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
