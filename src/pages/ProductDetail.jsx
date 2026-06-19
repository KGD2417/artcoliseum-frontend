import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import ArtistAvatar from "../components/ArtistAvatar";
import ChatModal from "../components/ChatModal";
import {
  toggleCompare,
  isCompared,
  onCompareChange,
} from "../utils/compareStore";
import { SkeletonDetail } from "../components/ui/Skeleton";
import { ZoomIcon, SparkIcon } from "../components/Icons";
import { api } from "../utils/api";
import { convertDimsString } from "../utils/units";
import { useAuth } from "../context/Auth";
import { useLocale } from "../context/Locale";
import i4 from "../assets/i4.png";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [customForm, setCustomForm] = useState({
    frame: "No frame",
    finish: "Satin varnish",
    palette: "As created",
  });
  const [customDims, setCustomDims] = useState({ w: "", h: "", unit: "cm" });
  const [enquiryMsg, setEnquiryMsg] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [arOpen, setArOpen] = useState(false);
  const [compareOn, setCompareOn] = useState(false);
  useEffect(() => {
    const f = () => setCompareOn(isCompared(id));
    f();
    return onCompareChange(f);
  }, [id]);
  const [matched, setMatched] = useState(null);
  const [customizable, setCustomizable] = useState(true);
  const [artistInfo, setArtistInfo] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { formatPrice } = useLocale();
  const [chatOpen, setChatOpen] = useState(false);
  const [ctaBusy, setCtaBusy] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [dimUnit, setDimUnit] = useState("cm"); // cm | inch | feet — viewer's choice
  // Predefined (fixed-price) works show their price; customizable works price
  // instantly from the buyer's chosen W×H — both are buyable directly.
  const isPredefined = !customizable;

  const unitMap = { cm: "cm", inch: "inch", inches: "inch", feet: "feet" };

  const bringHome = async () => {
    setCtaBusy(true);
    try {
      const body = { artwork_id: id, fulfillment: "transport_setup" };
      if (selectedSize) body.size_id = selectedSize.id;
      // Customizable works: send the buyer's dimensions + options so the backend
      // computes the same total they were shown.
      if (customizable) {
        body.options = customForm;
        body.custom_width = parseFloat(customDims.w) || null;
        body.custom_height = parseFloat(customDims.h) || null;
        body.custom_unit = unitMap[customDims.unit] || "cm";
      }
      await api.cart.addItem(body);
      navigate("/cart");
    } catch (e) {
      alert(e.message);
    } finally {
      setCtaBusy(false);
    }
  };

  const handlePrimaryCta = async () => {
    if (!user) {
      navigate("/signin");
      return;
    }
    bringHome();
  };

  // Is this piece already on the buyer's wishlist? (only meaningful when signed in)
  useEffect(() => {
    if (!user || !id) return;
    let cancelled = false;
    api.wishlist
      .ids()
      .then((ids) => { if (!cancelled) setWishlisted((ids || []).includes(id)); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user, id]);

  // Save / unsave (heart) — optimistic, reverts on error.
  const toggleWishlist = async () => {
    if (!user) { navigate("/signin"); return; }
    if (wishBusy) return;
    const next = !wishlisted;
    setWishlisted(next);
    setWishBusy(true);
    try {
      if (next) await api.wishlist.add(id);
      else await api.wishlist.remove(id);
    } catch {
      setWishlisted(!next);   // revert on failure
    } finally {
      setWishBusy(false);
    }
  };

  // Optional — ask the team a question; opens the chat thread (and records a light enquiry).
  const openEnquiry = async () => {
    if (!user) {
      navigate("/signin");
      return;
    }
    try {
      await api.enquiries.create({
        artwork_id: id,
        message: enquiryMsg.trim() || undefined,
        options: customForm,
        custom_width: parseFloat(customDims.w) || null,
        custom_height: parseFloat(customDims.h) || null,
        custom_unit: unitMap[customDims.unit] || "cm",
      });
      setEnquiryMsg("");
    } catch {
      /* enquiry is best-effort */
    }
    setChatOpen(true);
  };

  // Fetch the artwork from the catalog API.
  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setMatched(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.catalog
      .artwork(id)
      .then((a) => {
        if (cancelled) return;
        setCustomizable(a.customizable !== false);
        setSizes(a.sizes || []);
        // No size pre-selected — the total stays hidden until the buyer chooses.
        setSelectedSize(null);
        setActiveImg(0);
        // Match the size unit to the artwork, but leave the dimensions blank so the
        // total only appears once the buyer enters a size of their own.
        if (a.customizable !== false) {
          const u =
            a.unit === "inch" ? "inches" : a.unit === "feet" ? "feet" : "cm";
          setCustomDims({ w: "", h: "", unit: u });
        }
        setMatched({
          title: a.title,
          artist: a.artist_name,
          year: a.year,
          price: a.price,
          images: a.images?.length ? a.images : [i4],
          videos: a.videos || [],
          medium: a.medium,
          dimensions: a.base_dimensions,
          description: a.description || a.narrative,
          unit: a.unit || "cm",
          pricePerUnit: a.price_per_unit,
          ratioLocked: a.ratio_locked,
          minWidth: a.min_width,
          maxWidth: a.max_width,
          minHeight: a.min_height,
          maxHeight: a.max_height,
          minDepth: a.min_depth,
          maxDepth: a.max_depth,
          categoryId: a.category_id,
          frameOptions: a.frame_options || null,
          finishOptions: a.finish_options || null,
          paletteOptions: a.palette_options || null,
        });
        // Pull the real artist profile (bio, photo) so the artist block isn't dummy.
        if (a.artist_id) {
          api.catalog
            .artist(a.artist_id)
            .then((ar) => {
              if (!cancelled) setArtistInfo(ar);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (!cancelled) setMatched(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const productData = matched
    ? {
        ...matched,
        badge: customizable ? "MADE TO YOUR SIZE" : "",
        availability: customizable
          ? "Priced to your size"
          : "Ready to bring home",
        certificate: "Digital Ledger Authenticity",
        artistImg: artistInfo?.image_url || null,
        artistGender: artistInfo?.gender || null,
        artistBio: artistInfo?.bio || "",
        artistRole: artistInfo?.role || "",
        artistId: artistInfo?.id || matched.artist_id || null,
        aboutArt: matched.description,
        frameOptions: matched.frameOptions || null,
        finishOptions: matched.finishOptions || null,
        paletteOptions: matched.paletteOptions || null,
      }
    : null;

  // Dimensions shown in the spec row: a chosen variant's own size wins over the
  // artwork's base size, so the figure always matches what the buyer is buying.
  const shownDims =
    selectedSize && (selectedSize.width || selectedSize.height)
      ? `${[selectedSize.width, selectedSize.height].filter(Boolean).join(" × ")} ${selectedSize.unit || "cm"}`
      : productData?.dimensions;

  // Unified media gallery: images first, then videos. `activeImg` indexes into it,
  // so a video plays right in the main viewer when its thumbnail is tapped.
  const media = productData
    ? [
        ...(productData.images || []).map((src) => ({ type: "image", src })),
        ...(productData.videos || []).map((src) => ({ type: "video", src })),
      ]
    : [];
  const activeMedia = media[activeImg] || media[0];
  // Zoom / AR always operate on a still image (never a video frame).
  const activeImageSrc = (productData?.images || [])[activeImg] || (productData?.images || [])[0];

  const UPCHARGES = {
    frame: {
      "No frame": 0,
      "Simple Wood": 8,
      "Hand-finished Walnut": 18,
      "Museum Grade UV Glass": 28,
      "Custom Gilded": 45,
    },
    finish: { "Satin varnish": 0, Matte: 0, "High gloss": 5, Unvarnished: 0 },
    palette: {
      "As created": 0,
      "Warmer tones": 10,
      "Cooler tones": 10,
      Monochrome: 15,
      Custom: 20,
    },
  };
  const arType = (() => {
    const m = (productData?.medium || "").toLowerCase();
    if (m.includes("sculpture")) return "sculpture";
    if (m.includes("mural") || m.includes("wallpaper")) return "mural";
    return "painting";
  })();
  const arUrl = (imgUrl) =>
    `/ar-view?image=${encodeURIComponent(imgUrl)}&type=${arType}`;

  // Unit conversion to cm; art_unit is the artwork's native measurement unit.
  const _toCm = { cm: 1, inch: 2.54, inches: 2.54, feet: 30.48 };
  const artUnit = productData?.unit || "cm";

  // Price is instant from the artwork's public per-unit price × chosen area.
  const ppu = productData?.pricePerUnit
    ? Number(productData.pricePerUnit)
    : null;
  const ratioLocked = !!productData?.ratioLocked;
  const hasDims = !!customDims.w && !!customDims.h;

  // Aspect ratio (W/H) for ratio-locked pieces — from base dimensions, else min.
  const aspect = (() => {
    const n = (productData?.dimensions || "").match(/[\d.]+/g);
    if (n && n.length >= 2 && parseFloat(n[1]))
      return parseFloat(n[0]) / parseFloat(n[1]);
    if (productData?.minWidth && productData?.minHeight)
      return Number(productData.minWidth) / Number(productData.minHeight);
    return null;
  })();
  const setDimW = (v) =>
    setCustomDims((d) => {
      const nd = { ...d, w: v };
      if (ratioLocked && aspect && v !== "" && !isNaN(parseFloat(v)))
        nd.h = (parseFloat(v) / aspect).toFixed(1);
      return nd;
    });
  const setDimH = (v) =>
    setCustomDims((d) => {
      const nd = { ...d, h: v };
      if (ratioLocked && aspect && v !== "" && !isNaN(parseFloat(v)))
        nd.w = (parseFloat(v) * aspect).toFixed(1);
      return nd;
    });

  // Compute live area in the artwork's native unit from the buyer's dimensions.
  const customArea = (() => {
    const w = parseFloat(customDims.w),
      h = parseFloat(customDims.h);
    if (!w || !h) return null;
    const wCm = w * (_toCm[customDims.unit] || 1);
    const hCm = h * (_toCm[customDims.unit] || 1);
    const artUnitCm = _toCm[artUnit] || 1;
    return (wCm / artUnitCm) * (hCm / artUnitCm);
  })();

  const basePrice = (() => {
    if (ppu && customArea) return ppu * customArea;
    if (productData?.price && productData.price > 0)
      return Number(productData.price);
    return 0;
  })();

  // Resolve per-artwork option tables, falling back to global UPCHARGES.
  const optTable = (key, artField) => {
    if (artField)
      return Object.fromEntries(artField.map((o) => [o.label, o.upcharge_pct]));
    return UPCHARGES[key] || {};
  };
  const optionLines = [
    [
      "Frame",
      customForm.frame,
      optTable("frame", productData?.frameOptions)[customForm.frame] ?? 0,
    ],
    [
      "Finish",
      customForm.finish,
      optTable("finish", productData?.finishOptions)[customForm.finish] ?? 0,
    ],
    [
      "Palette",
      customForm.palette,
      optTable("palette", productData?.paletteOptions)[customForm.palette] ?? 0,
    ],
  ];
  const optionUpchargePct = optionLines.reduce((s, [, , pct]) => s + pct, 0);
  const customPrice = Math.round(basePrice * (1 + optionUpchargePct / 100));
  // Price shows live once a width & height are entered and a per-unit/base price exists.
  const priceReady = hasDims && customPrice > 0;
  const fmtPrice = (n) => formatPrice(n);

  // Build a human-readable available size range from the artwork's min/max.
  // Sculptures (category "sculpture") also carry a depth range.
  const isSculpture = productData?.categoryId === "sculpture";
  const sizeRange = (() => {
    if (!productData) return null;
    const {
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      minDepth,
      maxDepth,
      unit,
    } = productData;
    const hasWH =
      minWidth != null ||
      maxWidth != null ||
      minHeight != null ||
      maxHeight != null;
    const hasD = minDepth != null || maxDepth != null;
    if (!hasWH && !hasD) return null;
    const span = (lo, hi) =>
      lo != null && hi != null
        ? `${lo}–${hi}`
        : lo != null
          ? `from ${lo}`
          : hi != null
            ? `up to ${hi}`
            : "any";
    const parts = [
      `Width ${span(minWidth, maxWidth)}`,
      `Height ${span(minHeight, maxHeight)}`,
    ];
    if (isSculpture && hasD) parts.push(`Depth ${span(minDepth, maxDepth)}`);
    return `${parts.join(" · ")} ${unit || "cm"}`;
  })();

  useEffect(() => {
    setActiveImg(0);
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <section
        style={{
          padding: "100px 24px 80px",
          maxWidth: 1280,
          margin: "0 auto",
        }}>
        <SkeletonDetail />
      </section>
    );
  }

  if (!productData) {
    return (
      <section style={{ padding: "160px 24px 120px", maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 14 }}>
          THE ARCHIVE
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 40, fontWeight: 700, color: "#fff", marginBottom: 14 }}>
          This artwork could not be found
        </h1>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.6)", lineHeight: 1.7, marginBottom: 32 }}>
          It may have been sold, removed from the collection, or the link is out of date.
        </p>
        <Link
          to="/gallery"
          style={{
            display: "inline-block", padding: "14px 36px",
            background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#0e0c0a",
            borderRadius: 999, textDecoration: "none",
            fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", fontWeight: 600,
          }}>
          BROWSE THE GALLERY →
        </Link>
      </section>
    );
  }

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
            {activeMedia?.type === "video" ? (
              <video
                key={activeMedia.src}
                src={activeMedia.src}
                controls
                playsInline
                preload="metadata"
                style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
              />
            ) : (
              <SafeImage
                src={activeMedia?.src || activeImageSrc}
                alt={productData.title}
                fallbackIndex={activeImg}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            )}
            <div
              style={{
                position: "absolute",
                bottom: 14,
                right: 14,
                display: "flex",
                gap: 10,
              }}>
              <CircleBtn
                onClick={toggleWishlist}
                title={wishlisted ? "Saved — remove from wishlist" : "Save for later"}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={wishlisted ? "#D4AF37" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </CircleBtn>
              {activeMedia?.type !== "video" && (
                <CircleBtn onClick={() => setZoomOpen(true)} title="Zoom in">
                  <ZoomIcon size={16} />
                </CircleBtn>
              )}
            </div>
          </div>
          {/* Thumbnail strip — images + videos; tap a video thumb to play it above. */}
          {media.length > 1 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 12,
                overflowX: "auto",
                paddingBottom: 4,
                scrollbarWidth: "thin",
              }}>
              {media.map((m, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{
                    position: "relative",
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
                    background: "#000",
                  }}>
                  {m.type === "video" ? (
                    <>
                      <video
                        src={m.src}
                        muted
                        playsInline
                        preload="metadata"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(0,0,0,0.25)",
                        }}>
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0.55)",
                            border: "1px solid rgba(212,175,55,0.7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                          <span style={{ marginLeft: 2, borderStyle: "solid", borderWidth: "5px 0 5px 8px", borderColor: "transparent transparent transparent #D4AF37" }} />
                        </span>
                      </span>
                    </>
                  ) : (
                    <SafeImage
                      src={m.src}
                      alt=""
                      fallbackIndex={i}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
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
              marginBottom: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
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
            <Meta
              label="DIMENSIONS"
              value={
                shownDims ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span>{convertDimsString(shownDims, dimUnit)}</span>
                    <span style={{ display: "inline-flex", gap: 4 }}>
                      {["cm", "inch", "feet"].map((u) => (
                        <button
                          key={u}
                          onClick={() => setDimUnit(u)}
                          style={{
                            padding: "2px 7px",
                            borderRadius: 999,
                            cursor: "pointer",
                            fontFamily: "'Cinzel',serif",
                            fontSize: 8,
                            letterSpacing: "0.1em",
                            background: dimUnit === u ? "rgba(212,175,55,0.18)" : "transparent",
                            border: `1px solid ${dimUnit === u ? "#D4AF37" : "rgba(212,175,55,0.25)"}`,
                            color: dimUnit === u ? "#D4AF37" : "rgba(200,191,160,0.6)",
                          }}>
                          {u === "inch" ? "in" : u === "feet" ? "ft" : "cm"}
                        </button>
                      ))}
                    </span>
                  </span>
                ) : (
                  shownDims || "—"
                )
              }
            />
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

          {/* Available size range */}
          {!isPredefined && sizeRange && (
            <div
              style={{
                fontFamily: "'Raleway',sans-serif",
                fontSize: 12,
                color: "rgba(200,191,160,0.6)",
                marginBottom: 14,
                fontStyle: "italic",
              }}>
              Available size range — {sizeRange}
            </div>
          )}

          {/* Customisation panel — instant pricing from W×H */}
          {!isPredefined && (
            <div
              style={{
                background: "rgba(212,175,55,0.04)",
                border: "1px solid rgba(212,175,55,0.18)",
                borderRadius: 12,
                padding: "20px 22px",
                marginBottom: 16,
              }}>
              <div
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: "#D4AF37",
                  marginBottom: 16,
                }}>
                CUSTOMISE YOUR PIECE
              </div>

              {/* Dimension inputs — shown by default */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}>
                  <span
                    style={{
                      fontFamily: "'Cinzel',serif",
                      fontSize: 9,
                      letterSpacing: "0.16em",
                      color: "rgba(212,175,55,0.7)",
                    }}>
                    YOUR DESIRED SIZE
                  </span>
                  {ratioLocked && (
                    <span
                      style={{
                        fontFamily: "'Raleway',sans-serif",
                        fontSize: 10,
                        color: "rgba(200,191,160,0.55)",
                      }}>
                      🔒 ratio locked
                    </span>
                  )}
                </div>
                <div
                  className="pd-wall-row"
                  style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                  <input
                    type="number"
                    placeholder="Width"
                    value={customDims.w}
                    onChange={(e) => setDimW(e.target.value)}
                    style={dimInput}
                  />
                  <input
                    type="number"
                    placeholder="Height"
                    value={customDims.h}
                    onChange={(e) => setDimH(e.target.value)}
                    style={dimInput}
                  />
                  <select
                    value={customDims.unit}
                    onChange={(e) =>
                      setCustomDims((d) => ({ ...d, unit: e.target.value }))
                    }
                    style={{
                      ...dimInput,
                      flex: "0 0 auto",
                      cursor: "pointer",
                    }}>
                    <option value="cm">cm</option>
                    <option value="inches">Inches</option>
                    <option value="feet">Feet</option>
                  </select>
                </div>
              </div>

              {/* Frame / Finish / Palette dropdowns */}
              <div
                className="pd-custom-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 12,
                  marginBottom: 16,
                }}>
                {[
                  [
                    "FRAME",
                    "frame",
                    productData?.frameOptions
                      ? productData.frameOptions.map((o) => o.label)
                      : Object.keys(UPCHARGES.frame),
                  ],
                  [
                    "FINISH",
                    "finish",
                    productData?.finishOptions
                      ? productData.finishOptions.map((o) => o.label)
                      : Object.keys(UPCHARGES.finish),
                  ],
                  [
                    "PALETTE",
                    "palette",
                    productData?.paletteOptions
                      ? productData.paletteOptions.map((o) => o.label)
                      : Object.keys(UPCHARGES.palette),
                  ],
                ].map(([label, key, opts]) => (
                  <div key={key}>
                    <div
                      style={{
                        fontFamily: "'Cinzel',serif",
                        fontSize: 9,
                        letterSpacing: "0.16em",
                        color: "rgba(212,175,55,0.65)",
                        marginBottom: 5,
                      }}>
                      {label}
                    </div>
                    <select
                      value={customForm[key]}
                      onChange={(e) =>
                        setCustomForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        background: "#111",
                        border: "1px solid rgba(212,175,55,0.2)",
                        borderRadius: 6,
                        color: "#e8e0d0",
                        fontFamily: "'Raleway',sans-serif",
                        fontSize: 12,
                        cursor: "pointer",
                        outline: "none",
                      }}>
                      {opts.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Live price breakdown */}
              <div
                style={{
                  borderTop: "1px solid rgba(212,175,55,0.15)",
                  paddingTop: 14,
                  marginBottom: 16,
                }}>
                {priceReady ? (
                  <>
                    <div
                      style={{
                        fontFamily: "'Cinzel',serif",
                        fontSize: 9,
                        letterSpacing: "0.16em",
                        color: "rgba(200,191,160,0.5)",
                        marginBottom: 10,
                      }}>
                      {ppu
                        ? `PRICE · ₹${ppu.toLocaleString("en-IN")} per ${artUnit}²`
                        : "PRICE"}
                    </div>
                    <Row
                      label={`Base · ${customDims.w} × ${customDims.h} ${customDims.unit}${customArea ? ` (≈ ${Math.round(customArea).toLocaleString("en-IN")} ${artUnit}²)` : ""}`}
                      value={fmtPrice(Math.round(basePrice))}
                    />
                    {optionLines
                      .filter(([, , pct]) => pct > 0)
                      .map(([lbl, val, pct]) => (
                        <Row
                          key={lbl}
                          muted
                          label={`${lbl} · ${val} (+${pct}%)`}
                          value={`+ ${fmtPrice(Math.round((basePrice * pct) / 100))}`}
                        />
                      ))}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        borderTop: "1px solid rgba(212,175,55,0.12)",
                        marginTop: 8,
                        paddingTop: 10,
                      }}>
                      <div
                        style={{
                          fontFamily: "'Cinzel',serif",
                          fontSize: 9,
                          letterSpacing: "0.16em",
                          color: "rgba(200,191,160,0.5)",
                        }}>
                        TOTAL
                      </div>
                      <div
                        style={{
                          fontFamily: "'Cormorant Garamond',serif",
                          fontSize: 36,
                          fontWeight: 700,
                          color: "#D4AF37",
                          lineHeight: 1,
                        }}>
                        {fmtPrice(customPrice)}
                      </div>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      fontFamily: "'Raleway',sans-serif",
                      fontSize: 13,
                      color: "rgba(200,191,160,0.55)",
                    }}>
                    {ppu
                      ? "Enter width & height above to see your price."
                      : "Enter your size, then talk to our team for pricing."}
                  </div>
                )}
              </div>

              {/* Primary CTA — Bring it home (once a size & price are set) */}
              {priceReady && (
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 32px rgba(212,175,55,0.35)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePrimaryCta}
                  disabled={ctaBusy}
                  style={{
                    ...goldCta,
                    marginBottom: 12,
                    opacity: ctaBusy ? 0.6 : 1,
                    cursor: ctaBusy ? "wait" : "pointer",
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  {user ? "BRING IT HOME" : "SIGN IN TO BUY"}
                </motion.button>
              )}

              {/* Secondary actions — compare & AR, paired on one row */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => toggleCompare(id)}
                  style={{
                    ...secondaryBtn,
                    color: compareOn ? "#D4AF37" : "rgba(212,175,55,0.9)",
                    background: compareOn ? "rgba(212,175,55,0.16)" : "transparent",
                    borderColor: compareOn ? "#D4AF37" : "rgba(212,175,55,0.4)",
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="4" width="7" height="16" rx="1"/>
                  </svg>
                  {compareOn ? "COMPARING" : "COMPARE"}
                </button>
                <button
                  onClick={() => setArOpen(true)}
                  style={secondaryBtn}>
                  <SparkIcon size={13} /> VIEW IN AR
                </button>
              </div>

              {/* Tertiary — talk to the team */}
              <button
                onClick={openEnquiry}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: "12px",
                  background: "transparent",
                  border: "1px solid rgba(212,175,55,0.4)",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontFamily: "'Cinzel',serif",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  color: "#D4AF37",
                }}>
                TALK TO ART COLISEUM TEAM →
              </button>
            </div>
          )}

          {/* Predefined (fixed-price) panel — size options + price, bought directly */}
          {isPredefined && (
            <div
              style={{
                background: "rgba(212,175,55,0.04)",
                border: "1px solid rgba(212,175,55,0.18)",
                borderRadius: 12,
                padding: "20px 22px",
                marginBottom: 16,
              }}>
              {sizes.length > 0 && (
                <>
                  <div
                    style={{
                      fontFamily: "'Cinzel',serif",
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      color: "#D4AF37",
                      marginBottom: 12,
                    }}>
                    SELECT A VARIANT
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginBottom: 18,
                    }}>
                    {sizes.map((sz) => {
                      const sel = selectedSize?.id === sz.id;
                      return (
                        <button
                          key={sz.id}
                          onClick={() => setSelectedSize(sz)}
                          style={{
                            textAlign: "left",
                            padding: "12px 14px",
                            borderRadius: 10,
                            cursor: "pointer",
                            background: sel
                              ? "rgba(212,175,55,0.12)"
                              : "rgba(255,255,255,0.02)",
                            border: `1px solid ${sel ? "#D4AF37" : "rgba(212,175,55,0.18)"}`,
                            transition: "all 0.15s",
                          }}>
                          <div
                            style={{
                              fontFamily: "'Cinzel',serif",
                              fontSize: 10,
                              letterSpacing: "0.12em",
                              color: sel ? "#D4AF37" : "#e8e0d0",
                              marginBottom: 3,
                            }}>
                            {sz.label}
                          </div>
                          {(sz.width || sz.height) && (
                            <div
                              style={{
                                fontFamily: "'Raleway',sans-serif",
                                fontSize: 10,
                                color: "rgba(200,191,160,0.5)",
                                marginBottom: 4,
                              }}>
                              {sz.width} × {sz.height} {sz.unit || ""}
                            </div>
                          )}
                          <div
                            style={{
                              fontFamily: "'Cormorant Garamond',serif",
                              fontSize: 18,
                              fontWeight: 700,
                              color: "#D4AF37",
                            }}>
                            {fmtPrice(sz.price)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              {/* Total stays hidden until a size is chosen (or there's a single fixed price). */}
              {selectedSize || !sizes.length ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: 18,
                    borderTop: sizes.length
                      ? "1px solid rgba(212,175,55,0.12)"
                      : "none",
                    paddingTop: sizes.length ? 14 : 0,
                  }}>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Cinzel',serif",
                        fontSize: 8,
                        letterSpacing: "0.16em",
                        color: "rgba(200,191,160,0.5)",
                        marginBottom: 4,
                      }}>
                      {selectedSize
                        ? `${selectedSize.label.toUpperCase()} · TOTAL`
                        : "TOTAL"}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 36,
                        fontWeight: 700,
                        color: "#D4AF37",
                        lineHeight: 1,
                      }}>
                      {fmtPrice(selectedSize ? selectedSize.price : basePrice)}
                    </div>
                  </div>
                  {!sizes.length && productData.dimensions && (
                    <div
                      style={{
                        fontFamily: "'Raleway',sans-serif",
                        fontSize: 12,
                        color: "rgba(200,191,160,0.55)",
                      }}>
                      {productData.dimensions}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    marginBottom: 18,
                    borderTop: "1px solid rgba(212,175,55,0.12)",
                    paddingTop: 14,
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 13,
                    color: "rgba(200,191,160,0.55)",
                  }}>
                  Select a size above to see your total.
                </div>
              )}
              {/* Primary CTA — Bring it home (once a size is chosen / single price) */}
              {(selectedSize || !sizes.length) && (
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 10px 32px rgba(212,175,55,0.35)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePrimaryCta}
                  disabled={ctaBusy}
                  style={{
                    ...goldCta,
                    marginBottom: 12,
                    opacity: ctaBusy ? 0.6 : 1,
                    cursor: ctaBusy ? "wait" : "pointer",
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  {user ? "BRING IT HOME" : "SIGN IN TO BUY"}
                </motion.button>
              )}

              {/* Secondary actions — compare & AR, paired on one row */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => toggleCompare(id)}
                  style={{
                    ...secondaryBtn,
                    color: compareOn ? "#D4AF37" : "rgba(212,175,55,0.9)",
                    background: compareOn ? "rgba(212,175,55,0.16)" : "transparent",
                    borderColor: compareOn ? "#D4AF37" : "rgba(212,175,55,0.4)",
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="7" height="16" rx="1"/><rect x="14" y="4" width="7" height="16" rx="1"/>
                  </svg>
                  {compareOn ? "COMPARING" : "COMPARE"}
                </button>
                <button
                  onClick={() => setArOpen(true)}
                  style={secondaryBtn}>
                  <SparkIcon size={13} /> VIEW IN AR
                </button>
              </div>

              {/* Tertiary — talk to the team */}
              <button
                onClick={openEnquiry}
                style={{
                  width: "100%",
                  marginTop: 12,
                  padding: "12px",
                  background: "transparent",
                  border: "1px solid rgba(212,175,55,0.4)",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontFamily: "'Cinzel',serif",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  color: "#D4AF37",
                }}>
                TALK TO ART COLISEUM TEAM →
              </button>
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
          `Thanks for your interest in "${productData.title}". A curator will reply shortly — you can also buy it directly on the page.`,
        ]}
      />

      {/* Zoom lightbox — full-screen view of the active image */}
      {zoomOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setZoomOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(6,5,4,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            cursor: "zoom-out",
          }}>
          <button
            onClick={() => setZoomOpen(false)}
            title="Close"
            style={{
              position: "absolute",
              top: 22,
              right: 26,
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(212,175,55,0.4)",
              color: "#D4AF37",
              fontSize: 22,
              lineHeight: 1,
              cursor: "pointer",
            }}>
            ×
          </button>
          <motion.img
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            src={activeImageSrc}
            alt={productData.title}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "92vw",
              maxHeight: "90vh",
              objectFit: "contain",
              borderRadius: 8,
              boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
              cursor: "default",
            }}
          />
        </motion.div>
      )}

      {/* View in AR — in-page overlay (stays on the product page; close to return) */}
      {arOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "#0a0a0a",
            display: "flex",
            flexDirection: "column",
          }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 20px",
              borderBottom: "1px solid rgba(212,175,55,0.18)",
              background: "rgba(10,10,10,0.9)",
              flexShrink: 0,
            }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, letterSpacing: "0.08em", color: "#f0ece4" }}>
              {productData.title} <span style={{ color: "#D4AF37" }}>· AR View</span>
            </div>
            <button
              onClick={() => setArOpen(false)}
              title="Close AR"
              style={{
                background: "transparent",
                border: "1px solid rgba(212,175,55,0.3)",
                color: "#D4AF37",
                borderRadius: 999,
                padding: "7px 18px",
                fontFamily: "'Cinzel',serif",
                fontSize: 10,
                letterSpacing: "0.16em",
                cursor: "pointer",
              }}>
              ✕ CLOSE
            </button>
          </div>
          <iframe
            title="Art Coliseum AR"
            src={`/ar-launcher.html?image=${encodeURIComponent(activeImageSrc)}&type=${encodeURIComponent(arType)}`}
            allow="camera; xr-spatial-tracking; accelerometer; gyroscope; magnetometer"
            style={{ flex: 1, width: "100%", border: "none" }}
          />
        </motion.div>
      )}

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
        {productData.artistImg ? (
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
        ) : (
          <ArtistAvatar
            gender={productData.artistGender}
            size={180}
            style={{ border: "2px solid rgba(212,175,55,0.4)" }}
          />
        )}
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
  padding: "14px",
  background: "transparent",
  color: "#e8e0d0",
  fontFamily: "'Cinzel',serif",
  fontSize: 13,
  letterSpacing: "0.18em",
  border: "1px solid rgba(212,175,55,0.4)",
  borderRadius: 999,
  cursor: "pointer",
};

const dimInput = {
  flex: 1,
  padding: "10px 12px",
  background: "#111",
  border: "1px solid rgba(212,175,55,0.2)",
  borderRadius: 6,
  color: "#e8e0d0",
  fontFamily: "'Raleway',sans-serif",
  fontSize: 14,
  outline: "none",
  textAlign: "center",
};

const goldCta = {
  width: "100%",
  padding: "15px",
  background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
  color: "#0e0c0a",
  border: "none",
  borderRadius: 999,
  fontFamily: "'Cinzel',serif",
  fontSize: 13,
  letterSpacing: "0.2em",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
};

// Compact, equal-width secondary action (Compare / View in AR) — sits in a row
// so the panel reads as one primary CTA + a pair of secondaries, not a stack.
const secondaryBtn = {
  flex: 1,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "11px 10px",
  borderRadius: 999,
  cursor: "pointer",
  border: "1px solid rgba(212,175,55,0.4)",
  background: "transparent",
  color: "rgba(212,175,55,0.9)",
  fontFamily: "'Cinzel',serif",
  fontSize: 10,
  letterSpacing: "0.12em",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

function Row({ label, value, muted }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 6,
      }}>
      <span
        style={{
          fontFamily: "'Raleway',sans-serif",
          fontSize: 13,
          color: muted ? "rgba(200,191,160,0.5)" : "rgba(200,191,160,0.75)",
        }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: "'Raleway',sans-serif",
          fontSize: 14,
          color: muted ? "rgba(200,191,160,0.6)" : "#e8e0d0",
        }}>
        {value}
      </span>
    </div>
  );
}

function CircleBtn({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
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
