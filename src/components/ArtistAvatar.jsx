import SafeImage from "./SafeImage";

/**
 * Artist avatar with a graceful gendered fallback.
 * Shows the photo when `src` is set; otherwise a man/woman silhouette based on
 * `gender` ("male" | "female" | anything else → neutral).
 */
export default function ArtistAvatar({ src, gender, size = 120, style = {} }) {
  const base = {
    width: size, height: size, borderRadius: "50%", objectFit: "cover",
    flexShrink: 0, ...style,
  };
  if (src) {
    return <SafeImage src={src} alt="" style={base} />;
  }
  const g = (gender || "").toLowerCase();
  const tint = g === "female" ? "#caa3b4" : g === "male" ? "#9fb2c9" : "#c8bfa0";
  return (
    <div style={{
      ...base,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(circle at 50% 35%, rgba(212,175,55,0.12), rgba(255,255,255,0.03))",
      border: "1px solid rgba(212,175,55,0.3)",
    }}>
      <Silhouette female={g === "female"} color={tint} size={Math.round(size * 0.6)} />
    </div>
  );
}

function Silhouette({ female, color, size }) {
  // Simple head + shoulders; the female variant adds shoulder-length hair.
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill={color} aria-hidden>
      {female && (
        <path d="M16 30c0-12 6-20 16-20s16 8 16 20c0 6-2 10-4 12 1-6 0-14-3-18-2 8-7 11-9 11s-7-3-9-11c-3 4-4 12-3 18-2-2-4-6-4-12z" opacity="0.85" />
      )}
      <circle cx="32" cy="24" r="11" />
      <path d="M14 54c0-10 8-16 18-16s18 6 18 16v2H14z" />
    </svg>
  );
}
