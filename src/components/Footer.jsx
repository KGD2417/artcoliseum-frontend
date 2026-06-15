import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const LINKS = [
  { label: "Collection", to: "/categories" },
  { label: "Events", to: "/events" },
  { label: "Artists", to: "/artists" },
  { label: "Community", to: "/community" },
  { label: "Privacy", to: "/privacy" },
  { label: "Help", to: "/help" },
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer style={{
      background: "#080808",
      borderTop: "1px solid rgba(212,175,55,0.1)",
      padding: "14px 48px",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src={logo}
            alt="Art Coliseum"
            style={{ height: 44, cursor: "pointer", opacity: 0.9 }}
            onClick={() => navigate("/")}
          />
          <span style={{
            fontFamily: "'Raleway', sans-serif", fontSize: 13,
            color: "rgba(200,191,160,0.55)", letterSpacing: "0.05em",
          }}>
            © {new Date().getFullYear()} Art Coliseum
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {LINKS.map(l => (
            <span
              key={l.label}
              onClick={() => navigate(l.to)}
              style={{
                fontFamily: "'Raleway', sans-serif", fontSize: 13,
                color: "rgba(200,191,160,0.6)", cursor: "pointer", transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "#D4AF37"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(200,191,160,0.6)"}>
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
