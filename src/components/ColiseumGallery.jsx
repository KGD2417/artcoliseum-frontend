import { useState, useEffect, useRef } from "react";

const TARGET_RING_COUNT = 24;

export default function ColiseumGallery({
  items = [],
  autoplay = true,
  speed = 0.009,
  tiltX = -7,
}) {
  const ringItems =
    items.length === 0
      ? []
      : items.length >= TARGET_RING_COUNT
        ? items
        : Array.from(
            { length: TARGET_RING_COUNT },
            (_, i) => items[i % items.length],
          );
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [radius, setRadius] = useState(820);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const startX = useRef(0);
  const startRot = useRef(0);
  const lastTime = useRef(performance.now());
  const rafRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 520) setRadius(320);
      else if (w < 800) setRadius(460);
      else if (w < 1200) setRadius(620);
      else if (w < 1600) setRadius(760);
      else setRadius(880);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const tick = (time) => {
      const dt = time - lastTime.current;
      lastTime.current = time;
      if (autoplay && !isDragging) {
        setRotation((r) => r - dt * speed);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    lastTime.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isDragging, autoplay, speed]);

  const getX = (e) =>
    e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);

  const handleDown = (e) => {
    setIsDragging(true);
    startX.current = getX(e);
    startRot.current = rotation;
  };

  const handleMove = (e) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect && e.clientX != null && e.clientY != null) {
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      setParallax({ x: px, y: py });
    }
    if (!isDragging) return;
    const x = getX(e);
    setRotation(startRot.current + (x - startX.current) * 0.32);
  };

  const handleUp = () => setIsDragging(false);

  const handleLeave = () => {
    setIsDragging(false);
    setParallax({ x: 0, y: 0 });
  };

  const count = ringItems.length || 1;
  const step = 360 / count;

  return (
    <div
      ref={wrapRef}
      className="coliseum-wrap"
      onMouseDown={handleDown}
      onMouseMove={handleMove}
      onMouseUp={handleUp}
      onMouseLeave={handleLeave}
      onTouchStart={handleDown}
      onTouchMove={handleMove}
      onTouchEnd={handleUp}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}>
      <div className="coliseum-floor" />
      <div className="coliseum-glow" />

      <div
        className="coliseum-stage"
        style={{
          transform: `rotateX(${tiltX + parallax.y * -2.5}deg) rotateY(${
            rotation + parallax.x * 5
          }deg)`,
          transition: isDragging ? "none" : "transform 0.2s ease-out",
        }}>
        {ringItems.map((item, i) => {
          const angle = step * i;
          const rel = ((((angle + rotation) % 360) + 540) % 360) - 180;
          const absRel = Math.abs(rel);
          const isCenter = absRel < step / 2;

          const opacity =
            absRel < 75 ? 1 : absRel < 110 ? (110 - absRel) / 35 : 0;
          const visible = absRel < 110;
          const dim = 1 - Math.min(absRel / 130, 0.7);

          // Subtle focus scaling — center slightly bigger, sides slightly smaller
          const focus = Math.max(0, 1 - absRel / 90);
          const scale = 0.75 + focus * 0.45;

          return (
            <div
              key={i}
              className={`coliseum-tile ${isCenter ? "is-center" : ""}`}
              style={{
                transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                opacity,
                pointerEvents: visible ? "auto" : "none",
              }}>
              <div
                className="coliseum-tile-inner"
                style={{
                  filter: `brightness(${dim}) saturate(${0.65 + dim * 0.55})`,
                  transform: `scale(${scale})`,
                }}>
                <img src={item.image} alt={item.text || ""} draggable={false} />
                <div className="coliseum-tile-shade" />
                {item.text && (
                  <div className="coliseum-tile-label">{item.text}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="coliseum-fade-l" />
      <div className="coliseum-fade-r" />
    </div>
  );
}
