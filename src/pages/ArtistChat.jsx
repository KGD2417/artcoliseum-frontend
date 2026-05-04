import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useAuth } from "../context/Auth";

const peerKey = (a, b) => {
  const [x, y] = [a, b].sort();
  return `peer:${x}:${y}`;
};

export default function ArtistChat() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [active, setActive] = useState(null); // { id, full_name }
  const [thread, setThread] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/signin");
  }, [user, loading, navigate]);

  // Load other artists.
  useEffect(() => {
    if (role !== "artist" && role !== "admin") return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("role", "artist")
        .neq("id", user.id);
      if (error) { console.error(error); return; }
      setArtists(data ?? []);
    })();
  }, [role, user]);

  // Load thread + subscribe.
  useEffect(() => {
    if (!active || !user) return;
    const key = peerKey(user.id, active.id);
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, sender, text, user_id, created_at")
        .eq("conversation_key", key)
        .order("created_at", { ascending: true });
      if (!cancelled) setThread(data ?? []);
    })();
    const ch = supabase
      .channel(`peer:${key}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_key=eq.${key}` },
        (payload) => setThread(prev =>
          prev.find(x => x.id === payload.new.id) ? prev : [...prev, payload.new]
        )
      )
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [active, user]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread]);

  const send = async () => {
    const text = input.trim();
    if (!text || !active || sending) return;
    setSending(true);
    setInput("");
    const { error } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      conversation_key: peerKey(user.id, active.id),
      sender: "me",
      text,
    });
    setSending(false);
    if (error) alert(error.message);
  };

  if (loading) return <section style={{ padding: 100, textAlign: "center", color: "#D4AF37" }}>Loading…</section>;
  if (role !== "artist" && role !== "admin") {
    return (
      <section style={{ padding: "120px 24px", textAlign: "center", color: "#e8e0d0" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: "#fff" }}>Artists only</h1>
        <p style={{ marginTop: 12, color: "rgba(200,191,160,0.6)" }}>
          Apply via the Artist Portal to join the artist network.
        </p>
        <button onClick={() => navigate("/become-artist")} style={{
          marginTop: 18, padding: "12px 28px",
          background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
          color: "#111", border: "none", borderRadius: 999,
          fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", cursor: "pointer",
        }}>BECOME AN ARTIST</button>
      </section>
    );
  }

  return (
    <section style={{ padding: "100px 24px 60px", maxWidth: 1200, margin: "0 auto", color: "#e8e0d0" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: "#D4AF37" }}>ARTIST NETWORK</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 700, color: "#fff", marginTop: 4 }}>Artist Chat</h1>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)", marginTop: 6 }}>
          Private conversations between Art Coliseum artists.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, minHeight: 520 }}>
        <aside style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 12, background: "rgba(255,255,255,0.02)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(212,175,55,0.15)", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37" }}>
            ARTISTS · {artists.length}
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {artists.length === 0 && (
              <div style={{ padding: 24, color: "rgba(200,191,160,0.5)", fontSize: 13 }}>No other artists yet.</div>
            )}
            {artists.map(a => {
              const isActive = active && active.id === a.id;
              const initials = (a.full_name || "?").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
              return (
                <button
                  key={a.id}
                  onClick={() => setActive(a)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left",
                    padding: "14px 18px", border: "none", cursor: "pointer",
                    background: isActive ? "rgba(212,175,55,0.10)" : "transparent",
                    borderBottom: "1px solid rgba(212,175,55,0.08)",
                    color: "#e8e0d0",
                  }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "rgba(212,175,55,0.15)",
                    border: "1px solid rgba(212,175,55,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#D4AF37", fontFamily: "'Cinzel',serif", fontSize: 12, fontWeight: 700,
                  }}>{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>
                      {a.full_name || "Anonymous artist"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 12, background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column" }}>
          {!active ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(200,191,160,0.5)", fontFamily: "'Raleway',sans-serif", fontSize: 14 }}>
              Pick an artist to start chatting.
            </div>
          ) : (
            <>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>
                  {active.full_name || "Artist"}
                </div>
              </div>
              <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                {thread.map(m => {
                  const mine = m.user_id === user.id;
                  return (
                    <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "70%" }}>
                      <div style={{
                        padding: "10px 14px", borderRadius: 14,
                        background: mine ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "rgba(255,255,255,0.06)",
                        color: mine ? "#111" : "#e8e0d0",
                        fontFamily: "'Raleway',sans-serif", fontSize: 13, lineHeight: 1.5,
                      }}>{m.text}</div>
                      <div style={{ fontSize: 10, color: "rgba(200,191,160,0.4)", marginTop: 3, textAlign: mine ? "right" : "left" }}>
                        {new Date(m.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: 14, borderTop: "1px solid rgba(212,175,55,0.15)", display: "flex", gap: 8 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") send(); }}
                  placeholder="Write a message…"
                  disabled={sending}
                  style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 999, padding: "10px 16px", color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, outline: "none" }}
                />
                <button onClick={send} disabled={sending || !input.trim()}
                  style={{ padding: "0 22px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em", cursor: input.trim() ? "pointer" : "not-allowed" }}>
                  {sending ? "…" : "SEND"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
