import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "../components/SafeImage";
import { HeartIcon, ZoomIcon, SparkIcon } from "../components/Icons";
import i1 from "../assets/i1.png";
import i2 from "../assets/i2.png";
import i3 from "../assets/i3.png";
import i4 from "../assets/i4.png";
import i5 from "../assets/i5.png";
import i6 from "../assets/i6.png";
import i7 from "../assets/i7.png";
import i8 from "../assets/i8.png";

const ARTWORK_MAP = {
  p1: { title: "Ethereal Horizon", artist: "Marcus Thomas", year: "2024", price: 8400, images: [i1, i6, i4, i2], medium: "Acrylic on Canvas", dimensions: "120 × 90 cm", description: "A sweeping composition that dissolves the boundary between sky and sea, evoking an infinite sense of calm and possibility." },
  p2: { title: "Fractured Silence", artist: "Elena Vance", year: "2023", price: 12500, images: [i7, i1, i6, i4], medium: "Mixed Media", dimensions: "100 × 80 cm", description: "Layered textures and torn paper fragments coalesce into a meditation on memory and the spaces between sound." },
  p3: { title: "Obsidian Flow", artist: "Julian Aris", year: "2024", price: 16800, images: [i6, i4, i1, i2], medium: "Acrylic & Oil", dimensions: "150 × 100 cm", description: "Dark pigments pour and solidify across the canvas, channelling the raw energy of volcanic geology." },
  p4: { title: "The Infinite Stair", artist: "Soren Klein", year: "2024", price: 22000, images: [i3, i6, i1, i4], medium: "Bronze Sculpture", dimensions: "40 × 40 × 60 cm", description: "A cast bronze staircase that spirals inward with no apparent beginning or end, questioning the nature of progress." },
  p5: { title: "Cosmic Flow", artist: "Hideo Tanaka", year: "2024", price: 9800, images: [i6, i7, i1, i4], medium: "Mixed Media with Gold Leaf", dimensions: "60 × 60 cm", description: "Gold leaf and iridescent pigment capture the swirling motion of nebulae in a surprisingly intimate format." },
  p6: { title: "The Golden Tree", artist: "Chen Wei", year: "2024", price: 14200, images: [i4, i6, i1, i2], medium: "Oil on Canvas", dimensions: "90 × 70 cm", description: "An ancient tree rendered in luminous gold and amber, standing as a symbol of endurance and quiet majesty." },
  p7: { title: "Whispers of Silence", artist: "Lena Bach", year: "2025", price: 7600, images: [i5, i1, i6, i4], medium: "Oil on Canvas", dimensions: "50 × 50 cm", description: "A near-monochromatic study where barely perceptible brushwork creates an atmosphere of profound stillness." },
  p8: { title: "Renaissance Study", artist: "Elena Rossi", year: "2023", price: 19500, images: [i8, i6, i1, i4], medium: "Oil on Panel", dimensions: "80 × 60 cm", description: "Old-master technique meets contemporary subject matter — a daring recontextualisation of 15th century portraiture." },
  p9: { title: "Ocean Depths", artist: "Hideo Tanaka", year: "2024", price: 5400, images: [i7, i6, i1, i4], medium: "Archival Digital Print", dimensions: "70 × 50 cm", description: "Algorithmically generated depth maps transformed into a high-definition archival print, evoking the abyssal ocean floor." },
};

const FALLBACK_PRODUCT = {
  default: {
    title: "Solstice in Obsidian",
    artist: "Julian Voss",
    year: "2023",
    badge: "PRIVATE COLLECTION",
    price: 18500,
    images: [i4, i4, i4, i4],
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
      "Created as the centrepiece of a private 2024 commission, later re-released to the Art Coliseum Private Collection at the artist's discretion. Voss describes the work as 'a quiet altar — somewhere to look, when there is nothing left to say.'",
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
        v: "Studio of the artist → private commission, Berlin → Art Coliseum Private Collection",
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
  const [activeImg, setActiveImg] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [enquiryStep, setEnquiryStep] = useState(0); // 0=closed, 1-4=steps
  const [enquiryForm, setEnquiryForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [customForm, setCustomForm] = useState({
    size: "Standard (as listed)",
    material: "Original medium",
    frame: "No frame",
    palette: "As created",
    finish: "Satin varnish",
    notes: "",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const matched = id && ARTWORK_MAP[id];
  const productData = matched
    ? {
        ...FALLBACK_PRODUCT.default,
        ...matched,
        badge: "AVAILABLE FOR ENQUIRY",
        availability: "Available for Enquiry",
        certificate: "Digital Ledger Authenticity",
        artistImg: FALLBACK_PRODUCT.default.artistImg,
        artistBio: FALLBACK_PRODUCT.default.artistBio,
        quote: FALLBACK_PRODUCT.default.quote,
        aboutArt: matched.description,
        origin: FALLBACK_PRODUCT.default.origin,
        purpose: FALLBACK_PRODUCT.default.purpose,
        story: FALLBACK_PRODUCT.default.story,
        spread: FALLBACK_PRODUCT.default.spread,
        specs: [
          { k: "Edition", v: "Unique work, signed verso" },
          { k: "Medium", v: matched.medium },
          { k: "Dimensions", v: matched.dimensions },
          { k: "Year", v: matched.year },
        ],
      }
    : FALLBACK_PRODUCT.default;

  useEffect(() => {
    setActiveImg(0);
    setEnquiryStep(0);
  }, [id]);

  const FRAME_MARKUP = { "No frame": 0, "Simple Wood": 8, "Hand-finished Walnut": 15, "Museum Grade UV Glass": 25, "Custom Gilded": 40 };
  const baseEstimate = productData?.price || 12000;
  const frameUpcharge = (FRAME_MARKUP[customForm.frame] || 0) / 100;
  const finalEstimate = Math.round(baseEstimate * (1 + frameUpcharge));
  const fmtPrice = (n) => "$" + n.toLocaleString("en-US");

  const handleEnquirySubmit = (e) => { e.preventDefault(); setEnquiryStep(2); };
  const handleCustomSubmit = (e) => { e.preventDefault(); setEnquiryStep(3); };
  const handlePlaceOrder = () => { setEnquiryStep(4); setTimeout(() => { setOrderPlaced(true); }, 400); };

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
            onClick={() => setEnquiryStep(1)}
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            ENQUIRE NOW
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
      <CloserLook product={productData} />

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

      {/* ── Multi-step Enquiry Modal ── */}
      <AnimatePresence>
        {enquiryStep > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEnquiryStep(0)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#0e0c0a", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 16, width: "100%", maxWidth: 560, padding: 40, maxHeight: "90vh", overflowY: "auto" }}>

              {/* Steps indicator */}
              <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
                {["Enquire", "Customise", "Review", "Confirmed"].map((s, i) => (
                  <div key={s} style={{ flex: 1 }}>
                    <div style={{ height: 3, borderRadius: 99, background: enquiryStep > i ? "#D4AF37" : "rgba(212,175,55,0.2)", transition: "background 0.4s" }} />
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.15em", color: enquiryStep > i ? "#D4AF37" : "rgba(200,191,160,0.4)", marginTop: 5 }}>{s}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => setEnquiryStep(0)} style={{ position: "absolute", top: 20, right: 20, background: "transparent", border: "none", color: "rgba(200,191,160,0.55)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>

              {/* Step 1: Enquiry details */}
              {enquiryStep === 1 && (
                <form onSubmit={handleEnquirySubmit}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 8 }}>ENQUIRY</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: "#fff", marginBottom: 6 }}>Tell us about yourself</h3>
                  <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)", marginBottom: 24, lineHeight: 1.7 }}>Submit your enquiry for <em style={{ color: "rgba(200,191,160,0.9)" }}>{productData.title}</em>. We'll guide you through customisation and provide a personalised quote.</p>
                  {[["Full Name", "name", "text"], ["Email Address", "email", "email"], ["Phone (optional)", "phone", "tel"]].map(([placeholder, key, type]) => (
                    <input key={key} type={type} required={key !== "phone"} placeholder={placeholder} value={enquiryForm[key]} onChange={e => setEnquiryForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, marginBottom: 12, boxSizing: "border-box", outline: "none" }} />
                  ))}
                  <textarea placeholder="What draws you to this piece? Any questions for the artist?" value={enquiryForm.message} onChange={e => setEnquiryForm(f => ({ ...f, message: e.target.value }))} rows={3}
                    style={{ width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, marginBottom: 20, boxSizing: "border-box", resize: "vertical", outline: "none" }} />
                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.18em", border: "none", borderRadius: 999, cursor: "pointer" }}>
                    CONTINUE TO CUSTOMISE →
                  </motion.button>
                </form>
              )}

              {/* Step 2: Customisation */}
              {enquiryStep === 2 && (
                <form onSubmit={handleCustomSubmit}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 8 }}>CUSTOMISE</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: "#fff", marginBottom: 6 }}>Make it yours</h3>
                  <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)", marginBottom: 24, lineHeight: 1.7 }}>Every detail can be tailored. Configure your piece below — exact pricing will be revealed once you review your selection.</p>
                  {[
                    ["SIZE", "size", ["Standard (as listed)", "Small (50%)", "Large (150%)", "Custom — specify in notes"]],
                    ["MATERIAL / MEDIUM", "material", ["Original medium", "Oil on Canvas", "Acrylic on Canvas", "Watercolor on Paper", "Giclée Print", "Bronze cast (sculptures)"]],
                    ["FRAME", "frame", ["No frame", "Simple Wood", "Hand-finished Walnut", "Museum Grade UV Glass", "Custom Gilded"]],
                    ["COLOUR PALETTE", "palette", ["As created", "Warmer tones", "Cooler tones", "Monochrome", "Custom — specify in notes"]],
                    ["FINISH", "finish", ["Satin varnish", "Matte", "High gloss", "Unvarnished"]],
                  ].map(([label, key, opts]) => (
                    <div key={key} style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 6 }}>{label}</div>
                      <select value={customForm[key]} onChange={e => setCustomForm(f => ({ ...f, [key]: e.target.value }))}
                        style={{ width: "100%", padding: "11px 14px", background: "#111", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, cursor: "pointer", outline: "none" }}>
                        {opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  <textarea placeholder="Additional notes or special requests…" value={customForm.notes} onChange={e => setCustomForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                    style={{ width: "100%", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, marginBottom: 20, boxSizing: "border-box", resize: "vertical", outline: "none" }} />
                  <div style={{ display: "flex", gap: 12 }}>
                    <button type="button" onClick={() => setEnquiryStep(1)} style={{ flex: 1, padding: "14px", background: "transparent", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 999, color: "#D4AF37", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", cursor: "pointer" }}>← BACK</button>
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ flex: 2, padding: "14px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", border: "none", borderRadius: 999, cursor: "pointer" }}>
                      REVEAL PRICE →
                    </motion.button>
                  </div>
                </form>
              )}

              {/* Step 3: Price reveal + order */}
              {enquiryStep === 3 && (
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 8 }}>YOUR QUOTE</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: "#fff", marginBottom: 20 }}>Your personalised configuration</h3>
                  <div style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 12, padding: 24, marginBottom: 20 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: "#fff", marginBottom: 12 }}>{productData.title}</div>
                    {[["Artist", productData.artist], ["Size", customForm.size], ["Material", customForm.material], ["Frame", customForm.frame], ["Palette", customForm.palette], ["Finish", customForm.finish]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(212,175,55,0.08)", fontFamily: "'Raleway',sans-serif", fontSize: 12 }}>
                        <span style={{ color: "rgba(200,191,160,0.55)", letterSpacing: "0.08em" }}>{k}</span>
                        <span style={{ color: "rgba(200,191,160,0.85)" }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(212,175,55,0.25)" }}>
                      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em", color: "#D4AF37" }}>TOTAL ESTIMATE</span>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: "#D4AF37", fontWeight: 700 }}>{fmtPrice(finalEstimate)}</span>
                    </div>
                    <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.45)", marginTop: 10, lineHeight: 1.6 }}>This is a personalised estimate. Final pricing is confirmed by the artist within 48 hours. No payment is taken at this stage.</p>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setEnquiryStep(2)} style={{ flex: 1, padding: "14px", background: "transparent", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 999, color: "#D4AF37", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", cursor: "pointer" }}>← EDIT</button>
                    <motion.button onClick={handlePlaceOrder} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ flex: 2, padding: "14px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", border: "none", borderRadius: 999, cursor: "pointer" }}>
                      PLACE ORDER →
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Step 4: Order confirmed + tracking */}
              {enquiryStep === 4 && (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "20px 0" }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                    style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(212,175,55,0.15)", border: "2px solid #D4AF37", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28, color: "#D4AF37" }}>✓</motion.div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, color: "#fff", marginBottom: 10 }}>Order Submitted</h3>
                  <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", lineHeight: 1.75, marginBottom: 28 }}>Your enquiry for <em style={{ color: "rgba(200,191,160,0.9)" }}>{productData.title}</em> has been received. The artist will confirm your configuration within 48 hours. A full tracking link will be sent to <strong style={{ color: "#D4AF37" }}>{enquiryForm.email}</strong>.</p>
                  <div style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 10, padding: "20px 24px", marginBottom: 24, textAlign: "left" }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 14 }}>ORDER TRACKING</div>
                    {[["Enquiry Received", true], ["Artist Review", false], ["In Production", false], ["Quality Check", false], ["Shipped", false], ["Delivered", false]].map(([stage, done]) => (
                      <div key={stage} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: done ? "#D4AF37" : "rgba(212,175,55,0.2)", flexShrink: 0 }} />
                        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: done ? "rgba(200,191,160,0.85)" : "rgba(200,191,160,0.4)" }}>{stage}</span>
                        {done && <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: "#D4AF37", marginLeft: "auto" }}>✓</span>}
                      </div>
                    ))}
                  </div>
                  <motion.button onClick={() => setEnquiryStep(0)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ padding: "14px 32px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", border: "none", borderRadius: 999, cursor: "pointer" }}>
                    DONE
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
