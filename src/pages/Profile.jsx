import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "../components/SafeImage";
import MediaUploader from "../components/ui/MediaUploader";
import { Skeleton, SkeletonRows } from "../components/ui/Skeleton";
import { useLocale, LANGS } from "../context/Locale";
import { CheckIcon, CopyIcon } from "../components/Icons";
import { api, realtime } from "../utils/api";
import { STAGE_ORDER, STAGE_LABEL } from "../utils/delivery";
import { useAuth } from "../context/Auth";
import { conversationTitle, senderLabel, isPeerKey, peerIds, enquiryArtworkId } from "../utils/chatLabels";
import { validateForm, isValid, required, phoneIN, pincodeIN, genId } from "../utils/validation";
import { countryOptions, stateOptions, cityOptions, DEFAULT_COUNTRY_CODE, countryNameFromCode } from "../utils/locations";
import i3 from "../assets/i3.png";
import i6 from "../assets/i6.png";

const TABS = [
  { id: "details",  label: "Profile Details" },
  { id: "orders",   label: "Order Tracking" },
  { id: "events",   label: "My Events" },
  { id: "inbox",    label: "Messages" },
  { id: "collection", label: "My Collection" },
  { id: "wishlist", label: "Saved" },
  { id: "help",     label: "Help Desk" },
  { id: "notifs",   label: "Notifications" },
  { id: "language", label: "Language" },
];

const EMPTY_USER = { name: "", email: "", phone: "", address: "", password: "••••••••••", avatar_url: "" };

const CART = [
  { id: "p-101", title: "Fragmented Memory",  artist: "Soren Klein", price: 8400, img: i6 },
  { id: "p-102", title: "Architectural Echo", artist: "Elena Vance", price: 4200, img: i3 },
];

const NOTIFS = [
  { type: "ORDER",      msg: "Your order #AU-99281 is out for white-glove delivery.",      time: "2h ago" },
  { type: "ARTIST",     msg: "Elena Vance just released a new collection: Renaissance Echoes.", time: "1d ago" },
  { type: "PROMO",      msg: "Early access: private viewing of The Modernists & The Muses opens Friday.", time: "3d ago" },
  { type: "REVIEW",     msg: "Tell us about Echoes of Silence — your review helps fellow collectors.", time: "1w ago" },
];

export default function Profile() {
  const { lang, setLang } = useLocale();
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading, role, artistStatus, signOut, refreshUser } = useAuth();
  const isAdmin = role === "admin";
  // Admins manage the platform from the dashboard — never treat them as an artist
  // here, even if their account also carries a (stale) artist status.
  const isArtist = !isAdmin && (role === "artist" || artistStatus === "verified");
  const isPendingArtist = !isAdmin && (artistStatus === "pending" || artistStatus === "unverified");
  const [artistRole, setArtistRole] = useState("");
  const [tab, setTab] = useState("details");
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(EMPTY_USER);
  const [draft, setDraft] = useState(EMPTY_USER);
  const [addresses, setAddresses] = useState([]);
  const [bankDetails, setBankDetails] = useState(null);
  const [regEvents, setRegEvents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [owned, setOwned] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [convThread, setConvThread] = useState([]);
  const [convReply, setConvReply] = useState("");
  const [profLoading, setProfLoading] = useState(true);
  const [chatTitles, setChatTitles] = useState({}); // artworkId -> title (enquiry threads)
  const [chatNames, setChatNames] = useState({});   // userId -> name (peer DM threads)

  const convLabel = (key) =>
    conversationTitle(key, { titles: chatTitles, names: chatNames, meId: authUser?.id });

  useEffect(() => {
    if (!authLoading && !authUser) {
      navigate("/signin");
    }
  }, [authLoading, authUser, navigate]);

  useEffect(() => {
    if (!authUser) return;
    (async () => {
      let prof = {};
      try { prof = await api.auth.me(); } catch { /* ignore */ }
      const next = {
        name: prof?.full_name || "",
        email: authUser.email || "",
        phone: prof?.phone || "",
        address: "",
        password: "••••••••••",
        avatar_url: prof?.avatar_url || "",
      };
      setUser(next);
      setDraft(next);
      setAddresses(prof?.addresses || []);
      setBankDetails(prof?.bank_details || null);

      try {
        const ords = await api.orders.mine();
        setOrders(ords.map(o => ({
          rawId: o.id,
          id: "AU-" + o.id.slice(0, 6).toUpperCase(),
          item: (o.items || []).map(i => i.title).filter(Boolean).join(", ") || "Order",
          total: Number(o.total),
          status: (o.status || "pending").toUpperCase(),
          eta: new Date(o.created_at).toLocaleDateString(),
        })));
      } catch { setOrders([]); }
      try { setRegEvents(await api.events.myRegistrations()); } catch { setRegEvents([]); }
      try { setOwned(await api.owned()); } catch { setOwned([]); }
      try { setWishlist(await api.wishlist.list()); } catch { setWishlist([]); }
      try { setSavedListings(await api.wishlist.listings()); } catch { setSavedListings([]); }

      let msgs = [], reads = [];
      try {
        [msgs, reads] = await Promise.all([api.chat.mine(), api.chat.reads()]);
      } catch { /* ignore */ }
      const readMap = new Map((reads ?? []).map(r => [r.conversation_key, new Date(r.last_read_at)]));
      const grouped = new Map();
      for (const m of msgs ?? []) {
        const cur = grouped.get(m.conversation_key) ?? { conversation_key: m.conversation_key, unread: 0 };
        cur.last_text = m.text;
        cur.last_sender = m.sender;
        cur.last_at = m.created_at;
        // Incoming = someone else wrote it. Peer DMs are all sender="me", so use
        // the author user_id there.
        const incoming = isPeerKey(m.conversation_key)
          ? String(m.user_id) !== String(authUser.id)
          : m.sender !== "me";
        if (incoming) {
          const lastRead = readMap.get(m.conversation_key);
          if (!lastRead || new Date(m.created_at) > lastRead) cur.unread += 1;
        }
        grouped.set(m.conversation_key, cur);
      }
      setConversations(
        [...grouped.values()].sort((a, b) => new Date(b.last_at) - new Date(a.last_at))
      );
      setProfLoading(false);
    })();
  }, [authUser]);

  // Artists: surface their craft in the header (their full artist profile lives
  // in the Studio — we never ask them to re-enter it here).
  useEffect(() => {
    if (!authUser || !isArtist) return;
    let cancelled = false;
    api.artist
      .profile()
      .then((p) => { if (!cancelled) setArtistRole(p?.art_type || p?.role || ""); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [authUser, isArtist]);

  // Resolve readable labels for the inbox: artwork titles (enquiry threads) and
  // participant names (peer DM threads). Runs whenever the conversation list grows.
  useEffect(() => {
    if (!authUser) return;
    const needTitles = [...new Set(
      conversations.map(c => enquiryArtworkId(c.conversation_key)).filter(id => id && !(id in chatTitles)),
    )];
    const needNames = [...new Set(
      conversations.filter(c => isPeerKey(c.conversation_key))
        .flatMap(c => peerIds(c.conversation_key))
        .filter(id => id && !(id in chatNames)),
    )];
    if (needTitles.length) {
      Promise.all(needTitles.map(id =>
        api.catalog.artwork(id).then(a => [id, a?.title || null]).catch(() => [id, null]),
      )).then(pairs => setChatTitles(prev => ({ ...prev, ...Object.fromEntries(pairs) })));
    }
    if (needNames.length) {
      api.chat.names(needNames).then(map => setChatNames(prev => ({ ...prev, ...map }))).catch(() => {});
    }
  }, [conversations, authUser, chatTitles, chatNames]);

  // Realtime: append new messages to active thread + bump conversation list.
  useEffect(() => {
    if (!authUser) return;
    const sub = realtime
      .channel("*")
      .on("message", (m) => {
          // Accept my own-thread messages and peer DMs where I'm a participant.
          const mine = m.user_id === authUser.id;
          const peerForMe = isPeerKey(m.conversation_key) && peerIds(m.conversation_key).includes(String(authUser.id));
          if (!mine && !peerForMe) return;
          setConversations(prev => {
            const idx = prev.findIndex(c => c.conversation_key === m.conversation_key);
            const next = idx >= 0 ? [...prev] : [{ conversation_key: m.conversation_key, unread: 0 }, ...prev];
            const target = idx >= 0 ? { ...next[idx] } : next[0];
            target.last_text = m.text;
            target.last_sender = m.sender;
            target.last_at = m.created_at;
            const incoming = isPeerKey(m.conversation_key)
              ? String(m.user_id) !== String(authUser.id)
              : m.sender !== "me";
            if (incoming && (!activeConv || activeConv !== m.conversation_key)) {
              target.unread = (target.unread || 0) + 1;
            }
            if (idx >= 0) next[idx] = target; else next[0] = target;
            return next.sort((a, b) => new Date(b.last_at) - new Date(a.last_at));
          });
          if (activeConv === m.conversation_key) {
            setConvThread(prev => prev.find(x => x.created_at === m.created_at && x.text === m.text) ? prev : [...prev, m]);
          }
        })
      .subscribe();
    return () => sub.unsubscribe();
  }, [authUser, activeConv]);

  const openConversation = async (key) => {
    setActiveConv(key);
    setConvReply("");
    try {
      const data = await api.chat.conversation(key);
      setConvThread(data ?? []);
      await api.chat.read(key);
    } catch (e) { console.error(e); }
    setConversations(prev => prev.map(c => c.conversation_key === key ? { ...c, unread: 0 } : c));
  };

  const sendConvReply = async () => {
    const text = convReply.trim();
    if (!text || !activeConv) return;
    setConvReply("");
    try {
      const m = await api.chat.send({ conversation_key: activeConv, sender: "me", text });
      setConvThread(prev => prev.find(x => x.id === m.id) ? prev : [...prev, m]);
    } catch (e) { alert(e.message); }
  };

  const startEdit = () => { setDraft(user); setEditing(true); };
  const save = async () => {
    // Email and phone are locked after registration — only the name is editable
    // here (password has its own change form).
    if (authUser) {
      try { await api.auth.updateMe({ full_name: draft.name }); } catch { /* ignore */ }
    }
    setUser((u) => ({ ...u, name: draft.name }));
    setEditing(false);
  };
  // Persist the saved-address book (also drives the checkout picker).
  const saveAddresses = async (next) => {
    setAddresses(next);
    try { const m = await api.auth.updateMe({ addresses: next }); setAddresses(m?.addresses || next); }
    catch { /* keep optimistic value */ }
  };
  // Persist the buyer/artist bank payout details.
  const saveBankDetails = async (next) => {
    setBankDetails(next);
    try { const m = await api.auth.updateMe({ bank_details: next }); setBankDetails(m?.bank_details ?? next); }
    catch { /* keep optimistic value */ }
  };
  // Profile picture — persists immediately on upload/change (no Edit mode needed).
  const saveAvatar = async (url) => {
    setUser((u) => ({ ...u, avatar_url: url }));
    setDraft((d) => ({ ...d, avatar_url: url }));
    try {
      await api.auth.updateMe({ avatar_url: url });
      refreshUser();  // propagate the new photo to the nav and everywhere else
    } catch { /* keep optimistic value */ }
  };
  const handleSignOut = async () => { await signOut(); navigate("/"); };
  const removeWishlist = async (artworkId) => {
    setWishlist((prev) => prev.filter((w) => w.artwork_id !== artworkId));
    try { await api.wishlist.remove(artworkId); } catch { /* keep optimistic removal */ }
  };
  const removeSavedListing = async (postId) => {
    setSavedListings((prev) => prev.filter((l) => l.post_id !== postId));
    try { await api.wishlist.removeListing(postId); } catch { /* keep optimistic removal */ }
  };

  const CART = [];
  const NOTIFS = [];

  if (authLoading || profLoading) {
    return (
      <section style={{ padding: "100px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 40 }}>
          <Skeleton width={78} height={78} radius={999} />
          <div style={{ flex: 1, maxWidth: 320 }}>
            <Skeleton width="40%" height={12} />
            <Skeleton width="70%" height={32} radius={8} style={{ marginTop: 10 }} />
            <Skeleton width="55%" height={14} style={{ marginTop: 10 }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 32 }} className="profile-grid">
          <Skeleton height={260} radius={12} />
          <SkeletonRows count={4} height={72} gap={14} />
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "100px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ display: "flex", alignItems: "center", gap: 22, marginBottom: 40, flexWrap: "wrap" }}>
        {user.avatar_url ? (
          <img src={user.avatar_url} alt="" style={{
            width: 78, height: 78, borderRadius: "50%", objectFit: "cover",
            border: "2px solid #D4AF37", boxShadow: "0 0 28px rgba(212,175,55,0.18)",
          }} />
        ) : (
          <div style={{
            width: 78, height: 78, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))",
            border: "2px solid #D4AF37",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Cinzel',serif", fontSize: 26, fontWeight: 700, color: "#D4AF37",
            boxShadow: "0 0 28px rgba(212,175,55,0.18)",
          }}>
            {user.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
          </div>
        )}
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.2em", color: "#D4AF37" }}>
            {isAdmin ? "ADMINISTRATOR" : isArtist ? "ARTIST PROFILE" : isPendingArtist ? "ARTIST APPLICATION · UNDER REVIEW" : "COLLECTOR PROFILE"}
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 700, color: "#fff", marginTop: 4 }}>{user.name}</h1>
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)" }}>
            {user.email}{isArtist && artistRole ? ` · ${artistRole}` : ""}
          </div>
        </div>
        {isArtist && (
          <Link
            to="/become-artist"
            className="btn-gold-main"
            style={{ marginLeft: "auto", padding: "12px 24px", fontSize: 11, textDecoration: "none", whiteSpace: "nowrap" }}>
            ARTIST STUDIO →
          </Link>
        )}
        {isPendingArtist && (
          <Link
            to="/become-artist"
            style={{
              marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: 999, textDecoration: "none", whiteSpace: "nowrap",
              fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", fontWeight: 700,
              color: "#fbbf24", background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.45)",
            }}>
            <span aria-hidden>⏳</span> APPLICATION UNDER REVIEW
          </Link>
        )}
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 32 }} className="profile-grid">
        {/* sidebar */}
        <aside style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(212,175,55,0.12)",
          borderRadius: 12, padding: "20px 14px", height: "fit-content",
        }}>
          {TABS.map(t => {
            const unread = t.id === "inbox" ? conversations.reduce((s, c) => s + (c.unread || 0), 0) : 0;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", textAlign: "left",
                  padding: "12px 16px", marginBottom: 4,
                  background: tab === t.id ? "rgba(212,175,55,0.10)" : "transparent",
                  border: "none", borderRadius: 8, cursor: "pointer",
                  fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em",
                  color: tab === t.id ? "#D4AF37" : "rgba(200,191,160,0.65)",
                  transition: "all 0.2s",
                }}>
                <span>{t.label.toUpperCase()}</span>
                {unread > 0 && (
                  <span style={{
                    background: "#D4AF37", color: "#111", borderRadius: 999,
                    padding: "2px 8px", fontSize: 10, fontWeight: 700,
                  }}>{unread}</span>
                )}
              </button>
            );
          })}
        </aside>

        {/* content */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}>

              {tab === "details" && (
                <Card title="Profile Details" action={
                  editing
                    ? <button onClick={save} className="btn-gold-main" style={{ padding: "10px 22px", fontSize: 11 }}>SAVE</button>
                    : <button onClick={startEdit} className="btn-outline" style={{ padding: "10px 22px", fontSize: 11 }}>EDIT</button>
                }>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(212,175,55,0.3)" }} />
                    ) : (
                      <div style={{ width: 72, height: 72, borderRadius: "50%", border: "1px dashed rgba(212,175,55,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(212,175,55,0.4)", fontSize: 22 }}>✦</div>
                    )}
                    <div>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)", marginBottom: 6 }}>PROFILE PHOTO</div>
                      <MediaUploader kind="image" preview={false} hint="CHANGE PHOTO" value={user.avatar_url} onChange={saveAvatar} />
                    </div>
                  </div>
                  <Field label="Name"  value={editing ? draft.name : user.name} editing={editing} onChange={v => setDraft({ ...draft, name: v })} />
                  {/* Email and phone are fixed once the account is created. */}
                  <Field label="Email" value={user.email} editing={false} locked />
                  <Field label="Phone" value={user.phone} editing={false} locked />
                  {editing
                    ? <ChangePassword />
                    : <Field label="Password" value={user.password} editing={false} />}
                  <div style={{ height: 1, background: "rgba(212,175,55,0.14)", margin: "8px 0 20px" }} />
                  <AddressBook addresses={addresses} onChange={saveAddresses} />
                  <div style={{ height: 1, background: "rgba(212,175,55,0.14)", margin: "8px 0 20px" }} />
                  <BankDetails details={bankDetails} onChange={saveBankDetails} />
                  <button onClick={handleSignOut} className="btn-outline" style={{ marginTop: 8, padding: "10px 22px", fontSize: 11 }}>SIGN OUT</button>
                </Card>
              )}

              {tab === "orders" && (
                <Card title="Order Tracking">
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {orders.length === 0 && (
                      <div style={{ padding: 24, textAlign: "center", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.55)" }}>No orders yet.</div>
                    )}
                    {orders.map(o => (
                      <OrderTracker key={o.rawId} order={o} />
                    ))}
                  </div>
                </Card>
              )}

              {tab === "events" && (
                <Card title="My Events">
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {regEvents.length === 0 && (
                      <div style={{ padding: 24, textAlign: "center", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.55)" }}>
                        You haven't registered for any events yet. <Link to="/events" style={{ color: "#D4AF37" }}>Browse events →</Link>
                      </div>
                    )}
                    {regEvents.map(ev => {
                      const when = ev.starts_at ? new Date(ev.starts_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";
                      return (
                        <div key={ev.id} style={{ padding: "18px 20px", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                            <div>
                              <div style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", marginBottom: 8 }}>REGISTERED ✓</div>
                              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, color: "#f0e8d8" }}>{ev.title}</div>
                              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.65)", marginTop: 4 }}>
                                {ev.location || "Venue to be announced"}{when ? ` · ${when}` : ""}
                              </div>
                              {ev.address && <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginTop: 4 }}>📍 {ev.address}</div>}
                              {ev.parking && <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginTop: 2 }}>🅿️ {ev.parking}</div>}
                            </div>
                            {(ev.address || ev.location) && (
                              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.address || ev.location)}`} target="_blank" rel="noopener noreferrer"
                                className="btn-outline" style={{ padding: "8px 16px", fontSize: 10, textDecoration: "none", whiteSpace: "nowrap" }}>
                                GET DIRECTIONS →
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {tab === "inbox" && (
                <Card title="Messages">
                  {conversations.length === 0 ? (
                    <div style={{ padding: 24, textAlign: "center", color: "rgba(200,191,160,0.5)", fontFamily: "'Raleway',sans-serif", fontSize: 13 }}>
                      No conversations yet. Open an artist or product page and tap the chat to start one.
                    </div>
                  ) : activeConv ? (
                    <div>
                      <button onClick={() => setActiveConv(null)} style={{
                        background: "transparent", border: "1px solid rgba(212,175,55,0.25)",
                        color: "#D4AF37", padding: "6px 14px", borderRadius: 999,
                        fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", cursor: "pointer", marginBottom: 14,
                      }}>← BACK</button>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", color: "#D4AF37", marginBottom: 10 }}>{convLabel(activeConv)}</div>
                      <div style={{ maxHeight: 380, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, padding: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 8, marginBottom: 12 }}>
                        {convThread.map(m => {
                          // Peer DMs are all sender="me"; decide the side by author user_id.
                          const own = isPeerKey(activeConv) ? String(m.user_id) === String(authUser?.id) : m.sender === "me";
                          return (
                          <div key={m.id || m.created_at} style={{ alignSelf: own ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                            <div style={{
                              padding: "8px 12px", borderRadius: 12,
                              background: own ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "rgba(255,255,255,0.06)",
                              color: own ? "#111" : "#e8e0d0",
                              fontFamily: "'Raleway',sans-serif", fontSize: 13,
                            }}>{m.text}</div>
                          </div>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          value={convReply}
                          onChange={e => setConvReply(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") sendConvReply(); }}
                          placeholder="Reply…"
                          style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 999, padding: "10px 16px", color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, outline: "none" }}
                        />
                        <button onClick={sendConvReply} disabled={!convReply.trim()}
                          style={{ padding: "0 22px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em", cursor: convReply.trim() ? "pointer" : "not-allowed" }}>
                          SEND
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {conversations.map(c => (
                        <button
                          key={c.conversation_key}
                          onClick={() => openConversation(c.conversation_key)}
                          style={{
                            textAlign: "left", padding: "14px 16px", cursor: "pointer",
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(212,175,55,0.12)", borderRadius: 8,
                            color: "#e8e0d0",
                          }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", color: "#D4AF37" }}>
                              {convLabel(c.conversation_key)}
                            </span>
                            {c.unread > 0 && (
                              <span style={{
                                background: "#D4AF37", color: "#111", borderRadius: 999,
                                padding: "2px 8px", fontFamily: "'Cinzel',serif", fontSize: 10, fontWeight: 700,
                              }}>{c.unread}</span>
                            )}
                          </div>
                          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.last_sender && c.last_sender !== "me" ? `${senderLabel(c.last_sender)}: ` : ""}{c.last_text}
                          </div>
                          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.5)", marginTop: 4 }}>
                            {c.last_at ? new Date(c.last_at).toLocaleString() : ""}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {tab === "collection" && (
                <Card title="My Collection" action={
                  <Link to="/become-artist" className="btn-gold-main" style={{ padding: "10px 22px", fontSize: 11, textDecoration: "none" }}>UPDATE SELF COLLECTION</Link>
                }>
                  {owned.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: "rgba(200,191,160,0.5)" }}>
                      Your collection is empty. Acquired pieces — in digital and physical form — appear here.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 16 }}>
                      {owned.map(o => (
                        <div key={o.id} style={{ border: "1px solid rgba(212,175,55,0.12)", borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,0.02)" }}>
                          <div style={{ position: "relative" }}>
                            <SafeImage src={o.image} alt={o.title} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} />
                            <span style={{
                              position: "absolute", top: 8, right: 8, padding: "4px 10px", borderRadius: 999,
                              fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.12em",
                              background: o.kind === "physical" ? "rgba(74,222,128,0.9)" : "rgba(212,175,55,0.92)", color: "#111",
                            }}>{o.kind === "physical" ? "PHYSICAL" : "DIGITAL"}</span>
                          </div>
                          <div style={{ padding: "10px 12px" }}>
                            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#f0e8d8", lineHeight: 1.2 }}>{o.title}</div>
                            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: "0.14em", color: "rgba(200,191,160,0.55)", marginTop: 4 }}>{(o.artist_name || "").toUpperCase()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {tab === "wishlist" && (
                <Card title="Saved for Later">
                  {wishlist.length === 0 && savedListings.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: "rgba(200,191,160,0.5)" }}>
                      Nothing saved yet. Tap the ♥ on any artwork — or Save on a marketplace listing — to keep it here and pick up where you left off.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 16 }}>
                      {wishlist.map(w => (
                        <div key={w.artwork_id} style={{ border: "1px solid rgba(212,175,55,0.12)", borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column" }}>
                          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => navigate(`/product/${w.artwork_id}`)}>
                            <SafeImage src={w.image} alt={w.title} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} />
                            {!w.available && (
                              <span style={{ position: "absolute", top: 8, left: 8, padding: "4px 10px", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.12em", background: "rgba(0,0,0,0.72)", color: "#fca5a5", border: "1px solid rgba(248,113,113,0.5)" }}>UNAVAILABLE</span>
                            )}
                          </div>
                          <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
                            <div onClick={() => navigate(`/product/${w.artwork_id}`)} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#f0e8d8", lineHeight: 1.2, cursor: "pointer" }}>{w.title || "Untitled"}</div>
                            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: "0.14em", color: "rgba(200,191,160,0.55)", marginTop: 4 }}>{(w.artist_name || "").toUpperCase()}</div>
                            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "#D4AF37", marginTop: 6 }}>
                              {w.customizable ? "Customizable" : (w.price ? "₹" + Number(w.price).toLocaleString("en-IN") : "Price on request")}
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 10 }}>
                              <button onClick={() => navigate(`/product/${w.artwork_id}`)} className="btn-gold-main" style={{ flex: 1, padding: "8px 10px", fontSize: 9 }}>VIEW</button>
                              <button onClick={() => removeWishlist(w.artwork_id)} className="btn-outline" style={{ padding: "8px 10px", fontSize: 9 }}>REMOVE</button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {savedListings.map(l => (
                        <div key={l.post_id} style={{ border: "1px solid rgba(212,175,55,0.12)", borderRadius: 10, overflow: "hidden", background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column" }}>
                          <div style={{ position: "relative", cursor: "pointer" }} onClick={() => navigate(`/community?post=${l.post_id}`)}>
                            <SafeImage src={l.image} alt={l.title} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} />
                            <span style={{ position: "absolute", top: 8, left: 8, padding: "4px 10px", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.12em", background: "rgba(0,0,0,0.72)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.5)" }}>{l.is_auction ? "AUCTION" : "LISTING"}</span>
                            {!l.available && (
                              <span style={{ position: "absolute", top: 8, right: 8, padding: "4px 10px", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.12em", background: "rgba(0,0,0,0.72)", color: "#fca5a5", border: "1px solid rgba(248,113,113,0.5)" }}>CLOSED</span>
                            )}
                          </div>
                          <div style={{ padding: "10px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
                            <div onClick={() => navigate(`/community?post=${l.post_id}`)} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#f0e8d8", lineHeight: 1.2, cursor: "pointer" }}>{l.title || "Untitled listing"}</div>
                            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: "0.14em", color: "rgba(200,191,160,0.55)", marginTop: 4 }}>MARKETPLACE</div>
                            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "#D4AF37", marginTop: 6 }}>
                              {l.price ? (l.is_auction ? "Current bid ₹" : "₹") + Number(l.price).toLocaleString("en-IN") : (l.is_auction ? "No bids yet" : "See listing")}
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 10 }}>
                              <button onClick={() => navigate(`/community?post=${l.post_id}`)} className="btn-gold-main" style={{ flex: 1, padding: "8px 10px", fontSize: 9 }}>VIEW</button>
                              <button onClick={() => removeSavedListing(l.post_id)} className="btn-outline" style={{ padding: "8px 10px", fontSize: 9 }}>REMOVE</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {tab === "help" && (
                <Card title="Help Desk" action={
                  <Link to="/help" className="btn-outline" style={{ padding: "10px 22px", fontSize: 11, textDecoration: "none" }}>OPEN FULL DESK</Link>
                }>
                  <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.7)", lineHeight: 1.7, marginBottom: 18 }}>
                    Need help with an order, an artwork, or your account? Our concierge team is available 24/7. Submit a ticket below or browse our FAQ.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 12 }}>
                    {[
                      { label: "Order Issue",   desc: "Track or modify an existing order" },
                      { label: "Artwork Inquiry", desc: "Authenticity, condition, provenance" },
                      { label: "Account",       desc: "Login, password, billing" },
                      { label: "General",       desc: "Anything else we can help with" },
                    ].map(c => (
                      <div key={c.label} style={{
                        padding: "16px 18px",
                        border: "1px solid rgba(212,175,55,0.12)",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em", color: "#D4AF37", marginBottom: 6 }}>{c.label.toUpperCase()}</div>
                        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.6)" }}>{c.desc}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {tab === "notifs" && (
                <Card title="Notifications">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {NOTIFS.map((n, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: 14,
                        padding: "14px 16px",
                        border: "1px solid rgba(212,175,55,0.1)",
                        borderRadius: 8,
                      }}>
                        <div style={{
                          padding: "4px 10px", borderRadius: 999,
                          fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em",
                          background: "rgba(212,175,55,0.1)", color: "#D4AF37",
                          border: "1px solid rgba(212,175,55,0.2)", flexShrink: 0,
                        }}>{n.type}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "#e8e0d0" }}>{n.msg}</div>
                          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.45)", marginTop: 4 }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {tab === "language" && (
                <Card title="Language Preferences">
                  <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.65)", marginBottom: 20 }}>
                    Choose how Art Coliseum should appear across the site, in receipts, and in delivery communication.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
                    {Object.entries(LANGS).map(([code, l]) => (
                      <button
                        key={code}
                        onClick={() => setLang(code)}
                        style={{
                          padding: "14px 18px", borderRadius: 8, cursor: "pointer",
                          background: lang === code ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.02)",
                          border: lang === code ? "1px solid #D4AF37" : "1px solid rgba(212,175,55,0.15)",
                          color: lang === code ? "#D4AF37" : "#e8e0d0",
                          fontFamily: "'Raleway',sans-serif", fontSize: 14,
                          textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                        }}>
                        <span>{l.label}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span className="num-value" style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, letterSpacing: "0.08em", opacity: 0.7 }}>{l.currency}</span>
                          {lang === code && <CheckIcon size={12} />}
                        </span>
                      </button>
                    ))}
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

/** Expandable order row that fetches and renders live delivery tracking:
 *  stage timeline, tracking id + courier + ETA, and the receipt-OTP confirm. */
function OrderTracker({ order }) {
  const [open, setOpen] = useState(false);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpErr, setOtpErr] = useState("");
  const [copied, setCopied] = useState(false);

  const loadDelivery = async () => {
    setLoading(true);
    try {
      setDelivery(await api.deliveries.byOrder(order.rawId));
    } catch {
      setDelivery(null); // no delivery yet (e.g. unpaid) → 404
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) loadDelivery();
  };

  const confirmOtp = async () => {
    setOtpErr("");
    try {
      setDelivery(await api.deliveries.confirm(delivery.id, otp.trim()));
    } catch (e) {
      setOtpErr(e.message);
    }
  };

  const delivered = (order.status === "DELIVERED") || delivery?.stage === "delivered";
  const currentIdx = delivery ? STAGE_ORDER.indexOf(delivery.stage) : -1;

  return (
    <div style={{ border: "1px solid rgba(212,175,55,0.12)", borderRadius: 8, overflow: "hidden" }}>
      {/* header — click to expand tracking */}
      <button onClick={toggle} style={{
        width: "100%", textAlign: "left", cursor: "pointer", background: "transparent", border: "none",
        padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8,
      }}>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", color: "#D4AF37" }}>{order.id}</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#f0e8d8", marginTop: 4 }}>{order.item}</div>
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginTop: 4 }}>{order.eta}</div>
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{
            display: "inline-block", padding: "5px 12px", borderRadius: 999,
            fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em",
            background: delivered ? "rgba(74,222,128,0.12)" : "rgba(212,175,55,0.12)",
            color: delivered ? "#4ade80" : "#D4AF37",
            border: delivered ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(212,175,55,0.3)",
          }}>{order.status}</div>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: "rgba(200,191,160,0.6)" }}>
            {open ? "HIDE TRACKING ▴" : "TRACK ORDER ▾"}
          </span>
        </div>
      </button>

      {/* tracking detail */}
      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(212,175,55,0.1)" }}>
          {loading ? (
            <div style={{ padding: 18, fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.55)" }}>Loading tracking…</div>
          ) : !delivery ? (
            <div style={{ padding: 18, fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.55)", lineHeight: 1.6 }}>
              {order.status === "PENDING"
                ? "Tracking will appear once your payment is confirmed."
                : "No tracking information is available for this order yet."}
            </div>
          ) : (
            <>
              {/* stage timeline */}
              <div style={{ position: "relative", margin: "18px 0 8px" }}>
                {STAGE_ORDER.map((stage, i) => {
                  const state = i < currentIdx ? "done" : i === currentIdx ? "active" : "pending";
                  return (
                    <div key={stage} style={{ display: "flex", gap: 14, paddingBottom: i !== STAGE_ORDER.length - 1 ? 20 : 0, position: "relative" }}>
                      {i !== STAGE_ORDER.length - 1 && (
                        <div style={{ position: "absolute", left: 11, top: 24, bottom: 0, width: 1, background: i < currentIdx ? "#D4AF37" : "rgba(212,175,55,0.2)" }} />
                      )}
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                        background: state !== "pending" ? "#D4AF37" : "rgba(212,175,55,0.15)", color: state !== "pending" ? "#111" : "rgba(200,191,160,0.4)",
                        fontSize: 10, fontWeight: 700, boxShadow: state === "active" ? "0 0 0 4px rgba(212,175,55,0.2)" : "none",
                      }}>{state === "done" ? "✓" : state === "active" ? "●" : ""}</div>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", paddingTop: 5,
                        color: state === "active" ? "#D4AF37" : state === "done" ? "#e8e0d0" : "rgba(200,191,160,0.45)" }}>
                        {STAGE_LABEL[stage]}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* tracking id + courier + eta */}
              <div style={{ height: 1, background: "rgba(212,175,55,0.18)", margin: "10px 0 14px" }} />
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", color: "rgba(200,191,160,0.55)", marginBottom: 6 }}>
                TRACKING ID · {delivery.courier || "Courier"}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="num-value" style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "#D4AF37", letterSpacing: "0.1em" }}>{delivery.tracking_id || "—"}</div>
                <button onClick={() => { navigator.clipboard?.writeText(delivery.tracking_id || ""); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "#D4AF37", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em" }}>
                  <CopyIcon size={14} />{copied && <span>COPIED</span>}
                </button>
              </div>
              {delivery.eta && (
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.7)", marginTop: 8 }}>
                  Estimated arrival · <span style={{ color: "#D4AF37" }}>{delivery.eta}</span>
                </div>
              )}

              {/* OTP confirm */}
              {!delivered && (
                <div style={{ marginTop: 18, padding: 16, background: "rgba(212,175,55,0.05)", border: "1px dashed rgba(212,175,55,0.3)", borderRadius: 10 }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: "#D4AF37", marginBottom: 8 }}>CONFIRM RECEIPT</div>
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.65)", marginBottom: 12, lineHeight: 1.6 }}>
                    When your piece is installed, our team shares a 6-digit OTP. Enter it to confirm receipt.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP"
                      style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 8, padding: "11px 14px", color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 14, letterSpacing: "0.2em", outline: "none" }} />
                    <button onClick={confirmOtp} disabled={otp.trim().length < 4}
                      style={{ padding: "0 22px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 8, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em", cursor: otp.trim().length < 4 ? "not-allowed" : "pointer" }}>CONFIRM</button>
                  </div>
                  {otpErr && <div style={{ color: "#ff8a8a", fontFamily: "'Raleway',sans-serif", fontSize: 12, marginTop: 8 }}>{otpErr}</div>}
                </div>
              )}

              {delivered && (
                <div style={{ marginTop: 16, fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#4ade80" }}>✓ Delivered and confirmed.</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Card({ title, action, children }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(212,175,55,0.12)",
      borderRadius: 12, padding: "26px 28px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, editing, onChange, type = "text", error, locked = false }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "#D4AF37" }}>{label.toUpperCase()}</div>
        {locked && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "'Raleway',sans-serif", fontSize: 9.5, color: "rgba(200,191,160,0.45)" }}>
            <LockIcon /> Can't be changed
          </span>
        )}
      </div>
      {editing && !locked ? (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${error ? "rgba(255,120,120,0.7)" : "rgba(212,175,55,0.2)"}`,
            padding: "12px 14px",
            color: "#e8e0d0",
            fontFamily: "'Raleway',sans-serif", fontSize: 14,
            borderRadius: 6, outline: "none",
          }}
        />
      ) : (
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 15, color: locked ? "rgba(200,191,160,0.75)" : "#f0e8d8", padding: "8px 0" }}>{value}</div>
      )}
      {editing && error && <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "#ff8a8a", marginTop: 5 }}>{error}</div>}
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon({ off }) {
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Single password input with a show/hide eye toggle. */
function PasswordInput({ value, onChange, placeholder, show, setShow }) {
  return (
    <div style={{ position: "relative", width: "100%", marginBottom: 10 }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={placeholder?.toLowerCase().includes("current") ? "current-password" : "new-password"}
        style={{
          width: "100%", boxSizing: "border-box",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(212,175,55,0.2)",
          padding: "12px 44px 12px 14px",
          color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 14,
          borderRadius: 6, outline: "none",
        }}
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        title={show ? "Hide password" : "Show password"}
        aria-label={show ? "Hide password" : "Show password"}
        style={{ position: "absolute", top: "50%", right: 10, transform: "translateY(-50%)", background: "transparent", border: "none", padding: 4, cursor: "pointer", color: "rgba(212,175,55,0.75)", display: "flex" }}>
        <EyeIcon off={show} />
      </button>
    </div>
  );
}

/** In-place change-password form (current + new) shown while editing the profile. */
function ChangePassword() {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState(null); // { ok: bool, text }
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setMsg(null);
    if (!cur || !next) { setMsg({ ok: false, text: "Enter your current and new password." }); return; }
    if (next.length < 6) { setMsg({ ok: false, text: "New password must be at least 6 characters." }); return; }
    setBusy(true);
    try {
      await api.auth.changePassword({ current_password: cur, new_password: next });
      setMsg({ ok: true, text: "Password updated." });
      setCur(""); setNext("");
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally { setBusy(false); }
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 8 }}>CHANGE PASSWORD</div>
      <PasswordInput value={cur} onChange={setCur} placeholder="Current password" show={show} setShow={setShow} />
      <PasswordInput value={next} onChange={setNext} placeholder="New password (min 6 characters)" show={show} setShow={setShow} />
      <button onClick={submit} disabled={busy} className="btn-outline" style={{ padding: "9px 20px", fontSize: 10, opacity: busy ? 0.6 : 1, cursor: busy ? "wait" : "pointer" }}>
        {busy ? "UPDATING…" : "UPDATE PASSWORD"}
      </button>
      {msg && (
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, marginTop: 8, color: msg.ok ? "#9fe0a8" : "#ff8a8a" }}>{msg.text}</div>
      )}
    </div>
  );
}

const ADDR_BLANK = { label: "", name: "", phone: "", line1: "", line2: "", city: "", state: "", zip: "", country: countryNameFromCode(DEFAULT_COUNTRY_CODE), countryCode: DEFAULT_COUNTRY_CODE, stateCode: "" };
const aSelect = (bad) => ({ ...aInput(bad), appearance: "none", WebkitAppearance: "none", colorScheme: "dark", cursor: "pointer" });
const aErrText = { fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "#ff8a8a", marginTop: 4 };

// Two addresses are "the same" when their delivery fields match (label is just a
// nickname, so it's ignored). Used to block duplicate saves.
const _normAddr = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
const sameAddress = (a, b) =>
  ["name", "phone", "line1", "line2", "city", "state", "zip"].every(
    (k) => _normAddr(a[k]) === _normAddr(b[k]),
  ) && _normAddr(a.country || "India") === _normAddr(b.country || "India");
const aInput = (bad) => ({ width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: `1px solid ${bad ? "rgba(255,120,120,0.7)" : "rgba(212,175,55,0.2)"}`, borderRadius: 6, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, outline: "none" });

/** Saved-address book: list, add (validated), remove, set default. Persists via onChange. */
function AddressBook({ addresses, onChange }) {
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState(ADDR_BLANK);
  const [touched, setTouched] = useState(false);
  const [dupError, setDupError] = useState("");

  const errors = validateForm(f, {
    name:  [required("Name")],
    phone: [required("Phone"), phoneIN],
    line1: [required("Address line 1")],
    city:  [required("City")],
    state: [required("State")],
    zip:   [required("PIN code"), pincodeIN],
  });
  const set = (k) => (e) => { setDupError(""); setF((v) => ({ ...v, [k]: e.target.value })); };
  const closeForm = () => { setAdding(false); setF(ADDR_BLANK); setTouched(false); setDupError(""); };

  // Cascading country → state → city dropdowns (data from country-state-city).
  const countryOpts = useMemo(() => countryOptions(), []);
  const stateOpts = useMemo(() => stateOptions(f.countryCode), [f.countryCode]);
  const cityOpts = useMemo(() => cityOptions(f.countryCode, f.stateCode), [f.countryCode, f.stateCode]);
  const onCountry = (e) => {
    const code = e.target.value;
    setDupError("");
    setF((v) => ({ ...v, countryCode: code, country: countryNameFromCode(code), stateCode: "", state: "", city: "" }));
  };
  const onState = (e) => {
    const code = e.target.value;
    setDupError("");
    setF((v) => ({ ...v, stateCode: code, state: stateOpts.find((o) => o.value === code)?.label || "", city: "" }));
  };
  const setCity = (val) => { setDupError(""); setF((v) => ({ ...v, city: val })); };

  const add = () => {
    if (!isValid(errors)) { setTouched(true); return; }
    if (addresses.some((a) => sameAddress(a, f))) {
      setDupError("This address is already saved.");
      return;
    }
    const entry = { id: genId("addr"), ...f, label: f.label || f.city, is_default: addresses.length === 0 };
    onChange([...addresses, entry]);
    closeForm();
  };
  const remove = (id) => onChange(addresses.filter((a) => a.id !== id));
  const setDefault = (id) => onChange(addresses.map((a) => ({ ...a, is_default: a.id === id })));

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "#D4AF37" }}>SAVED ADDRESSES</div>
        {!adding && <button onClick={() => setAdding(true)} className="btn-outline" style={{ padding: "7px 16px", fontSize: 10 }}>+ ADD</button>}
      </div>

      {addresses.length === 0 && !adding && (
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.5)", marginBottom: 10 }}>No saved addresses yet.</div>
      )}

      {addresses.map((a) => (
        <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "12px 14px", marginBottom: 8, borderRadius: 8, background: "rgba(255,255,255,0.02)", border: `1px solid ${a.is_default ? "#D4AF37" : "rgba(212,175,55,0.15)"}` }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>
              {a.label || a.city} {a.is_default && <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.12em", color: "#D4AF37", marginLeft: 6 }}>DEFAULT</span>}
            </div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.7)", marginTop: 3, lineHeight: 1.5 }}>
              {a.name} · {a.phone}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.zip}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            {!a.is_default && <button onClick={() => setDefault(a.id)} className="btn-outline" style={{ padding: "5px 12px", fontSize: 9 }}>SET DEFAULT</button>}
            <button onClick={() => remove(a.id)} className="btn-outline" style={{ padding: "5px 12px", fontSize: 9 }}>REMOVE</button>
          </div>
        </div>
      ))}

      {adding && (
        <div style={{ padding: 14, borderRadius: 8, border: "1px solid rgba(212,175,55,0.22)", background: "rgba(212,175,55,0.03)", marginTop: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><input placeholder="Label (e.g. Home)" value={f.label} onChange={set("label")} style={aInput(false)} /></div>
            <div><input placeholder="Full name *" value={f.name} onChange={set("name")} style={aInput(touched && errors.name)} />{touched && errors.name && <div style={aErrText}>{errors.name}</div>}</div>
            <div><input placeholder="Phone *" value={f.phone} onChange={set("phone")} inputMode="numeric" maxLength={10} style={aInput(touched && errors.phone)} />{touched && errors.phone && <div style={aErrText}>{errors.phone}</div>}</div>
            <div><input placeholder="PIN code *" value={f.zip} onChange={set("zip")} inputMode="numeric" maxLength={6} style={aInput(touched && errors.zip)} />{touched && errors.zip && <div style={aErrText}>{errors.zip}</div>}</div>
            <div>
              <select value={f.countryCode} onChange={onCountry} style={aSelect(false)}>
                {countryOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              {stateOpts.length > 0 ? (
                <select value={f.stateCode} onChange={onState} style={aSelect(touched && errors.state)}>
                  <option value="">State *</option>
                  {stateOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input placeholder="State *" value={f.state} onChange={set("state")} style={aInput(touched && errors.state)} />
              )}
              {touched && errors.state && <div style={aErrText}>{errors.state}</div>}
            </div>
            <div>
              {cityOpts.length > 0 ? (
                <select value={f.city} onChange={(e) => setCity(e.target.value)} style={aSelect(touched && errors.city)}>
                  <option value="">City *</option>
                  {cityOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input placeholder="City *" value={f.city} onChange={set("city")} style={aInput(touched && errors.city)} />
              )}
              {touched && errors.city && <div style={aErrText}>{errors.city}</div>}
            </div>
            <div />
            <div style={{ gridColumn: "1 / -1" }}><input placeholder="Address line 1 *" value={f.line1} onChange={set("line1")} style={aInput(touched && errors.line1)} />{touched && errors.line1 && <div style={aErrText}>{errors.line1}</div>}</div>
            <div style={{ gridColumn: "1 / -1" }}><input placeholder="Address line 2" value={f.line2} onChange={set("line2")} style={aInput(false)} /></div>
          </div>
          {dupError && <div style={{ ...aErrText, marginTop: 10 }}>{dupError}</div>}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={add} className="btn-gold-main" style={{ padding: "9px 20px", fontSize: 11 }}>SAVE ADDRESS</button>
            <button onClick={closeForm} className="btn-outline" style={{ padding: "9px 20px", fontSize: 11 }}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
}

const BANK_BLANK = { account_holder: "", bank_name: "", account_number: "", ifsc: "", cheque_url: "" };

/** Bank payout details: holder, bank, account no., IFSC + a cancelled-cheque upload. Persists via onChange. */
function BankDetails({ details, onChange }) {
  const [f, setF] = useState(details || BANK_BLANK);
  const [saved, setSaved] = useState(false);
  // Reflect an externally-refreshed record (e.g. after the server round-trips).
  useEffect(() => { if (details) setF({ ...BANK_BLANK, ...details }); }, [details]);
  const set = (k, up = false) => (e) => {
    const val = up ? e.target.value.toUpperCase() : e.target.value;
    setSaved(false);
    setF((v) => ({ ...v, [k]: val }));
  };
  const save = () => { onChange(f); setSaved(true); };
  const labelStyle = { fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)", marginBottom: 6 };
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 12 }}>BANK ACCOUNT DETAILS</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input placeholder="Account holder name" value={f.account_holder} onChange={set("account_holder")} style={aInput(false)} />
        <input placeholder="Bank name" value={f.bank_name} onChange={set("bank_name")} style={aInput(false)} />
        <input placeholder="Account number" value={f.account_number} onChange={set("account_number")} inputMode="numeric" style={aInput(false)} />
        <input placeholder="IFSC code" value={f.ifsc} onChange={set("ifsc", true)} style={aInput(false)} />
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={labelStyle}>CANCELLED CHEQUE</div>
        <MediaUploader kind="image" hint="UPLOAD CHEQUE" value={f.cheque_url} onChange={(url) => { setSaved(false); setF((v) => ({ ...v, cheque_url: url || "" })); }} />
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 14, alignItems: "center" }}>
        <button onClick={save} className="btn-gold-main" style={{ padding: "9px 20px", fontSize: 11 }}>SAVE BANK DETAILS</button>
        {saved && <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#4ade80" }}>Saved ✓</span>}
      </div>
    </div>
  );
}
