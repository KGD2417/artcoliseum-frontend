import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import { Skeleton, SkeletonGrid } from "../components/ui/Skeleton";
import { api } from "../utils/api";
import { useAuth } from "../context/Auth";

const gold = "#D4AF37";
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "12px 15px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 15, outline: "none", marginBottom: 14 };
const label = { fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: "rgba(212,175,55,0.7)", marginBottom: 6, display: "block" };
const btn = { padding: "14px 30px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.18em", fontWeight: 700, cursor: "pointer" };

const RULES = [
  ["Original work", "Each entry must be your own original, unpublished artwork. Plagiarised or AI-generated-only work is disqualified."],
  ["One entry", "One entry per artist per competition. The most recent submission stands."],
  ["Submission", "Provide a title, a short narrative and at least one clear, high-resolution image (video optional)."],
  ["Judging", "An external jury rates each entry on the competition day. The highest average score wins."],
  ["Prize", "The winner is celebrated across Art Coliseum and promoted to a verified selling artist."],
  ["Conduct", "Entries must be appropriate for public display. The jury's decision is final."],
];

export default function Competition() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [live, setLive] = useState(undefined);   // undefined=loading
  const [comps, setComps] = useState([]);
  const [mine, setMine] = useState([]);

  const loadMine = () => { if (user) api.competitions.myEntries().then(setMine).catch(() => setMine([])); };
  useEffect(() => {
    api.competitions.live().then(setLive).catch(() => setLive(null));
    api.competitions.list().then(setComps).catch(() => setComps([]));
    loadMine();
  }, [user]);

  const openComp = comps.find((c) => c.status === "open");
  const liveComp = live?.competition;
  const entries = live?.entries || [];

  if (live === undefined) {
    return (
      <div style={{ background: "#080808", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "120px 32px 100px" }}>
          <Skeleton height={300} radius={20} />
          <div style={{ marginTop: 48 }}><SkeletonGrid count={4} /></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#080808", minHeight: "100vh", paddingBottom: 100 }}>
      {/* Hero */}
      <div className="art-hero" style={{ position: "relative", height: 380, overflow: "hidden" }}>
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1a1409,#2a2010)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.7) 60%, rgba(8,8,8,1) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 56px 48px", maxWidth: 1280, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.24em", color: gold, marginBottom: 12 }}>THE ART COLISEUM COMPETITION</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(48px,6vw,80px)", fontWeight: 700, color: "#fff", lineHeight: 0.98, margin: 0 }}>
              {liveComp ? liveComp.title : openComp ? openComp.title : "Juried Competitions"}
            </h1>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontStyle: "italic", color: "rgba(200,191,160,0.78)", lineHeight: 1.6, maxWidth: 620, margin: "16px 0 0" }}>
              A juried celebration of new talent — submit your finest work, and be judged by an external panel.
            </p>
          </motion.div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 32px 0" }}>
        {/* Live gallery */}
        {liveComp && (
          <section style={{ marginBottom: 56 }}>
            <SectionRule label="LIVE — ENTRIES BEING JUDGED" right={`${entries.length} entries`} />
            {entries.length === 0 ? (
              <Empty>Entries will appear here as they're submitted.</Empty>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px,100%),300px))", justifyContent: "center", gap: 22 }}>
                {entries.map((e, i) => (
                  <motion.div key={e.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}>
                    <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(212,175,55,0.14)", background: "rgba(255,255,255,0.03)", position: "relative" }}>
                      <SafeImage src={e.image || e.image_urls?.[0]} alt={e.title} fallbackIndex={i} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      {e.status === "winner" && (
                        <div style={{ position: "absolute", top: 12, left: 12, fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.16em", color: "#0e0c0a", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", padding: "4px 12px", borderRadius: 999, fontWeight: 700 }}>★ WINNER</div>
                      )}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 600, color: "#f0e8d8" }}>{e.title}</div>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)", marginTop: 4 }}>
                        {(e.artist_name || "ARTIST").toUpperCase()}{e.avg_score != null ? ` · ★ ${e.avg_score}` : ""}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Open for entries */}
        {openComp && (
          <section style={{ marginBottom: 56 }}>
            <SectionRule label="OPEN FOR ENTRIES" right={openComp.event_date ? new Date(openComp.event_date).toLocaleDateString() : ""} />
            <Rules />
            {user ? (
              <EntryForm comp={openComp} onSubmitted={loadMine} />
            ) : (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic", color: "rgba(200,191,160,0.7)", marginBottom: 18 }}>Sign in to submit your entry.</p>
                <button onClick={() => navigate("/signin")} style={btn}>SIGN IN TO ENTER →</button>
              </div>
            )}
          </section>
        )}

        {/* My entries */}
        {mine.length > 0 && (
          <section style={{ marginBottom: 56 }}>
            <SectionRule label="YOUR ENTRIES" />
            {mine.map((m) => (
              <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#f0e8d8" }}>{m.title}</span>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: m.status === "winner" ? "#4ade80" : gold }}>{(m.status || "").toUpperCase()}</span>
              </div>
            ))}
          </section>
        )}

        {/* Nothing running */}
        {!liveComp && !openComp && (
          <div style={{ textAlign: "center", padding: "40px 24px 0" }}>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontStyle: "italic", color: "rgba(200,191,160,0.6)", maxWidth: 600, margin: "0 auto 28px", lineHeight: 1.7 }}>
              No competition is open right now. Our next juried competition will be announced soon — meanwhile, you can join as an artist any time.
            </p>
            <Link to="/become-artist" style={{ ...btn, textDecoration: "none", display: "inline-block" }}>BECOME AN ARTIST →</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function EntryForm({ comp, onSubmitted }) {
  const [entry, setEntry] = useState({ title: "", description: "" });
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const upload = async (e, kind, multi) => {
    const files = [...e.target.files]; if (!files.length) return;
    try {
      const urls = [];
      for (const f of files) { const r = await api.uploads.file(f, kind); urls.push(r.url); }
      if (kind === "video") setVideo(urls[0]); else setImages(multi ? urls : [urls[0]]);
    } catch (err) { alert(err.message); }
  };

  const submit = async () => {
    if (comp.status !== "open") return alert("This competition is not accepting entries right now.");
    if (!agreed) return alert("Please read and agree to the rules first.");
    if (!entry.title.trim()) return alert("Give your artwork a title.");
    if (!entry.description.trim()) return alert("Add a short narrative.");
    if (images.length === 0) return alert("Upload at least one image.");
    setBusy(true);
    try {
      await api.competitions.submitEntry(comp.id, { ...entry, image_urls: images, video_url: video });
      setDone(true); setEntry({ title: "", description: "" }); setImages([]); setVideo(null); setAgreed(false);
      onSubmitted && onSubmitted();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  return (
    <div style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 14, padding: 24, background: "rgba(255,255,255,0.02)" }}>
      {done && <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 10, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#86efac" }}>✓ Entry submitted! It appears in the live gallery on the competition day.</div>}
      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "0 0 18px", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#e8e0d0", lineHeight: 1.5 }}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ accentColor: gold, marginTop: 3 }} />
        I have read and agree to the competition rules &amp; regulations above.
      </label>
      <span style={label}>ARTWORK TITLE</span>
      <input style={inputStyle} value={entry.title} onChange={(e) => setEntry({ ...entry, title: e.target.value })} />
      <span style={label}>NARRATIVE — WHAT IT MEANS</span>
      <textarea style={{ ...inputStyle, minHeight: 80 }} value={entry.description} onChange={(e) => setEntry({ ...entry, description: e.target.value })} />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <label style={{ ...btn, padding: "10px 18px", background: "transparent", color: gold, border: `1px dashed ${gold}`, cursor: "pointer" }}>
          {images.length ? `${images.length} IMAGE(S)` : "UPLOAD IMAGES"}
          <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => upload(e, "image", true)} />
        </label>
        <label style={{ ...btn, padding: "10px 18px", background: "transparent", color: gold, border: `1px dashed ${gold}`, cursor: "pointer" }}>
          {video ? "VIDEO ADDED" : "UPLOAD VIDEO (OPTIONAL)"}
          <input type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => upload(e, "video", false)} />
        </label>
      </div>
      <button style={{ ...btn, opacity: (busy || !agreed) ? 0.5 : 1, cursor: (busy || !agreed) ? "not-allowed" : "pointer" }} disabled={busy || !agreed} onClick={submit}>{busy ? "SUBMITTING…" : "SUBMIT ENTRY"}</button>
    </div>
  );
}

function Rules() {
  return (
    <div style={{ border: "1px solid rgba(212,175,55,0.22)", borderRadius: 12, padding: "18px 20px", marginBottom: 18, background: "rgba(212,175,55,0.04)" }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", color: gold, marginBottom: 14 }}>RULES &amp; REGULATIONS</div>
      <div style={{ display: "grid", gap: 12 }}>
        {RULES.map(([h, body]) => (
          <div key={h} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: gold, marginTop: 7, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.12em", color: "#e8e0d0" }}>{h.toUpperCase()}</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.72)", lineHeight: 1.6, marginTop: 2 }}>{body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionRule({ label: l, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
      <div style={{ width: 32, height: 1, background: "rgba(212,175,55,0.4)" }} />
      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.24em", color: gold }}>{l}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(212,175,55,0.15)" }} />
      {right && <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontStyle: "italic", color: "rgba(200,191,160,0.4)" }}>{right}</span>}
    </div>
  );
}

function Empty({ children }) {
  return <div style={{ padding: "40px 24px", textAlign: "center", fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontStyle: "italic", color: "rgba(200,191,160,0.45)" }}>{children}</div>;
}
