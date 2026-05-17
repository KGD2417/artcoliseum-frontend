import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ART_TYPES = ["Oil on Canvas", "Acrylic", "Watercolor", "Mixed Media", "Sculpture", "Photography", "Digital Art", "Charcoal", "Pastel", "Ink", "Tempera", "Fresco", "Other"];
const ART_STYLES = ["Abstract", "Realism", "Impressionism", "Surrealism", "Expressionism", "Minimalism", "Pop Art", "Contemporary", "Traditional", "Folk", "Other"];
const EXHIBITION_TYPES = [
  { id: "solo", label: "Solo Exhibition", desc: "Showcase your complete vision — an entire exhibition of your works, curated by Art Coliseum specialists." },
  { id: "group", label: "Group Exhibition", desc: "Join a curated group of artists around a shared theme, medium, or cultural narrative." },
  { id: "competition", label: "Art Competition", desc: "Submit your best work for our juried competition. Cash prizes, acquisition opportunities, and critical recognition." },
  { id: "online", label: "Online Exhibition", desc: "A fully digital exhibition with AR integration, reaching collectors across the globe." },
];

const STEPS = [
  { num: 1, label: "Your Profile", icon: "◈" },
  { num: 2, label: "Choose Exhibition", icon: "◆" },
  { num: 3, label: "Your Artwork", icon: "✦" },
  { num: 4, label: "Artwork Details", icon: "✳" },
  { num: 5, label: "Review & Submit", icon: "◉" },
];

function StepIndicator({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 52, gap: 0 }}>
      {STEPS.map((step, i) => (
        <div key={step.num} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, position: "relative" }}>
            <motion.div
              animate={{
                background: current >= step.num ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "rgba(255,255,255,0.04)",
                borderColor: current >= step.num ? "#D4AF37" : "rgba(212,175,55,0.2)",
              }}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "1px solid",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Cinzel',serif", fontSize: 11, fontWeight: 700,
                color: current >= step.num ? "#111" : "rgba(200,191,160,0.35)",
              }}>
              {current > step.num ? "✓" : step.num}
            </motion.div>
            <span style={{
              fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.1em",
              color: current >= step.num ? "#D4AF37" : "rgba(200,191,160,0.3)",
              whiteSpace: "nowrap",
            }}>{step.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              width: 48, height: 1, margin: "0 4px", marginBottom: 22,
              background: current > step.num ? "rgba(212,175,55,0.6)" : "rgba(212,175,55,0.15)",
              transition: "background 0.4s",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 8 }}>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", required }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%", padding: "11px 14px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: 8, color: "#e8e0d0",
          fontFamily: "'Raleway',sans-serif", fontSize: 13,
          outline: "none",
        }}
        onFocus={e => (e.target.style.borderColor = "rgba(212,175,55,0.55)")}
        onBlur={e => (e.target.style.borderColor = "rgba(212,175,55,0.2)")}
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: "100%", padding: "11px 14px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: 8, color: "#e8e0d0",
          fontFamily: "'Raleway',sans-serif", fontSize: 13,
          outline: "none", resize: "vertical",
        }}
        onFocus={e => (e.target.style.borderColor = "rgba(212,175,55,0.55)")}
        onBlur={e => (e.target.style.borderColor = "rgba(212,175,55,0.2)")}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: "100%", padding: "11px 14px",
          background: "#111", border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: 8, color: value ? "#e8e0d0" : "rgba(200,191,160,0.4)",
          fontFamily: "'Raleway',sans-serif", fontSize: 13,
          outline: "none", cursor: "pointer",
        }}>
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TagInput({ label, tags, onAdd, onRemove, placeholder }) {
  const [input, setInput] = useState("");
  const add = () => {
    const val = input.trim().replace(/^#/, "");
    if (val && !tags.includes(val)) { onAdd(val); setInput(""); }
  };
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {tags.map(tag => (
          <span key={tag} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 10px", borderRadius: 999,
            background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)",
            fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "#D4AF37",
          }}>
            #{tag}
            <button onClick={() => onRemove(tag)} style={{ background: "none", border: "none", color: "rgba(212,175,55,0.6)", cursor: "pointer", padding: "0 0 0 2px", fontSize: 12, lineHeight: 1 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={placeholder || "Add a tag…"}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          style={{
            flex: 1, padding: "9px 14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: 8, color: "#e8e0d0",
            fontFamily: "'Raleway',sans-serif", fontSize: 13, outline: "none",
          }}
        />
        <button onClick={add} style={{
          padding: "9px 16px", background: "rgba(212,175,55,0.12)",
          border: "1px solid rgba(212,175,55,0.3)", borderRadius: 8,
          color: "#D4AF37", fontFamily: "'Cinzel',serif", fontSize: 9,
          letterSpacing: "0.14em", cursor: "pointer",
        }}>ADD</button>
      </div>
    </div>
  );
}

export default function Exhibition() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Step 1 – Profile
  const [profile, setProfile] = useState({
    name: "", email: "", phone: "", city: "", country: "India",
    bio: "", website: "", instagram: "", yearsActive: "",
  });

  // Step 2 – Exhibition type
  const [exhibType, setExhibType] = useState("");

  // Step 3 – Artwork upload (simulated)
  const [artFile, setArtFile] = useState(null);
  const [artPreview, setArtPreview] = useState(null);

  // Step 4 – Artwork details
  const [art, setArt] = useState({
    title: "", type: "", style: "", year: "", dimensions: "",
    medium: "", description: "", price: "", forSale: "Yes",
    tags: [], inspiration: "", technique: "", edition: "Unique",
  });

  const setAP = (key) => (e) => setProfile(p => ({ ...p, [key]: e.target.value }));
  const setAA = (key) => (e) => setArt(a => ({ ...a, [key]: e.target.value }));

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setArtFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setArtPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const canProceed = () => {
    if (step === 1) return profile.name && profile.email && profile.bio;
    if (step === 2) return !!exhibType;
    if (step === 3) return !!artPreview;
    if (step === 4) return art.title && art.type && art.description;
    return true;
  };

  const next = () => { if (canProceed()) setStep(s => Math.min(5, s + 1)); };
  const back = () => setStep(s => Math.max(1, s - 1));
  const submit = () => setSubmitted(true);

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 24px" }}>
        <motion.div
          style={{ textAlign: "center", maxWidth: 560 }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <motion.div
            style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 32px" }}
            animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}>
            ✓
          </motion.div>
          <div className="gold-rule" style={{ justifyContent: "center", marginBottom: 20 }}>
            <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#4ade80)" }} />
            <span className="grt" style={{ color: "#4ade80" }}>SUBMISSION RECEIVED</span>
            <div className="grl" style={{ background: "linear-gradient(90deg,#4ade80,transparent)" }} />
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(32px,5vw,52px)", fontWeight: 400, color: "#fff", marginBottom: 16 }}>
            Welcome to the <em style={{ color: "#D4AF37" }}>Exhibition</em>
          </h2>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.65)", lineHeight: 1.8, marginBottom: 32 }}>
            {profile.name}, your submission has been received. Our curatorial team will review{" "}
            <em style={{ color: "#D4AF37" }}>"{art.title}"</em> and get back to you at {profile.email} within 5 business days.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/")} className="btn-primary" style={{ padding: "14px 28px", fontSize: 11 }}>
              RETURN HOME →
            </button>
            <button onClick={() => { setStep(1); setSubmitted(false); setProfile({ name: "", email: "", phone: "", city: "", country: "India", bio: "", website: "", instagram: "", yearsActive: "" }); setExhibType(""); setArtFile(null); setArtPreview(null); setArt({ title: "", type: "", style: "", year: "", dimensions: "", medium: "", description: "", price: "", forSale: "Yes", tags: [], inspiration: "", technique: "", edition: "Unique" }); }} className="btn-secondary" style={{ padding: "14px 28px", fontSize: 11 }}>
              SUBMIT ANOTHER WORK
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#080808", padding: "100px 24px 80px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>

        {/* Header */}
        <motion.div style={{ textAlign: "center", marginBottom: 52 }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="gold-rule" style={{ justifyContent: "center", marginBottom: 20 }}>
            <div className="grl" style={{ background: "linear-gradient(90deg,transparent,#D4AF37)" }} />
            <span className="grt">ARTIST EXHIBITION</span>
            <div className="grl" style={{ background: "linear-gradient(90deg,#D4AF37,transparent)" }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(38px,5vw,64px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, marginBottom: 12 }}>
            Join the <em style={{ color: "#D4AF37" }}>Exhibition</em>
          </h1>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.6)", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
            Set up your artist profile, choose an exhibition or competition, and submit your work to be seen by collectors across the world.
          </p>
        </motion.div>

        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
            style={{
              background: "rgba(255,255,255,0.018)",
              border: "1px solid rgba(212,175,55,0.15)",
              borderRadius: 20, padding: "40px 44px",
            }}>

            {/* ── STEP 1: Profile ── */}
            {step === 1 && (
              <div>
                <StepHeading num={1} title="Your Artist Profile" sub="Tell us who you are. This forms the foundation of your exhibition presence." />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <Input label="FULL NAME *" value={profile.name} onChange={setAP("name")} placeholder="Your full name" required />
                  <Input label="EMAIL ADDRESS *" value={profile.email} onChange={setAP("email")} placeholder="you@example.com" type="email" required />
                  <Input label="PHONE NUMBER" value={profile.phone} onChange={setAP("phone")} placeholder="+91 …" />
                  <Input label="CITY" value={profile.city} onChange={setAP("city")} placeholder="Mumbai, Delhi, etc." />
                  <Input label="YEARS ACTIVE AS ARTIST" value={profile.yearsActive} onChange={setAP("yearsActive")} placeholder="e.g. 8" type="number" />
                  <Input label="WEBSITE" value={profile.website} onChange={setAP("website")} placeholder="https://yoursite.com" />
                  <Input label="INSTAGRAM HANDLE" value={profile.instagram} onChange={setAP("instagram")} placeholder="@yourusername" />
                </div>
                <div style={{ marginTop: 18 }}>
                  <Textarea label="ARTIST BIO *" value={profile.bio} onChange={setAP("bio")} placeholder="Write a short biography — your background, influences, and artistic philosophy (min 80 words)…" rows={5} />
                </div>
              </div>
            )}

            {/* ── STEP 2: Exhibition Type ── */}
            {step === 2 && (
              <div>
                <StepHeading num={2} title="Choose Your Exhibition" sub="Select the format that best fits your work and ambitions." />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {EXHIBITION_TYPES.map(({ id, label, desc }) => (
                    <motion.div
                      key={id}
                      onClick={() => setExhibType(id)}
                      whileHover={{ borderColor: "rgba(212,175,55,0.5)" }}
                      style={{
                        padding: "24px 22px", borderRadius: 14, cursor: "pointer",
                        border: `1px solid ${exhibType === id ? "#D4AF37" : "rgba(212,175,55,0.18)"}`,
                        background: exhibType === id ? "rgba(212,175,55,0.06)" : "rgba(255,255,255,0.02)",
                        transition: "all 0.2s",
                      }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.1em", color: exhibType === id ? "#D4AF37" : "#e8e0d0", fontWeight: 600 }}>{label}</div>
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%",
                          border: `2px solid ${exhibType === id ? "#D4AF37" : "rgba(212,175,55,0.2)"}`,
                          background: exhibType === id ? "#D4AF37" : "transparent",
                          flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {exhibType === id && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#111" }} />}
                        </div>
                      </div>
                      <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.6)", lineHeight: 1.6, margin: 0 }}>{desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3: Artwork Upload ── */}
            {step === 3 && (
              <div>
                <StepHeading num={3} title="Upload Your Artwork" sub="High-resolution image of the work you wish to exhibit. JPEG or PNG, minimum 3000px on the long edge." />
                {!artPreview ? (
                  <label style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 16, padding: "60px 40px",
                    border: "1px dashed rgba(212,175,55,0.35)", borderRadius: 16,
                    cursor: "pointer", background: "rgba(212,175,55,0.02)",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(212,175,55,0.05)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(212,175,55,0.02)")}>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                    <div style={{ fontSize: 40, opacity: 0.4 }}>🖼️</div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: "#f0e8d8", marginBottom: 8 }}>
                        <em style={{ color: "#D4AF37" }}>Choose image</em> or drag here
                      </p>
                      <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.45)" }}>JPEG, PNG, TIFF · Max 50MB</p>
                    </div>
                  </label>
                ) : (
                  <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(212,175,55,0.3)" }}>
                    <img src={artPreview} alt="Artwork preview" style={{ width: "100%", maxHeight: 420, objectFit: "contain", display: "block", background: "#0a0a0a" }} />
                    <div style={{ position: "absolute", bottom: 12, right: 12 }}>
                      <label style={{ padding: "8px 16px", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 999, color: "#D4AF37", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", cursor: "pointer" }}>
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                        CHANGE IMAGE
                      </label>
                    </div>
                  </div>
                )}
                {artFile && (
                  <p style={{ marginTop: 12, fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.45)" }}>
                    {artFile.name} · {(artFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                )}
              </div>
            )}

            {/* ── STEP 4: Artwork Details ── */}
            {step === 4 && (
              <div>
                <StepHeading num={4} title="Artwork Details" sub="The more context you provide, the better curators can place your work." />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <Input label="ARTWORK TITLE *" value={art.title} onChange={setAA("title")} placeholder="The name of your work" required />
                  <Input label="YEAR OF CREATION *" value={art.year} onChange={setAA("year")} placeholder="2024" type="number" />
                  <Select label="ART TYPE *" value={art.type} onChange={setAA("type")} options={ART_TYPES} />
                  <Select label="ART STYLE" value={art.style} onChange={setAA("style")} options={ART_STYLES} />
                  <Input label="MEDIUM / MATERIALS" value={art.medium} onChange={setAA("medium")} placeholder="e.g. Oil on linen, 24k gold leaf" />
                  <Input label="DIMENSIONS (cm)" value={art.dimensions} onChange={setAA("dimensions")} placeholder="e.g. 90 × 70 cm" />
                  <Select label="FOR SALE?" value={art.forSale} onChange={setAA("forSale")} options={["Yes", "No", "Price on request"]} />
                  {art.forSale === "Yes" && <Input label="ASKING PRICE (₹)" value={art.price} onChange={setAA("price")} placeholder="e.g. 45000" type="number" />}
                  <Select label="EDITION" value={art.edition} onChange={setAA("edition")} options={["Unique", "Limited Edition", "Open Edition"]} />
                </div>
                <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 18 }}>
                  <Textarea label="ARTWORK DESCRIPTION *" value={art.description} onChange={setAA("description")} placeholder="Describe the work — its subject, composition, emotional intent, and what makes it significant…" rows={4} />
                  <Textarea label="INSPIRATION & CONCEPT" value={art.inspiration} onChange={setAA("inspiration")} placeholder="What inspired this piece? What ideas, places, people, or events drove its creation?" rows={3} />
                  <Textarea label="TECHNIQUE & PROCESS" value={art.technique} onChange={setAA("technique")} placeholder="Describe your technique — how long did it take? What process did you use?" rows={3} />
                  <TagInput
                    label="ARTWORK TAGS"
                    tags={art.tags}
                    onAdd={(tag) => setArt(a => ({ ...a, tags: [...a.tags, tag] }))}
                    onRemove={(tag) => setArt(a => ({ ...a, tags: a.tags.filter(t => t !== tag) }))}
                    placeholder="Add tags like: landscape, gold, abstract…"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 5: Review ── */}
            {step === 5 && (
              <div>
                <StepHeading num={5} title="Review & Submit" sub="Confirm your details before final submission." />
                <div style={{ display: "grid", gridTemplateColumns: artPreview ? "1fr 1fr" : "1fr", gap: 32, marginBottom: 28 }}>
                  {artPreview && (
                    <div>
                      <FieldLabel>SUBMITTED ARTWORK</FieldLabel>
                      <img src={artPreview} alt="" style={{ width: "100%", borderRadius: 12, border: "1px solid rgba(212,175,55,0.2)", display: "block" }} />
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <ReviewBlock label="ARTIST" value={profile.name} sub={profile.email} />
                    <ReviewBlock label="EXHIBITION TYPE" value={EXHIBITION_TYPES.find(e => e.id === exhibType)?.label} />
                    <ReviewBlock label="ARTWORK" value={art.title} sub={`${art.type} · ${art.dimensions}`} />
                    <ReviewBlock label="MEDIUM" value={art.medium || "—"} />
                    {art.tags.length > 0 && (
                      <div>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.16em", color: "rgba(200,191,160,0.45)", marginBottom: 6 }}>TAGS</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {art.tags.map(tag => (
                            <span key={tag} style={{ padding: "3px 10px", background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 999, fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "#D4AF37" }}>#{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {art.description && (
                      <div>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.16em", color: "rgba(200,191,160,0.45)", marginBottom: 6 }}>DESCRIPTION</div>
                        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.65)", lineHeight: 1.6, margin: 0 }}>{art.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ padding: "16px 20px", background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 10, marginBottom: 24 }}>
                  <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.6)", lineHeight: 1.7, margin: 0 }}>
                    By submitting, you confirm that this is your original work, that you hold all rights to the image and artwork, and that you agree to Art Coliseum's exhibition terms and conditions. Our curatorial team will review your submission and contact you within 5 business days.
                  </p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, gap: 12 }}>
          <motion.button
            onClick={back}
            disabled={step === 1}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{
              padding: "14px 28px", borderRadius: 999,
              border: "1px solid rgba(212,175,55,0.3)",
              background: "transparent", color: step === 1 ? "rgba(200,191,160,0.25)" : "#e8e0d0",
              fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em",
              cursor: step === 1 ? "default" : "pointer",
            }}>
            ← BACK
          </motion.button>

          {step < 5 ? (
            <motion.button
              onClick={next}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{
                padding: "14px 36px", borderRadius: 999,
                background: canProceed() ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "rgba(212,175,55,0.12)",
                border: "none", color: canProceed() ? "#111" : "rgba(200,191,160,0.35)",
                fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em",
                fontWeight: 700, cursor: canProceed() ? "pointer" : "default",
                transition: "all 0.2s",
              }}>
              CONTINUE →
            </motion.button>
          ) : (
            <motion.button
              onClick={submit}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{
                padding: "14px 36px", borderRadius: 999,
                background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                border: "none", color: "#111",
                fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em",
                fontWeight: 700, cursor: "pointer",
                boxShadow: "0 8px 30px rgba(212,175,55,0.3)",
              }}>
              SUBMIT EXHIBITION →
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepHeading({ num, title, sub }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: "rgba(212,175,55,0.5)", fontStyle: "italic" }}>0{num}</span>
        <div style={{ height: 1, flex: 1, background: "rgba(212,175,55,0.15)" }} />
      </div>
      <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 400, color: "#fff", marginBottom: 8 }}>{title}</h2>
      <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.55)", lineHeight: 1.6 }}>{sub}</p>
    </div>
  );
}

function ReviewBlock({ label, value, sub }) {
  return (
    <div>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.16em", color: "rgba(200,191,160,0.45)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#f0e8d8" }}>{value || "—"}</div>
      {sub && <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.45)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
