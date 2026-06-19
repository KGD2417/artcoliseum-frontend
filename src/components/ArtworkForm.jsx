/**
 * Shared artwork form — used by both the Artist Studio (self-upload) and the
 * Admin dashboard (add artwork on behalf of an artist). Keeping it in one place
 * guarantees the two surfaces stay identical in layout and fields.
 *
 * Props:
 *  - onSubmit(payload)   async; build-and-submit handler (artist vs admin differ
 *                        only here). Throw to surface an error.
 *  - onDone()            optional; called after a successful submit.
 *  - submitLabel         button text (default "SUBMIT FOR APPROVAL").
 *  - submittingLabel     button text while busy.
 *  - successMessage      node shown after a successful submit.
 *  - topSlot             node rendered above the first field (admin artist picker).
 *  - showFeatured        admin-only "Featured on home" toggle (adds `featured`).
 *  - onAddSubtype(label, categoryId, extra)  create a new style (extra carries
 *                        { image_url, description }); defaults to the artist
 *                        endpoint (admins are authorized for it too).
 */
import { useEffect, useState } from "react";
import MediaUploader from "./ui/MediaUploader";
import { isThreeD, composeDims } from "../utils/dimensions";
import { toCm, formatDimsFromCm } from "../utils/units";
import { api } from "../utils/api";

const gold = "#D4AF37";
const card = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(212,175,55,0.18)",
  borderRadius: 14,
  padding: 28,
  marginBottom: 22,
};
const label = {
  fontFamily: "'Cinzel',serif",
  fontSize: 11,
  letterSpacing: "0.18em",
  color: "rgba(212,175,55,0.7)",
  marginBottom: 6,
  display: "block",
};
export const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 15px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(212,175,55,0.2)",
  borderRadius: 8,
  color: "#e8e0d0",
  fontFamily: "'Raleway',sans-serif",
  fontSize: 16,
  outline: "none",
  marginBottom: 14,
};
const btn = {
  padding: "15px 28px",
  background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
  color: "#111",
  border: "none",
  borderRadius: 999,
  fontFamily: "'Cinzel',serif",
  fontSize: 13,
  letterSpacing: "0.18em",
  fontWeight: 700,
  cursor: "pointer",
};

export function Field({ l, children }) {
  return (
    <div>
      <span style={label}>{l}</span>
      {children}
    </div>
  );
}

const BLANK = {
  title: "", narrative: "", category_id: "", subtype_id: "",
  width: "", height: "", depth: "", dim_unit: "cm",
  customizable: true, ratio_locked: false,
  price_per_unit: "", unit: "cm",
  min_width: "", max_width: "", min_height: "", max_height: "", min_depth: "", max_depth: "",
  price: "",
};

const DEFAULT_SUCCESS = (
  <>
    ✓ Submitted for review. Your artwork is now <strong>pending admin approval</strong> —
    it appears in the public gallery once approved. Track it under <strong>My Artworks</strong>.
  </>
);

export default function ArtworkForm({
  onSubmit,
  onDone,
  submitLabel = "SUBMIT FOR APPROVAL",
  submittingLabel = "SUBMITTING…",
  successMessage = DEFAULT_SUCCESS,
  topSlot = null,
  showFeatured = false,
  onAddSubtype = (l, cat, extra) => api.artist.addSubtype(l, cat, extra),
}) {
  const [cats, setCats] = useState([]);
  const [f, setF] = useState(BLANK);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [model3d, setModel3d] = useState(null);
  const [predefined, setPredefined] = useState([]);
  const [newStyle, setNewStyle] = useState("");
  const [newStyleImage, setNewStyleImage] = useState(null);
  const [newStyleDesc, setNewStyleDesc] = useState("");
  const [styleErr, setStyleErr] = useState("");
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const loadCats = () => api.catalog.categories().then(setCats).catch(() => setCats([]));
  useEffect(() => { loadCats(); }, []);

  const mains = cats.filter((c) => c.kind === "main");
  const subtypes = cats.filter(
    (c) => c.kind === "subtype" && (!f.category_id || c.parent_id === f.category_id),
  );
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const is3D = isThreeD(f.category_id, cats);
  const composedDims = composeDims(f.width, f.height, is3D ? f.depth : "", f.dim_unit);

  const addStyle = async () => {
    if (!f.category_id) return setStyleErr("Pick a main medium first.");
    if (!newStyle.trim()) return setStyleErr("Name the style.");
    if (!newStyleImage) return setStyleErr("Add an image for the style.");
    setStyleErr("");
    try {
      const c = await onAddSubtype(newStyle.trim(), f.category_id, {
        image_url: newStyleImage,
        description: newStyleDesc.trim() || undefined,
      });
      await loadCats();
      setF((p) => ({ ...p, subtype_id: c.id }));
      setNewStyle(""); setNewStyleImage(null); setNewStyleDesc("");
    } catch (e) { setStyleErr(e.message); }
  };

  const derivedMedium =
    cats.find((c) => c.id === f.subtype_id)?.label ||
    mains.find((c) => c.id === f.category_id)?.label || "";
  const sizePrices = predefined.map((s) => Number(s.price)).filter((p) => p > 0);
  const fixedPrice = predefined.length > 0
    ? (sizePrices.length ? Math.min(...sizePrices) : 0)
    : Number(f.price) || 0;

  const submit = async () => {
    if (!f.title || !f.category_id) return alert("Title and main medium are required.");
    if (f.customizable && !(Number(f.price_per_unit) > 0))
      return alert("Made-to-order artworks need a price per unit greater than 0.");
    if (!f.customizable && !(fixedPrice > 0))
      return alert("Set a price: either a price for the piece, or at least one variant with a price.");
    if (images.length === 0) return alert("Upload at least one image of your artwork.");
    setBusy(true);
    try {
      // Dimensions are stored canonically in cm (cm is the legal unit); the artist
      // may enter cm / inches / feet and we convert on the way in. A single artwork
      // size only applies when there are no variants — variants carry their own.
      const hasVariants = !f.customizable && predefined.length > 0;
      const singleSize = !f.customizable && !hasVariants;
      const wCm = singleSize ? toCm(f.width, f.dim_unit) : null;
      const hCm = singleSize ? toCm(f.height, f.dim_unit) : null;
      const dCm = singleSize && is3D ? toCm(f.depth, f.dim_unit) : null;
      const payload = {
        title: f.title,
        narrative: f.narrative,
        medium: derivedMedium,
        category_id: f.category_id,
        subtype_id: f.subtype_id || null,
        width: wCm,
        height: hCm,
        depth: dCm,
        base_dimensions: singleSize ? (formatDimsFromCm(wCm, hCm, dCm, "cm") || null) : null,
        customizable: f.customizable,
        ratio_locked: f.customizable && f.ratio_locked,
        price_per_unit: f.customizable && f.price_per_unit ? Number(f.price_per_unit) : null,
        unit: f.customizable ? f.unit : null,
        min_width: f.customizable && f.min_width !== "" ? Number(f.min_width) : null,
        max_width: f.customizable && f.max_width !== "" ? Number(f.max_width) : null,
        min_height: f.customizable && f.min_height !== "" ? Number(f.min_height) : null,
        max_height: f.customizable && f.max_height !== "" ? Number(f.max_height) : null,
        min_depth: f.customizable && is3D && f.min_depth !== "" ? Number(f.min_depth) : null,
        max_depth: f.customizable && is3D && f.max_depth !== "" ? Number(f.max_depth) : null,
        predefined_sizes: f.customizable ? [] : predefined,
        images,
        videos,
        model_3d_url: model3d,
        price: f.customizable ? 0 : fixedPrice,
        ...(showFeatured ? { featured } : {}),
      };
      await onSubmit(payload);
      setDone(true);
      setF(BLANK);
      setImages([]); setVideos([]); setModel3d(null); setPredefined([]); setFeatured(false);
      onDone && onDone();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={card}>
      {done && (
        <div style={{ marginBottom: 18, padding: "14px 18px", borderRadius: 10, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#86efac" }}>
          {successMessage}
        </div>
      )}

      {topSlot}

      <Field l="ARTWORK NAME">
        <input style={inputStyle} value={f.title} onChange={set("title")} />
      </Field>
      <Field l="NARRATIVE — WHAT IT MEANS">
        <textarea style={{ ...inputStyle, minHeight: 90 }} value={f.narrative} onChange={set("narrative")} />
      </Field>
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
      <div style={{ marginBottom: 14, padding: 14, borderRadius: 10, border: "1px dashed rgba(212,175,55,0.3)", background: "rgba(212,175,55,0.03)" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(212,175,55,0.75)", marginBottom: 8 }}>
          ADD A NEW STYLE UNDER THIS MEDIUM
        </div>
        <input
          style={{ ...inputStyle, marginBottom: 10 }}
          placeholder="Style name (e.g. Luminism)"
          value={newStyle}
          onChange={(e) => { setNewStyle(e.target.value); setStyleErr(""); }}
        />
        <input
          style={{ ...inputStyle, marginBottom: 10 }}
          placeholder="Short description (optional)"
          value={newStyleDesc}
          onChange={(e) => setNewStyleDesc(e.target.value)}
        />
        <MediaUploader
          kind="image"
          hint="STYLE IMAGE"
          value={newStyleImage}
          onChange={(url) => { setNewStyleImage(url); setStyleErr(""); }}
        />
        {styleErr && (
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#f87171", marginTop: 8 }}>
            {styleErr}
          </div>
        )}
        <button onClick={addStyle} style={{ ...btn, padding: "11px 18px", whiteSpace: "nowrap", marginTop: 12 }}>+ ADD STYLE</button>
      </div>

      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(212,175,55,0.65)", margin: "4px 0 8px" }}>
        HOW IS THIS ARTWORK SOLD?
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[
          { val: false, title: "Fixed size & price", desc: "A finished piece sold as-is. You set its size and price (one or more variants)." },
          { val: true, title: "Customize", desc: "Buyers choose their own size; the price is calculated from your price per unit." },
        ].map((opt) => {
          const active = f.customizable === opt.val;
          return (
            <button key={String(opt.val)} type="button" onClick={() => setF({ ...f, customizable: opt.val })}
              style={{ textAlign: "left", padding: "14px 16px", borderRadius: 12, cursor: "pointer", background: active ? "rgba(212,175,55,0.10)" : "rgba(255,255,255,0.02)", border: `1px solid ${active ? gold : "rgba(212,175,55,0.18)"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ width: 15, height: 15, borderRadius: "50%", flexShrink: 0, border: `2px solid ${active ? gold : "rgba(200,191,160,0.4)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {active && <span style={{ width: 6, height: 6, borderRadius: "50%", background: gold }} />}
                </span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700, color: active ? "#fff" : "rgba(232,224,208,0.8)" }}>{opt.title}</span>
              </div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", lineHeight: 1.5 }}>{opt.desc}</div>
            </button>
          );
        })}
      </div>

      {f.customizable ? (
        <>
          <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#e8e0d0" }}>
            <input type="checkbox" checked={f.ratio_locked} onChange={(e) => setF({ ...f, ratio_locked: e.target.checked })} style={{ accentColor: gold }} />
            Lock width : height ratio (buyer's W &amp; H stay proportional)
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field l="PRICE PER UNIT (₹)">
              <input style={inputStyle} type="number" value={f.price_per_unit} onChange={set("price_per_unit")} />
            </Field>
            <Field l="UNIT">
              <select style={inputStyle} value={f.unit} onChange={set("unit")}>
                <option value="cm">cm</option><option value="inch">inch</option><option value="feet">feet</option>
              </select>
            </Field>
          </div>
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.5)", margin: "-2px 0 12px", lineHeight: 1.5 }}>
            The buyer's total is calculated automatically from the size they pick — you don't set a separate price.
          </div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(212,175,55,0.65)", marginBottom: 8 }}>
            AVAILABLE SIZE RANGE ({f.unit}) — leave blank for no limit
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field l="MIN WIDTH"><input style={inputStyle} type="number" value={f.min_width} onChange={set("min_width")} /></Field>
            <Field l="MAX WIDTH"><input style={inputStyle} type="number" value={f.max_width} onChange={set("max_width")} /></Field>
            <Field l="MIN HEIGHT"><input style={inputStyle} type="number" value={f.min_height} onChange={set("min_height")} /></Field>
            <Field l="MAX HEIGHT"><input style={inputStyle} type="number" value={f.max_height} onChange={set("max_height")} /></Field>
            {is3D && (
              <>
                <Field l="MIN DEPTH / LENGTH"><input style={inputStyle} type="number" value={f.min_depth} onChange={set("min_depth")} /></Field>
                <Field l="MAX DEPTH / LENGTH"><input style={inputStyle} type="number" value={f.max_depth} onChange={set("max_depth")} /></Field>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          {/* A single artwork size only applies when there are no variants — once the
              artist adds variants, each variant carries its own size, so this is hidden. */}
          {predefined.length === 0 && (
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
              {composedDims && (
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginBottom: 12 }}>
                  Shown as: <span style={{ color: gold }}>{composedDims}</span>
                  {f.dim_unit !== "cm" && (
                    <> · stored as <span style={{ color: gold }}>{formatDimsFromCm(toCm(f.width, f.dim_unit), toCm(f.height, f.dim_unit), is3D ? toCm(f.depth, f.dim_unit) : null, "cm")}</span></>
                  )}
                </div>
              )}
            </>
          )}
          {predefined.length === 0 ? (
            <Field l="PRICE FOR THIS PIECE (₹)">
              <input style={inputStyle} type="number" value={f.price} onChange={set("price")} />
            </Field>
          ) : (
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.5)", margin: "0 0 8px", lineHeight: 1.5 }}>
              Price comes from the variants below — buyers pick one at checkout, and the lowest is shown as the “from” price.
            </div>
          )}
          <PredefinedSizes sizes={predefined} setSizes={setPredefined} />
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.4)", margin: "-4px 0 12px", lineHeight: 1.5 }}>
            Offering several variants? Add each with its own price above. Otherwise just set the single price.
          </div>
        </>
      )}

      <Field l="IMAGES">
        <MediaUploader kind="image" multiple hint="UPLOAD IMAGES" value={images} onChange={setImages} />
      </Field>
      <Field l="VIDEOS (OPTIONAL)">
        <MediaUploader kind="video" multiple hint="UPLOAD VIDEOS" value={videos} onChange={setVideos} />
      </Field>
      <Field l="3D MODEL — GLB (FOR SCULPTURE/MURAL)">
        <MediaUploader kind="model" hint="UPLOAD 3D MODEL" value={model3d} onChange={setModel3d} />
      </Field>

      {showFeatured && (
        <label style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 14px", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#e8e0d0" }}>
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} style={{ accentColor: gold }} />
          Featured on home
        </label>
      )}

      <button style={{ ...btn, opacity: busy ? 0.7 : 1, marginTop: 8 }} disabled={busy} onClick={submit}>
        {busy ? submittingLabel : submitLabel}
      </button>
    </div>
  );
}

function PredefinedSizes({ sizes, setSizes }) {
  const add = () => setSizes([...sizes, { label: "", width: "", height: "", unit: "cm", price: "" }]);
  const upd = (i, k, v) => setSizes(sizes.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  const rm = (i) => setSizes(sizes.filter((_, j) => j !== i));
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={label}>VARIANTS & PRICES (cm)</span>
      {sizes.map((s, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Variant (e.g. A3, Large)" value={s.label} onChange={(e) => upd(i, "label", e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="W (cm)" value={s.width} onChange={(e) => upd(i, "width", e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="H (cm)" value={s.height} onChange={(e) => upd(i, "height", e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Price" value={s.price} onChange={(e) => upd(i, "price", e.target.value)} />
          <button onClick={() => rm(i)} title="Remove variant" aria-label="Remove variant"
            style={{ width: 34, height: 34, borderRadius: 8, cursor: "pointer", background: "transparent", border: "1px solid rgba(255,140,140,0.4)", color: "rgba(255,140,140,0.9)", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      ))}
      <button onClick={add} style={{ ...btn, padding: "8px 16px", background: "transparent", color: gold, border: `1px solid ${gold}` }}>
        + ADD VARIANT
      </button>
    </div>
  );
}
