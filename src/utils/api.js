/**
 * REST client for the Art Coliseum FastAPI backend.
 *
 * Replaces the Supabase SDK. Holds the access token in memory and the refresh
 * token in localStorage; transparently refreshes on a 401 and retries once.
 *
 * In dev, requests go to "/api/*" which Vite proxies to http://localhost:8000
 * (see vite.config.js), so there are no CORS issues and prod stays relative.
 */

const BASE = "/api";
const REFRESH_KEY = "coli_refresh";

let accessToken = null;

function setTokens({ access, refresh } = {}) {
  if (access !== undefined) accessToken = access;
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}
function clearTokens() {
  accessToken = null;
  localStorage.removeItem(REFRESH_KEY);
}
function getRefresh() {
  return localStorage.getItem(REFRESH_KEY);
}

async function rawRequest(method, path, { body, auth = true, isForm = false } = {}) {
  const headers = {};
  if (!isForm && body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return fetch(BASE + path, {
    method,
    headers,
    body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });
}

let refreshing = null;
async function tryRefresh() {
  if (refreshing) return refreshing;
  const refresh = getRefresh();
  if (!refresh) return false;
  refreshing = (async () => {
    const res = await rawRequest("POST", "/auth/refresh", { body: { refresh }, auth: false });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    setTokens(await res.json());
    return true;
  })();
  const ok = await refreshing;
  refreshing = null;
  return ok;
}

async function request(method, path, opts = {}) {
  let res = await rawRequest(method, path, opts);
  if (res.status === 401 && opts.auth !== false && getRefresh()) {
    if (await tryRefresh()) res = await rawRequest(method, path, opts);
  }
  if (!res.ok) {
    let detail;
    try { detail = (await res.json()).detail; } catch { detail = res.statusText; }
    const err = new Error(typeof detail === "string" ? detail : `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

export const api = {
  request,
  setTokens,
  clearTokens,
  hasSession: () => !!getRefresh(),

  auth: {
    async register(payload) {
      const data = await request("POST", "/auth/register", { body: payload, auth: false });
      setTokens(data);
      return data;
    },
    async login(payload) {
      const data = await request("POST", "/auth/login", { body: payload, auth: false });
      setTokens(data);
      return data;
    },
    me() {
      return request("GET", "/auth/me");
    },
    updateMe(patch) {
      return request("PATCH", "/auth/me", { body: patch });
    },
    async logout() {
      try { await request("POST", "/auth/logout"); } catch { /* ignore */ }
      clearTokens();
    },
  },

  chat: {
    conversation(key, userId) {
      const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
      return request("GET", `/chat/conversation/${encodeURIComponent(key)}${qs}`);
    },
    mine() {
      return request("GET", "/chat/mine");
    },
    adminAll() {
      return request("GET", "/chat/admin/all");
    },
    unread() {
      return request("GET", "/chat/unread");
    },
    send(body) {
      return request("POST", "/chat", { body });
    },
    reads() {
      return request("GET", "/chat/reads");
    },
    read(conversation_key) {
      return request("POST", "/chat/read", { body: { conversation_key } });
    },
    peers() {
      return request("GET", "/chat/peers");
    },
  },

  uploads: {
    /** Upload a File; kind = "image" | "video" | "model". Returns { url, kind }. */
    file(file, kind = "image") {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      return request("POST", "/uploads", { body: fd, isForm: true });
    },
  },

  enquiries: {
    create(payload) {
      const body = typeof payload === "string" ? { artwork_id: payload } : payload;
      return request("POST", "/enquiries", { body });
    },
    mine() { return request("GET", "/enquiries/mine"); },
    all() { return request("GET", "/enquiries"); },
    gate(artworkId) { return request("GET", `/enquiries/gate/${encodeURIComponent(artworkId)}`); },
    revealPrice(id, price, size_id) { return request("POST", `/enquiries/${id}/reveal-price`, { body: { price, size_id } }); },
    approve(id) { return request("POST", `/enquiries/${id}/approve`); },
    reject(id) { return request("POST", `/enquiries/${id}/reject`); },
  },

  cart: {
    breakdown() { return request("GET", "/cart/breakdown"); },
    addItem(body) { return request("POST", "/cart/items", { body }); },
    updateItem(id, fulfillment) { return request("PATCH", `/cart/items/${id}`, { body: { fulfillment } }); },
    removeItem(id) { return request("DELETE", `/cart/items/${id}`); },
  },

  orders: {
    create(body) { return request("POST", "/orders", { body }); },
    pay(id) { return request("POST", `/orders/${id}/pay`); },
    mine() { return request("GET", "/orders/mine"); },
    all() { return request("GET", "/orders"); },
    setStatus(id, status) { return request("PATCH", `/orders/${id}/status`, { body: { status } }); },
  },

  deliveries: {
    estimate(pincode) { return request("GET", `/deliveries/estimate${pincode ? `?pincode=${encodeURIComponent(pincode)}` : ""}`, { auth: false }); },
    byOrder(orderId) { return request("GET", `/deliveries/by-order/${orderId}`); },
    updateStage(id, body) { return request("PATCH", `/deliveries/${id}/stage`, { body }); },
    genOtp(id) { return request("POST", `/deliveries/${id}/otp`); },
    confirm(id, code) { return request("POST", `/deliveries/${id}/confirm`, { body: { code } }); },
  },

  reviews: {
    create(body) { return request("POST", "/reviews", { body }); },
    list() { return request("GET", "/reviews", { auth: false }); },
    forArtwork(id) { return request("GET", `/reviews/artwork/${encodeURIComponent(id)}`, { auth: false }); },
  },

  owned() { return request("GET", "/owned"); },

  artist: {
    apply(body) { return request("POST", "/artists/apply", { body }); },
    status() { return request("GET", "/artists/me/status"); },
    createArtwork(body) { return request("POST", "/artworks", { body }); },
    myArtworks() { return request("GET", "/artworks/mine"); },
    updateArtwork(id, patch) { return request("PATCH", `/artworks/${encodeURIComponent(id)}`, { body: patch }); },
    deleteArtwork(id) { return request("DELETE", `/artworks/${encodeURIComponent(id)}`); },
    addSubtype(label, parent_id) { return request("POST", "/categories/subtype", { body: { label, parent_id } }); },
  },

  competitions: {
    list() { return request("GET", "/competitions", { auth: false }); },
    create(body) { return request("POST", "/competitions", { body }); },
    submitEntry(id, body) { return request("POST", `/competitions/${id}/entries`, { body }); },
    entries(id) { return request("GET", `/competitions/${id}/entries`); },
    myEntries() { return request("GET", "/competitions/entries/mine"); },
    verdict(entryId, body) { return request("POST", `/competitions/entries/${entryId}/verdict`, { body }); },
    markWinner(entryId) { return request("POST", `/competitions/entries/${entryId}/winner`); },
  },

  community: {
    posts(community) { return request("GET", `/community/posts${community && community !== "all" ? `?community=${encodeURIComponent(community)}` : ""}`, { auth: false }); },
    createPost(body) { return request("POST", "/community/posts", { body }); },
    comment(id, text) { return request("POST", `/community/posts/${id}/comments`, { body: { text } }); },
    like(id) { return request("POST", `/community/posts/${id}/like`); },
    updatePost(id, body) { return request("PATCH", `/community/posts/${id}`, { body }); },
    deletePost(id) { return request("DELETE", `/community/posts/${id}`); },
    rooms() { return request("GET", "/community/rooms", { auth: false }); },
    roomMessages(slug) { return request("GET", `/community/rooms/${slug}/messages`, { auth: false }); },
    postRoomMessage(slug, text) { return request("POST", `/community/rooms/${slug}/messages`, { body: { text } }); },
  },

  events: {
    list() { return request("GET", "/events", { auth: false }); },
    create(body) { return request("POST", "/events", { body }); },
    update(id, body) { return request("PATCH", `/events/${id}`, { body }); },
    remove(id) { return request("DELETE", `/events/${id}`); },
    register(id, body) { return request("POST", `/events/${id}/register`, { body }); },
    registrations(id) { return request("GET", `/events/${id}/registrations`); },
  },

  support: {
    contact(body) { return request("POST", "/contact", { body, auth: false }); },
    listContact() { return request("GET", "/contact"); },
    createTicket(body) { return request("POST", "/support/tickets", { body }); },
    listTickets() { return request("GET", "/support/tickets"); },
    setTicketStatus(id, status) { return request("PATCH", `/support/tickets/${id}`, { body: { status } }); },
  },

  admin: {
    stats() { return request("GET", "/admin/stats"); },
    revenue() { return request("GET", "/admin/revenue"); },
    updateArtwork(id, patch) { return request("PATCH", `/artworks/${encodeURIComponent(id)}`, { body: patch }); },
    deleteArtwork(id) { return request("DELETE", `/artworks/${encodeURIComponent(id)}`); },
    artists() { return request("GET", "/admin/artists"); },
    createArtist(body) { return request("POST", "/admin/artists/create", { body }); },
    verifyArtist(userId) { return request("POST", `/admin/artists/${userId}/verify`); },
    setRole(userId, role) { return request("PATCH", `/admin/profiles/${userId}/role`, { body: { role } }); },
    // Create an artwork on behalf of a specific artist (admin only).
    createArtwork(body) { return request("POST", "/artworks", { body }); },
  },

  categories: {
    list() { return request("GET", "/categories", { auth: false }); },
    createMain(label) { return request("POST", "/categories", { body: { label } }); },
    createSubtype(label, parent_id) { return request("POST", "/categories/subtype", { body: { label, parent_id } }); },
    delete(id) { return request("DELETE", `/categories/${encodeURIComponent(id)}`); },
  },

  catalog: {
    artworks(params = {}) {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
      ).toString();
      return request("GET", `/artworks${qs ? `?${qs}` : ""}`, { auth: false });
    },
    artwork(id) {
      return request("GET", `/artworks/${encodeURIComponent(id)}`, { auth: false });
    },
    artists() {
      return request("GET", "/artists", { auth: false });
    },
    artist(id) {
      return request("GET", `/artists/${encodeURIComponent(id)}`, { auth: false });
    },
    artistArtworks(id) {
      return request("GET", `/artists/${encodeURIComponent(id)}/artworks`, { auth: false });
    },
    categories() {
      return request("GET", "/categories", { auth: false });
    },
  },
};

/**
 * Live chat over a single shared WebSocket (replaces Supabase Realtime).
 *
 *   const sub = realtime.channel(key).on("message", cb).subscribe();
 *   sub.unsubscribe();
 *
 * key "*" receives every message the server delivers to this client (the server
 * already scopes delivery to the user's own threads / all threads for admins).
 * Auto-reconnects with backoff while there are active listeners.
 */
let ws = null;
let reconnectTimer = null;
const wsListeners = new Set();

function openSocket() {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) return;
  const proto = location.protocol === "https:" ? "wss" : "ws";
  ws = new WebSocket(`${proto}://${location.host}/ws/chat?token=${encodeURIComponent(accessToken || "")}`);
  ws.onmessage = (e) => {
    let msg;
    try { msg = JSON.parse(e.data); } catch { return; }
    for (const l of wsListeners) {
      if (l.key === "*" || l.key === msg.conversation_key) {
        try { l.cb(msg); } catch { /* listener error */ }
      }
    }
  };
  ws.onclose = () => {
    ws = null;
    if (wsListeners.size > 0) {
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(openSocket, 2000);
    }
  };
  ws.onerror = () => { try { ws.close(); } catch { /* noop */ } };
}

export const realtime = {
  channel(key) {
    const entry = { key, cb: () => {} };
    return {
      on(_event, cb) { entry.cb = cb; return this; },
      subscribe() {
        wsListeners.add(entry);
        openSocket();
        return {
          unsubscribe() {
            wsListeners.delete(entry);
            if (wsListeners.size === 0 && ws) {
              try { ws.close(); } catch { /* noop */ }
              ws = null;
            }
          },
        };
      },
    };
  },
};

/** Map a backend ArtworkOut into the shape the gallery/cards expect. */
export function adaptArtwork(a) {
  if (!a) return a;
  return {
    ...a,
    img: a.images?.[0] || null,
    artist: (a.artist_name || "").toUpperCase(),
    dimensions: a.base_dimensions || a.dimensions || "",
    category: a.category_id,
  };
}

export default api;
