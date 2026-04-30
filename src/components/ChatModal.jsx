import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../utils/supabase";
import { useAuth } from "../context/Auth";

/**
 * Realtime chat modal. Messages persist in Supabase and stream in via
 * Supabase Realtime. Requires the user to be signed in.
 *
 * Required prop:
 *  - conversationKey: string  e.g. "artist:elena-vance" or "curator:p1"
 *
 * Other props (UI):
 *  open, onClose, title, subtitle, avatar, intro[], botReplies[],
 *  showTakeItHome, takeItHomeLabel, onTakeItHome
 */
export default function ChatModal({
  open,
  onClose,
  title,
  subtitle,
  avatar,
  intro = [],
  botReplies = ["Thank you, let me check that for you.", "Of course — happy to help."],
  showTakeItHome = false,
  takeItHomeLabel = "Take it home →",
  onTakeItHome,
  conversationKey,
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const replyIdx = useRef(0);

  // Load history + subscribe to realtime when opened.
  useEffect(() => {
    if (!open || !user || !conversationKey) return;
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, sender, text, created_at")
        .eq("user_id", user.id)
        .eq("conversation_key", conversationKey)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) { console.error(error); return; }

      if (data.length === 0) {
        // Seed intro into DB so first-time chat shows greeting.
        if (intro.length) {
          const rows = intro.map(t => ({
            user_id: user.id,
            conversation_key: conversationKey,
            sender: "bot",
            text: t,
          }));
          await supabase.from("chat_messages").insert(rows);
        }
      } else {
        setMessages(data.map(m => ({ id: m.id, from: m.sender === "me" ? "me" : "bot", text: m.text })));
      }
    })();

    const channel = supabase
      .channel(`chat:${user.id}:${conversationKey}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_key=eq.${conversationKey}`,
        },
        (payload) => {
          const m = payload.new;
          if (m.user_id !== user.id) return;
          setMessages(prev => {
            if (prev.find(x => x.id === m.id)) return prev;
            return [...prev, { id: m.id, from: m.sender === "me" ? "me" : "bot", text: m.text }];
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [open, user, conversationKey]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInput("");
      replyIdx.current = 0;
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending || !user || !conversationKey) return;
    setSending(true);
    setInput("");
    const { error } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      conversation_key: conversationKey,
      sender: "me",
      text,
    });
    setSending(false);
    if (error) alert(error.message);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="chat-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}>
          <motion.div
            className="chat-modal"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}>
            <div className="chat-header">
              <div className="chat-header-left">
                {avatar && <img src={avatar} alt={title} className="chat-avatar" />}
                <div>
                  <div className="chat-header-title">{title}</div>
                  {subtitle && <div className="chat-header-sub">{subtitle}</div>}
                  <div className="chat-header-status">
                    <span className="chat-status-dot" /> Online
                  </div>
                </div>
              </div>
              <button className="chat-close" onClick={onClose} aria-label="Close">×</button>
            </div>

            <div className="chat-body" ref={scrollRef}>
              {!user && (
                <div style={{ padding: 20, textAlign: "center", color: "rgba(200,191,160,0.7)", fontFamily: "'Raleway',sans-serif", fontSize: 13 }}>
                  Please sign in to start a chat.
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`chat-row chat-row-${m.from}`}>
                  <div className={`chat-bubble chat-bubble-${m.from}`}>{m.text}</div>
                </div>
              ))}
              {typing && (
                <div className="chat-row chat-row-bot">
                  <div className="chat-bubble chat-bubble-bot chat-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
            </div>

            {showTakeItHome && (
              <div className="chat-cta-wrap">
                <button className="chat-cta" onClick={onTakeItHome}>
                  {takeItHomeLabel}
                </button>
              </div>
            )}

            <div className="chat-composer">
              <input
                className="chat-input"
                placeholder={user ? "Write a message…" : "Sign in to chat"}
                value={input}
                disabled={!user || sending}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              />
              <button className="chat-send" onClick={send} disabled={!user || sending}>
                {sending ? "…" : "Send"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
