import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/Auth";
import { Skeleton, SkeletonRows } from "../components/ui/Skeleton";
import MediaUploader from "../components/ui/MediaUploader";
import { isThreeD, composeDims } from "../utils/dimensions";
import { api, realtime } from "../utils/api";
import { email as emailRule, minLen, intRange } from "../utils/validation";

const gold = "#D4AF37";
const TABS = [
  ["overview", "Overview"], ["tally", "Price & Tally"], ["enquiries", "Enquiries"], ["orders", "Orders"],
  ["artworks", "Artworks"], ["categories", "Categories"], ["exhibitions", "Exhibitions"], ["events", "Events"],
  ["artists", "Artists"], ["competition", "Competition"], ["communities", "Communities"],
  ["contact", "Contact"], ["support", "Support"], ["messages", "Messages"],
];

const STAGES = ["order_confirmed", "curation_crating", "dispatched", "out_for_delivery", "installation", "delivered"];
const PARKING_OPTIONS = ["Parking available (self)", "Valet available", "Parking not available"];

export default function AdminDashboard() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/signin"); return; }
    if (role === "admin") api.admin.stats().then(setStats).catch(() => {});
  }, [user, role, loading]);

  if (loading) return (
    <section style={{ padding: "100px 24px 60px", maxWidth: 1400, margin: "0 auto" }}>
      <Skeleton width={90} height={12} />
      <Skeleton width={280} height={38} radius={8} style={{ marginTop: 8, marginBottom: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 20 }}>
        <Skeleton height={420} radius={12} />
        <SkeletonRows count={5} height={72} gap={14} />
      </div>
    </section>
  );
  if (role !== "admin") {
    return (
      <Center>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: "#fff" }}>Admins only</h1>
        <p style={{ marginTop: 12, color: "rgba(200,191,160,0.6)", fontFamily: "'Raleway',sans-serif" }}>Run this against the DB, then sign in again:</p>
        <pre style={preStyle}>{`UPDATE profiles SET role='admin', is_admin=true WHERE user_id='${user?.id || "<id>"}';`}</pre>
      </Center>
    );
  }

  return (
    <section style={{ padding: "100px 24px 60px", maxWidth: 1400, margin: "0 auto", color: "#e8e0d0" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: gold }}>ADMIN</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 700, color: "#fff", marginTop: 4 }}>Control Panel</h1>
      </div>
      <div className="admin-grid" style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 20 }}>
        <aside style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 12, background: "rgba(255,255,255,0.02)", padding: 12, height: "fit-content" }}>
          {TABS.map(([id, lbl]) => {
            const badge = { orders: stats.pending_orders, support: stats.open_tickets, contact: stats.contact_messages, artists: (stats.pending_artists || 0) + (stats.pending_artworks || 0) }[id] || 0;
            return (
              <button key={id} onClick={() => setTab(id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "10px 14px", marginBottom: 4, border: "none", background: tab === id ? "rgba(212,175,55,0.10)" : "transparent", color: tab === id ? gold : "rgba(200,191,160,0.7)", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.12em", borderRadius: 8, cursor: "pointer" }}>
                <span>{lbl.toUpperCase()}</span>
                {badge > 0 && <span style={{ background: gold, color: "#111", borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{badge}</span>}
              </button>
            );
          })}
        </aside>
        <div style={{ minHeight: 400 }}>
          {tab === "overview" && <Overview stats={stats} />}
          {tab === "tally" && <Tally />}
          {tab === "enquiries" && <Enquiries />}
          {tab === "orders" && <Orders />}
          {tab === "artworks" && <Artworks />}
          {tab === "categories" && <Categories />}
          {tab === "exhibitions" && <Exhibitions />}
          {tab === "communities" && <CommunityAdmin />}
          {tab === "events" && <Events />}
          {tab === "artists" && <Artists />}
          {tab === "competition" && <Competition />}
          {tab === "contact" && <ContactList />}
          {tab === "support" && <Support />}
          {tab === "messages" && <Panel title="Messages"><Link to="/admin/inbox" className="btn-gold-main" style={{ textDecoration: "none", padding: "12px 24px", fontSize: 12 }}>OPEN INBOX →</Link></Panel>}
        </div>
      </div>
    </section>
  );
}

function Overview({ stats }) {
  const [a, setA] = useState(null);
  const [aErr, setAErr] = useState("");
  useEffect(() => {
    api.admin.analytics().then((d) => { setA(d); setAErr(""); }).catch((e) => { setA(null); setAErr(e.message || "Request failed"); });
  }, []);

  const cards = [
    ["Pending orders", stats.pending_orders], ["Unread messages", stats.unread_messages],
    ["Event registrations", stats.event_registrations], ["New artworks (7d)", stats.recent_artworks],
    ["Contact messages", stats.contact_messages], ["Open tickets", stats.open_tickets],
    ["Pending artists", stats.pending_artists],
  ];

  return (
    <Panel title="Overview">
      {aErr && (
        <div style={{ marginBottom: 14, padding: "10px 14px", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, background: "rgba(239,68,68,0.08)", fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#fca5a5" }}>
          Site analytics failed to load — {aErr}. Showing summary counts only.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
        {cards.map(([l, v]) => (
          <div key={l} style={{ padding: 20, border: "1px solid rgba(212,175,55,0.15)", borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 40, fontWeight: 700, color: gold }}>{v ?? 0}</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", color: "rgba(200,191,160,0.7)", marginTop: 4 }}>{l.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {a && (
        <>
          {/* Headline totals across the whole site */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginTop: 22 }}>
            {[
              ["Users", a.users.total], ["Artworks", a.artworks.total], ["Orders", a.orders.total],
              ["Enquiries", a.enquiries.total], ["Events", a.events.total], ["Registrations", a.events.registrations],
              ["Competitions", a.competitions.total], ["Comp. entries", a.competitions.entries],
              ["Owned pieces", a.collection.owned], ["Reviews", a.collection.reviews],
              ["Support tickets", a.support.tickets], ["Contact msgs", a.support.contact_messages],
            ].map(([l, v]) => (
              <div key={l} style={{ padding: "14px 16px", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: "#f0e8d8" }}>{v ?? 0}</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.12em", color: "rgba(200,191,160,0.6)", marginTop: 2 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Distributions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginTop: 22 }}>
            <Distribution title="Users by role" data={a.users.by_role} />
            <Distribution title="Artworks by category" data={a.artworks.by_category} />
            <Distribution title="Artworks by status" data={a.artworks.by_status} />
            <Distribution title="Orders by status" data={a.orders.by_status} />
            <Distribution title="Enquiries by status" data={a.enquiries.by_status} />
            <Distribution title="Competitions by status" data={a.competitions.by_status} />
            <Distribution title="Artwork pricing" data={{ Customizable: a.artworks.customizable, Fixed: a.artworks.fixed, Featured: a.artworks.featured }} />
            <Distribution title="Artist KYC" data={{ Verified: a.artists.verified, Unverified: a.artists.unverified }} />
          </div>
        </>
      )}
    </Panel>
  );
}

// A labelled count list with proportion bars — numeric distribution, no chart lib.
function Distribution({ title, data }) {
  const entries = Object.entries(data || {});
  const total = entries.reduce((s, [, v]) => s + (v || 0), 0) || 1;
  return (
    <div style={{ padding: "16px 18px", border: "1px solid rgba(212,175,55,0.15)", borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", color: gold, marginBottom: 12 }}>{title.toUpperCase()}</div>
      {entries.length === 0 && <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.5)" }}>No data.</div>}
      {entries.map(([k, v]) => (
        <div key={k} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#e8e0d0", marginBottom: 4 }}>
            <span style={{ textTransform: "capitalize" }}>{k}</span><span className="num-value" style={{ color: gold }}>{v}</span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: "rgba(212,175,55,0.12)", overflow: "hidden" }}>
            <div style={{ width: `${Math.round((v / total) * 100)}%`, height: "100%", background: "linear-gradient(90deg,#D4AF37,#e8c53a)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// Unified enquiry workspace: pick an enquiry → see the customer's chat, the
// auto-computed price + their selections, and reply / approve / reject in one place.
function Enquiries() {
  const [rows, setRows] = useState([]);
  const [active, setActive] = useState(null);   // selected enquiry
  const [msgs, setMsgs] = useState([]);
  const [reply, setReply] = useState("");
  const [override, setOverride] = useState("");
  const endRef = useRef(null);

  const load = () => api.enquiries.all().then((r) => {
    setRows(r);
    setActive((a) => (a ? r.find((x) => x.id === a.id) || a : a));
  }).catch(() => setRows([]));
  useEffect(() => { load(); }, []);

  // Load + live-subscribe to the selected enquiry's thread, scoped to its customer.
  useEffect(() => {
    if (!active) { setMsgs([]); return; }
    let cancelled = false;
    api.chat.conversation(active.conversation_key, active.user_id)
      .then((m) => { if (!cancelled) setMsgs(m); }).catch(() => setMsgs([]));
    const sub = realtime.channel(active.conversation_key).on("message", (m) => {
      if (m.conversation_key === active.conversation_key && m.user_id === active.user_id) {
        setMsgs((prev) => prev.some((x) => x.id === m.id) ? prev : [...prev, m]);
      }
    }).subscribe();
    return () => { cancelled = true; sub.unsubscribe(); };
  }, [active?.id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  // Open an enquiry and prefill the per-unit price field from the artwork.
  const open = (e) => { setActive(e); setOverride(e?.price_per_unit != null ? String(e.price_per_unit) : ""); };

  const send = async () => {
    const text = reply.trim();
    if (!text || !active) return;
    setReply("");
    await api.chat.send({ conversation_key: active.conversation_key, sender: "curator", target_user_id: active.user_id, text });
    setMsgs((prev) => [...prev, { id: `tmp-${Date.now()}`, sender: "curator", text, user_id: active.user_id, conversation_key: active.conversation_key }]);
  };
  const reject = async () => { await api.enquiries.reject(active.id); setActive(null); load(); };
  // Reveal & unlock: expose the per-unit price (override optional) and grant buy permission.
  const reveal = async () => {
    const ppu = override === "" ? undefined : Number(override);
    await api.enquiries.revealPrice(active.id, ppu); load();
  };

  const sel = active?.selection?.options || {};
  const dims = active?.selection || {};

  return (
    <Panel title="Enquiries">
      <div className="admin-work-grid" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, minHeight: 420 }}>
        {/* List */}
        <div style={{ borderRight: "1px solid rgba(212,175,55,0.12)", paddingRight: 12, maxHeight: 560, overflowY: "auto" }}>
          {rows.length === 0 && <Empty>No enquiries yet.</Empty>}
          {rows.map((e) => (
            <button key={e.id} onClick={() => open(e)} style={{
              display: "block", width: "100%", textAlign: "left", padding: "10px 12px", marginBottom: 6,
              borderRadius: 8, cursor: "pointer", border: `1px solid ${active?.id === e.id ? gold : "rgba(212,175,55,0.15)"}`,
              background: active?.id === e.id ? "rgba(212,175,55,0.10)" : "rgba(255,255,255,0.02)",
            }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>{e.artwork_title || e.artwork_id}</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.7)", marginTop: 2 }}>{e.customer_name || "Customer"}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.12em", color: gold, marginTop: 4 }}>
                {e.status.toUpperCase()}{e.revealed_price ? ` · ${inr(e.revealed_price)}` : ""}
              </div>
            </button>
          ))}
        </div>

        {/* Detail: chat + price + actions */}
        {!active ? (
          <Empty>Select an enquiry to view the conversation.</Empty>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(212,175,55,0.12)", paddingBottom: 10 }}>
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: "#fff" }}>{active.artwork_title || active.artwork_id}</div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.7)" }}>{active.customer_name || "Customer"}</div>
                {(Object.keys(sel).length > 0 || dims.custom_width || dims.custom_height) && (
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", marginTop: 4 }}>
                    {(dims.custom_width || dims.custom_height) && (
                      <span>Wants {dims.custom_width || "?"} × {dims.custom_height || "?"} {dims.custom_unit || "cm"}</span>
                    )}
                    {Object.keys(sel).length > 0 && (
                      <span>{(dims.custom_width || dims.custom_height) ? " · " : ""}{Object.entries(sel).map(([k, v]) => `${k}: ${v}`).join(" · ")}</span>
                    )}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.14em", color: "rgba(200,191,160,0.5)" }}>PER-UNIT PRICE</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: gold }}>
                  {active.price_per_unit != null ? `${inr(active.price_per_unit)}/${active.unit || "unit"}` : "—"}
                </div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.12em", color: gold, marginTop: 2 }}>{active.status.toUpperCase()}</div>
              </div>
            </div>

            {/* Chat thread */}
            <div style={{ flex: 1, minHeight: 220, maxHeight: 320, overflowY: "auto", padding: "8px 4px", display: "flex", flexDirection: "column", gap: 8 }}>
              {msgs.length === 0 && <Empty>No messages yet — the customer hasn't written.</Empty>}
              {msgs.map((m) => {
                const fromCustomer = m.sender === "me";
                return (
                  <div key={m.id} style={{ alignSelf: fromCustomer ? "flex-start" : "flex-end", maxWidth: "75%", padding: "8px 12px", borderRadius: 10,
                    background: fromCustomer ? "rgba(255,255,255,0.05)" : "rgba(212,175,55,0.14)",
                    border: `1px solid ${fromCustomer ? "rgba(255,255,255,0.08)" : "rgba(212,175,55,0.3)"}` }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 7, letterSpacing: "0.14em", color: "rgba(200,191,160,0.5)", marginBottom: 3 }}>{fromCustomer ? "CUSTOMER" : (m.sender || "CURATOR").toUpperCase()}</div>
                    <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#e8e0d0" }}>{m.text}</div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            {/* Reply */}
            <div style={{ display: "flex", gap: 8 }}>
              <input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder="Reply to the customer…" style={{ ...miniInput, flex: 1 }} />
              <Btn onClick={send} primary>SEND</Btn>
            </div>

            {/* Actions — reveal the per-unit price (unlocks the buyer's checkout) */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", borderTop: "1px solid rgba(212,175,55,0.12)", paddingTop: 12 }}>
              <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)" }}>Price per {active.unit || "unit"} (₹):</span>
              <input value={override} onChange={(e) => setOverride(e.target.value)} placeholder={String(active.price_per_unit || "")} style={{ ...miniInput, width: 110 }} />
              <Btn onClick={reveal} primary>{active.status === "approved" ? "UPDATE PRICE" : "REVEAL & UNLOCK"}</Btn>
              <div style={{ flex: 1 }} />
              <Btn onClick={reject} ghost>REJECT</Btn>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

function Orders() {
  const [rows, setRows] = useState([]);
  const [deliv, setDeliv] = useState({});  // orderId -> delivery
  const [otp, setOtp] = useState({});
  const load = () => api.orders.all().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const loadDelivery = async (orderId) => {
    try { const dd = await api.deliveries.byOrder(orderId); setDeliv((d) => ({ ...d, [orderId]: dd })); } catch { /* none */ }
  };
  const advance = async (orderId, d, stage) => {
    const res = await api.deliveries.updateStage(d.id, { stage });
    if (res.otp) setOtp((o) => ({ ...o, [orderId]: res.otp }));
    loadDelivery(orderId);
  };
  return (
    <Panel title="Orders">
      {rows.length === 0 && <Empty>No orders yet.</Empty>}
      {rows.map((o) => {
        const d = deliv[o.id];
        return (
          <div key={o.id} style={{ padding: 16, border: "1px solid rgba(212,175,55,0.14)", borderRadius: 10, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", color: gold }}>#{o.id.slice(0, 8).toUpperCase()}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: "#fff" }}>{(o.items || []).map(i => i.title).join(", ") || "Order"} · {inr(o.total)}</div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)" }}>{o.full_name} · {o.status.toUpperCase()}</div>
              </div>
              {!d && o.status !== "pending" && <Btn onClick={() => loadDelivery(o.id)}>MANAGE DELIVERY</Btn>}
            </div>
            {d && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(212,175,55,0.1)" }}>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.65)", marginBottom: 8 }}>
                  {d.tracking_id} · stage: <span style={{ color: gold }}>{d.stage}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {STAGES.map((s) => (
                    <button key={s} onClick={() => advance(o.id, d, s)} disabled={s === d.stage}
                      style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${s === d.stage ? gold : "rgba(212,175,55,0.2)"}`, background: s === d.stage ? "rgba(212,175,55,0.12)" : "transparent", color: s === d.stage ? gold : "rgba(200,191,160,0.7)", fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: "0.1em", cursor: "pointer" }}>
                      {s.replace(/_/g, " ").toUpperCase()}
                    </button>
                  ))}
                </div>
                {otp[o.id] && <div style={{ marginTop: 8, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#4ade80" }}>OTP for customer: <strong>{otp[o.id]}</strong> (share so they confirm receipt)</div>}
              </div>
            )}
          </div>
        );
      })}
    </Panel>
  );
}

function Artworks() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const load = () => api.catalog.artworks().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const del = async (id) => { if (confirm("Delete this artwork?")) { await api.admin.deleteArtwork(id); load(); } };
  const feature = async (a) => { await api.admin.updateArtwork(a.id, { featured: !a.featured }); load(); };
  const filtered = rows.filter((a) => !q.trim() || `${a.title} ${a.artist_name} ${a.category_id}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Panel title={`Artworks (${rows.length})`}>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title / artist / medium…" style={{ ...miniInput, width: "100%", marginBottom: 14 }} />
      {filtered.map((a) => (
        <Item key={a.id}>
          <img src={a.images?.[0]} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>{a.title}</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)" }}>
              {a.artist_name} · {a.customizable ? "customizable" : inr(a.price)} · {a.category_id || "—"} · {a.status}
            </div>
          </div>
          <Btn onClick={() => setEditing(a)}>EDIT</Btn>
          <Btn onClick={() => feature(a)} primary={a.featured}>{a.featured ? "FEATURED" : "FEATURE"}</Btn>
          <Btn onClick={() => del(a.id)} ghost>DELETE</Btn>
        </Item>
      ))}
      {editing && <EditArtworkModal artwork={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </Panel>
  );
}

function EditArtworkModal({ artwork, onClose, onSaved }) {
  const [f, setF] = useState({
    title: artwork.title || "", price: artwork.price ?? "", medium: artwork.medium || "",
    width: artwork.width ?? "", height: artwork.height ?? "", depth: artwork.depth ?? "", dim_unit: artwork.unit || "cm",
    price_per_unit: artwork.price_per_unit ?? "",
    customizable: artwork.customizable !== false, ratio_locked: !!artwork.ratio_locked, in_stock: artwork.in_stock !== false,
    status: artwork.status || "active", featured: !!artwork.featured,
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const is3D = isThreeD(artwork.category_id) || artwork.depth != null;
  const composedDims = composeDims(f.width, f.height, is3D ? f.depth : "", f.dim_unit);
  const save = async () => {
    setBusy(true);
    try {
      await api.admin.updateArtwork(artwork.id, {
        title: f.title, medium: f.medium,
        width: f.width !== "" ? Number(f.width) : null,
        height: f.height !== "" ? Number(f.height) : null,
        depth: is3D && f.depth !== "" ? Number(f.depth) : null,
        customizable: f.customizable, ratio_locked: f.customizable && f.ratio_locked,
        in_stock: f.in_stock, status: f.status, featured: f.featured,
        price: f.price !== "" ? Number(f.price) : null,
        price_per_unit: f.customizable && f.price_per_unit !== "" ? Number(f.price_per_unit) : null,
      });
      onSaved();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 7000, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#15120c", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 460, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.16em", color: gold, marginBottom: 16 }}>EDIT · {artwork.title}</div>
        <L>Title</L><input style={miniInput} value={f.title} onChange={set("title")} />
        <L>Medium</L><input style={miniInput} value={f.medium} onChange={set("medium")} />
        <L>Artwork size{is3D ? " (W × H × D)" : " (W × H)"}{composedDims ? ` — ${composedDims}` : ""}</L>
        <div style={{ display: "grid", gridTemplateColumns: is3D ? "repeat(4, 1fr)" : "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
          <input placeholder="W" style={{ ...miniInput, marginBottom: 0 }} type="number" value={f.width} onChange={set("width")} />
          <input placeholder="H" style={{ ...miniInput, marginBottom: 0 }} type="number" value={f.height} onChange={set("height")} />
          {is3D && <input placeholder="D" style={{ ...miniInput, marginBottom: 0 }} type="number" value={f.depth} onChange={set("depth")} />}
          <select style={{ ...miniInput, marginBottom: 0 }} value={f.dim_unit} onChange={set("dim_unit")}>
            <option value="cm">cm</option><option value="inch">inch</option><option value="feet">feet</option>
          </select>
        </div>
        <label style={ckLabel}><input type="checkbox" checked={f.customizable} onChange={(e) => setF({ ...f, customizable: e.target.checked })} style={{ accentColor: gold }} /> Customizable</label>
        {f.customizable && <label style={ckLabel}><input type="checkbox" checked={f.ratio_locked} onChange={(e) => setF({ ...f, ratio_locked: e.target.checked })} style={{ accentColor: gold }} /> Lock width : height ratio</label>}
        {f.customizable
          ? (<><L>Price per unit (₹)</L><input style={miniInput} type="number" value={f.price_per_unit} onChange={set("price_per_unit")} /></>)
          : (<><L>Price (₹)</L><input style={miniInput} type="number" value={f.price} onChange={set("price")} /></>)}
        <L>Status</L>
        <select style={miniInput} value={f.status} onChange={set("status")}>
          <option value="active">active</option><option value="draft">draft</option><option value="sold">sold</option>
        </select>
        <label style={ckLabel}><input type="checkbox" checked={f.in_stock} onChange={(e) => setF({ ...f, in_stock: e.target.checked })} style={{ accentColor: gold }} /> In stock</label>
        <label style={ckLabel}><input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} style={{ accentColor: gold }} /> Featured on home</label>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <Btn onClick={save} primary disabled={busy}>{busy ? "SAVING…" : "SAVE"}</Btn>
          <Btn onClick={onClose} ghost>CANCEL</Btn>
        </div>
      </div>
    </div>
  );
}

function L({ children }) {
  return <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.14em", color: "rgba(212,175,55,0.6)", margin: "2px 0 5px" }}>{children}</div>;
}
const ckLabel = { display: "flex", alignItems: "center", gap: 8, margin: "6px 0 12px", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#e8e0d0" };

function Tally() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  const load = () => {
    setErr("");
    api.admin.revenue().then(setData).catch((e) => { setData(null); setErr(e.message || "Request failed"); });
  };
  useEffect(() => { load(); }, []);

  const download = async (format) => {
    setBusy(format);
    try {
      const text = await api.admin.exportRevenue(format);
      const blob = new Blob([text], { type: format === "tally" ? "application/xml" : "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "tally" ? "art-coliseum-tally.xml" : "art-coliseum-revenue.csv";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { alert(e.message); } finally { setBusy(""); }
  };

  if (err) return (
    <Panel title="Price & Tally">
      <Empty>Couldn't load the P&amp;L report — {err}.<br />Check that the API is reachable and you're signed in as an admin.</Empty>
      <div style={{ textAlign: "center" }}><Btn ghost onClick={load}>RETRY</Btn></div>
    </Panel>
  );
  if (!data) return <Panel title="Price & Tally"><Empty>Loading P&L…</Empty></Panel>;
  const t = data.totals;
  const cards = [
    ["Gross revenue", inr(t.revenue)], ["Artwork sales", inr(t.art_sales)],
    ["Artist payouts", inr(t.payout)], ["Net profit", inr(t.profit)],
    ["GST collected", inr(t.gst)], ["Logistics + delivery", inr(t.logistics + t.delivery)],
    ["Paid orders", t.orders], ["Pending orders", data.pending_orders],
  ];
  return (
    <Panel title="Price & Tally — Profit / Loss">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 16 }}>
        <Btn primary disabled={!!busy} onClick={() => download("tally")}>{busy === "tally" ? "EXPORTING…" : "⬇ EXPORT TO TALLY (.XML)"}</Btn>
        <Btn disabled={!!busy} onClick={() => download("csv")}>{busy === "csv" ? "EXPORTING…" : "⬇ EXPORT CSV (EXCEL)"}</Btn>
        <Btn ghost onClick={load}>REFRESH</Btn>
      </div>
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.6)", marginBottom: 16, lineHeight: 1.6 }}>
        Figures are derived from <strong style={{ color: "#D4AF37" }}>{t.orders} paid order{t.orders === 1 ? "" : "s"}</strong>.
        Net profit = artwork sales − artist payouts (payout rate {Math.round(data.payout_rate * 100)}%). GST &amp; delivery are pass-through.
        The Tally file imports paid orders as Sales vouchers plus artist-payout journals; the CSV opens in Excel.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 12, marginBottom: 22 }}>
        {cards.map(([l, v]) => (
          <div key={l} style={{ padding: 16, border: "1px solid rgba(212,175,55,0.15)", borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: l === "Net profit" ? "#4ade80" : gold }}>{v}</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.12em", color: "rgba(200,191,160,0.6)", marginTop: 4 }}>{l.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, marginBottom: 10 }}>BY MONTH</div>
      {data.by_month.length === 0 && <Empty>No paid orders yet.</Empty>}
      {data.by_month.map((m) => (
        <div key={m.month} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 12px", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <div style={{ width: 80, fontFamily: "'Cinzel',serif", fontSize: 11, color: "#e8e0d0" }}>{m.month}</div>
          <div style={{ flex: 1, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.7)" }}>
            {m.orders} order{m.orders === 1 ? "" : "s"} · revenue {inr(m.revenue)} · payouts {inr(m.payout)}
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "#4ade80" }}>{inr(m.profit)}</div>
        </div>
      ))}
    </Panel>
  );
}

function Events() {
  const blank = { title: "", description: "", location: "", curator: "", starts_at: "", ends_at: "", address: "", parking: "", maps_url: "", details: "", image_url: "" };
  const [rows, setRows] = useState([]);
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const load = () => api.events.list().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const create = async () => {
    if (!f.title) { alert("Event title is required"); return; }
    if (f.starts_at && f.ends_at && new Date(f.ends_at) < new Date(f.starts_at)) { alert("End must be after start"); return; }
    setBusy(true);
    // datetime-local is the admin's wall-clock time → convert to UTC so every
    // viewer sees it correctly in their own timezone.
    const toUtc = (v) => (v ? new Date(v).toISOString() : null);
    try {
      await api.events.create({
        ...f, image_url: f.image_url || null, maps_url: f.maps_url || null,
        starts_at: toUtc(f.starts_at), ends_at: toUtc(f.ends_at),
      });
      setF(blank); await load();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  const del = async (id) => { await api.events.remove(id); load(); };
  return (
    <Panel title="Events">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <input placeholder="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} style={miniInput} />
        <input placeholder="Location (venue name)" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} style={miniInput} />
        <input placeholder="Curator" value={f.curator} onChange={(e) => setF({ ...f, curator: e.target.value })} style={miniInput} />
        <div style={{ display: "flex", alignItems: "center", fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.5)", padding: "0 4px" }}>
          Status (upcoming / ongoing / past) is set automatically from the dates.
        </div>
        <div><L>STARTS (date & time)</L><input type="datetime-local" value={f.starts_at} onChange={(e) => setF({ ...f, starts_at: e.target.value })} style={{ ...miniInput, width: "100%", boxSizing: "border-box", colorScheme: "dark" }} /></div>
        <div><L>ENDS (date & time)</L><input type="datetime-local" value={f.ends_at} onChange={(e) => setF({ ...f, ends_at: e.target.value })} style={{ ...miniInput, width: "100%", boxSizing: "border-box", colorScheme: "dark" }} /></div>
        <input placeholder="Full address" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} style={{ ...miniInput, gridColumn: "1 / -1" }} />
        <select value={f.parking} onChange={(e) => setF({ ...f, parking: e.target.value })} style={miniInput}>
          <option value="">Parking…</option>
          {PARKING_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <input placeholder="Google Maps link (https://maps.google.com/…)" value={f.maps_url} onChange={(e) => setF({ ...f, maps_url: e.target.value })} style={miniInput} />
        <textarea placeholder="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} style={{ ...miniInput, gridColumn: "1 / -1", minHeight: 54, resize: "vertical" }} />
        <textarea placeholder="Details / agenda (what to expect, timings, dress code…)" value={f.details} onChange={(e) => setF({ ...f, details: e.target.value })} style={{ ...miniInput, gridColumn: "1 / -1", minHeight: 54, resize: "vertical" }} />
      </div>
      <MediaUploader kind="image" label="EVENT IMAGE" hint="UPLOAD IMAGE" value={f.image_url} onChange={(url) => setF((v) => ({ ...v, image_url: url }))} />
      <Btn onClick={create} primary disabled={busy}>{busy ? "CREATING…" : "+ CREATE EVENT"}</Btn>
      <div style={{ marginTop: 16 }}>
        {rows.map((e) => (
          <Item key={e.id}>
            {e.image_url
              ? <img src={e.image_url} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
              : <div style={{ width: 44, height: 44, borderRadius: 6, border: "1px dashed rgba(212,175,55,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(212,175,55,0.4)", flexShrink: 0 }}>◆</div>}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>{e.title}</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)" }}>{e.status} · {e.location}</div>
            </div>
            <Btn onClick={() => del(e.id)} ghost>DELETE</Btn>
          </Item>
        ))}
      </div>
    </Panel>
  );
}

function Artists() {
  const [kyc, setKyc] = useState([]);
  const [tick, setTick] = useState(0);
  const load = () => { api.admin.artists().then(setKyc).catch(() => {}); };
  useEffect(() => { load(); }, []);
  const verify = async (uid) => { await api.admin.verifyArtist(uid); load(); };
  const reject = async (uid) => {
    if (!window.confirm("Decline this artist application? They go back to a normal user.")) return;
    await api.admin.rejectArtist(uid); load();
  };

  // Applicants awaiting a decision float to the top.
  const pending = kyc.filter((a) => a.status === "pending" || a.status === "unverified");
  const decided = kyc.filter((a) => a.status === "verified" || a.status === "rejected");

  const statusColor = (s) => s === "verified" ? "#4ade80" : s === "rejected" ? "#f87171" : gold;

  return (
    <Panel title="Artists">
      <AddArtist onCreated={() => { load(); setTick((t) => t + 1); }} />
      <AddArtworkForArtist tick={tick} />

      <ArtworkApprovalQueue />

      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, margin: "22px 0 10px" }}>
        ARTIST APPLICATIONS {pending.length > 0 && <span style={{ color: "#fbbf24" }}>· {pending.length} AWAITING REVIEW</span>}
      </div>
      {kyc.length === 0 && <Empty>No applications.</Empty>}
      {[...pending, ...decided].map((a) => (
        <Item key={a.user_id}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>{a.name} <span style={{ fontSize: 11, color: "rgba(200,191,160,0.5)" }}>· {a.art_type} · {a.location}</span></div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)" }}>
              {a.email} · <span style={{ color: statusColor(a.status), fontWeight: 600 }}>{a.status.toUpperCase()}</span>
            </div>
          </div>
          {a.status !== "verified" && <Btn onClick={() => verify(a.user_id)} primary>APPROVE</Btn>}
          {a.status !== "rejected" && a.status !== "verified" && <Btn onClick={() => reject(a.user_id)} ghost>DECLINE</Btn>}
        </Item>
      ))}
    </Panel>
  );
}

// Approve / reject newly-submitted artworks before they go public.
function ArtworkApprovalQueue() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState("");
  const load = () => api.admin.pendingArtworks().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const approve = async (id) => { setBusy(id); try { await api.admin.approveArtwork(id); await load(); } finally { setBusy(""); } };
  const reject = async (id) => {
    const reason = window.prompt("Reason for rejection (shown to the artist) — optional:", "");
    if (reason === null) return;
    setBusy(id); try { await api.admin.rejectArtwork(id, reason); await load(); } finally { setBusy(""); }
  };
  return (
    <div style={{ border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10, padding: 16, marginBottom: 18, background: "rgba(251,191,36,0.04)" }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: "#fbbf24", marginBottom: 12 }}>
        ARTWORK APPROVAL QUEUE {rows.length > 0 && `· ${rows.length} PENDING`}
      </div>
      {rows.length === 0 ? (
        <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.5)" }}>Nothing waiting — all caught up.</div>
      ) : rows.map((a) => (
        <Item key={a.id}>
          <img src={a.images?.[0]} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, background: "rgba(212,175,55,0.1)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>{a.title}</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)" }}>
              {a.artist_name || "—"} · {a.category_id || "—"}{a.subtype_id ? ` / ${a.subtype_id}` : ""} · {a.customizable ? "customizable" : inr(a.price)}
            </div>
          </div>
          <Btn onClick={() => approve(a.id)} primary disabled={busy === a.id}>{busy === a.id ? "…" : "APPROVE"}</Btn>
          <Btn onClick={() => reject(a.id)} ghost disabled={busy === a.id}>REJECT</Btn>
        </Item>
      ))}
    </div>
  );
}

function Competition() {
  const [comps, setComps] = useState([]);
  const [entries, setEntries] = useState({});
  const load = () => { api.competitions.list().then(setComps).catch(() => {}); };
  useEffect(() => { load(); }, []);
  const loadEntries = async (cid) => { const es = await api.competitions.entries(cid); setEntries((p) => ({ ...p, [cid]: es })); };
  const goLive = async (cid) => { await api.competitions.goLive(cid); load(); };
  const closeComp = async (cid) => {
    if (!window.confirm("Close judging and crown the highest-rated entry as winner?")) return;
    await api.competitions.close(cid); load(); loadEntries(cid);
  };
  return (
    <Panel title="Competition">
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12.5, color: "rgba(200,191,160,0.6)", lineHeight: 1.6, marginBottom: 16 }}>
        Competitions are an optional, juried event — separate from artist onboarding. Add jury logins, create a
        competition, take it live on the day, then close it to crown a winner.
      </div>
      <AddJury />
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, margin: "22px 0 10px" }}>COMPETITIONS</div>
      <CreateCompetition onCreated={load} />
      {comps.length === 0 && <Empty>No competitions yet.</Empty>}
      {comps.map((c) => (
        <div key={c.id} style={{ padding: 14, border: "1px solid rgba(212,175,55,0.14)", borderRadius: 10, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: "#fff" }}>
                {c.title} <span style={{ fontSize: 11, color: c.status === "live" ? "#4ade80" : gold }}>· {c.status.toUpperCase()}</span>
              </div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", marginTop: 2 }}>
                {c.event_date ? new Date(c.event_date).toLocaleDateString() + " · " : ""}
                {c.entry_count || 0}{c.min_artists ? ` / ${c.min_artists}` : ""} artists
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Btn onClick={() => loadEntries(c.id)}>VIEW ENTRIES</Btn>
              {(c.status === "open" || c.status === "judging") && <Btn onClick={() => goLive(c.id)} primary>GO LIVE</Btn>}
              {c.status !== "closed" && <Btn onClick={() => closeComp(c.id)}>CLOSE & PICK WINNER</Btn>}
            </div>
          </div>
          {(entries[c.id] || []).map((e) => (
            <Item key={e.id}>
              <img src={e.image} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4, background: "rgba(212,175,55,0.1)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "#fff" }}>{e.title} <span style={{ fontSize: 11, color: "rgba(200,191,160,0.5)" }}>· {e.artist_name || "Artist"}</span></div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: e.status === "winner" ? "#4ade80" : gold, letterSpacing: "0.12em" }}>
                  {e.status.toUpperCase()}{e.avg_score != null ? ` · ★ ${e.avg_score}` : " · UNRATED"}
                </div>
              </div>
            </Item>
          ))}
        </div>
      ))}
    </Panel>
  );
}

// ═══════════════ EXHIBITIONS ═══════════════════════════════════════
function Exhibitions() {
  const [rows, setRows] = useState([]);
  const [subs, setSubs] = useState({});
  const [busy, setBusy] = useState("");
  const blank = { title: "", theme: "", description: "", hero_image_url: "", registration_starts_at: "", registration_ends_at: "" };
  const [f, setF] = useState(blank);
  const load = () => api.exhibitions.list().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);

  const running = rows.find((e) => e.status !== "ended");
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  const create = async () => {
    if (!f.title.trim()) { alert("Exhibition title is required"); return; }
    setBusy("create");
    try {
      await api.exhibitions.create({
        title: f.title.trim(), theme: f.theme || null, description: f.description || null,
        hero_image_url: f.hero_image_url || null,
        registration_starts_at: f.registration_starts_at || null,
        registration_ends_at: f.registration_ends_at || null,
      });
      setF(blank); await load();
    } catch (e) { alert(e.message); } finally { setBusy(""); }
  };
  const act = async (id, fn) => { setBusy(id); try { await fn(id); await load(); } catch (e) { alert(e.message); } finally { setBusy(""); } };
  const viewSubs = async (id) => { const s = await api.exhibitions.submissions(id); setSubs((p) => ({ ...p, [id]: s })); };

  const phaseColor = (s) => ({ live: "#4ade80", registration: "#fbbf24", upcoming: gold, ended: "rgba(200,191,160,0.5)" }[s] || gold);

  return (
    <Panel title="Exhibitions">
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12.5, color: "rgba(200,191,160,0.6)", lineHeight: 1.6, marginBottom: 16 }}>
        Run one online exhibition at a time. Open registration so approved artists can submit their approved works,
        then take it live as a curated online gallery. End it to start another.
      </div>

      {/* Create */}
      <div style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 10, padding: 16, marginBottom: 18, background: "rgba(212,175,55,0.03)", opacity: running ? 0.5 : 1, pointerEvents: running ? "none" : "auto" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, marginBottom: 12 }}>
          NEW EXHIBITION {running && "· (end the current one first)"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input placeholder="Title" value={f.title} onChange={set("title")} style={miniInput} />
          <input placeholder="Theme (e.g. Light & Shadow)" value={f.theme} onChange={set("theme")} style={miniInput} />
          <textarea placeholder="Description" value={f.description} onChange={set("description")} style={{ ...miniInput, gridColumn: "1 / -1", minHeight: 54, resize: "vertical" }} />
          <div style={{ gridColumn: "1 / -1" }}>
            <ImageField label="Hero image" value={f.hero_image_url} onChange={(url) => setF((v) => ({ ...v, hero_image_url: url }))} />
          </div>
          <div>
            <L>Registration opens</L>
            <input type="datetime-local" value={f.registration_starts_at} onChange={set("registration_starts_at")} style={{ ...miniInput, width: "100%", boxSizing: "border-box", colorScheme: "dark" }} />
          </div>
          <div>
            <L>Registration closes (then it goes live)</L>
            <input type="datetime-local" value={f.registration_ends_at} onChange={set("registration_ends_at")} style={{ ...miniInput, width: "100%", boxSizing: "border-box", colorScheme: "dark" }} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <Btn onClick={create} primary disabled={busy === "create" || !!running}>{busy === "create" ? "CREATING…" : "+ CREATE EXHIBITION"}</Btn>
        </div>
      </div>

      {/* List */}
      {rows.length === 0 && <Empty>No exhibitions yet.</Empty>}
      {rows.map((e) => (
        <div key={e.id} style={{ padding: 16, border: "1px solid rgba(212,175,55,0.16)", borderRadius: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {e.hero_image_url && <img src={e.hero_image_url} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#fff" }}>
                {e.title} <span style={{ fontSize: 11, color: phaseColor(e.status) }}>· {e.status.toUpperCase()}</span>
              </div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", marginTop: 2 }}>
                {e.theme ? `${e.theme} · ` : ""}{e.submission_count} submission{e.submission_count === 1 ? "" : "s"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
            {e.status === "draft" && <Btn onClick={() => act(e.id, api.exhibitions.open)} primary disabled={busy === e.id}>OPEN REGISTRATION</Btn>}
            {(e.status === "registration" || e.status === "upcoming") && <Btn onClick={() => act(e.id, api.exhibitions.goLive)} primary disabled={busy === e.id}>GO LIVE NOW</Btn>}
            {e.status !== "ended" && <Btn onClick={() => { if (window.confirm("End this exhibition?")) act(e.id, api.exhibitions.end); }} ghost disabled={busy === e.id}>END</Btn>}
            <Btn onClick={() => viewSubs(e.id)}>VIEW SUBMISSIONS</Btn>
          </div>
          {(subs[e.id] || []).length > 0 && (
            <div style={{ marginTop: 10 }}>
              {subs[e.id].map((s) => (
                <Item key={s.id}>
                  <img src={s.image} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4, background: "rgba(212,175,55,0.1)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "#fff" }}>{s.title} <span style={{ fontSize: 10, color: "rgba(200,191,160,0.5)" }}>· {s.artist_name || "Artist"}</span></div>
                  </div>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.12em", color: s.status === "active" ? "#4ade80" : "#fbbf24" }}>{(s.status || "").toUpperCase()}</span>
                </Item>
              ))}
            </div>
          )}
        </div>
      ))}
    </Panel>
  );
}

function CreateCompetition({ onCreated }) {
  const blank = { title: "", description: "", event_date: "", min_artists: "" };
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const create = async () => {
    if (!f.title.trim()) { alert("Competition title is required"); return; }
    setBusy(true);
    try {
      await api.competitions.create({
        title: f.title, description: f.description || null,
        event_date: f.event_date || null, min_artists: f.min_artists ? Number(f.min_artists) : 0,
      });
      setF(blank); onCreated && onCreated();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  return (
    <div style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 10, padding: 14, marginBottom: 14, background: "rgba(212,175,55,0.03)" }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, marginBottom: 10 }}>NEW COMPETITION</div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
        <input placeholder="Title" value={f.title} onChange={set("title")} style={miniInput} />
        <input type="date" value={f.event_date} onChange={set("event_date")} style={{ ...miniInput, colorScheme: "dark" }} />
        <input type="number" placeholder="Min artists" value={f.min_artists} onChange={set("min_artists")} style={miniInput} />
        <input placeholder="Description" value={f.description} onChange={set("description")} style={{ ...miniInput, gridColumn: "1 / -1" }} />
      </div>
      <div style={{ marginTop: 10 }}>
        <Btn onClick={create} primary disabled={busy}>{busy ? "CREATING…" : "+ CREATE COMPETITION"}</Btn>
      </div>
    </div>
  );
}

function AddJury() {
  const blank = { email: "", password: "", name: "" };
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const submit = async () => {
    if (!f.name.trim() || !f.email.trim()) { alert("Name and email are required"); return; }
    if (emailRule(f.email)) { alert("Enter a valid email"); return; }
    const pe = minLen(6, "Password")(f.password);
    if (pe) { alert(pe); return; }
    setBusy(true);
    try {
      const res = await api.admin.createJury(f);
      setDone(`Created jury login for ${res.name} (${res.email}). Share the password you set.`);
      setF(blank);
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  return (
    <div style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 10, padding: 16, marginBottom: 18, background: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, marginBottom: 12 }}>ADD A JURY MEMBER</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <input placeholder="Full name" value={f.name} onChange={set("name")} style={miniInput} />
        <input placeholder="Login email" value={f.email} onChange={set("email")} style={miniInput} />
        <input placeholder="Login password" value={f.password} onChange={set("password")} style={miniInput} />
      </div>
      <div style={{ marginTop: 12 }}>
        <Btn onClick={submit} primary disabled={busy}>{busy ? "CREATING…" : "+ CREATE JURY LOGIN"}</Btn>
      </div>
      {done && <div style={{ marginTop: 10, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#4ade80" }}>{done}</div>}
    </div>
  );
}

function AddArtist({ onCreated }) {
  const blank = { email: "", password: "", name: "", bio: "", location: "", art_type: "", age: "", image_url: "", gender: "" };
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const submit = async () => {
    if (!f.email || !f.password || !f.name) { alert("Email, password and name are required"); return; }
    if (emailRule(f.email)) { alert("Enter a valid email"); return; }
    const pe = minLen(6, "Password")(f.password);
    if (pe) { alert(pe); return; }
    const ageErr = f.age ? intRange(16, 100, "Age")(f.age) : "";
    if (ageErr) { alert(ageErr); return; }
    setBusy(true);
    try {
      const res = await api.admin.createArtist({ ...f, age: f.age ? Number(f.age) : null });
      setDone(`Created ${res.name} (${res.email}). They can sign in with the password you set.`);
      setF(blank);
      onCreated && onCreated();
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  };
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  return (
    <div style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 10, padding: 16, marginBottom: 18, background: "rgba(212,175,55,0.03)" }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, marginBottom: 12 }}>ADD AN ARTIST DIRECTLY</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <input placeholder="Full name" value={f.name} onChange={set("name")} style={miniInput} />
        <input placeholder="Art type (e.g. Oil)" value={f.art_type} onChange={set("art_type")} style={miniInput} />
        <input placeholder="Login email" value={f.email} onChange={set("email")} style={miniInput} />
        <input placeholder="Login password" value={f.password} onChange={set("password")} style={miniInput} />
        <input placeholder="Location" value={f.location} onChange={set("location")} style={miniInput} />
        <input placeholder="Age" value={f.age} onChange={set("age")} style={miniInput} />
        <select value={f.gender} onChange={set("gender")} style={miniInput}>
          <option value="">Gender (for default avatar)…</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <input placeholder="Bio" value={f.bio} onChange={set("bio")} style={{ ...miniInput, gridColumn: "1 / -1" }} />
        <div style={{ gridColumn: "1 / -1" }}>
          <MediaUploader kind="image" label="ARTIST PHOTO" hint="UPLOAD PHOTO" value={f.image_url} onChange={(url) => setF((v) => ({ ...v, image_url: url }))} />
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <Btn onClick={submit} primary disabled={busy}>{busy ? "CREATING…" : "+ CREATE ARTIST"}</Btn>
      </div>
      {done && <div style={{ marginTop: 10, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#4ade80" }}>{done}</div>}
    </div>
  );
}

function AddArtworkForArtist({ tick }) {
  const blank = { artist_id: "", title: "", price: "", price_per_unit: "", medium: "", category_id: "", width: "", height: "", depth: "", dim_unit: "cm", image_url: "", customizable: false, ratio_locked: false, featured: false, narrative: "", unit: "cm", min_width: "", max_width: "", min_height: "", max_height: "", min_depth: "", max_depth: "" };
  const [artists, setArtists] = useState([]);
  const [cats, setCats] = useState([]);
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  useEffect(() => {
    api.catalog.artists().then(setArtists).catch(() => {});
    api.catalog.categories().then((c) => setCats(c.filter((x) => x.kind === "main"))).catch(() => {});
  }, [tick]);
  const is3D = isThreeD(f.category_id, cats);
  const composedDims = composeDims(f.width, f.height, is3D ? f.depth : "", f.dim_unit);
  const submit = async () => {
    if (!f.artist_id || !f.title || !f.category_id) { alert("Artist, title and category are required"); return; }
    if (!f.customizable && (!f.price || Number(f.price) <= 0)) { alert("Predefined (fixed-price) artworks need a price greater than 0"); return; }
    if (f.customizable && (!f.price_per_unit || Number(f.price_per_unit) <= 0)) { alert("Customizable artworks need a price per unit greater than 0"); return; }
    setBusy(true);
    try {
      await api.admin.createArtwork({
        title: f.title, narrative: f.narrative || null, medium: f.medium || null,
        category_id: f.category_id,
        width: !f.customizable && f.width !== "" ? Number(f.width) : null,
        height: !f.customizable && f.height !== "" ? Number(f.height) : null,
        depth: !f.customizable && is3D && f.depth !== "" ? Number(f.depth) : null,
        base_dimensions: f.customizable ? null : (composedDims || null),
        customizable: f.customizable, ratio_locked: f.customizable && f.ratio_locked,
        price: f.price ? Number(f.price) : 0,
        unit: f.customizable ? f.unit : null,
        price_per_unit: f.customizable && f.price_per_unit !== "" ? Number(f.price_per_unit) : null,
        min_width: f.customizable && f.min_width !== "" ? Number(f.min_width) : null,
        max_width: f.customizable && f.max_width !== "" ? Number(f.max_width) : null,
        min_height: f.customizable && f.min_height !== "" ? Number(f.min_height) : null,
        max_height: f.customizable && f.max_height !== "" ? Number(f.max_height) : null,
        min_depth: f.customizable && is3D && f.min_depth !== "" ? Number(f.min_depth) : null,
        max_depth: f.customizable && is3D && f.max_depth !== "" ? Number(f.max_depth) : null,
        featured: f.featured, images: f.image_url ? [f.image_url] : [], artist_id: f.artist_id,
      });
      setDone(`Added "${f.title}".`);
      setF({ ...blank, artist_id: f.artist_id });
    } catch (e) { alert(e.message); }
    finally { setBusy(false); }
  };
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  return (
    <div style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 10, padding: 16, marginBottom: 4, background: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, marginBottom: 12 }}>ADD ARTWORK FOR AN ARTIST</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <select value={f.artist_id} onChange={set("artist_id")} style={miniInput}>
          <option value="">Select artist…</option>
          {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={f.category_id} onChange={set("category_id")} style={miniInput}>
          <option value="">Select medium…</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <input placeholder="Title" value={f.title} onChange={set("title")} style={miniInput} />
        <input placeholder="Medium (e.g. Oil on canvas)" value={f.medium} onChange={set("medium")} style={miniInput} />
        <input placeholder="Price (₹)" value={f.price} onChange={set("price")} style={miniInput} disabled={f.customizable} />
        <div />
        {!f.customizable && (
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: "rgba(212,175,55,0.6)", marginBottom: 6 }}>
              ARTWORK SIZE{is3D ? " (W × H × D)" : " (W × H)"}{composedDims ? ` — ${composedDims}` : ""}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: is3D ? "repeat(4, 1fr)" : "repeat(3, 1fr)", gap: 8 }}>
              <input placeholder="Width" value={f.width} onChange={set("width")} style={miniInput} />
              <input placeholder="Height" value={f.height} onChange={set("height")} style={miniInput} />
              {is3D && <input placeholder="Depth / Length" value={f.depth} onChange={set("depth")} style={miniInput} />}
              <select value={f.dim_unit} onChange={set("dim_unit")} style={miniInput}>
                <option value="cm">cm</option><option value="inch">inch</option><option value="feet">feet</option>
              </select>
            </div>
          </div>
        )}
        <input placeholder="Narrative / description" value={f.narrative} onChange={set("narrative")} style={{ ...miniInput, gridColumn: "1 / -1" }} />
        {f.customizable && (
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: "rgba(212,175,55,0.6)", marginBottom: 6 }}>
              PRICE PER UNIT (₹ per {f.unit}²) — used to calculate the buyer's total
            </div>
            <input placeholder={`Price per ${f.unit}² (₹)`} type="number" value={f.price_per_unit} onChange={set("price_per_unit")} style={{ ...miniInput, width: "100%", marginBottom: 12 }} />
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: "rgba(212,175,55,0.6)", marginBottom: 6 }}>
              CUSTOMIZATION SIZE RANGE — leave blank for no limit
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              <input placeholder="Min W" value={f.min_width} onChange={set("min_width")} style={miniInput} />
              <input placeholder="Max W" value={f.max_width} onChange={set("max_width")} style={miniInput} />
              <input placeholder="Min H" value={f.min_height} onChange={set("min_height")} style={miniInput} />
              <input placeholder="Max H" value={f.max_height} onChange={set("max_height")} style={miniInput} />
              <select value={f.unit} onChange={set("unit")} style={miniInput}>
                <option value="cm">cm</option><option value="inch">inch</option><option value="feet">feet</option>
              </select>
              {is3D && (
                <>
                  <input placeholder="Min Depth" value={f.min_depth} onChange={set("min_depth")} style={miniInput} />
                  <input placeholder="Max Depth" value={f.max_depth} onChange={set("max_depth")} style={miniInput} />
                </>
              )}
            </div>
          </div>
        )}
        <div style={{ gridColumn: "1 / -1" }}>
          <MediaUploader kind="image" label="ARTWORK IMAGE" hint="UPLOAD IMAGE" value={f.image_url} onChange={(url) => setF((v) => ({ ...v, image_url: url }))} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, gridColumn: "1 / -1", flexWrap: "wrap" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.75)", cursor: "pointer" }}>
            <input type="checkbox" checked={f.customizable} onChange={(e) => setF((v) => ({ ...v, customizable: e.target.checked }))} style={{ accentColor: gold }} />
            Customizable (priced per unit)
          </label>
          {f.customizable && (
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.75)", cursor: "pointer" }}>
              <input type="checkbox" checked={f.ratio_locked} onChange={(e) => setF((v) => ({ ...v, ratio_locked: e.target.checked }))} style={{ accentColor: gold }} />
              Lock W:H ratio
            </label>
          )}
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.75)", cursor: "pointer" }}>
            <input type="checkbox" checked={f.featured} onChange={(e) => setF((v) => ({ ...v, featured: e.target.checked }))} style={{ accentColor: gold }} />
            Featured on home
          </label>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <Btn onClick={submit} primary disabled={busy}>{busy ? "ADDING…" : "+ ADD ARTWORK"}</Btn>
      </div>
      {done && <div style={{ marginTop: 10, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#4ade80" }}>{done}</div>}
    </div>
  );
}

function ContactList() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.support.listContact().then(setRows).catch(() => setRows([])); }, []);
  return (
    <Panel title="Contact Messages">
      {rows.length === 0 && <Empty>No messages.</Empty>}
      {rows.map((m) => (
        <div key={m.id} style={{ padding: 14, border: "1px solid rgba(212,175,55,0.12)", borderRadius: 8, marginBottom: 8 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>{m.name} <span style={{ fontSize: 11, color: "rgba(200,191,160,0.5)" }}>· {m.email}</span></div>
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", marginTop: 4 }}>{m.subject ? <strong>{m.subject}: </strong> : null}{m.message}</div>
        </div>
      ))}
    </Panel>
  );
}

function Support() {
  const [rows, setRows] = useState([]);
  const load = () => api.support.listTickets().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const setStatus = async (id, status) => { await api.support.setTicketStatus(id, status); load(); };
  return (
    <Panel title="Support Tickets">
      {rows.length === 0 && <Empty>No tickets.</Empty>}
      {rows.map((t) => (
        <Item key={t.id}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>{t.subject || "Ticket"} <span style={{ fontSize: 11, color: "rgba(200,191,160,0.5)" }}>· {t.email}</span></div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.65)", marginTop: 3 }}>{t.message}</div>
          </div>
          <select value={t.status} onChange={(e) => setStatus(t.id, e.target.value)} style={miniInput}>
            <option value="open">open</option><option value="in_progress">in_progress</option><option value="resolved">resolved</option><option value="closed">closed</option>
          </select>
        </Item>
      ))}
    </Panel>
  );
}

/* ── shared bits ── */
function Panel({ title, children }) {
  return (
    <div style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 12, background: "rgba(255,255,255,0.02)", padding: 24 }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.18em", color: gold, marginBottom: 18 }}>{(title || "").toUpperCase()}</div>
      {children}
    </div>
  );
}
function Item({ children }) {
  return <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>{children}</div>;
}
/* ═══════════════ CATEGORIES ══════════════════════════════════════ */
const DEFAULT_CATEGORY_TABS = [
  { label: "About the Art", heading: "", body: "", image_url: "" },
  { label: "History & Origins", heading: "", body: "", image_url: "" },
  { label: "Modern Era", heading: "", body: "", image_url: "" },
  { label: "Pioneers & Masters", heading: "", body: "", image_url: "" },
];

function Categories() {
  const [cats, setCats] = useState([]);
  const [editing, setEditing] = useState(null);       // "new" | main-category object
  const [subEditing, setSubEditing] = useState(null); // "new" | subtype object
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = () => api.categories.list().then(setCats).catch(() => {});
  useEffect(() => { load(); }, []);

  const mains = cats.filter((c) => c.kind === "main").sort((a, b) => a.label.localeCompare(b.label));
  const subtypesOf = (id) => cats.filter((c) => c.kind === "subtype" && c.parent_id === id);

  const del = async (id, label) => {
    if (!window.confirm(`Delete "${label}"?`)) return;
    setBusy(true); setErr("");
    try { await api.categories.delete(id); await load(); }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <Panel title="Categories & Subtypes">
      {err && <div style={{ color: "#e05", marginBottom: 12, fontFamily: "'Raleway',sans-serif", fontSize: 13 }}>{err}</div>}

      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12.5, color: "rgba(200,191,160,0.6)", lineHeight: 1.6, marginBottom: 14 }}>
        A main category carries its full page setup — the card/hero image, tagline, short description,
        the four detail-page tabs (each with its own text and image) and the pioneers list.
        Subtypes carry an image and a short description.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        <Btn primary onClick={() => setEditing("new")}>+ ADD MAIN CATEGORY</Btn>
        <Btn onClick={() => setSubEditing("new")} disabled={mains.length === 0}>+ ADD SUBTYPE / STYLE</Btn>
      </div>

      {/* Category tree */}
      <div style={{ display: "grid", gap: 16 }}>
        {mains.map((m) => {
          const hasContent = m.image_url && (m.tabs || []).some((t) => t.body || t.image_url);
          return (
            <div key={m.id} style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                {m.image_url
                  ? <img src={m.image_url} alt="" style={{ width: 46, height: 46, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(212,175,55,0.25)" }} />
                  : <div style={{ width: 46, height: 46, borderRadius: 6, border: "1px dashed rgba(212,175,55,0.35)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(212,175,55,0.4)", fontSize: 16, flexShrink: 0 }}>✦</div>}
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#fff" }}>{m.label}</span>
                  <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: "rgba(200,191,160,0.4)", marginLeft: 10 }}>ID: {m.id}</span>
                  {!hasContent && (
                    <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "#fbbf24", marginTop: 2 }}>
                      Page content incomplete — the site shows default text and images until you EDIT.
                    </div>
                  )}
                </div>
                <Btn onClick={() => setEditing(m)} disabled={busy}>EDIT</Btn>
                <Btn ghost onClick={() => del(m.id, m.label)} disabled={busy || subtypesOf(m.id).length > 0}>DELETE</Btn>
              </div>
              {subtypesOf(m.id).length === 0 ? (
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.4)" }}>No subtypes yet</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {subtypesOf(m.id).map((s) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 999, padding: "4px 12px" }}>
                      {s.image_url && <img src={s.image_url} alt="" style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover" }} />}
                      <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#e8e0d0" }}>{s.label}</span>
                      <button
                        onClick={() => setSubEditing(s)}
                        disabled={busy}
                        title="Edit style"
                        style={{ background: "none", border: "none", color: gold, cursor: "pointer", fontSize: 11, lineHeight: 1, padding: 0 }}>✎</button>
                      <button
                        onClick={() => del(s.id, s.label)}
                        disabled={busy}
                        style={{ background: "none", border: "none", color: "rgba(200,191,160,0.4)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {mains.length === 0 && <Empty>No categories yet</Empty>}
      </div>

      {editing && (
        <CategoryEditorModal
          category={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
      {subEditing && (
        <SubtypeEditorModal
          subtype={subEditing === "new" ? null : subEditing}
          mains={mains}
          onClose={() => setSubEditing(null)}
          onSaved={() => { setSubEditing(null); load(); }}
        />
      )}
    </Panel>
  );
}

// Upload button + thumbnail preview for a single image URL field.
function ImageField({ label, value, onChange, hint }) {
  const upload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const { url } = await api.uploads.file(file, "image"); onChange(url); }
    catch (err) { alert(err.message); }
    e.target.value = "";
  };
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <L>{label}</L>}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <label style={{ ...miniInput, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11 }}>
          <input type="file" accept="image/*" onChange={upload} style={{ display: "none" }} />
          {value ? "REPLACE IMAGE" : "UPLOAD IMAGE"}
        </label>
        {value
          ? <img src={value} alt="" style={{ width: 54, height: 54, borderRadius: 6, objectFit: "cover", border: "1px solid rgba(212,175,55,0.3)" }} />
          : <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.45)" }}>{hint || "No image yet"}</span>}
        {value && (
          <button onClick={() => onChange("")} style={{ background: "none", border: "none", color: "rgba(200,191,160,0.5)", cursor: "pointer", fontSize: 12, fontFamily: "'Raleway',sans-serif" }}>remove</button>
        )}
      </div>
    </div>
  );
}

// Full page-content editor for a main category: card/hero image, tagline,
// description, the four detail-page tabs and the pioneers list.
function CategoryEditorModal({ category, onClose, onSaved }) {
  const isNew = !category;
  const [f, setF] = useState({
    label: category?.label || "",
    tagline: category?.tagline || "",
    description: category?.description || "",
    image_url: category?.image_url || "",
    pioneers: (category?.pioneers || []).join(", "),
    tabs: DEFAULT_CATEGORY_TABS.map((d, i) => ({ ...d, ...(category?.tabs?.[i] || {}) })),
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const setTab = (i, k, val) => setF((v) => ({ ...v, tabs: v.tabs.map((t, j) => (j === i ? { ...t, [k]: val } : t)) }));

  const save = async () => {
    if (!f.label.trim()) { alert("Category name is required"); return; }
    if (isNew && !f.image_url) { alert("Upload the main category image — it is shown on the Collections card and as the page hero."); return; }
    const missing = [];
    if (!f.image_url) missing.push("main image");
    if (!f.tagline.trim()) missing.push("tagline");
    if (!f.description.trim()) missing.push("short description");
    f.tabs.forEach((t, i) => {
      if (!t.image_url) missing.push(`"${t.label || `tab ${i + 1}`}" image`);
      if (i !== 3 && !t.body.trim()) missing.push(`"${t.label || `tab ${i + 1}`}" text`);
    });
    if (!f.pioneers.trim()) missing.push("pioneer names");
    if (missing.length && !window.confirm(`Still missing: ${missing.join(", ")}.\n\nThe public page falls back to default editorial content for anything left empty. Save anyway?`)) return;
    setBusy(true);
    try {
      const payload = {
        label: f.label.trim(),
        tagline: f.tagline.trim() || null,
        description: f.description.trim() || null,
        image_url: f.image_url || null,
        tabs: f.tabs.map((t) => ({ label: t.label, heading: t.heading, body: t.body, image_url: t.image_url || null })),
        pioneers: f.pioneers.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (isNew) await api.categories.createMain(payload);
      else await api.categories.update(category.id, payload);
      onSaved();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 7000, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#15120c", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 660, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.16em", color: gold, marginBottom: 16 }}>
          {isNew ? "NEW MAIN CATEGORY" : `EDIT · ${category.label}`}
        </div>

        <L>Category name *</L>
        <input style={wideInput} value={f.label} onChange={set("label")} placeholder="e.g. Ceramics" />
        <L>Tagline — the small gold line above the page title</L>
        <input style={wideInput} value={f.tagline} onChange={set("tagline")} placeholder="e.g. THE ART OF CERAMICS" />
        <L>Short description — shown on the Collections card</L>
        <textarea style={wideArea} value={f.description} onChange={set("description")} placeholder="e.g. Hand-thrown stoneware & porcelain" />
        <ImageField
          label="Main image * — Collections card + page hero"
          value={f.image_url}
          onChange={(url) => setF((v) => ({ ...v, image_url: url }))}
        />

        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, margin: "18px 0 10px" }}>DETAIL PAGE TABS</div>
        {f.tabs.map((t, i) => (
          <div key={i} style={{ border: "1px solid rgba(212,175,55,0.15)", borderRadius: 10, padding: 14, marginBottom: 12, background: "rgba(255,255,255,0.015)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontStyle: "italic", color: "rgba(212,175,55,0.5)" }}>{String(i + 1).padStart(2, "0")}</span>
              <input style={{ ...miniInput, flex: 1, fontSize: 12, padding: "7px 10px" }} value={t.label} onChange={(e) => setTab(i, "label", e.target.value)} placeholder="Tab name" />
            </div>
            <input style={{ ...wideInput, marginBottom: 8 }} value={t.heading} onChange={(e) => setTab(i, "heading", e.target.value)} placeholder={`Heading, e.g. "${["The Art of …", "Ancient Beginnings", "Into the Modern Era", "The Great Masters"][i] || "…"}"`} />
            {i === 3 ? (
              <textarea style={{ ...wideArea, marginBottom: 8 }} value={f.pioneers} onChange={set("pioneers")} placeholder="Pioneer / master names, comma separated — shown as gold chips" />
            ) : (
              <textarea style={{ ...wideArea, marginBottom: 8 }} value={t.body} onChange={(e) => setTab(i, "body", e.target.value)} placeholder="Tab text — the paragraph shown beside the image" />
            )}
            <ImageField value={t.image_url || ""} onChange={(url) => setTab(i, "image_url", url)} hint="Tab image — the left panel of this slide" />
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <Btn onClick={save} primary disabled={busy}>{busy ? "SAVING…" : isNew ? "+ CREATE CATEGORY" : "SAVE"}</Btn>
          <Btn onClick={onClose} ghost>CANCEL</Btn>
        </div>
      </div>
    </div>
  );
}

// Compact editor for a subtype/style: parent, label, image and description.
function SubtypeEditorModal({ subtype, mains, onClose, onSaved }) {
  const isNew = !subtype;
  const [f, setF] = useState({
    label: subtype?.label || "",
    parent_id: subtype?.parent_id || "",
    description: subtype?.description || "",
    image_url: subtype?.image_url || "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  const save = async () => {
    if (!f.label.trim()) { alert("Style name is required"); return; }
    if (isNew && !f.parent_id) { alert("Pick the main category this style belongs under"); return; }
    if (isNew && !f.image_url) { alert("Upload an image for this style — it is shown on the Styles & Forms card."); return; }
    setBusy(true);
    try {
      const extra = { image_url: f.image_url || null, description: f.description.trim() || null };
      if (isNew) await api.categories.createSubtype(f.label.trim(), f.parent_id, extra);
      else await api.categories.update(subtype.id, { label: f.label.trim(), ...extra });
      onSaved();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 7000, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#15120c", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 460, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.16em", color: gold, marginBottom: 16 }}>
          {isNew ? "NEW SUBTYPE / STYLE" : `EDIT · ${subtype.label}`}
        </div>

        <L>Main category *</L>
        <select style={wideInput} value={f.parent_id} onChange={set("parent_id")} disabled={!isNew}>
          <option value="">— select medium —</option>
          {mains.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <L>Style name *</L>
        <input style={wideInput} value={f.label} onChange={set("label")} placeholder="e.g. Impressionism" />
        <L>Short description — shown on the style's page</L>
        <textarea style={wideArea} value={f.description} onChange={set("description")} placeholder="One or two sentences about this style" />
        <ImageField
          label="Image * — the Styles & Forms card + page hero"
          value={f.image_url}
          onChange={(url) => setF((v) => ({ ...v, image_url: url }))}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <Btn onClick={save} primary disabled={busy}>{busy ? "SAVING…" : isNew ? "+ CREATE STYLE" : "SAVE"}</Btn>
          <Btn onClick={onClose} ghost>CANCEL</Btn>
        </div>
      </div>
    </div>
  );
}

// Admin-managed discussion communities (shown in the Community feed for everyone).
function CommunityAdmin() {
  return (
    <Panel title="Communities">
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.65)", marginBottom: 18, lineHeight: 1.6 }}>
        Create the discussion communities collectors and artists can post in. They appear in the Community feed for everyone.
      </div>
      <CommunitiesManager />
    </Panel>
  );
}

function CommunitiesManager() {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ name: "", description: "", color: "#D4AF37" });
  const [busy, setBusy] = useState(false);
  const load = () => api.community.communities().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const create = async () => {
    if (!f.name.trim()) { alert("Community name is required"); return; }
    setBusy(true);
    try { await api.community.createCommunity(f); setF({ name: "", description: "", color: "#D4AF37" }); load(); }
    catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  const del = async (slug) => { if (window.confirm("Delete this community?")) { await api.community.deleteCommunity(slug); load(); } };
  return (
    <div>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", color: gold, marginBottom: 10 }}>COMMUNITIES</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Community name" style={{ ...miniInput, flex: 1, minWidth: 150 }} />
        <input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Description" style={{ ...miniInput, flex: 2, minWidth: 180 }} />
        <input type="color" value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} title="Colour" style={{ width: 42, height: 40, background: "transparent", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 6, cursor: "pointer" }} />
        <Btn primary onClick={create} disabled={busy}>{busy ? "…" : "ADD"}</Btn>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {rows.map((c) => (
          <div key={c.slug} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(212,175,55,0.07)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 999, padding: "5px 12px" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: c.color || gold }} />
            <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#e8e0d0" }}>{c.name}</span>
            <button onClick={() => del(c.slug)} style={{ background: "none", border: "none", color: "rgba(200,191,160,0.4)", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
          </div>
        ))}
        {rows.length === 0 && <Empty>No communities yet</Empty>}
      </div>
    </div>
  );
}

function Btn({ children, onClick, primary, ghost, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "8px 14px", borderRadius: 999, cursor: disabled ? "default" : "pointer", whiteSpace: "nowrap",
      fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.12em",
      background: primary ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "transparent",
      color: primary ? "#111" : ghost ? "rgba(200,191,160,0.7)" : gold,
      border: primary ? "none" : `1px solid rgba(212,175,55,${ghost ? 0.2 : 0.4})`, opacity: disabled ? 0.4 : 1,
    }}>{children}</button>
  );
}
function Empty({ children }) { return <div style={{ padding: 24, textAlign: "center", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.5)" }}>{children}</div>; }
function Center({ children }) { return <section style={{ padding: "140px 24px", textAlign: "center" }}>{children}</section>; }
const preStyle = { display: "inline-block", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", padding: 14, borderRadius: 8, color: gold, marginTop: 10, fontFamily: "monospace", fontSize: 12 };
const miniInput = { padding: "10px 13px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 6, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 14.5, outline: "none" };
const wideInput = { ...miniInput, width: "100%", boxSizing: "border-box", marginBottom: 12 };
const wideArea = { ...wideInput, minHeight: 64, resize: "vertical" };
