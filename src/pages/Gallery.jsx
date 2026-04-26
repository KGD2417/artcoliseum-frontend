import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

const GALLERY_ITEMS = [
  { id: "p1", title: "Ethereal Horizon",   medium: "Acrylic on Canvas", artist: "MARCUS THOMAS", year: "2024", price: "$12,400", priceN: 12400, size: "medium", style: "Abstract",     category: "oil",       img: "src/assets/i1.png" },
  { id: "p2", title: "Fractured Silence",  medium: "Mixed Media",       artist: "ELENA VANCE",   year: "2023", price: "$8,900",  priceN: 8900,  size: "medium", style: "Abstract",     category: "mixed",     img: "src/assets/i7.png" },
  { id: "p3", title: "Obsidian Flow",      medium: "Acrylic & Oil",     artist: "JULIAN ARIS",   year: "2024", price: "$15,500", priceN: 15500, size: "medium", style: "Abstract",     category: "oil",       img: "src/assets/i6.png" },
  { id: "p4", title: "The Infinite Stair", medium: "Sculpture",         artist: "SOREN KLEIN",   year: "2024", price: "$4,200",  priceN: 4200,  size: "small",  style: "Minimalism",   category: "sculpture", img: "src/assets/i3.png" },
  { id: "p5", title: "Cosmic Flow",        medium: "Mixed Media",       artist: "HIDEO TANAKA",  year: "2024", price: "$1,950",  priceN: 1950,  size: "small",  style: "Impressionist", category: "mixed",    img: "src/assets/i6.png" },
  { id: "p6", title: "The Golden Tree",    medium: "Oil on Canvas",     artist: "CHEN WEI",      year: "2024", price: "$2,100",  priceN: 2100,  size: "medium", style: "Impressionist", category: "oil",      img: "src/assets/i4.png" },
  { id: "p7", title: "Whispers of Silence", medium: "Oil on Canvas",     artist: "LENA BACH",    year: "2025", price: "$1,700",  priceN: 1700,  size: "small",  style: "Minimalism",   category: "oil",       img: "src/assets/i5.png" },
  { id: "p8", title: "Renaissance Study",  medium: "Oil on Panel",      artist: "ELENA ROSSI",   year: "2023", price: "$5,800",  priceN: 5800,  size: "medium", style: "Digital Fusion", category: "oil",     img: "src/assets/i8.png" },
  { id: "p9", title: "Ocean Depths",       medium: "Digital Print",     artist: "HIDEO TANAKA",  year: "2024", price: "$1,200",  priceN: 1200,  size: "small",  style: "Digital Fusion", category: "digital", img: "src/assets/i7.png" },
];

const STYLES = [
  { label: "Minimalism",     count: "12" },
  { label: "Abstract",       count: "08" },
  { label: "Impressionist",  count: "15" },
  { label: "Digital Fusion", count: "04" },
];

const CATEGORIES = [
  { id: "oil",       label: "OIL" },
  { id: "digital",   label: "DIGITAL" },
  { id: "sculpture", label: "SCULPTURE" },
  { id: "mixed",     label: "MIXED MEDIA" },
];

const SIZES = [
  { id: "small",  label: 'SMALL ( < 24" )' },
  { id: "medium", label: 'MEDIUM ( 24" - 48" )' },
  { id: "large",  label: 'LARGE ( > 48" )' },
];

export default function Gallery() {
  const navigate = useNavigate();
  const { medium, sub } = useParams();
  const [styleFilter, setStyleFilter] = useState("Abstract");
  const [catFilter, setCatFilter]     = useState("sculpture");
  const [sizeFilter, setSizeFilter]   = useState("medium");
  const [search, setSearch] = useState("");

  const filtered = GALLERY_ITEMS.filter(it => {
    if (search && !`${it.title} ${it.artist}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <section style={{ padding: "100px 24px 90px", maxWidth: 1300, margin: "0 auto" }}>
      {/* breadcrumb + header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ marginBottom: 38, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 24, alignItems: "flex-end" }}>
        <div>
          {medium && (
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginBottom: 14 }}>
              <Link to="/categories" style={{ color: "rgba(200,191,160,0.55)" }}>Marketplace</Link>
              <span style={{ margin: "0 8px" }}>›</span>
              <Link to={`/categories/${medium}`} style={{ color: "rgba(200,191,160,0.55)" }}>{medium}</Link>
              {sub && <><span style={{ margin: "0 8px" }}>›</span><span style={{ color: "#D4AF37", textTransform: "capitalize" }}>{sub.replace("-"," ")}</span></>}
            </div>
          )}
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 8 }}>CURATION VOL. IV</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 42, fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 12 }}>
            The Modernists & The Muses
          </h1>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)", maxWidth: 560, lineHeight: 1.7 }}>
            Explore our strictly curated collection of contemporary masterpieces. Each piece has been selected for its unique perspective on the intersection of physical medium and digital soul.
          </p>
        </div>

        <div style={{
          display: "flex", alignItems: "center",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: 8, padding: "0 14px", height: 44, width: 280, maxWidth: "100%",
        }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="SEARCH THE ARCHIVE..."
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#e8e0d0", fontFamily: "'Raleway',sans-serif",
              fontSize: 11, letterSpacing: "0.12em",
            }}
          />
          <span style={{ color: "rgba(200,191,160,0.5)" }}>🔍</span>
        </div>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 36 }} className="gal-grid">
        {/* sidebar filters */}
        <aside>
          <FilterSection title="STYLE">
            {STYLES.map(s => (
              <button
                key={s.label}
                onClick={() => setStyleFilter(s.label)}
                style={{
                  display: "flex", justifyContent: "space-between", width: "100%",
                  padding: "8px 0", background: "transparent", border: "none",
                  cursor: "pointer", textAlign: "left",
                  fontFamily: "'Raleway',sans-serif", fontSize: 13,
                  color: styleFilter === s.label ? "#D4AF37" : "rgba(200,191,160,0.7)",
                }}>
                <span>{s.label}</span>
                <span style={{ fontSize: 11, opacity: 0.7 }}>{s.count}</span>
              </button>
            ))}
          </FilterSection>

          <FilterSection title="CATEGORY">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCatFilter(c.id)}
                  style={{
                    fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.12em",
                    padding: "6px 12px", borderRadius: 999, cursor: "pointer",
                    border: catFilter === c.id ? "1px solid #D4AF37" : "1px solid rgba(212,175,55,0.25)",
                    background: catFilter === c.id ? "#D4AF37" : "transparent",
                    color: catFilter === c.id ? "#111" : "rgba(200,191,160,0.7)",
                  }}>{c.label}</button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="PRICE RANGE">
            <input type="range" min="0" max="100" defaultValue="55"
              style={{ width: "100%", accentColor: "#D4AF37" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.6)", marginTop: 6 }}>
              <span>$2,500</span><span>$15,000+</span>
            </div>
          </FilterSection>

          <FilterSection title="SIZE">
            {SIZES.map(s => (
              <label
                key={s.id}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer",
                  fontFamily: "'Raleway',sans-serif", fontSize: 12,
                  color: sizeFilter === s.id ? "#D4AF37" : "rgba(200,191,160,0.7)",
                }}>
                <input
                  type="radio" name="size" checked={sizeFilter === s.id}
                  onChange={() => setSizeFilter(s.id)}
                  style={{ accentColor: "#D4AF37" }}
                />
                {s.label}
              </label>
            ))}
          </FilterSection>
        </aside>

        {/* grid */}
        <div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 22,
          }}>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.07 }}
                whileHover={{ y: -6 }}
                style={{ cursor: "pointer" }}>
                <div style={{
                  width: "100%", aspectRatio: "1/1",
                  borderRadius: 6, overflow: "hidden",
                  background: "rgba(255,255,255,0.03)",
                }}>
                  <img src={item.img} alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
                             transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 600, color: "#f0e8d8" }}>{item.title}</div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)", marginTop: 4 }}>{item.artist}</div>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700, color: "#D4AF37" }}>{item.price}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* footer */}
          <div style={{
            margin: "60px auto 0", maxWidth: 360, textAlign: "center",
            paddingTop: 30, borderTop: "1px solid rgba(212,175,55,0.18)",
          }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", color: "rgba(200,191,160,0.55)", marginBottom: 14 }}>
              SHOWING 24 OF 152 MASTERPIECES
            </div>
            <button style={{
              padding: "12px 26px", background: "transparent",
              border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37",
              fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em",
              borderRadius: 999, cursor: "pointer",
            }}>LOAD MORE ARTWORKS ⌄</button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .gal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

function FilterSection({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid rgba(212,175,55,0.18)" }}>
        {title}
      </div>
      {children}
    </div>
  );
}
