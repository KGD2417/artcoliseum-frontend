/**
 * Shared helpers for turning a chat `conversation_key` / sender code into
 * human-readable labels. Keeps every messaging surface (Messages widget, Profile
 * inbox, notification toasts, Admin inbox) consistent — a raw key/id is never shown.
 *
 * conversation_key conventions (see backend app/models/chat.py):
 *   enquiry:<artwork_id>          user ↔ Art Coliseum team about an artwork
 *   peer:<minUserId>:<maxUserId>  artist ↔ artist (one row per msg, sender="me")
 *   artist:<slug> / curator:<id> / support:*   user ↔ team
 * senders: me | bot | artist | curator
 */

export const isPeerKey = (key) => typeof key === "string" && key.startsWith("peer:");

// "peer:<a>:<b>" → ["a", "b"]
export const peerIds = (key) =>
  isPeerKey(key) ? key.split(":").slice(1, 3) : [];

// The participant in a peer thread who isn't me.
export const otherPeerId = (key, meId) => {
  const ids = peerIds(key);
  const me = meId != null ? String(meId) : null;
  return ids.find((x) => x !== me) || ids[0] || null;
};

// "enquiry:<artwork_id>" → "<artwork_id>"
export const enquiryArtworkId = (key) =>
  typeof key === "string" && key.startsWith("enquiry:") ? key.slice(8) : null;

/**
 * Resolve a conversation_key to a display title.
 * @param key   the conversation_key
 * @param opts  { titles: {artworkId->title}, names: {userId->name}, meId }
 */
export function conversationTitle(key, { titles = {}, names = {}, meId = null } = {}) {
  if (!key) return "Conversation";

  // Enquiries — show the artwork's real title once resolved, not the id slug.
  if (key.startsWith("enquiry:")) {
    const id = key.slice(8);
    return titles[id] || "Art Coliseum Team";
  }

  // Direct messages — show the other person's name.
  if (key.startsWith("peer:")) {
    const ids = peerIds(key);
    const me = meId != null ? String(meId) : null;
    if (me && ids.includes(me)) {
      const other = ids.find((x) => x !== me);
      return names[other] || "Direct message";
    }
    // Admin / non-participant view: show both names when known.
    const labels = ids.map((x) => names[x]).filter(Boolean);
    return labels.length ? labels.join(" ↔ ") : "Direct message";
  }

  if (key.startsWith("artist:")) return "Artist Studio";
  if (key.startsWith("curator:")) return "Art Coliseum Curator";
  if (key.startsWith("support:")) return "Support Team";
  return "Conversation";
}

/** A friendly label for a sender code (used in previews / toasts). */
export function senderLabel(sender) {
  switch (sender) {
    case "me": return "You";
    case "curator": return "Curator";
    case "artist": return "Artist";
    case "bot": return "Art Coliseum";
    default: return "Art Coliseum";
  }
}
