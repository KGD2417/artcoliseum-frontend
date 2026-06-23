import { useEffect, useState } from "react";
import { intRange, minLen } from "../utils/validation";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/Auth";
import { Skeleton, SkeletonRows } from "../components/ui/Skeleton";
import MediaUploader from "../components/ui/MediaUploader";
import ArtworkForm from "../components/ArtworkForm";
import { isThreeD, composeDims } from "../utils/dimensions";
import { dimsToCm, toCm } from "../utils/units";
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
const inputStyle = {
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
const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

const fieldErr = {
  fontFamily: "'Raleway',sans-serif",
  fontSize: 12,
  color: "#f87171",
  marginTop: -8,
  marginBottom: 12,
  display: "flex",
  alignItems: "center",
  gap: 5,
};

function Field({ l, children, error }) {
  return (
    <div>
      <span style={label}>{l}</span>
      {children}
      {error && (
        <div style={fieldErr}>
          <span aria-hidden>⚠</span>
          {error}
        </div>
      )}
    </div>
  );
}

export default function ArtistPortal() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null); // { artist_status, role }

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/signin");
      return;
    }
    api.artist
      .status()
      .then(setStatus)
      .catch(() => setStatus({ artist_status: "none", role: "user" }));
  }, [user, loading]);

  if (loading || !status)
    return (
      <section
        style={{ padding: "110px 24px 60px", maxWidth: 980, margin: "0 auto" }}>
        <Skeleton width={120} height={12} />
        <Skeleton
          width={320}
          height={36}
          radius={8}
          style={{ marginTop: 10, marginBottom: 28 }}
        />
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
    <section
      style={{ padding: "110px 24px 80px", maxWidth: 880, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: 24 }}>
        <div
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: gold,
          }}>
          ARTIST STUDIO
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 44,
            fontWeight: 700,
            color: "#fff",
            marginTop: 6,
          }}>
          {isWaiting
            ? "Application Received"
            : isRejected
              ? "Application Update"
              : "Become an Artist"}
        </h1>
      </motion.div>

      <ApplyStepper status={st} />

      <div style={{ marginTop: 26 }}>
        {(st === "none" || isRejected) && (
          <>
            {isRejected && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "14px 18px",
                  borderRadius: 10,
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.3)",
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 13,
                  color: "#fca5a5",
                  lineHeight: 1.6,
                }}>
                Your previous application wasn't approved.
                {status.rejection_reason ? (
                  <>
                    {" "}
                    <strong style={{ color: "#fecaca" }}>Reason:</strong>{" "}
                    {status.rejection_reason}
                  </>
                ) : (
                  ""
                )}
                <div style={{ marginTop: 6, color: "rgba(252,165,165,0.85)" }}>
                  You're welcome to refine your details below and apply again.
                </div>
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
  {
    key: "review",
    label: "Under Review",
    sub: "Our team approves your studio",
  },
  { key: "studio", label: "Your Studio", sub: "Publish & sell your work" },
];

function ApplyStepper({ status }) {
  const activeIdx =
    status === "verified"
      ? 2
      : status === "pending" || status === "unverified"
        ? 1
        : 0;
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {APPLY_STEPS.map((s, i) => {
        const state =
          i < activeIdx ? "done" : i === activeIdx ? "active" : "locked";
        const color =
          state === "done"
            ? "#4ade80"
            : state === "active"
              ? gold
              : "rgba(200,191,160,0.35)";
        return (
          <div
            key={s.key}
            style={{
              flex: 1,
              padding: "14px 16px",
              borderRadius: 12,
              border: `1px solid ${state === "active" ? gold : "rgba(212,175,55,0.18)"}`,
              background:
                state === "active"
                  ? "rgba(212,175,55,0.07)"
                  : "rgba(255,255,255,0.02)",
              opacity: state === "locked" ? 0.6 : 1,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    state === "locked" ? "rgba(212,175,55,0.12)" : color,
                  color: state === "locked" ? "rgba(200,191,160,0.5)" : "#111",
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                {state === "done" ? "✓" : i + 1}
              </div>
              <div
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  color,
                }}>
                {s.label.toUpperCase()}
              </div>
            </div>
            <div
              style={{
                fontFamily: "'Raleway',sans-serif",
                fontSize: 11,
                color: "rgba(200,191,160,0.55)",
                marginTop: 6,
              }}>
              {s.sub}
            </div>
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
      <div
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: 28,
          color: "#fff",
          marginBottom: 10,
        }}>
        Thanks — your application is in review
      </div>
      <p
        style={{
          fontFamily: "'Raleway',sans-serif",
          fontSize: 14,
          color: "rgba(200,191,160,0.7)",
          lineHeight: 1.7,
          maxWidth: 520,
          margin: "0 auto",
        }}>
        An Art Coliseum curator will review your details shortly. Once you're
        approved, your studio unlocks here and you can start uploading work for
        sale. We'll keep this page updated — check back soon.
      </p>
    </div>
  );
}

function KycForm({ onApplied }) {
  const [f, setF] = useState({
    name: "",
    age: "",
    art_type: "",
    location: "",
    about: "",
    gender: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  // "form" → fill in details, "review" → confirm before submitting.
  const [step, setStep] = useState("form");
  const set = (k) => (e) => {
    setF((p) => ({ ...p, [k]: e.target.value }));
    // Clear a field's error as soon as the user starts correcting it.
    setErrors((p) => (p[k] ? { ...p, [k]: "" } : p));
  };
  // Highlight an input's border when its field has an error.
  const errInput = (k) =>
    errors[k]
      ? { ...inputStyle, borderColor: "#f87171", background: "rgba(248,113,113,0.06)" }
      : inputStyle;
  // You're already a user — prefill name (and location) from your profile.
  useEffect(() => {
    api.auth
      .me()
      .then((m) =>
        setF((p) => ({
          ...p,
          name: p.name || m?.full_name || "",
          location:
            p.location ||
            (m?.addresses?.find((a) => a.is_default) || m?.addresses?.[0])
              ?.city ||
            "",
        })),
      )
      .catch(() => {});
  }, []);
  const validate = () => {
    const errs = {};
    if (!f.name.trim()) errs.name = "Your name is required.";
    if (!f.art_type.trim())
      errs.art_type = "Tell us what kind of artist you are.";
    if (f.age) {
      const ageErr = intRange(16, 100, "Age")(f.age);
      if (ageErr) errs.age = ageErr;
    }
    errs.about = !f.about.trim()
      ? "Tell us a bit about yourself."
      : minLen(20, "About you")(f.about);
    if (!errs.about) delete errs.about;
    return errs;
  };
  // Validate, then move to the review step instead of submitting straight away.
  const goReview = () => {
    setFormError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStep("review");
  };
  const submit = async () => {
    setFormError("");
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setStep("form");
      return;
    }
    setBusy(true);
    try {
      const s = await api.artist.apply({
        ...f,
        age: f.age ? Number(f.age) : null,
        avatar_url: avatar,
      });
      onApplied(s);
    } catch (e) {
      setFormError(e.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div style={card}>
      <p
        style={{
          fontFamily: "'Raleway',sans-serif",
          fontSize: 13,
          color: "rgba(200,191,160,0.7)",
          lineHeight: 1.7,
          marginBottom: 20,
        }}>
        Tell us about yourself and your practice. Once you apply, an Art
        Coliseum curator reviews your details. After you're{" "}
        <strong style={{ color: gold }}>approved</strong>, your studio unlocks
        and you can publish work for sale.
      </p>
      {formError && (
        <div
          style={{
            marginBottom: 18,
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.35)",
            fontFamily: "'Raleway',sans-serif",
            fontSize: 13,
            color: "#fca5a5",
          }}>
          {formError}
        </div>
      )}
      {step === "form" ? (
        <>
          <Field l="FULL NAME" error={errors.name}>
            <input style={errInput("name")} value={f.name} onChange={set("name")} />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
            }}>
            <Field l="AGE" error={errors.age}>
              <input
                style={errInput("age")}
                type="number"
                min="16"
                max="100"
                value={f.age}
                onChange={set("age")}
              />
            </Field>
            <Field l="GENDER">
              <select style={inputStyle} value={f.gender} onChange={set("gender")}>
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field l="WHERE YOU LIVE">
              <input
                style={inputStyle}
                value={f.location}
                onChange={set("location")}
              />
            </Field>
          </div>
          <Field l="WHAT KIND OF ARTIST ARE YOU?" error={errors.art_type}>
            <input
              style={errInput("art_type")}
              value={f.art_type}
              onChange={set("art_type")}
              placeholder="e.g. Oil painter, Sculptor"
            />
          </Field>
          <Field l="ABOUT YOU" error={errors.about}>
            <textarea
              style={{ ...errInput("about"), minHeight: 90 }}
              value={f.about}
              onChange={set("about")}
            />
          </Field>
          <Field l="PROFILE PHOTO (OPTIONAL)">
            <MediaUploader
              kind="image"
              hint="UPLOAD PHOTO"
              value={avatar}
              onChange={setAvatar}
            />
          </Field>
          <button style={btn} onClick={goReview}>
            REVIEW DETAILS →
          </button>
        </>
      ) : (
        <>
          <p
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 13,
              color: gold,
              marginBottom: 14,
            }}>
            Please review your details. Go back to edit anything, or submit when
            it all looks right.
          </p>
          {avatar && (
            <img
              src={avatar}
              alt=""
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid rgba(212,175,55,0.3)",
                marginBottom: 14,
              }}
            />
          )}
          {[
            ["Full name", f.name],
            ["Age", f.age || "—"],
            ["Gender", f.gender || "—"],
            ["Where you live", f.location || "—"],
            ["Kind of artist", f.art_type],
            ["About you", f.about],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                display: "flex",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid rgba(212,175,55,0.1)",
              }}>
              <div
                style={{
                  flex: "0 0 130px",
                  fontFamily: "'Cinzel',serif",
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  color: "rgba(200,191,160,0.55)",
                  textTransform: "uppercase",
                }}>
                {k}
              </div>
              <div
                style={{
                  flex: 1,
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 13,
                  color: "#f0e8d8",
                  whiteSpace: "pre-wrap",
                }}>
                {v || "—"}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              style={{
                ...btn,
                flex: "0 0 auto",
                background: "transparent",
                border: "1px solid rgba(212,175,55,0.4)",
                color: gold,
              }}
              disabled={busy}
              onClick={() => setStep("form")}>
              ← BACK / EDIT
            </button>
            <button
              style={{ ...btn, flex: 1, opacity: busy ? 0.7 : 1 }}
              disabled={busy}
              onClick={submit}>
              {busy ? "SUBMITTING…" : "CONFIRM & SUBMIT"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════ STUDIO DASHBOARD (approved artists) ═══════════════ */
const STUDIO_TABS = [
  ["overview", "Overview"],
  ["upload", "Upload Artwork"],
  ["works", "My Artworks"],
  ["orders", "Orders"],
  ["exhibition", "Exhibition"],
  ["profile", "Profile"],
];

function StudioDashboard() {
  const [tab, setTab] = useState("overview");
  const [works, setWorks] = useState([]);
  const loadWorks = () =>
    api.artist
      .myArtworks()
      .then(setWorks)
      .catch(() => setWorks([]));
  useEffect(() => {
    loadWorks();
  }, []);

  return (
    <section
      style={{ padding: "110px 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: 22 }}>
        <div
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: gold,
          }}>
          ARTIST STUDIO
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 44,
            fontWeight: 700,
            color: "#fff",
            marginTop: 6,
          }}>
          Your Studio
        </h1>
      </motion.div>

      {/* Tab pills */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
        {STUDIO_TABS.map(([id, lbl]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              cursor: "pointer",
              fontFamily: "'Cinzel',serif",
              fontSize: 10,
              letterSpacing: "0.14em",
              background:
                tab === id
                  ? "linear-gradient(135deg,#D4AF37,#e8c53a)"
                  : "transparent",
              color: tab === id ? "#111" : "rgba(200,191,160,0.7)",
              border: tab === id ? "none" : "1px solid rgba(212,175,55,0.25)",
            }}>
            {lbl.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview works={works} onGo={setTab} />}
      {tab === "upload" && (
        <ArtworkForm
          onSubmit={(payload) => api.artist.createArtwork(payload)}
          onDone={loadWorks}
        />
      )}
      {tab === "works" && <MyArtworks rows={works} reload={loadWorks} />}
      {tab === "orders" && <ArtistOrders />}
      {tab === "exhibition" && <ArtistExhibitionPanel />}
      {tab === "profile" && <ProfilePanel />}
    </section>
  );
}

/* ───────────────── Orders / Sales ───────────────── */
const ORDER_STAGE_LABEL = {
  order_confirmed: "ORDER CONFIRMED",
  curation_crating: "IN PRODUCTION",
  dispatched: "DISPATCHED",
  out_for_delivery: "OUT FOR DELIVERY",
  installation: "INSTALLATION",
  delivered: "DELIVERED",
};

function ArtistOrders() {
  const [orders, setOrders] = useState(null);   // null = loading
  const [pickup, setPickup] = useState(null);   // null = loading

  const loadOrders = () => api.artist.orders().then(setOrders).catch(() => setOrders([]));
  const loadPickup = () => api.artist.pickupAddress().then(setPickup).catch(() => setPickup({}));

  useEffect(() => { loadOrders(); loadPickup(); }, []);

  const pickupSet = !!(pickup && pickup.line1 && pickup.city && pickup.zip && pickup.phone);

  return (
    <div>
      <PickupAddressCard pickup={pickup} pickupSet={pickupSet} onSaved={setPickup} />

      {orders === null ? (
        <SkeletonRows count={3} height={120} gap={14} />
      ) : orders.length === 0 ? (
        <div style={{ ...card, textAlign: "center", color: "rgba(200,191,160,0.6)", fontFamily: "'Raleway',sans-serif", fontSize: 14 }}>
          No sales yet. When someone buys your work, it'll appear here with the buyer's
          shipping details so you can send it to them.
        </div>
      ) : (
        orders.map((o) => (
          <ArtistOrderCard key={o.order_item_id} order={o} pickupSet={pickupSet} onChanged={loadOrders} />
        ))
      )}
    </div>
  );
}

function PickupAddressCard({ pickup, pickupSet, onSaved }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", line1: "", line2: "", city: "", state: "", zip: "", country: "India" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (pickup) setF((p) => ({ ...p, ...pickup }));
  }, [pickup]);

  const save = async () => {
    setBusy(true);
    try {
      const saved = await api.artist.setPickupAddress({
        name: f.name, phone: f.phone, line1: f.line1, line2: f.line2 || null,
        city: f.city, state: f.state, zip: f.zip, country: f.country || "India",
      });
      onSaved(saved);
      setOpen(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ ...card, borderColor: pickupSet ? "rgba(212,175,55,0.18)" : "rgba(255,170,90,0.5)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <span style={label}>SHIP-FROM / PICKUP ADDRESS</span>
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.75)", marginTop: 4 }}>
            {pickupSet
              ? `${pickup.line1}, ${pickup.city} ${pickup.zip} · ${pickup.phone}`
              : "Set the address your artworks ship from — this is required before you can dispatch an order."}
          </div>
        </div>
        <button onClick={() => setOpen((v) => !v)} style={{ ...btn, padding: "10px 20px", fontSize: 11, background: open ? "transparent" : btn.background, color: open ? gold : "#111", border: open ? `1px solid ${gold}` : "none" }}>
          {open ? "CANCEL" : pickupSet ? "EDIT" : "SET ADDRESS"}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field l="FULL NAME"><input style={inputStyle} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field l="PHONE"><input style={inputStyle} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          </div>
          <Field l="ADDRESS LINE 1"><input style={inputStyle} value={f.line1} onChange={(e) => setF({ ...f, line1: e.target.value })} /></Field>
          <Field l="ADDRESS LINE 2 (OPTIONAL)"><input style={inputStyle} value={f.line2} onChange={(e) => setF({ ...f, line2: e.target.value })} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field l="CITY"><input style={inputStyle} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></Field>
            <Field l="STATE"><input style={inputStyle} value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })} /></Field>
            <Field l="PIN CODE"><input style={inputStyle} value={f.zip} onChange={(e) => setF({ ...f, zip: e.target.value })} inputMode="numeric" maxLength={6} /></Field>
          </div>
          <button onClick={save} disabled={busy || !(f.line1 && f.city && f.zip && f.phone)} style={{ ...btn, opacity: busy || !(f.line1 && f.city && f.zip && f.phone) ? 0.5 : 1 }}>
            {busy ? "SAVING…" : "SAVE ADDRESS"}
          </button>
        </div>
      )}
    </div>
  );
}

function ArtistOrderCard({ order: o, pickupSet, onChanged }) {
  const [busy, setBusy] = useState(false);
  const a = o.shipping_address || {};
  const isPickup = o.fulfillment === "self_pickup";

  // Fulfillment is a legal/shipping doc — always show the buyer's size in cm.
  const dims = dimsToCm([o.custom_width, o.custom_height, o.custom_depth], o.custom_unit);
  const opts = o.options || {};

  const dispatch = async () => {
    if (!pickupSet) { alert("Set your pickup address first."); return; }
    setBusy(true);
    try {
      await api.artist.dispatchOrder(o.order_item_id);
      onChanged();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={card}>
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
        {o.image && <img src={o.image} alt={o.title} style={{ width: 88, height: 88, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>{o.title}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: gold }}>{inr(o.price)}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
            <Tag>{(o.fulfillment || "").replace(/_/g, " ").toUpperCase()}</Tag>
            <Tag>{ORDER_STAGE_LABEL[o.delivery_stage] || o.order_status?.toUpperCase()}</Tag>
            {o.is_custom && <Tag amber>CUSTOM ORDER</Tag>}
          </div>

          {/* Custom spec the buyer requested */}
          {o.is_custom && (
            <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 8, background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.25)" }}>
              <span style={{ ...label, marginBottom: 8 }}>BUYER'S CUSTOM SPEC</span>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.85)" }}>
                {dims && <span>Size: <strong style={{ color: "#fff" }}>{dims}</strong></span>}
                {opts.frame && <span>Frame: <strong style={{ color: "#fff" }}>{opts.frame}</strong></span>}
                {opts.finish && <span>Finish: <strong style={{ color: "#fff" }}>{opts.finish}</strong></span>}
                {opts.palette && <span>Palette: <strong style={{ color: "#fff" }}>{opts.palette}</strong></span>}
              </div>
            </div>
          )}

          {/* Ship-to */}
          <div style={{ marginTop: 12 }}>
            <span style={{ ...label, marginBottom: 6 }}>{isPickup ? "BUYER (SELF-PICKUP)" : "SHIP TO"}</span>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.8)", lineHeight: 1.6 }}>
              <div style={{ color: "#fff" }}>{o.buyer_name} · {o.buyer_phone}</div>
              {!isPickup && (a.line1
                ? <div>{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.zip}, {a.country || "India"}</div>
                : <div style={{ color: "rgba(200,191,160,0.5)" }}>No address on file.</div>)}
            </div>
          </div>

          {/* Action / status */}
          <div style={{ marginTop: 14 }}>
            {isPickup ? (
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12.5, color: "rgba(200,191,160,0.6)" }}>
                Buyer collects from the vault — no shipment needed from you.
              </div>
            ) : o.artist_dispatched ? (
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#4ade80" }}>
                ✓ Dispatched{o.artist_tracking?.courier ? ` · ${o.artist_tracking.courier}` : ""}
                {o.artist_tracking?.awb ? ` · ${o.artist_tracking.awb}` : ""}
              </div>
            ) : (
              <button onClick={dispatch} disabled={busy} style={{ ...btn, padding: "12px 24px", fontSize: 12, opacity: busy ? 0.6 : 1 }}>
                {busy ? "DISPATCHING…" : "SHIP TO BUYER →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Tag({ children, amber }) {
  return (
    <span style={{
      fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: "0.14em",
      padding: "4px 10px", borderRadius: 999,
      background: amber ? "rgba(212,175,55,0.16)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${amber ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.2)"}`,
      color: amber ? gold : "rgba(200,191,160,0.7)",
    }}>{children}</span>
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
          gap: 14,
          marginBottom: 20,
        }}>
        {cards.map(([l, v, c]) => (
          <div
            key={l}
            style={{
              padding: 18,
              border: "1px solid rgba(212,175,55,0.15)",
              borderRadius: 10,
              background: "rgba(255,255,255,0.02)",
            }}>
            <div
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 36,
                fontWeight: 700,
                color: c,
              }}>
              {v}
            </div>
            <div
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: 9,
                letterSpacing: "0.14em",
                color: "rgba(200,191,160,0.7)",
                marginTop: 4,
              }}>
              {l.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
      {rejected > 0 && (
        <div
          style={{
            marginBottom: 16,
            fontFamily: "'Raleway',sans-serif",
            fontSize: 13,
            color: "#fca5a5",
          }}>
          {rejected} work{rejected === 1 ? "" : "s"} need attention — see{" "}
          <button
            onClick={() => onGo("works")}
            style={{
              background: "none",
              border: "none",
              color: gold,
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
              fontFamily: "inherit",
              fontSize: "inherit",
            }}>
            My Artworks
          </button>
          .
        </div>
      )}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          style={{ ...btn, padding: "12px 22px" }}
          onClick={() => onGo("upload")}>
          + UPLOAD ARTWORK
        </button>
        <button
          style={{
            ...btn,
            padding: "12px 22px",
            background: "transparent",
            color: gold,
            border: `1px solid ${gold}`,
          }}
          onClick={() => onGo("exhibition")}>
          EXHIBITION
        </button>
      </div>
      <p
        style={{
          fontFamily: "'Raleway',sans-serif",
          fontSize: 12.5,
          color: "rgba(200,191,160,0.55)",
          lineHeight: 1.7,
          marginTop: 18,
        }}>
        Every artwork you upload is reviewed by our team before it appears in
        the public gallery. You'll see its status update here —{" "}
        <span style={{ color: "#fbbf24" }}>Pending</span> →{" "}
        <span style={{ color: "#4ade80" }}>Approved</span>.
      </p>
    </div>
  );
}


const STATUS_BADGE = {
  pending: {
    label: "PENDING APPROVAL",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.12)",
  },
  active: {
    label: "APPROVED · LIVE",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.12)",
  },
  rejected: {
    label: "REJECTED",
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
  },
  sold: { label: "SOLD", color: gold, bg: "rgba(212,175,55,0.12)" },
  draft: {
    label: "DRAFT",
    color: "rgba(200,191,160,0.7)",
    bg: "rgba(255,255,255,0.04)",
  },
};

// Verified artist's own works — list with status, quick-edit and delete.
function MyArtworks({ rows, reload }) {
  const [editing, setEditing] = useState(null);
  const del = async (id) => {
    if (confirm("Delete this artwork permanently?")) {
      await api.artist.deleteArtwork(id);
      reload();
    }
  };

  if (!rows || rows.length === 0)
    return (
      <div style={card}>
        <div
          style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 13,
            color: "rgba(200,191,160,0.6)",
          }}>
          You haven't uploaded any artworks yet.
        </div>
      </div>
    );
  return (
    <div style={card}>
      {rows.map((a) => {
        const badge = STATUS_BADGE[a.status] || STATUS_BADGE.draft;
        return (
          <div
            key={a.id}
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              padding: "12px 14px",
              marginBottom: 10,
              borderRadius: 10,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(212,175,55,0.15)",
            }}>
            <img
              src={(a.images && a.images[0]) || ""}
              alt=""
              style={{
                width: 54,
                height: 54,
                borderRadius: 6,
                objectFit: "cover",
                background: "rgba(212,175,55,0.1)",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 18,
                  color: "#fff",
                }}>
                {a.title}
              </div>
              <div
                style={{
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 12,
                  color: "rgba(200,191,160,0.6)",
                }}>
                {a.customizable ? "Customizable" : inr(a.price)} ·{" "}
                {a.category_id || "—"}
                {a.subtype_id ? ` / ${a.subtype_id}` : ""}
              </div>
              <span
                style={{
                  display: "inline-block",
                  marginTop: 5,
                  padding: "2px 9px",
                  borderRadius: 999,
                  fontFamily: "'Cinzel',serif",
                  fontSize: 8,
                  letterSpacing: "0.12em",
                  color: badge.color,
                  background: badge.bg,
                }}>
                {badge.label}
              </span>
              {a.status === "rejected" && a.rejection_reason && (
                <div
                  style={{
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 11,
                    color: "#fca5a5",
                    marginTop: 4,
                  }}>
                  Reason: {a.rejection_reason}
                </div>
              )}
            </div>
            <button
              onClick={() => setEditing(a)}
              style={{
                ...btn,
                padding: "8px 16px",
                background: "transparent",
                color: gold,
                border: `1px solid ${gold}`,
              }}>
              EDIT
            </button>
            <button
              onClick={() => del(a.id)}
              style={{
                ...btn,
                padding: "8px 16px",
                background: "transparent",
                color: "rgba(255,140,140,0.9)",
                border: "1px solid rgba(255,140,140,0.4)",
              }}>
              DELETE
            </button>
          </div>
        );
      })}
      {editing && (
        <EditArtwork
          artwork={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

function EditArtwork({ artwork, onClose, onSaved }) {
  const [f, setF] = useState({
    title: artwork.title || "",
    price: artwork.price || "",
    medium: artwork.medium || "",
    width: artwork.width ?? "",
    height: artwork.height ?? "",
    depth: artwork.depth ?? "",
    dim_unit: artwork.unit || "cm",
    price_per_unit: artwork.price_per_unit || "",
    customizable: artwork.customizable !== false,
    in_stock: artwork.in_stock !== false,
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const is3D = isThreeD(artwork.category_id) || artwork.depth != null;
  const composedDims = composeDims(
    f.width,
    f.height,
    is3D ? f.depth : "",
    f.dim_unit,
  );
  const save = async () => {
    setBusy(true);
    try {
      await api.artist.updateArtwork(artwork.id, {
        title: f.title,
        medium: f.medium,
        // Dimensions stored canonically in cm (the artist may edit in cm/in/ft).
        width: toCm(f.width, f.dim_unit),
        height: toCm(f.height, f.dim_unit),
        depth: is3D ? toCm(f.depth, f.dim_unit) : null,
        customizable: f.customizable,
        in_stock: f.in_stock,
        price: f.price !== "" ? Number(f.price) : null,
        price_per_unit:
          f.customizable && f.price_per_unit !== ""
            ? Number(f.price_per_unit)
            : null,
      });
      onSaved();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 7000,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          ...card,
          width: "100%",
          maxWidth: 460,
          marginBottom: 0,
          maxHeight: "85vh",
          overflowY: "auto",
        }}>
        <div
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 12,
            letterSpacing: "0.16em",
            color: gold,
            marginBottom: 16,
          }}>
          EDIT ARTWORK
        </div>
        <Field l="TITLE">
          <input style={inputStyle} value={f.title} onChange={set("title")} />
        </Field>
        <Field l="MEDIUM">
          <input style={inputStyle} value={f.medium} onChange={set("medium")} />
        </Field>
        <div
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 9,
            letterSpacing: "0.16em",
            color: "rgba(212,175,55,0.65)",
            margin: "2px 0 6px",
          }}>
          ARTWORK SIZE
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: is3D ? "1fr 1fr 1fr 0.8fr" : "1fr 1fr 0.8fr",
            gap: 10,
          }}>
          <Field l="WIDTH">
            <input
              style={inputStyle}
              type="number"
              min="0"
              value={f.width}
              onChange={set("width")}
            />
          </Field>
          <Field l="HEIGHT">
            <input
              style={inputStyle}
              type="number"
              min="0"
              value={f.height}
              onChange={set("height")}
            />
          </Field>
          {is3D && (
            <Field l="DEPTH/LEN">
              <input
                style={inputStyle}
                type="number"
                min="0"
                value={f.depth}
                onChange={set("depth")}
              />
            </Field>
          )}
          <Field l="UNIT">
            <select
              style={inputStyle}
              value={f.dim_unit}
              onChange={set("dim_unit")}>
              <option value="cm">cm</option>
              <option value="inch">inch</option>
              <option value="feet">feet</option>
            </select>
          </Field>
        </div>
        {composedDims && (
          <div
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 12,
              color: "rgba(200,191,160,0.55)",
              marginBottom: 12,
            }}>
            Shown as: <span style={{ color: gold }}>{composedDims}</span>
          </div>
        )}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
            cursor: "pointer",
            fontFamily: "'Raleway',sans-serif",
            fontSize: 13,
            color: "#e8e0d0",
          }}>
          <input
            type="checkbox"
            checked={f.customizable}
            onChange={(e) => setF({ ...f, customizable: e.target.checked })}
            style={{ accentColor: gold }}
          />{" "}
          Customizable (priced per unit)
        </label>
        {f.customizable ? (
          <Field l="PRICE PER UNIT">
            <input
              style={inputStyle}
              type="number"
              min="0"
              value={f.price_per_unit}
              onChange={set("price_per_unit")}
            />
          </Field>
        ) : (
          <Field l="PRICE">
            <input
              style={inputStyle}
              type="number"
              min="0"
              value={f.price}
              onChange={set("price")}
            />
          </Field>
        )}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            cursor: "pointer",
            fontFamily: "'Raleway',sans-serif",
            fontSize: 13,
            color: "#e8e0d0",
          }}>
          <input
            type="checkbox"
            checked={f.in_stock}
            onChange={(e) => setF({ ...f, in_stock: e.target.checked })}
            style={{ accentColor: gold }}
          />{" "}
          In stock / available
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{ ...btn, opacity: busy ? 0.7 : 1 }}
            disabled={busy}
            onClick={save}>
            {busy ? "SAVING…" : "SAVE CHANGES"}
          </button>
          <button
            style={{
              ...btn,
              background: "transparent",
              color: "rgba(200,191,160,0.7)",
              border: "1px solid rgba(212,175,55,0.25)",
            }}
            onClick={onClose}>
            CANCEL
          </button>
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
  const blankForm = {
    title: "",
    narrative: "",
    medium: "",
    category_id: "",
    price: "",
    width: "",
    height: "",
    depth: "",
    dim_unit: "cm",
  };
  const [f, setF] = useState(blankForm);
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [wbusy, setWbusy] = useState("");

  const loadMine = () =>
    api.exhibitions
      .mine()
      .then(setMine)
      .catch(() => setMine([]));
  useEffect(() => {
    api.exhibitions
      .current()
      .then(setEx)
      .catch(() => setEx(null));
    api.catalog
      .categories()
      .then(setCats)
      .catch(() => {});
    loadMine();
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const mains = cats.filter((c) => c.kind === "main");
  const is3D = isThreeD(f.category_id, cats);
  const composedDims = composeDims(
    f.width,
    f.height,
    is3D ? f.depth : "",
    f.dim_unit,
  );

  const submit = async () => {
    if (!f.title.trim()) return alert("Give your piece a title.");
    if (!(Number(f.price) > 0))
      return alert("An exhibition piece needs a price greater than 0.");
    if (images.length === 0) return alert("Upload at least one image.");
    setBusy(true);
    try {
      await api.exhibitions.addArtwork({
        title: f.title.trim(),
        narrative: f.narrative || null,
        medium: f.medium || null,
        category_id: f.category_id || null,
        price: Number(f.price),
        images,
        width: f.width !== "" ? Number(f.width) : null,
        height: f.height !== "" ? Number(f.height) : null,
        depth: is3D && f.depth !== "" ? Number(f.depth) : null,
        unit: f.dim_unit,
      });
      setF(blankForm);
      setImages([]);
      await loadMine();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async (id) => {
    if (!window.confirm("Withdraw this piece from the exhibition?")) return;
    setWbusy(id);
    try {
      await api.exhibitions.withdraw(id);
      await loadMine();
    } catch (e) {
      alert(e.message);
    } finally {
      setWbusy("");
    }
  };

  if (ex === undefined)
    return (
      <div style={card}>
        <Skeleton height={120} radius={10} />
      </div>
    );
  if (!ex || ex.status === "ended")
    return (
      <div style={card}>
        <div
          style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 14,
            color: "rgba(200,191,160,0.65)",
          }}>
          No exhibition is running right now. When the next one opens for
          registration, you'll be able to submit new pieces here — these are
          separate from your collection works.
        </div>
      </div>
    );

  return (
    <div style={card}>
      <div
        style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: 26,
          color: "#fff",
        }}>
        {ex.title}
      </div>
      {ex.theme && (
        <div
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 9,
            letterSpacing: "0.18em",
            color: gold,
            marginTop: 4,
          }}>
          {ex.theme.toUpperCase()}
        </div>
      )}
      <div
        style={{
          fontFamily: "'Raleway',sans-serif",
          fontSize: 13,
          color: "rgba(200,191,160,0.7)",
          lineHeight: 1.7,
          margin: "10px 0 16px",
        }}>
        {ex.description}
      </div>

      {ex.status === "upcoming" && (
        <div
          style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 13,
            color: "rgba(200,191,160,0.7)",
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(212,175,55,0.06)",
            border: "1px dashed rgba(212,175,55,0.3)",
          }}>
          Registration opens{" "}
          {ex.registration_starts_at
            ? new Date(ex.registration_starts_at).toLocaleString()
            : "soon"}
          . Check back to submit your pieces.
        </div>
      )}

      {ex.status === "registration" && (
        <>
          <div
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 10,
              letterSpacing: "0.16em",
              color: gold,
              marginBottom: 4,
            }}>
            SUBMIT A NEW PIECE{" "}
            {ex.registration_ends_at && (
              <span style={{ color: "rgba(200,191,160,0.55)" }}>
                · closes{" "}
                {new Date(ex.registration_ends_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <p
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 12.5,
              color: "rgba(200,191,160,0.6)",
              marginBottom: 14,
            }}>
            These are exhibition-only works — they're shown and sold inside this
            show and never appear in your collection.
          </p>
          <Field l="TITLE">
            <input style={inputStyle} value={f.title} onChange={set("title")} />
          </Field>
          <Field l="ABOUT THIS PIECE">
            <textarea
              style={{ ...inputStyle, minHeight: 70 }}
              value={f.narrative}
              onChange={set("narrative")}
            />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}>
            <Field l="MEDIUM (e.g. Oil on canvas)">
              <input
                style={inputStyle}
                value={f.medium}
                onChange={set("medium")}
              />
            </Field>
            <Field l="CATEGORY (optional)">
              <select
                style={inputStyle}
                value={f.category_id}
                onChange={set("category_id")}>
                <option value="">None</option>
                {mains.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field l="PRICE (₹)">
            <input
              style={inputStyle}
              type="number"
              min="0"
              value={f.price}
              onChange={set("price")}
            />
          </Field>
          <div
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 9,
              letterSpacing: "0.16em",
              color: "rgba(212,175,55,0.65)",
              margin: "2px 0 6px",
            }}>
            SIZE{is3D ? " (width × height × depth)" : " (width × height)"}
            {composedDims ? ` — ${composedDims}` : ""}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: is3D ? "1fr 1fr 1fr 0.8fr" : "1fr 1fr 0.8fr",
              gap: 12,
            }}>
            <Field l="WIDTH">
              <input
                style={inputStyle}
                type="number"
                min="0"
                value={f.width}
                onChange={set("width")}
              />
            </Field>
            <Field l="HEIGHT">
              <input
                style={inputStyle}
                type="number"
                min="0"
                value={f.height}
                onChange={set("height")}
              />
            </Field>
            {is3D && (
              <Field l="DEPTH / LENGTH">
                <input
                  style={inputStyle}
                  type="number"
                  min="0"
                  value={f.depth}
                  onChange={set("depth")}
                />
              </Field>
            )}
            <Field l="UNIT">
              <select
                style={inputStyle}
                value={f.dim_unit}
                onChange={set("dim_unit")}>
                <option value="cm">cm</option>
                <option value="inch">inch</option>
                <option value="feet">feet</option>
              </select>
            </Field>
          </div>
          <Field l="IMAGES">
            <MediaUploader
              kind="image"
              multiple
              hint="UPLOAD IMAGES"
              value={images}
              onChange={setImages}
            />
          </Field>
          <button
            style={{ ...btn, opacity: busy ? 0.7 : 1, marginTop: 4 }}
            disabled={busy}
            onClick={submit}>
            {busy ? "SUBMITTING…" : "+ SUBMIT TO EXHIBITION"}
          </button>
        </>
      )}

      {ex.status === "live" && (
        <div
          style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 13,
            color: "rgba(200,191,160,0.7)",
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(74,222,128,0.08)",
            border: "1px solid rgba(74,222,128,0.3)",
          }}>
          🎉 The exhibition is{" "}
          <strong style={{ color: "#86efac" }}>live</strong>. You have{" "}
          {mine.length} piece{mine.length === 1 ? "" : "s"} on show.{" "}
          <Link to="/exhibition" style={{ color: gold }}>
            View the exhibition →
          </Link>
        </div>
      )}

      {/* My submitted exhibition pieces */}
      {mine.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 12,
              letterSpacing: "0.16em",
              color: gold,
              margin: "0 0 14px",
            }}>
            MY EXHIBITION PIECES ({mine.length})
          </div>
          {mine.map((w) => (
            <div
              key={w.id}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                padding: "10px 12px",
                marginBottom: 8,
                borderRadius: 10,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(212,175,55,0.15)",
              }}>
              <img
                src={w.images?.[0]}
                alt=""
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 6,
                  objectFit: "cover",
                  background: "rgba(212,175,55,0.1)",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 17,
                    color: "#fff",
                  }}>
                  {w.title}
                </div>
                <div
                  style={{
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 12,
                    color: "rgba(200,191,160,0.6)",
                  }}>
                  {inr(w.price)}
                  {w.base_dimensions ? ` · ${w.base_dimensions}` : ""}
                </div>
              </div>
              {ex.status === "registration" && (
                <button
                  onClick={() => withdraw(w.id)}
                  disabled={wbusy === w.id}
                  style={{
                    ...btn,
                    padding: "7px 14px",
                    background: "transparent",
                    color: "rgba(255,140,140,0.9)",
                    border: "1px solid rgba(255,140,140,0.4)",
                  }}>
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
    api.artist
      .profile()
      .then((p) =>
        setF({
          name: p.name || "",
          real_name: p.real_name || "",
          bio: p.bio || "",
          image_url: p.image_url || "",
          location: p.location || "",
          art_type: p.art_type || "",
          age: p.age || "",
          gender: p.gender || "",
        }),
      )
      .catch(() =>
        setF({
          name: "",
          real_name: "",
          bio: "",
          image_url: "",
          location: "",
          art_type: "",
          age: "",
          gender: "",
        }),
      );
  }, []);
  if (!f)
    return (
      <div style={card}>
        <Skeleton height={200} radius={10} />
      </div>
    );
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async () => {
    setBusy(true);
    setSaved(false);
    try {
      await api.artist.updateProfile({
        ...f,
        age: f.age ? Number(f.age) : null,
      });
      setSaved(true);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div style={card}>
      {saved && (
        <div
          style={{
            marginBottom: 16,
            fontFamily: "'Raleway',sans-serif",
            fontSize: 13,
            color: "#86efac",
          }}>
          ✓ Profile saved.
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 18,
        }}>
        {f.image_url ? (
          <img
            src={f.image_url}
            alt=""
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              objectFit: "cover",
              border: "1px solid rgba(212,175,55,0.3)",
            }}
          />
        ) : (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "1px dashed rgba(212,175,55,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(212,175,55,0.4)",
            }}>
            ✦
          </div>
        )}
        <MediaUploader
          kind="image"
          preview={false}
          hint="CHANGE PHOTO"
          value={f.image_url}
          onChange={(url) => setF((v) => ({ ...v, image_url: url }))}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field l="ARTIST NAME (SHOWN PUBLICLY)">
          <input style={inputStyle} value={f.name} onChange={set("name")} placeholder="Your stage / artist name" />
        </Field>
        <Field l="REAL NAME (KEPT PRIVATE)">
          <input style={inputStyle} value={f.real_name} onChange={set("real_name")} placeholder="Your legal name" />
        </Field>
      </div>
      <Field l="BIO">
        <textarea
          style={{ ...inputStyle, minHeight: 100 }}
          value={f.bio}
          onChange={set("bio")}
        />
      </Field>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
        }}>
        <Field l="ART TYPE">
          <input
            style={inputStyle}
            value={f.art_type}
            onChange={set("art_type")}
            placeholder="e.g. Oil painter"
          />
        </Field>
        <Field l="LOCATION">
          <input
            style={inputStyle}
            value={f.location}
            onChange={set("location")}
          />
        </Field>
        <Field l="AGE">
          <input
            style={inputStyle}
            type="number"
            value={f.age}
            onChange={set("age")}
          />
        </Field>
      </div>
      <Field l="GENDER (FOR DEFAULT AVATAR)">
        <select style={inputStyle} value={f.gender} onChange={set("gender")}>
          <option value="">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </Field>
      <button
        style={{ ...btn, opacity: busy ? 0.7 : 1 }}
        disabled={busy}
        onClick={save}>
        {busy ? "SAVING…" : "SAVE PROFILE"}
    </button>
    </div>
  );
}
