import { createContext, useContext, useEffect, useRef, useState } from "react";
import { api, realtime } from "../utils/api";
import { useAuth } from "./Auth";

/**
 * Listens for new chat_messages and shows:
 *  - a browser Notification (if the user grants permission)
 *  - an in-app toast (rendered here)
 *
 * Behaviour:
 *  - Regular users get notified when sender !== 'me' for their own conversations.
 *  - Admins get notified when sender === 'me' (i.e. a user wrote to them).
 *  - Skips notifying about messages the current tab just sent itself.
 */
const Ctx = createContext({ unread: 0, setUnread: () => {} });

export function ChatNotificationsProvider({ children }) {
  const { user, role } = useAuth();
  const isAdmin = role === "admin";
  const [toasts, setToasts] = useState([]);
  const [unread, setUnread] = useState(0);
  const seen = useRef(new Set());

  // Ask permission once we have a user.
  useEffect(() => {
    if (!user) return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const handle = (m) => {
      if (seen.current.has(m.id)) return;
      seen.current.add(m.id);

      const isOwnMessage = m.sender === "me" && m.user_id === user.id;
      const userIsRecipient = m.user_id === user.id && m.sender !== "me";
      const adminIsRecipient =
        isAdmin && m.sender === "me" && m.user_id !== user.id;
      if (isOwnMessage && !adminIsRecipient) return;
      if (!userIsRecipient && !adminIsRecipient) return;

      const title = adminIsRecipient
        ? `New message · ${m.conversation_key}`
        : `${m.sender}: ${m.conversation_key}`;
      const body = m.text;

      if (
        "Notification" in window &&
        Notification.permission === "granted" &&
        document.hidden
      ) {
        try {
          new Notification(title, { body, tag: m.id });
        } catch {}
      }

      const id = m.id;
      setToasts((prev) => [...prev, { id, title, body }]);
      setUnread((prev) => prev + 1);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };

    // The server scopes delivery (own threads for users, all for admins), so we
    // subscribe to everything this client receives.
    const sub = realtime.channel("*").on("message", handle).subscribe();
    return () => sub.unsubscribe();
  }, [user, isAdmin]);

  return (
    <Ctx.Provider value={{ unread, setUnread }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 320,
        }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() =>
              setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }
            style={{
              background: "rgba(20,16,12,0.96)",
              border: "1px solid rgba(212,175,55,0.4)",
              borderRadius: 10,
              padding: "12px 16px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
              color: "#e8e0d0",
              cursor: "pointer",
              animation: "ar-toast-in 0.3s ease",
            }}>
            <div
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: 10,
                letterSpacing: "0.16em",
                color: "#D4AF37",
                marginBottom: 4,
              }}>
              {t.title}
            </div>
            <div
              style={{
                fontFamily: "'Raleway',sans-serif",
                fontSize: 13,
                lineHeight: 1.45,
              }}>
              {t.body}
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes ar-toast-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </Ctx.Provider>
  );
}

export const useChatNotifications = () => useContext(Ctx);

// Helper to get the user's unread count from the backend.
export async function getUnreadCount() {
  try {
    const { unread } = await api.chat.unread();
    return unread || 0;
  } catch (err) {
    console.error("Error getting unread count:", err);
    return 0;
  }
}

// Helper to mark a conversation as read.
export async function markMessagesAsRead(_userId, conversationKey) {
  try {
    await api.chat.read(conversationKey);
  } catch (err) {
    console.error("Error marking messages as read:", err);
  }
}
