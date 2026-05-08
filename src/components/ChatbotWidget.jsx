import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WELCOME_MESSAGE = {
  id: "welcome",
  from: "bot",
  text: "Welcome to Art Coliseum! I'm your personal art assistant. Ask me about our artworks, the enquiry process, AR viewer, artists, or anything else you'd like to know.",
};

const BOT_RESPONSES = {
  enquire: [
    "Great choice! Click 'Enquire Now' on any artwork to start the process. You'll be guided through customisation options — size, material, frame, finish — and receive a personalised quote. No upfront payment required.",
  ],
  buy: [
    "Great choice! Click 'Enquire Now' on any artwork to start the process. You'll be guided through customisation options — size, material, frame, finish — and receive a personalised quote. No upfront payment required.",
  ],
  purchase: [
    "Great choice! Click 'Enquire Now' on any artwork to start the process. You'll be guided through customisation options — size, material, frame, finish — and receive a personalised quote. No upfront payment required.",
  ],
  ar: [
    "Our AR Viewer lets you point your camera at any wall and see exactly how an artwork will look in your space — at perfect scale. Visit the AR Viewer page from the navigation to try it now.",
  ],
  augmented: [
    "Our AR Viewer lets you point your camera at any wall and see exactly how an artwork will look in your space — at perfect scale. Visit the AR Viewer page from the navigation to try it now.",
  ],
  estimate: [
    "Our Estimate Calculator gives you a ballpark figure based on size, material, and framing. Visit /estimate to explore. Remember, exact pricing is always confirmed after your personalised enquiry.",
  ],
  price: [
    "Our Estimate Calculator gives you a ballpark figure based on size, material, and framing. Visit /estimate to explore. Remember, exact pricing is always confirmed after your personalised enquiry.",
  ],
  artist: [
    "Art Coliseum welcomes both established artists (direct registration) and emerging talents (through our curated exhibition & judging process). Visit 'Become an Artist' in the navigation.",
  ],
  exhibition: [
    "Art Coliseum welcomes both established artists (direct registration) and emerging talents (through our curated exhibition & judging process). Visit 'Become an Artist' in the navigation.",
  ],
  community: [
    "Our Community Hub connects artists, collectors, and curators. Share your passion, follow artists, join discussions, and stay updated on exhibitions. Visit /community to explore.",
  ],
  shipping: [
    "We offer global delivery for all artworks, fully insured and professionally packed. Each piece is carefully prepared by our logistics partners to arrive safely — wherever you are in the world.",
  ],
  delivery: [
    "We offer global delivery for all artworks, fully insured and professionally packed. Each piece is carefully prepared by our logistics partners to arrive safely — wherever you are in the world.",
  ],
  custom: [
    "Customisation is at the heart of Art Coliseum. Every artwork can be tailored to your exact specifications — dimensions, medium, palette, texture, finish, and framing. Our artists work with you, not just for you.",
  ],
  customiz: [
    "Customisation is at the heart of Art Coliseum. Every artwork can be tailored to your exact specifications — dimensions, medium, palette, texture, finish, and framing. Our artists work with you, not just for you.",
  ],
};

const FALLBACK =
  "Thank you for your question! Our team will be happy to assist you personally. Would you like to get in touch via the Help Desk?";

function getBotReply(input) {
  const lower = input.toLowerCase();
  for (const [keyword, replies] of Object.entries(BOT_RESPONSES)) {
    if (lower.includes(keyword)) {
      return replies[Math.floor(Math.random() * replies.length)];
    }
  }
  return FALLBACK;
}

let msgIdCounter = 1;
function nextId() {
  return `msg-${msgIdCounter++}`;
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, typing]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // Escape key to close
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Open via custom event fired from other pages (e.g. product enquiry)
  useEffect(() => {
    function onOpenChat() { setOpen(true); }
    window.addEventListener("open-artcoliseum-chat", onOpenChat);
    return () => window.removeEventListener("open-artcoliseum-chat", onOpenChat);
  }, []);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { id: nextId(), from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const botText = getBotReply(trimmed);
      setTyping(false);
      setMessages((prev) => [...prev, { id: nextId(), from: "bot", text: botText }]);
    }, 900 + Math.random() * 400);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 14,
        fontFamily: "'Raleway', sans-serif",
      }}>
      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: 400,
              height: 520,
              background: "#111",
              border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.1)",
            }}>
            {/* Header */}
            <div
              style={{
                padding: "18px 20px 14px",
                borderBottom: "1px solid rgba(212,175,55,0.15)",
                background: "rgba(212,175,55,0.04)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Gold avatar */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #D4AF37, #a8892a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Cinzel', serif",
                    fontSize: 12,
                    color: "#080808",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                  AC
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#f0e8d8",
                      lineHeight: 1.2,
                    }}>
                    Art Coliseum Assistant
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cinzel', serif",
                      fontSize: 9,
                      letterSpacing: "0.14em",
                      color: "rgba(212,175,55,0.7)",
                      marginTop: 2,
                    }}>
                    ASK ME ANYTHING ABOUT ART
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(200,191,160,0.5)",
                  fontSize: 22,
                  lineHeight: 1,
                  cursor: "pointer",
                  padding: "4px 6px",
                  borderRadius: 6,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#D4AF37")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(200,191,160,0.5)")}>
                ×
              </button>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 16px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(212,175,55,0.2) transparent",
              }}>
              {messages.map((msg) =>
                msg.from === "bot" ? (
                  <BotMessage key={msg.id} text={msg.text} />
                ) : (
                  <UserMessage key={msg.id} text={msg.text} />
                )
              )}

              {typing && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              style={{
                padding: "12px 14px",
                borderTop: "1px solid rgba(212,175,55,0.12)",
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexShrink: 0,
                background: "rgba(0,0,0,0.3)",
              }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about art, enquiries, AR..."
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#e8e0d0",
                  fontFamily: "'Raleway', sans-serif",
                  fontSize: 13,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)")}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: input.trim() ? "#D4AF37" : "rgba(212,175,55,0.2)",
                  border: "none",
                  cursor: input.trim() ? "pointer" : "default",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}>
                <SendIcon active={!!input.trim()} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #D4AF37, #a8892a)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 28px rgba(212,175,55,0.35), 0 2px 8px rgba(0,0,0,0.5)",
          flexShrink: 0,
        }}>
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              style={{ fontSize: 24, color: "#080808", lineHeight: 1, fontWeight: 300 }}>
              ×
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ opacity: 0, rotate: 90, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.7 }}
              transition={{ duration: 0.18 }}>
              <ChatBubbleIcon />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

function BotMessage({ text }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", maxWidth: "88%" }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #D4AF37, #a8892a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Cinzel', serif",
          fontSize: 8,
          color: "#080808",
          fontWeight: 700,
          flexShrink: 0,
          marginTop: 2,
        }}>
        AC
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(212,175,55,0.12)",
          borderRadius: "4px 12px 12px 12px",
          padding: "10px 14px",
          fontFamily: "'Raleway', sans-serif",
          fontSize: 13,
          lineHeight: 1.65,
          color: "rgba(200,191,160,0.9)",
        }}>
        {text}
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div
        style={{
          background: "rgba(212,175,55,0.15)",
          border: "1px solid rgba(212,175,55,0.25)",
          borderRadius: "12px 4px 12px 12px",
          padding: "10px 14px",
          fontFamily: "'Raleway', sans-serif",
          fontSize: 13,
          lineHeight: 1.65,
          color: "#e8e0d0",
          maxWidth: "82%",
        }}>
        {text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #D4AF37, #a8892a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Cinzel', serif",
          fontSize: 8,
          color: "#080808",
          fontWeight: 700,
          flexShrink: 0,
          marginTop: 2,
        }}>
        AC
      </div>
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(212,175,55,0.12)",
          borderRadius: "4px 12px 12px 12px",
          padding: "12px 16px",
          display: "flex",
          gap: 5,
          alignItems: "center",
        }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#D4AF37",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ChatBubbleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        fill="#080808"
      />
    </svg>
  );
}

function SendIcon({ active }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <line x1="22" y1="2" x2="11" y2="13" stroke={active ? "#080808" : "rgba(200,191,160,0.4)"} strokeWidth="2" strokeLinecap="round" />
      <polygon
        points="22 2 15 22 11 13 2 9 22 2"
        fill={active ? "#080808" : "rgba(200,191,160,0.4)"}
      />
    </svg>
  );
}
