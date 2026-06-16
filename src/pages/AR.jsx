import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CameraIcon } from "../components/Icons";
import { runSegmentation, extractSurfaces, pickSurfaceFromPrompt, drawSurfaceOverlays } from "../utils/segmentation";
import { compositeArtwork, compositeGroundShadow } from "../utils/homography";
import { analyzeRoomPlacement, hasGeminiKey } from "../utils/geminiVisualizer";
import { api } from "../utils/api";
import i1 from "../assets/i1.png";
import i2 from "../assets/i2.png";
import i4 from "../assets/i4.png";
import i5 from "../assets/i5.png";
import i6 from "../assets/i6.png";
import i7 from "../assets/i7.png";

const ARTWORKS = [
  { id: "p1", img: i1, title: "Ethereal Horizon",    artist: "Marcus Thomas" },
  { id: "p2", img: i2, title: "Eternal Grace",       artist: "Elena Vance"   },
  { id: "p6", img: i4, title: "The Golden Tree",     artist: "Chen Wei"      },
  { id: "p7", img: i5, title: "Whispers of Silence", artist: "Lena Bach"     },
  { id: "p5", img: i6, title: "Cosmic Flow",         artist: "Hideo Tanaka"  },
  { id: "p9", img: i7, title: "Azure Dreams",        artist: "Hideo Tanaka"  },
];

// ─── Camera AR mode (unchanged original) ─────────────────────────────────────
function CameraARMode() {
  const [selected, setSelected]     = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError]   = useState(null);
  const [requesting, setRequesting]     = useState(false);
  const [placement, setPlacement]       = useState({ x: 50, y: 45 });
  const [scale, setScale]               = useState(28);
  const [rotation, setRotation]         = useState(0);
  const [facingMode, setFacingMode]     = useState("environment");

  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const viewerRef  = useRef(null);
  const dragState  = useRef({ active: false });

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    setRequesting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("no-api");
      streamRef.current?.getTracks().forEach((t) => t.stop());
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
      if (err?.name === "NotAllowedError" || err?.message === "no-api")
        msg = err.message === "no-api"
          ? "Your browser does not support camera access. Try Chrome or Safari over HTTPS."
          : "Camera permission was denied. Enable it in your browser settings.";
      else if (err?.name === "NotFoundError")   msg = "No camera was found on this device.";
      else if (err?.name === "NotReadableError") msg = "The camera is in use by another app.";
      else if (location.protocol !== "https:" && location.hostname !== "localhost")
        msg = "Camera access requires HTTPS.";
      setCameraError(msg);
      setCameraActive(false);
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => () => stopCamera(), []);

  const onViewerClick = (e) => {
    if (!cameraActive || !selected || dragState.current.active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPlacement({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };
  const onArtPointerDown = (e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragState.current = { active: true, rect: viewerRef.current.getBoundingClientRect() };
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
    setTimeout(() => { dragState.current.active = false; }, 50);
  };

  return (
    <div style={{ display: "flex", gap: 32, flexWrap: "wrap", maxWidth: 1180, margin: "0 auto" }}>
      {/* artwork selector */}
      <motion.div style={{ flex: "0 0 280px", minWidth: 240 }}
        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 18 }}>SELECT ARTWORK</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ARTWORKS.map((art) => (
            <motion.div key={art.id} onClick={() => setSelected(art)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 14px", borderRadius: 6, cursor: "pointer",
                border: selected?.id === art.id ? "1px solid rgba(212,175,55,0.6)" : "1px solid rgba(212,175,55,0.12)",
                background: selected?.id === art.id ? "rgba(212,175,55,0.07)" : "rgba(255,255,255,0.02)",
                transition: "all 0.25s",
              }}
              whileHover={{ borderColor: "rgba(212,175,55,0.4)", background: "rgba(212,175,55,0.04)" }}>
              <img src={art.img} alt={art.title} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 4 }} />
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#f0e8d8", fontWeight: 600 }}>{art.title}</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)", marginTop: 4 }}>{art.artist.toUpperCase()}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* viewer */}
      <motion.div style={{ flex: 1, minWidth: 280 }}
        initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>AR PREVIEW</span>
          {cameraActive && (
            <span style={{ color: "#4ade80", fontSize: 9, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80" }} />
              LIVE CAMERA
            </span>
          )}
        </div>

        <div ref={viewerRef} onClick={onViewerClick}
          style={{ position: "relative", width: "100%", paddingBottom: "62%", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(212,175,55,0.2)", cursor: cameraActive && selected ? "crosshair" : "default", background: "#0a0a0a" }}>
          <video ref={videoRef} autoPlay playsInline muted
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: cameraActive ? "block" : "none", transform: facingMode === "user" ? "scaleX(-1)" : "none" }} />
          {!cameraActive && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "rgba(200,191,160,0.45)", padding: 24, textAlign: "center" }}>
              <CameraIcon size={48} />
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, maxWidth: 320, lineHeight: 1.6 }}>
                {cameraError
                  ? <span style={{ color: "#f87171" }}>{cameraError}</span>
                  : selected
                    ? `Ready to place "${selected.title}". Activate the camera below.`
                    : "Select an artwork, then activate the camera to preview it on your wall."}
              </div>
              {requesting && <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "#D4AF37" }}>REQUESTING CAMERA…</div>}
            </div>
          )}
          <AnimatePresence>
            {cameraActive && selected && (
              <motion.div key={selected.id}
                onPointerDown={onArtPointerDown} onPointerMove={onArtPointerMove}
                onPointerUp={onArtPointerUp} onPointerCancel={onArtPointerUp}
                style={{ position: "absolute", left: `${placement.x}%`, top: `${placement.y}%`, transform: `translate(-50%,-50%) rotate(${rotation}deg)`, width: `${scale}%`, boxShadow: "0 16px 50px rgba(0,0,0,0.6), 0 0 0 3px rgba(255,255,255,0.08)", borderRadius: 3, border: "6px solid #f5f0e8", zIndex: 5, cursor: "grab", touchAction: "none", userSelect: "none" }}
                initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}>
                <img src={selected.img} alt={selected.title} draggable={false} style={{ width: "100%", display: "block", borderRadius: 1, pointerEvents: "none" }} />
              </motion.div>
            )}
          </AnimatePresence>
          {cameraActive && (
            <div style={{ position: "absolute", bottom: 10, left: 16, right: 16, display: "flex", justifyContent: "space-between", fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
              <span>{selected ? "TAP TO PLACE · DRAG TO MOVE" : "SELECT AN ARTWORK"}</span>
              <span>{facingMode === "environment" ? "REAR CAMERA" : "FRONT CAMERA"}</span>
            </div>
          )}
        </div>

        {cameraActive && selected && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 14, padding: "14px 18px", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, background: "rgba(212,175,55,0.04)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "#D4AF37" }}>SIZE · {scale}%</span>
              <input type="range" min={8} max={70} value={scale} onChange={(e) => setScale(Number(e.target.value))} style={{ accentColor: "#D4AF37" }} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "#D4AF37" }}>ROTATION · {rotation}°</span>
              <input type="range" min={-15} max={15} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} style={{ accentColor: "#D4AF37" }} />
            </label>
          </motion.div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <motion.button className={cameraActive ? "btn-outline" : "btn-gold-main"}
            style={{ flex: 1, minWidth: 180, padding: "14px 20px", fontSize: 12 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={requesting}
            onClick={() => cameraActive ? stopCamera() : startCamera()}>
            {requesting ? "STARTING…" : cameraActive ? "STOP CAMERA" : "ACTIVATE AR CAMERA"}
          </motion.button>
          {cameraActive && (
            <motion.button className="btn-outline" style={{ padding: "14px 20px", fontSize: 12 }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { const next = facingMode === "environment" ? "user" : "environment"; setFacingMode(next); if (cameraActive) startCamera(next); }}>
              FLIP CAMERA
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Room Visualizer (AI-powered, no AR required) ─────────────────────────────
function RoomVisualizer({ initialArtworkUrl, initialArtType }) {
  // Steps: upload → analysing → selecting → compositing → result | manual
  const [step, setStep]               = useState("upload");
  const [roomDataURL, setRoomDataURL] = useState(null);
  const [artworkImg, setArtworkImg]   = useState(null);  // HTMLImageElement
  const [artworkUrl, setArtworkUrl]   = useState(initialArtworkUrl || null);
  const [artType, setArtType]         = useState(initialArtType || "painting");
  const [prompt, setPrompt]           = useState("");
  const [progress, setProgress]       = useState(null);  // { status, progress }
  const [surfaces, setSurfaces]       = useState(null);  // { walls, floors }
  const [selectedSurf, setSelectedSurf] = useState(null);
  const [resultReady, setResultReady] = useState(false);
  const [error, setError]             = useState(null);
  // Render engine: "generate" = server-side Gemini photoreal image-gen,
  // "place" = free Gemini vision picks a spot + canvas composite, "device" = offline.
  const [engine, setEngine]           = useState(hasGeminiKey() ? "place" : "device");
  const [genAvailable, setGenAvailable] = useState(false);  // backend photoreal generator configured?

  // Ask the backend whether the (billing) photoreal generator is available.
  useEffect(() => {
    api.ai.status()
      .then((s) => { if (s?.image_gen) { setGenAvailable(true); setEngine("generate"); } })
      .catch(() => {});
  }, []);

  const overlayCanvasRef = useRef(null);
  const resultCanvasRef  = useRef(null);
  const roomImgRef       = useRef(null);
  const fileInputRef     = useRef(null);
  const artFileInputRef  = useRef(null);

  // Load initial artwork from URL param
  useEffect(() => {
    if (!initialArtworkUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setArtworkImg(img);
    img.src = initialArtworkUrl;
  }, [initialArtworkUrl]);

  const loadRoomFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setRoomDataURL(e.target.result);
      setStep("ready");
      setResultReady(false);
      setSurfaces(null);
      setSelectedSurf(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const loadArtworkFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => { setArtworkImg(img); setArtworkUrl(e.target.result); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Draw overlay canvas whenever room image or surfaces change
  useEffect(() => {
    if (!roomDataURL || step !== "selecting" || !surfaces) return;
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.onload = () => {
      canvas.width  = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      drawSurfaceOverlays(ctx, surfaces.walls, surfaces.floors, img.width, img.height);
    };
    img.src = roomDataURL;
  }, [roomDataURL, surfaces, step]);

  // Draw the room + artwork (in `quad`) onto the result canvas, with frame/shadow.
  const paintResult = (quad, img) => {
    const canvas = resultCanvasRef.current;
    canvas.width  = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    compositeArtwork(canvas, artworkImg, quad, { shadow: artType !== "wallpaper" && artType !== "mural" });

    if (artType === "painting") {
      const fw = Math.max(3, Math.round(canvas.width * 0.005));
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(quad[0][0], quad[0][1]);
      for (let i = 1; i < quad.length; i++) ctx.lineTo(quad[i][0], quad[i][1]);
      ctx.closePath();
      ctx.lineJoin = "miter";
      ctx.strokeStyle = "rgba(18,12,6,0.92)";
      ctx.lineWidth = fw * 2.8;
      ctx.stroke();
      ctx.strokeStyle = "rgba(212,175,55,0.72)";
      ctx.lineWidth = fw;
      ctx.stroke();
      ctx.restore();
    }
    if (artType === "sculpture") compositeGroundShadow(canvas, quad, 0.45);
  };

  // Photoreal path — backend Gemini image-gen actually *generates* the room with
  // the artwork composited in (used on laptops/desktops with no AR camera).
  const renderWithGenerate = async () => {
    setStep("analysing");
    setError(null);
    setProgress({ status: "Generating your room with Gemini…", progress: 60 });
    try {
      // The artwork must be sent as data: or an http URL the server can fetch.
      const artworkSrc = artworkUrl && (artworkUrl.startsWith("data:") || /^https?:\/\//.test(artworkUrl))
        ? artworkUrl
        : imgToDataURL(artworkImg);

      const { image } = await api.ai.visualize({
        room: roomDataURL,
        artwork: artworkSrc,
        art_type: artType,
        prompt,
      });

      // Paint the generated image onto the result canvas so download works.
      const out = new Image();
      await new Promise((res, rej) => { out.onload = res; out.onerror = rej; out.src = image; });
      const canvas = resultCanvasRef.current;
      canvas.width = out.naturalWidth;
      canvas.height = out.naturalHeight;
      canvas.getContext("2d").drawImage(out, 0, 0);

      setResultReady(true);
      setStep("result");
    } catch (err) {
      console.error(err);
      const msg = err?.status === 401
        ? "Please sign in to use AI photoreal generation."
        : "AI generation failed (" + err.message + "). Try Smart-place or On-device.";
      setError(msg);
      setStep("ready");
    }
  };

  // Smart-placement path — free Gemini vision picks WHERE, canvas composites.
  const renderWithAI = async () => {
    setStep("analysing");
    setError(null);
    setProgress({ status: "Gemini is finding the best spot…", progress: 55 });
    try {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = roomDataURL; });
      roomImgRef.current = img;

      const aW = artworkImg.naturalWidth  || artworkImg.width  || 1;
      const aH = artworkImg.naturalHeight || artworkImg.height || 1;

      const box = await analyzeRoomPlacement({ roomDataURL, artType, prompt, artAspect: aW / aH });

      // Fill types use the whole region; framed art keeps its aspect inside it.
      const quad = (artType === "wallpaper" || artType === "mural")
        ? boxToQuad(box, img.width, img.height)
        : fitAspectInBox(box, img.width, img.height, aW, aH);

      await new Promise((res) => setTimeout(res, 20)); // let UI paint the spinner
      paintResult(quad, img);

      setResultReady(true);
      setStep("result");
    } catch (err) {
      console.error(err);
      setError("AI placement failed (" + err.message + "). Falling back to on-device detection…");
      analyseRoom();   // graceful fallback to SegFormer + canvas
    }
  };

  const analyseRoom = async () => {
    setStep("analysing");
    setError(null);
    setProgress({ status: "Loading AI model…", progress: 0 });
    try {
      const segments = await runSegmentation(roomDataURL, (info) => {
        if (info.status === "progress") {
          setProgress({ status: `Loading model: ${info.file || ""}`, progress: Math.round((info.loaded / info.total) * 100) });
        } else if (info.status === "done") {
          setProgress({ status: "Model ready. Analysing…", progress: 100 });
        }
      });

      // Find room image dimensions to scale masks
      const img = new Image();
      await new Promise((res) => { img.onload = res; img.src = roomDataURL; });
      roomImgRef.current = img;

      const extracted = extractSurfaces(segments, img.width, img.height);
      setSurfaces(extracted);

      const allSurfaces = artType === "sculpture" ? extracted.floors : extracted.walls;
      // mural and wallpaper also use walls
      if (allSurfaces.length === 0) {
        // No surfaces detected → fall back to manual mode
        setStep("manual");
        return;
      }

      // Auto-pick from prompt if provided, else go to selection step
      if (prompt.trim()) {
        const best = pickSurfaceFromPrompt(allSurfaces, prompt);
        setSelectedSurf(best);
        await runComposite(best, img);
      } else {
        setStep("selecting");
      }
    } catch (err) {
      console.error(err);
      setError("AI analysis failed: " + err.message);
      setStep("manual");
    }
  };

  const runComposite = async (surf, imgEl) => {
    setStep("compositing");
    const img = imgEl || roomImgRef.current;
    if (!img || !artworkImg || !surf) { setStep("selecting"); return; }

    await new Promise((res) => setTimeout(res, 20)); // let UI update

    const aW = artworkImg.naturalWidth  || artworkImg.width  || 1;
    const aH = artworkImg.naturalHeight || artworkImg.height || 1;

    // painting shrinks to 45% width preserving aspect; mural/wallpaper/sculpture use full quad
    const quad = artType === "painting"
      ? shrinkQuadWithAspect(surf.quad, 0.45, aW, aH)
      : surf.quad;

    paintResult(quad, img);

    setResultReady(true);
    setStep("result");
  };

  const downloadResult = () => {
    const a = document.createElement("a");
    a.download = "artwork-in-room.png";
    a.href = resultCanvasRef.current.toDataURL("image/png");
    a.click();
  };

  // ── render ────────────────────────────────────────────────────────────────
  const gold = "#D4AF37";
  const label = (txt) => (
    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.18em", color: "rgba(212,175,55,0.65)", marginBottom: 6 }}>{txt}</div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>

      {/* Two-column layout: left = controls, right = canvas */}
      <div className="ar-grid" style={{ display: "grid", gridTemplateColumns: step === "result" ? "320px 1fr" : "360px 1fr", gap: 28, alignItems: "start" }}>

        {/* ── Left panel ── */}
        <div>
          {/* Artwork selector */}
          <div style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 10, padding: "18px 18px 14px", marginBottom: 14 }}>
            {label("YOUR ARTWORK")}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {artworkUrl && (
                <img src={artworkUrl} alt="artwork" style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 5, border: "1px solid rgba(212,175,55,0.3)", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                {!initialArtworkUrl && (
                  <>
                    <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.6)", marginBottom: 8, lineHeight: 1.5 }}>
                      {artworkUrl ? "Artwork loaded from product page." : "No artwork loaded. Upload one below or go back to a product page."}
                    </div>
                    <input ref={artFileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => loadArtworkFile(e.target.files[0])} />
                    <button onClick={() => artFileInputRef.current.click()}
                      style={{ padding: "6px 14px", background: "transparent", border: "1px solid rgba(212,175,55,0.35)", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: gold, cursor: "pointer" }}>
                      UPLOAD ARTWORK
                    </button>
                  </>
                )}
                {initialArtworkUrl && (
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", lineHeight: 1.5 }}>Artwork loaded from product page.</div>
                )}
              </div>
            </div>

            {/* Type selector */}
            <div style={{ marginTop: 14 }}>
              {label("ARTWORK TYPE")}
              <div style={{ display: "flex", gap: 0, borderRadius: 999, overflow: "hidden", border: "1px solid rgba(212,175,55,0.2)", width: "fit-content" }}>
                {[["painting", "Painting"], ["wallpaper", "Wallpaper"], ["mural", "Mural"], ["sculpture", "Sculpture"]].map(([v, l]) => (
                  <button key={v} onClick={() => setArtType(v)}
                    style={{ padding: "7px 16px", border: "none", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.12em", background: artType === v ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "transparent", color: artType === v ? "#111" : "rgba(200,191,160,0.5)", transition: "all 0.18s" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Room photo upload */}
          <div style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 10, padding: "18px", marginBottom: 14 }}>
            {label("ROOM PHOTO")}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => loadRoomFile(e.target.files[0])} />
            {!roomDataURL ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); loadRoomFile(e.dataTransfer.files[0]); }}
                onClick={() => fileInputRef.current.click()}
                style={{ border: "1px dashed rgba(212,175,55,0.3)", borderRadius: 8, padding: "28px 16px", textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: gold, marginBottom: 8 }}>DRAG & DROP OR CLICK</div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.45)" }}>Upload a photo of your room</div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <img src={roomDataURL} alt="room" style={{ width: 72, height: 54, objectFit: "cover", borderRadius: 5, border: "1px solid rgba(212,175,55,0.2)" }} />
                <button onClick={() => fileInputRef.current.click()}
                  style={{ padding: "6px 14px", background: "transparent", border: "1px solid rgba(212,175,55,0.35)", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: gold, cursor: "pointer" }}>
                  CHANGE
                </button>
              </div>
            )}
          </div>

          {/* Prompt */}
          {roomDataURL && (
            <div style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 10, padding: "18px", marginBottom: 14 }}>
              {label("WHERE TO PLACE IT? (OPTIONAL)")}
              <input
                value={prompt} onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. left wall, behind the sofa, floor by the window"
                style={{ width: "100%", padding: "9px 12px", background: "#111", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 6, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 12, outline: "none", boxSizing: "border-box" }}
              />
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(200,191,160,0.35)", marginTop: 6 }}>
                Keywords: left · right · back · floor · behind · above
              </div>
            </div>
          )}

          {/* Render-engine toggle (shown when any AI engine is available) */}
          {roomDataURL && (genAvailable || hasGeminiKey()) && (step === "ready" || step === "upload") && (
            <div style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 10, padding: "14px 18px", marginBottom: 14 }}>
              {label("RENDER ENGINE")}
              <div style={{ display: "flex", gap: 0, borderRadius: 999, overflow: "hidden", border: "1px solid rgba(212,175,55,0.2)" }}>
                {[
                  genAvailable && ["generate", "Photoreal AI"],
                  hasGeminiKey() && ["place", "Smart place"],
                  ["device", "On-device"],
                ].filter(Boolean).map(([v, l]) => (
                  <button key={v} onClick={() => setEngine(v)}
                    style={{ flex: 1, padding: "8px 8px", border: "none", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: "0.08em", background: engine === v ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "transparent", color: engine === v ? "#111" : "rgba(200,191,160,0.5)", transition: "all 0.18s" }}>
                    {l}
                  </button>
                ))}
              </div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(200,191,160,0.35)", marginTop: 7, lineHeight: 1.5 }}>
                {engine === "generate"
                  ? "Gemini generates a photorealistic image of your room with the artwork placed in it (~10s)."
                  : engine === "place"
                  ? "Gemini reads your room & prompt to pick the exact spot, then composites it (~2s, free)."
                  : "Runs fully in your browser, no network."}
              </div>
            </div>
          )}

          {/* CTA */}
          {roomDataURL && artworkImg && (step === "ready" || step === "upload") && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={engine === "generate" ? renderWithGenerate : engine === "place" ? renderWithAI : analyseRoom}
              style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", fontWeight: 700, cursor: "pointer" }}>
              {engine === "generate" ? "✦ GENERATE PHOTOREAL PREVIEW" : engine === "place" ? "✦ PLACE ARTWORK WITH AI" : "ANALYSE ROOM & PLACE ARTWORK"}
            </motion.button>
          )}

          {roomDataURL && !artworkImg && (
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.45)", textAlign: "center", padding: "12px 0" }}>
              Upload an artwork to continue
            </div>
          )}

          {/* Progress */}
          {step === "analysing" && progress && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: gold, marginBottom: 8 }}>{progress.status.toUpperCase()}</div>
              <div style={{ height: 3, background: "rgba(212,175,55,0.15)", borderRadius: 2, overflow: "hidden" }}>
                <motion.div style={{ height: "100%", background: "linear-gradient(90deg,#D4AF37,#e8c53a)", borderRadius: 2 }}
                  animate={{ width: `${progress.progress}%` }} transition={{ duration: 0.3 }} />
              </div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.4)", marginTop: 6 }}>
                {engine === "generate"
                  ? "Gemini is generating a photorealistic image of your room…"
                  : engine === "place"
                  ? "Gemini is reading your room to find the best spot…"
                  : (progress.progress < 100 ? "First load downloads ~100 MB (cached after). Please wait…" : "Running segmentation…")}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#f87171" }}>
              {error}
            </div>
          )}

          {/* Surface selection controls */}
          {step === "selecting" && surfaces && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: gold, marginBottom: 10 }}>
                {artType === "sculpture" ? `${surfaces.floors.length} FLOOR SURFACE${surfaces.floors.length !== 1 ? "S" : ""} DETECTED` : `${surfaces.walls.length} WALL${surfaces.walls.length !== 1 ? "S" : ""} DETECTED — CLICK ONE`}
              </div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginBottom: 12, lineHeight: 1.6 }}>
                Gold highlights show detected walls. Click on the wall in the image where you'd like to place the artwork.
              </div>
              {(artType === "sculpture" ? surfaces.floors : surfaces.walls).map((surf, i) => (
                <motion.button key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setSelectedSurf(surf); runComposite(surf); }}
                  style={{ width: "100%", marginBottom: 8, padding: "10px 14px", background: selectedSurf === surf ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.02)", border: `1px solid ${selectedSurf === surf ? gold : "rgba(212,175,55,0.2)"}`, borderRadius: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: gold }}>
                    {artType === "sculpture" ? "FLOOR AREA" : "WALL"} {i + 1}
                  </span>
                  <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.5)" }}>
                    {Math.round(surf.score * 100)}% confidence
                  </span>
                </motion.button>
              ))}
            </div>
          )}

          {/* Result controls */}
          {step === "result" && resultReady && (
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={downloadResult}
                style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", fontWeight: 700, cursor: "pointer" }}>
                DOWNLOAD IMAGE
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => { if (engine === "generate") { renderWithGenerate(); } else if (engine === "place") { renderWithAI(); } else { setStep("selecting"); setResultReady(false); } }}
                style={{ width: "100%", padding: "13px", background: "transparent", color: gold, border: "1px solid rgba(212,175,55,0.35)", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", cursor: "pointer" }}>
                {engine === "device" ? "TRY ANOTHER WALL" : "REGENERATE"}
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => { setStep("ready"); setResultReady(false); setSurfaces(null); setRoomDataURL(null); }}
                style={{ width: "100%", padding: "13px", background: "transparent", color: "rgba(200,191,160,0.45)", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", cursor: "pointer" }}>
                NEW ROOM PHOTO
              </motion.button>
            </div>
          )}

          {/* Manual fallback */}
          {step === "manual" && (
            <div style={{ marginTop: 14, padding: "14px 16px", background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 10 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: gold, marginBottom: 8 }}>MANUAL PLACEMENT</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.6)", lineHeight: 1.6 }}>
                Automatic surface detection couldn't find a clear wall or floor. Click four corners of your target surface on the room photo to place the artwork manually.
              </div>
              <ManualPlacer roomDataURL={roomDataURL} artworkImg={artworkImg} artType={artType} resultCanvasRef={resultCanvasRef} onDone={() => { setResultReady(true); setStep("result"); }} />
            </div>
          )}
        </div>

        {/* ── Right canvas panel ── */}
        <div style={{ position: "sticky", top: 100 }}>
          {!roomDataURL && (
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 10, aspectRatio: "4/3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "rgba(212,175,55,0.35)" }}>YOUR ROOM PREVIEW</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.3)" }}>Upload a room photo to begin</div>
            </div>
          )}

          {/* Overlay canvas (during surface selection) */}
          <canvas ref={overlayCanvasRef}
            style={{ display: step === "selecting" ? "block" : "none", width: "100%", borderRadius: 10, border: "1px solid rgba(212,175,55,0.2)", cursor: "crosshair" }}
            onClick={(e) => {
              if (step !== "selecting" || !surfaces) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const scaleX = overlayCanvasRef.current.width  / rect.width;
              const scaleY = overlayCanvasRef.current.height / rect.height;
              const px = (e.clientX - rect.left) * scaleX;
              const py = (e.clientY - rect.top)  * scaleY;
              const list = artType === "sculpture" ? surfaces.floors : surfaces.walls;
              const hit = list.find((s) => pointInQuad(px, py, s.quad));
              if (hit) { setSelectedSurf(hit); runComposite(hit); }
            }}
          />

          {/* Result canvas */}
          <canvas ref={resultCanvasRef}
            style={{ display: step === "result" && resultReady ? "block" : "none", width: "100%", borderRadius: 10, border: "1px solid rgba(212,175,55,0.2)" }} />

          {/* Loading state */}
          {(step === "analysing" || step === "compositing") && (
            <div style={{ background: "rgba(8,8,8,0.9)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 10, aspectRatio: "4/3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <motion.div style={{ width: 48, height: 48, borderRadius: "50%", border: "2px solid rgba(212,175,55,0.2)", borderTop: `2px solid ${gold}` }}
                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: gold }}>
                {step === "compositing" ? "COMPOSITING…" : engine === "generate" ? "GENERATING…" : engine === "place" ? "RENDERING…" : "ANALYSING ROOM…"}
              </div>
            </div>
          )}

          {/* Show room photo preview when uploaded but not yet analysed */}
          {roomDataURL && (step === "ready" || step === "upload") && (
            <img src={roomDataURL} alt="room" style={{ width: "100%", borderRadius: 10, border: "1px solid rgba(212,175,55,0.15)", display: "block" }} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Manual 4-corner placer ───────────────────────────────────────────────────
function ManualPlacer({ roomDataURL, artworkImg, artType, resultCanvasRef, onDone }) {
  const [corners, setCorners] = useState([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!roomDataURL) return;
    const img = new Image();
    img.onload = () => {
      const c = canvasRef.current;
      c.width = img.width; c.height = img.height;
      c.getContext("2d").drawImage(img, 0, 0);
    };
    img.src = roomDataURL;
  }, [roomDataURL]);

  useEffect(() => {
    if (!roomDataURL) return;
    const img = new Image();
    img.onload = () => {
      const c = canvasRef.current;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      corners.forEach(([x, y], i) => {
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#D4AF37";
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText(i + 1, x - 4, y + 5);
      });
      if (corners.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(corners[0][0], corners[0][1]);
        corners.forEach(([x, y]) => ctx.lineTo(x, y));
        if (corners.length === 4) ctx.closePath();
        ctx.strokeStyle = "rgba(212,175,55,0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };
    img.src = roomDataURL;
  }, [corners, roomDataURL]);

  const handleClick = async (e) => {
    if (corners.length >= 4) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = canvasRef.current.width  / rect.width;
    const sy = canvasRef.current.height / rect.height;
    const newCorners = [...corners, [(e.clientX - rect.left) * sx, (e.clientY - rect.top) * sy]];
    setCorners(newCorners);

    if (newCorners.length === 4) {
      // Run compositing
      const img = new Image();
      img.onload = () => {
        const rc = resultCanvasRef.current;
        rc.width = img.width; rc.height = img.height;
        const ctx = rc.getContext("2d");
        ctx.drawImage(img, 0, 0);
        compositeArtwork(rc, artworkImg, newCorners, { shadow: artType !== "wallpaper" });
        if (artType === "sculpture") compositeGroundShadow(rc, newCorners, 0.45);
        onDone();
      };
      img.src = roomDataURL;
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.45)", marginBottom: 8 }}>
        Corners placed: {corners.length} / 4 {corners.length === 4 ? "✓ All placed" : "— click on the image to the right"}
      </div>
      {corners.length > 0 && corners.length < 4 && (
        <button onClick={() => setCorners([])}
          style={{ padding: "5px 12px", background: "transparent", border: "1px solid rgba(248,113,113,0.4)", borderRadius: 6, color: "#f87171", fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.12em", cursor: "pointer" }}>
          RESET CORNERS
        </button>
      )}
      {/* The canvas is shown in the right panel */}
      <canvas ref={canvasRef} onClick={handleClick}
        style={{ display: "none" }} />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Rasterize a loaded <img> to a PNG data URL (so it can be POSTed to the server).
function imgToDataURL(img) {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  c.getContext("2d").drawImage(img, 0, 0);
  return c.toDataURL("image/png");
}

// Gemini returns a normalized {x,y,w,h} region; convert to an axis-aligned pixel quad.
function boxToQuad(box, imgW, imgH) {
  const bx = box.x * imgW, by = box.y * imgH;
  const bw = box.w * imgW, bh = box.h * imgH;
  return [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]];
}

// Largest rectangle of the artwork's aspect ratio that fits inside the box, centered.
function fitAspectInBox(box, imgW, imgH, artW, artH) {
  const bx = box.x * imgW, by = box.y * imgH;
  const bw = box.w * imgW, bh = box.h * imgH;
  const aspect = artW / artH;
  let w = bw, h = w / aspect;
  if (h > bh) { h = bh; w = h * aspect; }
  const x = bx + (bw - w) / 2;
  const y = by + (bh - h) / 2;
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
}

function pointInQuad(px, py, quad) {
  const n = quad.length;
  let sign = 0;
  for (let i = 0; i < n; i++) {
    const [ax, ay] = quad[i];
    const [bx, by] = quad[(i + 1) % n];
    const cross = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
    if (cross === 0) continue;
    const s = cross > 0 ? 1 : -1;
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return true;
}

function shrinkQuadWithAspect(quad, targetWidthFrac, artW, artH) {
  const cx = quad.reduce((s, p) => s + p[0], 0) / 4;
  const cy = quad.reduce((s, p) => s + p[1], 0) / 4;
  const qW = Math.max(...quad.map(p => p[0])) - Math.min(...quad.map(p => p[0]));
  const qH = Math.max(...quad.map(p => p[1])) - Math.min(...quad.map(p => p[1]));

  if (qW <= 0 || qH <= 0) {
    return quad.map(([x, y]) => [cx + (x - cx) * targetWidthFrac, cy + (y - cy) * targetWidthFrac]);
  }

  // Desired width = targetWidthFrac * qW; height = width * (artH/artW)
  let fracX = targetWidthFrac;
  let fracY = (qW * targetWidthFrac * artH) / (artW * qH);

  // Cap both to 0.85 of wall to always stay inside; scale proportionally if needed
  const MAX = 0.85;
  if (fracY > MAX) {
    fracX *= MAX / fracY;
    fracY  = MAX;
  }
  fracX = Math.min(fracX, MAX);

  return quad.map(([x, y]) => [
    cx + (x - cx) * fracX,
    cy + (y - cy) * fracY,
  ]);
}

// ─── Root component ───────────────────────────────────────────────────────────
export default function AR() {
  const navigate = useNavigate();
  const [arSupported, setArSupported] = useState(null); // null=checking, true, false
  const [mode, setMode]               = useState(null); // 'camera' | 'visualizer'

  // Get artwork and type from URL params (passed from ProductDetail / ar-launcher)
  const { initialArtworkUrl, initialArtType } = (() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const rawType = (p.get("type") || p.get("artType") || "painting").toLowerCase();
      const typeMap = { sculpture: "sculpture", wallpaper: "wallpaper", mural: "mural", painting: "painting" };
      return {
        initialArtworkUrl: p.get("image") || null,
        initialArtType: typeMap[rawType] || "painting",
      };
    } catch { return { initialArtworkUrl: null, initialArtType: "painting" }; }
  })();

  useEffect(() => {
    const check = async () => {
      try {
        const ok = await navigator.xr?.isSessionSupported("immersive-ar");
        setArSupported(!!ok);
        setMode(ok ? "camera" : "visualizer");
      } catch {
        setArSupported(false);
        setMode("visualizer");
      }
    };
    if (!navigator.xr) { setArSupported(false); setMode("visualizer"); }
    else check();
  }, []);

  const headerSubtitle = mode === "visualizer"
    ? "Your device doesn't support WebXR AR. Use the AI Room Visualizer below — upload a room photo and place the artwork exactly where you want it."
    : "Point your camera at the wall where you'd like the piece to hang. Tap to place, drag to reposition.";

  return (
    <div style={{ minHeight: "100vh", padding: "100px 24px 80px", background: "#080808" }}>
      {/* Back button */}
      <motion.button
        onClick={() => navigate(-1)}
        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
        style={{ position: "fixed", top: 72, left: 24, zIndex: 50, display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: "rgba(20,14,8,0.85)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 999, cursor: "pointer", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        whileHover={{ borderColor: "rgba(212,175,55,0.6)", background: "rgba(30,20,10,0.95)" }}
        whileTap={{ scale: 0.97 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="#D4AF37" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "#D4AF37" }}>BACK</span>
      </motion.button>

      {/* Header */}
      <motion.div style={{ textAlign: "center", marginBottom: 52 }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 16 }}>
          <motion.div
            style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#1a1a1a", fontFamily: "'Cinzel',serif", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(212,175,55,0.5)" }}
            animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}>
            {arSupported === null ? "…" : mode === "camera" ? "AR" : "AI"}
          </motion.div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,5vw,56px)", fontWeight: 700, color: "#fff" }}>
            Art in Your <span style={{ color: "#D4AF37", fontStyle: "italic" }}>Space</span>
          </h1>
        </div>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 15, color: "rgba(200,191,160,0.65)", maxWidth: 620, margin: "0 auto", lineHeight: 1.7 }}>
          {arSupported === null ? "Checking your device capabilities…" : headerSubtitle}
        </p>

        {/* Mode switcher — always let user choose */}
        {arSupported !== null && (
          <div style={{ display: "flex", gap: 0, marginTop: 20, borderRadius: 999, overflow: "hidden", border: "1px solid rgba(212,175,55,0.2)", width: "fit-content", margin: "20px auto 0" }}>
            <button onClick={() => setMode("camera")}
              style={{ padding: "9px 22px", border: "none", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", background: mode === "camera" ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "transparent", color: mode === "camera" ? "#111" : "rgba(200,191,160,0.5)", transition: "all 0.2s" }}>
              CAMERA AR
            </button>
            <button onClick={() => setMode("visualizer")}
              style={{ padding: "9px 22px", border: "none", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", background: mode === "visualizer" ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "transparent", color: mode === "visualizer" ? "#111" : "rgba(200,191,160,0.5)", transition: "all 0.2s" }}>
              AI ROOM VISUALIZER
            </button>
          </div>
        )}
      </motion.div>

      {arSupported === null && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <motion.div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(212,175,55,0.2)", borderTop: "2px solid #D4AF37" }}
            animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} />
        </div>
      )}

      {mode === "camera"     && <CameraARMode />}
      {mode === "visualizer" && <RoomVisualizer initialArtworkUrl={initialArtworkUrl} initialArtType={initialArtType} />}
    </div>
  );
}
