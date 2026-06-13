import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import { Skeleton, SkeletonGrid } from "../components/ui/Skeleton";
import { api } from "../utils/api";
import { useAuth } from "../context/Auth";
import { useLocale } from "../context/Locale";

const gold = "#D4AF37";

export default function Exhibition() {
  const [ex, setEx] = useState(undefined); // undefined=loading, null=none
  const navigate = useNavigate();
  const { role } = useAuth();
  const { formatPrice } = useLocale();

  useEffect(() => {
    let cancelled = false;
    api.exhibitions.current()
      .then((d) => { if (!cancelled) setEx(d); })
      .catch(() => { if (!cancelled) setEx(null); });
    return () => { cancelled = true; };
  }, []);

  if (ex === undefined) {
    return (
      <div style={{ background: "#080808", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "120px 56px 100px" }}>
          <Skeleton height={360} radius={20} />
          <div style={{ marginTop: 56 }}>
            <SkeletonGrid count={6} minColWidth={240} maxColWidth={320} imageHeight={300} gap={22} />
          </div>
        </div>
      </div>
    );
  }

  const phase = ex?.status;
  const isOpenRegistration = phase === "registration";
  const isLive = phase === "live";
  const isUpcoming = phase === "upcoming";

  // No active exhibition → elegant teaser.
  if (!ex || phase === "ended") {
    return (
      <Shell>
        <Hero
          tagline="ONLINE EXHIBITION"
          title="The Gallery Between Shows"
          sub="No exhibition is running at this moment."
          image={ex?.hero_image_url}
        />
        <div style={{ textAlign: "center", padding: "60px 24px 0" }}>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontStyle: "italic", color: "rgba(200,191,160,0.6)", maxWidth: 600, margin: "0 auto 28px", lineHeight: 1.7 }}>
            Our next curated online exhibition is being prepared. In the meantime, the full collection is always open.
          </p>
          <Link to="/categories" style={ctaBtn}>EXPLORE THE COLLECTION →</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Hero
        tagline={ex.theme ? ex.theme.toUpperCase() : "ONLINE EXHIBITION"}
        title={ex.title}
        sub={ex.description}
        image={ex.hero_image_url || ex.artworks?.[0]?.images?.[0]}
        badge={isLive ? "NOW LIVE" : isOpenRegistration ? "REGISTRATION OPEN" : isUpcoming ? "OPENING SOON" : null}
      />

      {/* Registration / upcoming states */}
      {(isOpenRegistration || isUpcoming) && (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 0", textAlign: "center" }}>
          <div style={{ display: "inline-flex", gap: 24, flexWrap: "wrap", justifyContent: "center", marginBottom: 28 }}>
            {ex.registration_starts_at && (
              <DateChip label="REGISTRATION OPENS" value={new Date(ex.registration_starts_at)} />
            )}
            {ex.registration_ends_at && (
              <DateChip label="REGISTRATION CLOSES" value={new Date(ex.registration_ends_at)} />
            )}
            <DateChip label="WORKS SUBMITTED" raw={`${ex.submission_count}`} />
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 21, fontStyle: "italic", color: "rgba(200,191,160,0.7)", maxWidth: 620, margin: "0 auto 28px", lineHeight: 1.7 }}>
            {isUpcoming
              ? "Registration opens soon. Approved artists will be able to submit their works for this show."
              : "Artists are submitting their finest works. When registration closes, the exhibition goes live as a curated online gallery."}
          </p>
          {isOpenRegistration && (
            role === "artist"
              ? <Link to="/become-artist" style={ctaBtn}>SUBMIT YOUR WORK →</Link>
              : <Link to="/become-artist" style={ctaBtn}>BECOME AN ARTIST TO PARTICIPATE →</Link>
          )}
        </div>
      )}

      {/* Live gallery */}
      {isLive && (
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "56px 56px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
            <div style={{ width: 32, height: 1, background: "rgba(212,175,55,0.4)" }} />
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.24em", color: gold }}>THE EXHIBITION</span>
            <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.15)" }} />
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontStyle: "italic", color: "rgba(200,191,160,0.4)" }}>
              {(ex.artworks || []).length} works on show
            </span>
          </div>

          {(ex.artworks || []).length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center", fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic", color: "rgba(200,191,160,0.45)" }}>
              The works are being hung — check back in a moment.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px,100%), 320px))", justifyContent: "center", gap: 22 }}>
              {ex.artworks.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                  onClick={() => navigate(`/product/${a.id}`)}
                  style={{ cursor: "pointer" }}>
                  <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(212,175,55,0.14)", background: "rgba(255,255,255,0.03)" }}>
                    <SafeImage src={a.images?.[0]} alt={a.title} fallbackIndex={i}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 600, color: "#f0e8d8" }}>{a.title}</div>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)", marginTop: 4 }}>{(a.artist_name || "").toUpperCase()}</div>
                      {a.customizable === false && a.price > 0 && (
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: gold, marginTop: 4 }}>{formatPrice(a.price)}</div>
                      )}
                      {a.customizable !== false && a.price_per_unit > 0 && (
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: gold, marginTop: 4 }}>from {formatPrice(a.price_per_unit)}/{a.unit || "unit"}²</div>
                      )}
                    </div>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", fontWeight: 600, color: gold, alignSelf: "center", whiteSpace: "nowrap" }}>VIEW →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }) {
  return <div style={{ background: "#080808", minHeight: "100vh", paddingBottom: 100 }}>{children}</div>;
}

function Hero({ tagline, title, sub, image, badge }) {
  return (
    <div className="art-hero" style={{ position: "relative", height: 420, overflow: "hidden" }}>
      {image
        ? <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#16120b,#241c10)" }} />}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.6) 50%, rgba(8,8,8,1) 100%)" }} />
      <div className="art-hero-padding" style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 56px 48px", maxWidth: 1320, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.24em", color: gold }}>{tagline}</div>
            {badge && (
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.16em", color: "#0e0c0a", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", padding: "4px 12px", borderRadius: 999, fontWeight: 700 }}>{badge}</span>
            )}
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(48px,6vw,80px)", fontWeight: 700, color: "#fff", lineHeight: 0.98, letterSpacing: "-0.01em", margin: 0 }}>{title}</h1>
          {sub && <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontStyle: "italic", color: "rgba(200,191,160,0.78)", lineHeight: 1.6, maxWidth: 620, margin: "16px 0 0" }}>{sub}</p>}
        </motion.div>
      </div>
    </div>
  );
}

function DateChip({ label, value, raw }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.16em", color: "rgba(200,191,160,0.5)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>
        {raw != null ? raw : value.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
      </div>
    </div>
  );
}

const ctaBtn = {
  display: "inline-block", padding: "14px 36px",
  background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#0e0c0a",
  borderRadius: 999, textDecoration: "none",
  fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", fontWeight: 600,
};
