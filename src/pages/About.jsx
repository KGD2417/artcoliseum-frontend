import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

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
          <span className="bold-white">About</span> <em>Art Coliseum</em>
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

      {/* ── Section 1: We Create Art For You ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        style={{ marginTop: "80px" }}>
        <div className="gold-rule" style={{ justifyContent: "center", marginBottom: "24px" }}>
          <div className="grl" style={{ background: "linear-gradient(90deg, transparent, #D4AF37)" }} />
          <span className="grt">Our Craft</span>
          <div className="grl" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
        </div>
        <h2 className="section-heading" style={{ textAlign: "center", marginBottom: "20px" }}>
          <span className="bold-white">We Create</span> <em>Art For You</em>
        </h2>
        <p
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: "16px",
            lineHeight: 1.85,
            color: "rgba(200,191,160,0.85)",
            textAlign: "center",
            maxWidth: "720px",
            margin: "0 auto 44px",
          }}>
          Art Coliseum specialises in fully customised, made-to-order artwork tailored to each
          client's exact specifications. Every commission begins with a conversation — about your
          space, your story, and the emotions you wish to evoke. From the choice of canvas and
          pigment to the final varnish and frame, every detail is considered.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}>
          {[
            {
              icon: "◈",
              title: "Custom Dimensions",
              body: "Any size you envision — from intimate studies to monumental installations. We work to your exact measurements.",
            },
            {
              icon: "◇",
              title: "Bespoke Materials",
              body: "Linen, cotton, wood panel, aluminium, handmade paper. Every substrate selected for the work and the space.",
            },
            {
              icon: "◉",
              title: "Personal Narrative",
              body: "Your story woven into every brushstroke. We work with artists who listen, interpret, and translate your vision.",
            },
          ].map((point) => (
            <div
              key={point.title}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(212,175,55,0.1)",
                borderRadius: "12px",
                padding: "32px 28px",
                textAlign: "center",
              }}>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "28px",
                  color: "#D4AF37",
                  marginBottom: "16px",
                }}>
                {point.icon}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#f0e8d8",
                  marginBottom: "12px",
                }}>
                {point.title}
              </div>
              <div
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: "13px",
                  lineHeight: 1.75,
                  color: "rgba(200,191,160,0.7)",
                }}>
                {point.body}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Section 2: Our Artist Community ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        style={{ marginTop: "90px" }}>
        <div className="gold-rule" style={{ justifyContent: "center", marginBottom: "24px" }}>
          <div className="grl" style={{ background: "linear-gradient(90deg, transparent, #D4AF37)" }} />
          <span className="grt">Community</span>
          <div className="grl" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
        </div>
        <h2 className="section-heading" style={{ textAlign: "center", marginBottom: "20px" }}>
          <span className="bold-white">Our Artist</span> <em>Community</em>
        </h2>
        <p
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: "16px",
            lineHeight: 1.85,
            color: "rgba(200,191,160,0.85)",
            textAlign: "center",
            maxWidth: "720px",
            margin: "0 auto 44px",
          }}>
          We believe that art flourishes in community. Art Coliseum nurtures both established
          masters and emerging talents through a unique dual pathway — direct entry for established
          artists and a curated exhibition process for newcomers. Our community is built on
          mentorship, shared practice, and the belief that great art deserves a great audience.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            textAlign: "center",
          }}>
          {[
            { stat: "2,500+", label: "Active Artists" },
            { stat: "50+",    label: "Countries" },
            { stat: "18",     label: "Exhibitions Per Year" },
          ].map(({ stat, label }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(212,175,55,0.1)",
                borderRadius: "12px",
                padding: "36px 20px",
              }}>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "40px",
                  color: "#D4AF37",
                  marginBottom: "10px",
                }}>
                {stat}
              </div>
              <div
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: "12px",
                  letterSpacing: "0.1em",
                  color: "rgba(200,191,160,0.6)",
                }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Section 3: Connecting Artists & Collectors ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        style={{ marginTop: "90px" }}>
        <div className="gold-rule" style={{ justifyContent: "center", marginBottom: "24px" }}>
          <div className="grl" style={{ background: "linear-gradient(90deg, transparent, #D4AF37)" }} />
          <span className="grt">The Bridge</span>
          <div className="grl" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
        </div>
        <h2 className="section-heading" style={{ textAlign: "center", marginBottom: "20px" }}>
          <span className="bold-white">Connecting Artists</span> <em>&amp; Collectors</em>
        </h2>
        <p
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: "16px",
            lineHeight: 1.85,
            color: "rgba(200,191,160,0.85)",
            textAlign: "center",
            maxWidth: "720px",
            margin: "0 auto 48px",
          }}>
          We act as the bridge between creators and the people who want to bring art into their
          lives. Every inquiry connects a collector directly with the artist, enabling genuine
          dialogue about the work, its meaning, and its place in a new home. This is not commerce —
          it is conversation.
        </p>

        {/* Two-column visual */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(212,175,55,0.1)",
            borderRadius: "16px",
            overflow: "hidden",
          }}>
          {/* Artist side */}
          <div
            style={{
              flex: 1,
              padding: "44px 32px",
              textAlign: "center",
              borderRight: "1px solid rgba(212,175,55,0.1)",
            }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))",
                border: "1px solid rgba(212,175,55,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                fontSize: 28,
              }}>
              ✦
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "22px",
                fontWeight: 600,
                color: "#f0e8d8",
                marginBottom: "10px",
              }}>
              The Artist
            </div>
            <div
              style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: "13px",
                lineHeight: 1.7,
                color: "rgba(200,191,160,0.6)",
              }}>
              Creates with intention. Shares their vision, technique, and the story behind every work.
            </div>
          </div>

          {/* Art Coliseum bridge */}
          <div
            style={{
              padding: "28px 20px",
              textAlign: "center",
              flexShrink: 0,
            }}>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "10px",
                letterSpacing: "0.2em",
                color: "#D4AF37",
                marginBottom: "8px",
              }}>
              ART COLISEUM
            </div>
            <div style={{ color: "rgba(212,175,55,0.4)", fontSize: "20px" }}>⇌</div>
          </div>

          {/* Collector side */}
          <div
            style={{
              flex: 1,
              padding: "44px 32px",
              textAlign: "center",
              borderLeft: "1px solid rgba(212,175,55,0.1)",
            }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))",
                border: "1px solid rgba(212,175,55,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                fontSize: 28,
              }}>
              ◈
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "22px",
                fontWeight: 600,
                color: "#f0e8d8",
                marginBottom: "10px",
              }}>
              The Collector
            </div>
            <div
              style={{
                fontFamily: "'Raleway', sans-serif",
                fontSize: "13px",
                lineHeight: 1.7,
                color: "rgba(200,191,160,0.6)",
              }}>
              Discovers with purpose. Connects with artists to bring meaningful art into their world.
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Section 4: Our Customisation Philosophy ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        style={{ marginTop: "90px", marginBottom: "20px" }}>
        <div className="gold-rule" style={{ justifyContent: "center", marginBottom: "24px" }}>
          <div className="grl" style={{ background: "linear-gradient(90deg, transparent, #D4AF37)" }} />
          <span className="grt">Philosophy</span>
          <div className="grl" style={{ background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
        </div>
        <h2 className="section-heading" style={{ textAlign: "center", marginBottom: "20px" }}>
          <span className="bold-white">Our Customisation</span> <em>Philosophy</em>
        </h2>
        <p
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: "16px",
            lineHeight: 1.85,
            color: "rgba(200,191,160,0.85)",
            textAlign: "center",
            maxWidth: "720px",
            margin: "0 auto 48px",
          }}>
          Art Coliseum is fundamentally a customisation-first platform. No two orders need to be
          the same. We offer an unparalleled degree of personalisation: size, medium, palette,
          texture, finish, framing, and even the subject itself. Our artists work with you, not
          just for you.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
          }}>
          {[
            {
              number: "01",
              title: "Bespoke by Default",
              body: "Every commission starts with a blank canvas — literally. We never fulfil the same order twice. Your artwork is made precisely for you.",
            },
            {
              number: "02",
              title: "No Catalogue Constraints",
              body: "We do not limit you to pre-determined sizes or styles. If you can describe it, we can create it — in close dialogue with a matched artist.",
            },
            {
              number: "03",
              title: "Artist Collaboration",
              body: "You are not buying a product off a shelf. You are entering a creative partnership. Our artists collaborate with you throughout the process.",
            },
            {
              number: "04",
              title: "Guaranteed Authenticity",
              body: "Every commissioned artwork comes with a certificate of authenticity, signed by the artist, and documented in our provenance registry.",
            },
          ].map((pillar) => (
            <div
              key={pillar.number}
              style={{
                display: "flex",
                gap: "24px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(212,175,55,0.1)",
                borderRadius: "12px",
                padding: "30px 28px",
              }}>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "32px",
                  color: "rgba(212,175,55,0.2)",
                  fontWeight: 700,
                  lineHeight: 1,
                  flexShrink: 0,
                  userSelect: "none",
                }}>
                {pillar.number}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#f0e8d8",
                    marginBottom: "10px",
                  }}>
                  {pillar.title}
                </div>
                <div
                  style={{
                    fontFamily: "'Raleway', sans-serif",
                    fontSize: "13px",
                    lineHeight: 1.75,
                    color: "rgba(200,191,160,0.7)",
                  }}>
                  {pillar.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
