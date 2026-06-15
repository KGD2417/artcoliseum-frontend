import React, { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Vertically auto-scrolling testimonial columns (marquee), themed to the
 * Art Coliseum gold/dark aesthetic. Adapted from the shadcn "testimonial-v2"
 * pattern to this codebase's conventions: plain JSX, framer-motion (already a
 * dependency) and a self-contained injected <style> block — the same approach
 * used by CircularTestimonials — so it needs no Tailwind.
 *
 * Each testimonial accepts either the admin/API shape ({ quote, src,
 * designation }) or the reference shape ({ text, image, role }); both are
 * normalised below. Data is passed in via props so it stays admin-editable
 * (Admin → Testimonials).
 */

const TC_STYLES = `
  .tcols-wrap {
    display: flex; justify-content: center; gap: 1.5rem;
    max-height: 740px; overflow: hidden;
    -webkit-mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent);
    mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent);
  }
  .tcol { flex: 1 1 0; max-width: 22rem; min-width: 0; }
  .tcol-2, .tcol-3 { display: none; }
  @media (min-width: 768px) { .tcol-2 { display: block; } }
  @media (min-width: 1024px) { .tcol-3 { display: block; } }

  .tcol-list { display: flex; flex-direction: column; gap: 1.5rem; padding: 0 0 1.5rem; margin: 0; list-style: none; }
  .tcard {
    padding: 32px;
    border-radius: 20px;
    border: 1px solid rgba(212,175,55,0.18);
    background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02));
    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    cursor: default; user-select: none;
    transition: border-color 0.3s ease;
  }
  .tcard:hover, .tcard:focus-visible { border-color: rgba(212,175,55,0.45); outline: none; }
  .tcard-quote {
    margin: 0;
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.05rem; line-height: 1.7;
    color: rgba(200,191,160,0.85);
  }
  .tcard-foot { display: flex; align-items: center; gap: 12px; margin-top: 22px; }
  .tcard-avatar {
    width: 44px; height: 44px; border-radius: 50%; object-fit: cover;
    border: 1px solid rgba(212,175,55,0.3);
    box-shadow: 0 0 0 2px rgba(212,175,55,0.08);
  }
  .tcard-name {
    font-family: 'Cormorant Garamond', serif; font-weight: 700; font-style: normal;
    font-size: 1.05rem; letter-spacing: 0.01em; line-height: 1.2;
    color: #f0e8d0;
  }
  .tcard-role {
    font-family: 'Raleway', sans-serif; font-size: 0.78rem;
    letter-spacing: 0.06em; color: rgba(200,191,160,0.55); margin-top: 3px;
  }
`;

function normalise(t) {
  return {
    text: t.text ?? t.quote ?? "",
    image: t.image ?? t.src ?? "",
    name: t.name ?? "",
    role: t.role ?? t.designation ?? "",
  };
}

function TestimonialsColumn({ className = "", testimonials, duration = 15 }) {
  return (
    <div className={`tcol ${className}`}>
      <motion.ul
        className="tcol-list"
        animate={{ translateY: "-50%" }}
        transition={{ duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}>
        {/* Two copies → translateY(-50%) loops seamlessly. */}
        {[0, 1].map((dup) => (
          <React.Fragment key={dup}>
            {testimonials.map((t, i) => (
              <motion.li
                key={`${dup}-${i}`}
                aria-hidden={dup === 1 ? "true" : "false"}
                tabIndex={dup === 1 ? -1 : 0}
                className="tcard"
                whileHover={{
                  scale: 1.03, y: -8,
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.25)",
                  transition: { type: "spring", stiffness: 400, damping: 17 },
                }}
                whileFocus={{
                  scale: 1.03, y: -8,
                  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.25)",
                  transition: { type: "spring", stiffness: 400, damping: 17 },
                }}>
                <blockquote style={{ margin: 0, padding: 0 }}>
                  <p className="tcard-quote">{t.text}</p>
                  <footer className="tcard-foot">
                    {t.image && (
                      <img className="tcard-avatar" width={44} height={44} src={t.image} alt={`Portrait of ${t.name}`} />
                    )}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <cite className="tcard-name">{t.name}</cite>
                      {t.role && <span className="tcard-role">{t.role}</span>}
                    </div>
                  </footer>
                </blockquote>
              </motion.li>
            ))}
          </React.Fragment>
        ))}
      </motion.ul>
    </div>
  );
}

export default function TestimonialColumns({ testimonials = [] }) {
  const items = useMemo(() => testimonials.map(normalise).filter((t) => t.text), [testimonials]);

  // Three columns. With enough entries, split them across columns; with only a
  // few, give every column the full set so none look sparse (varied durations
  // keep them visually offset).
  const [c1, c2, c3] = useMemo(() => {
    if (items.length === 0) return [[], [], []];
    if (items.length < 6) return [items, items, items];
    const cols = [[], [], []];
    items.forEach((t, i) => cols[i % 3].push(t));
    return cols;
  }, [items]);

  if (items.length === 0) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: TC_STYLES }} />
      <div className="tcols-wrap" role="region" aria-label="Scrolling testimonials">
        <TestimonialsColumn testimonials={c1} duration={15} />
        <TestimonialsColumn testimonials={c2} duration={19} className="tcol-2" />
        <TestimonialsColumn testimonials={c3} duration={17} className="tcol-3" />
      </div>
    </>
  );
}
