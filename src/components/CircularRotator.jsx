import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import SafeImage from "./SafeImage";

/* Premium gold-themed image rotator inspired by circular-testimonials.
   Three images visible at any time: active (front), left (rotated +Y),
   right (rotated -Y). Auto-cycles every 4s. Click to advance. */
export default function CircularRotator({ items = [], autoplay = true, interval = 4000 }) {
  const [active, setActive] = useState(0);
  const [width, setWidth] = useState(420);
  const ref = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const onResize = () => { if (ref.current) setWidth(ref.current.offsetWidth); };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!autoplay || items.length <= 1) return;
    timer.current = setInterval(() => {
      setActive(p => (p + 1) % items.length);
    }, interval);
    return () => clearInterval(timer.current);
  }, [autoplay, items.length, interval]);

  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    if (autoplay) timer.current = setInterval(() => setActive(p => (p + 1) % items.length), interval);
  };

  const gap = Math.max(48, Math.min(96, width * 0.15));
  const stickUp = gap * 0.7;

  const styleFor = (i) => {
    const isActive = i === active;
    const isLeft   = (active - 1 + items.length) % items.length === i;
    const isRight  = (active + 1) % items.length === i;
    if (isActive) return {
      zIndex: 3, opacity: 1,
      transform: "translateX(0) translateY(0) scale(1) rotateY(0deg)",
    };
    if (isLeft) return {
      zIndex: 2, opacity: 1,
      transform: `translateX(-${gap}px) translateY(-${stickUp}px) scale(0.85) rotateY(18deg)`,
    };
    if (isRight) return {
      zIndex: 2, opacity: 1,
      transform: `translateX(${gap}px) translateY(-${stickUp}px) scale(0.85) rotateY(-18deg)`,
    };
    return { zIndex: 1, opacity: 0, pointerEvents: "none" };
  };

  return (
    <div className="rot-wrap">
      <div className="rot-glow" />
      <div ref={ref} className="rot-stage" onClick={() => { setActive(p => (p + 1) % items.length); reset(); }}>
        {items.map((it, i) => (
          <motion.div
            key={i}
            className="rot-card"
            style={{
              ...styleFor(i),
              transition: "transform 0.9s cubic-bezier(0.4, 2, 0.3, 1), opacity 0.7s ease",
            }}>
            <SafeImage src={it.image} alt={it.text || ""} fallbackIndex={i} />
            <div className="rot-card-frame" />
            {it.text && (
              <div className="rot-card-label">
                <span>{it.text}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="rot-dots">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); reset(); }}
              className={`rot-dot ${i === active ? "is-active" : ""}`}
              aria-label={`Show item ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
