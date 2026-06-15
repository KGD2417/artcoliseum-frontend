import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "../context/Locale";
import { LOCAL_ASSETS } from "./SafeImage";
import logo from "../assets/logo.png";

// A subtle plaster/stone grain so the walls and floor aren't flat black.
function makeGrainTexture() {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#7a7a7a";
  ctx.fillRect(0, 0, s, s);
  const img = ctx.getImageData(0, 0, s, s);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 110 + Math.random() * 90;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// A soft, blurred dark rectangle used as a fake drop shadow behind each frame.
let _shadowTex;
function shadowTexture() {
  if (_shadowTex) return _shadowTex;
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, s, s);
  ctx.filter = "blur(24px)";
  ctx.fillStyle = "rgba(0,0,0,0.92)";
  ctx.fillRect(44, 44, s - 88, s - 88);
  _shadowTex = new THREE.CanvasTexture(c);
  return _shadowTex;
}

// ── Corridor layout (world units) ────────────────────────────────────────────
const WALL_X = 4.4;      // side walls at ±4.4
const PAINT_Y = 1.75;    // camera / eye height
const ART_Y = 2.25;      // painting centre height (hung above eye level)
const SPACING = 6.5;     // distance between successive works
const FIRST_Z = -4;      // first work sits here
const TOE = 0.26;        // paintings angle in toward the approaching viewer
const paintingZ = (i) => FIRST_Z - i * SPACING;
const focusZ = (i) => paintingZ(i) + 6.5;            // where the camera parks (well back)
const sideOf = (i) => (i % 2 === 0 ? "left" : "right");

const gold = "#D4AF37";

// Loads each painting's texture with a graceful fallback to a bundled image,
// without suspending (so a broken URL never blanks the whole gallery).
function useSafeTexture(url, fallback) {
  const [tex, setTex] = useState(null);
  useEffect(() => {
    let alive = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const apply = (t) => { if (!alive) return; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16; t.needsUpdate = true; setTex(t); };
    loader.load(url, apply, undefined, () => fallback && loader.load(fallback, apply, undefined, () => {}));
    return () => { alive = false; };
  }, [url, fallback]);
  return tex;
}

// A spotlight that actually aims where you tell it: its target is a real
// Object3D in the scene graph (a detached target silently aims at world origin).
function Spot({ position, target = [0, 0, 0], ...props }) {
  const light = useRef();
  const tgt = useRef();
  useEffect(() => {
    if (light.current && tgt.current) light.current.target = tgt.current;
  }, []);
  return (
    <>
      <spotLight ref={light} position={position} {...props} />
      <object3D ref={tgt} position={target} />
    </>
  );
}

function Painting({ work, index, active, onSelect, onOpen }) {
  const fallback = LOCAL_ASSETS[index % LOCAL_ASSETS.length];
  const src = work.images?.[0] || fallback;
  const tex = useSafeTexture(src, fallback);
  const [hover, setHover] = useState(false);
  const inner = useRef();

  const aspect = tex?.image ? tex.image.width / tex.image.height : 0.8;
  const H = 2.75;
  const W = Math.min(Math.max(H * aspect, 1.6), 4.1);

  const side = sideOf(index);
  const x = side === "left" ? -WALL_X + 0.1 : WALL_X - 0.1;
  // Toe each work in toward the viewer's approach so it reads, not grazes.
  const rotY = side === "left" ? Math.PI / 2 - TOE : -Math.PI / 2 + TOE;
  const z = paintingZ(index);

  useEffect(() => {
    document.body.style.cursor = hover ? "pointer" : "";
    return () => { document.body.style.cursor = ""; };
  }, [hover]);

  // Gentle "lean out to greet you" lift on hover.
  useFrame(() => {
    if (!inner.current) return;
    const k = hover ? 1.035 : 1;
    inner.current.scale.x += (k - inner.current.scale.x) * 0.12;
    inner.current.scale.y = inner.current.scale.z = inner.current.scale.x;
  });

  // Clicking the focused work opens it; clicking another walks you to it.
  const onClick = (e) => { e.stopPropagation(); active ? onOpen(work) : onSelect(index); };

  return (
    <group position={[x, ART_Y, z]} rotation={[0, rotY, 0]}>
      {/* warm pool of light on the wall/frame — the canvas is unlit, so this
          can't blow out the artwork; it just lifts the surroundings. */}
      <Spot position={[0, 1.75, 2.4]} target={[0, 0, 0]} angle={0.62} penumbra={1} decay={1.6}
        distance={11} intensity={active ? 55 : hover ? 42 : 24} color="#ffdca6" />
      <group ref={inner}
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={() => setHover(false)}>
        {/* soft drop shadow on the wall behind the frame (offset down) */}
        <mesh position={[0.06, -0.16, -0.1]}>
          <planeGeometry args={[W + 0.85, H + 0.85]} />
          <meshBasicMaterial map={shadowTexture()} transparent opacity={0.6}
            color="#000000" depthWrite={false} toneMapped={false} />
        </mesh>
        {/* gilt frame */}
        <mesh position={[0, 0, -0.12]}>
          <boxGeometry args={[W + 0.26, H + 0.26, 0.16]} />
          <meshStandardMaterial color="#c79a3f" metalness={0.9} roughness={0.3}
            emissive="#6e4f17" emissiveIntensity={active ? 0.6 : hover ? 0.5 : 0.32} />
        </mesh>
        {/* mat */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[W + 0.08, H + 0.08]} />
          <meshStandardMaterial color="#0d0d0d" roughness={1} />
        </mesh>
        {/* canvas — UNLIT so the artwork shows at true exposure. Keyed on the
            texture so the material is rebuilt once the image actually loads. */}
        <mesh position={[0, 0, 0.02]} key={tex ? "img" : "blank"}>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial map={tex || null}
            color={tex ? (active || hover ? "#ffffff" : "#c4bdb0") : "#15130f"} toneMapped />
        </mesh>
      </group>
    </group>
  );
}

// The focal point at the end of the hall: the Art Coliseum logo, lit like an
// emblem on a pedestal.
function LogoEmblem({ z }) {
  const tex = useSafeTexture(logo, logo);
  const aspect = tex?.image ? tex.image.width / tex.image.height : 2.4;
  const H = 1.7;
  const W = H * aspect;
  return (
    <group position={[0, 0, z]}>
      {/* spotlight from above */}
      <Spot position={[0, 6, 1.4]} target={[0, 2, 0]} angle={0.5} penumbra={1} decay={1.4} distance={14}
        intensity={70} color="#ffe9c6" />
      {/* pedestal */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.95, 1.15, 1.1, 40]} />
        <meshStandardMaterial color="#161410" roughness={0.7} metalness={0.25} />
      </mesh>
      <mesh position={[0, 1.13, 0]}>
        <boxGeometry args={[1.7, 0.12, 1.7]} />
        <meshStandardMaterial color="#1c190f" roughness={0.6} metalness={0.35} />
      </mesh>
      {/* glowing emblem (faces the entrance) */}
      <mesh position={[0, 1.2 + H / 2 + 0.2, 0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial
          map={tex || null} transparent alphaTest={0.08} color="#000000" roughness={1}
          emissive="#ffffff" emissiveMap={tex || null} emissiveIntensity={1.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Smoothly dollies the camera to the active station, framing the active work.
function Rig({ active }) {
  const pos = useRef(new THREE.Vector3(0, PAINT_Y, focusZ(active)));
  const look = useRef(new THREE.Vector3(0, 1.5, focusZ(active) - 12));
  useFrame((state) => {
    const side = sideOf(active);
    pos.current.set(side === "left" ? 0.9 : -0.9, PAINT_Y, focusZ(active)); // step toward opposite wall
    look.current.lerp(new THREE.Vector3(side === "left" ? -1.6 : 1.6, 1.75, focusZ(active) - 12), 0.06);
    state.camera.position.lerp(pos.current, 0.045);
    state.camera.lookAt(look.current);
  });
  return null;
}

function Scene({ works, active, onSelect, onOpen }) {
  const lastZ = works.length ? paintingZ(works.length - 1) : FIRST_Z;
  // Always keep the statue a good distance past the last work (and far enough
  // away even for a one-painting show) so it reads as a distant focal point.
  const statueZ = Math.min(lastZ - 9, -19);
  const midZ = (10 + statueZ) / 2;
  const len = 10 - statueZ + 26;

  // Fresh grain texture per surface (repeat differs, so they can't be shared).
  const wallTex = useMemo(() => { const t = makeGrainTexture(); t.repeat.set(Math.round(len / 4), 3); return t; }, [len]);
  const floorTex = useMemo(() => { const t = makeGrainTexture(); t.repeat.set(5, Math.round(len / 3)); return t; }, [len]);
  const vaultTex = useMemo(() => { const t = makeGrainTexture(); t.repeat.set(8, Math.round(len / 4)); return t; }, [len]);

  return (
    <>
      <color attach="background" args={["#100c08"]} />
      <fog attach="fog" args={["#100c08", 14, Math.max(42, -statueZ + 20)]} />
      <ambientLight intensity={0.9} color="#fff1da" />
      <hemisphereLight intensity={0.6} color="#ffe7c2" groundColor="#1a140c" />

      {/* reflective marble floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, midZ]}>
        <planeGeometry args={[WALL_X * 2.4, len]} />
        <MeshReflectorMaterial
          resolution={1024} mixBlur={1.2} mixStrength={20} blur={[400, 120]}
          roughness={0.78} roughnessMap={floorTex} depthScale={1.1}
          minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#23212a" metalness={0.6} />
      </mesh>

      {/* central floor medallion */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, focusZ(0) - 2]}>
        <ringGeometry args={[1.4, 2.4, 64]} />
        <meshStandardMaterial color={gold} transparent opacity={0.14} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* side walls — warm stone with a faint grain so they catch the light */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * WALL_X, 3, midZ]} rotation={[0, -s * Math.PI / 2, 0]}>
          <planeGeometry args={[len, 6]} />
          <meshStandardMaterial color="#3a3326" roughness={0.95} metalness={0}
            roughnessMap={wallTex} bumpMap={wallTex} bumpScale={0.015} />
        </mesh>
      ))}

      {/* ceiling */}
      <mesh position={[0, 5.4, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[WALL_X * 2.3, len]} />
        <meshStandardMaterial color="#241e15" roughness={1}
          roughnessMap={vaultTex} bumpMap={vaultTex} bumpScale={0.02} />
      </mesh>

      {/* warm ceiling fill running the length of the hall so the space reads */}
      {Array.from({ length: Math.max(3, works.length + 2) }).map((_, k) => (
        <pointLight key={k} position={[0, 4.7, FIRST_Z + 4 - k * (SPACING * 0.8)]}
          intensity={14} distance={14} decay={1.6} color="#ffe6bf" />
      ))}

      {/* floating dust caught in the light */}
      <Sparkles count={70} scale={[WALL_X * 1.7, 4, len * 0.8]} position={[0, 2.6, midZ]}
        size={3} speed={0.22} opacity={0.5} color="#ffe6bf" />

      {works.map((w, i) => (
        <Painting key={w.id || i} work={w} index={i} active={i === active} onSelect={onSelect} onOpen={onOpen} />
      ))}

      <LogoEmblem z={statueZ} />

      <Rig active={active} />

      <EffectComposer multisampling={4} disableNormalPass>
        <Bloom intensity={0.4} luminanceThreshold={0.9} luminanceSmoothing={0.2} mipmapBlur radius={0.6} />
        <Vignette offset={0.4} darkness={0.5} eskil={false} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </>
  );
}

// ── Public component ─────────────────────────────────────────────────────────
export default function Gallery3D({ ex }) {
  const works = ex?.artworks || [];
  const [active, setActive] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const [preview, setPreview] = useState(null); // work being previewed large
  const [navShown, setNavShown] = useState(false);
  const wrapRef = useRef(null);
  const wheelLock = useRef(false);
  const touchY = useRef(null);
  const n = works.length;

  // Exhibition mode hides the site nav for full immersion; it returns when the
  // cursor reaches the top of the screen (or via the ☰ button on touch).
  useEffect(() => {
    document.body.classList.add("g3-immersive");
    const onMove = (e) => {
      if (e.clientY < 80) setNavShown(true);
      else if (e.clientY > 240) setNavShown(false);
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.body.classList.remove("g3-immersive", "g3-nav-show");
    };
  }, []);
  useEffect(() => { document.body.classList.toggle("g3-nav-show", navShown); }, [navShown]);

  const go = useMemo(() => (dir) => {
    setInteracted(true);
    setActive((i) => Math.min(Math.max(i + dir, 0), Math.max(n - 1, 0)));
  }, [n]);
  const jump = (i) => { setInteracted(true); setActive(Math.min(Math.max(i, 0), Math.max(n - 1, 0))); };

  // Scroll / key / swipe navigation (only while not previewing).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || preview) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      if (wheelLock.current) return;
      if (Math.abs(e.deltaY) < 8) return;
      wheelLock.current = true;
      go(e.deltaY > 0 ? 1 : -1);
      setTimeout(() => { wheelLock.current = false; }, 650);
    };
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); go(-1); }
    };
    const onTouchStart = (e) => { touchY.current = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      if (touchY.current == null) return;
      const dy = touchY.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) go(dy > 0 ? 1 : -1);
      touchY.current = null;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [go, preview]);

  const a = works[active];

  return (
    <div ref={wrapRef} className="g3-wrap">
      <Canvas
        flat
        className="g3-canvas"
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: "high-performance", logarithmicDepthBuffer: true }}
        camera={{ position: [0, PAINT_Y, 8], fov: 62, near: 0.5, far: 120 }}>
        <Suspense fallback={null}>
          <Scene works={works} active={active} onSelect={jump} onOpen={setPreview} />
        </Suspense>
      </Canvas>

      {/* Menu toggle (reveal the site nav) */}
      <button className="g3-menu" onClick={() => setNavShown((v) => !v)} aria-label="Toggle menu">☰</button>

      {/* Title */}
      <div className="g3-title">
        <h1>{ex?.title || "BEYOND TIME"}</h1>
        <div className="g3-sub">{(ex?.theme || ex?.description || "A JOURNEY THROUGH MASTERPIECES").toUpperCase()}</div>
      </div>

      {/* Scroll hint (fades after first interaction) */}
      <AnimatePresence>
        {!interacted && n > 0 && (
          <motion.div className="g3-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <span>SCROLL TO EXPLORE</span>
            <motion.div className="g3-chev" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>⌄</motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active info card */}
      <AnimatePresence mode="wait">
        {a && (
          <motion.div className="g3-card" key={a.id || active}
            initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
            <div className="g3-no">{String(active + 1).padStart(2, "0")}</div>
            <h2>{a.title}</h2>
            {a.artist_name && <div className="g3-artist">{a.artist_name}</div>}
            <div className="g3-meta">
              {[a.year, a.medium, a.base_dimensions].filter(Boolean).map((m, k) => <div key={k}>{m}</div>)}
            </div>
            <button className="g3-btn" onClick={() => setPreview(a)}>VIEW DETAILS <span>+</span></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom progress bar */}
      {n > 0 && (
        <div className="g3-bar">
          <button className="g3-arrow" onClick={() => go(-1)} disabled={active === 0} aria-label="Previous">‹<span>PREV</span></button>
          <div className="g3-track">
            <div className="g3-line" />
            <div className="g3-line g3-line-fill" style={{ width: n > 1 ? `${(active / (n - 1)) * 100}%` : "100%" }} />
            {works.map((w, i) => (
              <button key={w.id || i} className={`g3-dot ${i === active ? "on" : ""}`} style={{ left: n > 1 ? `${(i / (n - 1)) * 100}%` : "50%" }}
                onClick={() => jump(i)} aria-label={w.title}>
                <span className="g3-dot-no">{String(i + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
          <button className="g3-arrow g3-arrow-next" onClick={() => go(1)} disabled={active >= n - 1} aria-label="Next"><span>NEXT</span>›</button>
        </div>
      )}

      {/* Larger preview */}
      <AnimatePresence>
        {preview && <Preview work={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </div>
  );
}

function Preview({ work, onClose }) {
  const { formatPrice } = useLocale();
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const img = work.images?.[0] || LOCAL_ASSETS[0];
  return (
    <motion.div className="g3-preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <button className="g3-preview-close" onClick={onClose} aria-label="Close">✕</button>
      <div className="g3-preview-inner" onClick={(e) => e.stopPropagation()}>
        <div className="g3-preview-img"><img src={img} alt={work.title} /></div>
        <div className="g3-preview-info">
          <h2>{work.title}</h2>
          {work.artist_name && <div className="g3-artist">{work.artist_name}</div>}
          <div className="g3-meta">
            {[work.year, work.medium, work.base_dimensions].filter(Boolean).map((m, k) => <div key={k}>{m}</div>)}
          </div>
          {(work.narrative || work.description) && <p className="g3-preview-note">{work.narrative || work.description}</p>}
          {work.price > 0 && <div className="g3-price">{formatPrice(work.price)}</div>}
          <Link to={`/product/${work.id}`} className="g3-btn g3-btn-solid">VIEW FULL DETAILS & ENQUIRE →</Link>
        </div>
      </div>
    </motion.div>
  );
}
