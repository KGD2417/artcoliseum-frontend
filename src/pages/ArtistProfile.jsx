import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import i1 from "../assets/i1.png";
import i2 from "../assets/i2.png";
import i3 from "../assets/i3.png";
import i4 from "../assets/i4.png";
import i5 from "../assets/i5.png";
import i6 from "../assets/i6.png";

const ARTISTS = {
  "elena-vance": {
    name: "Elena Vance",
    location: "Florence, Italy",
    image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=600&q=80&auto=format&fit=crop",
    bio: "Based in Florence, Elena Vance explores the intersection of digital abstraction and classical renaissance techniques. Her work serves as a silent dialogue between the tactile history of oil on canvas and the ephemeral nature of generative light. Vance's pieces are held in private collections globally and have been featured in the Venetian Biennale of Digital Arts.",
    tags: ["DIGITAL NEO-CLASSICAL", "FLORENCE, ITALY", "OIL & PROJECTION"],
    period: "2021 — 2024 COLLECTION",
  },
  "elena-rossi":  { name: "Elena Rossi",  location: "Milan, Italy",        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80&auto=format&fit=crop", bio: "Milan-based digital surrealist whose work blends classical techniques with generative algorithms. Rossi's dreamscapes have been exhibited across Europe and Japan.", tags: ["DIGITAL SURREALISM", "MILAN, ITALY", "MIXED MEDIA"], period: "2022 — 2024 COLLECTION" },
  "hideo-tanaka": { name: "Hideo Tanaka", location: "Kyoto, Japan",        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop", bio: "Kinetic sculptor working with metal, glass, and magnetic fields. His installations invite the viewer into a quiet conversation between motion and stillness.",   tags: ["KINETIC SCULPTURE", "KYOTO, JAPAN", "METAL & GLASS"], period: "2020 — 2024 COLLECTION" },
  "aria-voss":    { name: "Aria Voss",    location: "Berlin, Germany",     image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80&auto=format&fit=crop", bio: "Berlin-based artist exploring the subconscious through dreamlike compositions. Voss collaborates with neuroscientists to interpret the architecture of memory.", tags: ["DIGITAL SURREALISM", "BERLIN, GERMANY", "DIGITAL"],   period: "2023 — 2024 COLLECTION" },
  "chen-wei":     { name: "Chen Wei",     location: "Shanghai, China",     image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80&auto=format&fit=crop", bio: "Captures the spiritual essence of nature in expansive oil and ink works that draw on classical Chinese landscape traditions.",                                tags: ["FOREST ETHEREAL", "SHANGHAI, CHINA", "OIL & INK"],     period: "2019 — 2024 COLLECTION" },
  "lena-bach":    { name: "Lena Bach",    location: "Zurich, Switzerland", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80&auto=format&fit=crop", bio: "Contemporary minimalism fused with metallic textures and geometric form. Bach's work is held in the permanent collections of the MoMA and Tate Modern.",     tags: ["GOLD ABSTRACTIONS", "ZURICH", "MIXED MEDIA"],          period: "2020 — 2024 COLLECTION" },
};

/* price = USD number; null = special-case label (Sold / Inquiry / Auction) */
const WORKS = [
  { id: "alch-1", title: "The Alchemist's Study",    medium: "OIL AND GOLD LEAF ON LINEN",        price: null,  label: "Price Upon Request",   img: i1, status: "available" },
  { id: "ghst-2", title: "Ghost of the Renaissance", medium: "MIXED MEDIA ON PANEL",              price: null,  label: "Sold",                 img: i3, status: "sold" },
  { id: "arch-3", title: "Architectural Echo",       medium: "DIGITAL CANVAS GICLÉE",             price: 4200,                                  img: i2, status: "available" },
  { id: "slnc-4", title: "Silence in Motion",        medium: "DIGITAL PROJECTION",                price: 12400,                                 img: i6, status: "available" },
  { id: "cels-5", title: "Celestial Tides",          medium: "ACRYLIC AND RESIN",                 price: 8900,                                  img: i4, status: "available" },
  { id: "frag-6", title: "Fragmented Memory",        medium: "PLASTER AND LIGHT INSTALLATION",    price: null,  label: "Available at Auction", img: i5, status: "auction" },
];


export default function ArtistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const artist = ARTISTS[id] || ARTISTS["elena-vance"];
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: artist.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 1800);
      }
    } catch (_) {}
  };

  const filtered = WORKS.filter(w => {
    if (search.trim()) {
      const t = search.trim().toLowerCase();
      return `${w.title} ${w.medium}`.toLowerCase().includes(t);
    }
    return true;
  });

  return (
    <section style={{ padding: "100px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
      {/* hero */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "minmax(220px, 320px) 1fr",
        gap: 56, alignItems: "center",
        padding: "32px 0 48px",
      }} className="ap-hero">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}
          style={{ width: "100%", aspectRatio: "1/1.1", borderRadius: 6, overflow: "hidden" }}>
          <SafeImage src={artist.image} alt={artist.name} fallbackIndex={0}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: "#D4AF37" }}>FEATURED ARTIST</span>
            <div style={{ flex: 1, maxWidth: 60, height: 1, background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
            <motion.button
              onClick={handleShare}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              title="Copy profile link"
              style={{
                background: "rgba(212,175,55,0.08)",
                border: "1px solid rgba(212,175,55,0.3)",
                color: "#D4AF37",
                width: 36, height: 36, borderRadius: "50%",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", position: "relative",
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {shareCopied && (
                <span style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "#0e0c0a", border: "1px solid rgba(212,175,55,0.3)",
                  color: "#D4AF37", padding: "4px 10px", borderRadius: 4,
                  fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em",
                  whiteSpace: "nowrap",
                }}>LINK COPIED</span>
              )}
            </motion.button>
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(46px,6vw,72px)", fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 22 }}>
            {artist.name}
          </h1>

          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.7)", lineHeight: 1.75, maxWidth: 560, marginBottom: 22 }}>
            {artist.bio}
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
            {artist.tags.map(t => (
              <span key={t} style={{
                fontFamily: "'Raleway',sans-serif", fontSize: 11, letterSpacing: "0.1em",
                color: "rgba(200,191,160,0.75)",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(212,175,55,0.2)",
                padding: "6px 14px", borderRadius: 999,
              }}>{t}</span>
            ))}
          </div>

        </motion.div>
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.25),transparent)", margin: "10px 0 56px" }} />

      {/* selected works */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 700, color: "#fff", lineHeight: 1 }}>Curated Showcase</h2>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", color: "#D4AF37", marginTop: 8 }}>{artist.period}</div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,175,55,0.22)",
            borderRadius: 999,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search works…"
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 12,
                width: 160,
              }}
            />
          </div>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 22,
      }}>
        {filtered.map((w, i) => (
          <motion.div
            key={w.id}
            onClick={() => navigate(`/product/${w.id}`)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            whileHover={{ y: -4 }}
            style={{ cursor: "pointer" }}>
            <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden", borderRadius: 4, position: "relative", marginBottom: 12 }}>
              <SafeImage src={w.img} alt={w.title} fallbackIndex={i}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 600, color: "#f0e8d8" }}>{w.title}</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: "0.12em", color: "rgba(200,191,160,0.55)", marginTop: 4 }}>{w.medium}</div>
            <div style={{
              fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em",
              fontWeight: 600, marginTop: 6,
              color: w.status === "sold" ? "rgba(200,191,160,0.5)" : "#D4AF37",
            }}>{w.status === "sold" ? "SOLD" : w.status === "auction" ? "AT AUCTION" : "ENQUIRE →"}</div>
          </motion.div>
        ))}
      </div>

      {/* registry */}
      <div style={{
        marginTop: 80, padding: "60px 24px",
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(212,175,55,0.12)",
        borderRadius: 12, textAlign: "center",
      }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Collector's Registry</h3>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)", maxWidth: 480, margin: "0 auto 28px" }}>
          Join our private list to receive early access to {artist.name.split(" ")[0]}'s upcoming collection dropping Winter 2026.
        </p>
        <div style={{ display: "flex", justifyContent: "center", maxWidth: 460, margin: "0 auto", gap: 0 }}>
          <input
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="ENTER YOUR EMAIL"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(212,175,55,0.2)",
              padding: "14px 18px",
              color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 12,
              letterSpacing: "0.1em", outline: "none", borderRadius: "8px 0 0 8px",
            }}
          />
          <button style={{
            padding: "0 22px", background: "transparent",
            border: "1px solid rgba(212,175,55,0.3)", borderLeft: "none",
            color: "#D4AF37", fontSize: 18, cursor: "pointer", borderRadius: "0 8px 8px 0",
          }}>→</button>
        </div>
      </div>


      <style>{`
        @media (max-width: 800px) {
          .ap-hero { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
