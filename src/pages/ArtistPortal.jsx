import { useRef, useState } from "react";
import { motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import { useLocale } from "../context/Locale";
import { CloudIcon, ImageIcon, UploadIcon, PlusIcon } from "../components/Icons";
import i1 from "../assets/i1.png";
import i3 from "../assets/i3.png";
import i6 from "../assets/i6.png";

const ACTIVE_COLLECTION = [
  { id: 1, title: "Celestial Fracture",     status: "AVAILABLE", price: 12000, tags: ["DIGITAL PAINTING", "4K MASTER"],     thumb: i1 },
  { id: 2, title: "Architectural Silence",  status: "SOLD",      price: 8500,  tags: ["3D SCULPTURE", "VR READY"],          thumb: i3 },
  { id: 3, title: "Obsidian Bloom",         status: "AVAILABLE", price: 15200, tags: ["GENERATIVE ART", "LIMITED EDITION"], thumb: i6 },
];

export default function ArtistPortal() {
  const { formatPrice } = useLocale();
  const formRef = useRef(null);
  const titleRef = useRef(null);

  const [form, setForm] = useState({
    title: "", price: "", category: "Digital Painting", materials: "",
  });
  const [fileName, setFileName] = useState("");
  const [assetName, setAssetName] = useState("");

  const STATS = [
    { label: "TOTAL REVENUE",   value: formatPrice(124500),  sub: "+12.4% THIS MONTH",  highlight: true },
    { label: "PIECES SOLD",     value: "18",                 sub: "LIFETIME CURATION" },
    { label: "GALLERY VIEWS",   value: "42.8K",              sub: "HIGH ENGAGEMENT" },
    { label: "COLLECTOR INDEX", value: "A+",                 sub: "TOP 5% ARTISTS" },
  ];

  const focusUploadForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => titleRef.current?.focus(), 350);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title || !form.price) return alert("Title and price are required.");
    alert(`"${form.title}" submitted for curation. Our team will review within 48h.`);
    setForm({ title: "", price: "", category: "Digital Painting", materials: "" });
    setFileName("");
    setAssetName("");
  };

  return (
    <section style={{ padding: "100px 24px 80px", maxWidth: 1300, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          gap: 18, flexWrap: "wrap",
          paddingBottom: 28, marginBottom: 32,
          borderBottom: "1px solid rgba(212,175,55,0.18)",
        }}>
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 56, fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 12 }}>
            Artist Portal
          </h1>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)", maxWidth: 460, lineHeight: 1.6 }}>
            Curate your portfolio and monitor your presence within the Aureum digital ecosystem.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={focusUploadForm}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "14px 26px",
            background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
            color: "#111", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em",
            border: "none", borderRadius: 999, cursor: "pointer",
          }}>
          <PlusIcon size={14} /> NEW UPLOAD
        </motion.button>
      </motion.div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 14, marginBottom: 44,
      }}>
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(212,175,55,0.12)",
              borderRadius: 8, padding: "20px 22px",
            }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(200,191,160,0.55)", marginBottom: 12 }}>{s.label}</div>
            <div className="num-value" style={{
              fontFamily: "'Raleway',sans-serif", fontSize: 30, fontWeight: 700,
              color: s.highlight ? "#D4AF37" : "#fff", marginBottom: 12, letterSpacing: "0.005em",
            }}>{s.value}</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, letterSpacing: "0.1em", color: s.highlight ? "#D4AF37" : "rgba(200,191,160,0.5)" }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.05fr", gap: 36 }} className="ap-grid">
        <motion.form
          ref={formRef}
          onSubmit={submit}
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22, color: "#D4AF37" }}>
            <CloudIcon size={22} />
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 700, color: "#fff" }}>Exhibition Entry</h2>
          </div>

          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "60px 20px", marginBottom: 24,
            border: "1.5px dashed rgba(212,175,55,0.3)", borderRadius: 8,
            background: "rgba(255,255,255,0.015)", cursor: "pointer",
            position: "relative", overflow: "hidden",
          }}>
            <input type="file" onChange={e => setFileName(e.target.files?.[0]?.name || "")} style={{ display: "none" }} accept="image/*" />
            <div style={{
              width: 38, height: 38, borderRadius: 6,
              background: "rgba(212,175,55,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 14, color: "#D4AF37",
            }}>
              <ImageIcon size={20} />
            </div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", marginBottom: 4 }}>
              {fileName || "DROP MASTER FILE OR CLICK TO BROWSE"}
            </div>
            <div className="num-value" style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(200,191,160,0.4)" }}>TIFF, PNG or WEBP up to 100MB</div>
          </label>

          <Field label="ARTWORK TITLE">
            <input
              ref={titleRef}
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="E.g., The Golden Zenith" style={inp}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            <Field label="PRICE (USD)">
              <input
                value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="0.00" type="number" style={inp}
              />
            </Field>
            <Field label="CATEGORY">
              <select
                value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ ...inp, appearance: "none" }}>
                <option>Digital Painting</option>
                <option>Sculpture</option>
                <option>Photography</option>
                <option>Generative Art</option>
                <option>Mixed Media</option>
              </select>
            </Field>
          </div>

          <Field label="MATERIALS / MEDIUM">
            <input
              value={form.materials} onChange={e => setForm({ ...form, materials: e.target.value })}
              placeholder="Procedural shaders, Ray-tracing, NFT" style={inp}
            />
          </Field>

          <label style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 18px", marginBottom: 24,
            border: "1px solid rgba(212,175,55,0.15)", borderRadius: 6,
            cursor: "pointer", background: "rgba(255,255,255,0.02)",
          }}>
            <input type="file" onChange={e => setAssetName(e.target.files?.[0]?.name || "")} style={{ display: "none" }} accept=".glb,.gltf" />
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em", color: "#e8e0d0" }}>3D ASSET (OPTIONAL)</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(200,191,160,0.5)", marginTop: 4 }}>{assetName || "Include GLB/GLTF for AR exhibition"}</div>
            </div>
            <span style={{ color: "#D4AF37", display: "flex" }}><UploadIcon size={16} /></span>
          </label>

          <button type="submit" style={{
            width: "100%", padding: "16px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,175,55,0.25)",
            color: "#e8e0d0", fontFamily: "'Cinzel',serif",
            fontSize: 12, letterSpacing: "0.18em",
            borderRadius: 6, cursor: "pointer",
          }}>INITIALIZE MINT &amp; LIST</button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.25 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 700, color: "#fff", marginBottom: 22 }}>Active Collection</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {ACTIVE_COLLECTION.map((p, i) => (
              <div key={p.id} style={{ display: "flex", gap: 18, alignItems: "center", paddingBottom: 22,
                borderBottom: i !== ACTIVE_COLLECTION.length - 1 ? "1px solid rgba(212,175,55,0.1)" : "none" }}>
                <SafeImage src={p.thumb} alt={p.title} fallbackIndex={i}
                  style={{ width: 66, height: 66, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: "#f0e8d8", fontWeight: 600 }}>{p.title}</div>
                  <div className="num-value" style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, letterSpacing: "0.1em", marginTop: 4,
                    color: p.status === "SOLD" ? "rgba(200,191,160,0.45)" : "#D4AF37" }}>
                    {p.status} · {formatPrice(p.price)}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    {p.tags.map(t => (
                      <span key={t} style={{
                        fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: "0.12em",
                        padding: "4px 10px", borderRadius: 999,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(212,175,55,0.18)",
                        color: "rgba(200,191,160,0.7)",
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button style={{
            marginTop: 24, width: "100%",
            padding: "14px",
            background: "transparent", border: "1px solid rgba(212,175,55,0.3)",
            color: "#e8e0d0", fontFamily: "'Cinzel',serif", fontSize: 11,
            letterSpacing: "0.18em", borderRadius: 6, cursor: "pointer",
          }}>VIEW ARCHIVE (24)</button>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .ap-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

const inp = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(212,175,55,0.2)",
  padding: "12px 14px",
  color: "#e8e0d0",
  fontFamily: "'Raleway',sans-serif", fontSize: 13,
  outline: "none", borderRadius: 6,
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(200,191,160,0.65)", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}
