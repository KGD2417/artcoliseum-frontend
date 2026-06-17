import { useState } from "react";
import { api, assetUrl } from "../../utils/api";

const gold = "#D4AF37";

const KIND_META = {
  image: { accept: "image/*", noun: "image", formats: "PNG · JPG · WEBP", icon: "🖼" },
  video: { accept: "video/*", noun: "video", formats: "MP4 · MOV · WEBM", icon: "▶" },
  model: { accept: ".glb,.gltf", noun: "3D model", formats: "GLB · GLTF", icon: "◈" },
};

/**
 * Controlled media uploader — drag-and-drop OR click, with live previews and
 * per-item remove. Previews use object-fit: contain so artwork is never cropped.
 *
 *   <MediaUploader kind="image" value={url} onChange={setUrl} />            // single
 *   <MediaUploader kind="image" multiple value={urls} onChange={setUrls} /> // many
 *
 * `value` is a url string (single) or an array of url strings (multiple);
 * `onChange` is called with the same shape.
 */
export default function MediaUploader({
  kind = "image", multiple = false, value, onChange,
  hint, label, size = 100, preview = true,
}) {
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const urls = multiple ? (value || []) : (value ? [value] : []);
  const meta = KIND_META[kind] || KIND_META.image;

  const uploadFiles = async (fileList) => {
    const files = [...(fileList || [])];
    if (!files.length) return;
    setBusy(true);
    try {
      const uploaded = [];
      for (const f of files) { const r = await api.uploads.file(f, kind); uploaded.push(r.url); }
      if (multiple) onChange([...(value || []), ...uploaded]);
      else onChange(uploaded[uploaded.length - 1]);
    } catch (err) { alert(err.message); } finally { setBusy(false); }
  };

  const handleInput = (e) => {
    // Copy the FileList to an array BEFORE resetting the input — in Chrome,
    // clearing value empties the live FileList, so reading it after would be empty.
    const files = [...(e.target.files || [])];
    e.target.value = "";
    uploadFiles(files);
  };
  const onDrop = (e) => { e.preventDefault(); setDrag(false); if (!busy) uploadFiles(e.dataTransfer.files); };
  const onDragOver = (e) => { e.preventDefault(); if (!drag) setDrag(true); };
  const onDragLeave = (e) => { e.preventDefault(); setDrag(false); };

  const remove = (u) => {
    if (multiple) onChange((value || []).filter((x) => x !== u));
    else onChange(kind === "model" ? null : "");
  };

  const heading = busy
    ? "UPLOADING…"
    : hint || (urls.length && !multiple ? `REPLACE ${meta.noun.toUpperCase()}` : `ADD ${meta.noun.toUpperCase()}${multiple ? "S" : ""}`);

  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.14em", color: "rgba(212,175,55,0.6)", margin: "2px 0 6px" }}>{label}</div>
      )}

      {/* Drag-and-drop zone (also click-to-browse) */}
      <label
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 6, textAlign: "center", cursor: busy ? "default" : "pointer",
          padding: "22px 18px", borderRadius: 10,
          border: `1.5px dashed ${drag ? gold : "rgba(212,175,55,0.32)"}`,
          background: drag ? "rgba(212,175,55,0.10)" : "rgba(255,255,255,0.02)",
          transition: "border-color 0.18s, background 0.18s",
          opacity: busy ? 0.7 : 1,
        }}>
        <span style={{ fontSize: 22, lineHeight: 1, filter: "grayscale(0.2)" }}>{meta.icon}</span>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold }}>
          {heading}
        </span>
        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.5)" }}>
          {drag ? "Drop to upload" : "Drag & drop or click to browse"}
        </span>
        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9.5, letterSpacing: "0.08em", color: "rgba(200,191,160,0.35)" }}>
          {meta.formats}{multiple ? " · multiple allowed" : ""}
        </span>
        <input type="file" accept={meta.accept} multiple={multiple} disabled={busy} style={{ display: "none" }} onChange={handleInput} />
      </label>

      {preview && urls.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          {urls.map((u) => (
            <div key={u} style={{
              position: "relative", width: size, height: size, borderRadius: 8, overflow: "hidden",
              border: "1px solid rgba(212,175,55,0.3)", background: "#0d0b08", flexShrink: 0,
            }}>
              {kind === "image" && (
                <img src={assetUrl(u)} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
              )}
              {kind === "video" && (
                <video src={assetUrl(u)} muted playsInline style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
              )}
              {kind === "model" && (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, padding: 6, textAlign: "center" }}>
                  <span style={{ fontSize: 20 }}>◈</span>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: "0.1em", color: gold }}>3D · GLB</span>
                </div>
              )}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); remove(u); }}
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
