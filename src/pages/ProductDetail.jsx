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
  // Oil on Canvas gallery items
  o1: { title: "The Golden Meadow", artist: "Claire Bouchard", year: "2024", price: 11200, images: ["https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80","https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80","https://images.unsplash.com/photo-1541680670548-88e8cd23c0f4?w=1200&q=80","https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=1200&q=80"], medium: "Oil on Canvas", dimensions: "120 × 90 cm", description: "A luminous pastoral landscape rendered in layered glazes of cadmium yellow and viridian, evoking the golden light of late afternoon." },
  o2: { title: "Storm Over the Valley", artist: "Henry Ashford", year: "2023", price: 18600, images: ["https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80","https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80","https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80","https://images.unsplash.com/photo-1567359781514-3b964e2b04d6?w=1200&q=80"], medium: "Oil on Linen", dimensions: "150 × 100 cm", description: "Churning cloud formations rendered in thick impasto, the canvas surface alive with the physical urgency of the mark." },
  o3: { title: "Interior with Red", artist: "Marta Voss", year: "2025", price: 9400, images: ["https://images.unsplash.com/photo-1541680670548-88e8cd23c0f4?w=1200&q=80","https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=1200&q=80","https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80","https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=1200&q=80"], medium: "Oil on Canvas", dimensions: "80 × 80 cm", description: "A meditation on domestic space — the room as psychological interior, the red as both colour and feeling." },
  o4: { title: "Portrait of the Afternoon", artist: "Elena Rossi", year: "2024", price: 7800, images: ["https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=1200&q=80","https://images.unsplash.com/photo-1541680670548-88e8cd23c0f4?w=1200&q=80","https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80","https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80"], medium: "Oil on Board", dimensions: "60 × 50 cm", description: "Loosely painted figures dissolve into the warm light of a summer afternoon, form surrendering to atmosphere." },
  o5: { title: "The Old Harbour", artist: "James Calloway", year: "2023", price: 13500, images: ["https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80","https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80","https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80","https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80"], medium: "Oil on Canvas", dimensions: "100 × 70 cm", description: "Working boats at rest in the harbour, the still water a mirror of masts and sky — a study in horizontal calm." },
  o6: { title: "Nocturne in Blue", artist: "Lena Bach", year: "2024", price: 10200, images: ["https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=1200&q=80","https://images.unsplash.com/photo-1541680670548-88e8cd23c0f4?w=1200&q=80","https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=1200&q=80","https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80"], medium: "Oil on Canvas", dimensions: "90 × 90 cm", description: "A nocturnal composition of deep Prussian blue and silver, the night reduced to its most essential tonal architecture." },
  o7: { title: "The Ancient Tree", artist: "Chen Wei", year: "2025", price: 16400, images: ["https://images.unsplash.com/photo-1567359781514-3b964e2b04d6?w=1200&q=80","https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80","https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80","https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=1200&q=80"], medium: "Oil on Linen", dimensions: "140 × 100 cm", description: "A solitary oak recorded with the patient attention of the naturalist and the emotional depth of the romantic." },
  o8: { title: "Figure Study No. 7", artist: "Marcus Thomas", year: "2024", price: 8900, images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80","https://images.unsplash.com/photo-1541680670548-88e8cd23c0f4?w=1200&q=80","https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=1200&q=80","https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80"], medium: "Oil on Canvas", dimensions: "70 × 50 cm", description: "The human form in repose — painted with the directness of Freud and the tonal sensitivity of Rembrandt." },
  o9: { title: "Seascape at Dusk", artist: "Ingrid Halvor", year: "2023", price: 14800, images: ["https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80","https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80","https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80","https://images.unsplash.com/photo-1567359781514-3b964e2b04d6?w=1200&q=80"], medium: "Oil on Canvas", dimensions: "110 × 80 cm", description: "The horizon line as the painting's true subject — a thin band of gold between the weight of sea and sky." },
  // Default gallery fallback items
  d1: { title: "Ethereal Horizon", artist: "Marcus Thomas", year: "2024", price: 8400, images: ["https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80","https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80","https://images.unsplash.com/photo-1541680670548-88e8cd23c0f4?w=1200&q=80","https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=1200&q=80"], medium: "Mixed Media", dimensions: "120 × 90 cm", description: "A sweeping composition that dissolves the boundary between sky and sea, evoking an infinite sense of calm and possibility." },
  d2: { title: "Fractured Silence", artist: "Elena Vance", year: "2023", price: 12500, images: ["https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80","https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80","https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80","https://images.unsplash.com/photo-1541680670548-88e8cd23c0f4?w=1200&q=80"], medium: "Mixed Media", dimensions: "100 × 80 cm", description: "Layered textures coalesce into a meditation on memory and the spaces between sound." },
  d3: { title: "Obsidian Flow", artist: "Julian Aris", year: "2024", price: 16800, images: ["https://images.unsplash.com/photo-1541680670548-88e8cd23c0f4?w=1200&q=80","https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=1200&q=80","https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80","https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80"], medium: "Mixed Media", dimensions: "150 × 100 cm", description: "Dark pigments pour and solidify, channelling the raw energy of volcanic geology." },
  d4: { title: "The Golden Tree", artist: "Chen Wei", year: "2024", price: 14200, images: ["https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=1200&q=80","https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80","https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80","https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80"], medium: "Mixed Media", dimensions: "90 × 70 cm", description: "An ancient form rendered in luminous gold and amber, standing as a symbol of endurance." },
  d5: { title: "Whispers of Silence", artist: "Lena Bach", year: "2025", price: 7600, images: ["https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200&q=80","https://images.unsplash.com/photo-1541680670548-88e8cd23c0f4?w=1200&q=80","https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80","https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=1200&q=80"], medium: "Mixed Media", dimensions: "50 × 50 cm", description: "A near-monochromatic study where barely perceptible marks create an atmosphere of profound stillness." },
  d6: { title: "Renaissance Study", artist: "Elena Rossi", year: "2023", price: 19500, images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80","https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=1200&q=80","https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80","https://images.unsplash.com/photo-1541680670548-88e8cd23c0f4?w=1200&q=80"], medium: "Mixed Media", dimensions: "80 × 60 cm", description: "Old-master technique meets contemporary subject matter." },
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
  const [customOpen, setCustomOpen] = useState(false);
  const [customForm, setCustomForm] = useState({ size: "Standard", frame: "No frame", finish: "Satin varnish", palette: "As created" });
  const [wall, setWall] = useState({ w: "", h: "", unit: "Feet" });
  const [wallFit, setWallFit] = useState(null);
  const [wallUpcharge, setWallUpcharge] = useState(0);

  const calcWallFit = () => {
    const w = parseFloat(wall.w), h = parseFloat(wall.h);
    if (!w || !h) return;
    const toIn = wall.unit === "Feet" ? 12 : wall.unit === "cm" ? 0.3937 : 1;
    const wallW = w * toIn, wallH = h * toIn;
    const [artW, artH] = (productData?.dimensions || "80 × 60 cm").replace("cm","").split("×").map(s => parseFloat(s.trim()) * 0.3937);
    const fits = artW <= wallW && artH <= wallH;
    const scaleW = Math.floor((wallW / artW) * 10) / 10;
    const scaleH = Math.floor((wallH / artH) * 10) / 10;
    const maxScale = Math.min(scaleW, scaleH);
    // price upcharge based on how much the artwork needs to scale up to fill the wall
    const upcharge = !fits ? 0 : maxScale <= 1.2 ? 0 : maxScale <= 1.5 ? 10 : maxScale <= 2 ? 20 : maxScale <= 3 ? 35 : 50;
    setWallUpcharge(upcharge);
    setWallFit({ fits, scaleW, scaleH, maxScale, upcharge });
  };

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

  const UPCHARGES = {
    size:    { Standard: 0, "Small (50%)": -20, "Large (150%)": 30, Custom: 50 },
    frame:   { "No frame": 0, "Simple Wood": 8, "Hand-finished Walnut": 18, "Museum Grade UV Glass": 28, "Custom Gilded": 45 },
    finish:  { "Satin varnish": 0, Matte: 0, "High gloss": 5, Unvarnished: 0 },
    palette: { "As created": 0, "Warmer tones": 10, "Cooler tones": 10, Monochrome: 15, Custom: 20 },
  };
  const basePrice = productData?.price || 12000;
  const upchargePct = Object.entries(UPCHARGES).reduce((sum, [key, map]) => sum + (map[customForm[key]] ?? 0), 0) + wallUpcharge;
  const customPrice = Math.round(basePrice * (1 + upchargePct / 100));
  const fmtPrice = (n) => "$" + n.toLocaleString("en-US");

  useEffect(() => { setActiveImg(0); window.scrollTo(0, 0); }, [id]);

  return (
    <section
      className="pd-section"
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
            onClick={() => window.dispatchEvent(new Event("open-artcoliseum-chat"))}
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

          {/* VIEW IN AR + CUSTOMISE row */}
          <div className="pd-btn-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <button
              onClick={() => navigate("/ar")}
              style={{ ...pillBtn, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <SparkIcon size={14} /> VIEW IN AR
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setCustomOpen(v => !v)}
              style={{
                ...pillBtn,
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                borderColor: customOpen ? "#D4AF37" : "rgba(212,175,55,0.4)",
                color: customOpen ? "#D4AF37" : "#e8e0d0",
                background: customOpen ? "rgba(212,175,55,0.07)" : "transparent",
              }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              </svg>
              CUSTOMISE
            </motion.button>
          </div>

          {/* Inline customisation panel */}
          <AnimatePresence>
            {customOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden", marginBottom: 16 }}>
                <div style={{
                  background: "rgba(212,175,55,0.04)",
                  border: "1px solid rgba(212,175,55,0.18)",
                  borderRadius: 12, padding: "20px 22px",
                }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 16 }}>CUSTOMISE YOUR PIECE</div>

                  <div className="pd-custom-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    {[
                      ["SIZE", "size", ["Standard", "Small (50%)", "Large (150%)", "Custom"]],
                      ["FRAME", "frame", ["No frame", "Simple Wood", "Hand-finished Walnut", "Museum Grade UV Glass", "Custom Gilded"]],
                      ["FINISH", "finish", ["Satin varnish", "Matte", "High gloss", "Unvarnished"]],
                      ["PALETTE", "palette", ["As created", "Warmer tones", "Cooler tones", "Monochrome", "Custom"]],
                    ].map(([label, key, opts]) => (
                      <div key={key}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.16em", color: "rgba(212,175,55,0.65)", marginBottom: 5 }}>{label}</div>
                        <select
                          value={customForm[key]}
                          onChange={e => setCustomForm(f => ({ ...f, [key]: e.target.value }))}
                          style={{ width: "100%", padding: "8px 10px", background: "#111", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 6, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 12, cursor: "pointer", outline: "none" }}>
                          {opts.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Wall size calculator */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.16em", color: "rgba(212,175,55,0.65)", marginBottom: 8 }}>ENTER YOUR WALL SIZE</div>
                    <div className="pd-wall-row" style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                      <input
                        type="number" placeholder="Width" value={wall.w}
                        onChange={e => { setWall(f => ({ ...f, w: e.target.value })); setWallFit(null); setWallUpcharge(0); }}
                        style={{ flex: 1, padding: "8px 10px", background: "#111", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 6, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 12, outline: "none", textAlign: "center" }}
                      />
                      <input
                        type="number" placeholder="Height" value={wall.h}
                        onChange={e => { setWall(f => ({ ...f, h: e.target.value })); setWallFit(null); setWallUpcharge(0); }}
                        style={{ flex: 1, padding: "8px 10px", background: "#111", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 6, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 12, outline: "none", textAlign: "center" }}
                      />
                      <select
                        value={wall.unit} onChange={e => { setWall(f => ({ ...f, unit: e.target.value })); setWallFit(null); setWallUpcharge(0); }}
                        style={{ padding: "8px 10px", background: "#111", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 6, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 12, cursor: "pointer", outline: "none" }}>
                        <option>Feet</option>
                        <option>Inches</option>
                        <option>cm</option>
                      </select>
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={calcWallFit}
                        style={{ padding: "8px 16px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", border: "none", borderRadius: 6, color: "#0e0c0a", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                        CALCULATE
                      </motion.button>
                    </div>
                    {wallFit && wallFit.upcharge > 0 && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: 10, padding: "8px 14px", borderRadius: 8, background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)" }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.12em", color: "#D4AF37" }}>
                          +{wallFit.upcharge}% wall-size adjustment applied to price
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Price comparison */}
                  <div style={{ borderTop: "1px solid rgba(212,175,55,0.15)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.16em", color: "rgba(200,191,160,0.45)", marginBottom: 3 }}>BASE MRP</div>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: "rgba(200,191,160,0.55)", textDecoration: upchargePct !== 0 ? "line-through" : "none" }}>
                        {fmtPrice(basePrice)}
                      </div>
                    </div>
                    {upchargePct !== 0 && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.16em", color: "#D4AF37", marginBottom: 3 }}>
                          CUSTOMISED PRICE {upchargePct > 0 ? `+${upchargePct}%` : `${upchargePct}%`}
                        </div>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#D4AF37" }}>
                          {fmtPrice(customPrice)}
                        </div>
                      </div>
                    )}
                    {upchargePct === 0 && (
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.14em", color: "rgba(200,191,160,0.35)" }}>
                        NO ADDITIONAL COST
                      </div>
                    )}
                  </div>

                  {/* Take it home CTA */}
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 32px rgba(212,175,55,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/cart")}
                    style={{
                      width: "100%", padding: "14px",
                      background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                      color: "#0e0c0a", border: "none", borderRadius: 999,
                      fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", fontWeight: 700,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    TAKE IT HOME — {fmtPrice(customPrice)}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

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

