import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/Auth";
import { Skeleton, SkeletonRows } from "../components/ui/Skeleton";
import { api } from "../utils/api";

const gold = "#D4AF37";
const card = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 14, padding: 28, marginBottom: 22 };
const label = { fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(212,175,55,0.7)", marginBottom: 6, display: "block" };
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 14, outline: "none", marginBottom: 14 };
const btn = { padding: "14px 26px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", fontWeight: 700, cursor: "pointer" };

function Field({ l, children }) {
  return <div><span style={label}>{l}</span>{children}</div>;
}

/** Upload one or more files; calls onDone(urls[]). */
function Uploader({ kind = "image", multiple = false, onDone, hint }) {
  const [busy, setBusy] = useState(false);
  const [names, setNames] = useState([]);
  const handle = async (e) => {
    const files = [...e.target.files];
    if (!files.length) return;
    setBusy(true);
    try {
      const urls = [];
      for (const f of files) { const r = await api.uploads.file(f, kind); urls.push(r.url); }
      setNames(files.map(f => f.name));
      onDone(urls);
    } catch (err) { alert(err.message); } finally { setBusy(false); }
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "inline-block", padding: "9px 16px", border: `1px dashed ${gold}`, borderRadius: 8, cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", color: gold }}>
        {busy ? "UPLOADING…" : hint || "UPLOAD"}
        <input type="file" accept={kind === "video" ? "video/*" : kind === "model" ? ".glb,.gltf" : "image/*"} multiple={multiple} style={{ display: "none" }} onChange={handle} />
      </label>
      {names.length > 0 && <span style={{ marginLeft: 12, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.6)" }}>{names.join(", ")}</span>}
    </div>
  );
}

export default function ArtistPortal() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null); // { artist_status, role }
  const [competitions, setCompetitions] = useState([]);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/signin"); return; }
    api.artist.status().then(setStatus).catch(() => setStatus({ artist_status: "none", role: "user" }));
    api.competitions.list().then(setCompetitions).catch(() => setCompetitions([]));
  }, [user, loading]);

  if (loading || !status) return (
    <section style={{ padding: "110px 24px 60px", maxWidth: 980, margin: "0 auto" }}>
      <Skeleton width={120} height={12} />
      <Skeleton width={320} height={36} radius={8} style={{ marginTop: 10, marginBottom: 28 }} />
      <Skeleton height={90} radius={14} style={{ marginBottom: 22 }} />
      <SkeletonRows count={3} height={120} gap={20} />
    </section>
  );

  const st = status.artist_status;
  return (
    <section style={{ padding: "110px 24px 80px", maxWidth: 880, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: gold }}>ARTIST DASHBOARD</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 44, fontWeight: 700, color: "#fff", marginTop: 6 }}>
          {st === "verified" ? "Your Studio" : st === "unverified" ? "Earn Your Place" : "Become an Artist"}
        </h1>
      </motion.div>

      <Stepper status={st} />

      <div style={{ marginTop: 26 }}>
        {st === "none" && <KycForm onApplied={(s) => setStatus(s)} />}
        {st === "unverified" && (
          <>
            <CompetitionPanel competitions={competitions} />
            <LockedNote>Win a competition (or get verified by our team) to unlock artwork submission and your studio.</LockedNote>
          </>
        )}
        {st === "verified" && (
          <>
            <SectionHead>Submit New Artwork</SectionHead>
            <ArtworkForm />
            <SectionHead>My Artworks</SectionHead>
            <MyArtworks />
          </>
        )}
      </div>
    </section>
  );
}

const STEPS = [
  { key: "apply", label: "Apply", sub: "Tell us about your practice" },
  { key: "compete", label: "Compete", sub: "Enter a curated competition" },
  { key: "studio", label: "Studio", sub: "Publish & manage your work" },
];

function Stepper({ status }) {
  // none → step 0 active; unverified → step 1 active; verified → step 2 active (all unlocked)
  const activeIdx = status === "verified" ? 2 : status === "unverified" ? 1 : 0;
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {STEPS.map((s, i) => {
        const state = i < activeIdx ? "done" : i === activeIdx ? "active" : "locked";
        const color = state === "done" ? "#4ade80" : state === "active" ? gold : "rgba(200,191,160,0.35)";
        return (
          <div key={s.key} style={{ flex: 1, padding: "14px 16px", borderRadius: 12,
            border: `1px solid ${state === "active" ? gold : "rgba(212,175,55,0.18)"}`,
            background: state === "active" ? "rgba(212,175,55,0.07)" : "rgba(255,255,255,0.02)", opacity: state === "locked" ? 0.6 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: state === "locked" ? "rgba(212,175,55,0.12)" : color, color: state === "locked" ? "rgba(200,191,160,0.5)" : "#111",
                fontSize: 11, fontWeight: 700 }}>
                {state === "done" ? "✓" : state === "locked" ? "🔒" : i + 1}
              </div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.12em", color }}>{s.label.toUpperCase()}</div>
            </div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", marginTop: 6 }}>{s.sub}</div>
          </div>
        );
      })}
    </div>
  );
}

function SectionHead({ children }) {
  return <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.16em", color: gold, margin: "32px 0 14px" }}>{children}</div>;
}
function LockedNote({ children }) {
  return (
    <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(212,175,55,0.3)",
      fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", display: "flex", alignItems: "center", gap: 10 }}>
      <span>🔒</span>{children}
    </div>
  );
}

function KycForm({ onApplied }) {
  const [f, setF] = useState({ name: "", age: "", art_type: "", location: "", about: "" });
  const [avatar, setAvatar] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async () => {
    if (!f.name) return alert("Your name is required.");
    setBusy(true);
    try {
      const s = await api.artist.apply({ ...f, age: f.age ? Number(f.age) : null, avatar_url: avatar });
      onApplied(s);
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  return (
    <div style={card}>
      <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", lineHeight: 1.7, marginBottom: 20 }}>
        Tell us about yourself. Once you apply you become an <strong style={{ color: gold }}>unverified artist</strong> and may enter our monthly
        competition. Win it — judged by an external jury — to unlock your seller profile.
      </p>
      <Field l="FULL NAME"><input style={inputStyle} value={f.name} onChange={set("name")} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field l="AGE"><input style={inputStyle} type="number" value={f.age} onChange={set("age")} /></Field>
        <Field l="WHERE YOU LIVE"><input style={inputStyle} value={f.location} onChange={set("location")} /></Field>
      </div>
      <Field l="WHAT KIND OF ARTIST ARE YOU?"><input style={inputStyle} value={f.art_type} onChange={set("art_type")} placeholder="e.g. Oil painter, Sculptor" /></Field>
      <Field l="ABOUT YOU"><textarea style={{ ...inputStyle, minHeight: 90 }} value={f.about} onChange={set("about")} /></Field>
      <Field l="PROFILE PHOTO (OPTIONAL)"><Uploader kind="image" hint="UPLOAD PHOTO" onDone={(u) => setAvatar(u[0])} /></Field>
      <button style={{ ...btn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={submit}>{busy ? "SUBMITTING…" : "APPLY AS ARTIST"}</button>
    </div>
  );
}

function CompetitionPanel({ competitions }) {
  const open = competitions.find((c) => c.status === "open") || competitions[0];
  const [entry, setEntry] = useState({ title: "", description: "" });
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [mine, setMine] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.competitions.myEntries().then(setMine).catch(() => setMine([])); }, []);

  const submit = async () => {
    if (!open) return alert("No open competition right now.");
    if (!entry.title) return alert("Give your entry a title.");
    setBusy(true);
    try {
      await api.competitions.submitEntry(open.id, { ...entry, image_urls: images, video_url: video });
      const m = await api.competitions.myEntries();
      setMine(m);
      setEntry({ title: "", description: "" }); setImages([]); setVideo(null);
      alert("Entry submitted! Our jury will review it.");
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <div style={card}>
        {open ? (
          <>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: "#fff" }}>{open.title}</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", lineHeight: 1.7, margin: "8px 0 20px" }}>{open.description}</div>
            <Field l="ARTWORK TITLE"><input style={inputStyle} value={entry.title} onChange={(e) => setEntry({ ...entry, title: e.target.value })} /></Field>
            <Field l="DESCRIPTION"><textarea style={{ ...inputStyle, minHeight: 80 }} value={entry.description} onChange={(e) => setEntry({ ...entry, description: e.target.value })} /></Field>
            <Field l="IMAGES"><Uploader kind="image" multiple hint="UPLOAD IMAGES" onDone={setImages} /></Field>
            <Field l="VIDEO (OPTIONAL)"><Uploader kind="video" hint="UPLOAD VIDEO" onDone={(u) => setVideo(u[0])} /></Field>
            <button style={{ ...btn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={submit}>{busy ? "SUBMITTING…" : "SUBMIT ENTRY"}</button>
          </>
        ) : (
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.6)" }}>No competition is open right now. Check back soon.</div>
        )}
      </div>
      {mine.length > 0 && (
        <div style={card}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", color: gold, marginBottom: 14 }}>YOUR ENTRIES</div>
          {mine.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#f0e8d8" }}>{m.title}</span>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: m.status === "winner" ? "#4ade80" : gold }}>{m.status.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ArtworkForm() {
  const [cats, setCats] = useState([]);
  const [f, setF] = useState({ title: "", narrative: "", medium: "", category_id: "", subtype_id: "", base_dimensions: "", customizable: true, price_per_unit: "", unit: "cm", min_width: "", max_width: "", min_height: "", max_height: "", min_depth: "", max_depth: "", price: "" });
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [model3d, setModel3d] = useState(null);
  const [predefined, setPredefined] = useState([]);
  const [newStyle, setNewStyle] = useState("");
  const [busy, setBusy] = useState(false);

  const loadCats = () => api.catalog.categories().then(setCats).catch(() => setCats([]));
  useEffect(() => { loadCats(); }, []);

  const mains = cats.filter((c) => c.kind === "main");
  const subtypes = cats.filter((c) => c.kind === "subtype" && (!f.category_id || c.parent_id === f.category_id));
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const addStyle = async () => {
    if (!newStyle || !f.category_id) return alert("Pick a main medium first, then name the style.");
    try { const c = await api.artist.addSubtype(newStyle, f.category_id); await loadCats(); setF((p) => ({ ...p, subtype_id: c.id })); setNewStyle(""); }
    catch (e) { alert(e.message); }
  };

  const submit = async () => {
    if (!f.title || !f.category_id) return alert("Title and main medium are required.");
    setBusy(true);
    try {
      await api.artist.createArtwork({
        title: f.title, narrative: f.narrative, medium: f.medium, category_id: f.category_id,
        subtype_id: f.subtype_id || null, base_dimensions: f.base_dimensions,
        customizable: f.customizable,
        price_per_unit: f.customizable && f.price_per_unit ? Number(f.price_per_unit) : null,
        unit: f.customizable ? f.unit : null,
        min_width: f.customizable && f.min_width !== "" ? Number(f.min_width) : null,
        max_width: f.customizable && f.max_width !== "" ? Number(f.max_width) : null,
        min_height: f.customizable && f.min_height !== "" ? Number(f.min_height) : null,
        max_height: f.customizable && f.max_height !== "" ? Number(f.max_height) : null,
        min_depth: f.customizable && f.category_id === "sculpture" && f.min_depth !== "" ? Number(f.min_depth) : null,
        max_depth: f.customizable && f.category_id === "sculpture" && f.max_depth !== "" ? Number(f.max_depth) : null,
        predefined_sizes: f.customizable ? [] : predefined,
        images, videos, model_3d_url: model3d, price: f.price ? Number(f.price) : 0,
      });
      alert(`"${f.title}" has been added to the collection!`);
      setF({ title: "", narrative: "", medium: "", category_id: "", subtype_id: "", base_dimensions: "", customizable: true, price_per_unit: "", unit: "cm", min_width: "", max_width: "", min_height: "", max_height: "", min_depth: "", max_depth: "", price: "" });
      setImages([]); setVideos([]); setModel3d(null); setPredefined([]);
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  return (
    <div style={card}>
      <Field l="ARTWORK NAME"><input style={inputStyle} value={f.title} onChange={set("title")} /></Field>
      <Field l="NARRATIVE — WHAT IT MEANS"><textarea style={{ ...inputStyle, minHeight: 90 }} value={f.narrative} onChange={set("narrative")} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field l="MAIN MEDIUM">
          <select style={inputStyle} value={f.category_id} onChange={set("category_id")}>
            <option value="">Select…</option>
            {mains.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <Field l="STYLE / SUBTYPE">
          <select style={inputStyle} value={f.subtype_id} onChange={set("subtype_id")}>
            <option value="">None</option>
            {subtypes.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Add a new style (e.g. Luminism)" value={newStyle} onChange={(e) => setNewStyle(e.target.value)} />
        <button onClick={addStyle} style={{ ...btn, padding: "11px 18px", whiteSpace: "nowrap" }}>+ STYLE</button>
      </div>
      <Field l="MEDIUM (TEXT, e.g. Oil on Canvas)"><input style={inputStyle} value={f.medium} onChange={set("medium")} /></Field>
      <Field l="BASE DIMENSIONS"><input style={inputStyle} value={f.base_dimensions} onChange={set("base_dimensions")} placeholder="e.g. 90 × 60 cm" /></Field>

      <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#e8e0d0" }}>
        <input type="checkbox" checked={f.customizable} onChange={(e) => setF({ ...f, customizable: e.target.checked })} style={{ accentColor: gold }} />
        This artwork is customizable (priced per unit)
      </label>

      {f.customizable ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field l="PRICE PER UNIT"><input style={inputStyle} type="number" value={f.price_per_unit} onChange={set("price_per_unit")} /></Field>
            <Field l="UNIT">
              <select style={inputStyle} value={f.unit} onChange={set("unit")}>
                <option value="cm">cm</option><option value="inch">inch</option><option value="feet">feet</option>
              </select>
            </Field>
          </div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(212,175,55,0.65)", marginBottom: 8 }}>
            AVAILABLE SIZE RANGE ({f.unit}) — leave blank for no limit
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field l="MIN WIDTH"><input style={inputStyle} type="number" value={f.min_width} onChange={set("min_width")} /></Field>
            <Field l="MAX WIDTH"><input style={inputStyle} type="number" value={f.max_width} onChange={set("max_width")} /></Field>
            <Field l="MIN HEIGHT"><input style={inputStyle} type="number" value={f.min_height} onChange={set("min_height")} /></Field>
            <Field l="MAX HEIGHT"><input style={inputStyle} type="number" value={f.max_height} onChange={set("max_height")} /></Field>
            {f.category_id === "sculpture" && <>
              <Field l="MIN DEPTH"><input style={inputStyle} type="number" value={f.min_depth} onChange={set("min_depth")} /></Field>
              <Field l="MAX DEPTH"><input style={inputStyle} type="number" value={f.max_depth} onChange={set("max_depth")} /></Field>
            </>}
          </div>
        </>
      ) : (
        <PredefinedSizes sizes={predefined} setSizes={setPredefined} />
      )}

      <Field l="STARTING / DISPLAY PRICE"><input style={inputStyle} type="number" value={f.price} onChange={set("price")} /></Field>
      <Field l="IMAGES"><Uploader kind="image" multiple hint="UPLOAD IMAGES" onDone={setImages} /></Field>
      <Field l="VIDEOS (OPTIONAL)"><Uploader kind="video" multiple hint="UPLOAD VIDEOS" onDone={setVideos} /></Field>
      <Field l="3D MODEL — GLB (FOR SCULPTURE/MURAL)"><Uploader kind="model" hint="UPLOAD 3D MODEL" onDone={(u) => setModel3d(u[0])} /></Field>

      <button style={{ ...btn, opacity: busy ? 0.7 : 1, marginTop: 8 }} disabled={busy} onClick={submit}>{busy ? "PUBLISHING…" : "PUBLISH ARTWORK"}</button>
    </div>
  );
}

function PredefinedSizes({ sizes, setSizes }) {
  const add = () => setSizes([...sizes, { label: "", width: "", height: "", unit: "cm", price: "" }]);
  const upd = (i, k, v) => setSizes(sizes.map((s, j) => j === i ? { ...s, [k]: v } : s));
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={label}>PREDEFINED SIZES & PRICES</span>
      {sizes.map((s, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Label" value={s.label} onChange={(e) => upd(i, "label", e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="W" value={s.width} onChange={(e) => upd(i, "width", e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="H" value={s.height} onChange={(e) => upd(i, "height", e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Price" value={s.price} onChange={(e) => upd(i, "price", e.target.value)} />
        </div>
      ))}
      <button onClick={add} style={{ ...btn, padding: "8px 16px", background: "transparent", color: gold, border: `1px solid ${gold}` }}>+ ADD SIZE</button>
    </div>
  );
}

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// Verified artist's own works — list, quick-edit and delete (own works only).
function MyArtworks() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => api.artist.myArtworks().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const del = async (id) => { if (confirm("Delete this artwork permanently?")) { await api.artist.deleteArtwork(id); load(); } };

  if (rows.length === 0) return <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)" }}>You haven't published any artworks yet.</div>;
  return (
    <div>
      {rows.map((a) => (
        <div key={a.id} style={{ display: "flex", gap: 16, alignItems: "center", padding: "12px 14px", marginBottom: 10, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.15)" }}>
          <img src={(a.images && a.images[0]) || ""} alt="" style={{ width: 54, height: 54, borderRadius: 6, objectFit: "cover", background: "rgba(212,175,55,0.1)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#fff" }}>{a.title}</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.6)" }}>
              {a.customizable ? "Customizable" : inr(a.price)} · {a.category_id || "—"}{a.subtype_id ? ` / ${a.subtype_id}` : ""} · {a.status}
            </div>
          </div>
          <button onClick={() => setEditing(a)} style={{ ...btn, padding: "8px 16px", background: "transparent", color: gold, border: `1px solid ${gold}` }}>EDIT</button>
          <button onClick={() => del(a.id)} style={{ ...btn, padding: "8px 16px", background: "transparent", color: "rgba(255,140,140,0.9)", border: "1px solid rgba(255,140,140,0.4)" }}>DELETE</button>
        </div>
      ))}
      {editing && <EditArtwork artwork={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}

function EditArtwork({ artwork, onClose, onSaved }) {
  const [f, setF] = useState({
    title: artwork.title || "", price: artwork.price || "", medium: artwork.medium || "",
    base_dimensions: artwork.base_dimensions || "", price_per_unit: artwork.price_per_unit || "",
    customizable: artwork.customizable !== false, in_stock: artwork.in_stock !== false,
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async () => {
    setBusy(true);
    try {
      await api.artist.updateArtwork(artwork.id, {
        title: f.title, medium: f.medium, base_dimensions: f.base_dimensions,
        customizable: f.customizable, in_stock: f.in_stock,
        price: f.price !== "" ? Number(f.price) : null,
        price_per_unit: f.customizable && f.price_per_unit !== "" ? Number(f.price_per_unit) : null,
      });
      onSaved();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 7000, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...card, width: "100%", maxWidth: 460, marginBottom: 0, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.16em", color: gold, marginBottom: 16 }}>EDIT ARTWORK</div>
        <Field l="TITLE"><input style={inputStyle} value={f.title} onChange={set("title")} /></Field>
        <Field l="MEDIUM"><input style={inputStyle} value={f.medium} onChange={set("medium")} /></Field>
        <Field l="BASE DIMENSIONS"><input style={inputStyle} value={f.base_dimensions} onChange={set("base_dimensions")} /></Field>
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#e8e0d0" }}>
          <input type="checkbox" checked={f.customizable} onChange={(e) => setF({ ...f, customizable: e.target.checked })} style={{ accentColor: gold }} /> Customizable (priced per unit)
        </label>
        {f.customizable
          ? <Field l="PRICE PER UNIT"><input style={inputStyle} type="number" value={f.price_per_unit} onChange={set("price_per_unit")} /></Field>
          : <Field l="PRICE"><input style={inputStyle} type="number" value={f.price} onChange={set("price")} /></Field>}
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#e8e0d0" }}>
          <input type="checkbox" checked={f.in_stock} onChange={(e) => setF({ ...f, in_stock: e.target.checked })} style={{ accentColor: gold }} /> In stock / available
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...btn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={save}>{busy ? "SAVING…" : "SAVE CHANGES"}</button>
          <button style={{ ...btn, background: "transparent", color: "rgba(200,191,160,0.7)", border: "1px solid rgba(212,175,55,0.25)" }} onClick={onClose}>CANCEL</button>
        </div>
      </div>
    </div>
  );
}
