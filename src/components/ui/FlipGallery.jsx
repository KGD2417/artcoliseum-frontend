import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FLIP_SPEED = 750;
const flipTiming = { duration: FLIP_SPEED, iterations: 1 };

const flipAnimationTop    = [{ transform: "rotateX(0)" },       { transform: "rotateX(-90deg)" }, { transform: "rotateX(-90deg)" }];
const flipAnimationBottom = [{ transform: "rotateX(90deg)" },   { transform: "rotateX(90deg)" },  { transform: "rotateX(0)" }];
const flipAnimationTopRev = [{ transform: "rotateX(-90deg)" },  { transform: "rotateX(-90deg)" }, { transform: "rotateX(0)" }];
const flipAnimationBotRev = [{ transform: "rotateX(0)" },       { transform: "rotateX(90deg)" },  { transform: "rotateX(90deg)" }];

const FLIP_STYLES = `
  #art-flip-gallery::after {
    content: "";
    position: absolute;
    background-color: #0e0c0a;
    width: 100%;
    height: 4px;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    z-index: 10;
  }
  #art-flip-gallery::before {
    content: attr(data-title);
    color: rgba(212,175,55,0.75);
    font-family: 'Cormorant Garamond', serif;
    font-size: 0.95rem;
    font-style: italic;
    left: 0;
    position: absolute;
    top: calc(100% + 1rem);
    line-height: 2;
    opacity: var(--title-opacity, 0);
    transform: translateY(var(--title-y, 0));
    transition: opacity 500ms ease-in-out, transform 500ms ease-in-out;
    white-space: nowrap;
  }
  #art-flip-gallery > * {
    position: absolute;
    width: 100%;
    height: 50%;
    overflow: hidden;
    background-size: 260px 420px;
  }
  @media (min-width: 600px) {
    #art-flip-gallery > * { background-size: 320px 520px; }
  }
  .flip-top, .flip-overlay-top   { top: 0; transform-origin: bottom; background-position: top; }
  .flip-bottom, .flip-overlay-bot { bottom: 0; transform-origin: top; background-position: bottom; }
`;

export default function FlipGallery({ images }) {
  const containerRef = useRef(null);
  const uniteRef     = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    uniteRef.current = containerRef.current.querySelectorAll(".unite");
    setFirstImage();
  }, []);

  function setFirstImage() {
    uniteRef.current.forEach((el) => {
      el.style.backgroundImage = `url('${images[0].url}')`;
    });
    const g = containerRef.current;
    if (!g) return;
    g.setAttribute("data-title", images[0].title);
    g.style.setProperty("--title-y", "0");
    g.style.setProperty("--title-opacity", 1);
  }

  function updateGallery(nextIdx, isReverse = false) {
    const g = containerRef.current;
    if (!g) return;
    const topAnim = isReverse ? flipAnimationTopRev : flipAnimationTop;
    const botAnim = isReverse ? flipAnimationBotRev : flipAnimationBottom;
    g.querySelector(".flip-overlay-top").animate(topAnim, flipTiming);
    g.querySelector(".flip-overlay-bot").animate(botAnim, flipTiming);
    g.style.setProperty("--title-y", "-1rem");
    g.style.setProperty("--title-opacity", 0);
    g.setAttribute("data-title", "");
    uniteRef.current.forEach((el, idx) => {
      const delay =
        (isReverse && idx !== 1 && idx !== 2) || (!isReverse && (idx === 1 || idx === 2))
          ? FLIP_SPEED - 200 : 0;
      setTimeout(() => {
        el.style.backgroundImage = `url('${images[nextIdx].url}')`;
      }, delay);
    });
    setTimeout(() => {
      if (!g) return;
      g.setAttribute("data-title", images[nextIdx].title);
      g.style.setProperty("--title-y", "0");
      g.style.setProperty("--title-opacity", 1);
    }, FLIP_SPEED * 0.5);
  }

  function updateIndex(inc) {
    const newIdx = (currentIndex + inc + images.length) % images.length;
    setCurrentIndex(newIdx);
    updateGallery(newIdx, inc < 0);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style dangerouslySetInnerHTML={{ __html: FLIP_STYLES }} />
      <div style={{
        position: "relative",
        background: "rgba(212,175,55,0.06)",
        border: "1px solid rgba(212,175,55,0.2)",
        padding: "8px",
        borderRadius: "4px",
      }}>
        <div
          id="art-flip-gallery"
          ref={containerRef}
          style={{ position: "relative", width: "260px", height: "420px", perspective: "800px", textAlign: "center" }}>
          <div className="unite flip-top"         style={{ backgroundRepeat: "no-repeat" }} />
          <div className="unite flip-bottom"      style={{ backgroundRepeat: "no-repeat" }} />
          <div className="unite flip-overlay-top" style={{ backgroundRepeat: "no-repeat" }} />
          <div className="unite flip-overlay-bot" style={{ backgroundRepeat: "no-repeat" }} />
        </div>
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, display: "flex", gap: 8 }}>
          <button
            onClick={() => updateIndex(-1)}
            title="Previous"
            style={{
              background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: "50%", width: 34, height: 34, display: "flex",
              alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#D4AF37",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(212,175,55,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(212,175,55,0.08)"}>
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => updateIndex(1)}
            title="Next"
            style={{
              background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: "50%", width: 34, height: 34, display: "flex",
              alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#D4AF37",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(212,175,55,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(212,175,55,0.08)"}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
