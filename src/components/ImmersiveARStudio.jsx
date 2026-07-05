import { useEffect, useRef, useState } from "react";

/**
 * Native, in-app port of the old public/ar-launcher.html — the full WebXR AR
 * studio (Three.js 3D preview + frame controls + real immersive AR with
 * hit-test, wall/floor plane detection and world anchors). No iframe, no
 * separate HTML file. three.js is lazy-loaded only when this mounts.
 */
export default function ImmersiveARStudio({
  initialArtworkUrl,
  onSwitchToVisualizer,
}) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const overlayRef = useRef(null);
  const instructionRef = useRef(null);
  const placeBtnRef = useRef(null);
  const engineRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [hasArt, setHasArt] = useState(false);
  const [inAR, setInAR] = useState(false);
  const [arState, setArState] = useState("checking"); // checking|supported|unsupported
  const [statusText, setStatusText] = useState("Loading…");
  const [notSupported, setNotSupported] = useState(null);
  const [shot, setShot] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Live control values (drive the 3D preview through the engine).
  const [frameStyle, setFrameStyle] = useState("classic");
  const [frameColor, setFrameColor] = useState("#8B6914");
  const [scale, setScale] = useState(80);
  const [frameW, setFrameW] = useState(3);
  const [matte, setMatte] = useState(1.5);
  const [shadow, setShadow] = useState(1);

  const toastTimer = useRef(null);
  const toast = (m) => {
    setToastMsg(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600);
  };

  useEffect(() => {
    let disposed = false;
    (async () => {
      const THREE = await import("three");
      if (disposed || !canvasRef.current) return;
      const engine = createARStudio(THREE, {
        canvas: canvasRef.current,
        wrap: wrapRef.current,
        overlayEl: overlayRef.current,
        instructionEl: instructionRef.current,
        placeBtnEl: placeBtnRef.current,
        toast,
        onStatus: setStatusText,
        onNotSupported: (msg) => setNotSupported(msg),
        onAREnter: () => setInAR(true),
        onARExit: () => setInAR(false),
        onScreenshot: (url) => setShot(url),
      });
      engineRef.current = engine;
      setReady(true);
      engine.checkSupport().then((ok) => {
        setArState(ok ? "supported" : "unsupported");
        setStatusText(
          ok
            ? "Ready — tap to enter AR"
            : "AR not supported here — full 3D preview",
        );
      });
      if (initialArtworkUrl) {
        engine.loadArtwork(initialArtworkUrl, () => setHasArt(true));
        setStatusText("Loading artwork…");
      } else {
        setStatusText("Upload an artwork to begin");
      }
    })();
    return () => {
      disposed = true;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const E = () => engineRef.current;

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", width: "100%" }}>
      <div className="arx-grid">
        {/* 3D preview */}
        <div ref={wrapRef} className="arx-preview">
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
          {!hasArt && (
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 12, pointerEvents: "none",
              color: "rgba(240,236,228,0.35)", fontFamily: "'Raleway',sans-serif", fontSize: 13,
            }}>
              <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ opacity: 0.5 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9l5 5 4-4 4 5 5-3" />
              </svg>
              Preparing your artwork…
            </div>
          )}
          <div style={{
            position: "absolute", bottom: 12, left: 12, fontFamily: "'Raleway',sans-serif",
            fontSize: 10, letterSpacing: "0.04em", color: "rgba(240,236,228,0.4)", pointerEvents: "none",
          }}>
            Drag to rotate · scroll to zoom
          </div>
        </div>

        {/* Controls */}
        <div className="arx-panel">
          <Section label="Frame Style">
            <div className="arx-seg">
              {["classic", "modern", "float", "none"].map((s) => (
                <button key={s} className={frameStyle === s ? "arx-seg-btn on" : "arx-seg-btn"}
                  onClick={() => { setFrameStyle(s); E()?.setFrameStyle(s); }}>
                  {s[0].toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div style={swLabel}>Frame Colour</div>
            <div style={{ display: "flex", gap: 9 }}>
              {[["#8B6914", "Walnut"], ["#C9A84C", "Gold"], ["#2a2a2a", "Ebony"], ["#e8e0d4", "Ivory"], ["#7a7a7a", "Silver"]].map(([c, t]) => (
                <button key={c} title={t} onClick={() => { setFrameColor(c); E()?.setFrameColor(c); }}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
                    border: frameColor === c ? "2px solid #D4AF37" : "2px solid transparent",
                    transform: frameColor === c ? "scale(1.12)" : "none", transition: "all 0.15s",
                  }} />
              ))}
            </div>
          </Section>

          <Section label="Dimensions">
            <Slider label="Size" value={`${scale} cm`} min={20} max={200} step={5} v={scale}
              onChange={(n) => { setScale(n); E()?.setScale(n); }} />
            <Slider label="Frame Width" value={`${frameW.toFixed(1)} cm`} min={0} max={10} step={0.5} v={frameW}
              onChange={(n) => { setFrameW(n); E()?.setFrameWidth(n); }} />
            <Slider label="Matte Border" value={`${matte.toFixed(1)} cm`} min={0} max={6} step={0.5} v={matte}
              onChange={(n) => { setMatte(n); E()?.setMatte(n); }} />
            <Slider label="Shadow" value={["None", "Soft", "Medium", "Strong"][shadow]} min={0} max={3} step={1} v={shadow}
              onChange={(n) => { setShadow(n); E()?.setShadow(n); }} />
          </Section>

          {/* Upload a different image (optional) */}
          <label className="arx-upload">
            <input type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files[0]; e.target.value = ""; if (f) E()?.loadArtworkFile(f, () => setHasArt(true)); }} />
            Use a different image
          </label>

          <button
            className="arx-ar-btn"
            disabled={!ready || !hasArt}
            onClick={() => E()?.enterAR()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 9V5h4M15 5h4v4M19 15v4h-4M9 19H5v-4" /><circle cx="12" cy="12" r="3" />
            </svg>
            View In AR
          </button>
          <div style={{ textAlign: "center", fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.45)", marginTop: 9 }}>
            {statusText}
          </div>
          {arState === "supported" && (
            <div style={{ textAlign: "center", fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(76,175,125,0.8)", marginTop: 4 }}>
              ● Real-world AR available on this device
            </div>
          )}
        </div>
      </div>

      {/* ── Immersive AR DOM overlay (dom-overlay root) ── */}
      <div ref={overlayRef} style={{
        display: inAR ? "flex" : "none", position: "fixed", inset: 0, zIndex: 500,
        flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 46,
      }}>
        <button onClick={() => E()?.exitAR()} style={arExitBtn}>✕ Exit AR</button>
        <div ref={instructionRef} style={arInstruction}>Slowly pan your phone across the wall to scan it</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 16 }}>
          <button onClick={() => E()?.undo()} title="Undo" style={arCircleBtn}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14L4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 010 11H11" /></svg>
          </button>
          <button ref={placeBtnRef} onClick={() => E()?.placeArtwork()} disabled style={arPlaceBtn}>Tap to Place</button>
          <button onClick={() => E()?.screenshot()} title="Screenshot" style={arCircleBtn}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
          </button>
        </div>
      </div>

      {/* Not-supported sheet */}
      {notSupported && (
        <div style={arModal}>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: "#f0ece4", margin: 0 }}>Live AR not available</h3>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13.5, color: "rgba(240,236,228,0.55)", maxWidth: 400, lineHeight: 1.7 }}>{notSupported}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button style={arPlaceBtn} onClick={() => setNotSupported(null)}>Continue in 3D preview</button>
            {onSwitchToVisualizer && (
              <button style={{ ...arPlaceBtn, background: "transparent", border: "1px solid #D4AF37", color: "#D4AF37" }}
                onClick={() => { setNotSupported(null); onSwitchToVisualizer(); }}>
                Try AI Room Visualizer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Screenshot preview */}
      {shot && (
        <div style={arModal}>
          <img src={shot} alt="AR capture" style={{ maxWidth: "90vw", maxHeight: "68vh", borderRadius: 10 }} />
          <div style={{ display: "flex", gap: 12 }}>
            <a href={shot} download="ar-artwork.png" style={{ ...arPlaceBtn, textDecoration: "none" }}>Download</a>
            <button style={{ ...arPlaceBtn, background: "transparent", border: "1px solid rgba(212,175,55,0.4)", color: "#D4AF37" }} onClick={() => setShot(null)}>Close</button>
          </div>
        </div>
      )}

      {toastMsg && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 999,
          background: "#1a1612", border: "1px solid rgba(212,175,55,0.3)", padding: "11px 22px",
          borderRadius: 100, fontFamily: "'Raleway',sans-serif", fontSize: 12.5, color: "#f0ece4",
        }}>{toastMsg}</div>
      )}

      <style>{ARX_CSS}</style>
    </div>
  );
}

// ── Small presentational helpers ────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <div style={{ borderBottom: "1px solid rgba(212,175,55,0.1)", paddingBottom: 18, marginBottom: 18 }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,191,160,0.5)", marginBottom: 14 }}>{label.toUpperCase()}</div>
      {children}
    </div>
  );
}
function Slider({ label, value, v, min, max, step, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.6)" }}>{label}</span>
        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#e8e0d0", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      </div>
      <input className="arx-range" type="range" min={min} max={max} step={step} value={v}
        onChange={(e) => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

const swLabel = { fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,191,160,0.5)", margin: "16px 0 10px" };
const arExitBtn = { position: "fixed", top: 22, right: 18, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 100, padding: "10px 18px", fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#fff", cursor: "pointer", zIndex: 501 };
const arInstruction = { background: "rgba(0,0,0,0.62)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 100, padding: "10px 22px", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#fff" };
const arCircleBtn = { width: 52, height: 52, borderRadius: "50%", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const arPlaceBtn = { background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#0e0c0a", border: "none", borderRadius: 100, padding: "15px 38px", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.08em", fontWeight: 700, cursor: "pointer" };
const arModal = { position: "fixed", inset: 0, zIndex: 700, background: "rgba(6,5,4,0.94)", backdropFilter: "blur(8px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 32, textAlign: "center" };

const ARX_CSS = `
.arx-grid{display:grid;grid-template-columns:1fr 340px;gap:20px;align-items:start}
.arx-preview{position:relative;background:#0d0d0d;border:1px solid rgba(212,175,55,0.14);border-radius:16px;overflow:hidden;height:min(60vh,560px);min-height:380px}
.arx-panel{background:rgba(255,255,255,0.02);border:1px solid rgba(212,175,55,0.12);border-radius:16px;padding:22px}
.arx-seg{display:flex;gap:4px;background:rgba(0,0,0,0.3);border-radius:9px;padding:4px;margin-bottom:6px}
.arx-seg-btn{flex:1;padding:7px 4px;border:none;background:transparent;border-radius:6px;cursor:pointer;font-family:'Raleway',sans-serif;font-size:11.5px;color:rgba(200,191,160,0.55);transition:all .15s}
.arx-seg-btn.on{background:rgba(212,175,55,0.16);color:#f0e8d8}
.arx-range{width:100%;height:3px;background:rgba(212,175,55,0.18);border-radius:2px;-webkit-appearance:none;appearance:none;cursor:pointer;outline:none}
.arx-range::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:15px;height:15px;border-radius:50%;background:#D4AF37;cursor:pointer}
.arx-range::-moz-range-thumb{width:15px;height:15px;border:none;border-radius:50%;background:#D4AF37;cursor:pointer}
.arx-upload{display:block;text-align:center;padding:10px;margin-bottom:16px;border:1px dashed rgba(212,175,55,0.25);border-radius:10px;cursor:pointer;font-family:'Raleway',sans-serif;font-size:11.5px;color:rgba(200,191,160,0.55);transition:all .2s}
.arx-upload:hover{border-color:rgba(212,175,55,0.55);color:#D4AF37}
.arx-ar-btn{width:100%;background:linear-gradient(135deg,#D4AF37,#e8c53a);color:#0e0c0a;border:none;border-radius:12px;padding:15px;cursor:pointer;font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.06em;font-weight:700;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .2s}
.arx-ar-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 10px 28px rgba(212,175,55,0.3)}
.arx-ar-btn:disabled{opacity:0.4;cursor:not-allowed}
@media(max-width:860px){.arx-grid{grid-template-columns:1fr}.arx-preview{height:48vh}}
`;

// ── Three.js + WebXR engine (faithful port of ar-launcher.html) ─────────────
function createARStudio(THREE, opts) {
  const { canvas, wrap, overlayEl, instructionEl, placeBtnEl, toast, onStatus, onNotSupported, onAREnter, onARExit, onScreenshot } = opts;
  const s = {
    artworkTexture: null, artworkAspect: 1,
    frameStyle: "classic", frameColor: "#8B6914",
    frameWidth: 3, matteWidth: 1.5, artworkScale: 80, shadowIntensity: 1,
    placedMeshes: [], anchoredMeshes: [], xrSession: null, xrRefSpace: null,
    xrHitTestSource: null, xrFrame: null, reticleMesh: null, previewMesh: null,
    isARActive: false, onWall: false, rafId: 0, disposed: false,
    hasSmooth: false, lightProbe: null, onBeforeSelect: null,
  };

  // ── Renderer / scene / camera ──
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d0d);
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(0, 0, 1.4);

  const ambient = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff8f0, 2.1);
  key.position.set(2, 3, 3); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 4; scene.add(key);
  const fill = new THREE.DirectionalLight(0xe8f0ff, 0.55);
  fill.position.set(-3, 1, 1); scene.add(fill);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.ShadowMaterial({ opacity: 0.3 }));
  floor.receiveShadow = true; floor.rotation.x = -Math.PI / 2; floor.position.y = -0.7; scene.add(floor);

  s.renderer = renderer; s.scene = scene; s.camera = camera;

  // ── Orbit drag for the desktop preview ──
  let dragging = false, lastX = 0, lastY = 0, theta = 0.25, phi = Math.PI / 2 - 0.1, radius = 1.4;
  const updateCam = () => {
    camera.position.set(radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.cos(theta));
    camera.lookAt(0, 0, 0);
  };
  updateCam();
  const onDown = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
  const onUp = () => { dragging = false; };
  const onMove = (e) => {
    if (!dragging) return;
    theta -= (e.clientX - lastX) * 0.01;
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - (e.clientY - lastY) * 0.01));
    lastX = e.clientX; lastY = e.clientY; updateCam();
  };
  const onWheel = (e) => { e.preventDefault(); radius = Math.max(0.5, Math.min(3, radius + e.deltaY * 0.002)); updateCam(); };
  canvas.addEventListener("mousedown", onDown);
  window.addEventListener("mouseup", onUp);
  window.addEventListener("mousemove", onMove);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  const resize = () => {
    const w = wrap.clientWidth || 600, h = wrap.clientHeight || 460;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", resize); resize();

  const previewLoop = () => {
    if (s.disposed) return;
    if (!s.isARActive) {
      s.rafId = requestAnimationFrame(previewLoop);
      if (s.previewMesh) s.previewMesh.rotation.y += 0.0018;
      renderer.render(scene, camera);
    }
  };
  previewLoop();

  // ── Artwork mesh ──
  function buildArtworkMesh() {
    const aspect = s.artworkAspect, scale = s.artworkScale, frameStyle = s.frameStyle;
    const group = new THREE.Group();
    const W = scale / 100, H = W / aspect, D = 0.025, fw = s.frameWidth / 100, mw = s.matteWidth / 100;
    if (mw > 0 && frameStyle !== "none") {
      const m = new THREE.Mesh(new THREE.BoxGeometry(W + mw * 2, H + mw * 2, D * 0.3), new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.9 }));
      m.position.z = D * 0.35; m.castShadow = true; group.add(m);
    }
    const art = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), new THREE.MeshStandardMaterial({ map: s.artworkTexture, roughness: 0.7 }));
    art.castShadow = true; art.position.z = D * 0.6; group.add(art);
    if (frameStyle !== "none" && fw > 0) {
      const fc = new THREE.Color(s.frameColor);
      const tW = W + mw * 2 + fw * 2, tH = H + mw * 2 + fw * 2;
      const fDepth = frameStyle === "modern" ? D * 1.5 : D * 2.2;
      const fMat = new THREE.MeshStandardMaterial({ color: fc, roughness: frameStyle === "modern" ? 0.2 : 0.7, metalness: frameStyle === "modern" ? 0.8 : 0.05 });
      [
        { w: tW, h: fw, x: 0, y: tH / 2 - fw / 2 },
        { w: tW, h: fw, x: 0, y: -(tH / 2 - fw / 2) },
        { w: fw, h: tH - fw * 2, x: -(tW / 2 - fw / 2), y: 0 },
        { w: fw, h: tH - fw * 2, x: tW / 2 - fw / 2, y: 0 },
      ].forEach((p) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(p.w, p.h, fDepth), fMat);
        m.position.set(p.x, p.y, fDepth / 2 - 0.002); m.castShadow = true; group.add(m);
      });
    }
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.3, H + 0.3), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: [0, 0.08, 0.16, 0.25][Math.min(3, s.shadowIntensity)], depthWrite: false }));
    sh.position.z = -0.001; group.add(sh);
    return group;
  }
  function rebuildPreview() {
    if (!s.artworkTexture) return;
    if (s.previewMesh) { scene.remove(s.previewMesh); s.previewMesh = null; }
    const mesh = buildArtworkMesh();
    scene.add(mesh); s.previewMesh = mesh;
    const W = s.artworkScale / 100;
    radius = Math.max(W, W / s.artworkAspect) * 1.8 + 0.4; updateCam();
  }
  // Phones choke on 4–8K photo textures (upload stalls + GPU memory pressure);
  // 2K is indistinguishable at wall-art viewing distances.
  const MAX_TEX = 2048;
  function capTextureSize(tex) {
    const img = tex.image;
    if (!img || Math.max(img.width, img.height) <= MAX_TEX) return tex;
    const k = MAX_TEX / Math.max(img.width, img.height);
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * k);
    c.height = Math.round(img.height * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    tex.dispose();
    return new THREE.CanvasTexture(c);
  }
  function applyTexture(tex, aspect, done) {
    tex = capTextureSize(tex);
    if ("colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); // stays sharp at oblique wall angles
    s.artworkTexture?.dispose();
    s.artworkTexture = tex; s.artworkAspect = aspect; rebuildPreview();
    onStatus(s.xrSession ? "" : "Ready — tap to enter AR"); done && done();
  }
  // A WebGL texture needs CORS for cross-origin images. Our /uploads/* path is
  // proxied SAME-ORIGIN (Vercel rewrite in prod, Vite proxy in dev), so loading
  // it relative sidesteps CORS entirely. Fall back to the absolute URL with CORS.
  function sameOriginUploads(u) {
    try {
      const url = new URL(u, window.location.href);
      if (url.pathname.startsWith("/uploads/")) return url.pathname + url.search;
    } catch { /* not a parseable URL */ }
    return null;
  }
  function loadArtwork(url, done) {
    const ok = (tex) => applyTexture(tex, (tex.image.width / tex.image.height) || 1, done);
    const attempt = (src, cors, onFail) => {
      const loader = new THREE.TextureLoader();
      if (cors) loader.crossOrigin = "anonymous";
      loader.load(src, ok, undefined, onFail);
    };
    const fail = () => toast("Couldn't load that image");
    const rel = sameOriginUploads(url);
    if (rel) attempt(rel, false, () => attempt(url, true, fail)); // same-origin first
    else attempt(url, true, fail);
  }
  function loadArtworkFile(file, done) {
    if (!file || !file.type.startsWith("image/")) { toast("Please choose an image"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const l = new THREE.TextureLoader();
        l.load(e.target.result, (tex) => applyTexture(tex, img.width / img.height, done));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ── WebXR AR ──
  async function checkSupport() {
    try { return !!(navigator.xr && (await navigator.xr.isSessionSupported("immersive-ar"))); }
    catch { return false; }
  }
  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }
  async function enterAR() {
    if (!s.artworkTexture) { toast("Load an artwork first"); return; }
    if (isIOS() || !navigator.xr) {
      onNotSupported("This device can't run live camera AR in the browser (Apple doesn't support WebXR). Use the AI Room Visualizer to place the piece in a photo of your room.");
      return;
    }
    let supported = false;
    try { supported = await navigator.xr.isSessionSupported("immersive-ar"); } catch { /* ignore */ }
    if (!supported) {
      onNotSupported("Live AR needs a device with ARCore (Chrome on Android). You can still explore the full 3D preview here.");
      return;
    }
    startSession();
  }
  // ── Surface-normal helpers ────────────────────────────────────────────────
  const WORLD_UP = new THREE.Vector3(0, 1, 0);

  // Scratch objects reused every XR frame — allocating per frame causes GC
  // hitches on phones.
  const _pN = new THREE.Vector3(), _pC = new THREE.Vector3();
  const _bestN = new THREE.Vector3(), _bestC = new THREE.Vector3();
  const _hitPos = new THREE.Vector3(), _normal = new THREE.Vector3();
  const _camPos = new THREE.Vector3(), _dir = new THREE.Vector3();
  const _fwd = new THREE.Vector3(), _upv = new THREE.Vector3(), _right = new THREE.Vector3();
  const _m4 = new THREE.Matrix4(), _targetQ = new THREE.Quaternion();
  const _retPos = new THREE.Vector3(), _retN = new THREE.Vector3();
  const _smoothPos = new THREE.Vector3(), _smoothQuat = new THREE.Quaternion();

  // If the aimed-at point lies on a detected (near-vertical) wall plane, use
  // that plane's clean normal — far steadier than the per-hit estimate. Fills
  // _bestN/_bestC and returns true. We only trust a plane when the hit sits
  // within ~12 cm of it, so we never snap to a different wall behind the one
  // the user is pointing at.
  function wallPlaneAt(frame, hitPos) {
    if (!frame.detectedPlanes || !frame.detectedPlanes.size) return false;
    let found = false, bestPerp = 0.12;
    frame.detectedPlanes.forEach((plane) => {
      let pose;
      try { pose = frame.getPose(plane.planeSpace, s.xrRefSpace); } catch { return; }
      if (!pose) return;
      const m = pose.transform.matrix;
      _pN.set(m[4], m[5], m[6]).normalize(); // planeSpace +Y = normal
      if (Math.abs(_pN.y) > 0.5) return; // skip floors / ceilings — we want walls
      _pC.set(m[12], m[13], m[14]);
      const perp = Math.abs((hitPos.x - _pC.x) * _pN.x + (hitPos.y - _pC.y) * _pN.y + (hitPos.z - _pC.z) * _pN.z);
      if (perp < bestPerp) { bestPerp = perp; _bestN.copy(_pN); _bestC.copy(_pC); found = true; }
    });
    return found;
  }

  // Build an upright orientation that sits flush on the surface: the artwork's
  // face (+Z) points out along `normal`; +Y stays world-up (projected onto the
  // wall) so the piece hangs level rather than tilted. Writes into `target`.
  function orientationFor(target, normal, isWall, camPos, hitPos) {
    if (isWall) {
      _fwd.copy(normal);
      _upv.copy(WORLD_UP).addScaledVector(_fwd, -WORLD_UP.dot(_fwd));
      if (_upv.lengthSq() < 1e-4) _upv.set(0, 1, 0);
      _upv.normalize();
    } else {
      // Floor / table-top: stand the piece upright, facing the viewer.
      if (camPos) _fwd.copy(camPos).sub(hitPos); else _fwd.set(0, 0, 1);
      _fwd.y = 0;
      if (_fwd.lengthSq() < 1e-4) _fwd.set(0, 0, 1);
      _fwd.normalize();
      _upv.copy(WORLD_UP);
    }
    _right.crossVectors(_upv, _fwd).normalize();
    _upv.crossVectors(_fwd, _right).normalize(); // re-orthonormalise
    return target.setFromRotationMatrix(_m4.makeBasis(_right, _upv, _fwd));
  }
  async function startSession() {
    try {
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test"],
        // depth-sensing lets ARCore return hit-tests on blank/untextured walls
        // (it uses the depth map instead of relying on visual feature points).
        optionalFeatures: ["local-floor", "plane-detection", "anchors", "light-estimation", "dom-overlay", "depth-sensing"],
        domOverlay: { root: overlayEl },
        depthSensing: {
          usagePreference: ["cpu-optimized", "gpu-optimized"],
          dataFormatPreference: ["luminance-alpha", "float32"],
        },
      });
      s.xrSession = session; s.isARActive = true;
      renderer.xr.enabled = true;
      scene.background = null; renderer.setClearColor(0x000000, 0); renderer.setClearAlpha(0);
      await renderer.xr.setSession(session);
      renderer.xr.setFoveation?.(1); // cheaper peripheral shading — big GPU win on phones

      // The desktop-preview props must not leak into the real world: without
      // this a ghost copy of the artwork floats at the session origin (the
      // user's feet) and the shadow plane draws a dark patch mid-air.
      if (s.previewMesh) { scene.remove(s.previewMesh); s.previewMesh = null; }
      floor.visible = false;
      key.castShadow = false; // nothing receives shadows in AR — skip the whole shadow pass

      // Match the virtual lights to the real room (ARCore light estimation).
      s.lightProbe = null;
      try { s.lightProbe = await session.requestLightProbe(); } catch { /* not supported */ }

      // Taps on the overlay buttons (undo / screenshot / exit) must not also
      // fire the XR select that places artwork.
      s.onBeforeSelect = (e) => { if (e.target?.closest?.("button")) e.preventDefault(); };
      overlayEl?.addEventListener("beforexrselect", s.onBeforeSelect);

      let refSpace;
      try { refSpace = await session.requestReferenceSpace("local-floor"); }
      catch { refSpace = await session.requestReferenceSpace("local"); }
      s.xrRefSpace = refSpace;
      const viewer = await session.requestReferenceSpace("viewer");
      s.xrHitTestSource = await session.requestHitTestSource({ space: viewer });
      s.onWall = false;
      s.estimated = false;
      s.hasSmooth = false;
      s.lastHitTime = null;

      const reticle = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.11, 32), new THREE.MeshBasicMaterial({ color: 0xc9a84c, side: THREE.DoubleSide }));
      reticle.matrixAutoUpdate = false; reticle.visible = false; scene.add(reticle); s.reticleMesh = reticle;

      onAREnter();
      session.addEventListener("end", exitAR);
      session.addEventListener("select", placeArtwork);
      session.requestAnimationFrame(onXRFrame);
    } catch (e) {
      onNotSupported("Couldn't start AR: " + (e?.message || e));
    }
  }
  const _reticleScale = new THREE.Vector3(1, 1, 1);
  function onXRFrame(time, frame) {
    if (!s.xrSession) return;
    s.xrSession.requestAnimationFrame(onXRFrame);
    s.xrFrame = frame;

    // Keep placed art locked to its real-world anchor.
    for (const a of s.anchoredMeshes) {
      if (!a.anchor || !a.anchor.anchorSpace) continue;
      const pose = frame.getPose(a.anchor.anchorSpace, s.xrRefSpace);
      if (pose) { a.mesh.matrixAutoUpdate = false; a.mesh.matrix.fromArray(pose.transform.matrix); }
    }

    // Light the piece like the room it's in.
    if (s.lightProbe && frame.getLightEstimate) {
      const est = frame.getLightEstimate(s.lightProbe);
      if (est) {
        const pi = est.primaryLightIntensity, pd = est.primaryLightDirection;
        key.intensity = Math.min(3, Math.max(0.4, Math.max(pi.x, pi.y, pi.z)));
        key.position.set(pd.x, pd.y, pd.z).multiplyScalar(3);
        const sh = est.sphericalHarmonicsCoefficients;
        if (sh && sh.length >= 3) ambient.intensity = Math.min(1.6, Math.max(0.15, (sh[0] + sh[1] + sh[2]) / 3));
      }
    }

    const viewerPose = frame.getViewerPose(s.xrRefSpace);
    let camPos = null;
    if (viewerPose) {
      const p = viewerPose.transform.position;
      camPos = _camPos.set(p.x, p.y, p.z);
    }

    // The hit-test ray (screen centre) gives the exact point the user is aiming
    // at *plus* an estimated surface normal. Prefer the nearest WALL hit so
    // aiming above a sofa doesn't grab the sofa or floor edge in front of it.
    let hitPose = null;
    const hits = frame.getHitTestResults(s.xrHitTestSource);
    for (let i = 0; i < hits.length && i < 5; i++) {
      const pose = hits[i].getPose(s.xrRefSpace);
      if (!pose) continue;
      if (!hitPose) hitPose = pose;
      if (Math.abs(pose.transform.matrix[5]) < 0.5) { hitPose = pose; break; } // |normal.y| small → wall
    }

    if (s.lastHitTime == null) s.lastHitTime = time;

    const r = s.reticleMesh;
    let targetValid = false, isWall = false, estimated = false;

    if (hitPose) {
      s.lastHitTime = time;
      const m = hitPose.transform.matrix;
      _hitPos.set(m[12], m[13], m[14]);
      _normal.set(m[4], m[5], m[6]).normalize(); // hit pose +Y = surface normal

      // Snap to a clean wall-plane normal and project the hit onto that plane —
      // removes both angular jitter and the few-cm depth error that makes
      // pieces float off (or sink into) the wall.
      if (wallPlaneAt(frame, _hitPos)) {
        _normal.copy(_bestN);
        const d = (_hitPos.x - _bestC.x) * _bestN.x + (_hitPos.y - _bestC.y) * _bestN.y + (_hitPos.z - _bestC.z) * _bestN.z;
        _hitPos.addScaledVector(_bestN, -d);
      }

      // Always face the art into the room (toward the camera).
      if (camPos) {
        const facing = _normal.x * (camPos.x - _hitPos.x) + _normal.y * (camPos.y - _hitPos.y) + _normal.z * (camPos.z - _hitPos.z);
        if (facing < 0) _normal.multiplyScalar(-1);
      }

      // Hysteresis: once locked onto a wall it takes a clearly horizontal
      // surface to switch away, so the reticle doesn't flicker wall↔floor
      // along skirting boards and furniture edges.
      isWall = Math.abs(_normal.y) < (s.onWall ? 0.65 : 0.5);
      targetValid = true;
    } else if (camPos && viewerPose && time - s.lastHitTime > 600) {
      // No hit-test result — common on big blank / untextured walls (ARCore's
      // hit-test needs visual features). Fall back to the depth API: ARCore's
      // neural depth model *does* see blank walls, so place the target at the
      // real measured distance straight ahead. Only if depth is unavailable
      // too, use a fixed 1.3 m guess after a longer grace period.
      let dist = 0;
      if (frame.getDepthInformation) {
        try {
          const depth = frame.getDepthInformation(viewerPose.views[0]);
          if (depth) {
            const d = depth.getDepthInMeters(0.5, 0.5);
            if (d > 0.25 && d < 8) dist = d;
          }
        } catch { /* CPU depth not available this frame */ }
      }
      if (dist || time - s.lastHitTime > 1400) {
        const vm = viewerPose.transform.matrix;
        _dir.set(-vm[8], -vm[9], -vm[10]).normalize(); // true camera forward
        _hitPos.copy(camPos).addScaledVector(_dir, dist || 1.3);
        _normal.set(vm[8], vm[9], vm[10]); // back toward the viewer
        _normal.y = 0;
        if (_normal.lengthSq() < 1e-4) _normal.set(0, 0, 1);
        _normal.normalize();
        isWall = true;
        estimated = true;
        targetValid = true;
      }
    }

    if (r && targetValid) {
      orientationFor(_targetQ, _normal, isWall, camPos, _hitPos);

      // Temporal smoothing — raw poses jitter a few cm frame to frame, and
      // placement inherits whatever pose the reticle shows. Snap on big jumps
      // (new surface), glide on small ones (sensor noise).
      if (!s.hasSmooth || estimated !== s.estimated || _smoothPos.distanceToSquared(_hitPos) > 0.09) {
        _smoothPos.copy(_hitPos); _smoothQuat.copy(_targetQ); s.hasSmooth = true;
      } else {
        _smoothPos.lerp(_hitPos, 0.25);
        _smoothQuat.slerp(_targetQ, 0.25);
      }
      s.onWall = isWall;
      s.estimated = estimated;
      s.reticlePos = _retPos.copy(_smoothPos);
      s.reticleNormal = _retN.copy(_normal);
      s.reticleQuat = _smoothQuat;

      r.visible = true;
      r.matrixAutoUpdate = false;
      r.matrix.compose(_smoothPos, _smoothQuat, _reticleScale); // ring lies flat on the surface
      r.material.color.setHex(estimated ? 0x9a7b3a : isWall ? 0xc9a84c : 0x6f8a9a);
      if (instructionEl) instructionEl.textContent = estimated
        ? "Blank wall detected — tap to place, or step back to refine"
        : isWall
        ? "Wall found — tap to hang the artwork"
        : "Surface found — aim at a wall to hang it";
      if (placeBtnEl) placeBtnEl.disabled = false;
    } else if (r && s.hasSmooth && time - s.lastHitTime < 250) {
      // Brief tracking dropout — hold the last good pose instead of flickering.
    } else if (r) {
      r.visible = false;
      s.hasSmooth = false;
      s.estimated = false;
      s.reticlePos = null;
      if (instructionEl) instructionEl.textContent = "Move your phone slowly to scan the wall";
      if (placeBtnEl) placeBtnEl.disabled = true;
    }
    renderer.render(scene, camera);
  }
  function placeArtwork() {
    if (!s.isARActive || !s.reticleMesh?.visible || !s.reticlePos) return;
    // A single tap can fire both the XR `select` event and the button's click —
    // a short cooldown stops it placing two copies on top of each other.
    const now = performance.now();
    if (now - (s.lastPlace || 0) < 350) return;
    s.lastPlace = now;

    const mesh = buildArtworkMesh();
    // Sit the frame's back a hair off the surface so it doesn't z-fight the wall.
    const pos = s.reticlePos.clone().addScaledVector(s.reticleNormal, 0.012);
    mesh.position.copy(pos);
    mesh.quaternion.copy(s.reticleQuat);
    mesh.updateMatrixWorld(true);
    scene.add(mesh); s.placedMeshes.push(mesh);

    // Anchor to the world so it stays put on the wall as the user walks around.
    const frame = s.xrFrame;
    if (frame && frame.createAnchor && typeof XRRigidTransform !== "undefined") {
      try {
        const q = mesh.quaternion;
        const pose = new XRRigidTransform({ x: pos.x, y: pos.y, z: pos.z }, { x: q.x, y: q.y, z: q.z, w: q.w });
        frame.createAnchor(pose, s.xrRefSpace).then((anchor) => s.anchoredMeshes.push({ mesh, anchor })).catch(() => {});
      } catch { /* fixed placement is fine */ }
    }
    toast(s.estimated ? "Placed — step back to line it up on the wall" : s.onWall ? "Hung on the wall" : "Placed");
  }
  function undo() {
    const last = s.placedMeshes.pop();
    if (!last) return;
    scene.remove(last);
    const i = s.anchoredMeshes.findIndex((a) => a.mesh === last);
    if (i !== -1) { try { s.anchoredMeshes[i].anchor?.delete?.(); } catch { /* ignore */ } s.anchoredMeshes.splice(i, 1); }
    toast("Removed");
  }
  function screenshot() {
    try {
      renderer.render(scene, camera);
      onScreenshot(renderer.domElement.toDataURL("image/png"));
    } catch { toast("Screenshot blocked by image security"); }
  }
  function exitAR() {
    if (s.xrSession) { try { s.xrSession.end(); } catch { /* ignore */ } s.xrSession = null; }
    s.isARActive = false;
    s.lightProbe = null;
    s.hasSmooth = false;
    if (s.onBeforeSelect) { overlayEl?.removeEventListener("beforexrselect", s.onBeforeSelect); s.onBeforeSelect = null; }
    if (s.reticleMesh) { scene.remove(s.reticleMesh); s.reticleMesh = null; }
    s.placedMeshes.forEach((m) => scene.remove(m)); s.placedMeshes = [];
    s.anchoredMeshes.forEach((a) => { try { a.anchor?.delete?.(); } catch { /* ignore */ } }); s.anchoredMeshes = [];
    s.xrFrame = null; renderer.xr.enabled = false;
    // Restore the studio-preview scene and lighting that AR mode altered.
    floor.visible = true;
    key.castShadow = true;
    key.intensity = 2.1; key.position.set(2, 3, 3);
    ambient.intensity = 0.45;
    scene.background = new THREE.Color(0x0d0d0d); renderer.setClearAlpha(1);
    resize(); rebuildPreview(); previewLoop();
    onARExit();
  }

  function dispose() {
    s.disposed = true;
    cancelAnimationFrame(s.rafId);
    try { s.xrSession && s.xrSession.end(); } catch { /* ignore */ }
    canvas.removeEventListener("mousedown", onDown);
    window.removeEventListener("mouseup", onUp);
    window.removeEventListener("mousemove", onMove);
    canvas.removeEventListener("wheel", onWheel);
    window.removeEventListener("resize", resize);
    try { renderer.dispose(); } catch { /* ignore */ }
  }

  return {
    checkSupport, enterAR, exitAR, placeArtwork, undo, screenshot,
    loadArtwork, loadArtworkFile, dispose,
    setFrameStyle: (v) => { s.frameStyle = v; rebuildPreview(); },
    setFrameColor: (v) => { s.frameColor = v; rebuildPreview(); },
    setScale: (v) => { s.artworkScale = v; rebuildPreview(); },
    setFrameWidth: (v) => { s.frameWidth = v; rebuildPreview(); },
    setMatte: (v) => { s.matteWidth = v; rebuildPreview(); },
    setShadow: (v) => { s.shadowIntensity = v; rebuildPreview(); },
  };
}
