import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import ArtworkHoverCard from "../components/ArtworkHoverCard";
import { SearchIcon } from "../components/Icons";
import { api, adaptArtwork } from "../utils/api";
import { useLocale } from "../context/Locale";

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
  const { formatPrice } = useLocale();
  // `/gallery` carries the medium as a query param (?medium=sculpture), not a path param.
  const params = useParams();
  const [searchParams] = useSearchParams();
  const medium = params.medium || searchParams.get("medium") || undefined;
  const sub = params.sub;
  const [styleFilter, setStyleFilter] = useState("Abstract");
  const [catFilter, setCatFilter]     = useState("sculpture");
  const [sizeFilter, setSizeFilter]   = useState("medium");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    api.catalog
      .artworks(medium ? { category: medium } : {})
      .then((rows) => { if (!cancelled) setItems(rows.map(adaptArtwork)); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, [medium]);

  const filtered = items.filter(it => {
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
              <Link to="/categories" style={{ color: "rgba(200,191,160,0.55)" }}>Collection</Link>
              <span style={{ margin: "0 8px" }}>›</span>
              <Link to={`/categories/${medium}`} style={{ color: "rgba(200,191,160,0.55)" }}>{medium}</Link>
              {sub && <><span style={{ margin: "0 8px" }}>›</span><span style={{ color: "#D4AF37", textTransform: "capitalize" }}>{sub.replace("-"," ")}</span></>}
            </div>
          )}
          {!sub && <>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 8 }}>CURATION VOL. IV</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 42, fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 12 }}>
              The Modernists & The Muses
            </h1>
            <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)", maxWidth: 560, lineHeight: 1.7 }}>
              Explore our strictly curated collection of contemporary masterpieces. Each piece has been selected for its unique perspective on the intersection of physical medium and digital soul.
            </p>
          </>}
        </div>

        <div style={{
          display: "flex", alignItems: "center",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: 8, padding: "0 14px", height: 44, width: "100%", maxWidth: 280,
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
          <span style={{ color: "rgba(200,191,160,0.5)", display: "flex" }}><SearchIcon size={14} /></span>
        </div>
      </motion.div>

      {!sub && (
        <button
          className={`gal-filter-toggle ${filtersOpen ? "is-open" : ""}`}
          onClick={() => setFiltersOpen(v => !v)}>
          {filtersOpen ? "HIDE FILTERS" : "SHOW FILTERS & SORT"}
        </button>
      )}

      <div style={{ display: "grid", gridTemplateColumns: sub ? "1fr" : "200px 1fr", gap: 36 }} className="gal-grid">
        {/* sidebar filters — only shown on main gallery */}
        {!sub && (
          <aside className={`gal-sidebar ${filtersOpen ? "is-open" : ""}`}>
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
        )}

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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.07 }}
                style={{ cursor: "pointer" }}>
                {/* Thumbnail wrapped in hover card */}
                <ArtworkHoverCard artwork={item}>
                  <div style={{
                    width: "100%", aspectRatio: "1/1",
                    borderRadius: 6, overflow: "hidden",
                    background: "rgba(255,255,255,0.03)",
                  }}>
                    <SafeImage
                      src={item.img}
                      alt={item.title}
                      fallbackIndex={i}
                      style={{
                        width: "100%", height: "100%", objectFit: "cover", display: "block",
                        transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                    />
                  </div>
                </ArtworkHoverCard>

                {/* Card footer — title, artist, price/enquire link */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 600, color: "#f0e8d8" }}>{item.title}</div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)", marginTop: 4 }}>{item.artist}</div>
                    {/* Predefined works show their fixed price; customizable works are priced after enquiry */}
                    {item.customizable === false && item.price > 0 && (
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700, color: "#D4AF37", marginTop: 4 }}>
                        {formatPrice(item.price)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/product/${item.id}`)}
                    style={{
                      background: "transparent",
                      border: "none",
                      fontFamily: "'Cinzel',serif",
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      fontWeight: 600,
                      color: "#D4AF37",
                      whiteSpace: "nowrap",
                      alignSelf: "center",
                      cursor: "pointer",
                      padding: 0,
                    }}>
                    {item.customizable === false ? "VIEW →" : "ENQUIRE →"}
                  </button>
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
