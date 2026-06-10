import { useSearchParams, useNavigate } from "react-router-dom";

/**
 * Dedicated in-app AR page. Opened in a new tab from a product's "View in AR".
 * Reuses the self-contained AR launcher (public/ar-launcher.html) full-screen,
 * wrapped in an app route with a slim top bar.
 */
export default function ARView() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const image = params.get("image") || "";
  const type = params.get("type") || "painting";
  const src = `/ar-launcher.html?image=${encodeURIComponent(image)}&type=${encodeURIComponent(type)}`;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0a0a0a", zIndex: 50, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid rgba(212,175,55,0.18)", background: "rgba(10,10,10,0.85)" }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, letterSpacing: "0.1em", color: "#f0ece4" }}>
          Art Coliseum <span style={{ color: "#D4AF37" }}>· AR View</span>
        </div>
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : window.close())}
          style={{ background: "transparent", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37", borderRadius: 999, padding: "7px 16px", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", cursor: "pointer" }}>
          CLOSE
        </button>
      </div>
      <iframe
        title="Art Coliseum AR"
        src={src}
        allow="camera; xr-spatial-tracking; accelerometer; gyroscope; magnetometer"
        style={{ flex: 1, width: "100%", border: "none" }}
      />
    </div>
  );
}
