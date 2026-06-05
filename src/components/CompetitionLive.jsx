import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "./SafeImage";
import { api } from "../utils/api";
import { useAuth } from "../context/Auth";

const SEEN_KEY = "coli_comp_seen";       // competition id whose popup was auto-shown
const WIN_ACK_KEY = "coli_comp_win_ack"; // winning entry id whose congrats was shown

/**
 * Site-wide live-competition experience (mounted once in Layout):
 *  - polls /competitions/live; when something is live it auto-opens a gallery popup
 *    showing every entry in a circular coverflow carousel (image · artist · narrative);
 *  - jury members rate the focused entry 1–5;
 *  - a winning artist gets a one-time congratulations popup.
 */
export default function CompetitionLive() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState({});
  const [winner, setWinner] = useState(null);

  const refresh = useCallback(() => {
    api.competitions.live().then((d) => {
      setData(d);
      if (d) {
        setScores(d.my_scores || {});
        if (localStorage.getItem(SEEN_KEY) !== d.competition.id) setOpen(true);
      } else {
        setOpen(false);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 60000);
    return () => clearInterval(t);
  }, [refresh]);

  // Congratulate a winning artist once.
  useEffect(() => {
    if (!user) { setWinner(null); return; }
    api.competitions.myEntries().then((rows) => {
      const win = (rows || []).find((r) => r.status === "winner");
      if (win && localStorage.getItem(WIN_ACK_KEY) !== win.id) setWinner(win);
    }).catch(() => {});
  }, [user]);

  const live = data?.competition;
  const entries = data?.entries || [];
  const isJury = data?.is_jury;
  const n = entries.length;
  const active = n ? entries[((idx % n) + n) % n] : null;

  // Auto-advance the carousel while the popup is open.
  useEffect(() => {
    if (!open || n < 2) return;
    const t = setInterval(() => setIdx((i) => i + 1), 4500);
    return () => clearInterval(t);
  }, [open, n]);

  const closePopup = () => {
    setOpen(false);
    if (live) localStorage.setItem(SEEN_KEY, live.id);
  };
  const rate = async (entryId, score) => {
    setScores((s) => ({ ...s, [entryId]: score }));
    try { await api.competitions.score(entryId, score); } catch (e) { alert(e.message); }
  };
  const ackWin = () => { if (winner) localStorage.setItem(WIN_ACK_KEY, winner.id); setWinner(null); };

  // Circular offset (shortest signed distance on the ring).
  const ringOffset = (i) => {
    let o = i - (((idx % n) + n) % n);
    if (o > n / 2) o -= n;
    if (o < -n / 2) o += n;
    return o;
  };

  return (
    <>
      {live && !open && (
        <button onClick={() => setOpen(true)} className="comp-live-fab">
          <span className="comp-live-dot" /> COMPETITION LIVE
        </button>
      )}

      <AnimatePresence>
        {open && live && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={overlay}>
            <button onClick={closePopup} style={closeBtn}>×</button>

            <div style={{ textAlign: "center", marginBottom: 8 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.24em", color: "#D4AF37" }}>
                LIVE COMPETITION GALLERY
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 700, color: "#fff", margin: "6px 0 0" }}>
                {live.title}
              </h2>
            </div>

            {n === 0 ? (
              <div style={{ color: "rgba(200,191,160,0.6)", fontFamily: "'Raleway',sans-serif", marginTop: 40 }}>
                No entries to show yet.
              </div>
            ) : (
              <>
                {/* Coverflow carousel */}
                <div style={stage}>
                  {entries.map((e, i) => {
                    const o = ringOffset(i);
                    if (Math.abs(o) > 2) return null;
                    const abs = Math.abs(o);
                    return (
                      <div
                        key={e.id}
                        onClick={() => setIdx(i)}
                        style={{
                          position: "absolute", width: 300, height: 300, cursor: "pointer",
                          transform: `translateX(${o * 230}px) translateZ(${-abs * 140}px) rotateY(${o * -28}deg) scale(${1 - abs * 0.12})`,
                          opacity: 1 - abs * 0.28, zIndex: 20 - abs,
                          transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.5s",
                          borderRadius: 12, overflow: "hidden",
                          border: o === 0 ? "2px solid #D4AF37" : "1px solid rgba(212,175,55,0.25)",
                          boxShadow: o === 0 ? "0 24px 60px rgba(0,0,0,0.6)" : "none",
                          background: "#0e0c0a",
                        }}>
                        <SafeImage src={e.image} alt={e.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: o === 0 ? "none" : "brightness(0.55)" }} />
                      </div>
                    );
                  })}
                  <button onClick={() => setIdx((i) => i - 1)} style={{ ...navBtn, left: 12 }}>‹</button>
                  <button onClick={() => setIdx((i) => i + 1)} style={{ ...navBtn, right: 12 }}>›</button>
                </div>

                {/* Active entry detail */}
                {active && (
                  <div style={{ textAlign: "center", maxWidth: 560, marginTop: 18 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>{active.title}</div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", color: "#D4AF37", margin: "4px 0 10px" }}>
                      {(active.artist_name || "Artist").toUpperCase()}
                    </div>
                    {active.description && (
                      <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.72)", lineHeight: 1.7 }}>
                        {active.description}
                      </p>
                    )}

                    {isJury ? (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "rgba(200,191,160,0.6)", marginBottom: 6 }}>YOUR RATING</div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} onClick={() => rate(active.id, s)}
                              style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 30, lineHeight: 1, color: s <= (scores[active.id] || 0) ? "#D4AF37" : "rgba(200,191,160,0.3)" }}>★</button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 10, fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.45)" }}>
                        Our jury is scoring the entries live.
                      </div>
                    )}

                    {/* dots */}
                    <div style={{ display: "flex", gap: 7, justifyContent: "center", marginTop: 18 }}>
                      {entries.map((e, i) => (
                        <button key={e.id} onClick={() => setIdx(i)}
                          style={{ width: 8, height: 8, borderRadius: "50%", border: "none", cursor: "pointer", padding: 0,
                            background: ringOffset(i) === 0 ? "#D4AF37" : "rgba(212,175,55,0.3)" }} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winner congratulations */}
      <AnimatePresence>
        {winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ ...overlay, zIndex: 9100 }} onClick={ackWin}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} onClick={(e) => e.stopPropagation()}
              style={{ textAlign: "center", maxWidth: 460, padding: "44px 36px", borderRadius: 18, background: "linear-gradient(160deg, #1a160d, #0e0c0a)", border: "1px solid rgba(212,175,55,0.4)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
              <div style={{ fontSize: 52 }}>🏆</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.24em", color: "#D4AF37", marginTop: 8 }}>CONGRATULATIONS</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 700, color: "#fff", margin: "10px 0" }}>You Won!</h2>
              <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.75)", lineHeight: 1.7 }}>
                Your entry <em style={{ color: "#D4AF37" }}>“{winner.title}”</em> won the competition. You're now a <strong style={{ color: "#fff" }}>verified artist</strong> — your studio and artwork publishing are unlocked.
              </p>
              <button onClick={ackWin} style={{ marginTop: 18, padding: "13px 30px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", cursor: "pointer" }}>
                ENTER MY STUDIO
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .comp-live-fab { position: fixed; bottom: 22px; left: 22px; z-index: 8000;
          display: inline-flex; align-items: center; gap: 8px; padding: 11px 18px; border-radius: 999px;
          background: linear-gradient(135deg,#D4AF37,#e8c53a); color: #111; border: none; cursor: pointer;
          font-family: 'Cinzel',serif; font-size: 10px; letter-spacing: 0.16em; font-weight: 700;
          box-shadow: 0 10px 30px rgba(212,175,55,0.4); }
        .comp-live-dot { width: 8px; height: 8px; border-radius: 50%; background: #d11; box-shadow: 0 0 0 0 rgba(221,17,17,0.7);
          animation: comp-pulse 1.6s infinite; }
        @keyframes comp-pulse { 0% { box-shadow: 0 0 0 0 rgba(221,17,17,0.6);} 70% { box-shadow: 0 0 0 8px rgba(221,17,17,0);} 100% { box-shadow: 0 0 0 0 rgba(221,17,17,0);} }
      `}</style>
    </>
  );
}

const overlay = {
  position: "fixed", inset: 0, zIndex: 9000, background: "rgba(6,5,4,0.92)", backdropFilter: "blur(10px)",
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "70px 24px 40px",
};
const closeBtn = {
  position: "absolute", top: 18, right: 22, width: 40, height: 40, borderRadius: "50%",
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37",
  fontSize: 22, cursor: "pointer", lineHeight: 1,
};
const stage = {
  position: "relative", width: "100%", maxWidth: 900, height: 340, marginTop: 18,
  display: "flex", alignItems: "center", justifyContent: "center", perspective: "1400px",
};
const navBtn = {
  position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 40, width: 44, height: 44, borderRadius: "50%",
  background: "rgba(0,0,0,0.5)", border: "1px solid rgba(212,175,55,0.35)", color: "#D4AF37", fontSize: 26, cursor: "pointer",
};
