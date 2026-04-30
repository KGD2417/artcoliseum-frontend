import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import { supabase } from "../utils/supabase";

const FALLBACK_CATEGORIES = [
  {
    slug: "paintings",
    name: "Paintings",
    description: "Oil, Acrylic & Watercolor masterpieces",
    count: "2,400+ works",
    img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=900&q=80&auto=format&fit=crop",
  },
  {
    slug: "sculptures",
    name: "Sculptures",
    description: "Bronze, Marble & Mixed Media",
    count: "840+ works",
    img: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=900&q=80&auto=format&fit=crop",
  },
  {
    slug: "photography",
    name: "Photography",
    description: "Fine Art & Documentary",
    count: "1,200+ works",
    img: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=900&q=80&auto=format&fit=crop",
  },
  {
    slug: "digital",
    name: "Digital",
    description: "NFT & Generative Canvas",
    count: "3,600+ works",
    img: "https://images.unsplash.com/photo-1633437039415-f3d6611db4d5?w=900&q=80&auto=format&fit=crop",
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
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("label");

        if (error) throw error;

        if (data && data.length > 0) {
          const transformed = data.map((cat) => ({
            slug: cat.slug || cat.label.toLowerCase().replace(/\s+/g, "-"),
            name: cat.label,
            description: cat.description || "",
            count: cat.artwork_count
              ? `${cat.artwork_count}+ works`
              : "0 works",
            img:
              cat.image_url ||
              FALLBACK_CATEGORIES.find((f) => f.slug === cat.slug)?.img ||
              "",
          }));
          setCategories(transformed);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const visible = showAll ? categories : categories.slice(0, 4);

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
          <span className="bold-white">Marketplace</span> <em>Mediums</em>
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
