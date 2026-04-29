import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Reusable chat modal.
 *
 * Props:
 *  - open: bool
 *  - onClose: () => void
 *  - title: string             (header title — e.g. artist name or curator)
 *  - subtitle: string          (small line under title)
 *  - avatar: string            (image url)
 *  - intro: string[]           (initial bot greeting messages)
 *  - botReplies: string[]      (cycled responses to user messages)
 *  - showTakeItHome: bool      (renders the gold "Take it home" CTA)
 *  - takeItHomeLabel?: string  (defaults to "Take it home →")
 *  - onTakeItHome: () => void  (cb when CTA clicked)
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
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const replyIdx = useRef(0);

  useEffect(() => {
    if (!open) return;
    setMessages([]);
    setInput("");
    replyIdx.current = 0;
    let cancelled = false;
    const seed = async () => {
      for (let i = 0; i < intro.length; i++) {
        if (cancelled) return;
        setTyping(true);
        await new Promise((r) => setTimeout(r, 700));
        if (cancelled) return;
        setTyping(false);
        setMessages((m) => [...m, { from: "bot", text: intro[i] }]);
      }
    };
    seed();
    return () => {
      cancelled = true;
    };
  }, [open, intro]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "me", text }]);
    setInput("");
    setTyping(true);
    const reply = botReplies[replyIdx.current % botReplies.length];
    replyIdx.current += 1;
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: reply }]);
    }, 900);
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
              {messages.map((m, i) => (
                <div key={i} className={`chat-row chat-row-${m.from}`}>
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
                placeholder="Write a message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              />
              <button className="chat-send" onClick={send}>Send</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
