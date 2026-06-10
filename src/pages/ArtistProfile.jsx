import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import ArtistAvatar from "../components/ArtistAvatar";
import { api } from "../utils/api";
import { useLocale } from "../context/Locale";

// Light demo fallback for the originally-seeded slugs (used only if the backend
// returns nothing for this id).
const DEMO = {
  "elena-vance": { name: "Elena Vance", location: "Florence, Italy", bio: "Explores the intersection of digital abstraction and classical renaissance techniques.", art_type: "Digital Neo-Classical" },
};

export default function ArtistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useLocale();
  const [artist, setArtist] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.catalog.artist(id).catch(() => null),
      api.catalog.artistArtworks(id).catch(() => []),
    ]).then(([a, w]) => {
      if (cancelled) return;
      setArtist(a);
      setWorks(Array.isArray(w) ? w : []);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const demo = DEMO[id];
  const name = artist?.name || works[0]?.artist_name || demo?.name || "Artist";
  const bio = artist?.bio || demo?.bio || "An ARRT Coliseum artist. Their full monograph is being prepared.";
  const location = artist?.location || demo?.location || "";
  const artType = artist?.art_type || demo?.art_type || "";
  const image = artist?.image_url || null;
  const gender = artist?.gender;
  const tags = [artType, location].filter(Boolean);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: name, url });
      else { await navigator.clipboard.writeText(url); setShareCopied(true); setTimeout(() => setShareCopied(false), 1800); }
    } catch { /* cancelled */ }
  };

  const filtered = works.filter((w) => {
    if (!search.trim()) return true;
    const t = search.trim().toLowerCase();
    return `${w.title} ${w.medium || ""}`.toLowerCase().includes(t);
  });

  const priceLabel = (w) =>
    w.customizable
      ? (w.price_per_unit ? `From ${formatPrice(w.price_per_unit)}/${w.unit || "unit"}²` : "Made to size")
      : (w.price > 0 ? formatPrice(w.price) : "Enquire");

  if (loading) {
    return (
      <section style={{ padding: "140px 24px", textAlign: "center", color: "rgba(200,191,160,0.6)", fontFamily: "'Raleway',sans-serif" }}>
        Loading artist…
      </section>
    );
  }

  return (
    <section style={{ padding: "100px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
      {/* hero */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 320px) 1fr", gap: 56, alignItems: "center", padding: "32px 0 48px" }} className="ap-hero">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}
          style={{ width: "100%", aspectRatio: "1/1.1", borderRadius: 12, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)" }}>
          {image
            ? <SafeImage src={image} alt={name} fallbackIndex={0} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <ArtistAvatar gender={gender} size={200} />}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.2em", color: "#D4AF37" }}>FEATURED ARTIST</span>
            <div style={{ flex: 1, maxWidth: 60, height: 1, background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
            <motion.button onClick={handleShare} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} title="Copy profile link"
              style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37", width: 36, height: 36, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {shareCopied && (
                <span style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#0e0c0a", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37", padding: "4px 10px", borderRadius: 4, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", whiteSpace: "nowrap" }}>LINK COPIED</span>
              )}
            </motion.button>
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(46px,6vw,72px)", fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 22 }}>{name}</h1>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 15, color: "rgba(200,191,160,0.72)", lineHeight: 1.75, maxWidth: 560, marginBottom: 22 }}>{bio}</p>

          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
              {tags.map((t) => (
                <span key={t} style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, letterSpacing: "0.08em", color: "rgba(200,191,160,0.78)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", padding: "6px 14px", borderRadius: 999, textTransform: "uppercase" }}>{t}</span>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(212,175,55,0.25),transparent)", margin: "10px 0 56px" }} />

      {/* selected works */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 700, color: "#fff", lineHeight: 1 }}>Curated Showcase</h2>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginTop: 8 }}>{works.length} {works.length === 1 ? "WORK" : "WORKS"}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.22)", borderRadius: 999 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(212,175,55,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search works…"
            style={{ background: "transparent", border: "none", outline: "none", color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, width: 160 }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: "60px 24px", textAlign: "center", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 12, fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.6)" }}>
          {works.length === 0 ? "This artist hasn't published any works yet." : "No works match your search."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 320px))", justifyContent: "center", gap: 22 }}>
          {filtered.map((w, i) => (
            <motion.div key={w.id} onClick={() => navigate(`/product/${w.id}`)}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }} whileHover={{ y: -4 }} style={{ cursor: "pointer" }}>
              <div style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden", borderRadius: 4, position: "relative", marginBottom: 12 }}>
                <SafeImage src={w.images?.[0]} alt={w.title} fallbackIndex={i} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 600, color: "#f0e8d8" }}>{w.title}</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, letterSpacing: "0.1em", color: "rgba(200,191,160,0.55)", marginTop: 4, textTransform: "uppercase" }}>{w.medium || ""}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.16em", fontWeight: 600, marginTop: 6, color: w.in_stock === false ? "rgba(200,191,160,0.5)" : "#D4AF37" }}>
                {w.in_stock === false ? "RESERVED" : priceLabel(w)}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* registry */}
      <div style={{ marginTop: 80, padding: "60px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 12, textAlign: "center" }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Collector's Registry</h3>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.62)", maxWidth: 480, margin: "0 auto 28px" }}>
          Join our private list to receive early access to {name.split(" ")[0]}'s upcoming collection.
        </p>
        <div style={{ display: "flex", justifyContent: "center", maxWidth: 460, margin: "0 auto", gap: 0 }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ENTER YOUR EMAIL"
            style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", padding: "14px 18px", color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, letterSpacing: "0.1em", outline: "none", borderRadius: "8px 0 0 8px" }} />
          <button style={{ padding: "0 22px", background: "transparent", border: "1px solid rgba(212,175,55,0.3)", borderLeft: "none", color: "#D4AF37", fontSize: 18, cursor: "pointer", borderRadius: "0 8px 8px 0" }}>→</button>
        </div>
      </div>

      <style>{`@media (max-width: 800px){ .ap-hero { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}
