import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/Auth";
import { api } from "../utils/api";

const gold = "#D4AF37";
const TABS = [
  ["overview", "Overview"], ["enquiries", "Enquiries"], ["orders", "Orders"],
  ["artworks", "Artworks"], ["events", "Events"], ["artists", "Artists & Competition"],
  ["contact", "Contact"], ["support", "Support"], ["messages", "Messages"],
];

const STAGES = ["order_confirmed", "curation_crating", "dispatched", "out_for_delivery", "installation", "delivered"];

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

  if (loading) return <Center>Loading…</Center>;
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
      <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 20 }}>
        <aside style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 12, background: "rgba(255,255,255,0.02)", padding: 12, height: "fit-content" }}>
          {TABS.map(([id, lbl]) => {
            const badge = { orders: stats.pending_orders, support: stats.open_tickets, contact: stats.contact_messages, artists: stats.pending_artists }[id] || 0;
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
          {tab === "enquiries" && <Enquiries />}
          {tab === "orders" && <Orders />}
          {tab === "artworks" && <Artworks />}
          {tab === "events" && <Events />}
          {tab === "artists" && <Artists />}
          {tab === "contact" && <ContactList />}
          {tab === "support" && <Support />}
          {tab === "messages" && <Panel title="Messages"><Link to="/admin/inbox" className="btn-gold-main" style={{ textDecoration: "none", padding: "12px 24px", fontSize: 12 }}>OPEN INBOX →</Link></Panel>}
        </div>
      </div>
    </section>
  );
}

function Overview({ stats }) {
  const cards = [
    ["Pending orders", stats.pending_orders], ["Unread messages", stats.unread_messages],
    ["Event registrations", stats.event_registrations], ["New artworks (7d)", stats.recent_artworks],
    ["Contact messages", stats.contact_messages], ["Open tickets", stats.open_tickets],
    ["Pending artists", stats.pending_artists],
  ];
  return (
    <Panel title="Overview">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14 }}>
        {cards.map(([l, v]) => (
          <div key={l} style={{ padding: 20, border: "1px solid rgba(212,175,55,0.15)", borderRadius: 10, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 40, fontWeight: 700, color: gold }}>{v ?? 0}</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: "rgba(200,191,160,0.6)", marginTop: 4 }}>{l.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Enquiries() {
  const [rows, setRows] = useState([]);
  const [price, setPrice] = useState({});
  const load = () => api.enquiries.all().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const reveal = async (e) => { await api.enquiries.revealPrice(e.id, Number(price[e.id] || 0)); load(); };
  const approve = async (e) => { await api.enquiries.approve(e.id); load(); };
  const reject = async (e) => { await api.enquiries.reject(e.id); load(); };
  return (
    <Panel title="Enquiries">
      {rows.length === 0 && <Empty>No enquiries yet.</Empty>}
      {rows.map((e) => (
        <Item key={e.id}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#fff" }}>{e.artwork_id}</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: gold, marginTop: 3 }}>{e.status.toUpperCase()}{e.revealed_price ? ` · $${e.revealed_price}` : ""}</div>
          </div>
          <input placeholder="price" value={price[e.id] || ""} onChange={(ev) => setPrice({ ...price, [e.id]: ev.target.value })} style={miniInput} />
          <Btn onClick={() => reveal(e)}>REVEAL</Btn>
          <Btn onClick={() => approve(e)} primary>APPROVE</Btn>
          <Btn onClick={() => reject(e)} ghost>REJECT</Btn>
        </Item>
      ))}
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
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: "#fff" }}>{(o.items || []).map(i => i.title).join(", ") || "Order"} · ${o.total}</div>
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
  const load = () => api.catalog.artworks().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const del = async (id) => { if (confirm("Delete this artwork?")) { await api.request("DELETE", `/artworks/${id}`); load(); } };
  const feature = async (a) => { await api.request("PATCH", `/artworks/${a.id}`, { body: { featured: !a.featured } }); load(); };
  return (
    <Panel title={`Artworks (${rows.length})`}>
      {rows.map((a) => (
        <Item key={a.id}>
          <img src={a.images?.[0]} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>{a.title}</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)" }}>{a.artist_name} · ${a.price}</div>
          </div>
          <Btn onClick={() => feature(a)} primary={a.featured}>{a.featured ? "FEATURED" : "FEATURE"}</Btn>
          <Btn onClick={() => del(a.id)} ghost>DELETE</Btn>
        </Item>
      ))}
    </Panel>
  );
}

function Events() {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ title: "", description: "", status: "upcoming", location: "", curator: "" });
  const load = () => api.events.list().then(setRows).catch(() => setRows([]));
  useEffect(() => { load(); }, []);
  const create = async () => { if (!f.title) return; await api.events.create(f); setF({ title: "", description: "", status: "upcoming", location: "", curator: "" }); load(); };
  const del = async (id) => { await api.events.remove(id); load(); };
  return (
    <Panel title="Events">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <input placeholder="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} style={miniInput} />
        <input placeholder="Location" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} style={miniInput} />
        <input placeholder="Curator" value={f.curator} onChange={(e) => setF({ ...f, curator: e.target.value })} style={miniInput} />
        <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} style={miniInput}>
          <option value="upcoming">upcoming</option><option value="ongoing">ongoing</option><option value="past">past</option>
        </select>
        <input placeholder="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} style={{ ...miniInput, gridColumn: "1 / -1" }} />
      </div>
      <Btn onClick={create} primary>+ CREATE EVENT</Btn>
      <div style={{ marginTop: 16 }}>
        {rows.map((e) => (
          <Item key={e.id}>
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
  const [comps, setComps] = useState([]);
  const [entries, setEntries] = useState({});
  const [tick, setTick] = useState(0);
  const load = () => { api.admin.artists().then(setKyc).catch(() => {}); api.competitions.list().then(setComps).catch(() => {}); };
  useEffect(() => { load(); }, []);
  const verify = async (uid) => { await api.admin.verifyArtist(uid); load(); };
  const loadEntries = async (cid) => { const es = await api.competitions.entries(cid); setEntries((p) => ({ ...p, [cid]: es })); };
  const verdict = async (eid, cid) => { const n = prompt("Juror notes / score (e.g. 90)"); if (n == null) return; await api.competitions.verdict(eid, { juror_name: "Jury", score: Number(n) || null, notes: n }); loadEntries(cid); };
  const winner = async (eid, cid) => { await api.competitions.markWinner(eid); loadEntries(cid); load(); };
  return (
    <Panel title="Artists & Competition">
      <AddArtist onCreated={() => { load(); setTick((t) => t + 1); }} />
      <AddArtworkForArtist tick={tick} />

      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, margin: "22px 0 10px" }}>ARTIST APPLICATIONS (KYC)</div>
      {kyc.length === 0 && <Empty>No applications.</Empty>}
      {kyc.map((a) => (
        <Item key={a.user_id}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#fff" }}>{a.name} <span style={{ fontSize: 11, color: "rgba(200,191,160,0.5)" }}>· {a.art_type} · {a.location}</span></div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)" }}>{a.email} · {a.status}</div>
          </div>
          {a.status !== "verified" && <Btn onClick={() => verify(a.user_id)} primary>VERIFY</Btn>}
        </Item>
      ))}

      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: gold, margin: "22px 0 10px" }}>COMPETITIONS</div>
      {comps.map((c) => (
        <div key={c.id} style={{ padding: 14, border: "1px solid rgba(212,175,55,0.14)", borderRadius: 10, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, color: "#fff" }}>{c.title} <span style={{ fontSize: 11, color: gold }}>· {c.status}</span></div>
            <Btn onClick={() => loadEntries(c.id)}>VIEW ENTRIES</Btn>
          </div>
          {(entries[c.id] || []).map((e) => (
            <Item key={e.id}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: "#fff" }}>{e.title}</div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: e.status === "winner" ? "#4ade80" : gold, letterSpacing: "0.12em" }}>{e.status.toUpperCase()}</div>
              </div>
              <Btn onClick={() => verdict(e.id, c.id)}>RECORD VERDICT</Btn>
              <Btn onClick={() => winner(e.id, c.id)} primary>MARK WINNER</Btn>
            </Item>
          ))}
        </div>
      ))}
    </Panel>
  );
}

function AddArtist({ onCreated }) {
  const blank = { email: "", password: "", name: "", bio: "", location: "", art_type: "", age: "", image_url: "" };
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const upload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const { url } = await api.uploads.file(file, "image"); setF((v) => ({ ...v, image_url: url })); }
    catch (err) { alert(err.message); }
  };
  const submit = async () => {
    if (!f.email || !f.password || !f.name) { alert("Email, password and name are required"); return; }
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
        <input placeholder="Bio" value={f.bio} onChange={set("bio")} style={{ ...miniInput, gridColumn: "1 / -1" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, gridColumn: "1 / -1" }}>
          <label style={{ ...miniInput, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input type="file" accept="image/*" onChange={upload} style={{ display: "none" }} />
            UPLOAD PHOTO
          </label>
          {f.image_url && <img src={f.image_url} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />}
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
  const blank = { artist_id: "", title: "", price: "", medium: "", category_id: "", base_dimensions: "", image_url: "", customizable: false, featured: false, narrative: "" };
  const [artists, setArtists] = useState([]);
  const [cats, setCats] = useState([]);
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  useEffect(() => {
    api.catalog.artists().then(setArtists).catch(() => {});
    api.catalog.categories().then((c) => setCats(c.filter((x) => x.kind === "main"))).catch(() => {});
  }, [tick]);
  const upload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    try { const { url } = await api.uploads.file(file, "image"); setF((v) => ({ ...v, image_url: url })); }
    catch (err) { alert(err.message); }
  };
  const submit = async () => {
    if (!f.artist_id || !f.title || !f.category_id) { alert("Artist, title and category are required"); return; }
    if (!f.customizable && (!f.price || Number(f.price) <= 0)) { alert("Predefined (fixed-price) artworks need a price greater than 0"); return; }
    setBusy(true);
    try {
      await api.admin.createArtwork({
        title: f.title, narrative: f.narrative || null, medium: f.medium || null,
        category_id: f.category_id, base_dimensions: f.base_dimensions || null,
        customizable: f.customizable, price: f.price ? Number(f.price) : 0,
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
        <input placeholder="Dimensions (e.g. 80 × 60 cm)" value={f.base_dimensions} onChange={set("base_dimensions")} style={miniInput} />
        <input placeholder="Price (USD)" value={f.price} onChange={set("price")} style={miniInput} disabled={f.customizable} />
        <input placeholder="Narrative / description" value={f.narrative} onChange={set("narrative")} style={{ ...miniInput, gridColumn: "1 / -1" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, gridColumn: "1 / -1", flexWrap: "wrap" }}>
          <label style={{ ...miniInput, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input type="file" accept="image/*" onChange={upload} style={{ display: "none" }} />
            UPLOAD IMAGE
          </label>
          {f.image_url && <img src={f.image_url} alt="" style={{ width: 36, height: 36, borderRadius: 4, objectFit: "cover" }} />}
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.75)", cursor: "pointer" }}>
            <input type="checkbox" checked={f.customizable} onChange={(e) => setF((v) => ({ ...v, customizable: e.target.checked }))} style={{ accentColor: gold }} />
            Customizable (price set via enquiry)
          </label>
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
const miniInput = { padding: "9px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 6, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, outline: "none" };
