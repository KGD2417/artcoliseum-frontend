import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function calculateGap(width) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;
  if (width <= minWidth) return minGap;
  if (width >= maxWidth) return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

const CT_STYLES = `
  .ct-container { width: 100%; max-width: 56rem; padding: 2rem; }
  .ct-container-solo { width: 100%; padding: 0; }
  .ct-grid { display: grid; gap: 3rem; }
  .ct-image-container {
    position: relative; width: 100%; height: 22rem;
    perspective: 1000px;
  }
  .ct-image {
    position: absolute; width: 100%; height: 100%;
    object-fit: cover; border-radius: 1.25rem;
    box-shadow: 0 10px 40px rgba(0,0,0,0.45);
  }
  .ct-content {
    display: flex; flex-direction: column; justify-content: space-between;
  }
  .ct-name {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 700; margin-bottom: 0.2rem;
  }
  .ct-designation {
    font-family: 'Raleway', sans-serif;
    font-size: 0.82rem; letter-spacing: 0.08em;
    margin-bottom: 1.5rem;
  }
  .ct-quote {
    font-family: 'Cormorant Garamond', serif;
    line-height: 1.8; color: rgba(200,191,160,0.85);
  }
  .ct-arrows { display: flex; gap: 1rem; padding-top: 2.5rem; }
  .ct-btn {
    width: 2.6rem; height: 2.6rem; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background-color 0.3s; border: none;
  }
  @media (min-width: 768px) {
    .ct-grid { grid-template-columns: 1fr 1fr; }
    .ct-arrows { padding-top: 0; }
  }
`;

export function CircularTestimonials({
  testimonials,
  autoplay = true,
  colors = {},
  fontSizes = {},
  imagesOnly = false,
  cardHeight = "22rem",
}) {
  const colorName        = colors.name            ?? "#f0e8d0";
  const colorDesignation = colors.designation     ?? "rgba(200,191,160,0.55)";
  const colorTestimony   = colors.testimony       ?? "rgba(200,191,160,0.85)";
  const colorArrowBg     = colors.arrowBackground ?? "#1a1612";
  const colorArrowFg     = colors.arrowForeground ?? "#D4AF37";
  const colorArrowHover  = colors.arrowHoverBackground ?? "rgba(212,175,55,0.25)";
  const fontSizeName     = fontSizes.name         ?? "1.45rem";
  const fontSizeDes      = fontSizes.designation  ?? "0.82rem";
  const fontSizeQuote    = fontSizes.quote        ?? "1.05rem";

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPrev, setHoverPrev]     = useState(false);
  const [hoverNext, setHoverNext]     = useState(false);
  const [containerWidth, setContainerWidth] = useState(500);

  const imageContainerRef = useRef(null);
  const autoplayRef       = useRef(null);
  const n = testimonials.length;
  const active = testimonials[activeIndex];

  useEffect(() => {
    function onResize() {
      if (imageContainerRef.current) setContainerWidth(imageContainerRef.current.offsetWidth);
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (autoplay) {
      autoplayRef.current = setInterval(() => setActiveIndex(p => (p + 1) % n), 5000);
    }
    return () => clearInterval(autoplayRef.current);
  }, [autoplay, n]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const handleNext = useCallback(() => {
    clearInterval(autoplayRef.current);
    setActiveIndex(p => (p + 1) % n);
  }, [n]);

  const handlePrev = useCallback(() => {
    clearInterval(autoplayRef.current);
    setActiveIndex(p => (p - 1 + n) % n);
  }, [n]);

  function getImageStyle(index) {
    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.8;
    const isActive = index === activeIndex;
    const isLeft   = (activeIndex - 1 + n) % n === index;
    const isRight  = (activeIndex + 1) % n === index;
    if (isActive) return {
      zIndex: 3, opacity: 1, pointerEvents: "auto",
      transform: "translateX(0) translateY(0) scale(1) rotateY(0deg)",
      transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
    };
    if (isLeft) return {
      zIndex: 2, opacity: 1, pointerEvents: "auto",
      transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
      transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
    };
    if (isRight) return {
      zIndex: 2, opacity: 1, pointerEvents: "auto",
      transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
      transition: "all 0.8s cubic-bezier(.4,2,.3,1)",
    };
    return { zIndex: 1, opacity: 0, pointerEvents: "none", transition: "all 0.8s cubic-bezier(.4,2,.3,1)" };
  }

  const quoteVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -20 },
  };

  if (imagesOnly) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CT_STYLES }} />
        <div className="ct-container-solo">
          <div
            className="ct-image-container"
            ref={imageContainerRef}
            style={{ height: cardHeight }}
          >
            {testimonials.map((t, i) => (
              <img
                key={t.src + i}
                src={t.src}
                alt={t.name}
                className="ct-image"
                style={getImageStyle(i)}
              />
            ))}
          </div>
          <div className="ct-arrows" style={{ justifyContent: "center", paddingTop: "1.25rem" }}>
            <button
              className="ct-btn"
              onClick={handlePrev}
              style={{ backgroundColor: hoverPrev ? colorArrowHover : colorArrowBg, border: "1px solid rgba(212,175,55,0.25)" }}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
              aria-label="Previous">
              <FaArrowLeft size={16} color={colorArrowFg} />
            </button>
            <button
              className="ct-btn"
              onClick={handleNext}
              style={{ backgroundColor: hoverNext ? colorArrowHover : colorArrowBg, border: "1px solid rgba(212,175,55,0.25)" }}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
              aria-label="Next">
              <FaArrowRight size={16} color={colorArrowFg} />
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CT_STYLES }} />
      <div className="ct-container">
        <div className="ct-grid">
          <div className="ct-image-container" ref={imageContainerRef}>
            {testimonials.map((t, i) => (
              <img
                key={t.src + i}
                src={t.src}
                alt={t.name}
                className="ct-image"
                style={getImageStyle(i)}
              />
            ))}
          </div>

          <div className="ct-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                variants={quoteVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}>
                <div className="gold-rule" style={{ marginBottom: 14 }}>
                  <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)", maxWidth: 40 }} />
                  <span className="grt" style={{ fontSize: 9 }}>{active.tag || "COLLECTOR"}</span>
                  <div className="grl" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)", maxWidth: 40 }} />
                </div>
                <h3 className="ct-name" style={{ color: colorName, fontSize: fontSizeName }}>
                  {active.name}
                </h3>
                <p className="ct-designation" style={{ color: colorDesignation, fontSize: fontSizeDes }}>
                  {active.designation}
                </p>
                <motion.p className="ct-quote" style={{ color: colorTestimony, fontSize: fontSizeQuote }}>
                  {active.quote.split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ filter: "blur(8px)", opacity: 0, y: 4 }}
                      animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut", delay: 0.02 * i }}
                      style={{ display: "inline-block" }}>
                      {word}&nbsp;
                    </motion.span>
                  ))}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            <div className="ct-arrows">
              <button
                className="ct-btn"
                onClick={handlePrev}
                style={{ backgroundColor: hoverPrev ? colorArrowHover : colorArrowBg, border: "1px solid rgba(212,175,55,0.25)" }}
                onMouseEnter={() => setHoverPrev(true)}
                onMouseLeave={() => setHoverPrev(false)}
                aria-label="Previous">
                <FaArrowLeft size={16} color={colorArrowFg} />
              </button>
              <button
                className="ct-btn"
                onClick={handleNext}
                style={{ backgroundColor: hoverNext ? colorArrowHover : colorArrowBg, border: "1px solid rgba(212,175,55,0.25)" }}
                onMouseEnter={() => setHoverNext(true)}
                onMouseLeave={() => setHoverNext(false)}
                aria-label="Next">
                <FaArrowRight size={16} color={colorArrowFg} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CircularTestimonials;
