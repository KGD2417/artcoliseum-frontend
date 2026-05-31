import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ── constants ─────────────────────────────────────────────────────── */
const RADIUS = 720;
const ANGLE_STEP = 18;
const VISIBLE = 4.3;
const DECAY = 0.9;
const AUTO_SPEED = 0.00032; // index / ms  — ~1 slot per 3 s
const DRAG_SENS = 0.007;
const SNAP_K = 0.14;
const SNAP_THRESH = 0.003;

/* ── helpers ───────────────────────────────────────────────────────── */
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const lerp = (a, b, t) => a + (b - a) * t;

const wrappedDelta = (i, active, n) => {
  if (!n) return 0;
  const half = n / 2;
  return ((((i - active + half) % n) + n) % n) - half;
};

const nearestSlot = (float, n) => {
  const mod = ((float % n) + n) % n;
  return Math.round(mod);
};

/* ── component ─────────────────────────────────────────────────────── */
export default function ColiseumCarousel({ items = [] }) {
  const navigate = useNavigate();
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const spotRef = useRef(null);
  const activeRef = useRef(2);
  const velRef = useRef(0);
  const frameRef = useRef(null);
  const tLastRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const drag = useRef({ on: false, moved: false, lastX: 0, lastT: 0 });
  // true = smoothly auto-scrolling; false = settling/snapping after a drag
  const autoModeRef = useRef(true);

  const gallery = useMemo(
    () =>
      items
        .filter((it) => it?.image)
        .map((it, i) => ({
          image: it.image,
          text: it.text || `Artwork ${i + 1}`,
          medium: it.medium,
          price: it.price,
          id: it.id ?? null,
        })),
    [items],
  );

  useEffect(() => {
    const stage = stageRef.current;
    const n = gallery.length;
    if (!stage || !n) return;

    /* ── render ───────────────────────────────────────────── */
    const render = () => {
      const active = activeRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      stage.style.perspectiveOrigin = `${50 + mx * 4}% ${42 + my * 3}%`;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const delta = wrappedDelta(i, active, n);
        const absDelta = Math.abs(delta);

        const visT = clamp((VISIBLE - absDelta) / 0.55, 0, 1);
        if (visT <= 0) {
          card.style.opacity = "0";
          card.style.pointerEvents = "none";
          return;
        }

        const angleDeg = delta * ANGLE_STEP;
        const angleRad = angleDeg * (Math.PI / 180);
        const x = Math.sin(angleRad) * RADIUS;
        const z = (Math.cos(angleRad) - 1) * RADIUS;
        const rotY = -angleDeg;

        const t = Math.min(absDelta / VISIBLE, 1);
        const scale = 1 - t * 0.3;
        const opacity = visT * (1 - t * 0.6);
        const brightness = 1 - t * 0.3;
        const blur = t > 0.6 ? (t - 0.6) * 2.5 : 0;
        const zIndex = Math.round((1 - t) * 900 + 10);

        const shadowAlpha = lerp(0.35, 0.85, 1 - t);
        const shadowSize = lerp(12, 52, 1 - t);

        card.style.transform =
          `translateX(${x.toFixed(1)}px) ` +
          `translateZ(${z.toFixed(1)}px) ` +
          `rotateY(${rotY.toFixed(2)}deg) ` +
          `scale(${scale.toFixed(4)})`;
        card.style.opacity = opacity.toFixed(3);
        card.style.zIndex = zIndex;
        card.style.pointerEvents = absDelta < VISIBLE ? "auto" : "none";
        card.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blur.toFixed(2)}px)`;

        const face = card.querySelector(".coliseum-carousel-card-face");
        if (face) {
          face.style.boxShadow =
            `0 ${shadowSize}px ${shadowSize * 2}px rgba(0,0,0,${shadowAlpha.toFixed(2)}), ` +
            `0 0 0 1px rgba(255,255,255,0.05)`;
        }
      });

      if (spotRef.current) {
        const nearestI = nearestSlot(active, n);
        const nearestDelta = wrappedDelta(nearestI, active, n);
        const spotT = clamp(1 - Math.abs(nearestDelta) * 2, 0, 1);
        spotRef.current.style.opacity = (spotT * 0.9).toFixed(3);
      }
    };

    /* ── tick ─────────────────────────────────────────────── */
    const tick = (now) => {
      const dt = Math.min(now - (tLastRef.current || now), 34);
      tLastRef.current = now;

      if (!drag.current.on) {
        if (autoModeRef.current) {
          // continuous smooth drift — no snap fighting
          activeRef.current = (activeRef.current + AUTO_SPEED * dt + n) % n;
        } else {
          // post-drag: inertia then snap, then re-enter auto mode
          const absVel = Math.abs(velRef.current);
          if (absVel > SNAP_THRESH) {
            activeRef.current += velRef.current * dt;
            velRef.current *= Math.pow(DECAY, dt / 16.67);
            activeRef.current = ((activeRef.current % n) + n) % n;
          } else {
            velRef.current = 0;
            const target = nearestSlot(activeRef.current, n);
            const diff = wrappedDelta(target, activeRef.current, n);
            if (Math.abs(diff) < 0.002) {
              activeRef.current = target % n;
              autoModeRef.current = true; // back to smooth auto-scroll
            } else {
              activeRef.current += diff * SNAP_K;
              activeRef.current = ((activeRef.current % n) + n) % n;
            }
          }
        }
      }

      render();
      frameRef.current = requestAnimationFrame(tick);
    };

    /* ── pointer events ───────────────────────────────────── */
    const onDown = (e) => {
      drag.current = { on: true, moved: false, lastX: e.clientX, lastT: performance.now() };
      velRef.current = 0;
      autoModeRef.current = false; // pause auto-scroll while dragging
      stage.setPointerCapture?.(e.pointerId);
      stage.style.cursor = "grabbing";
    };

    const onMove = (e) => {
      if (!drag.current.on) return;
      const dx = e.clientX - drag.current.lastX;
      const dt2 = Math.max(performance.now() - drag.current.lastT, 8);
      const di = -dx * DRAG_SENS;
      if (Math.abs(dx) > 3) {
        drag.current.moved = true;
        e.preventDefault();
      }
      activeRef.current = (((activeRef.current + di) % n) + n) % n;
      velRef.current = di / dt2;
      drag.current.lastX = e.clientX;
      drag.current.lastT = performance.now();
      render();
    };

    const onUp = (e) => {
      if (!drag.current.on) return;
      drag.current.on = false;
      stage.releasePointerCapture?.(e.pointerId);
      stage.style.cursor = "grab";
      // autoModeRef stays false — settle/snap logic runs in tick, then flips back
    };

    const onMouse = (e) => {
      const r = stage.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - r.left) / r.width - 0.5) * 2,
        y: ((e.clientY - r.top) / r.height - 0.5) * 2,
      };
    };

    const onLeave = () => { mouseRef.current = { x: 0, y: 0 }; };

    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("mousemove", onMouse);
    stage.addEventListener("mouseleave", onLeave);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    render();
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("mousemove", onMouse);
      stage.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [gallery]);

  /* ── click handler ────────────────────────────────────────── */
  const handleCardClick = (item) => {
    if (drag.current.moved) {
      drag.current.moved = false;
      return;
    }
    if (item.id) {
      navigate(`/product/${item.id}`);
    } else {
      navigate("/categories");
    }
  };

  return (
    <div
      ref={stageRef}
      className="coliseum-carousel"
      aria-label="Featured artworks">
      <div className="coliseum-carousel-ambient" />
      <div className="coliseum-carousel-floor" />
      <div ref={spotRef} className="coliseum-carousel-spotlight" />
      <div className="coliseum-carousel-rail" />
      <div className="coliseum-carousel-fade coliseum-carousel-fade-left" />
      <div className="coliseum-carousel-fade coliseum-carousel-fade-right" />

      {gallery.map((item, i) => (
        <button
          key={`${item.text}-${i}`}
          ref={(el) => { cardRefs.current[i] = el; }}
          type="button"
          className="coliseum-carousel-card"
          aria-label={`View ${item.text}`}
          onClick={() => handleCardClick(item)}>
          <span className="coliseum-carousel-card-face">
            <img src={item.image} alt={item.text} draggable="false" />
            <span className="coliseum-carousel-card-shade" />
            <span className="coliseum-carousel-card-hover-cta">Explore Gallery →</span>
            <span className="coliseum-carousel-card-copy" />
          </span>
          <span className="coliseum-carousel-reflection" aria-hidden="true">
            <img src={item.image} alt="" draggable="false" />
          </span>
        </button>
      ))}
    </div>
  );
}
