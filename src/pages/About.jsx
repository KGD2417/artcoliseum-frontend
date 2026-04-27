export default function About() {
  return (
    <section
      style={{
        padding: "120px 52px 100px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}>
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <div className="gold-rule" style={{ justifyContent: "center" }}>
          <div
            className="grl"
            style={{
              background: "linear-gradient(90deg, transparent, #D4AF37)",
            }}
          />
          <span className="grt">Our Story</span>
          <div
            className="grl"
            style={{
              background: "linear-gradient(90deg, #D4AF37, transparent)",
            }}
          />
        </div>
        <h2 className="section-heading">
          <span className="bold-white">About</span> <em>Arrt Coliseum</em>
        </h2>
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(212,175,55,0.1)",
          borderRadius: "16px",
          padding: "48px",
          marginBottom: "48px",
        }}>
        <p
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: "16px",
            lineHeight: 1.8,
            color: "rgba(200,191,160,0.85)",
            marginBottom: "24px",
          }}>
          Art Coliseum is a modern platform dedicated to showcasing and
          connecting exceptional artistic talent with collectors around the
          world. We bring together paintings, sculptures, photography, and
          digital art into a single immersive experience.
        </p>

        <p
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: "16px",
            lineHeight: 1.8,
            color: "rgba(200,191,160,0.85)",
            marginBottom: "24px",
          }}>
          Our goal is to empower artists while making art discovery seamless and
          engaging for collectors. Through curated collections and innovative
          digital experiences, we ensure every piece tells a story and holds
          lasting value.
        </p>

        <p
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: "16px",
            lineHeight: 1.8,
            color: "rgba(200,191,160,0.85)",
          }}>
          At Art Coliseum, we believe art is not just to be viewed — but
          experienced, owned, and lived with. We are building a space where
          creativity meets technology and inspiration becomes accessible to
          everyone.
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          textAlign: "center",
        }}>
        <div>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "36px",
              color: "#D4AF37",
            }}>
            50+
          </div>
          <div
            style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: "12px",
              color: "#8B7A45",
            }}>
            Countries
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "36px",
              color: "#D4AF37",
            }}>
            2,500+
          </div>
          <div
            style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: "12px",
              color: "#8B7A45",
            }}>
            Artists
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "36px",
              color: "#D4AF37",
            }}>
            10,000+
          </div>
          <div
            style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: "12px",
              color: "#8B7A45",
            }}>
            Artworks
          </div>
        </div>
      </div>
    </section>
  );
}
