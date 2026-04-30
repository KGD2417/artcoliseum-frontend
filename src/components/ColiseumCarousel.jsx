import { useEffect, useMemo, useRef } from "react";

/* ── constants ─────────────────────────────────────────────────────── */
const RADIUS = 720; // arc radius in px
const ANGLE_STEP = 18; // degrees between card slots
const VISIBLE = 4.3; // fade-out distance in card slots
const DECAY = 0.9; // velocity decay per frame
const AUTO_SPEED = 0.000042; // auto-scroll (index / ms)
const DRAG_SENS = 0.007; // index units per dragged pixel
const SNAP_K = 0.14; // spring constant for snap-to-slot
const SNAP_THRESH = 0.003; // velocity below this → snap mode
const PARALLAX_STR = 0.045; // mouse parallax strength

/* ── helpers ───────────────────────────────────────────────────────── */
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const lerp = (a, b, t) => a + (b - a) * t;

// shortest signed delta accounting for wrapping
const wrappedDelta = (i, active, n) => {
  if (!n) return 0;
  const half = n / 2;
  return ((((i - active + half) % n) + n) % n) - half;
};

// nearest integer, respecting wrap
const nearestSlot = (float, n) => {
  const mod = ((float % n) + n) % n;
  return Math.round(mod);
};

/* ── component ─────────────────────────────────────────────────────── */
export default function ColiseumCarousel({ items = [] }) {
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const spotRef = useRef(null);
  const activeRef = useRef(2); // float index
  const velRef = useRef(0);
  const frameRef = useRef(null);
  const tLastRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const drag = useRef({ on: false, moved: false, lastX: 0, lastT: 0 });

  const gallery = useMemo(
    () =>
      items
        .filter((it) => it?.image)
        .map((it, i) => ({
          image: it.image,
          text: it.text || `Artwork ${i + 1}`,
          medium: it.medium,
          price: it.price,
        })),
    [items],
  );

  useEffect(() => {
    const stage = stageRef.current;
    const n = gallery.length;
    if (!stage || !n) return;

    /* ── render one frame ─────────────────────────────── */
    const render = () => {
      const active = activeRef.current;
      const mx = mouseRef.current.x; // -1..+1
      const my = mouseRef.current.y; // -1..+1

      // nudge perspective-origin for parallax
      stage.style.perspectiveOrigin = `${50 + mx * 4}% ${42 + my * 3}%`;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        const delta = wrappedDelta(i, active, n);
        const absDelta = Math.abs(delta);

        // cull cards that are fully off-screen
        const visT = clamp((VISIBLE - absDelta) / 0.55, 0, 1);
        if (visT <= 0) {
          card.style.opacity = "0";
          card.style.pointerEvents = "none";
          return;
        }

        /* position along the arc */
        const angleDeg = delta * ANGLE_STEP;
        const angleRad = angleDeg * (Math.PI / 180);
        const x = Math.sin(angleRad) * RADIUS;
        const z = (Math.cos(angleRad) - 1) * RADIUS; // 0 at center, negative at sides

        /* card faces the viewer: rotateY = -angleDeg */
        const rotY = -angleDeg;

        /* depth-driven properties */
        const t = Math.min(absDelta / VISIBLE, 1);
        const scale = 1 - t * 0.3;
        const opacity = visT * (1 - t * 0.6);
        const brightness = 1 - t * 0.3;
        const blur = t > 0.6 ? (t - 0.6) * 2.5 : 0;
        const zIndex = Math.round((1 - t) * 900 + 10);

        /* drop-shadow stronger at center */
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

        // update card-face shadow for depth feel
        const face = card.querySelector(".coliseum-carousel-card-face");
        if (face) {
          face.style.boxShadow =
            `0 ${shadowSize}px ${shadowSize * 2}px rgba(0,0,0,${shadowAlpha.toFixed(2)}), ` +
            `0 0 0 1px rgba(255,255,255,0.05)`;
        }
      });

      /* spotlight follows center card */
      if (spotRef.current) {
        const nearestI = nearestSlot(active, n);
        const nearestDelta = wrappedDelta(nearestI, active, n);
        const spotT = clamp(1 - Math.abs(nearestDelta) * 2, 0, 1);
        spotRef.current.style.opacity = (spotT * 0.9).toFixed(3);
      }
    };

    /* ── animation loop ───────────────────────────────── */
    const tick = (now) => {
      const dt = Math.min(now - (tLastRef.current || now), 34);
      tLastRef.current = now;

      if (!drag.current.on) {
        const absVel = Math.abs(velRef.current);

        if (absVel > SNAP_THRESH) {
          // inertia glide
          activeRef.current += velRef.current * dt;
          velRef.current *= Math.pow(DECAY, dt / 16.67);
        } else {
          // spring snap to nearest slot
          velRef.current = 0;
          const target = nearestSlot(activeRef.current, n);
          const diff = wrappedDelta(target, activeRef.current, n);
          activeRef.current += diff * SNAP_K;
        }

        // slow auto-drift only when essentially idle
        if (
          absVel < 0.0001 &&
          Math.abs(activeRef.current - Math.round(activeRef.current)) < 0.01
        ) {
          activeRef.current += AUTO_SPEED * dt;
        }

        activeRef.current = ((activeRef.current % n) + n) % n;
      }

      render();
      frameRef.current = requestAnimationFrame(tick);
    };

    /* ── pointer events ───────────────────────────────── */
    const onDown = (e) => {
      drag.current = {
        on: true,
        moved: false,
        lastX: e.clientX,
        lastT: performance.now(),
      };
      velRef.current = 0;
      stage.setPointerCapture?.(e.pointerId);
      stage.style.cursor = "grabbing";
    };

    const onMove = (e) => {
      if (!drag.current.on) return;
      const dx = e.clientX - drag.current.lastX;
      const dt = Math.max(performance.now() - drag.current.lastT, 8);
      const di = -dx * DRAG_SENS;
      if (Math.abs(dx) > 2) {
        drag.current.moved = true;
        e.preventDefault();
      }
      activeRef.current = (((activeRef.current + di) % n) + n) % n;
      velRef.current = di / dt;
      drag.current.lastX = e.clientX;
      drag.current.lastT = performance.now();
      render();
    };

    const onUp = (e) => {
      if (!drag.current.on) return;
      drag.current.on = false;
      stage.releasePointerCapture?.(e.pointerId);
      stage.style.cursor = "grab";
    };

    /* ── mouse parallax ───────────────────────────────── */
    const onMouse = (e) => {
      const r = stage.getBoundingClientRect();
      mouseRef.current = {
        x: ((e.clientX - r.left) / r.width - 0.5) * 2,
        y: ((e.clientY - r.top) / r.height - 0.5) * 2,
      };
    };

    const onLeave = () => {
      // ease back to center
      mouseRef.current = { x: 0, y: 0 };
    };

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

  /* ── click to focus ─────────────────────────────────── */
  const focusCard = (i) => {
    if (drag.current.moved) {
      drag.current.moved = false;
      return;
    }
    // find shortest path and jump
    const delta = wrappedDelta(i, activeRef.current, gallery.length);
    activeRef.current += delta;
    velRef.current = 0;
  };

  const DETAILS = {
    "Golden Horizon": ["Acrylic on Canvas", "$2,400"],
    "Eternal Grace": ["Bronze Sculpture", "$3,800"],
    "Cosmic Flow": ["Mixed Media", "$1,950"],
    "The Golden Tree": ["Oil on Canvas", "$2,100"],
    "Whispers of Silence": ["Oil on Canvas", "$1,700"],
    "Crimson Reverie": ["Mixed Media", "$2,800"],
    "Velvet Mirage": ["Oil on Panel", "$3,200"],
    "Renaissance Study": ["Oil on Panel", "$4,600"],
    "Crimson Tides": ["Acrylic on Linen", "$2,250"],
    "Azure Dreams": ["Mixed Media", "$1,850"],
    Solstice: ["Digital Print", "$1,400"],
    "Ocean Depths": ["Digital Print", "$1,600"],
  };

  return (
    <div
      ref={stageRef}
      className="coliseum-carousel"
      aria-label="Featured artworks">
      {/* ambient / floor / rail / fades */}
      <div className="coliseum-carousel-ambient" />
      <div className="coliseum-carousel-floor" />
      <div ref={spotRef} className="coliseum-carousel-spotlight" />
      <div className="coliseum-carousel-rail" />
      <div className="coliseum-carousel-fade coliseum-carousel-fade-left" />
      <div className="coliseum-carousel-fade coliseum-carousel-fade-right" />

      {gallery.map((item, i) => {
        const [fbMedium, fbPrice] = DETAILS[item.text] || [
          "Original Artwork",
          "$2,000",
        ];

        return (
          <button
            key={`${item.text}-${i}`}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            type="button"
            className="coliseum-carousel-card"
            aria-label={item.text}
            onClick={() => focusCard(i)}>
            <span className="coliseum-carousel-card-face">
              <img src={item.image} alt={item.text} draggable="false" />
              <span className="coliseum-carousel-card-shade" />
              <span className="coliseum-carousel-card-copy"></span>
            </span>

            <span className="coliseum-carousel-reflection" aria-hidden="true">
              <img src={item.image} alt="" draggable="false" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
