import { motion } from "framer-motion";

// The standard centred page heading used across the site (Community, Collection,
// Artists, …): a gold-rule eyebrow, a two-tone serif title (white + italic gold
// on the last word), and a muted subtitle. Use this so every section matches.
export default function PageHeading({ eyebrow, title, subtitle, children }) {
  const words = (title || "").trim().split(" ");
  const last = words.length > 1 ? words.pop() : null;
  return (
    <div className="community-hero" style={{
      background: "linear-gradient(180deg, #0e0c0a 0%, #080808 100%)",
      borderBottom: "1px solid rgba(212,175,55,0.1)",
      padding: "140px 48px 60px", textAlign: "center",
    }}>
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        {eyebrow && (
          <div className="gold-rule" style={{ justifyContent: "center" }}>
            <div className="grl" style={{ background: "linear-gradient(90deg, transparent, #D4AF37)" }} />
            <span className="grt">{eyebrow}</span>
            <div className="grl" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
          </div>
        )}
        <h1 className="section-heading">
          {last
            ? <><span className="bold-white">{words.join(" ")}</span> <em>{last}</em></>
            : <span className="bold-white">{title}</span>}
        </h1>
        {subtitle && (
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 15, color: "rgba(200,191,160,0.55)", maxWidth: 560, margin: "14px auto 0", lineHeight: 1.75 }}>
            {subtitle}
          </p>
        )}
        {children}
      </motion.div>
    </div>
  );
}
