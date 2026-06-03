import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "../components/Icons";
import { SkeletonGrid } from "../components/ui/Skeleton";
import { api } from "../utils/api";

const DEMO_ARTISTS = [
  {
    id: "elena-vance",
    name: "Elena Vance",
    role: "Neo-Classical Oil Painter · Florence, Italy",
    bio: "Based in Florence, Elena Vance explores the intersection of digital abstraction and classical renaissance techniques. Her work serves as a silent dialogue between the tactile history of oil on canvas and the ephemeral nature of generative light. Vance's pieces are held in private collections globally and have been featured in the Venetian Biennale of Digital Arts.",
    image:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=600&q=80&auto=format&fit=crop",
    works: 14,
  },
  {
    id: "elena-rossi",
    name: "Elena Rossi",
    role: "Digital Surrealist · Milan, Italy",
    bio: "Milan-based digital surrealist whose work blends classical techniques with generative algorithms. Rossi's dreamscapes have been exhibited across Europe and Japan, earning her recognition as one of Italy's most provocative contemporary voices.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80&auto=format&fit=crop",
    works: 9,
  },
  {
    id: "hideo-tanaka",
    name: "Hideo Tanaka",
    role: "Kinetic Sculptor · Kyoto, Japan",
    bio: "Kinetic sculptor working with metal, glass, and magnetic fields. His installations invite the viewer into a quiet conversation between motion and stillness, drawing on Zen aesthetics and contemporary physics in equal measure.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop",
    works: 7,
  },
  {
    id: "aria-voss",
    name: "Aria Voss",
    role: "Subconscious Cartographer · Berlin, Germany",
    bio: "Berlin-based artist exploring the subconscious through dreamlike compositions. Voss collaborates with neuroscientists to interpret the architecture of memory, translating brainwave data into sweeping oil and digital hybrid works.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80&auto=format&fit=crop",
    works: 11,
  },
  {
    id: "chen-wei",
    name: "Chen Wei",
    role: "Ink & Oil Landscape Painter · Shanghai, China",
    bio: "Captures the spiritual essence of nature in expansive oil and ink works that draw on classical Chinese landscape traditions. Wei's monumental canvases hang in the Shanghai Museum of Contemporary Art and several major European institutions.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80&auto=format&fit=crop",
    works: 18,
  },
  {
    id: "lena-bach",
    name: "Lena Bach",
    role: "Geometric Minimalist · Zurich, Switzerland",
    bio: "Contemporary minimalism fused with metallic textures and geometric form. Bach's work is held in the permanent collections of the MoMA and Tate Modern, and her 2023 solo show at Art Basel was named one of the decade's most significant exhibitions.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80&auto=format&fit=crop",
    works: 22,
  },
  {
    id: "marcus-thomas",
    name: "Marcus Thomas",
    role: "Figurative Oil Painter · London, UK",
    bio: "London-based figurative painter whose work references the psychological directness of Lucian Freud alongside the tonal sensitivity of the old masters. Thomas's studio practice centres on the human body as a site of narrative, vulnerability, and beauty.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80&auto=format&fit=crop",
    works: 13,
  },
  {
    id: "claire-bouchard",
    name: "Claire Bouchard",
    role: "Plein-Air Landscape Painter · Provence, France",
    bio: "Working outdoors in the tradition of the Impressionists, Bouchard's luminous landscapes capture the changing light of the French countryside. Her layered glazes of cadmium yellow and viridian have earned her a devoted following among collectors across North America and Europe.",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80&auto=format&fit=crop",
    works: 16,
  },
  {
    id: "ingrid-halvor",
    name: "Ingrid Halvor",
    role: "Maritime Oil Painter · Bergen, Norway",
    bio: "Norwegian painter whose seascapes distil the drama of the North Atlantic into compositions of extraordinary emotional power. Working on location in all weathers, Halvor's oils capture the horizon line as a meditation on scale, solitude, and the sublime.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80&auto=format&fit=crop",
    works: 10,
  },
  {
    id: "julian-aris",
    name: "Julian Aris",
    role: "Abstract Expressionist · Buenos Aires, Argentina",
    bio: "Dark pigments pour and solidify across Aris's canvases, channelling the raw energy of volcanic geology and Argentinian tango alike. His large-format works have been acquired by the Museo Nacional de Bellas Artes and collectors across Latin America.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80&auto=format&fit=crop",
    works: 8,
  },
  {
    id: "marta-voss",
    name: "Marta Voss",
    role: "Psychological Realist · Prague, Czech Republic",
    bio: "Voss paints domestic interiors as psychological landscapes — rooms in which colour becomes emotion and space becomes memory. Her meticulous oil technique, developed across a decade of study in Prague and Vienna, produces surfaces of uncanny stillness.",
    image:
      "https://images.unsplash.com/photo-1521252659862-eec69941b071?w=600&q=80&auto=format&fit=crop",
    works: 12,
  },
  {
    id: "henry-ashford",
    name: "Henry Ashford",
    role: "Atmospheric Impasto Painter · Edinburgh, Scotland",
    bio: "Ashford's turbulent cloud formations and storm-lit valleys are rendered in thick impasto that gives each canvas the physical urgency of the landscapes that inspired them. A graduate of the Edinburgh College of Art, his work has been shown at the Royal Scottish Academy.",
    image:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&q=80&auto=format&fit=crop",
    works: 6,
  },
];

export default function Artists() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.catalog
      .artists()
      .then((rows) => {
        if (cancelled) return;
        setArtists(rows.map((a) => ({ ...a, image: a.image_url, works: a.works_count })));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setArtists(DEMO_ARTISTS); // fallback to bundled demo data if API is down
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return artists;
    return artists.filter((a) =>
      `${a.name} ${a.role} ${a.bio}`.toLowerCase().includes(t),
    );
  }, [search, artists]);

  return (
    <section
      style={{ padding: "120px 24px 100px", maxWidth: 1400, margin: "0 auto" }}>
      <motion.div
        style={{ textAlign: "center", marginBottom: 32 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}>
        <div className="gold-rule" style={{ justifyContent: "center" }}>
          <div
            className="grl"
            style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }}
          />
          <span className="grt">Our Collective</span>
          <div
            className="grl"
            style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }}
          />
        </div>
        <h2 className="section-heading">
          <span className="bold-white">Featured</span> <em>Artists</em>
        </h2>
      </motion.div>

      {/* search bar */}
      <motion.div
        className="artist-search"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}>
        <span className="artist-search-icon">
          <SearchIcon size={16} />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search artists by name, style, or bio…"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(200,191,160,0.55)",
              fontSize: 18,
              padding: 0,
            }}>
            ×
          </button>
        )}
      </motion.div>

      {/* Become Artist CTA banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
          padding: "22px 30px",
          marginBottom: 50,
          borderRadius: 12,
          background:
            "linear-gradient(135deg, rgba(212,175,55,0.10), rgba(212,175,55,0.02))",
          border: "1px solid rgba(212,175,55,0.25)",
        }}>
        <div>
          <div
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 11,
              letterSpacing: "0.18em",
              color: "#D4AF37",
              marginBottom: 6,
            }}>
            FOR ARTISTS
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 22,
              color: "#fff",
              fontWeight: 600,
            }}>
            Showcase your work to a global community of collectors.
          </div>
          <div
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 13,
              color: "rgba(200,191,160,0.6)",
              marginTop: 6,
            }}>
            Apply to join our curated artist network and access the Artist
            Portal.
          </div>
        </div>
        <motion.button
          className="btn-gold-main"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/become-artist")}
          style={{ padding: "14px 28px", fontSize: 12 }}>
          BECOME AN ARTIST
        </motion.button>
      </motion.div>

      {loading ? (
        <SkeletonGrid count={6} minColWidth={260} maxColWidth={320} imageHeight={300} gap={30} />
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: "60px 30px",
            textAlign: "center",
            border: "1px dashed rgba(212,175,55,0.2)",
            borderRadius: 12,
          }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 24,
              color: "#fff",
              marginBottom: 10,
            }}>
            No artists match "{search}"
          </div>
          <div
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 13,
              color: "rgba(200,191,160,0.6)",
            }}>
            Try a different name or style.
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 320px))",
            justifyContent: "center",
            gap: 30,
          }}>
          {filtered.map((artist, i) => (
            <motion.div
              key={artist.id}
              onClick={() => navigate(`/artists/${artist.id}`)}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(212,175,55,0.15)",
                borderRadius: 8,
                overflow: "hidden",
                cursor: "pointer",
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
              whileHover={{
                y: -6,
                boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
                borderColor: "rgba(212,175,55,0.35)",
              }}>
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  height: 280,
                }}>
                <motion.img
                  src={artist.image}
                  alt={artist.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 0.5 }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "50%",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                  }}
                />
              </div>
              <div style={{ padding: 24 }}>
                <h3
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 26,
                    fontWeight: 600,
                    marginBottom: 8,
                  }}>
                  {artist.name}
                </h3>
                <div
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    color: "#D4AF37",
                    marginBottom: 12,
                  }}>
                  {artist.role}
                </div>
                <p
                  style={{
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 13,
                    color: "rgba(200,191,160,0.7)",
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}>
                  {artist.bio}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                  <div
                    className="num-value"
                    style={{
                      fontFamily: "'Inter',sans-serif",
                      fontSize: 11,
                      color: "#8B7A45",
                    }}>
                    {artist.works} works available
                  </div>
                  <motion.button
                    style={{
                      fontFamily: "'Cinzel',serif",
                      fontSize: 9,
                      letterSpacing: "0.14em",
                      padding: "8px 16px",
                      borderRadius: 999,
                      border: "1px solid rgba(212,175,55,0.4)",
                      background: "transparent",
                      color: "#D4AF37",
                      cursor: "pointer",
                    }}
                    whileHover={{
                      background: "rgba(212,175,55,0.1)",
                      scale: 1.04,
                    }}
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
