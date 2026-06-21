import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import ArtworkHoverCard from "../components/ArtworkHoverCard";
import { SkeletonGrid } from "../components/ui/Skeleton";
import { api, adaptArtwork } from "../utils/api";
import { useLocale } from "../context/Locale";

// "Launch of New Product" → the dedicated New Arrivals gallery. Shows the works
// an admin has flagged as a new launch (newest first). If none are flagged yet,
// it gracefully falls back to the most recently added works so the page is never
// empty during testing.
export default function NewLaunch() {
  const navigate = useNavigate();
  const { formatPrice } = useLocale();
  const [items, setItems] = useState(null);
  const [curated, setCurated] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let rows = await api.catalog.artworks({ new_launch: true });
        let isCurated = true;
        if (!rows || rows.length === 0) {
          rows = await api.catalog.artworks({});
          isCurated = false;
        }
        if (cancelled) return;
        const mapped = (rows || []).map(adaptArtwork).reverse(); // newest first
        setItems(isCurated ? mapped : mapped.slice(0, 12));
        setCurated(isCurated);
      } catch {
        if (!cancelled) setItems([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ background: "#080808", minHeight: "100vh" }}>
      {/* Hero */}
      <div
        className="community-hero"
        style={{
          background: "linear-gradient(180deg,#0e0c0a 0%,#080808 100%)",
          borderBottom: "1px solid rgba(212,175,55,0.1)",
          padding: "140px 24px 56px",
          textAlign: "center",
        }}>
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}>
          <div className="gold-rule" style={{ justifyContent: "center" }}>
            <div
              className="grl"
              style={{ background: "linear-gradient(90deg, transparent, #D4AF37)" }}
            />
            <span className="grt">Fresh from the Studio</span>
            <div
              className="grl"
              style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }}
            />
          </div>
          <h1 className="section-heading">
            <span className="bold-white">New</span> <em>Arrivals</em>
          </h1>
          <p
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 15,
              color: "rgba(200,191,160,0.55)",
              maxWidth: 560,
              margin: "14px auto 0",
              lineHeight: 1.75,
            }}>
            A curated launch of our latest works — each piece newly added to the
            Art Coliseum collection and on display for acquisition.
          </p>
        </motion.div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "48px 24px 110px" }}>
        {items === null ? (
          <SkeletonGrid count={8} />
        ) : items.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "90px 20px",
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 20,
              color: "rgba(200,191,160,0.4)",
            }}>
            No new launches on display yet.
            <br />
            <span
              style={{
                fontSize: 14,
                fontFamily: "'Raleway',sans-serif",
                color: "rgba(200,191,160,0.28)",
              }}>
              Check back soon for our next launch.
            </span>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 26,
                flexWrap: "wrap",
                gap: 10,
              }}>
              <div
                style={{
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 11,
                  letterSpacing: "0.04em",
                  color: "rgba(200,191,160,0.45)",
                }}>
                {items.length} {items.length === 1 ? "work" : "works"} on display
              </div>
              {!curated && (
                <div
                  style={{
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 10,
                    color: "rgba(200,191,160,0.3)",
                  }}>
                  Showing latest additions
                </div>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(240px, 100%), 300px))",
                justifyContent: "center",
                gap: 22,
              }}>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.07 }}
                  style={{ cursor: "pointer" }}>
                  <ArtworkHoverCard artwork={item}>
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1/1",
                        borderRadius: 6,
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.03)",
                      }}>
                      <SafeImage
                        src={item.img}
                        alt={item.title}
                        fallbackIndex={i}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          display: "block",
                          transition:
                            "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.04)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      />
                      {/* NEW badge */}
                      <span
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                          color: "#0e0c0a",
                          borderRadius: 999,
                          padding: "3px 10px",
                          fontFamily: "'Cinzel',serif",
                          fontSize: 8,
                          fontWeight: 700,
                          letterSpacing: "0.16em",
                        }}>
                        NEW
                      </span>
                    </div>
                  </ArtworkHoverCard>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 14,
                      gap: 12,
                    }}>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "'Cormorant Garamond',serif",
                          fontSize: 19,
                          fontWeight: 600,
                          color: "#f0e8d8",
                        }}>
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Cinzel',serif",
                          fontSize: 9,
                          letterSpacing: "0.16em",
                          color: "rgba(200,191,160,0.55)",
                          marginTop: 4,
                        }}>
                        {item.artist}
                      </div>
                      {item.customizable !== false && item.price_per_unit > 0 && (
                        <div
                          style={{
                            fontFamily: "'Cormorant Garamond',serif",
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#D4AF37",
                            marginTop: 4,
                          }}>
                          from {formatPrice(item.price_per_unit)}/
                          {item.unit || "unit"}²
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/product/${item.id}`)}
                      style={{
                        background: "transparent",
                        border: "none",
                        fontFamily: "'Cinzel',serif",
                        fontSize: 10,
                        letterSpacing: "0.16em",
                        fontWeight: 600,
                        color: "#D4AF37",
                        whiteSpace: "nowrap",
                        alignSelf: "center",
                        cursor: "pointer",
                        padding: 0,
                      }}>
                      VIEW →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
