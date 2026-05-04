import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * ArtworkHoverCard
 *
 * Usage:
 *   <ArtworkHoverCard artwork={artworkObject}>
 *     <div>...thumbnail content...</div>
 *   </ArtworkHoverCard>
 *
 * artwork shape:
 *   { id, title, artist, year, medium, dimensions, description }
 */
export default function ArtworkHoverCard({ artwork, children }) {
  const [visible, setVisible] = useState(false);
  const [touchReady, setTouchReady] = useState(false);
  const navigate = useNavigate();
  const isTouchRef = useRef(false);

  // Desktop: hover
  function handleMouseEnter() {
    if (isTouchRef.current) return;
    setVisible(true);
  }
  function handleMouseLeave() {
    if (isTouchRef.current) return;
    setVisible(false);
  }

  // Mobile: first tap shows card, second tap navigates
  function handleTouchStart() {
    isTouchRef.current = true;
  }
  function handleClick(e) {
    if (!isTouchRef.current) return; // handled by hover on desktop
    if (!touchReady) {
      e.preventDefault();
      e.stopPropagation();
      setVisible(true);
      setTouchReady(true);
    } else {
      navigate(`/product/${artwork.id}`);
    }
  }

  // Hide card when touch user taps outside
  function handleBlur() {
    if (isTouchRef.current) {
      setVisible(false);
      setTouchReady(false);
    }
  }

  return (
    <div
      style={{ position: "relative", overflow: "hidden", borderRadius: "inherit" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      onBlur={handleBlur}
      tabIndex={-1}>
      {children}

      <AnimatePresence>
        {visible && artwork && (
          <motion.div
            key="hover-card"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(to top, rgba(8,8,8,0.97) 60%, rgba(8,8,8,0.82) 100%)",
              padding: "22px 18px 18px",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              borderTop: "1px solid rgba(212,175,55,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}>
            {/* Title */}
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                fontWeight: 600,
                color: "#ffffff",
                lineHeight: 1.2,
                marginBottom: 6,
              }}>
              {artwork.title}
            </div>

            {/* Artist */}
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "#D4AF37",
                marginBottom: 6,
              }}>
              {artwork.artist}
            </div>

            {/* Year */}
            <div
              style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: 12,
                color: "rgba(200,191,160,0.5)",
                marginBottom: 4,
              }}>
              {artwork.year}
            </div>

            {/* Medium & Dimensions */}
            <div
              style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: 12,
                color: "rgba(200,191,160,0.5)",
                marginBottom: 10,
              }}>
              {artwork.medium}
              {artwork.dimensions ? `  ·  ${artwork.dimensions}` : ""}
            </div>

            {/* Description — 2 lines max */}
            {artwork.description && (
              <div
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: 13,
                  color: "rgba(200,191,160,0.72)",
                  lineHeight: 1.6,
                  marginBottom: 14,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}>
                {artwork.description}
              </div>
            )}

            {/* Enquire Now button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${artwork.id}`);
              }}
              style={{
                width: "100%",
                padding: "10px 0",
                background: "#D4AF37",
                border: "none",
                borderRadius: 6,
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                letterSpacing: "0.2em",
                color: "#080808",
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#c9a430")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#D4AF37")}>
              ENQUIRE NOW
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
