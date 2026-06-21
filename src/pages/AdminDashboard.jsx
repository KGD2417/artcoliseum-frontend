import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/Auth";
import { Skeleton, SkeletonRows } from "../components/ui/Skeleton";
import MediaUploader from "../components/ui/MediaUploader";
import ArtworkForm, { Field as AField, inputStyle as aInputStyle } from "../components/ArtworkForm";
import { isThreeD, composeDims } from "../utils/dimensions";
import { api, realtime } from "../utils/api";
import { email as emailRule, minLen, intRange } from "../utils/validation";

const gold = "#D4AF37";
const TABS = [
  ["overview", "Overview"], ["traffic", "Traffic"], ["tally", "Price & Tally"], ["enquiries", "Enquiries"], ["orders", "Orders"],
  ["artworks", "Artworks"], ["categories", "Categories"], ["exhibitions", "Exhibitions"], ["events", "Events"],
  ["artists", "Artists"], ["competition", "Competition"], ["communities", "Communities"],
  ["news", "News"], ["testimonials", "Testimonials"],
  ["contact", "Contact"], ["support", "Support"], ["legal", "Legal"], ["homepage", "Homepage"], ["season", "Art of Season"], ["messages", "Messages"],
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
          {tab === "traffic" && <Traffic />}
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
          {tab === "news" && <News />}
          {tab === "testimonials" && <Testimonials />}
          {tab === "contact" && <ContactList />}
          {tab === "support" && <Support />}
          {tab === "legal" && <PrivacyEditor />}
          {tab === "homepage" && <PreservationEditor />}
          {tab === "season" && <ArtOfSeasonEditor />}
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
  const [viewing, setViewing] = useState(null);
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
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Btn onClick={() => setViewing(o)}>VIEW</Btn>
                {!d && o.status !== "pending" && <Btn onClick={() => loadDelivery(o.id)}>MANAGE DELIVERY</Btn>}
              </div>
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
      {viewing && <DetailModal title={`Order #${viewing.id.slice(0, 8).toUpperCase()}`} data={viewing} onClose={() => setViewing(null)} />}
    </Panel>
  );
}

function Artworks() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const load = () => api.catalog.artworks().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const del = async (id) => { if (confirm("Delete this artwork?")) { await api.admin.deleteArtwork(id); load(); } };
  const feature = async (a) => { await api.admin.updateArtwork(a.id, { featured: !a.featured }); load(); };
  const launch = async (a) => { await api.admin.updateArtwork(a.id, { is_new_launch: !a.is_new_launch }); load(); };
  const [onlyLaunch, setOnlyLaunch] = useState(false);
  const launchCount = rows.filter((a) => a.is_new_launch).length;
  const filtered = rows.filter((a) =>
    (!onlyLaunch || a.is_new_launch) &&
    (!q.trim() || `${a.title} ${a.artist_name} ${a.category_id}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <Panel title={`Artworks (${rows.length})`}>
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12.5, color: "rgba(200,191,160,0.6)", marginBottom: 12, lineHeight: 1.6 }}>
        Toggle <strong style={{ color: gold }}>NEW LAUNCH</strong> to feature a work in the homepage
        “Launch of New Product” section and the <strong>/new-launch</strong> New Arrivals page.
        <strong> FEATURE</strong> controls the hero / Art of Seasons fallback.
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title / artist / medium…" style={{ ...miniInput, width: "100%", marginBottom: 10 }} />
      <label style={{ ...ckLabel, marginBottom: 14 }}>
        <input type="checkbox" checked={onlyLaunch} onChange={(e) => setOnlyLaunch(e.target.checked)} style={{ accentColor: gold }} />
        Show only New Launch ({launchCount})
      </label>
      {filtered.map((a) => (
        <Item key={a.id}>
          <img src={a.images?.[0]} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>
              {a.title}
              {a.is_new_launch && <span style={{ marginLeft: 8, fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.14em", color: "#0e0c0a", background: gold, padding: "2px 7px", borderRadius: 999 }}>NEW LAUNCH</span>}
            </div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)" }}>
              {a.artist_name} · {a.customizable ? "customizable" : inr(a.price)} · {a.category_id || "—"} · {a.status}
            </div>
          </div>
          <Btn onClick={() => setViewing(a)}>VIEW</Btn>
          <Btn onClick={() => setEditing(a)}>EDIT</Btn>
          <Btn onClick={() => launch(a)} primary={a.is_new_launch}>{a.is_new_launch ? "★ LAUNCH" : "NEW LAUNCH"}</Btn>
          <Btn onClick={() => feature(a)} primary={a.featured}>{a.featured ? "FEATURED" : "FEATURE"}</Btn>
          <Btn onClick={() => del(a.id)} ghost>DELETE</Btn>
        </Item>
      ))}
      {viewing && <DetailModal title={viewing.title} data={viewing} onClose={() => setViewing(null)} />}
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

function News() {
  const blank = { title: "", summary: "", image_url: "", link_url: "", published: true, sort_order: 0 };
  const [rows, setRows] = useState([]);
  const [f, setF] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = () => api.news.all().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);

  const reset = () => { setF(blank); setEditingId(null); };

  const save = async () => {
    if (!f.title.trim()) { alert("Title is required"); return; }
    setBusy(true);
    const payload = { ...f, sort_order: Number(f.sort_order) || 0 };
    try {
      if (editingId) await api.news.update(editingId, payload);
      else await api.news.create(payload);
      reset(); await load();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  const edit = (n) => {
    setEditingId(n.id);
    setF({
      title: n.title || "", summary: n.summary || "", image_url: n.image_url || "",
      link_url: n.link_url || "", published: n.published !== false, sort_order: n.sort_order || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const togglePublish = async (n) => { await api.news.update(n.id, { published: !n.published }); load(); };
  const del = async (n) => { if (!window.confirm(`Delete the news item "${n.title}"?`)) return; await api.news.remove(n.id); if (editingId === n.id) reset(); load(); };

  return (
    <Panel title="News">
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginBottom: 14 }}>
        These appear in the “Latest News” section on the home page. Unpublished items are hidden from visitors. Lower order numbers show first, then newest.
      </div>

      {/* Pull live art headlines from a news provider; admin picks which to show. */}
      <ExternalNews onImported={load} />

      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, margin: "4px 0 10px" }}>OR WRITE YOUR OWN</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <input placeholder="Headline / title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} style={{ ...miniInput, gridColumn: "1 / -1" }} />
        <input placeholder="Link (optional — e.g. /events or https://…)" value={f.link_url} onChange={(e) => setF({ ...f, link_url: e.target.value })} style={miniInput} />
        <div><L>DISPLAY ORDER</L><input type="number" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: e.target.value })} style={{ ...miniInput, width: "100%", boxSizing: "border-box" }} /></div>
        <textarea placeholder="Summary / details" value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} style={{ ...miniInput, gridColumn: "1 / -1", minHeight: 70, resize: "vertical" }} />
      </div>
      <MediaUploader kind="image" label="NEWS IMAGE" hint="UPLOAD IMAGE" value={f.image_url} onChange={(url) => setF((v) => ({ ...v, image_url: url }))} />
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.75)", margin: "12px 0" }}>
        <input type="checkbox" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} style={{ accentColor: gold }} />
        Published (visible on the home page)
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={save} primary disabled={busy}>{busy ? "SAVING…" : editingId ? "SAVE CHANGES" : "+ ADD NEWS"}</Btn>
        {editingId && <Btn onClick={reset} ghost>CANCEL</Btn>}
      </div>
      <div style={{ marginTop: 16 }}>
        {rows.length === 0 && <Empty>No news yet.</Empty>}
        {rows.map((n) => (
          <Item key={n.id}>
            {n.image_url
              ? <img src={n.image_url} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
              : <div style={{ width: 44, height: 44, borderRadius: 6, border: "1px dashed rgba(212,175,55,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(212,175,55,0.4)", flexShrink: 0 }}>◆</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>
                {n.title} {!n.published && <span style={{ fontSize: 10, color: "#f87171", fontFamily: "'Raleway',sans-serif" }}>· HIDDEN</span>}
              </div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {n.summary || n.link_url || ""}
              </div>
            </div>
            <Btn onClick={() => togglePublish(n)} ghost>{n.published ? "HIDE" : "PUBLISH"}</Btn>
            <Btn onClick={() => edit(n)}>EDIT</Btn>
            <Btn onClick={() => del(n)} ghost>DELETE</Btn>
          </Item>
        ))}
      </div>
    </Panel>
  );
}

// Live art-news discovery: fetch headlines from the configured provider and
// import the chosen ones as published news items (shown on the home page).
function ExternalNews({ onImported }) {
  const [items, setItems] = useState([]);
  const [provider, setProvider] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [adding, setAdding] = useState("");

  const discover = async () => {
    setBusy(true); setErr("");
    try {
      const r = await api.news.external();
      setItems(r.items || []); setProvider(r.provider || ""); setFetched(true);
    } catch (e) { setErr(e.message || "Could not fetch news"); setFetched(true); }
    finally { setBusy(false); }
  };

  const add = async (a) => {
    setAdding(a.link_url);
    try {
      await api.news.create({ title: a.title, summary: a.summary || "", image_url: a.image_url || "", link_url: a.link_url || "", published: true });
      setItems((prev) => prev.map((x) => (x.link_url === a.link_url ? { ...x, already_added: true } : x)));
      onImported?.();
    } catch (e) { alert(e.message); } finally { setAdding(""); }
  };

  return (
    <div style={{ border: "1px solid rgba(212,175,55,0.25)", borderRadius: 10, padding: 16, marginBottom: 22, background: "rgba(212,175,55,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold }}>
          DISCOVER ART NEWS{provider ? ` · ${provider.toUpperCase()}` : ""}
        </div>
        <Btn onClick={discover} disabled={busy}>{busy ? "FETCHING…" : fetched ? "REFRESH" : "FETCH ART NEWS"}</Btn>
      </div>
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginTop: 8 }}>
        Pull the latest art headlines, then click ADD on the ones you want to show on the home page.
      </div>
      {err && (
        <div style={{ marginTop: 12, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#fca5a5", lineHeight: 1.6 }}>
          {err}
        </div>
      )}
      {fetched && !err && items.length === 0 && <Empty>No articles returned.</Empty>}
      <div style={{ marginTop: 12 }}>
        {items.map((a, i) => (
          <Item key={a.link_url || i}>
            {a.image_url
              ? <img src={a.image_url} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
              : <div style={{ width: 44, height: 44, borderRadius: 6, border: "1px dashed rgba(212,175,55,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(212,175,55,0.4)", flexShrink: 0 }}>◆</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {a.source}{a.published_at ? ` · ${new Date(a.published_at).toLocaleDateString()}` : ""}{a.summary ? ` — ${a.summary}` : ""}
              </div>
            </div>
            <a href={a.link_url} target="_blank" rel="noreferrer" style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.12em", color: "rgba(200,191,160,0.7)", textDecoration: "none", whiteSpace: "nowrap" }}>OPEN ↗</a>
            {a.already_added
              ? <Btn ghost disabled>ADDED</Btn>
              : <Btn primary disabled={adding === a.link_url} onClick={() => add(a)}>{adding === a.link_url ? "…" : "ADD"}</Btn>}
          </Item>
        ))}
      </div>
    </div>
  );
}

function Testimonials() {
  const blank = { name: "", designation: "", tag: "", quote: "", image_url: "", published: true, sort_order: 0 };
  const [rows, setRows] = useState([]);
  const [f, setF] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = () => api.testimonials.all().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);

  const reset = () => { setF(blank); setEditingId(null); };

  const save = async () => {
    if (!f.name.trim() || !f.quote.trim()) { alert("Name and quote are required"); return; }
    setBusy(true);
    const payload = { ...f, sort_order: Number(f.sort_order) || 0 };
    try {
      if (editingId) await api.testimonials.update(editingId, payload);
      else await api.testimonials.create(payload);
      reset(); await load();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  const edit = (t) => {
    setEditingId(t.id);
    setF({
      name: t.name || "", designation: t.designation || "", tag: t.tag || "",
      quote: t.quote || "", image_url: t.image_url || "",
      published: t.published !== false, sort_order: t.sort_order || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const togglePublish = async (t) => { await api.testimonials.update(t.id, { published: !t.published }); load(); };
  const del = async (t) => { if (!window.confirm(`Delete the testimonial from ${t.name}?`)) return; await api.testimonials.remove(t.id); if (editingId === t.id) reset(); load(); };

  return (
    <Panel title="Testimonials">
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginBottom: 14 }}>
        These appear in the “What Collectors Say” section on the home page. Unpublished entries are hidden from visitors. Lower order numbers show first.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <input placeholder="Author name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} style={miniInput} />
        <input placeholder="Designation (e.g. Private Collector · London)" value={f.designation} onChange={(e) => setF({ ...f, designation: e.target.value })} style={miniInput} />
        <input placeholder="Tag (e.g. COLLECTOR)" value={f.tag} onChange={(e) => setF({ ...f, tag: e.target.value })} style={miniInput} />
        <div><L>DISPLAY ORDER</L><input type="number" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: e.target.value })} style={{ ...miniInput, width: "100%", boxSizing: "border-box" }} /></div>
        <textarea placeholder="Quote / testimonial text" value={f.quote} onChange={(e) => setF({ ...f, quote: e.target.value })} style={{ ...miniInput, gridColumn: "1 / -1", minHeight: 80, resize: "vertical" }} />
      </div>
      <MediaUploader kind="image" label="AUTHOR / ARTWORK IMAGE" hint="UPLOAD IMAGE" value={f.image_url} onChange={(url) => setF((v) => ({ ...v, image_url: url }))} />
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.75)", margin: "12px 0" }}>
        <input type="checkbox" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} style={{ accentColor: gold }} />
        Published (visible on the home page)
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={save} primary disabled={busy}>{busy ? "SAVING…" : editingId ? "SAVE CHANGES" : "+ ADD TESTIMONIAL"}</Btn>
        {editingId && <Btn onClick={reset} ghost>CANCEL</Btn>}
      </div>
      <div style={{ marginTop: 16 }}>
        {rows.length === 0 && <Empty>No testimonials yet.</Empty>}
        {rows.map((t) => (
          <Item key={t.id}>
            {t.image_url
              ? <img src={t.image_url} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
              : <div style={{ width: 44, height: 44, borderRadius: 6, border: "1px dashed rgba(212,175,55,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(212,175,55,0.4)", flexShrink: 0 }}>“”</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>
                {t.name} {!t.published && <span style={{ fontSize: 10, color: "#f87171", fontFamily: "'Raleway',sans-serif" }}>· HIDDEN</span>}
              </div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {t.designation || t.tag || ""}{t.quote ? ` — “${t.quote.slice(0, 60)}${t.quote.length > 60 ? "…" : ""}”` : ""}
              </div>
            </div>
            <Btn onClick={() => togglePublish(t)} ghost>{t.published ? "HIDE" : "PUBLISH"}</Btn>
            <Btn onClick={() => edit(t)}>EDIT</Btn>
            <Btn onClick={() => del(t)} ghost>DELETE</Btn>
          </Item>
        ))}
      </div>
    </Panel>
  );
}

function Artists() {
  const [kyc, setKyc] = useState([]);
  const [tick, setTick] = useState(0);
  const [viewing, setViewing] = useState(null);
  const load = () => { api.admin.artists().then(setKyc).catch(() => {}); };
  useEffect(() => { load(); }, []);
  const verify = async (uid) => { await api.admin.verifyArtist(uid); load(); };
  const reject = async (uid) => {
    const reason = window.prompt("Reason for declining (shown to the applicant so they can reapply):", "");
    if (reason === null) return;  // cancelled
    await api.admin.rejectArtist(uid, reason.trim()); load();
  };
  const remove = async (a) => {
    if (!window.confirm(`Permanently remove ${a.name}?\n\nThis deletes their artworks, public profile and login account. This cannot be undone.`)) return;
    await api.admin.deleteArtist(a.user_id); load(); setTick((t) => t + 1);
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
            {a.status === "rejected" && a.rejection_reason && (
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "#fca5a5", marginTop: 4 }}>
                Reason: {a.rejection_reason}
              </div>
            )}
          </div>
          <Btn onClick={() => setViewing(a)}>VIEW</Btn>
          {a.status !== "verified" && <Btn onClick={() => verify(a.user_id)} primary>APPROVE</Btn>}
          {a.status !== "rejected" && a.status !== "verified" && <Btn onClick={() => reject(a.user_id)} ghost>DECLINE</Btn>}
          <Btn onClick={() => remove(a)} danger>REMOVE</Btn>
        </Item>
      ))}
      {viewing && <DetailModal title={viewing.name} data={viewing} onClose={() => setViewing(null)} />}
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
    <div style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 14, padding: 28, marginBottom: 22, background: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, marginBottom: 16 }}>ADD AN ARTIST DIRECTLY</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <AField l="FULL NAME"><input style={aInputStyle} value={f.name} onChange={set("name")} /></AField>
        <AField l="ART TYPE"><input style={aInputStyle} placeholder="e.g. Oil & Projection" value={f.art_type} onChange={set("art_type")} /></AField>
        <AField l="LOGIN EMAIL"><input style={aInputStyle} value={f.email} onChange={set("email")} /></AField>
        <AField l="LOGIN PASSWORD"><input style={aInputStyle} type="password" value={f.password} onChange={set("password")} /></AField>
        <AField l="LOCATION"><input style={aInputStyle} value={f.location} onChange={set("location")} /></AField>
        <AField l="AGE"><input style={aInputStyle} type="number" value={f.age} onChange={set("age")} /></AField>
        <AField l="GENDER (FOR DEFAULT AVATAR)">
          <select style={aInputStyle} value={f.gender} onChange={set("gender")}>
            <option value="">Select…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </AField>
        <div />
        <div style={{ gridColumn: "1 / -1" }}>
          <AField l="BIO"><textarea style={{ ...aInputStyle, minHeight: 80 }} value={f.bio} onChange={set("bio")} /></AField>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <MediaUploader kind="image" label="ARTIST PHOTO" hint="UPLOAD PHOTO" value={f.image_url} onChange={(url) => setF((v) => ({ ...v, image_url: url }))} />
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <Btn onClick={submit} primary disabled={busy}>{busy ? "CREATING…" : "+ CREATE ARTIST"}</Btn>
      </div>
      {done && <div style={{ marginTop: 10, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#4ade80" }}>{done}</div>}
    </div>
  );
}

function AddArtworkForArtist({ tick }) {
  const [artists, setArtists] = useState([]);
  const [artistId, setArtistId] = useState("");
  useEffect(() => { api.catalog.artists().then(setArtists).catch(() => {}); }, [tick]);

  // Same full-featured form the artist uses, with an artist picker on top + the
  // admin-only "Featured on home" toggle. Admin uploads go live immediately.
  const artistSelect = (
    <AField l="ARTIST">
      <select value={artistId} onChange={(e) => setArtistId(e.target.value)} style={aInputStyle}>
        <option value="">Select artist…</option>
        {artists.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
    </AField>
  );

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, marginBottom: 12 }}>ADD ARTWORK FOR AN ARTIST</div>
      <ArtworkForm
        topSlot={artistSelect}
        showFeatured
        submitLabel="+ ADD ARTWORK"
        submittingLabel="ADDING…"
        successMessage={<>✓ Artwork added and is now <strong>live</strong> in the collection.</>}
        onSubmit={(payload) => {
          if (!artistId) throw new Error("Select an artist first.");
          return api.admin.createArtwork({ ...payload, artist_id: artistId });
        }}
      />
    </div>
  );
}

// Edit the homepage "Preservation of Art" floating images (live immediately).
function PreservationEditor() {
  const [images, setImages] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    api.site.getPreservation().then((d) => setImages(d?.images || [])).catch(() => setImages([]));
  }, []);
  const save = async () => {
    setBusy(true);
    try {
      await api.site.setPreservation({ images: images || [] });
      setDone(true); setTimeout(() => setDone(false), 2500);
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  if (!images) return <Panel title="Homepage"><Empty>Loading…</Empty></Panel>;
  return (
    <Panel title="Homepage">
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12.5, color: "rgba(200,191,160,0.6)", marginBottom: 16, lineHeight: 1.6 }}>
        Images for the homepage <strong>"Preservation of Art"</strong> section (the floating photos around the panel).
        They cycle across the fixed layout positions. Leave empty to use the built-in defaults.
      </div>
      <MediaUploader kind="image" multiple value={images} onChange={setImages} label="PRESERVATION IMAGES" />
      <div style={{ marginTop: 14 }}>
        <Btn onClick={save} primary disabled={busy}>{busy ? "SAVING…" : "SAVE & PUBLISH"}</Btn>
      </div>
      {done && <div style={{ marginTop: 10, color: "#4ade80", fontFamily: "'Raleway',sans-serif", fontSize: 12 }}>✓ Saved — live on the homepage.</div>}
    </Panel>
  );
}

// Curate the homepage "Art of Seasons" showcase by SELECTING existing artworks.
// Toggling an artwork updates its is_art_of_season flag (live immediately).
function ArtOfSeasonEditor() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState("");
  const [onlySel, setOnlySel] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const load = () => api.catalog.artworks().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const toggle = async (a) => {
    setSavingId(a.id);
    // Optimistic flip, then persist.
    setRows((xs) => xs.map((x) => (x.id === a.id ? { ...x, is_art_of_season: !x.is_art_of_season } : x)));
    try {
      await api.admin.updateArtwork(a.id, { is_art_of_season: !a.is_art_of_season });
    } catch (e) {
      alert(e.message);
      load(); // revert to server truth on failure
    } finally { setSavingId(null); }
  };
  if (!rows) return <Panel title="Art of Season"><Empty>Loading…</Empty></Panel>;
  const selected = rows.filter((a) => a.is_art_of_season);
  const filtered = rows
    .filter((a) => (!onlySel || a.is_art_of_season) &&
      (!q.trim() || `${a.title} ${a.artist_name} ${a.category_id}`.toLowerCase().includes(q.toLowerCase())))
    // Selected first, then the rest.
    .sort((a, b) => (b.is_art_of_season ? 1 : 0) - (a.is_art_of_season ? 1 : 0));
  return (
    <Panel title={`Art of Season (${selected.length} selected)`}>
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12.5, color: "rgba(200,191,160,0.6)", marginBottom: 14, lineHeight: 1.6 }}>
        Select existing artworks for the homepage <strong>"Art of Seasons"</strong> rotating showcase. Tap
        <strong style={{ color: gold }}> ADD</strong> to include a work and <strong>REMOVE</strong> to drop it.
        With none selected, the showcase falls back to featured artworks.
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title / artist / medium…" style={{ ...miniInput, width: "100%", marginBottom: 10 }} />
      <label style={{ ...ckLabel, marginBottom: 14 }}>
        <input type="checkbox" checked={onlySel} onChange={(e) => setOnlySel(e.target.checked)} style={{ accentColor: gold }} />
        Show only selected ({selected.length})
      </label>
      {filtered.length === 0 && <Empty>No artworks match.</Empty>}
      {filtered.map((a) => (
        <Item key={a.id}>
          <img src={a.images?.[0]} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>
              {a.title}
              {a.is_art_of_season && <span style={{ marginLeft: 8, fontFamily: "'Cinzel',serif", fontSize: 8, letterSpacing: "0.14em", color: "#0e0c0a", background: gold, padding: "2px 7px", borderRadius: 999 }}>SEASON</span>}
            </div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)" }}>
              {a.artist_name} · {a.medium || a.category_id || "—"} · {a.status}
            </div>
          </div>
          <Btn onClick={() => toggle(a)} primary={a.is_art_of_season} disabled={savingId === a.id}>
            {a.is_art_of_season ? "★ REMOVE" : "ADD"}
          </Btn>
        </Item>
      ))}
    </Panel>
  );
}

// Visitor traffic — IP / geo / device / per-session journey tracing.
function Traffic() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [openJourney, setOpenJourney] = useState(null);
  const [now] = useState(Date.now); // snapshot for relative timestamps
  useEffect(() => {
    let alive = true;
    api.admin.traffic(days)
      .then((d) => { if (alive) { setData(d); setErr(""); } })
      .catch((e) => { if (alive) setErr(e.message || "Failed to load"); });
    return () => { alive = false; };
  }, [days]);

  const ago = (iso) => {
    if (!iso) return "";
    const s = (now - new Date(iso).getTime()) / 1000;
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };
  const place = (v) => [v.city, v.country].filter(Boolean).join(", ") || (v.ip ? "—" : "");

  return (
    <Panel title="Traffic & Visitors">
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[[7, "7 days"], [30, "30 days"], [90, "90 days"]].map(([d, lbl]) => (
          <button key={d} onClick={() => setDays(d)} style={{ padding: "6px 14px", borderRadius: 999, cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.12em", background: days === d ? gold : "transparent", color: days === d ? "#0e0c0a" : "rgba(200,191,160,0.6)", border: `1px solid ${days === d ? gold : "rgba(212,175,55,0.25)"}` }}>{lbl}</button>
        ))}
      </div>
      {err && <div style={{ color: "#f87171", fontFamily: "'Raleway',sans-serif", fontSize: 12, marginBottom: 12 }}>{err}</div>}
      {!data ? <Empty>Loading traffic…</Empty> : (
        <>
          {/* Totals */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 22 }}>
            {[["Page Views", data.totals.visits], ["Unique IPs", data.totals.unique_ips], ["Sessions", data.totals.unique_sessions], ["Last 24h", data.totals.last_24h]].map(([lbl, val]) => (
              <div key={lbl} style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.12)" }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: gold, lineHeight: 1 }}>{val}</div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 9, letterSpacing: "0.08em", color: "rgba(200,191,160,0.45)", marginTop: 6 }}>{lbl.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Breakdown bars */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18, marginBottom: 24 }}>
            <BarList title="Top Pages" rows={data.top_pages} />
            <BarList title="Countries" rows={data.top_countries} />
            <BarList title="Devices" rows={data.devices} />
            <BarList title="Browsers" rows={data.browsers} />
          </div>

          {/* Journeys */}
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, margin: "6px 0 10px" }}>VISITOR JOURNEYS ({data.journeys.length})</div>
          {data.journeys.length === 0 && <Empty>No journeys recorded yet.</Empty>}
          {data.journeys.map((j, i) => {
            const open = openJourney === i;
            return (
              <div key={i} style={{ border: "1px solid rgba(212,175,55,0.12)", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
                <button onClick={() => setOpenJourney(open ? null : i)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: open ? "rgba(212,175,55,0.06)" : "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#e8e0d0", flex: 1 }}>
                    {j.user_email ? <strong style={{ color: gold }}>{j.user_email}</strong> : <span style={{ color: "rgba(200,191,160,0.6)" }}>Guest</span>}
                    <span style={{ color: "rgba(200,191,160,0.4)" }}> · {j.ip || "—"}{place(j) ? ` · ${place(j)}` : ""}{j.device ? ` · ${j.device}` : ""}</span>
                  </span>
                  <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(200,191,160,0.45)" }}>{j.count} {j.count === 1 ? "page" : "pages"} · {ago(j.last_at)}</span>
                  <span style={{ color: gold, fontSize: 11 }}>{open ? "▾" : "▸"}</span>
                </button>
                {open && (
                  <div style={{ padding: "4px 16px 14px" }}>
                    {j.pages.map((p, k) => (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", borderTop: k === 0 ? "none" : "1px solid rgba(212,175,55,0.06)" }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, background: "rgba(212,175,55,0.12)", color: gold, fontFamily: "'Raleway',sans-serif", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>{k + 1}</span>
                        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "#cfc6b2", flex: 1, wordBreak: "break-all" }}>{p.path}</span>
                        <span style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, color: "rgba(200,191,160,0.4)" }}>{ago(p.time)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Recent raw visits */}
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, margin: "22px 0 10px" }}>RECENT VISITS</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Raleway',sans-serif", fontSize: 11.5 }}>
              <thead>
                <tr style={{ color: "rgba(200,191,160,0.45)", textAlign: "left" }}>
                  {["Time", "Page", "IP", "Location", "Device", "Visitor"].map((h) => (
                    <th key={h} style={{ padding: "8px 10px", fontWeight: 600, letterSpacing: "0.06em", borderBottom: "1px solid rgba(212,175,55,0.15)", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recent.slice(0, 100).map((v) => (
                  <tr key={v.id} style={{ color: "rgba(200,191,160,0.75)" }}>
                    <td style={{ padding: "7px 10px", whiteSpace: "nowrap", color: "rgba(200,191,160,0.5)" }}>{ago(v.time)}</td>
                    <td style={{ padding: "7px 10px", color: "#e8e0d0", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.path}</td>
                    <td style={{ padding: "7px 10px", whiteSpace: "nowrap" }}>{v.ip || "—"}</td>
                    <td style={{ padding: "7px 10px", whiteSpace: "nowrap" }}>{place(v) || "—"}</td>
                    <td style={{ padding: "7px 10px", whiteSpace: "nowrap" }}>{[v.device, v.browser].filter(Boolean).join(" · ") || "—"}</td>
                    <td style={{ padding: "7px 10px", whiteSpace: "nowrap", color: v.user_email ? gold : "rgba(200,191,160,0.4)" }}>{v.user_email || "Guest"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Panel>
  );
}

// Horizontal bar list for a labelled count breakdown.
function BarList({ title, rows }) {
  const max = Math.max(1, ...(rows || []).map((r) => r.count));
  return (
    <div>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(212,175,55,0.7)", marginBottom: 10 }}>{title.toUpperCase()}</div>
      {(!rows || rows.length === 0) && <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.35)" }}>No data</div>}
      {(rows || []).map((r, i) => (
        <div key={i} style={{ marginBottom: 7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Raleway',sans-serif", fontSize: 11, marginBottom: 3 }}>
            <span style={{ color: "rgba(200,191,160,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "78%" }}>{r.label}</span>
            <span style={{ color: gold, fontWeight: 700 }}>{r.count}</span>
          </div>
          <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(r.count / max) * 100}%`, background: "linear-gradient(90deg,#B87333,#D4AF37)", borderRadius: 999 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Edit the public Privacy Policy (stored server-side, live immediately).
function PrivacyEditor() {
  const [sections, setSections] = useState(null);
  const [updated, setUpdated] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    api.site.getPrivacy().then((d) => {
      if (d?.sections?.length) { setSections(d.sections); setUpdated(d.updated || ""); }
      else setSections([{ title: "", body: "" }]);
    }).catch(() => setSections([{ title: "", body: "" }]));
  }, []);
  const upd = (i, k, v) => setSections((s) => s.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const save = async () => {
    setBusy(true);
    try {
      const clean = (sections || []).filter((s) => (s.title || "").trim() || (s.body || "").trim());
      await api.site.setPrivacy({
        sections: clean,
        updated: updated || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      });
      setDone(true); setTimeout(() => setDone(false), 2500);
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };
  if (!sections) return <Panel title="Privacy Policy"><Empty>Loading…</Empty></Panel>;
  return (
    <Panel title="Privacy Policy">
      <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12.5, color: "rgba(200,191,160,0.6)", marginBottom: 16, lineHeight: 1.6 }}>
        Edit the sections shown on the public <strong>/privacy</strong> page. Changes go live immediately.
      </div>
      <L>"LAST UPDATED" LABEL</L>
      <input value={updated} onChange={(e) => setUpdated(e.target.value)} placeholder="e.g. June 2026" style={{ ...miniInput, marginBottom: 18 }} />
      {sections.map((s, i) => (
        <div key={i} style={{ border: "1px solid rgba(212,175,55,0.15)", borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: gold }}>SECTION {i + 1}</span>
            <button onClick={() => setSections((xs) => xs.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 12 }}>remove</button>
          </div>
          <input value={s.title} onChange={(e) => upd(i, "title", e.target.value)} placeholder="Section title" style={{ ...miniInput, marginBottom: 8 }} />
          <textarea value={s.body} onChange={(e) => upd(i, "body", e.target.value)} placeholder="Section text" style={{ ...miniInput, minHeight: 96, width: "100%", boxSizing: "border-box", resize: "vertical" }} />
        </div>
      ))}
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Btn onClick={() => setSections((s) => [...s, { title: "", body: "" }])}>+ ADD SECTION</Btn>
        <Btn onClick={save} primary disabled={busy}>{busy ? "SAVING…" : "SAVE & PUBLISH"}</Btn>
      </div>
      {done && <div style={{ marginTop: 10, color: "#4ade80", fontFamily: "'Raleway',sans-serif", fontSize: 12 }}>✓ Saved — live on the Privacy page.</div>}
    </Panel>
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
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>{m.name} <span style={{ fontSize: 11, color: "rgba(200,191,160,0.5)" }}>· {m.email}{m.phone ? ` · ${m.phone}` : ""}</span></div>
          <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.7)", marginTop: 4 }}>{m.subject ? <strong>{m.subject}: </strong> : null}{m.message}</div>
          <Attachments images={m.images} videos={m.videos} />
        </div>
      ))}
    </Panel>
  );
}

// Thumbnails for any photos/videos a sender attached for context.
function Attachments({ images = [], videos = [] }) {
  if ((!images || !images.length) && (!videos || !videos.length)) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
      {(images || []).map((src, i) => (
        <a key={`i${i}`} href={src} target="_blank" rel="noreferrer">
          <img src={src} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(212,175,55,0.25)" }} />
        </a>
      ))}
      {(videos || []).map((src, i) => (
        <video key={`v${i}`} src={src} controls style={{ width: 110, height: 64, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(212,175,55,0.25)", background: "#000" }} />
      ))}
    </div>
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
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>{t.subject || "Ticket"} <span style={{ fontSize: 11, color: "rgba(200,191,160,0.5)" }}>· {t.email}{t.phone ? ` · ${t.phone}` : ""}</span></div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.65)", marginTop: 3 }}>{t.message}</div>
            <Attachments images={t.images} videos={t.videos} />
          </div>
          <select value={t.status} onChange={(e) => setStatus(t.id, e.target.value)} style={miniInput}>
            <option value="open">open</option><option value="in_progress">in_progress</option><option value="resolved">resolved</option><option value="closed">closed</option>
          </select>
        </Item>
      ))}
    </Panel>
  );
}

/* Generic read-only detail preview — renders every field of a row (text, money,
   dates, images & videos) so the admin can inspect the full record, not just
   the list summary. Reusable across any admin list. */
const dmIsImg = (s) => typeof s === "string" && (/\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(s) || s.startsWith("/uploads/") || s.startsWith("data:image"));
const dmIsVid = (s) => typeof s === "string" && /\.(mp4|webm|mov|m4v)(\?|$)/i.test(s);

function DetailValue({ v }) {
  if (v == null || v === "") return <span style={{ color: "rgba(200,191,160,0.4)" }}>—</span>;
  if (typeof v === "boolean") return <>{v ? "Yes" : "No"}</>;
  if (Array.isArray(v)) {
    if (v.length === 0) return <span style={{ color: "rgba(200,191,160,0.4)" }}>—</span>;
    if (v.every((x) => dmIsImg(x) || dmIsVid(x))) {
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {v.map((x, i) => dmIsVid(x)
            ? <video key={i} src={x} controls style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 6, background: "#000" }} />
            : <a key={i} href={x} target="_blank" rel="noreferrer"><img src={x} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(212,175,55,0.25)" }} /></a>)}
        </div>
      );
    }
    if (v.every((x) => x == null || typeof x !== "object")) return <>{v.filter((x) => x != null && x !== "").join(", ") || "—"}</>;
    return <pre style={dmPre}>{JSON.stringify(v, null, 2)}</pre>;
  }
  if (typeof v === "object") return <pre style={dmPre}>{JSON.stringify(v, null, 2)}</pre>;
  if (dmIsImg(v)) return <a href={v} target="_blank" rel="noreferrer"><img src={v} alt="" style={{ maxWidth: 180, borderRadius: 8, border: "1px solid rgba(212,175,55,0.25)" }} /></a>;
  if (dmIsVid(v)) return <video src={v} controls style={{ maxWidth: 240, borderRadius: 8, background: "#000" }} />;
  return <>{String(v)}</>;
}

function DetailModal({ title, data, onClose }) {
  if (!data) return null;
  const entries = Object.entries(data).filter(([k]) => !k.startsWith("_"));
  return (
    <div onClick={onClose} style={dmOverlay}>
      <div onClick={(e) => e.stopPropagation()} style={dmBox}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.16em", color: gold }}>{(title || "Details").toUpperCase()}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(200,191,160,0.5)", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {entries.map(([k, v]) => (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 12, alignItems: "start" }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.12em", color: "rgba(212,175,55,0.7)", paddingTop: 2 }}>{k.replace(/_/g, " ").toUpperCase()}</div>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#e8e0d0", wordBreak: "break-word", lineHeight: 1.6 }}><DetailValue v={v} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const dmOverlay = { position: "fixed", inset: 0, zIndex: 7000, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 };
const dmBox = { background: "#15120c", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 14, padding: 24, width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto" };
const dmPre = { margin: 0, fontFamily: "monospace", fontSize: 11, color: "rgba(200,191,160,0.8)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.12)", borderRadius: 6, padding: "8px 10px", whiteSpace: "pre-wrap", wordBreak: "break-word" };

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

// Single-image field — drag-and-drop dropzone + preview (shared MediaUploader).
function ImageField({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <MediaUploader kind="image" value={value} onChange={onChange} label={label} size={64} />
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

function Btn({ children, onClick, primary, ghost, danger, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "8px 14px", borderRadius: 999, cursor: disabled ? "default" : "pointer", whiteSpace: "nowrap",
      fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.12em",
      background: primary ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "transparent",
      color: primary ? "#111" : danger ? "#f87171" : ghost ? "rgba(200,191,160,0.7)" : gold,
      border: primary ? "none" : `1px solid ${danger ? "rgba(248,113,113,0.4)" : `rgba(212,175,55,${ghost ? 0.2 : 0.4})`}`, opacity: disabled ? 0.4 : 1,
    }}>{children}</button>
  );
}
function Empty({ children }) { return <div style={{ padding: 24, textAlign: "center", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.5)" }}>{children}</div>; }
function Center({ children }) { return <section style={{ padding: "140px 24px", textAlign: "center" }}>{children}</section>; }
const preStyle = { display: "inline-block", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", padding: 14, borderRadius: 8, color: gold, marginTop: 10, fontFamily: "monospace", fontSize: 12 };
const miniInput = { padding: "10px 13px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 6, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 14.5, outline: "none" };
const wideInput = { ...miniInput, width: "100%", boxSizing: "border-box", marginBottom: 12 };
const wideArea = { ...wideInput, minHeight: 64, resize: "vertical" };
