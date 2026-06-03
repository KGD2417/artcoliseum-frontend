import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "../components/SafeImage";
import ChatModal from "../components/ChatModal";
import { HeartIcon, ZoomIcon, SparkIcon } from "../components/Icons";
import { api } from "../utils/api";
import { useAuth } from "../context/Auth";
import { useLocale } from "../context/Locale";
import i4 from "../assets/i4.png";

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
  const [customForm, setCustomForm] = useState({ size: "Standard", frame: "No frame", finish: "Satin varnish", palette: "As created" });
  const [wall, setWall] = useState({ w: "", h: "", unit: "Feet" });
  const [wallFit, setWallFit] = useState(null);
  const [wallUpcharge, setWallUpcharge] = useState(0);
  const [matched, setMatched] = useState(null);
  const [customizable, setCustomizable] = useState(true);
  const [artistInfo, setArtistInfo] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const { user } = useAuth();
  const { formatPrice } = useLocale();
  const [gate, setGate] = useState({ state: "enquire" });
  const [chatOpen, setChatOpen] = useState(false);
  const [ctaBusy, setCtaBusy] = useState(false);
  // Predefined (fixed-price) works show their price and can be bought directly;
  // customizable works hide price until the curator reveals it during an enquiry.
  const isPredefined = !customizable;

  // Fetch the buy gate for this artwork + user.
  useEffect(() => {
    if (!id || !user) { setGate({ state: "enquire" }); return; }
    let cancelled = false;
    api.enquiries.gate(id)
      .then((g) => { if (!cancelled) setGate(g); })
      .catch(() => { if (!cancelled) setGate({ state: "enquire" }); });
    return () => { cancelled = true; };
  }, [id, user, chatOpen]);

  const bringHome = async () => {
    setCtaBusy(true);
    try {
      const body = { artwork_id: id, fulfillment: "transport_setup" };
      if (selectedSize) body.size_id = selectedSize.id;
      await api.cart.addItem(body);
      navigate("/cart");
    } catch (e) {
      alert(e.message);
    } finally {
      setCtaBusy(false);
    }
  };

  const handlePrimaryCta = async () => {
    if (!user) { navigate("/signin"); return; }
    // Predefined (fixed-price) works, or an already-approved enquiry, go straight to cart.
    if (!customizable || gate.state === "bring_home") { bringHome(); return; }
    setCtaBusy(true);
    try {
      // Send the buyer's customization so the backend auto-computes & reveals a price.
      await api.enquiries.create({
        artwork_id: id,
        options: customForm,
        wall_upcharge: wallUpcharge,
      });
      // Refresh the gate so the freshly-quoted price shows on the page.
      api.enquiries.gate(id).then(setGate).catch(() => {});
      setChatOpen(true);
    } catch (e) {
      alert(e.message);
    } finally {
      setCtaBusy(false);
    }
  };

  const isApproved = gate.state === "bring_home" || isPredefined;

  // Fetch the artwork from the catalog API.
  useEffect(() => {
    let cancelled = false;
    if (!id) { setMatched(null); return; }
    api.catalog
      .artwork(id)
      .then((a) => {
        if (cancelled) return;
        setCustomizable(a.customizable !== false);
        setSizes(a.sizes || []);
        setSelectedSize(a.sizes && a.sizes.length ? a.sizes[0] : null);
        setActiveImg(0);
        setMatched({
          title: a.title,
          artist: a.artist_name,
          year: a.year,
          price: a.price,
          images: a.images?.length ? a.images : [i4],
          medium: a.medium,
          dimensions: a.base_dimensions,
          description: a.description || a.narrative,
          unit: a.unit || "cm",
          pricePerUnit: a.price_per_unit,
          minWidth: a.min_width, maxWidth: a.max_width,
          minHeight: a.min_height, maxHeight: a.max_height,
          minDepth: a.min_depth, maxDepth: a.max_depth,
          categoryId: a.category_id,
        });
        // Pull the real artist profile (bio, photo) so the artist block isn't dummy.
        if (a.artist_id) {
          api.catalog.artist(a.artist_id)
            .then((ar) => { if (!cancelled) setArtistInfo(ar); })
            .catch(() => {});
        }
      })
      .catch(() => { if (!cancelled) setMatched(null); });
    return () => { cancelled = true; };
  }, [id]);

  const calcWallFit = () => {
    const w = parseFloat(wall.w), h = parseFloat(wall.h);
    if (!w || !h) return;
    const toIn = wall.unit === "Feet" ? 12 : wall.unit === "cm" ? 0.3937 : 1;
    const wallW = w * toIn, wallH = h * toIn;
    // base_dimensions are stored in cm (e.g. "80 × 60 cm"); accept either the
    // unicode "×" or an ASCII "x" separator, then convert cm → inches.
    const [artW, artH] = (productData?.dimensions || "80 × 60 cm").split(/[×x]/i).map(s => parseFloat(s.trim()) * 0.3937);
    const fits = artW <= wallW && artH <= wallH;
    const scaleW = Math.floor((wallW / artW) * 10) / 10;
    const scaleH = Math.floor((wallH / artH) * 10) / 10;
    const maxScale = Math.min(scaleW, scaleH);
    // price upcharge based on how much the artwork needs to scale up to fill the wall
    const upcharge = !fits ? 0 : maxScale <= 1.2 ? 0 : maxScale <= 1.5 ? 10 : maxScale <= 2 ? 20 : maxScale <= 3 ? 35 : 50;
    setWallUpcharge(upcharge);
    setWallFit({ fits, scaleW, scaleH, maxScale, upcharge });
  };

  const productData = matched
    ? {
        ...matched,
        badge: customizable ? "AVAILABLE FOR ENQUIRY" : "AVAILABLE NOW",
        availability: customizable ? "Available for Enquiry" : "Ready to bring home",
        certificate: "Digital Ledger Authenticity",
        artistImg: artistInfo?.image_url || FALLBACK_PRODUCT.default.artistImg,
        artistBio: artistInfo?.bio || "",
        artistRole: artistInfo?.role || "",
        artistId: artistInfo?.id || matched.artist_id || null,
        aboutArt: matched.description,
      }
    : FALLBACK_PRODUCT.default;

  const UPCHARGES = {
    size:    { Standard: 0, "Small (50%)": -20, "Large (150%)": 30, Custom: 50 },
    frame:   { "No frame": 0, "Simple Wood": 8, "Hand-finished Walnut": 18, "Museum Grade UV Glass": 28, "Custom Gilded": 45 },
    finish:  { "Satin varnish": 0, Matte: 0, "High gloss": 5, Unvarnished: 0 },
    palette: { "As created": 0, "Warmer tones": 10, "Cooler tones": 10, Monochrome: 15, Custom: 20 },
  };
  const arType = (() => {
    const m = (productData?.medium || "").toLowerCase();
    if (m.includes("sculpture")) return "sculpture";
    if (m.includes("mural") || m.includes("wallpaper")) return "mural";
    return "painting";
  })();
  const arUrl = (imgUrl) => `/ar-launcher.html?image=${encodeURIComponent(imgUrl)}&type=${arType}`;

  // Base for the live estimate: the display price if set, else price_per_unit × face area
  // (mirrors the backend compute_custom_price so the customer's estimate matches the quote).
  const dimArea = (() => {
    const nums = (productData?.dimensions || "").match(/[\d.]+/g);
    return nums && nums.length >= 2 ? parseFloat(nums[0]) * parseFloat(nums[1]) : 0;
  })();
  const basePrice = (productData?.price && productData.price > 0)
    ? Number(productData.price)
    : (productData?.pricePerUnit ? Number(productData.pricePerUnit) * dimArea : 0);
  const upchargePct = Object.entries(UPCHARGES).reduce((sum, [key, map]) => sum + (map[customForm[key]] ?? 0), 0) + wallUpcharge;
  const customPrice = Math.round(basePrice * (1 + upchargePct / 100));
  const fmtPrice = (n) => formatPrice(n);

  // Once the buyer adjusts any customization option (or enters wall dimensions),
  // the enquiry CTA becomes a direct "talk to our team" prompt.
  const hasCustomized =
    customForm.size !== "Standard" || customForm.frame !== "No frame" ||
    customForm.finish !== "Satin varnish" || customForm.palette !== "As created" ||
    !!wall.w || !!wall.h;
  const enquireLabel = hasCustomized ? "TALK TO ART COLISEUM TEAM" : "ENQUIRE NOW";

  // Build a human-readable available size range from the artwork's min/max.
  // Sculptures (category "sculpture") also carry a depth range.
  const isSculpture = productData?.categoryId === "sculpture";
  const sizeRange = (() => {
    if (!productData) return null;
    const { minWidth, maxWidth, minHeight, maxHeight, minDepth, maxDepth, unit } = productData;
    const hasWH = minWidth != null || maxWidth != null || minHeight != null || maxHeight != null;
    const hasD = minDepth != null || maxDepth != null;
    if (!hasWH && !hasD) return null;
    const span = (lo, hi) => lo != null && hi != null ? `${lo}–${hi}` : lo != null ? `from ${lo}` : hi != null ? `up to ${hi}` : "any";
    const parts = [`Width ${span(minWidth, maxWidth)}`, `Height ${span(minHeight, maxHeight)}`];
    if (isSculpture && hasD) parts.push(`Depth ${span(minDepth, maxDepth)}`);
    return `${parts.join(" · ")} ${unit || "cm"}`;
  })();

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
              <CircleBtn onClick={() => window.open(arUrl(productData.images[activeImg]), '_blank')}>
                <SparkIcon size={16} />
              </CircleBtn>
            </div>
          </div>
          {/* Thumbnail strip — small, fixed-size, horizontally scrollable (only when >1 image) */}
          {productData.images.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 12,
                overflowX: "auto",
                paddingBottom: 4,
                scrollbarWidth: "thin",
              }}>
              {productData.images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    flex: "0 0 auto",
                    width: 68,
                    height: 68,
                    border:
                      activeImg === i
                        ? "2px solid #D4AF37"
                        : "1px solid rgba(212,175,55,0.18)",
                    borderRadius: 6,
                    overflow: "hidden",
                    cursor: "pointer",
                    opacity: activeImg === i ? 1 : 0.6,
                    transition: "opacity 0.2s",
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
          )}
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

          {/* The single primary CTA lives inside the panel below (customise → act,
              or pick a size → buy). VIEW IN AR stays here as a secondary action. */}

          {/* VIEW IN AR */}
          <button
            onClick={() => window.open(arUrl(productData.images[activeImg]), '_blank')}
            style={{ ...pillBtn, width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            <SparkIcon size={14} /> VIEW IN AR
          </button>

          {/* Customisation panel — always visible when not predefined */}
          {!isPredefined && (
            <div style={{
              background: "rgba(212,175,55,0.04)",
              border: "1px solid rgba(212,175,55,0.18)",
              borderRadius: 12, padding: "20px 22px", marginBottom: 16,
            }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: sizeRange ? 8 : 16 }}>CUSTOMISE YOUR PIECE</div>
              {sizeRange && (
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.6)", marginBottom: 16 }}>
                  Available size range — {sizeRange}
                </div>
              )}

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

              {/* Live price: estimate before enquiry, quoted after, confirmed on approval */}
              <div style={{ borderTop: "1px solid rgba(212,175,55,0.15)", paddingTop: 14, marginBottom: 16 }}>
                {gate.state === "bring_home" ? (
                  <>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.16em", color: "rgba(200,191,160,0.5)", marginBottom: 4 }}>YOUR CONFIRMED PRICE</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 700, color: "#D4AF37", lineHeight: 1 }}>
                      {formatPrice(gate.final_price)}
                    </div>
                  </>
                ) : gate.quoted_price != null ? (
                  <>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.16em", color: "rgba(200,191,160,0.5)", marginBottom: 4 }}>YOUR PRICE · PENDING TEAM CONFIRMATION</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 700, color: "#D4AF37", lineHeight: 1 }}>
                      {formatPrice(gate.quoted_price)}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontStyle: "italic", color: "rgba(200,191,160,0.55)", lineHeight: 1.4 }}>
                      Price revealed after enquiry
                    </div>
                    <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.4)", marginTop: 6, lineHeight: 1.6 }}>
                      Our team will confirm your custom price.
                    </div>
                  </>
                )}
              </div>

              {/* Gate-driven CTA */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 32px rgba(212,175,55,0.35)" }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePrimaryCta}
                disabled={ctaBusy}
                style={{
                  width: "100%", padding: "14px",
                  background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                  color: "#0e0c0a", border: "none", borderRadius: 999,
                  fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", fontWeight: 700,
                  cursor: ctaBusy ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                {isApproved ? "BRING IT HOME" : enquireLabel}
              </motion.button>
            </div>
          )}

          {/* Predefined (fixed-price) panel — size options + price, bought directly */}
          {isPredefined && (
            <div style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 12, padding: "20px 22px", marginBottom: 16 }}>
              {sizes.length > 0 && (
                <>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 12 }}>SELECT SIZE</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                    {sizes.map((sz) => {
                      const sel = selectedSize?.id === sz.id;
                      return (
                        <button
                          key={sz.id}
                          onClick={() => setSelectedSize(sz)}
                          style={{
                            textAlign: "left", padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                            background: sel ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.02)",
                            border: `1px solid ${sel ? "#D4AF37" : "rgba(212,175,55,0.18)"}`,
                            transition: "all 0.15s",
                          }}>
                          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.12em", color: sel ? "#D4AF37" : "#e8e0d0", marginBottom: 3 }}>{sz.label}</div>
                          {(sz.width || sz.height) && (
                            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(200,191,160,0.5)", marginBottom: 4 }}>
                              {sz.width} × {sz.height} {sz.unit || ""}
                            </div>
                          )}
                          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "#D4AF37" }}>{fmtPrice(sz.price)}</div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, borderTop: sizes.length ? "1px solid rgba(212,175,55,0.12)" : "none", paddingTop: sizes.length ? 14 : 0 }}>
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.16em", color: "rgba(200,191,160,0.5)", marginBottom: 4 }}>
                    {selectedSize ? `${selectedSize.label.toUpperCase()} · TOTAL` : "PRICE"}
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: "#D4AF37", lineHeight: 1 }}>
                    {fmtPrice(selectedSize ? selectedSize.price : basePrice)}
                  </div>
                </div>
                {!sizes.length && productData.dimensions && (
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)" }}>{productData.dimensions}</div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 32px rgba(212,175,55,0.35)" }} whileTap={{ scale: 0.97 }}
                onClick={handlePrimaryCta}
                disabled={ctaBusy}
                style={{
                  width: "100%", padding: "14px",
                  background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                  color: "#0e0c0a", border: "none",
                  borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", fontWeight: 700,
                  cursor: ctaBusy ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                {user ? "BRING IT HOME" : "SIGN IN TO BUY"}
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      <ChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        conversationKey={`enquiry:${id}`}
        title={productData.title}
        subtitle={`Enquiry · ${productData.artist}`}
        avatar={productData.images?.[0]}
        intro={[
          `Thanks for your interest in "${productData.title}". A curator will share pricing and details with you shortly.`,
        ]}
        showTakeItHome={isApproved}
        takeItHomeLabel="Bring it home →"
        onTakeItHome={bringHome}
      />

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
          {productData.artistRole && (
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontStyle: "italic",
                fontSize: 16,
                color: "rgba(200,191,160,0.85)",
                marginBottom: 14,
                lineHeight: 1.6,
              }}>
              {productData.artistRole}
            </div>
          )}
          {productData.artistBio && (
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
          )}
          {productData.artistId && (
            <Link
              to={`/artists/${productData.artistId}`}
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: 11,
                letterSpacing: "0.16em",
                color: "#D4AF37",
              }}>
              VIEW FULL MONOGRAPH →
            </Link>
          )}
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

