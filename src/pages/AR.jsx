import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ARTWORKS = [
  { img: "src/assets/i1.png", title: "Golden Horizon",    price: "$2,400" },
  { img: "src/assets/i2.png", title: "Eternal Grace",     price: "$3,800" },
  { img: "src/assets/i4.png", title: "The Golden Tree",   price: "$2,100" },
  { img: "src/assets/i5.png", title: "Whispers of Silence", price: "$1,700" },
  { img: "src/assets/i6.png", title: "Cosmic Flow",       price: "$1,950" },
  { img: "src/assets/i7.png", title: "Azure Dreams",      price: "$2,800" },
];

export default function AR() {
  const [selected, setSelected] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [placement, setPlacement] = useState({ x: 50, y: 40 });
  const [dragging, setDragging] = useState(false);

  const handlePlaceholderClick = (e) => {
    if (!cameraActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPlacement({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div style={{ minHeight: "100vh", padding: "100px 24px 60px", background: "#080808" }}>
      {/* header */}
      <motion.div
        style={{ textAlign: "center", marginBottom: "48px" }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "16px" }}>
          <motion.div
            style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
              color: "#1a1a1a", fontFamily: "'Cinzel',serif", fontSize: 16,
              fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 30px rgba(212,175,55,0.5)",
            }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}>
            AR
          </motion.div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,5vw,56px)",
            fontWeight: 700, color: "#fff",
          }}>
            Art in Your <span style={{ color: "#D4AF37", fontStyle: "italic" }}>Space</span>
          </h1>
        </div>
        <p style={{
          fontFamily: "'Raleway',sans-serif", fontSize: 15,
          color: "rgba(200,191,160,0.65)", maxWidth: 520, margin: "0 auto",
        }}>
          Select an artwork, activate the viewer, then click anywhere on the preview to place
          it virtually on your wall before purchasing.
        </p>
      </motion.div>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", maxWidth: 1100, margin: "0 auto" }}>
        {/* artwork selector */}
        <motion.div
          style={{ flex: "0 0 300px", minWidth: 260 }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}>
          <div style={{
            fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em",
            color: "#D4AF37", marginBottom: 18, textTransform: "uppercase",
          }}>
            Select Artwork
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ARTWORKS.map((art, i) => (
              <motion.div
                key={i}
                onClick={() => setSelected(art)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 14px", borderRadius: 6, cursor: "pointer",
                  border: selected?.title === art.title
                    ? "1px solid rgba(212,175,55,0.6)"
                    : "1px solid rgba(212,175,55,0.12)",
                  background: selected?.title === art.title
                    ? "rgba(212,175,55,0.07)"
                    : "rgba(255,255,255,0.02)",
                  transition: "all 0.25s",
                }}
                whileHover={{ borderColor: "rgba(212,175,55,0.4)", background: "rgba(212,175,55,0.04)" }}>
                <img
                  src={art.img} alt={art.title}
                  style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
                />
                <div>
                  <div style={{
                    fontFamily: "'Cormorant Garamond',serif", fontSize: 16,
                    color: "#f0e8d8", fontWeight: 600,
                  }}>{art.title}</div>
                  <div style={{
                    fontFamily: "'Raleway',sans-serif", fontSize: 11,
                    color: "#D4AF37", marginTop: 2,
                  }}>{art.price}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AR viewer */}
        <motion.div
          style={{ flex: 1, minWidth: 280 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}>
          <div style={{
            fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em",
            color: "#D4AF37", marginBottom: 18, textTransform: "uppercase",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>AR Preview</span>
            {cameraActive && (
              <span style={{ color: "#4ade80", fontSize: 9 }}>● LIVE</span>
            )}
          </div>

          {/* viewer canvas */}
          <div
            onClick={handlePlaceholderClick}
            style={{
              position: "relative", width: "100%", paddingBottom: "62%",
              borderRadius: 10, overflow: "hidden",
              border: "1px solid rgba(212,175,55,0.2)",
              cursor: cameraActive ? "crosshair" : "default",
              background: cameraActive
                ? "linear-gradient(135deg,#0d1117 0%,#1a2535 40%,#0d1117 100%)"
                : "rgba(255,255,255,0.02)",
            }}>
            <div style={{ position: "absolute", inset: 0 }}>
              {!cameraActive ? (
                /* idle state */
                <div style={{
                  height: "100%", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 16,
                  color: "rgba(200,191,160,0.35)",
                }}>
                  <div style={{ fontSize: 48 }}>📷</div>
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, textAlign: "center", maxWidth: 240 }}>
                    {selected
                      ? `Ready to place "${selected.title}" — activate viewer below`
                      : "Select an artwork first, then activate the viewer"}
                  </div>
                </div>
              ) : (
                /* simulated room */
                <>
                  {/* room lines */}
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }}>
                    <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#D4AF37" strokeWidth="1" />
                    <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#D4AF37" strokeWidth="0.5" />
                    <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#D4AF37" strokeWidth="0.5" />
                  </svg>

                  <div style={{
                    position: "absolute", bottom: 8, left: 16,
                    fontFamily: "'Raleway',sans-serif", fontSize: 10,
                    color: "rgba(200,191,160,0.4)", letterSpacing: "0.1em",
                  }}>
                    CLICK WALL TO PLACE ARTWORK
                  </div>

                  {/* placed artwork */}
                  <AnimatePresence>
                    {selected && (
                      <motion.div
                        key={selected.title}
                        style={{
                          position: "absolute",
                          left: `${placement.x}%`,
                          top: `${placement.y}%`,
                          transform: "translate(-50%,-50%)",
                          width: "22%",
                          boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 0 0 3px rgba(255,255,255,0.08)",
                          borderRadius: 3,
                          border: "6px solid #f5f0e8",
                          zIndex: 5,
                        }}
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ type: "spring", stiffness: 280, damping: 22 }}
                        drag
                        dragMomentum={false}>
                        <img
                          src={selected.img} alt={selected.title}
                          style={{ width: "100%", display: "block", borderRadius: 1 }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>

          {/* controls */}
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <motion.button
              className={cameraActive ? "btn-outline" : "btn-gold-main"}
              style={{ flex: 1, padding: "14px 20px", fontSize: 12 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCameraActive((v) => !v)}>
              {cameraActive ? "STOP VIEWER" : "ACTIVATE AR VIEWER"}
            </motion.button>
            {selected && cameraActive && (
              <motion.button
                className="btn-gold-main"
                style={{ padding: "14px 20px", fontSize: 12 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}>
                ADD TO CART — {selected.price}
              </motion.button>
            )}
          </div>

          {selected && (
            <motion.div
              style={{
                marginTop: 18, padding: "18px 20px",
                border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: 8, background: "rgba(212,175,55,0.04)",
              }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{
                fontFamily: "'Cormorant Garamond',serif", fontSize: 22,
                color: "#f0e8d8", fontWeight: 600,
              }}>{selected.title}</div>
              <div style={{
                fontFamily: "'Raleway',sans-serif", fontSize: 11,
                color: "rgba(200,191,160,0.55)", marginTop: 4,
              }}>
                Certificate of Authenticity included · Free insured shipping
              </div>
              <div style={{
                fontFamily: "'Cormorant Garamond',serif", fontSize: 26,
                color: "#D4AF37", fontWeight: 700, marginTop: 8,
              }}>{selected.price}</div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
