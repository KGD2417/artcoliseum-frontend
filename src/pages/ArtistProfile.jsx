import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import ChatModal from "../components/ChatModal";
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

const FILTERS = [
  { id: "all",       label: "ALL WORKS" },
  { id: "available", label: "AVAILABLE" },
  { id: "archive",   label: "ARCHIVE" },
];

export default function ArtistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const artist = ARTISTS[id] || ARTISTS["elena-vance"];
  const [filter, setFilter] = useState("all");
  const [email, setEmail] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const filtered = WORKS.filter(w =>
    filter === "all" ? true : filter === "available" ? w.status === "available" : w.status !== "available"
  );

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

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => setChatOpen(true)}
              style={{
                padding: "13px 32px",
                background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                color: "#111",
                fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em",
                border: "none",
                borderRadius: 999, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 10,
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              CHAT WITH {artist.name.split(" ")[0].toUpperCase()}
            </motion.button>
          </div>
        </motion.div>
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.25),transparent)", margin: "10px 0 56px" }} />

      {/* selected works */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 700, color: "#fff", lineHeight: 1 }}>Selected Works</h2>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", color: "#D4AF37", marginTop: 8 }}>{artist.period}</div>
        </div>
        <div style={{ display: "flex", gap: 22 }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                background: "transparent", border: "none", cursor: "pointer",
                fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em",
                color: filter === f.id ? "#D4AF37" : "rgba(200,191,160,0.55)",
                paddingBottom: 4,
                borderBottom: filter === f.id ? "1px solid #D4AF37" : "1px solid transparent",
              }}>{f.label}</button>
          ))}
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

      <ChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title={artist.name}
        subtitle={artist.location}
        avatar={artist.image}
        intro={[
          `Hi — ${artist.name.split(" ")[0]} here. Thanks for reaching out.`,
          "Tell me a bit about what drew you to my work — happy to share more about any piece.",
        ]}
        botReplies={[
          "That's a beautiful question. The piece you're asking about took shape over several months in the studio.",
          "I'd love to share the story behind it — would you like me to send a short studio film?",
          "Yes, that one is still available. I usually arrange a private viewing for serious enquiries.",
          "Thank you — feel free to ask anything else, no pressure.",
        ]}
      />

      <style>{`
        @media (max-width: 800px) {
          .ap-hero { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
