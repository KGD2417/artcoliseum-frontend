import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "../components/SafeImage";
import PageHeading from "../components/PageHeading";
import { Skeleton, SkeletonGrid } from "../components/ui/Skeleton";
import { api } from "../utils/api";
import { useAuth } from "../context/Auth";
import { useLocale } from "../context/Locale";

// The 3D corridor pulls in three.js — load it only when a live show needs it.
const Gallery3D = lazy(() => import("../components/Gallery3D"));

const gold = "#D4AF37";
const ease = [0.22, 1, 0.36, 1];

// The immersive 3D corridor needs WebGL; degrade gracefully where it's absent.
function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch { return false; }
}

// ── Catalogue numbering (gallery placards use Roman numerals) ─────────────────
const ROMAN = [["M",1000],["CM",900],["D",500],["CD",400],["C",100],["XC",90],["L",50],["XL",40],["X",10],["IX",9],["V",5],["IV",4],["I",1]];
function toRoman(n) {
  let out = "", r = n;
  for (const [sym, val] of ROMAN) while (r >= val) { out += sym; r -= val; }
  return out || "I";
}

// The dimensions / medium / year line that sits on a real wall label.
function workMeta(a) {
  const present = [a.width, a.height, a.depth].filter((x) => x != null);
  const dims = a.base_dimensions
    || (present.length >= 2 ? `${present.join(" × ")} ${a.unit || "cm"}` : null);
  return [a.medium, dims, a.year].filter(Boolean);
}

export default function Exhibition() {
  const [ex, setEx] = useState(undefined); // undefined=loading, null=none
  const { role } = useAuth();

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

  // Live → the immersive 3D gallery corridor (its own full-screen experience).
  if (isLive) {
    const works = ex.artworks || [];
    if (works.length && webglOK()) {
      return (
        <Suspense fallback={<EnteringGallery title={ex.title} />}>
          <Gallery3D ex={ex} />
        </Suspense>
      );
    }
    // No works yet, or no WebGL → graceful fallback.
    return (
      <Shell>
        <Hero
          tagline={ex.theme ? ex.theme.toUpperCase() : "ONLINE EXHIBITION"}
          title={ex.title} sub={ex.description}
          image={ex.hero_image_url || works?.[0]?.images?.[0]} badge="NOW LIVE"
        />
        {works.length ? <LiveGallery ex={ex} /> : (
          <div style={{ padding: "80px 24px", textAlign: "center", fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontStyle: "italic", color: "rgba(200,191,160,0.5)" }}>
            The works are being hung — check back in a moment.
          </div>
        )}
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
        badge={isOpenRegistration ? "REGISTRATION OPEN" : isUpcoming ? "OPENING SOON" : null}
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

    </Shell>
  );
}

// ── The live exhibition: a salon-hung wall you can step into ──────────────────
function LiveGallery({ ex }) {
  const works = ex.artworks || [];
  const [openAt, setOpenAt] = useState(null); // index of the work in the Viewing Room

  const close = useCallback(() => setOpenAt(null), []);
  const navTo = useCallback((dir) => {
    setOpenAt((i) => (i == null ? i : (i + dir + works.length) % works.length));
  }, [works.length]);

  return (
    <div className="exh-live" style={{ maxWidth: 1320, margin: "0 auto", padding: "70px 56px 0" }}>
      {/* Curatorial entrance */}
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ width: 44, height: 1, background: "rgba(212,175,55,0.4)" }} />
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.3em", color: gold }}>NOW SHOWING</span>
          <div style={{ width: 44, height: 1, background: "rgba(212,175,55,0.4)" }} />
        </div>
        <div style={{ marginTop: 20, fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "rgba(200,191,160,0.55)", letterSpacing: "0.02em" }}>
          {works.length} {works.length === 1 ? "work" : "works"} on view
        </div>
        {works.length > 0 && (
          <p style={{ marginTop: 10, fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontStyle: "italic", color: "rgba(200,191,160,0.42)" }}>
            Take your time. Select any piece to step closer.
          </p>
        )}
      </div>

      {works.length === 0 ? (
        <div style={{ padding: "60px 24px", textAlign: "center", fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic", color: "rgba(200,191,160,0.45)" }}>
          The works are being hung — check back in a moment.
        </div>
      ) : (
        <div className="exh-wall">
          {works.map((a, i) => (
            <GalleryWork key={a.id} a={a} i={i} onOpen={() => setOpenAt(i)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {openAt != null && (
          <ViewingRoom works={works} index={openAt} onClose={close} onNav={navTo} />
        )}
      </AnimatePresence>
    </div>
  );
}

// A single work on the wall: framed, spotlit, with a wall label beneath it.
function GalleryWork({ a, i, onOpen }) {
  const meta = workMeta(a);
  return (
    <motion.figure
      className="exh-work"
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.75, ease }}
      onClick={onOpen}
      style={{ margin: 0, cursor: "pointer" }}>
      <div className="exh-frame">
        <div className="exh-spot" />
        <SafeImage src={a.images?.[0]} alt={a.title} fallbackIndex={i}
          className="exh-canvas" style={{ width: "100%", height: "auto", display: "block" }} />
      </div>
      <figcaption className="exh-label">
        <div className="exh-no">№ {toRoman(i + 1)}</div>
        <div className="exh-title">{a.title}</div>
        {a.artist_name && <div className="exh-artist">{a.artist_name.toUpperCase()}</div>}
        {meta.length > 0 && <div className="exh-meta">{meta.join("  ·  ")}</div>}
        <span className="exh-view">VIEW IN ROOM →</span>
      </figcaption>
    </motion.figure>
  );
}

// Full-screen viewing room — the work on a spotlit wall with its placard,
// navigable wall-to-wall with the arrows or ← → keys (Esc closes).
function ViewingRoom({ works, index, onClose, onNav }) {
  const a = works[index];
  const { formatPrice } = useLocale();
  const meta = workMeta(a);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNav(1);
      else if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prevOverflow; };
  }, [onClose, onNav]);

  const multi = works.length > 1;
  return (
    <motion.div className="exh-room" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }} onClick={onClose}>
      <button className="exh-room-close" aria-label="Close viewing room"
        onClick={(e) => { e.stopPropagation(); onClose(); }}>✕</button>

      {multi && (
        <button className="exh-arrow exh-arrow-l" aria-label="Previous work"
          onClick={(e) => { e.stopPropagation(); onNav(-1); }}>‹</button>
      )}
      {multi && (
        <button className="exh-arrow exh-arrow-r" aria-label="Next work"
          onClick={(e) => { e.stopPropagation(); onNav(1); }}>›</button>
      )}

      <div className="exh-room-grid" onClick={(e) => e.stopPropagation()}>
        <div className="exh-room-stage">
          <AnimatePresence mode="wait">
            <motion.div key={a.id} className="exh-room-canvas-wrap"
              initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }} transition={{ duration: 0.45, ease }}>
              <SafeImage src={a.images?.[0]} alt={a.title} fallbackIndex={index}
                className="exh-room-canvas" style={{ display: "block" }} />
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div className="exh-room-label" key={`l-${a.id}`}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.05 }}>
          <div className="exh-no" style={{ marginBottom: 18 }}>№ {toRoman(index + 1)}</div>
          <h2 className="exh-room-title">{a.title}</h2>
          {a.artist_name && <div className="exh-room-artist">{a.artist_name.toUpperCase()}</div>}
          {meta.length > 0 && (
            <div className="exh-room-meta">{meta.map((m, k) => <div key={k}>{m}</div>)}</div>
          )}
          {(a.narrative || a.description) && (
            <p className="exh-room-note">{a.narrative || a.description}</p>
          )}
          <div className="exh-room-foot">
            {a.price > 0 && <div className="exh-room-price">{formatPrice(a.price)}</div>}
            <Link to={`/product/${a.id}`} style={ctaBtn} onClick={(e) => e.stopPropagation()}>
              VIEW DETAILS & ENQUIRE →
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="exh-room-counter">
        {String(index + 1).padStart(2, "0")} <span>/</span> {String(works.length).padStart(2, "0")}
      </div>
    </motion.div>
  );
}

function Shell({ children }) {
  return <div style={{ background: "#080808", minHeight: "100vh", paddingBottom: 100 }}>{children}</div>;
}

// Shown while the (lazy) 3D corridor bundle downloads.
function EnteringGallery({ title }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#050505", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 700, fontSize: "clamp(34px,5vw,64px)", color: "#f4ecdb", letterSpacing: "0.05em" }}>{title}</div>
      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.8 }}
        style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.34em", color: gold }}>
        ENTERING THE GALLERY
      </motion.div>
    </div>
  );
}

function Hero({ tagline, title, sub, badge }) {
  return (
    <PageHeading eyebrow={tagline} title={title} subtitle={sub}>
      {badge && (
        <div style={{ marginTop: 18 }}>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "#0e0c0a", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", padding: "5px 14px", borderRadius: 999, fontWeight: 700 }}>{badge}</span>
        </div>
      )}
    </PageHeading>
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
