import { useEffect, useState } from "react";
import { intRange, minLen } from "../utils/validation";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/Auth";
import { Skeleton, SkeletonRows } from "../components/ui/Skeleton";
import MediaUploader from "../components/ui/MediaUploader";
import { isThreeD, composeDims } from "../utils/dimensions";
import { api } from "../utils/api";

const gold = "#D4AF37";
const card = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 14, padding: 28, marginBottom: 22 };
const label = { fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "rgba(212,175,55,0.7)", marginBottom: 6, display: "block" };
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "12px 15px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 8, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 16, outline: "none", marginBottom: 14 };
const btn = { padding: "15px 28px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: "0.18em", fontWeight: 700, cursor: "pointer" };
const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

function Field({ l, children }) {
  return <div><span style={label}>{l}</span>{children}</div>;
}

export default function ArtistPortal() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null); // { artist_status, role }

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/signin"); return; }
    api.artist.status().then(setStatus).catch(() => setStatus({ artist_status: "none", role: "user" }));
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
  const isVerified = st === "verified";
  const isWaiting = st === "pending" || st === "unverified";
  const isRejected = st === "rejected";

  if (isVerified) return <StudioDashboard />;

  return (
    <section style={{ padding: "110px 24px 80px", maxWidth: 880, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: gold }}>ARTIST STUDIO</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 44, fontWeight: 700, color: "#fff", marginTop: 6 }}>
          {isWaiting ? "Application Received" : isRejected ? "Application Update" : "Become an Artist"}
        </h1>
      </motion.div>

      <ApplyStepper status={st} />

      <div style={{ marginTop: 26 }}>
        {(st === "none" || isRejected) && (
          <>
            {isRejected && (
              <div style={{ marginBottom: 16, padding: "14px 18px", borderRadius: 10, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#fca5a5" }}>
                Your previous application wasn't approved. You're welcome to refine your details and apply again.
              </div>
            )}
            <KycForm onApplied={(s) => setStatus(s)} />
          </>
        )}
        {isWaiting && <AwaitingApproval />}
      </div>
    </section>
  );
}

const APPLY_STEPS = [
  { key: "apply", label: "Apply", sub: "Tell us about your practice" },
  { key: "review", label: "Under Review", sub: "Our team approves your studio" },
  { key: "studio", label: "Your Studio", sub: "Publish & sell your work" },
];

function ApplyStepper({ status }) {
  const activeIdx = status === "verified" ? 2 : (status === "pending" || status === "unverified") ? 1 : 0;
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {APPLY_STEPS.map((s, i) => {
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
                {state === "done" ? "✓" : i + 1}
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

function AwaitingApproval() {
  return (
    <div style={{ ...card, textAlign: "center", padding: "48px 32px" }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: "#fff", marginBottom: 10 }}>Thanks — your application is in review</div>
      <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.7)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
        An Art Coliseum curator will review your details shortly. Once you're approved, your studio unlocks here and
        you can start uploading work for sale. We'll keep this page updated — check back soon.
      </p>
    </div>
  );
}

function KycForm({ onApplied }) {
  const [f, setF] = useState({ name: "", age: "", art_type: "", location: "", about: "", gender: "" });
  const [avatar, setAvatar] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  // You're already a user — prefill name (and location) from your profile.
  useEffect(() => {
    api.auth.me().then((m) => setF((p) => ({
      ...p,
      name: p.name || m?.full_name || "",
      location: p.location || (m?.addresses?.find((a) => a.is_default) || m?.addresses?.[0])?.city || "",
    }))).catch(() => {});
  }, []);
  const submit = async () => {
    if (!f.name.trim()) return alert("Your name is required.");
    if (!f.art_type.trim()) return alert("Tell us what kind of artist you are.");
    const ageErr = f.age ? intRange(16, 100, "Age")(f.age) : "";
    if (ageErr) return alert(ageErr);
    const aboutErr = minLen(20, "About you")(f.about);
    if (aboutErr) return alert(aboutErr);
    setBusy(true);
    try {
      const s = await api.artist.apply({ ...f, age: f.age ? Number(f.age) : null, avatar_url: avatar });
      onApplied(s);
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  return (
    <div style={card}>
      <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", lineHeight: 1.7, marginBottom: 20 }}>
        Tell us about yourself and your practice. Once you apply, an Art Coliseum curator reviews your details.
        After you're <strong style={{ color: gold }}>approved</strong>, your studio unlocks and you can publish work for sale.
      </p>
      <Field l="FULL NAME"><input style={inputStyle} value={f.name} onChange={set("name")} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field l="AGE"><input style={inputStyle} type="number" value={f.age} onChange={set("age")} /></Field>
        <Field l="GENDER">
          <select style={inputStyle} value={f.gender} onChange={set("gender")}>
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field l="WHERE YOU LIVE"><input style={inputStyle} value={f.location} onChange={set("location")} /></Field>
      </div>
      <Field l="WHAT KIND OF ARTIST ARE YOU?"><input style={inputStyle} value={f.art_type} onChange={set("art_type")} placeholder="e.g. Oil painter, Sculptor" /></Field>
      <Field l="ABOUT YOU"><textarea style={{ ...inputStyle, minHeight: 90 }} value={f.about} onChange={set("about")} /></Field>
      <Field l="PROFILE PHOTO (OPTIONAL)"><MediaUploader kind="image" hint="UPLOAD PHOTO" value={avatar} onChange={setAvatar} /></Field>
      <button style={{ ...btn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={submit}>{busy ? "SUBMITTING…" : "APPLY AS ARTIST"}</button>
    </div>
  );
}

/* ═══════════════ STUDIO DASHBOARD (approved artists) ═══════════════ */
const STUDIO_TABS = [
  ["overview", "Overview"], ["upload", "Upload Artwork"], ["works", "My Artworks"],
  ["exhibition", "Exhibition"], ["profile", "Profile"],
];

function StudioDashboard() {
  const [tab, setTab] = useState("overview");
  const [works, setWorks] = useState([]);
  const loadWorks = () => api.artist.myArtworks().then(setWorks).catch(() => setWorks([]));
  useEffect(() => { loadWorks(); }, []);

  return (
    <section style={{ padding: "110px 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: gold }}>ARTIST STUDIO</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 44, fontWeight: 700, color: "#fff", marginTop: 6 }}>Your Studio</h1>
      </motion.div>

      {/* Tab pills */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
        {STUDIO_TABS.map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: "10px 18px", borderRadius: 999, cursor: "pointer",
            fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em",
            background: tab === id ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "transparent",
            color: tab === id ? "#111" : "rgba(200,191,160,0.7)",
            border: tab === id ? "none" : "1px solid rgba(212,175,55,0.25)",
          }}>{lbl.toUpperCase()}</button>
        ))}
      </div>

      {tab === "overview" && <Overview works={works} onGo={setTab} />}
      {tab === "upload" && <ArtworkForm onPublished={() => { loadWorks(); }} />}
      {tab === "works" && <MyArtworks rows={works} reload={loadWorks} />}
      {tab === "exhibition" && <ArtistExhibitionPanel />}
      {tab === "profile" && <ProfilePanel />}
    </section>
  );
}

function Overview({ works, onGo }) {
  const count = (s) => works.filter((w) => w.status === s).length;
  const cards = [
    ["Total works", works.length, "rgba(240,232,216,1)"],
    ["Awaiting approval", count("pending"), "#fbbf24"],
    ["Live / approved", count("active"), "#4ade80"],
    ["Sold", count("sold"), gold],
  ];
  const rejected = count("rejected");
  return (
    <div style={card}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, marginBottom: 20 }}>
        {cards.map(([l, v, c]) => (
          <div key={l} style={{ padding: 18, border: "1px solid rgba(212,175,55,0.15)", borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: c }}>{v}</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: "rgba(200,191,160,0.7)", marginTop: 4 }}>{l.toUpperCase()}</div>
          </div>
        ))}
      </div>
      {rejected > 0 && (
        <div style={{ marginBottom: 16, fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#fca5a5" }}>
          {rejected} work{rejected === 1 ? "" : "s"} need attention — see <button onClick={() => onGo("works")} style={{ background: "none", border: "none", color: gold, cursor: "pointer", textDecoration: "underline", padding: 0, fontFamily: "inherit", fontSize: "inherit" }}>My Artworks</button>.
        </div>
      )}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button style={{ ...btn, padding: "12px 22px" }} onClick={() => onGo("upload")}>+ UPLOAD ARTWORK</button>
        <button style={{ ...btn, padding: "12px 22px", background: "transparent", color: gold, border: `1px solid ${gold}` }} onClick={() => onGo("exhibition")}>EXHIBITION</button>
      </div>
      <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12.5, color: "rgba(200,191,160,0.55)", lineHeight: 1.7, marginTop: 18 }}>
        Every artwork you upload is reviewed by our team before it appears in the public gallery. You'll see its status
        update here — <span style={{ color: "#fbbf24" }}>Pending</span> → <span style={{ color: "#4ade80" }}>Approved</span>.
      </p>
    </div>
  );
}

function ArtworkForm({ onPublished }) {
  const [cats, setCats] = useState([]);
  const [f, setF] = useState({ title: "", narrative: "", medium: "", category_id: "", subtype_id: "", width: "", height: "", depth: "", dim_unit: "cm", customizable: true, ratio_locked: false, price_per_unit: "", unit: "cm", min_width: "", max_width: "", min_height: "", max_height: "", min_depth: "", max_depth: "", price: "" });
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [model3d, setModel3d] = useState(null);
  const [predefined, setPredefined] = useState([]);
  const [newStyle, setNewStyle] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const loadCats = () => api.catalog.categories().then(setCats).catch(() => setCats([]));
  useEffect(() => { loadCats(); }, []);

  const mains = cats.filter((c) => c.kind === "main");
  const subtypes = cats.filter((c) => c.kind === "subtype" && (!f.category_id || c.parent_id === f.category_id));
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  // Sculpture / 3-D works get a third dimension (depth / length).
  const is3D = isThreeD(f.category_id, cats);
  const composedDims = composeDims(f.width, f.height, is3D ? f.depth : "", f.dim_unit);

  const addStyle = async () => {
    if (!newStyle || !f.category_id) return alert("Pick a main medium first, then name the style.");
    try { const c = await api.artist.addSubtype(newStyle, f.category_id); await loadCats(); setF((p) => ({ ...p, subtype_id: c.id })); setNewStyle(""); }
    catch (e) { alert(e.message); }
  };

  const submit = async () => {
    if (!f.title || !f.category_id) return alert("Title and main medium are required.");
    if (f.customizable && !(Number(f.price_per_unit) > 0)) return alert("Customizable artworks need a price per unit greater than 0.");
    if (!f.customizable && !(Number(f.price) > 0)) return alert("Fixed-price artworks need a price greater than 0.");
    if (images.length === 0) return alert("Upload at least one image of your artwork.");
    setBusy(true);
    try {
      await api.artist.createArtwork({
        title: f.title, narrative: f.narrative, medium: f.medium, category_id: f.category_id,
        subtype_id: f.subtype_id || null,
        // Structured size (fixed works); base_dimensions string for display.
        width: !f.customizable && f.width !== "" ? Number(f.width) : null,
        height: !f.customizable && f.height !== "" ? Number(f.height) : null,
        depth: !f.customizable && is3D && f.depth !== "" ? Number(f.depth) : null,
        base_dimensions: f.customizable ? null : (composedDims || null),
        customizable: f.customizable, ratio_locked: f.customizable && f.ratio_locked,
        price_per_unit: f.customizable && f.price_per_unit ? Number(f.price_per_unit) : null,
        unit: f.customizable ? f.unit : null,
        min_width: f.customizable && f.min_width !== "" ? Number(f.min_width) : null,
        max_width: f.customizable && f.max_width !== "" ? Number(f.max_width) : null,
        min_height: f.customizable && f.min_height !== "" ? Number(f.min_height) : null,
        max_height: f.customizable && f.max_height !== "" ? Number(f.max_height) : null,
        min_depth: f.customizable && is3D && f.min_depth !== "" ? Number(f.min_depth) : null,
        max_depth: f.customizable && is3D && f.max_depth !== "" ? Number(f.max_depth) : null,
        predefined_sizes: f.customizable ? [] : predefined,
        images, videos, model_3d_url: model3d, price: f.price ? Number(f.price) : 0,
      });
      setDone(true);
      setF({ title: "", narrative: "", medium: "", category_id: "", subtype_id: "", width: "", height: "", depth: "", dim_unit: "cm", customizable: true, price_per_unit: "", unit: "cm", min_width: "", max_width: "", min_height: "", max_height: "", min_depth: "", max_depth: "", price: "" });
      setImages([]); setVideos([]); setModel3d(null); setPredefined([]);
      onPublished && onPublished();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  return (
    <div style={card}>
      {done && (
        <div style={{ marginBottom: 18, padding: "14px 18px", borderRadius: 10, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#86efac" }}>
          ✓ Submitted for review. Your artwork is now <strong>pending admin approval</strong> — it appears in the public gallery once approved. Track it under <strong>My Artworks</strong>.
        </div>
      )}
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

      <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#e8e0d0" }}>
        <input type="checkbox" checked={f.customizable} onChange={(e) => setF({ ...f, customizable: e.target.checked })} style={{ accentColor: gold }} />
        This artwork is customizable (priced per unit)
      </label>
      {f.customizable && (
        <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#e8e0d0" }}>
          <input type="checkbox" checked={f.ratio_locked} onChange={(e) => setF({ ...f, ratio_locked: e.target.checked })} style={{ accentColor: gold }} />
          Lock width : height ratio (buyer's W &amp; H stay proportional)
        </label>
      )}

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
            {is3D && <>
              <Field l="MIN DEPTH / LENGTH"><input style={inputStyle} type="number" value={f.min_depth} onChange={set("min_depth")} /></Field>
              <Field l="MAX DEPTH / LENGTH"><input style={inputStyle} type="number" value={f.max_depth} onChange={set("max_depth")} /></Field>
            </>}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(212,175,55,0.65)", margin: "4px 0 8px" }}>
            ARTWORK SIZE{is3D ? " (width × height × depth)" : " (width × height)"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: is3D ? "1fr 1fr 1fr 0.8fr" : "1fr 1fr 0.8fr", gap: 12 }}>
            <Field l="WIDTH"><input style={inputStyle} type="number" value={f.width} onChange={set("width")} /></Field>
            <Field l="HEIGHT"><input style={inputStyle} type="number" value={f.height} onChange={set("height")} /></Field>
            {is3D && <Field l="DEPTH / LENGTH"><input style={inputStyle} type="number" value={f.depth} onChange={set("depth")} /></Field>}
            <Field l="UNIT">
              <select style={inputStyle} value={f.dim_unit} onChange={set("dim_unit")}>
                <option value="cm">cm</option><option value="inch">inch</option><option value="feet">feet</option>
              </select>
            </Field>
          </div>
          {composedDims && <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginBottom: 12 }}>Shown as: <span style={{ color: gold }}>{composedDims}</span></div>}
          <PredefinedSizes sizes={predefined} setSizes={setPredefined} />
        </>
      )}

      <Field l="STARTING / DISPLAY PRICE"><input style={inputStyle} type="number" value={f.price} onChange={set("price")} /></Field>
      <Field l="IMAGES"><MediaUploader kind="image" multiple hint="UPLOAD IMAGES" value={images} onChange={setImages} /></Field>
      <Field l="VIDEOS (OPTIONAL)"><MediaUploader kind="video" multiple hint="UPLOAD VIDEOS" value={videos} onChange={setVideos} /></Field>
      <Field l="3D MODEL — GLB (FOR SCULPTURE/MURAL)"><MediaUploader kind="model" hint="UPLOAD 3D MODEL" value={model3d} onChange={setModel3d} /></Field>

      <button style={{ ...btn, opacity: busy ? 0.7 : 1, marginTop: 8 }} disabled={busy} onClick={submit}>{busy ? "SUBMITTING…" : "SUBMIT FOR APPROVAL"}</button>
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

const STATUS_BADGE = {
  pending: { label: "PENDING APPROVAL", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  active: { label: "APPROVED · LIVE", color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  rejected: { label: "REJECTED", color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  sold: { label: "SOLD", color: gold, bg: "rgba(212,175,55,0.12)" },
  draft: { label: "DRAFT", color: "rgba(200,191,160,0.7)", bg: "rgba(255,255,255,0.04)" },
};

// Verified artist's own works — list with status, quick-edit and delete.
function MyArtworks({ rows, reload }) {
  const [editing, setEditing] = useState(null);
  const del = async (id) => { if (confirm("Delete this artwork permanently?")) { await api.artist.deleteArtwork(id); reload(); } };

  if (!rows || rows.length === 0) return <div style={card}><div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)" }}>You haven't uploaded any artworks yet.</div></div>;
  return (
    <div style={card}>
      {rows.map((a) => {
        const badge = STATUS_BADGE[a.status] || STATUS_BADGE.draft;
        return (
          <div key={a.id} style={{ display: "flex", gap: 16, alignItems: "center", padding: "12px 14px", marginBottom: 10, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.15)" }}>
            <img src={(a.images && a.images[0]) || ""} alt="" style={{ width: 54, height: 54, borderRadius: 6, objectFit: "cover", background: "rgba(212,175,55,0.1)", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#fff" }}>{a.title}</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.6)" }}>
                {a.customizable ? "Customizable" : inr(a.price)} · {a.category_id || "—"}{a.subtype_id ? ` / ${a.subtype_id}` : ""}
              </div>
              <span style={{ display: "inline-block", marginTop: 5, padding: "2px 9px", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.12em", color: badge.color, background: badge.bg }}>{badge.label}</span>
              {a.status === "rejected" && a.rejection_reason && (
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "#fca5a5", marginTop: 4 }}>Reason: {a.rejection_reason}</div>
              )}
            </div>
            <button onClick={() => setEditing(a)} style={{ ...btn, padding: "8px 16px", background: "transparent", color: gold, border: `1px solid ${gold}` }}>EDIT</button>
            <button onClick={() => del(a.id)} style={{ ...btn, padding: "8px 16px", background: "transparent", color: "rgba(255,140,140,0.9)", border: "1px solid rgba(255,140,140,0.4)" }}>DELETE</button>
          </div>
        );
      })}
      {editing && <EditArtwork artwork={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
    </div>
  );
}

function EditArtwork({ artwork, onClose, onSaved }) {
  const [f, setF] = useState({
    title: artwork.title || "", price: artwork.price || "", medium: artwork.medium || "",
    width: artwork.width ?? "", height: artwork.height ?? "", depth: artwork.depth ?? "",
    dim_unit: artwork.unit || "cm",
    price_per_unit: artwork.price_per_unit || "",
    customizable: artwork.customizable !== false, in_stock: artwork.in_stock !== false,
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const is3D = isThreeD(artwork.category_id) || artwork.depth != null;
  const composedDims = composeDims(f.width, f.height, is3D ? f.depth : "", f.dim_unit);
  const save = async () => {
    setBusy(true);
    try {
      await api.artist.updateArtwork(artwork.id, {
        title: f.title, medium: f.medium,
        width: f.width !== "" ? Number(f.width) : null,
        height: f.height !== "" ? Number(f.height) : null,
        depth: is3D && f.depth !== "" ? Number(f.depth) : null,
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
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(212,175,55,0.65)", margin: "2px 0 6px" }}>ARTWORK SIZE</div>
        <div style={{ display: "grid", gridTemplateColumns: is3D ? "1fr 1fr 1fr 0.8fr" : "1fr 1fr 0.8fr", gap: 10 }}>
          <Field l="WIDTH"><input style={inputStyle} type="number" value={f.width} onChange={set("width")} /></Field>
          <Field l="HEIGHT"><input style={inputStyle} type="number" value={f.height} onChange={set("height")} /></Field>
          {is3D && <Field l="DEPTH/LEN"><input style={inputStyle} type="number" value={f.depth} onChange={set("depth")} /></Field>}
          <Field l="UNIT">
            <select style={inputStyle} value={f.dim_unit} onChange={set("dim_unit")}>
              <option value="cm">cm</option><option value="inch">inch</option><option value="feet">feet</option>
            </select>
          </Field>
        </div>
        {composedDims && <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginBottom: 12 }}>Shown as: <span style={{ color: gold }}>{composedDims}</span></div>}
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

/* ── Artist's exhibition submission panel ── */
function ArtistExhibitionPanel() {
  const [ex, setEx] = useState(undefined); // undefined=loading, null=none
  const [mine, setMine] = useState([]);
  const [cats, setCats] = useState([]);
  const blankForm = { title: "", narrative: "", medium: "", category_id: "", price: "", width: "", height: "", depth: "", dim_unit: "cm" };
  const [f, setF] = useState(blankForm);
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [wbusy, setWbusy] = useState("");

  const loadMine = () => api.exhibitions.mine().then(setMine).catch(() => setMine([]));
  useEffect(() => {
    api.exhibitions.current().then(setEx).catch(() => setEx(null));
    api.catalog.categories().then(setCats).catch(() => {});
    loadMine();
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const mains = cats.filter((c) => c.kind === "main");
  const is3D = isThreeD(f.category_id, cats);
  const composedDims = composeDims(f.width, f.height, is3D ? f.depth : "", f.dim_unit);

  const submit = async () => {
    if (!f.title.trim()) return alert("Give your piece a title.");
    if (!(Number(f.price) > 0)) return alert("An exhibition piece needs a price greater than 0.");
    if (images.length === 0) return alert("Upload at least one image.");
    setBusy(true);
    try {
      await api.exhibitions.addArtwork({
        title: f.title.trim(), narrative: f.narrative || null, medium: f.medium || null,
        category_id: f.category_id || null, price: Number(f.price), images,
        width: f.width !== "" ? Number(f.width) : null,
        height: f.height !== "" ? Number(f.height) : null,
        depth: is3D && f.depth !== "" ? Number(f.depth) : null,
        unit: f.dim_unit,
      });
      setF(blankForm); setImages([]); await loadMine();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  const withdraw = async (id) => {
    if (!window.confirm("Withdraw this piece from the exhibition?")) return;
    setWbusy(id);
    try { await api.exhibitions.withdraw(id); await loadMine(); }
    catch (e) { alert(e.message); } finally { setWbusy(""); }
  };

  if (ex === undefined) return <div style={card}><Skeleton height={120} radius={10} /></div>;
  if (!ex || ex.status === "ended") return (
    <div style={card}><div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.65)" }}>No exhibition is running right now. When the next one opens for registration, you'll be able to submit new pieces here — these are separate from your collection works.</div></div>
  );

  return (
    <div style={card}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: "#fff" }}>{ex.title}</div>
      {ex.theme && <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: gold, marginTop: 4 }}>{ex.theme.toUpperCase()}</div>}
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", lineHeight: 1.7, margin: "10px 0 16px" }}>{ex.description}</div>

      {ex.status === "upcoming" && (
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", padding: "12px 16px", borderRadius: 10, background: "rgba(212,175,55,0.06)", border: "1px dashed rgba(212,175,55,0.3)" }}>
          Registration opens {ex.registration_starts_at ? new Date(ex.registration_starts_at).toLocaleString() : "soon"}. Check back to submit your pieces.
        </div>
      )}

      {ex.status === "registration" && (
        <>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, marginBottom: 4 }}>
            SUBMIT A NEW PIECE {ex.registration_ends_at && <span style={{ color: "rgba(200,191,160,0.55)" }}>· closes {new Date(ex.registration_ends_at).toLocaleDateString()}</span>}
          </div>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12.5, color: "rgba(200,191,160,0.6)", marginBottom: 14 }}>
            These are exhibition-only works — they're shown and sold inside this show and never appear in your collection.
          </p>
          <Field l="TITLE"><input style={inputStyle} value={f.title} onChange={set("title")} /></Field>
          <Field l="ABOUT THIS PIECE"><textarea style={{ ...inputStyle, minHeight: 70 }} value={f.narrative} onChange={set("narrative")} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field l="MEDIUM (e.g. Oil on canvas)"><input style={inputStyle} value={f.medium} onChange={set("medium")} /></Field>
            <Field l="CATEGORY (optional)">
              <select style={inputStyle} value={f.category_id} onChange={set("category_id")}>
                <option value="">None</option>
                {mains.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
          </div>
          <Field l="PRICE (₹)"><input style={inputStyle} type="number" value={f.price} onChange={set("price")} /></Field>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(212,175,55,0.65)", margin: "2px 0 6px" }}>
            SIZE{is3D ? " (width × height × depth)" : " (width × height)"}{composedDims ? ` — ${composedDims}` : ""}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: is3D ? "1fr 1fr 1fr 0.8fr" : "1fr 1fr 0.8fr", gap: 12 }}>
            <Field l="WIDTH"><input style={inputStyle} type="number" value={f.width} onChange={set("width")} /></Field>
            <Field l="HEIGHT"><input style={inputStyle} type="number" value={f.height} onChange={set("height")} /></Field>
            {is3D && <Field l="DEPTH / LENGTH"><input style={inputStyle} type="number" value={f.depth} onChange={set("depth")} /></Field>}
            <Field l="UNIT">
              <select style={inputStyle} value={f.dim_unit} onChange={set("dim_unit")}>
                <option value="cm">cm</option><option value="inch">inch</option><option value="feet">feet</option>
              </select>
            </Field>
          </div>
          <Field l="IMAGES"><MediaUploader kind="image" multiple hint="UPLOAD IMAGES" value={images} onChange={setImages} /></Field>
          <button style={{ ...btn, opacity: busy ? 0.7 : 1, marginTop: 4 }} disabled={busy} onClick={submit}>{busy ? "SUBMITTING…" : "+ SUBMIT TO EXHIBITION"}</button>
        </>
      )}

      {ex.status === "live" && (
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", padding: "12px 16px", borderRadius: 10, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)" }}>
          🎉 The exhibition is <strong style={{ color: "#86efac" }}>live</strong>. You have {mine.length} piece{mine.length === 1 ? "" : "s"} on show.{" "}
          <Link to="/exhibition" style={{ color: gold }}>View the exhibition →</Link>
        </div>
      )}

      {/* My submitted exhibition pieces */}
      {mine.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.16em", color: gold, margin: "0 0 14px" }}>MY EXHIBITION PIECES ({mine.length})</div>
          {mine.map((w) => (
            <div key={w.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 12px", marginBottom: 8, borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.15)" }}>
              <img src={w.images?.[0]} alt="" style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover", background: "rgba(212,175,55,0.1)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: "#fff" }}>{w.title}</div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.6)" }}>{inr(w.price)}{w.base_dimensions ? ` · ${w.base_dimensions}` : ""}</div>
              </div>
              {ex.status === "registration" && (
                <button onClick={() => withdraw(w.id)} disabled={wbusy === w.id}
                  style={{ ...btn, padding: "7px 14px", background: "transparent", color: "rgba(255,140,140,0.9)", border: "1px solid rgba(255,140,140,0.4)" }}>
                  {wbusy === w.id ? "…" : "WITHDRAW"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Artist profile editor ── */
function ProfilePanel() {
  const [f, setF] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    api.artist.profile().then((p) => setF({
      name: p.name || "", bio: p.bio || "", image_url: p.image_url || "",
      location: p.location || "", art_type: p.art_type || "", age: p.age || "", gender: p.gender || "",
    })).catch(() => setF({ name: "", bio: "", image_url: "", location: "", art_type: "", age: "", gender: "" }));
  }, []);
  if (!f) return <div style={card}><Skeleton height={200} radius={10} /></div>;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async () => {
    setBusy(true); setSaved(false);
    try {
      await api.artist.updateProfile({ ...f, age: f.age ? Number(f.age) : null });
      setSaved(true);
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  return (
    <div style={card}>
      {saved && <div style={{ marginBottom: 16, fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#86efac" }}>✓ Profile saved.</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
        {f.image_url
          ? <img src={f.image_url} alt="" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(212,175,55,0.3)" }} />
          : <div style={{ width: 72, height: 72, borderRadius: "50%", border: "1px dashed rgba(212,175,55,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(212,175,55,0.4)" }}>✦</div>}
        <MediaUploader kind="image" preview={false} hint="CHANGE PHOTO" value={f.image_url} onChange={(url) => setF((v) => ({ ...v, image_url: url }))} />
      </div>
      <Field l="DISPLAY NAME"><input style={inputStyle} value={f.name} onChange={set("name")} /></Field>
      <Field l="BIO"><textarea style={{ ...inputStyle, minHeight: 100 }} value={f.bio} onChange={set("bio")} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field l="ART TYPE"><input style={inputStyle} value={f.art_type} onChange={set("art_type")} placeholder="e.g. Oil painter" /></Field>
        <Field l="LOCATION"><input style={inputStyle} value={f.location} onChange={set("location")} /></Field>
        <Field l="AGE"><input style={inputStyle} type="number" value={f.age} onChange={set("age")} /></Field>
      </div>
      <Field l="GENDER (FOR DEFAULT AVATAR)">
        <select style={inputStyle} value={f.gender} onChange={set("gender")}>
          <option value="">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </Field>
      <button style={{ ...btn, opacity: busy ? 0.7 : 1 }} disabled={busy} onClick={save}>{busy ? "SAVING…" : "SAVE PROFILE"}</button>
    </div>
  );
}
