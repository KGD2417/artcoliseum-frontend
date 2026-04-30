import { useEffect, useMemo, useRef } from "react";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const wrapIndex = (value, length) => {
  if (!length) return 0;
  return ((value % length) + length) % length;
};

const getWrappedDelta = (index, activeIndex, length) => {
  if (!length) return 0;
  const half = length / 2;
  return ((((index - activeIndex + half) % length) + length) % length) - half;
};

export default function ColiseumCarousel({ items = [] }) {
  const stageRef = useRef(null);
  const shellRefs = useRef([]);
  const activeIndexRef = useRef(2);
  const velocityRef = useRef(0);
  const frameRef = useRef(null);
  const lastFrameRef = useRef(0);
  const dragRef = useRef({
    active: false,
    moved: false,
    lastX: 0,
    lastTime: 0,
  });

  const galleryItems = useMemo(
    () =>
      items
        .filter((item) => item?.image)
        .map((item, index) => ({
          image: item.image,
          text: item.text || `Artwork ${index + 1}`,
          medium: item.medium,
          price: item.price,
          fallbackIndex: index,
        })),
    [items],
  );

  useEffect(() => {
    const stage = stageRef.current;
    const itemCount = galleryItems.length;
    if (!stage || !itemCount) return undefined;

    const spacing = 12;
    const visibleRadius = 3.65;
    const depthRadius = 3;
    const decay = 0.94;
    const autoSpeed = 0.000055;
    const dragSensitivity = 0.0065;

    const render = () => {
      const stageWidth = stage.clientWidth || 1000;
      const xSpread = clamp(stageWidth * 0.18, 158, 286);
      const activeIndex = activeIndexRef.current;

      shellRefs.current.forEach((shell, index) => {
        if (!shell) return;

        const delta = getWrappedDelta(index, activeIndex, itemCount);
        const absDelta = Math.abs(delta);
        const depthT = clamp(absDelta / depthRadius, 0, 1);
        const easedDepth = Math.pow(depthT, 0.92);
        const visibilityT = clamp((visibleRadius - absDelta) / 0.55, 0, 1);

        const angle = delta * spacing;
        const xOffset = delta * xSpread;
        const zDepth = -220 + 480 * easedDepth;
        const scale = 0.9 + 0.22 * easedDepth;
        const brightness = 0.92 + 0.12 * depthT;
        const blur = Math.max(0, 0.35 - depthT * 0.35);

        shell.style.transform = `perspective(1400px) rotateY(${angle}deg) translateX(${xOffset}px) translateZ(${zDepth}px) scale(${scale})`;
        shell.style.opacity = `${visibilityT}`;
        shell.style.zIndex = `${Math.round(1000 + zDepth)}`;
        shell.style.pointerEvents = absDelta <= visibleRadius ? "auto" : "none";
        shell.style.filter = `brightness(${brightness}) blur(${blur}px)`;
      });
    };

    const tick = (time) => {
      const previous = lastFrameRef.current || time;
      const deltaTime = Math.min(time - previous, 34);
      lastFrameRef.current = time;

      if (!dragRef.current.active) {
        if (Math.abs(velocityRef.current) > 0.00002) {
          activeIndexRef.current += velocityRef.current * deltaTime;
          velocityRef.current *= Math.pow(decay, deltaTime / 16.67);
        } else {
          activeIndexRef.current += autoSpeed * deltaTime;
          velocityRef.current = 0;
        }

        activeIndexRef.current = wrapIndex(activeIndexRef.current, itemCount);
      }

      render();
      frameRef.current = requestAnimationFrame(tick);
    };

    const onPointerDown = (event) => {
      dragRef.current = {
        active: true,
        moved: false,
        lastX: event.clientX,
        lastTime: performance.now(),
      };
      velocityRef.current = 0;
      stage.setPointerCapture?.(event.pointerId);
      stage.style.cursor = "grabbing";
    };

    const onPointerMove = (event) => {
      if (!dragRef.current.active) return;

      const now = performance.now();
      const xDelta = event.clientX - dragRef.current.lastX;
      const timeDelta = Math.max(now - dragRef.current.lastTime, 8);
      const indexDelta = -xDelta * dragSensitivity;

      if (Math.abs(xDelta) > 1) {
        dragRef.current.moved = true;
        event.preventDefault();
      }

      activeIndexRef.current = wrapIndex(
        activeIndexRef.current + indexDelta,
        itemCount,
      );
      velocityRef.current = indexDelta / timeDelta;
      dragRef.current.lastX = event.clientX;
      dragRef.current.lastTime = now;
      render();
    };

    const endPointer = (event) => {
      if (!dragRef.current.active) return;
      dragRef.current.active = false;
      stage.releasePointerCapture?.(event.pointerId);
      stage.style.cursor = "grab";
    };

    stage.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", endPointer);
    window.addEventListener("pointercancel", endPointer);

    render();
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      stage.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endPointer);
      window.removeEventListener("pointercancel", endPointer);
    };
  }, [galleryItems]);

  const focusItem = (index) => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    activeIndexRef.current = wrapIndex(index, galleryItems.length);
    velocityRef.current = 0;
  };

  const detailsByTitle = {
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
    <div ref={stageRef} className="coliseum-carousel" aria-label="Featured artworks">
      <div className="coliseum-carousel-ambient" />
      <div className="coliseum-carousel-floor" />
      <div className="coliseum-carousel-rail" />
      <div className="coliseum-carousel-fade coliseum-carousel-fade-left" />
      <div className="coliseum-carousel-fade coliseum-carousel-fade-right" />

      {galleryItems.map((item, index) => {
        const [fallbackMedium, fallbackPrice] = detailsByTitle[item.text] || [
          "Original Artwork",
          "$2,000",
        ];

        return (
          <button
            key={`${item.text}-${index}`}
            ref={(node) => {
              shellRefs.current[index] = node;
            }}
            type="button"
            className="coliseum-carousel-card"
            aria-label={item.text}
            onClick={() => focusItem(index)}>
            <span className="coliseum-carousel-card-face">
              <img src={item.image} alt={item.text} draggable="false" />
              <span className="coliseum-carousel-card-shade" />
              <span className="coliseum-carousel-card-copy">
                <span className="coliseum-carousel-card-title">
                  {item.text}
                </span>
                <span className="coliseum-carousel-card-medium">
                  {item.medium || fallbackMedium}
                </span>
                <span className="coliseum-carousel-card-price">
                  {item.price || fallbackPrice}
                </span>
              </span>
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
