import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "../components/Icons";

const ARTISTS_LIST = [
  { id: "elena-vance",   name: "Elena Vance",   role: "DIGITAL NEO-CLASSICAL", bio: "Florence-based painter exploring the intersection of digital abstraction and classical renaissance techniques.", image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80", works: 142 },
  { id: "elena-rossi",   name: "Elena Rossi",   role: "DIGITAL SURREALISM",    bio: "Blends classical techniques with digital innovation to create dreamscapes.",                                  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80", works: 98 },
  { id: "hideo-tanaka",  name: "Hideo Tanaka",  role: "KINETIC SCULPTURE",     bio: "Creates movement and light using metal, glass, and magnetic forces.",                                          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", works: 67 },
  { id: "aria-voss",     name: "Aria Voss",     role: "DIGITAL SURREALISM",    bio: "Dreamlike compositions exploring the subconscious and human consciousness.",                                  image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80", works: 55 },
  { id: "chen-wei",      name: "Chen Wei",      role: "FOREST ETHEREAL",       bio: "Captures the spiritual essence of nature in expansive oil and ink works.",                                    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", works: 89 },
  { id: "lena-bach",     name: "Lena Bach",     role: "GOLD ABSTRACTIONS",     bio: "Contemporary minimalism fused with metallic textures and geometric form.",                                    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80", works: 73 },
];

export default function Artists() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return ARTISTS_LIST;
    return ARTISTS_LIST.filter(a =>
      `${a.name} ${a.role} ${a.bio}`.toLowerCase().includes(t)
    );
  }, [search]);

  return (
    <section style={{ padding: "120px 24px 100px", maxWidth: 1400, margin: "0 auto" }}>
      <motion.div
        style={{ textAlign: "center", marginBottom: 32 }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <div className="gold-rule" style={{ justifyContent: "center" }}>
          <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }} />
          <span className="grt">Our Collective</span>
          <div className="grl" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
        </div>
        <h2 className="section-heading">
          <span className="bold-white">Featured</span> <em>Artists</em>
        </h2>
      </motion.div>

      {/* search bar */}
      <motion.div
        className="artist-search"
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
        <span className="artist-search-icon"><SearchIcon size={16} /></span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search artists by name, style, or bio…"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "rgba(200,191,160,0.55)", fontSize: 18, padding: 0,
            }}>×</button>
        )}
      </motion.div>

      {/* Become Artist CTA banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          gap: 18, flexWrap: "wrap",
          padding: "22px 30px", marginBottom: 50, borderRadius: 12,
          background: "linear-gradient(135deg, rgba(212,175,55,0.10), rgba(212,175,55,0.02))",
          border: "1px solid rgba(212,175,55,0.25)",
        }}>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 6 }}>FOR ARTISTS</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "#fff", fontWeight: 600 }}>
            Showcase your work to a global community of collectors.
          </div>
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)", marginTop: 6 }}>
            Apply to join our curated artist network and access the Artist Portal.
          </div>
        </div>
        <motion.button
          className="btn-gold-main"
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/become-artist")}
          style={{ padding: "14px 28px", fontSize: 12 }}>
          BECOME AN ARTIST
        </motion.button>
      </motion.div>

      {filtered.length === 0 ? (
        <div style={{
          padding: "60px 30px", textAlign: "center",
          border: "1px dashed rgba(212,175,55,0.2)", borderRadius: 12,
        }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: "#fff", marginBottom: 10 }}>No artists match "{search}"</div>
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)" }}>
            Try a different name or style.
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 30,
        }}>
          {filtered.map((artist, i) => (
            <motion.div
              key={artist.id}
              onClick={() => navigate(`/artists/${artist.id}`)}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(212,175,55,0.15)",
                borderRadius: 8, overflow: "hidden", cursor: "pointer",
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
              whileHover={{ y: -6, boxShadow: "0 20px 50px rgba(0,0,0,0.45)", borderColor: "rgba(212,175,55,0.35)" }}>
              <div style={{ position: "relative", overflow: "hidden", height: 280 }}>
                <motion.img
                  src={artist.image}
                  alt={artist.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.5 }}
                />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: "50%",
                  background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                }} />
              </div>
              <div style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 600, marginBottom: 8 }}>{artist.name}</h3>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.15em", color: "#D4AF37", marginBottom: 12 }}>{artist.role}</div>
                <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", lineHeight: 1.6, marginBottom: 16 }}>{artist.bio}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="num-value" style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#8B7A45" }}>{artist.works} works available</div>
                  <motion.button
                    style={{
                      fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em",
                      padding: "8px 16px", borderRadius: 999,
                      border: "1px solid rgba(212,175,55,0.4)",
                      background: "transparent", color: "#D4AF37", cursor: "pointer",
                    }}
                    whileHover={{ background: "rgba(212,175,55,0.1)", scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}>
                    VIEW PROFILE
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
