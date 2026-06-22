import { useRef } from "react";

/**
 * Polished wrapper around the native date / time inputs. Native pickers are
 * reliable across browsers; this just gives them the gold-on-dark theme, a
 * proper label, a focus ring and a calendar/clock affordance that opens the
 * picker on click anywhere in the field.
 *
 * Props: label, type ("datetime-local" | "date" | "time"), value, onChange(value),
 *        min, max, required, hint.
 */
const gold = "#D4AF37";

export default function DateTimeField({
  label,
  type = "datetime-local",
  value,
  onChange,
  min,
  max,
  required = false,
  hint,
}) {
  const ref = useRef(null);
  const openPicker = () => {
    const el = ref.current;
    if (!el) return;
    try { el.showPicker ? el.showPicker() : el.focus(); } catch { el.focus(); }
  };

  const Icon = type === "time" ? ClockIcon : CalendarIcon;

  return (
    <label style={{ display: "block" }}>
      {label && (
        <span style={{ display: "block", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: gold, marginBottom: 7 }}>
          {label}{required && <span style={{ color: "#e2483d" }}> *</span>}
        </span>
      )}
      <div
        onClick={openPicker}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(212,175,55,0.25)",
          borderRadius: 8, padding: "0 12px", cursor: "pointer",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onFocusCapture={(e) => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(212,175,55,0.12)"; }}
        onBlurCapture={(e) => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <Icon />
        <input
          ref={ref}
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          required={required}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 14,
            padding: "12px 0", colorScheme: "dark", cursor: "pointer",
          }}
        />
      </div>
      {hint && (
        <span style={{ display: "block", fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.5)", marginTop: 5 }}>{hint}</span>
      )}
    </label>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}
