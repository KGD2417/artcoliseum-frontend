import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLocale } from "../context/Locale";

const TARGET_RING_COUNT = 18;
const VISIBLE_DEG = 75;

export default function ColiseumGallery({ items, navigate }) {
  const { formatPrice } = useLocale();

  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dims, setDims] = useState({ hRadius: 620, dRadius: 200 });

  const startX = useRef(0);
  const startRot = useRef(0);
  const lastTime = useRef(performance.now());
  const rafRef = useRef(null);

  const TARGET = 16;
  const ringItems =
    items.length === 0
      ? []
      : items.length >= TARGET
        ? items
        : Array.from({ length: TARGET }, (_, i) => items[i % items.length]);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 520) setDims({ hRadius: 280, dRadius: 100 });
      else if (w < 800) setDims({ hRadius: 420, dRadius: 140 });
      else if (w < 1200) setDims({ hRadius: 560, dRadius: 180 });
      else setDims({ hRadius: 720, dRadius: 220 });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const tick = (time) => {
      const dt = time - lastTime.current;
      lastTime.current = time;
      if (!isDragging) {
        setRotation((r) => r - dt * 0.006);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    lastTime.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isDragging]);

  const getX = (e) =>
    e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);

  const handleDown = (e) => {
    setIsDragging(true);
    startX.current = getX(e);
    startRot.current = rotation;
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    setRotation(startRot.current + (getX(e) - startX.current) * 0.32);
  };

  const handleUp = () => setIsDragging(false);

  const count = ringItems.length || 1;
  const step = 360 / count;
  const VISIBLE = 75;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="hl-wrap"
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
      onMouseDown={handleDown}
      onMouseMove={handleMove}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      onTouchStart={handleDown}
      onTouchMove={handleMove}
      onTouchEnd={handleUp}>
      <div className="hl-glow" />
      <div className="hl-stage">
        {ringItems.map((item, i) => {
          const angle = step * i;
          const rel = ((((angle + rotation) % 360) + 540) % 360) - 180;
          const absRel = Math.abs(rel);
          if (absRel > VISIBLE) return null;

          const aRad = (rel * Math.PI) / 180;
          const x = Math.sin(aRad) * dims.hRadius;
          const z = (Math.cos(aRad) - 1) * dims.dRadius;

          const focus = Math.max(0, 1 - absRel / VISIBLE);
          const scale = 0.6 + focus * 0.55;
          const opacity =
            absRel < 60 ? 1 : Math.max(0, (VISIBLE - absRel) / 20);
          const brightness = 0.5 + focus * 0.5;
          const blurPx = (1 - focus) * 2.4;
          const isCenter = absRel < step / 2;

          return (
            <div
              key={i}
              className={`hl-card ${isCenter ? "is-center" : ""}`}
              style={{
                transform: `translate3d(${x}px, 0, ${z}px) scale(${scale})`,
                opacity,
                zIndex: 1000 - Math.round(absRel * 10),
              }}>
              <div
                className="hl-card-inner"
                style={{
                  filter: `brightness(${brightness}) saturate(${0.7 + focus * 0.4}) blur(${blurPx}px)`,
                }}>
                <img src={item.img} alt={item.title} draggable={false} />
                <div className="hl-card-shade" />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
