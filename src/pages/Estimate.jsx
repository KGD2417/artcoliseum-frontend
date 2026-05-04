import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Pricing helpers ─────────────────────────────── */
const FLAT_TIERS = [
  { max: 2,   low: 500,    high: 2000  },
  { max: 5,   low: 2000,   high: 8000  },
  { max: 10,  low: 8000,   high: 20000 },
  { max: 20,  low: 20000,  high: 50000 },
  { max: Infinity, low: 50000, high: null },
];

const FRAME_ADDERS = {
  none:     { label: "No Frame",             pct: 0    },
  simple:   { label: "Simple Wood",          pct: 0.08 },
  walnut:   { label: "Hand-finished Walnut", pct: 0.15 },
  museum:   { label: "Museum Grade",         pct: 0.25 },
  gilded:   { label: "Custom Gilded",        pct: 0.40 },
};

const BRONZE_BASE = { S: [3000,8000], M: [8000,25000], L: [25000,80000] };
const MATERIAL_FACTORS = {
  Bronze:      1,
  Marble:      1.2,
  Ceramic:     0.6,
  Steel:       1.0,
  Wood:        0.7,
  "Mixed Media": null, // special
};
const SIZE_KEYS = { S: "S", M: "M", L: "L" };

function fmt(n) {
  if (n == null) return "—";
  return "$" + n.toLocaleString("en-US");
}

function flatEstimate(w, h, frame) {
  const wNum = parseFloat(w);
  const hNum = parseFloat(h);
  if (!wNum || !hNum || wNum <= 0 || hNum <= 0) return null;
  const sqft = (wNum * hNum) / 144;
  const tier = FLAT_TIERS.find((t) => sqft <= t.max);
  const pct = FRAME_ADDERS[frame]?.pct ?? 0;
  const low = Math.round(tier.low * (1 + pct));
  const high = tier.high ? Math.round(tier.high * (1 + pct)) : null;
  return { sqft: sqft.toFixed(2), low, high };
}

function sculptureEstimate(material, size) {
  if (!material || !size) return null;
  if (material === "Mixed Media") {
    return { low: 2000, high: 50000 };
  }
  const factor = MATERIAL_FACTORS[material];
  const [baseLow, baseHigh] = BRONZE_BASE[size];
  return {
    low: Math.round(baseLow * factor),
    high: Math.round(baseHigh * factor),
  };
}

/* ─── Sub-components ─────────────────────────────── */
function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.22em",
      color: "#D4AF37", marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

function InputLabel({ children }) {
  return (
    <div style={{
      fontFamily: "'Raleway',sans-serif", fontSize: 11,
      letterSpacing: "0.1em", color: "#D4AF37", marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(212,175,55,0.2)",
  borderRadius: 8,
  padding: "13px 16px",
  color: "#e8e0d0",
  fontFamily: "'Raleway',sans-serif",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.2s",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23D4AF37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
  paddingRight: 36,
};

function EstimateReveal({ low, high, sqft, note }) {
  return (
    <motion.div
      key={low + "-" + high}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        background: "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.03))",
        border: "1px solid rgba(212,175,55,0.3)",
        borderRadius: 16,
        padding: "32px 36px",
        marginTop: 32,
        textAlign: "center",
      }}>
      {sqft && (
        <div style={{
          fontFamily: "'Raleway',sans-serif", fontSize: 12,
          color: "rgba(200,191,160,0.55)", marginBottom: 16, letterSpacing: "0.05em",
        }}>
          {sqft} sq ft artwork
        </div>
      )}
      <div style={{
        fontFamily: "'Cinzel',serif", fontSize: 10,
        letterSpacing: "0.22em", color: "rgba(212,175,55,0.7)", marginBottom: 12,
      }}>
        ESTIMATED VALUE RANGE
      </div>
      <div style={{
        fontFamily: "'Cormorant Garamond',serif",
        fontSize: "clamp(32px,5vw,52px)",
        fontWeight: 700, color: "#fff", letterSpacing: "0.01em", lineHeight: 1.1,
      }}>
        {fmt(low)}
        {high ? (
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65em" }}> — </span>
        ) : (
          <span style={{ color: "#D4AF37", fontSize: "0.55em" }}> +</span>
        )}
        {high && <span>{fmt(high)}</span>}
      </div>
      {note && (
        <div style={{
          fontFamily: "'Raleway',sans-serif", fontSize: 12,
          color: "rgba(200,191,160,0.5)", marginTop: 16, lineHeight: 1.6,
        }}>
          {note}
        </div>
      )}
    </motion.div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        padding: "12px 28px",
        background: active ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "rgba(255,255,255,0.04)",
        color: active ? "#0e0c0a" : "rgba(200,191,160,0.7)",
        border: active ? "1px solid transparent" : "1px solid rgba(212,175,55,0.2)",
        borderRadius: 999,
        fontFamily: "'Cinzel',serif", fontSize: 10,
        letterSpacing: "0.18em",
        cursor: "pointer",
        fontWeight: active ? 600 : 400,
        transition: "all 0.2s",
      }}>
      {children}
    </motion.button>
  );
}

/* ─── Main component ─────────────────────────────── */
export default function Estimate() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("flat");

  // Flat state
  const [flatW, setFlatW] = useState("");
  const [flatH, setFlatH] = useState("");
  const [flatFrame, setFlatFrame] = useState("none");
  const flatResult = flatEstimate(flatW, flatH, flatFrame);

  // Sculpture state
  const [sculMat, setSculMat] = useState("");
  const [sculSize, setSculSize] = useState("");
  const sculResult = sculptureEstimate(sculMat, sculSize);

  // Framed state
  const [framedW, setFramedW] = useState("");
  const [framedH, setFramedH] = useState("");
  const [framedType, setFramedType] = useState("museum");
  const framedResult = flatEstimate(framedW, framedH, framedType);

  return (
    <section style={{ background: "#080808", minHeight: "100vh", padding: "110px 24px 100px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: "center", marginBottom: 56 }}>
          <div className="gold-rule" style={{ justifyContent: "center" }}>
            <div className="grl" style={{ background: "linear-gradient(90deg, transparent, #D4AF37)" }} />
            <span className="grt">Value Exploration</span>
            <div className="grl" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
          </div>
          <h1 className="section-heading">
            <span className="bold-white">Artwork</span> <em>Estimate</em>
          </h1>
          <p style={{
            fontFamily: "'Raleway',sans-serif", fontSize: 14,
            color: "rgba(200,191,160,0.6)", maxWidth: 540, margin: "16px auto 0", lineHeight: 1.7,
          }}>
            Explore the estimated value of your chosen work before beginning the full enquiry and
            customisation flow with your artist.
          </p>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 48, flexWrap: "wrap" }}>
          <TabBtn active={tab === "flat"} onClick={() => setTab("flat")}>FLAT ARTWORKS</TabBtn>
          <TabBtn active={tab === "sculpture"} onClick={() => setTab("sculpture")}>SCULPTURES</TabBtn>
          <TabBtn active={tab === "framed"} onClick={() => setTab("framed")}>FRAMED PIECES</TabBtn>
        </div>

        {/* Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(212,175,55,0.15)",
              borderRadius: 20,
              padding: "48px 52px",
            }}>

            {/* ── FLAT ARTWORKS ── */}
            {tab === "flat" && (
              <>
                <SectionLabel>PAINTINGS · PRINTS · DRAWINGS</SectionLabel>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond',serif", fontSize: 36,
                  fontWeight: 700, color: "#fff", marginBottom: 32, lineHeight: 1,
                }}>
                  Flat Artwork <em style={{ fontWeight: 300 }}>Calculator</em>
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div>
                    <InputLabel>WIDTH (inches)</InputLabel>
                    <input
                      type="number" min="1" value={flatW}
                      onChange={e => setFlatW(e.target.value)}
                      placeholder="e.g. 36"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <InputLabel>HEIGHT (inches)</InputLabel>
                    <input
                      type="number" min="1" value={flatH}
                      onChange={e => setFlatH(e.target.value)}
                      placeholder="e.g. 48"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  <InputLabel>FRAME TYPE</InputLabel>
                  <div style={{ position: "relative" }}>
                    <select
                      value={flatFrame}
                      onChange={e => setFlatFrame(e.target.value)}
                      style={selectStyle}>
                      {Object.entries(FRAME_ADDERS).map(([k, v]) => (
                        <option key={k} value={k} style={{ background: "#1a1610" }}>
                          {v.label}{v.pct > 0 ? ` (+${Math.round(v.pct * 100)}%)` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing tiers hint */}
                <div style={{
                  marginTop: 24,
                  display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8,
                }}>
                  {FLAT_TIERS.map((t, i) => (
                    <div key={i} style={{
                      background: "rgba(212,175,55,0.04)",
                      border: "1px solid rgba(212,175,55,0.12)",
                      borderRadius: 8, padding: "10px 8px", textAlign: "center",
                    }}>
                      <div style={{
                        fontFamily: "'Cinzel',serif", fontSize: 8,
                        letterSpacing: "0.1em", color: "rgba(212,175,55,0.7)", marginBottom: 4,
                      }}>
                        {i === 0 ? "< 2 ft²" :
                          i === 4 ? "> 20 ft²" :
                          `${FLAT_TIERS[i-1].max}–${t.max} ft²`}
                      </div>
                      <div style={{
                        fontFamily: "'Cormorant Garamond',serif", fontSize: 12,
                        color: "rgba(200,191,160,0.7)", lineHeight: 1.3,
                      }}>
                        {fmt(t.low)}{t.high ? `–${fmt(t.high)}` : "+"}
                      </div>
                    </div>
                  ))}
                </div>

                {flatResult && (
                  <EstimateReveal
                    low={flatResult.low}
                    high={flatResult.high}
                    sqft={flatResult.sqft}
                  />
                )}
              </>
            )}

            {/* ── SCULPTURES ── */}
            {tab === "sculpture" && (
              <>
                <SectionLabel>BRONZE · MARBLE · CERAMIC · STEEL · WOOD</SectionLabel>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond',serif", fontSize: 36,
                  fontWeight: 700, color: "#fff", marginBottom: 32, lineHeight: 1,
                }}>
                  Sculpture <em style={{ fontWeight: 300 }}>Calculator</em>
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div>
                    <InputLabel>MATERIAL</InputLabel>
                    <div style={{ position: "relative" }}>
                      <select
                        value={sculMat}
                        onChange={e => setSculMat(e.target.value)}
                        style={selectStyle}>
                        <option value="" style={{ background: "#1a1610" }}>Select material…</option>
                        {Object.keys(MATERIAL_FACTORS).map(m => (
                          <option key={m} value={m} style={{ background: "#1a1610" }}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <InputLabel>SIZE</InputLabel>
                    <div style={{ position: "relative" }}>
                      <select
                        value={sculSize}
                        onChange={e => setSculSize(e.target.value)}
                        style={selectStyle}>
                        <option value="" style={{ background: "#1a1610" }}>Select size…</option>
                        <option value="S" style={{ background: "#1a1610" }}>Small (under 30 cm)</option>
                        <option value="M" style={{ background: "#1a1610" }}>Medium (30 – 80 cm)</option>
                        <option value="L" style={{ background: "#1a1610" }}>Large (over 80 cm)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Material info */}
                <div style={{
                  marginTop: 24, display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)", gap: 10,
                }}>
                  {[
                    { m: "Bronze", note: "Reference pricing" },
                    { m: "Marble", note: "+20% premium" },
                    { m: "Ceramic", note: "−40% accessible" },
                    { m: "Steel", note: "Similar to bronze" },
                    { m: "Wood", note: "−30% natural" },
                    { m: "Mixed Media", note: "Wide range" },
                  ].map(({ m, note }) => (
                    <div key={m} style={{
                      background: sculMat === m ? "rgba(212,175,55,0.1)" : "rgba(212,175,55,0.03)",
                      border: `1px solid ${sculMat === m ? "rgba(212,175,55,0.35)" : "rgba(212,175,55,0.1)"}`,
                      borderRadius: 8, padding: "10px 12px", cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                      onClick={() => setSculMat(m)}>
                      <div style={{
                        fontFamily: "'Cormorant Garamond',serif", fontSize: 15,
                        color: sculMat === m ? "#D4AF37" : "rgba(200,191,160,0.8)",
                        marginBottom: 2,
                      }}>{m}</div>
                      <div style={{
                        fontFamily: "'Raleway',sans-serif", fontSize: 10,
                        color: "rgba(200,191,160,0.45)",
                      }}>{note}</div>
                    </div>
                  ))}
                </div>

                {sculResult && (
                  <EstimateReveal
                    low={sculResult.low}
                    high={sculResult.high}
                    note={sculMat === "Mixed Media" ? "Mixed Media sculptures vary greatly by complexity, materials, and edition size." : undefined}
                  />
                )}
              </>
            )}

            {/* ── FRAMED PIECES ── */}
            {tab === "framed" && (
              <>
                <SectionLabel>CANVAS + FRAME COMBINED ESTIMATE</SectionLabel>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond',serif", fontSize: 36,
                  fontWeight: 700, color: "#fff", marginBottom: 32, lineHeight: 1,
                }}>
                  Framed <em style={{ fontWeight: 300 }}>Piece Calculator</em>
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  <div>
                    <InputLabel>WIDTH (inches)</InputLabel>
                    <input
                      type="number" min="1" value={framedW}
                      onChange={e => setFramedW(e.target.value)}
                      placeholder="e.g. 24"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <InputLabel>HEIGHT (inches)</InputLabel>
                    <input
                      type="number" min="1" value={framedH}
                      onChange={e => setFramedH(e.target.value)}
                      placeholder="e.g. 30"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  <InputLabel>FRAME TYPE</InputLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 }}>
                    {Object.entries(FRAME_ADDERS).map(([k, v]) => (
                      <div
                        key={k}
                        onClick={() => setFramedType(k)}
                        style={{
                          background: framedType === k ? "rgba(212,175,55,0.1)" : "rgba(212,175,55,0.03)",
                          border: `1px solid ${framedType === k ? "rgba(212,175,55,0.4)" : "rgba(212,175,55,0.12)"}`,
                          borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                          transition: "all 0.2s",
                        }}>
                        <div style={{
                          fontFamily: "'Cormorant Garamond',serif", fontSize: 16,
                          color: framedType === k ? "#D4AF37" : "rgba(200,191,160,0.85)",
                          marginBottom: 4,
                        }}>
                          {v.label}
                        </div>
                        <div style={{
                          fontFamily: "'Cinzel',serif", fontSize: 9,
                          letterSpacing: "0.1em",
                          color: v.pct > 0 ? "rgba(212,175,55,0.6)" : "rgba(200,191,160,0.35)",
                        }}>
                          {v.pct > 0 ? `+${Math.round(v.pct * 100)}% of artwork value` : "No additional cost"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {framedResult && (
                  <EstimateReveal
                    low={framedResult.low}
                    high={framedResult.high}
                    sqft={framedResult.sqft}
                    note={`Includes ${FRAME_ADDERS[framedType].label} framing.`}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: 36,
            padding: "20px 28px",
            background: "rgba(212,175,55,0.04)",
            border: "1px solid rgba(212,175,55,0.12)",
            borderRadius: 12,
            display: "flex", gap: 14, alignItems: "flex-start",
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{
            fontFamily: "'Raleway',sans-serif", fontSize: 13,
            color: "rgba(200,191,160,0.55)", lineHeight: 1.7,
          }}>
            <strong style={{ color: "rgba(200,191,160,0.75)" }}>Exploratory estimate only.</strong>{" "}
            This calculator provides a broad value range based on standard market data. Exact pricing
            is determined by the specific artist, provenance, medium quality, and edition size — and
            is revealed only after completing the full enquiry and customisation flow with your
            chosen artist.
          </p>
        </motion.div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: 52 }}>
          <p style={{
            fontFamily: "'Cormorant Garamond',serif", fontSize: 22,
            color: "rgba(200,191,160,0.7)", marginBottom: 24, fontStyle: "italic",
          }}>
            Ready to begin the conversation with an artist?
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 12px 36px rgba(212,175,55,0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/contact")}
            style={{
              padding: "17px 48px",
              background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
              color: "#0e0c0a",
              border: "none",
              borderRadius: 999,
              fontFamily: "'Cinzel',serif", fontSize: 12,
              letterSpacing: "0.2em", fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(212,175,55,0.25)",
            }}>
            ENQUIRE NOW
          </motion.button>
        </div>
      </div>
    </section>
  );
}
