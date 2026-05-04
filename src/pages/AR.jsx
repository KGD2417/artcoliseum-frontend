import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CameraIcon } from "../components/Icons";
import i1 from "../assets/i1.png";
import i2 from "../assets/i2.png";
import i4 from "../assets/i4.png";
import i5 from "../assets/i5.png";
import i6 from "../assets/i6.png";
import i7 from "../assets/i7.png";

const ARTWORKS = [
  { id: "p1", img: i1, title: "Ethereal Horizon", artist: "Marcus Thomas" },
  { id: "p2", img: i2, title: "Eternal Grace", artist: "Elena Vance" },
  { id: "p6", img: i4, title: "The Golden Tree", artist: "Chen Wei" },
  { id: "p7", img: i5, title: "Whispers of Silence", artist: "Lena Bach" },
  { id: "p5", img: i6, title: "Cosmic Flow", artist: "Hideo Tanaka" },
  { id: "p9", img: i7, title: "Azure Dreams", artist: "Hideo Tanaka" },
];

export default function AR() {
  const [selected, setSelected] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [requesting, setRequesting] = useState(false);
  const [placement, setPlacement] = useState({ x: 50, y: 45 });
  const [scale, setScale] = useState(28); // % of viewer width
  const [rotation, setRotation] = useState(0);
  const [facingMode, setFacingMode] = useState("environment");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const viewerRef = useRef(null);
  const dragState = useRef({ active: false, dx: 0, dy: 0 });

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    setRequesting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Your browser does not support camera access. Try Chrome, Safari or Edge over HTTPS.");
      }
      // Stop any existing stream before requesting again (e.g. when flipping)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: mode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err) {
      let msg = err?.message || "Could not access the camera.";
      if (err?.name === "NotAllowedError") msg = "Camera permission was denied. Enable it in your browser settings, then retry.";
      else if (err?.name === "NotFoundError") msg = "No camera was found on this device.";
      else if (err?.name === "NotReadableError") msg = "The camera is already in use by another app.";
      else if (location.protocol !== "https:" && location.hostname !== "localhost") msg = "Camera access requires HTTPS. Please open this site over a secure connection.";
      setCameraError(msg);
      setCameraActive(false);
    } finally {
      setRequesting(false);
    }
  };

  const flipCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    if (cameraActive) startCamera(next);
  };

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), []);

  const onViewerClick = (e) => {
    if (!cameraActive || !selected || dragState.current.active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPlacement({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  // Drag handlers (pointer events for mouse + touch)
  const onArtPointerDown = (e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rect = viewerRef.current.getBoundingClientRect();
    dragState.current = { active: true, rect };
  };
  const onArtPointerMove = (e) => {
    if (!dragState.current.active) return;
    const { rect } = dragState.current;
    setPlacement({
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    });
  };
  const onArtPointerUp = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    // Defer reset so onViewerClick (capture phase) doesn't re-place
    setTimeout(() => { dragState.current.active = false; }, 50);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "100px 24px 60px", background: "#080808" }}>
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
          color: "rgba(200,191,160,0.65)", maxWidth: 560, margin: "0 auto",
        }}>
          Point your phone or webcam at the wall where you'd like the piece to hang. Tap to place,
          drag to reposition, and use the controls to scale and rotate the work to scale.
        </p>
      </motion.div>

      <div style={{ display: "flex", gap: 32, flexWrap: "wrap", maxWidth: 1180, margin: "0 auto" }}>
        {/* artwork selector */}
        <motion.div
          style={{ flex: "0 0 280px", minWidth: 240 }}
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
            {ARTWORKS.map((art) => (
              <motion.div
                key={art.id}
                onClick={() => setSelected(art)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 14px", borderRadius: 6, cursor: "pointer",
                  border: selected?.id === art.id
                    ? "1px solid rgba(212,175,55,0.6)"
                    : "1px solid rgba(212,175,55,0.12)",
                  background: selected?.id === art.id
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
                    fontFamily: "'Cinzel',serif", fontSize: 9,
                    letterSpacing: "0.16em",
                    color: "rgba(200,191,160,0.55)", marginTop: 4,
                  }}>{art.artist.toUpperCase()}</div>
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
              <span style={{ color: "#4ade80", fontSize: 9, display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
                LIVE CAMERA
              </span>
            )}
          </div>

          {/* viewer canvas */}
          <div
            ref={viewerRef}
            onClick={onViewerClick}
            style={{
              position: "relative", width: "100%", paddingBottom: "62%",
              borderRadius: 10, overflow: "hidden",
              border: "1px solid rgba(212,175,55,0.2)",
              cursor: cameraActive && selected ? "crosshair" : "default",
              background: "#0a0a0a",
            }}>
            {/* live video — always mounted so srcObject persists */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover",
                display: cameraActive ? "block" : "none",
                transform: facingMode === "user" ? "scaleX(-1)" : "none",
              }}
            />

            {!cameraActive && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 16,
                color: "rgba(200,191,160,0.45)",
                background: "rgba(255,255,255,0.02)",
                padding: 24, textAlign: "center",
              }}>
                <CameraIcon size={48} />
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, maxWidth: 320, lineHeight: 1.6 }}>
                  {cameraError
                    ? <span style={{ color: "#f87171" }}>{cameraError}</span>
                    : selected
                      ? `Ready to place "${selected.title}". Activate the camera below — you'll be asked for permission.`
                      : "Select an artwork on the left, then activate the camera to preview it on your wall."}
                </div>
                {requesting && (
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "#D4AF37" }}>
                    REQUESTING CAMERA…
                  </div>
                )}
              </div>
            )}

            {/* placed artwork overlay */}
            <AnimatePresence>
              {cameraActive && selected && (
                <motion.div
                  key={selected.id}
                  onPointerDown={onArtPointerDown}
                  onPointerMove={onArtPointerMove}
                  onPointerUp={onArtPointerUp}
                  onPointerCancel={onArtPointerUp}
                  style={{
                    position: "absolute",
                    left: `${placement.x}%`,
                    top: `${placement.y}%`,
                    transform: `translate(-50%,-50%) rotate(${rotation}deg)`,
                    width: `${scale}%`,
                    boxShadow: "0 16px 50px rgba(0,0,0,0.6), 0 0 0 3px rgba(255,255,255,0.08)",
                    borderRadius: 3,
                    border: "6px solid #f5f0e8",
                    zIndex: 5,
                    cursor: "grab",
                    touchAction: "none",
                    userSelect: "none",
                  }}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}>
                  <img
                    src={selected.img} alt={selected.title}
                    draggable={false}
                    style={{ width: "100%", display: "block", borderRadius: 1, pointerEvents: "none" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {cameraActive && (
              <div style={{
                position: "absolute", bottom: 10, left: 16, right: 16,
                display: "flex", justifyContent: "space-between",
                fontFamily: "'Raleway',sans-serif", fontSize: 10,
                color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em",
                textShadow: "0 1px 4px rgba(0,0,0,0.6)",
              }}>
                <span>{selected ? "TAP TO PLACE · DRAG TO MOVE" : "SELECT AN ARTWORK"}</span>
                <span>{facingMode === "environment" ? "REAR CAMERA" : "FRONT CAMERA"}</span>
              </div>
            )}
          </div>

          {/* scale + rotate controls (only when camera live + art selected) */}
          {cameraActive && selected && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 14, padding: "14px 18px",
                border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: 8, background: "rgba(212,175,55,0.04)",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
              }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "#D4AF37" }}>
                  SIZE · {scale}%
                </span>
                <input
                  type="range" min={8} max={70} value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  style={{ accentColor: "#D4AF37" }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "#D4AF37" }}>
                  ROTATION · {rotation}°
                </span>
                <input
                  type="range" min={-15} max={15} value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  style={{ accentColor: "#D4AF37" }}
                />
              </label>
            </motion.div>
          )}

          {/* controls */}
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <motion.button
              className={cameraActive ? "btn-outline" : "btn-gold-main"}
              style={{ flex: 1, minWidth: 180, padding: "14px 20px", fontSize: 12 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={requesting}
              onClick={() => (cameraActive ? stopCamera() : startCamera())}>
              {requesting ? "STARTING…" : cameraActive ? "STOP CAMERA" : "ACTIVATE AR CAMERA"}
            </motion.button>
            {cameraActive && (
              <motion.button
                className="btn-outline"
                style={{ padding: "14px 20px", fontSize: 12 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={flipCamera}>
                FLIP CAMERA
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
                fontFamily: "'Cinzel',serif", fontSize: 11,
                letterSpacing: "0.18em",
                color: "#D4AF37", fontWeight: 600, marginTop: 10,
              }}>PRICE UPON REQUEST</div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
