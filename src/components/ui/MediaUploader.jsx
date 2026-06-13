import { useState } from "react";
import { api, assetUrl } from "../../utils/api";

const gold = "#D4AF37";

/**
 * Controlled media uploader with live thumbnail previews + per-item remove.
 *
 *   <MediaUploader kind="image" value={url} onChange={setUrl} />            // single
 *   <MediaUploader kind="image" multiple value={urls} onChange={setUrls} /> // many
 *
 * Works for kind = "image" | "video" | "model" (GLB shows a labelled chip).
 * `value` is a url string (single) or an array of url strings (multiple);
 * `onChange` is called with the same shape.
 */
export default function MediaUploader({
  kind = "image", multiple = false, value, onChange,
  hint, label, size = 92, preview = true,
}) {
  const [busy, setBusy] = useState(false);
  const urls = multiple ? (value || []) : (value ? [value] : []);
  const accept = kind === "video" ? "video/*" : kind === "model" ? ".glb,.gltf" : "image/*";

  const handle = async (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    try {
      const uploaded = [];
      for (const f of files) { const r = await api.uploads.file(f, kind); uploaded.push(r.url); }
      if (multiple) onChange([...(value || []), ...uploaded]);
      else onChange(uploaded[uploaded.length - 1]);
    } catch (err) { alert(err.message); } finally { setBusy(false); }
  };

  const remove = (u) => {
    if (multiple) onChange((value || []).filter((x) => x !== u));
    else onChange(kind === "model" ? null : "");
  };

  const btnLabel = busy ? "UPLOADING…" : hint || (urls.length && !multiple ? "REPLACE" : multiple ? "UPLOAD" : "UPLOAD");

  return (
    <div style={{ marginBottom: 14 }}>
      {label && <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.14em", color: "rgba(212,175,55,0.6)", margin: "2px 0 6px" }}>{label}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <label style={{
          display: "inline-flex", alignItems: "center", gap: 8, cursor: busy ? "default" : "pointer",
          padding: "9px 16px", border: `1px dashed ${gold}`, borderRadius: 8,
          fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", color: gold,
          opacity: busy ? 0.6 : 1,
        }}>
          {btnLabel}
          <input type="file" accept={accept} multiple={multiple} disabled={busy} style={{ display: "none" }} onChange={handle} />
        </label>
        {urls.length === 0 && (
          <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.45)" }}>
            No {kind === "model" ? "model" : kind} yet
          </span>
        )}
      </div>

      {preview && urls.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          {urls.map((u) => (
            <div key={u} style={{
              position: "relative", width: size, height: size, borderRadius: 8, overflow: "hidden",
              border: "1px solid rgba(212,175,55,0.3)", background: "#0d0b08", flexShrink: 0,
            }}>
              {kind === "image" && (
                <img src={assetUrl(u)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )}
              {kind === "video" && (
                <video src={assetUrl(u)} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              )}
              {kind === "model" && (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: 6, textAlign: "center" }}>
                  <span style={{ fontSize: 20 }}>◈</span>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: "0.1em", color: gold }}>3D · GLB</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(u)}
                title="Remove"
                style={{
                  position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%",
                  background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", fontSize: 13, lineHeight: 1,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
