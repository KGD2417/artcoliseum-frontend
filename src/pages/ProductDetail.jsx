import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const PRODUCTS = {
  default: {
    title: "Solstice in Obsidian",
    artist: "Julian Voss",
    year: "2023",
    price: "$42,500.00",
    badge: "PRIVATE COLLECTION",
    images: ["src/assets/i4.png", "src/assets/i6.png", "src/assets/i2.png", "src/assets/i1.png"],
    description: 'A masterwork of tactile minimalism, "Solstice in Obsidian" explores the intersection of celestial events and terrestrial silence. Each stroke of genuine 24k gold leaf is applied during the first hour of daylight over three lunar cycles.',
    medium: "Oil & 24k Gold on Linen",
    dimensions: "180 x 140 cm",
    availability: "Available for Inquiry",
    certificate: "Digital Ledger Authenticity",
    artistImg: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80",
    artistBio: "Based in Berlin, Voss's work has been featured in the Tate Modern and private collections across six continents. His process involves extreme isolation and traditional alchemy.",
    quote: '"My work is a dialogue with the unseen. I use gold not as a symbol of wealth, but as a capture of light in its most primal, static form."',
  },
};

const RELATED = [
  { id: "rel-1", title: "SILVER RAIN NO. 4",  artist: "JULIAN VOSS",   price: "$18,200", img: "src/assets/i5.png" },
  { id: "rel-2", title: "NEBULA IN REPOSE",   artist: "JULIAN VOSS",   price: "$24,500", img: "src/assets/i3.png" },
  { id: "rel-3", title: "ZENITH HORIZON",     artist: "JULIAN VOSS",   price: "$31,000", img: "src/assets/i7.png" },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = PRODUCTS[id] || PRODUCTS.default;
  const [activeImg, setActiveImg] = useState(0);
  const [favorited, setFavorited] = useState(false);

  return (
    <section style={{ padding: "100px 24px 80px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 56 }} className="pd-grid">
        {/* gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div style={{
            position: "relative", width: "100%", aspectRatio: "1/1",
            borderRadius: 8, overflow: "hidden",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(212,175,55,0.15)",
          }}>
            <img src={product.images[activeImg]} alt={product.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 14, right: 14, display: "flex", gap: 10 }}>
              <CircleBtn>🔍</CircleBtn>
              <CircleBtn onClick={() => navigate("/ar")}>✨</CircleBtn>
            </div>
          </div>
          {/* thumbs */}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            {product.images.map((img, i) => (
              <div key={i}
                onClick={() => setActiveImg(i)}
                style={{
                  flex: 1, aspectRatio: "1/1",
                  border: activeImg === i ? "1px solid #D4AF37" : "1px solid rgba(212,175,55,0.15)",
                  borderRadius: 4, overflow: "hidden", cursor: "pointer",
                }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "#D4AF37" }}>{product.badge}</span>
            <button
              onClick={() => setFavorited(v => !v)}
              style={{
                width: 38, height: 38, borderRadius: "50%",
                background: "transparent", border: "1px solid rgba(212,175,55,0.25)",
                color: favorited ? "#D4AF37" : "rgba(200,191,160,0.55)", cursor: "pointer",
                fontSize: 14,
              }}>♥</button>
          </div>

          <h1 style={{
            fontFamily: "'Cormorant Garamond',serif", fontSize: 48, fontWeight: 700,
            color: "#fff", lineHeight: 1.05, textTransform: "uppercase", marginBottom: 12,
          }}>{product.title}</h1>

          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "rgba(200,191,160,0.8)", marginBottom: 20 }}>
            {product.artist}, {product.year}
          </div>

          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 700, color: "#D4AF37", marginBottom: 28 }}>
            {product.price}
          </div>

          <div style={{ height: 1, background: "rgba(212,175,55,0.18)", margin: "10px 0 22px" }} />

          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 10 }}>THE NARRATIVE</div>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", lineHeight: 1.75, marginBottom: 24 }}>
            {product.description}
          </p>

          {/* meta grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28, paddingTop: 22, borderTop: "1px solid rgba(212,175,55,0.18)" }}>
            <Meta label="MEDIUM"       value={product.medium} />
            <Meta label="DIMENSIONS"   value={product.dimensions} />
            <Meta label="AVAILABILITY" value={<span><span style={{ color: "#4ade80" }}>● </span>{product.availability}</span>} />
            <Meta label="CERTIFICATE"  value={product.certificate} />
          </div>

          {/* CTAs */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/checkout")}
            style={{
              width: "100%", padding: "16px",
              background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
              color: "#111", fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.2em",
              border: "none", borderRadius: 999, cursor: "pointer",
              boxShadow: "0 8px 24px rgba(212,175,55,0.25)", marginBottom: 12,
            }}>BUY NOW</motion.button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
            <button
              onClick={() => navigate("/cart")}
              style={{
                padding: "13px",
                background: "transparent", color: "#e8e0d0",
                fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em",
                border: "1px solid rgba(212,175,55,0.4)", borderRadius: 999, cursor: "pointer",
              }}>ADD TO CART</button>
            <button
              onClick={() => navigate("/ar")}
              style={{
                padding: "13px",
                background: "transparent", color: "#e8e0d0",
                fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em",
                border: "1px solid rgba(212,175,55,0.4)", borderRadius: 999, cursor: "pointer",
              }}>✦ VIEW IN AR</button>
          </div>

          <div style={{
            display: "flex", gap: 12, padding: "14px 16px",
            background: "rgba(212,175,55,0.06)",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: 8,
          }}>
            <span style={{ color: "#D4AF37", fontSize: 16 }}>✓</span>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", color: "#D4AF37" }}>AUREUM GUARANTEE</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.6)", marginTop: 4, lineHeight: 1.5 }}>
                Insured white-glove delivery, expert appraisal documentation, and lifetime curator support.
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* artist block */}
      <div style={{
        marginTop: 70, padding: "44px 36px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(212,175,55,0.12)",
        borderRadius: 12,
        display: "grid", gridTemplateColumns: "180px 1fr", gap: 36, alignItems: "center",
      }} className="pd-artist">
        <img src={product.artistImg} alt={product.artist}
          style={{ width: 180, height: 180, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(212,175,55,0.4)" }} />
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 8 }}>THE ARTIST</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 700, color: "#fff", marginBottom: 14 }}>{product.artist}</h2>
          <div style={{
            fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic",
            fontSize: 16, color: "rgba(200,191,160,0.85)", marginBottom: 14, lineHeight: 1.6,
          }}>{product.quote}</div>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.65)", lineHeight: 1.7, marginBottom: 14 }}>
            {product.artistBio}
          </p>
          <Link to="/artists/elena-vance" style={{
            fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", color: "#D4AF37",
          }}>VIEW FULL MONOGRAPH →</Link>
        </div>
      </div>

      {/* curated recommendations */}
      <div style={{ marginTop: 60, marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 8 }}>CURATED RECOMMENDATIONS</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 700, color: "#fff" }}>More from {product.artist.split(" ").slice(-1)[0]}</h2>
        </div>
        <Link to="/gallery" style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", color: "#D4AF37" }}>Browse All →</Link>
      </div>

      <div style={{
        display: "grid", gap: 20,
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      }}>
        {RELATED.map(r => (
          <motion.div
            key={r.id}
            onClick={() => navigate(`/product/${r.id}`)}
            whileHover={{ y: -4 }}
            style={{ cursor: "pointer" }}>
            <div style={{ width: "100%", aspectRatio: "1/1.05", overflow: "hidden", borderRadius: 6, marginBottom: 10 }}>
              <img src={r.img} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em", color: "#f0e8d8", marginBottom: 4 }}>{r.title}</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.6)" }}>{r.artist} — {r.price}</div>
          </motion.div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .pd-grid    { grid-template-columns: 1fr !important; }
          .pd-artist  { grid-template-columns: 1fr !important; text-align: center; }
          .pd-artist img { margin: 0 auto; }
        }
      `}</style>
    </section>
  );
}

function CircleBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 36, height: 36, borderRadius: "50%",
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)",
      border: "1px solid rgba(212,175,55,0.3)",
      color: "#D4AF37", cursor: "pointer", fontSize: 14,
    }}>{children}</button>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(200,191,160,0.55)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#e8e0d0" }}>{value}</div>
    </div>
  );
}
