import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "../components/SafeImage";

const SUBS = {
  paintings: {
    title: "Paintings",
    blurb: "Oil, acrylic, watercolor and mixed-medium works on canvas, panel and linen.",
    items: [
      { slug: "oil",         label: "Oil on Canvas",   count: "920+",  img: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80" },
      { slug: "acrylic",     label: "Acrylic",         count: "640+",  img: "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=800&q=80" },
      { slug: "watercolor",  label: "Watercolor",      count: "320+",  img: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80" },
      { slug: "mixed-media", label: "Mixed Media",     count: "520+",  img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80" },
    ],
  },
  sculptures: {
    title: "Sculptures",
    blurb: "From classical bronze and marble to contemporary kinetic and modular forms.",
    items: [
      { slug: "bronze",  label: "Bronze",      count: "240+", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80" },
      { slug: "marble",  label: "Marble",      count: "180+", img: "https://images.unsplash.com/photo-1565035010268-a3816f98589a?w=800&q=80" },
      { slug: "kinetic", label: "Kinetic",     count: "120+", img: "https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=800&q=80" },
      { slug: "ceramic", label: "Ceramic",     count: "300+", img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80" },
    ],
  },
  photography: {
    title: "Photography",
    blurb: "Fine art, landscape, documentary and abstract photographic works.",
    items: [
      { slug: "fine-art",    label: "Fine Art",     count: "420+", img: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80" },
      { slug: "documentary", label: "Documentary",  count: "260+", img: "https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=800&q=80" },
      { slug: "landscape",   label: "Landscape",    count: "320+", img: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80" },
      { slug: "abstract",    label: "Abstract",     count: "200+", img: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=800&q=80" },
    ],
  },
  digital: {
    title: "Digital",
    blurb: "Digital canvas, generative art, NFTs and AR-ready installations.",
    items: [
      { slug: "generative", label: "Generative",   count: "880+",  img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80" },
      { slug: "nft",        label: "NFT",          count: "1,400+", img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80" },
      { slug: "ar-ready",   label: "AR Ready",     count: "640+",  img: "https://images.unsplash.com/photo-1633437039415-f3d6611db4d5?w=800&q=80" },
      { slug: "ai-assisted",label: "AI Assisted",  count: "520+",  img: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80" },
    ],
  },
  drawings: {
    title: "Drawings",
    blurb: "Charcoal, graphite, pastel and ink studies from emerging masters.",
    items: [
      { slug: "charcoal", label: "Charcoal",  count: "240+", img: "https://images.unsplash.com/photo-1520420097861-e4959843b682?w=800&q=80" },
      { slug: "graphite", label: "Graphite",  count: "180+", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80" },
      { slug: "pastel",   label: "Pastel",    count: "160+", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80" },
      { slug: "ink",      label: "Ink",       count: "370+", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
    ],
  },
  prints: {
    title: "Prints",
    blurb: "Limited-edition fine art prints, etchings, lithographs and giclées.",
    items: [
      { slug: "giclee",     label: "Giclée",       count: "880+", img: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80" },
      { slug: "lithograph", label: "Lithograph",   count: "420+", img: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800&q=80" },
      { slug: "etching",    label: "Etching",      count: "320+", img: "https://images.unsplash.com/photo-1586941962765-d3896cc85ac6?w=800&q=80" },
      { slug: "screen",     label: "Screen Print", count: "480+", img: "https://images.unsplash.com/photo-1486162928267-e6274cb3106f?w=800&q=80" },
    ],
  },
};

export default function SubCategories() {
  const { medium } = useParams();
  const navigate = useNavigate();
  const data = SUBS[medium] || SUBS.paintings;

  return (
    <section style={{ padding: "100px 24px 90px", maxWidth: 1300, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ marginBottom: 38 }}>
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginBottom: 14 }}>
          <Link to="/categories" style={{ color: "rgba(200,191,160,0.55)" }}>Collection</Link>
          <span style={{ margin: "0 8px" }}>›</span>
          <span style={{ color: "#D4AF37" }}>{data.title}</span>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 56, fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 14 }}>
          {data.title}
        </h1>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.6)", maxWidth: 600, lineHeight: 1.7 }}>
          {data.blurb}
        </p>
      </motion.div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 24,
      }}>
        {data.items.map((s, i) => (
          <motion.div
            key={s.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.07 }}
            whileHover={{ y: -6, boxShadow: "0 18px 40px rgba(0,0,0,0.5)" }}
            onClick={() => navigate(`/categories/${medium}/${s.slug}`)}
            style={{
              position: "relative", overflow: "hidden",
              borderRadius: 8, height: 260, cursor: "pointer",
              border: "1px solid rgba(212,175,55,0.15)",
            }}>
            <SafeImage src={s.img} alt={s.label} fallbackIndex={i}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
                       transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.05) 65%)",
            }} />
            <div style={{ position: "absolute", bottom: 18, left: 20, right: 20 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: "#fff" }}>{s.label}</div>
              <div className="num-value" style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, letterSpacing: "0.12em", color: "#D4AF37", marginTop: 4 }}>{s.count} WORKS</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
