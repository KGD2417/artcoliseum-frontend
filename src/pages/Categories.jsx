import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import { api } from "../utils/api";
import m1 from "../assets/mediums/m1.png";
import m2 from "../assets/mediums/m2.png";
import m3 from "../assets/mediums/m3.png";
import m4 from "../assets/mediums/m4.png";

const FALLBACK_CATEGORIES = [
  {
    slug: "paintings",
    name: "Paintings",
    description: "Oil, Acrylic & Watercolor masterpieces",
    count: "2,400+ works",
    img: m1,
  },
  {
    slug: "sculptures",
    name: "Sculptures",
    description: "Bronze, Marble & Mixed Media",
    count: "840+ works",
    img: m2,
  },
  {
    slug: "photography",
    name: "Photography",
    description: "Fine Art & Documentary",
    count: "1,200+ works",
    img: m3,
  },
  {
    slug: "digital",
    name: "Digital",
    description: "NFT & Generative Canvas",
    count: "3,600+ works",
    img: m4,
  },
  {
    slug: "drawings",
    name: "Drawings",
    description: "Charcoal, Pastel & Ink",
    count: "950+ works",
    img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&q=80&auto=format&fit=crop",
  },
  {
    slug: "prints",
    name: "Prints",
    description: "Limited Edition Fine Art Prints",
    count: "2,100+ works",
    img: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=900&q=80&auto=format&fit=crop",
  },
];

export default function Categories() {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const assetBySlug = { paintings: m1, sculptures: m2, sculpture: m2, photography: m3, digital: m4, oil: m1 };
    (async () => {
      try {
        const [cats, arts] = await Promise.all([
          api.catalog.categories(),
          api.catalog.artworks({}),
        ]);
        if (cancelled) return;
        const mains = (cats || []).filter((c) => c.kind === "main");
        if (!mains.length) return; // keep fallback if catalog is empty
        const mapped = mains.map((c) => {
          const inCat = (arts || []).filter((a) => a.category_id === c.id);
          const withImg = inCat.find((a) => a.images && a.images.length);
          return {
            slug: c.id,
            name: c.label,
            description: "",
            count: `${inCat.length} work${inCat.length === 1 ? "" : "s"}`,
            img: withImg?.images?.[0] || assetBySlug[c.id] || m1,
          };
        });
        setCategories(mapped);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [search, setSearch] = useState("");
  const filteredCats = categories.filter((c) =>
    !search.trim()
      ? true
      : `${c.name} ${c.description}`.toLowerCase().includes(search.trim().toLowerCase())
  );
  const visible = showAll ? filteredCats : filteredCats.slice(0, 4);

  return (
    <section
      style={{ padding: "120px 32px 100px", maxWidth: 1280, margin: "0 auto" }}>
      <motion.div
        style={{ textAlign: "center", marginBottom: 60 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}>
        <div className="gold-rule" style={{ justifyContent: "center" }}>
          <div
            className="grl"
            style={{
              background: "linear-gradient(90deg, transparent, #D4AF37)",
            }}
          />
          <span className="grt">Browse by Medium</span>
          <div
            className="grl"
            style={{
              background: "linear-gradient(90deg, #D4AF37, transparent)",
            }}
          />
        </div>
        <h2 className="section-heading">
          <span className="bold-white">Collection</span> <em>Mediums</em>
        </h2>
        <p
          style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 14,
            color: "rgba(200,191,160,0.6)",
            maxWidth: 540,
            margin: "14px auto 0",
            lineHeight: 1.7,
          }}>
          Choose a medium to explore its sub-categories and curated collections.
        </p>
      </motion.div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 18px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(212,175,55,0.25)",
          borderRadius: 999, width: "100%", maxWidth: 460,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mediums…"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13,
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 22,
        }}>
        {visible.map((cat, i) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.07 }}
            whileHover={{ y: -6, boxShadow: "0 22px 50px rgba(0,0,0,0.55)" }}
            onClick={() => navigate(`/categories/${cat.slug}`)}
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              cursor: "pointer",
              border: "1px solid rgba(212,175,55,0.18)",
              aspectRatio: "4 / 5",
              background: "#0e0c0a",
            }}>
            <SafeImage
              src={cat.img}
              alt={cat.name}
              fallbackIndex={i}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.06)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.35) 50%, rgba(8,8,8,0.05) 100%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "0.02em",
                  marginBottom: 6,
                }}>
                {cat.name}
              </h3>
              <p
                style={{
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 12,
                  color: "rgba(220,210,190,0.75)",
                  marginBottom: 10,
                }}>
                {cat.description}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <span
                  className="num-value"
                  style={{
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 11,
                    color: "#D4AF37",
                    letterSpacing: "0.08em",
                  }}>
                  {cat.count}
                </span>
                <span
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    color: "#D4AF37",
                  }}>
                  EXPLORE →
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {categories.length > 4 && (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAll((v) => !v)}
            style={{
              padding: "13px 30px",
              background: "transparent",
              color: "#D4AF37",
              border: "1px solid rgba(212,175,55,0.4)",
              fontFamily: "'Cinzel',serif",
              fontSize: 11,
              letterSpacing: "0.18em",
              borderRadius: 999,
              cursor: "pointer",
            }}>
            {showAll ? "SHOW LESS" : `VIEW ALL ${categories.length} MEDIUMS`}
          </motion.button>
        </div>
      )}
    </section>
  );
}
