import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useAuth } from "../context/Auth";

export default function AdminInbox() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);
  const [rows, setRows] = useState([]);
  const [active, setActive] = useState(null); // { user_id, conversation_key }
  const [thread, setThread] = useState([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/signin"); return; }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      setIsAdmin(!!data?.is_admin);
    })();
  }, [user, authLoading, navigate]);

  // Load all messages (admins only — RLS enforces this).
  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, user_id, conversation_key, sender, text, created_at")
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) { console.error(error); return; }
      setRows(data || []);
    })();
    const channel = supabase
      .channel("admin-inbox")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => setRows(prev => [...prev, payload.new])
      )
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [isAdmin]);

  // Group rows into one entry per (user_id, conversation_key).
  const conversations = useMemo(() => {
    const map = new Map();
    for (const m of rows) {
      const key = `${m.user_id}::${m.conversation_key}`;
      const cur = map.get(key);
      if (!cur || new Date(m.created_at) > new Date(cur.last_at)) {
        map.set(key, {
          user_id: m.user_id,
          conversation_key: m.conversation_key,
          last_text: m.text,
          last_at: m.created_at,
          last_sender: m.sender,
        });
      }
    }
    return [...map.values()].sort((a, b) => new Date(b.last_at) - new Date(a.last_at));
  }, [rows]);

  useEffect(() => {
    if (!active) { setThread([]); return; }
    setThread(rows
      .filter(m => m.user_id === active.user_id && m.conversation_key === active.conversation_key)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    );
  }, [active, rows]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread]);

  const send = async () => {
    const text = reply.trim();
    if (!text || !active || sending) return;
    setSending(true);
    setReply("");
    const sender = active.conversation_key.startsWith("artist:") ? "artist" : "curator";
    const { error } = await supabase.from("chat_messages").insert({
      user_id: active.user_id,
      conversation_key: active.conversation_key,
      sender,
      text,
    });
    setSending(false);
    if (error) alert(error.message);
  };

  if (authLoading || isAdmin === null) {
    return <section style={{ padding: 100, textAlign: "center", color: "#D4AF37" }}>Loading…</section>;
  }
  if (!isAdmin) {
    return (
      <section style={{ padding: "120px 24px", textAlign: "center", color: "#e8e0d0" }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: "#fff" }}>Admins only</h1>
        <p style={{ marginTop: 12, color: "rgba(200,191,160,0.6)" }}>
          Run this in Supabase SQL Editor to grant access:
        </p>
        <pre style={{ display: "inline-block", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", padding: 14, borderRadius: 8, color: "#D4AF37", marginTop: 10, fontFamily: "monospace", fontSize: 12 }}>
{`update public.profiles set is_admin = true where id = '${user.id}';`}
        </pre>
      </section>
    );
  }

  return (
    <section style={{ padding: "100px 24px 60px", maxWidth: 1300, margin: "0 auto", color: "#e8e0d0" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: "#D4AF37" }}>ADMIN</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 700, color: "#fff", marginTop: 4 }}>Inbox</h1>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)", marginTop: 6 }}>
          Reply on behalf of artists and curators. Replies stream live to the user.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, minHeight: 540 }}>
        <aside style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 12, background: "rgba(255,255,255,0.02)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(212,175,55,0.15)", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37" }}>
            CONVERSATIONS · {conversations.length}
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {conversations.length === 0 && (
              <div style={{ padding: 24, color: "rgba(200,191,160,0.5)", fontSize: 13 }}>No conversations yet.</div>
            )}
            {conversations.map(c => {
              const isActive = active && c.user_id === active.user_id && c.conversation_key === active.conversation_key;
              return (
                <button
                  key={`${c.user_id}::${c.conversation_key}`}
                  onClick={() => setActive(c)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "14px 18px", border: "none", cursor: "pointer",
                    background: isActive ? "rgba(212,175,55,0.10)" : "transparent",
                    borderBottom: "1px solid rgba(212,175,55,0.08)",
                    color: "#e8e0d0",
                  }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", color: "#D4AF37" }}>
                    {c.conversation_key}
                  </div>
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#fff", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <span style={{ opacity: c.last_sender === "me" ? 1 : 0.6 }}>
                      {c.last_sender === "me" ? "" : `[${c.last_sender}] `}{c.last_text}
                    </span>
                  </div>
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.45)", marginTop: 4 }}>
                    {new Date(c.last_at).toLocaleString()} · user {c.user_id.slice(0, 8)}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 12, background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column" }}>
          {!active ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(200,191,160,0.5)", fontFamily: "'Raleway',sans-serif", fontSize: 14 }}>
              Select a conversation to view and reply.
            </div>
          ) : (
            <>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: "#D4AF37" }}>{active.conversation_key}</div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginTop: 3 }}>user {active.user_id}</div>
              </div>
              <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                {thread.map(m => (
                  <div key={m.id} style={{ alignSelf: m.sender === "me" ? "flex-start" : "flex-end", maxWidth: "70%" }}>
                    <div style={{
                      padding: "10px 14px", borderRadius: 14,
                      background: m.sender === "me" ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#D4AF37,#e8c53a)",
                      color: m.sender === "me" ? "#e8e0d0" : "#111",
                      fontFamily: "'Raleway',sans-serif", fontSize: 13, lineHeight: 1.5,
                    }}>{m.text}</div>
                    <div style={{ fontSize: 10, color: "rgba(200,191,160,0.4)", marginTop: 3, textAlign: m.sender === "me" ? "left" : "right" }}>
                      {m.sender} · {new Date(m.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: 14, borderTop: "1px solid rgba(212,175,55,0.15)", display: "flex", gap: 8 }}>
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") send(); }}
                  placeholder="Reply…"
                  disabled={sending}
                  style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 999, padding: "10px 16px", color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, outline: "none" }}
                />
                <button onClick={send} disabled={sending || !reply.trim()}
                  style={{ padding: "0 22px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em", cursor: "pointer" }}>
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
