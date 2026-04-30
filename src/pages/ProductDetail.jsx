import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "../components/SafeImage";
import ChatModal from "../components/ChatModal";
import { addToCart } from "../utils/cartStore";
import { supabase } from "../utils/supabase";
import { HeartIcon, ZoomIcon, SparkIcon } from "../components/Icons";
import i1 from "../assets/i1.png";
import i2 from "../assets/i2.png";
import i4 from "../assets/i4.png";
import i6 from "../assets/i6.png";

// Fallback product for when database is empty
const FALLBACK_PRODUCT = {
  default: {
    title: "Solstice in Obsidian",
    artist: "Julian Voss",
    year: "2023",
    badge: "PRIVATE COLLECTION",
    price: 18500,
    images: [i4, i6, i2, i1],
    description:
      'A masterwork of tactile minimalism, "Solstice in Obsidian" explores the intersection of celestial events and terrestrial silence. Each stroke of genuine 24k gold leaf is applied during the first hour of daylight over three lunar cycles.',
    medium: "Oil & 24k Gold on Linen",
    dimensions: "180 x 140 cm",
    availability: "Available for Inquiry",
    certificate: "Digital Ledger Authenticity",
    artistImg:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80&auto=format&fit=crop",
    artistBio:
      "Based in Berlin, Voss's work has been featured in the Tate Modern and private collections across six continents. His process involves extreme isolation and traditional alchemy.",
    quote:
      '"My work is a dialogue with the unseen. I use gold not as a symbol of wealth, but as a capture of light in its most primal, static form."',
    aboutArt:
      "Solstice in Obsidian belongs to Voss's celebrated Lunar Series — a body of work begun in 2019 that meditates on the moments between stillness and revelation. The piece marries the patience of classical gold-leaf gilding with the bold flatness of post-minimalist abstraction. Viewed from across a room, it reads as a single deep void; viewed up close, it reveals an intricate field of micro-scratches and shifting tonal layers.",
    origin:
      "Berlin, Germany — completed at Voss's Mitte studio after a three-month period of seclusion. Studio assistants and visitors were not permitted during the gold-leaf application phase.",
    purpose:
      "Created as the centrepiece of a private 2024 commission, later re-released to the Aureum Private Collection at the artist's discretion. Voss describes the work as 'a quiet altar — somewhere to look, when there is nothing left to say.'",
    story:
      "The work was begun on the winter solstice of 2022. Voss lit a single candle each morning, then allowed himself one hour of natural daylight to apply gold leaf — never longer. Over three lunar cycles, layer upon layer of leaf was burnished onto a gesso prepared with bone-ash and ground basalt. The resulting surface holds a depth that camera lenses struggle to capture.",
    spread:
      "Held in 12 private collections across Berlin, London, New York and Hong Kong. Featured in the 2024 monograph 'Voss: Substance & Silence' (Hatje Cantz). Reviewed by The Art Newspaper, ArtForum, and Frieze. A sister work resides in the permanent collection of the Tate Modern.",
    specs: [
      { k: "Edition", v: "Unique work, signed verso" },
      {
        k: "Framing",
        v: "Float-mounted in hand-finished walnut frame, museum-grade UV glass",
      },
      {
        k: "Provenance",
        v: "Studio of the artist → private commission, Berlin → Aureum Private Collection",
      },
      {
        k: "Care",
        v: "Dust with soft sable brush. Avoid direct sunlight and humidity above 60%.",
      },
    ],
  },
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Fetch artwork from Supabase
  useEffect(() => {
    const fetchArtwork = async () => {
      setLoading(true);
      try {
        // Try to fetch from Supabase
        const { data: artwork, error } = await supabase
          .from("artworks")
          .select(
            `
            *,
            artists:artist_id (
              name,
              bio,
              image_url
            )
          `,
          )
          .eq("id", id || "default")
          .single();

        if (error || !artwork) {
          // Use fallback if not found in DB
          setProduct(FALLBACK_PRODUCT.default);
        } else {
          // Transform Supabase data to match expected format
          setProduct({
            title: artwork.title,
            artist:
              artwork.artist_name || artwork.artists?.name || "Unknown Artist",
            year: artwork.year,
            badge: artwork.in_stock ? "AVAILABLE" : "SOLD OUT",
            price: artwork.price,
            images: artwork.image_url
              ? [artwork.image_url, i1, i2, i6]
              : [i4, i6, i2, i1],
            description: artwork.description || "No description available.",
            medium: artwork.medium || "Mixed Media",
            dimensions: artwork.size
              ? `${artwork.size} size`
              : "Variable dimensions",
            availability: artwork.in_stock
              ? "Available for Purchase"
              : "Sold Out",
            certificate: "Digital Ledger Authenticity",
            artistImg:
              artwork.artists?.image_url ||
              "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80&auto=format&fit=crop",
            artistBio:
              artwork.artists?.bio ||
              "Contemporary artist working in digital and traditional mediums.",
            quote: '"Art is not what you see, but what you make others see."',
            aboutArt: artwork.description || "",
            origin: "Art Studio",
            purpose: "Artistic expression",
            story: "Created with passion and dedication",
            spread: "Available for collection",
            specs: [
              { k: "Edition", v: artwork.in_stock ? "Available" : "Sold Out" },
              { k: "Medium", v: artwork.medium || "Mixed Media" },
              { k: "Year", v: artwork.year || "2024" },
              { k: "Style", v: artwork.style || "Contemporary" },
            ],
          });
        }
      } catch (err) {
        console.error("Error fetching artwork:", err);
        setProduct(FALLBACK_PRODUCT.default);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  // Show loading state
  if (loading) {
    return (
      <section
        style={{
          padding: "100px 24px 80px",
          maxWidth: 1280,
          margin: "0 auto",
          textAlign: "center",
        }}>
        <div
          style={{
            color: "#D4AF37",
            fontFamily: "'Cinzel',serif",
            fontSize: 14,
            letterSpacing: "0.2em",
          }}>
          LOADING ARTWORK...
        </div>
      </section>
    );
  }

  // Use fallback if product is null
  const productData = product || FALLBACK_PRODUCT.default;

  const handleTakeItHome = () => {
    addToCart({
      id: id || "default",
      title: productData.title,
      artist: productData.artist,
      desc: `${productData.medium}, ${productData.dimensions}`,
      img: productData.images[0],
      price: productData.price,
    });
    setChatOpen(false);
    navigate("/cart");
  };

  return (
    <section
      style={{ padding: "100px 24px 80px", maxWidth: 1280, margin: "0 auto" }}>
      <div
        style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 56 }}
        className="pd-grid">
        {/* gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1/1",
              borderRadius: 8,
              overflow: "hidden",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(212,175,55,0.15)",
            }}>
            <SafeImage
              src={productData.images[activeImg]}
              alt={productData.title}
              fallbackIndex={activeImg}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 14,
                right: 14,
                display: "flex",
                gap: 10,
              }}>
              <CircleBtn>
                <ZoomIcon size={16} />
              </CircleBtn>
              <CircleBtn onClick={() => navigate("/ar")}>
                <SparkIcon size={16} />
              </CircleBtn>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            {productData.images.map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveImg(i)}
                style={{
                  flex: 1,
                  aspectRatio: "1/1",
                  border:
                    activeImg === i
                      ? "1px solid #D4AF37"
                      : "1px solid rgba(212,175,55,0.15)",
                  borderRadius: 4,
                  overflow: "hidden",
                  cursor: "pointer",
                }}>
                <SafeImage
                  src={img}
                  alt=""
                  fallbackIndex={i}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}>
            <span
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "#D4AF37",
              }}>
              {productData.badge}
            </span>
            <button
              onClick={() => setFavorited((v) => !v)}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "transparent",
                border: "1px solid rgba(212,175,55,0.25)",
                color: favorited ? "#D4AF37" : "rgba(200,191,160,0.55)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <HeartIcon size={16} filled={favorited} />
            </button>
          </div>

          <div
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 10,
              letterSpacing: "0.18em",
              color: "rgba(200,191,160,0.55)",
              marginBottom: 4,
            }}>
            NAME
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 48,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.05,
              textTransform: "uppercase",
              marginBottom: 12,
            }}>
            {productData.title}
          </h1>

          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 22,
              color: "rgba(200,191,160,0.8)",
              marginBottom: 20,
            }}>
            {productData.artist},{" "}
            <span className="num-value">{productData.year}</span>
          </div>

          <div
            style={{
              height: 1,
              background: "rgba(212,175,55,0.18)",
              margin: "10px 0 22px",
            }}
          />

          <div
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "#D4AF37",
              marginBottom: 10,
            }}>
            THE NARRATIVE
          </div>
          <p
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 13,
              color: "rgba(200,191,160,0.7)",
              lineHeight: 1.75,
              marginBottom: 24,
            }}>
            {productData.description}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 28,
              paddingTop: 22,
              borderTop: "1px solid rgba(212,175,55,0.18)",
            }}>
            <Meta label="MEDIUM" value={productData.medium} />
            <Meta label="DIMENSIONS" value={productData.dimensions} />
            <Meta
              label="AVAILABILITY"
              value={
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#4ade80",
                      display: "inline-block",
                    }}
                  />
                  {productData.availability}
                </span>
              }
            />
            <Meta label="CERTIFICATE" value={productData.certificate} />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setChatOpen(true)}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
              color: "#111",
              fontFamily: "'Cinzel',serif",
              fontSize: 12,
              letterSpacing: "0.2em",
              border: "none",
              borderRadius: 999,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(212,175,55,0.25)",
              marginBottom: 12,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            ENQUIRE FOR MORE
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTakeItHome}
            style={{
              width: "100%",
              padding: "16px",
              background: "transparent",
              color: "#D4AF37",
              fontFamily: "'Cinzel',serif",
              fontSize: 12,
              letterSpacing: "0.2em",
              border: "1px solid #D4AF37",
              borderRadius: 999,
              cursor: "pointer",
              marginBottom: 12,
            }}>
            TAKE IT HOME →
          </motion.button>

          <button
            onClick={() => navigate("/ar")}
            style={{
              ...pillBtn,
              width: "100%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 22,
            }}>
            <SparkIcon size={14} /> VIEW IN AR
          </button>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════
          DEEP CONTEXT — interactive tabbed view with side imagery
      ═══════════════════════════════════════════════ */}
      <CloserLook product={product} />

      {/* artist block */}
      <div
        style={{
          marginTop: 70,
          padding: "44px 36px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(212,175,55,0.12)",
          borderRadius: 12,
          display: "grid",
          gridTemplateColumns: "180px 1fr",
          gap: 36,
          alignItems: "center",
        }}
        className="pd-artist">
        <SafeImage
          src={productData.artistImg}
          alt={productData.artist}
          fallbackIndex={1}
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid rgba(212,175,55,0.4)",
          }}
        />
        <div>
          <div
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "#D4AF37",
              marginBottom: 8,
            }}>
            THE ARTIST
          </div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 38,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 14,
            }}>
            {productData.artist}
          </h2>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontStyle: "italic",
              fontSize: 16,
              color: "rgba(200,191,160,0.85)",
              marginBottom: 14,
              lineHeight: 1.6,
            }}>
            {productData.quote}
          </div>
          <p
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 13,
              color: "rgba(200,191,160,0.65)",
              lineHeight: 1.7,
              marginBottom: 14,
            }}>
            {productData.artistBio}
          </p>
          <Link
            to="/artists/elena-vance"
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 11,
              letterSpacing: "0.16em",
              color: "#D4AF37",
            }}>
            VIEW FULL MONOGRAPH →
          </Link>
        </div>
      </div>

      <ChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        conversationKey={`admin:${id}`}
        title="Aureum Support"
        subtitle={`About: ${product.title}`}
        avatar="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&q=80&auto=format&fit=crop"
        intro={[
          `Hello — Aureum support here.`,
          `Happy to answer anything about "${product.title}" by ${product.artist}.`,
        ]}
      />

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

const pillBtn = {
  padding: "13px",
  background: "transparent",
  color: "#e8e0d0",
  fontFamily: "'Cinzel',serif",
  fontSize: 11,
  letterSpacing: "0.18em",
  border: "1px solid rgba(212,175,55,0.4)",
  borderRadius: 999,
  cursor: "pointer",
};

function CircleBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(212,175,55,0.3)",
        color: "#D4AF37",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      {children}
    </button>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "'Cinzel',serif",
          fontSize: 9,
          letterSpacing: "0.18em",
          color: "rgba(200,191,160,0.55)",
          marginBottom: 6,
        }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Raleway',sans-serif",
          fontSize: 13,
          color: "#e8e0d0",
        }}>
        {value}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CLOSER LOOK — interactive tabbed deep-dive with side imagery
═══════════════════════════════════════════════ */
function CloserLook({ product }) {
  const TABS = [
    {
      id: "about",
      label: "About the Art",
      icon: "✦",
      img: product.images?.[0],
    },
    {
      id: "origin",
      label: "Origin",
      icon: "◈",
      img: product.images?.[1] || product.images?.[0],
    },
    {
      id: "purpose",
      label: "Purpose",
      icon: "❋",
      img: product.images?.[2] || product.images?.[0],
    },
    {
      id: "story",
      label: "Story Behind",
      icon: "✧",
      img: product.images?.[3] || product.images?.[0],
    },
    {
      id: "spread",
      label: "Spread & Accepted",
      icon: "❖",
      img: product.images?.[0],
    },
    {
      id: "specs",
      label: "Specifications",
      icon: "⟨ ⟩",
      img: product.images?.[1] || product.images?.[0],
    },
  ];

  const [active, setActive] = useState("about");
  const [progress, setProgress] = useState(0);

  /* gentle progress bar that resets when you switch tab */
  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 8000) * 100);
      setProgress(p);
      if (p >= 100) {
        const idx = TABS.findIndex((t) => t.id === active);
        setActive(TABS[(idx + 1) % TABS.length].id);
      }
    }, 80);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const activeIdx = TABS.findIndex((t) => t.id === active);
  const activeTab = TABS[activeIdx];

  const renderBody = () => {
    switch (active) {
      case "about":
        return (
          <>
            <h3 className="cl-headline">About this work</h3>
            <p className="cl-body">{product.aboutArt}</p>
          </>
        );
      case "origin":
        return (
          <>
            <h3 className="cl-headline">Where it came to life</h3>
            <p className="cl-body">{product.origin}</p>
          </>
        );
      case "purpose":
        return (
          <>
            <h3 className="cl-headline">Why it exists</h3>
            <p className="cl-body">{product.purpose}</p>
          </>
        );
      case "story":
        return (
          <>
            <h3 className="cl-headline">The making of it</h3>
            <p
              className="cl-body"
              style={{
                fontStyle: "italic",
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 18,
              }}>
              {product.story}
            </p>
          </>
        );
      case "spread":
        return (
          <>
            <h3 className="cl-headline">Where it lives now</h3>
            <p className="cl-body">{product.spread}</p>
          </>
        );
      case "specs":
        return (
          <>
            <h3 className="cl-headline">Built to last</h3>
            <div style={{ marginTop: 18 }}>
              {product.specs.map((s) => (
                <div key={s.k} className="cl-spec-row">
                  <div className="cl-spec-label">{s.k.toUpperCase()}</div>
                  <div className="cl-spec-value">{s.v}</div>
                </div>
              ))}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ marginTop: 70 }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div className="gold-rule" style={{ justifyContent: "center" }}>
          <div
            className="grl"
            style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }}
          />
          <span className="grt">Provenance & Context</span>
          <div
            className="grl"
            style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }}
          />
        </div>
        <h2 className="section-heading" style={{ marginTop: 8 }}>
          <span className="bold-white">A Closer</span> <em>Look</em>
        </h2>
      </div>

      {/* Tab pills */}
      <div className="cl-tabs">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`cl-tab ${active === t.id ? "is-active" : ""}`}>
            <span className="cl-tab-icon">{t.icon}</span>
            <span className="cl-tab-label">{t.label}</span>
            <span className="cl-tab-num num-value">0{i + 1}</span>
          </button>
        ))}
      </div>

      {/* Body grid: image | content */}
      <div className="cl-stage">
        {/* Image side — animated */}
        <div className="cl-image-wrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab.img + active}
              initial={{ opacity: 0, scale: 0.96, rotateY: -8 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.96, rotateY: 8 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="cl-image">
              <SafeImage
                src={activeTab.img}
                alt={activeTab.label}
                fallbackIndex={activeIdx}
              />
              <div className="cl-image-frame" />
            </motion.div>
          </AnimatePresence>
          <div className="cl-image-tag">
            <span className="cl-image-tag-icon">{activeTab.icon}</span>
            <span>{activeTab.label.toUpperCase()}</span>
          </div>
        </div>

        {/* Content side */}
        <div className="cl-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <div className="cl-eyebrow">
                <span className="num-value">0{activeIdx + 1}</span> ·{" "}
                {activeTab.label.toUpperCase()}
              </div>
              {renderBody()}
            </motion.div>
          </AnimatePresence>

          <div className="cl-progress-wrap">
            <div className="cl-progress" style={{ width: `${progress}%` }} />
          </div>

          <div className="cl-nav">
            <button
              onClick={() =>
                setActive(TABS[(activeIdx - 1 + TABS.length) % TABS.length].id)
              }
              className="cl-nav-btn"
              aria-label="Previous">
              ←
            </button>
            <span className="cl-nav-counter num-value">
              0{activeIdx + 1} / 0{TABS.length}
            </span>
            <button
              onClick={() => setActive(TABS[(activeIdx + 1) % TABS.length].id)}
              className="cl-nav-btn"
              aria-label="Next">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
