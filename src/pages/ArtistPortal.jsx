import { useRef, useState } from "react";
import { motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import { CloudIcon, ImageIcon, UploadIcon, PlusIcon } from "../components/Icons";
import i1 from "../assets/i1.png";
import i3 from "../assets/i3.png";
import i6 from "../assets/i6.png";

const ACTIVE_COLLECTION = [
  { id: 1, title: "Celestial Fracture",     status: "AVAILABLE", tags: ["DIGITAL PAINTING", "4K MASTER"],     thumb: i1 },
  { id: 2, title: "Architectural Silence",  status: "SOLD",      tags: ["3D SCULPTURE", "VR READY"],          thumb: i3 },
  { id: 3, title: "Obsidian Bloom",         status: "AVAILABLE", tags: ["GENERATIVE ART", "LIMITED EDITION"], thumb: i6 },
];

export default function ArtistPortal() {
  const formRef = useRef(null);
  const titleRef = useRef(null);

  const SUB_CATEGORIES = {
    "Digital Painting": ["Generative", "AI Assisted", "AR Ready", "NFT"],
    "Sculpture":        ["Bronze", "Marble", "Kinetic", "Ceramic"],
    "Photography":      ["Fine Art", "Documentary", "Landscape", "Abstract"],
    "Generative Art":   ["Procedural", "Algorithmic", "Code-driven"],
    "Mixed Media":      ["Collage", "Assemblage", "Found Object"],
    "Painting":         ["Oil", "Acrylic", "Watercolor", "Mixed Media"],
  };

  const initialForm = {
    title: "",
    artistName: "",
    artistBio: "",
    category: "Digital Painting",
    subCategory: "Generative",
    materials: "",
    aboutArt: "",
    origin: "",
    purpose: "",
    storyBehind: "",
    spreadAccepted: "",
    specifications: "",
  };

  const [form, setForm] = useState(initialForm);
  const [fileName, setFileName] = useState("");
  const [assetName, setAssetName] = useState("");

  const updateField = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === "category") {
        next.subCategory = SUB_CATEGORIES[value]?.[0] || "";
      }
      return next;
    });
  };

  const STATS = [
    { label: "ENQUIRIES RECEIVED", value: "184",   sub: "+12.4% THIS MONTH",  highlight: true },
    { label: "PIECES PLACED",      value: "18",    sub: "LIFETIME CURATION" },
    { label: "GALLERY VIEWS",      value: "42.8K", sub: "HIGH ENGAGEMENT" },
    { label: "COLLECTOR INDEX",    value: "A+",    sub: "TOP 5% ARTISTS" },
  ];

  const focusUploadForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => titleRef.current?.focus(), 350);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title || !form.artistName) {
      return alert("Name of art and artist name are required.");
    }
    alert(`"${form.title}" by ${form.artistName} submitted for curation. Our team will review within 48h.`);
    setForm(initialForm);
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

          <FieldGroup title="WORK BASICS">
            <Field label="NAME OF ART *">
              <input
                ref={titleRef}
                value={form.title} onChange={e => updateField("title", e.target.value)}
                placeholder="E.g., The Golden Zenith" style={inp}
              />
            </Field>

            <Field label="NAME OF ARTIST *">
              <input
                value={form.artistName} onChange={e => updateField("artistName", e.target.value)}
                placeholder="E.g., Elena Vance" style={inp}
              />
            </Field>

            <Field label="SHORT DESCRIPTION OF ARTIST">
              <textarea
                value={form.artistBio} onChange={e => updateField("artistBio", e.target.value)}
                placeholder="Florence-based painter exploring the intersection of digital abstraction and classical renaissance techniques."
                rows={3} style={{ ...inp, resize: "vertical" }}
              />
            </Field>
          </FieldGroup>

          <FieldGroup title="MEDIUM & CATEGORISATION">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="TYPE OF MEDIUM">
                <select
                  value={form.category} onChange={e => updateField("category", e.target.value)}
                  style={{ ...inp, appearance: "none" }}>
                  {Object.keys(SUB_CATEGORIES).map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="MEDIUM SUB-CATEGORY">
                <select
                  value={form.subCategory} onChange={e => updateField("subCategory", e.target.value)}
                  style={{ ...inp, appearance: "none" }}>
                  {(SUB_CATEGORIES[form.category] || []).map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <Field label="SPECIFICATIONS & MATERIALS">
              <textarea
                value={form.specifications} onChange={e => updateField("specifications", e.target.value)}
                placeholder="24k gold leaf, oil, gesso with bone-ash and ground basalt, on Belgian linen. 180 × 140 cm. Float-mounted in walnut frame, museum-grade UV glass."
                rows={3} style={{ ...inp, resize: "vertical" }}
              />
            </Field>

            <Field label="MATERIALS / MEDIUM (SHORT)">
              <input
                value={form.materials} onChange={e => updateField("materials", e.target.value)}
                placeholder="Oil & 24k Gold on Linen" style={inp}
              />
            </Field>
          </FieldGroup>

          <FieldGroup title="THE STORY">
            <Field label="ABOUT THE ART">
              <textarea
                value={form.aboutArt} onChange={e => updateField("aboutArt", e.target.value)}
                placeholder="Marries the patience of classical gold-leaf gilding with the bold flatness of post-minimalist abstraction…"
                rows={4} style={{ ...inp, resize: "vertical" }}
              />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="ORIGIN">
                <textarea
                  value={form.origin} onChange={e => updateField("origin", e.target.value)}
                  placeholder="Berlin, Germany — completed at Mitte studio…"
                  rows={3} style={{ ...inp, resize: "vertical" }}
                />
              </Field>
              <Field label="PURPOSE">
                <textarea
                  value={form.purpose} onChange={e => updateField("purpose", e.target.value)}
                  placeholder="Created as the centrepiece of a private 2024 commission…"
                  rows={3} style={{ ...inp, resize: "vertical" }}
                />
              </Field>
            </div>
            <Field label="STORY BEHIND">
              <textarea
                value={form.storyBehind} onChange={e => updateField("storyBehind", e.target.value)}
                placeholder="Begun on the winter solstice. One hour of natural daylight per day to apply gold leaf…"
                rows={4} style={{ ...inp, resize: "vertical" }}
              />
            </Field>
            <Field label="SPREAD & ACCEPTED">
              <textarea
                value={form.spreadAccepted} onChange={e => updateField("spreadAccepted", e.target.value)}
                placeholder="Held in 12 private collections across Berlin, London, NY and HK. Featured in the 2024 monograph…"
                rows={3} style={{ ...inp, resize: "vertical" }}
              />
            </Field>
          </FieldGroup>

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

          <button type="submit" className="btn-primary" style={{ width: "100%" }}>
            INITIALIZE MINT &amp; LIST
          </button>
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
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", marginTop: 4,
                    color: p.status === "SOLD" ? "rgba(200,191,160,0.45)" : "#D4AF37" }}>
                    {p.status}
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

function FieldGroup({ title, children }) {
  return (
    <div style={{
      padding: "20px 22px 6px",
      marginBottom: 22,
      border: "1px solid rgba(212,175,55,0.12)",
      borderRadius: 10,
      background: "rgba(255,255,255,0.015)",
    }}>
      <div style={{
        fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.22em",
        color: "#D4AF37",
        marginBottom: 18,
        paddingBottom: 10,
        borderBottom: "1px solid rgba(212,175,55,0.15)",
      }}>{title}</div>
      {children}
    </div>
  );
}
