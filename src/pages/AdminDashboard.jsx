import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useAuth } from "../context/Auth";

const TABS = [
  { id: "overview",  label: "Overview" },
  { id: "artworks",  label: "Artworks" },
  { id: "highlights", label: "Highlights" },
  { id: "events",    label: "Events" },
  { id: "orders",    label: "Orders" },
  { id: "messages",  label: "Messages" },
  { id: "contact",   label: "Contact" },
  { id: "support",   label: "Support" },
];

export default function AdminDashboard() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  // Live counts for Overview / sidebar badges
  const [counts, setCounts] = useState({
    pendingOrders: 0,
    unreadMessages: 0,
    newRegistrations: 0,
    newArtworks: 0,
    contactCount: 0,
    supportOpen: 0,
  });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/signin");
  }, [user, loading, navigate]);

  // Load counts
  const loadCounts = async () => {
    const [ordersRes, msgRes, regRes, artRes, contactRes, supRes] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("chat_messages").select("id", { count: "exact", head: true }).eq("sender", "me"),
      supabase.from("event_registrations").select("id", { count: "exact", head: true }),
      supabase.from("artworks").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }),
      supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
    ]);
    setCounts({
      pendingOrders: ordersRes.count || 0,
      unreadMessages: msgRes.count || 0,
      newRegistrations: regRes.count || 0,
      newArtworks: artRes.count || 0,
      contactCount: contactRes.count || 0,
      supportOpen: supRes.count || 0,
    });
  };

  useEffect(() => {
    if (role !== "admin") return;
    loadCounts();
    const channels = ["orders", "chat_messages", "event_registrations", "artworks", "contact_messages", "support_tickets"]
      .map(t => supabase.channel(`admin-counts-${t}`)
        .on("postgres_changes", { event: "*", schema: "public", table: t }, () => loadCounts())
        .subscribe());
    return () => channels.forEach(c => supabase.removeChannel(c));
  }, [role]);

  if (loading) return <Center>Loading…</Center>;
  if (role !== "admin") {
    return (
      <Center>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: "#fff" }}>Admins only</h1>
        <p style={{ marginTop: 12, color: "rgba(200,191,160,0.6)", fontFamily: "'Raleway',sans-serif" }}>
          Run this in Supabase SQL Editor:
        </p>
        <pre style={preStyle}>{`update public.profiles set role = 'admin' where id = '${user?.id}';`}</pre>
      </Center>
    );
  }

  return (
    <section style={{ padding: "100px 24px 60px", maxWidth: 1400, margin: "0 auto", color: "#e8e0d0" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: "#D4AF37" }}>ADMIN</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 700, color: "#fff", marginTop: 4 }}>Dashboard</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 20 }}>
        <aside style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 12, background: "rgba(255,255,255,0.02)", padding: 12, height: "fit-content" }}>
          {TABS.map(t => {
            const badge =
              t.id === "orders"   ? counts.pendingOrders :
              t.id === "messages" ? counts.unreadMessages :
              t.id === "events"   ? counts.newRegistrations :
              t.id === "support"  ? counts.supportOpen :
              t.id === "contact"  ? counts.contactCount : 0;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  width: "100%", padding: "10px 14px", marginBottom: 4, border: "none",
                  background: tab === t.id ? "rgba(212,175,55,0.10)" : "transparent",
                  color: tab === t.id ? "#D4AF37" : "rgba(200,191,160,0.7)",
                  fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em",
                  borderRadius: 8, cursor: "pointer",
                }}>
                <span>{t.label.toUpperCase()}</span>
                {badge > 0 && (
                  <span style={{ background: "#D4AF37", color: "#111", borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        <div>
          {tab === "overview"  && <Overview counts={counts} setTab={setTab} />}
          {tab === "artworks"  && <ArtworksTab />}
          {tab === "highlights"&& <HighlightsTab />}
          {tab === "events"    && <EventsTab />}
          {tab === "orders"    && <OrdersTab />}
          {tab === "messages"  && <MessagesTab />}
          {tab === "contact"   && <ContactTab />}
          {tab === "support"   && <SupportTab />}
        </div>
      </div>
    </section>
  );
}

/* ════════════════ OVERVIEW ════════════════ */
function Overview({ counts, setTab }) {
  const cards = [
    { label: "Pending Orders",     value: counts.pendingOrders,   to: "orders" },
    { label: "Unread Messages",    value: counts.unreadMessages,  to: "messages" },
    { label: "Event Registrations", value: counts.newRegistrations, to: "events" },
    { label: "Open Support",       value: counts.supportOpen,     to: "support" },
    { label: "Contact Messages",   value: counts.contactCount,    to: "contact" },
    { label: "New Artworks (7d)",  value: counts.newArtworks,     to: "artworks" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
      {cards.map(c => (
        <button key={c.label} onClick={() => setTab(c.to)} style={{
          textAlign: "left", padding: "20px 22px", border: "1px solid rgba(212,175,55,0.18)",
          background: "rgba(255,255,255,0.02)", borderRadius: 10, cursor: "pointer", color: "#e8e0d0",
        }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,191,160,0.6)" }}>{c.label.toUpperCase()}</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 700, color: c.value > 0 ? "#D4AF37" : "#fff", marginTop: 6 }}>{c.value}</div>
        </button>
      ))}
    </div>
  );
}

/* ════════════════ ARTWORKS ════════════════ */
function ArtworksTab() {
  const [items, setItems] = useState([]);
  const [edit, setEdit] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("artworks").select("*").order("created_at", { ascending: false });
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("Delete this artwork? This cannot be undone.")) return;
    const { error } = await supabase.from("artworks").delete().eq("id", id);
    if (error) alert(error.message); else load();
  };

  const toggleFeatured = async (it) => {
    const { error } = await supabase.from("artworks").update({ featured: !it.featured }).eq("id", it.id);
    if (error) alert(error.message); else load();
  };

  return (
    <Card title="Artworks" right={<GoldButton onClick={() => setShowNew(true)}>+ NEW</GoldButton>}>
      <table style={tableStyle}>
        <thead><tr>{["Title", "Artist", "Price", "Status", "Featured", ""].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id} style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
              <td style={tdStyle}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {it.image_url && <img src={it.image_url} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 4 }} />}
                  <div>
                    <div style={{ color: "#fff" }}>{it.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(200,191,160,0.5)" }}>{it.id}</div>
                  </div>
                </div>
              </td>
              <td style={tdStyle}>{it.artist_name}</td>
              <td style={tdStyle}>₹{Number(it.price).toLocaleString()}</td>
              <td style={tdStyle}>{it.status || "published"}</td>
              <td style={tdStyle}>
                <button onClick={() => toggleFeatured(it)} style={chip(it.featured)}>{it.featured ? "★ FEATURED" : "—"}</button>
              </td>
              <td style={tdStyle}>
                <button style={linkBtn} onClick={() => setEdit(it)}>EDIT</button>
                {" · "}
                <button style={{ ...linkBtn, color: "#ff8a8a" }} onClick={() => remove(it.id)}>DELETE</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {edit && <ArtworkEditor item={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
      {showNew && <ArtworkEditor onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load(); }} isNew />}
    </Card>
  );
}

function ArtworkEditor({ item, isNew, onClose, onSaved }) {
  const [form, setForm] = useState(item || {
    id: `art-${Date.now()}`,
    title: "", medium: "", artist_name: "", year: "2026",
    price: 0, size: "medium", style: "", category_id: "oil",
    image_url: "", description: "", status: "published", in_stock: true,
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const upload = async (file) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
      const { error } = await supabase.storage.from("artworks").upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("artworks").getPublicUrl(path);
      setForm(f => ({ ...f, image_url: publicUrl }));
    } catch (e) { alert(e.message); } finally { setUploading(false); }
  };

  const save = async () => {
    setBusy(true);
    const payload = { ...form, price: Number(form.price) };
    const { error } = isNew
      ? await supabase.from("artworks").insert(payload)
      : await supabase.from("artworks").update(payload).eq("id", form.id);
    setBusy(false);
    if (error) { alert(error.message); return; }
    onSaved();
  };

  return (
    <Modal onClose={onClose} title={isNew ? "New Artwork" : `Edit · ${form.title}`}>
      <div style={{ display: "grid", gap: 10 }}>
        <Field label="Title"      value={form.title}       onChange={v => setForm({ ...form, title: v })} />
        <Field label="Artist"     value={form.artist_name} onChange={v => setForm({ ...form, artist_name: v })} />
        <Field label="Medium"     value={form.medium}      onChange={v => setForm({ ...form, medium: v })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <Field label="Price"    value={form.price}       onChange={v => setForm({ ...form, price: v })} type="number" />
          <Field label="Year"     value={form.year}        onChange={v => setForm({ ...form, year: v })} />
          <Field label="Size"     value={form.size}        onChange={v => setForm({ ...form, size: v })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <Field label="Style"    value={form.style}       onChange={v => setForm({ ...form, style: v })} />
          <Field label="Category" value={form.category_id} onChange={v => setForm({ ...form, category_id: v })} />
          <Field label="Status"   value={form.status}      onChange={v => setForm({ ...form, status: v })} />
        </div>
        <Field label="Description" value={form.description || ""} onChange={v => setForm({ ...form, description: v })} multiline />
        <div>
          <Label>Image</Label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {form.image_url && <img src={form.image_url} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }} />}
            <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
            {uploading && <span style={{ color: "#D4AF37", fontSize: 11 }}>Uploading…</span>}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <button onClick={onClose} style={ghostBtn}>CANCEL</button>
          <button onClick={save} disabled={busy} style={goldBtnStyle}>{busy ? "Saving…" : "SAVE"}</button>
        </div>
      </div>
    </Modal>
  );
}

/* ════════════════ HIGHLIGHTS ════════════════ */
function HighlightsTab() {
  const [items, setItems] = useState([]);
  const [all, setAll]     = useState([]);

  const load = async () => {
    const [feat, every] = await Promise.all([
      supabase.from("artworks").select("*").eq("featured", true).order("created_at", { ascending: false }),
      supabase.from("artworks").select("id, title, artist_name, image_url, featured").order("title"),
    ]);
    setItems(feat.data || []);
    setAll(every.data || []);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (it) => {
    const { error } = await supabase.from("artworks").update({ featured: !it.featured }).eq("id", it.id);
    if (error) alert(error.message); else load();
  };

  return (
    <Card title="Homepage Highlights">
      <p style={muted}>These artworks appear in the homepage highlights section.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
        {items.length === 0 && <div style={{ ...muted, gridColumn: "1/-1" }}>No featured artworks yet.</div>}
        {items.map(it => (
          <div key={it.id} style={{ position: "relative", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 6, overflow: "hidden" }}>
            <img src={it.image_url} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
            <button onClick={() => toggle(it)} style={{
              position: "absolute", top: 6, right: 6, padding: "4px 8px", borderRadius: 999,
              background: "rgba(0,0,0,0.65)", color: "#D4AF37", border: "1px solid #D4AF37",
              fontSize: 9, cursor: "pointer",
            }}>REMOVE</button>
            <div style={{ padding: 8, fontSize: 12, color: "#fff" }}>{it.title}</div>
          </div>
        ))}
      </div>
      <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", margin: "20px 0 10px" }}>ALL ARTWORKS</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 360, overflowY: "auto" }}>
        {all.map(a => (
          <label key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", border: "1px solid rgba(212,175,55,0.1)", borderRadius: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={!!a.featured} onChange={() => toggle(a)} style={{ accentColor: "#D4AF37" }} />
            {a.image_url && <img src={a.image_url} alt="" style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 4 }} />}
            <span style={{ flex: 1, fontSize: 13 }}>{a.title} — <span style={muted}>{a.artist_name}</span></span>
          </label>
        ))}
      </div>
    </Card>
  );
}

/* ════════════════ EVENTS ════════════════ */
function EventsTab() {
  const [events, setEvents] = useState([]);
  const [edit, setEdit] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [showRegs, setShowRegs] = useState(null);

  const load = async () => {
    const { data } = await supabase.from("events").select("*").order("starts_at", { ascending: false });
    setEvents(data || []);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm("Delete event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) alert(error.message); else load();
  };

  return (
    <Card title="Events" right={<GoldButton onClick={() => setShowNew(true)}>+ NEW</GoldButton>}>
      <table style={tableStyle}>
        <thead><tr>{["Title", "Status", "Dates", "Location", ""].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
        <tbody>
          {events.map(e => (
            <tr key={e.id} style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
              <td style={tdStyle}>{e.title}</td>
              <td style={tdStyle}>{e.status}</td>
              <td style={tdStyle}>{e.starts_at?.slice(0, 10)} → {e.ends_at?.slice(0, 10)}</td>
              <td style={tdStyle}>{e.location}</td>
              <td style={tdStyle}>
                <button style={linkBtn} onClick={() => setShowRegs(e)}>REGISTRATIONS</button>
                {" · "}
                <button style={linkBtn} onClick={() => setEdit(e)}>EDIT</button>
                {" · "}
                <button style={{ ...linkBtn, color: "#ff8a8a" }} onClick={() => remove(e.id)}>DELETE</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {edit && <EventEditor item={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
      {showNew && <EventEditor onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load(); }} isNew />}
      {showRegs && <RegistrationsModal event={showRegs} onClose={() => setShowRegs(null)} />}
    </Card>
  );
}

function EventEditor({ item, isNew, onClose, onSaved }) {
  const [form, setForm] = useState(item || {
    title: "", description: "", status: "upcoming",
    starts_at: "", ends_at: "", location: "", image_url: "",
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const payload = { ...form, starts_at: form.starts_at || null, ends_at: form.ends_at || null };
    const { error } = isNew
      ? await supabase.from("events").insert(payload)
      : await supabase.from("events").update(payload).eq("id", form.id);
    setBusy(false);
    if (error) { alert(error.message); return; }
    onSaved();
  };

  return (
    <Modal onClose={onClose} title={isNew ? "New Event" : `Edit · ${form.title}`}>
      <div style={{ display: "grid", gap: 10 }}>
        <Field label="Title"     value={form.title} onChange={v => setForm({ ...form, title: v })} />
        <Field label="Status"    value={form.status} onChange={v => setForm({ ...form, status: v })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Starts At" value={form.starts_at?.slice(0,10) || ""} onChange={v => setForm({ ...form, starts_at: v })} type="date" />
          <Field label="Ends At"   value={form.ends_at?.slice(0,10) || ""}   onChange={v => setForm({ ...form, ends_at: v })}   type="date" />
        </div>
        <Field label="Location"  value={form.location || ""} onChange={v => setForm({ ...form, location: v })} />
        <Field label="Image URL" value={form.image_url || ""} onChange={v => setForm({ ...form, image_url: v })} />
        <Field label="Description" value={form.description || ""} onChange={v => setForm({ ...form, description: v })} multiline />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <button onClick={onClose} style={ghostBtn}>CANCEL</button>
          <button onClick={save} disabled={busy} style={goldBtnStyle}>{busy ? "Saving…" : "SAVE"}</button>
        </div>
      </div>
    </Modal>
  );
}

function RegistrationsModal({ event, onClose }) {
  const [regs, setRegs] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("event_registrations")
        .select("name, email, phone, message, created_at")
        .eq("event_id", event.id)
        .order("created_at", { ascending: false });
      setRegs(data || []);
    })();
  }, [event.id]);
  return (
    <Modal onClose={onClose} title={`Registrations · ${event.title}`}>
      {regs.length === 0 ? <div style={muted}>No registrations.</div> : (
        <table style={tableStyle}>
          <thead><tr>{["Name","Email","Phone","When","Message"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {regs.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
                <td style={tdStyle}>{r.name}</td>
                <td style={tdStyle}>{r.email}</td>
                <td style={tdStyle}>{r.phone}</td>
                <td style={tdStyle}>{new Date(r.created_at).toLocaleString()}</td>
                <td style={tdStyle}>{r.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}

/* ════════════════ ORDERS ════════════════ */
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [active, setActive] = useState(null);
  const [items, setItems] = useState([]);

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!active) { setItems([]); return; }
    (async () => {
      const { data } = await supabase.from("order_items").select("*").eq("order_id", active.id);
      setItems(data || []);
    })();
  }, [active]);

  const setStatus = async (id, status) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) alert(error.message); else load();
  };

  return (
    <Card title="Orders">
      <table style={tableStyle}>
        <thead><tr>{["Order","Customer","Total","Status","Date",""].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
              <td style={tdStyle}>{o.id.slice(0, 8).toUpperCase()}</td>
              <td style={tdStyle}>{o.full_name}<br /><span style={{ fontSize: 11, color: "rgba(200,191,160,0.5)" }}>{o.email}</span></td>
              <td style={tdStyle}>₹{Number(o.total).toLocaleString()}</td>
              <td style={tdStyle}>
                <select value={o.status} onChange={e => setStatus(o.id, e.target.value)} style={selectStyle}>
                  {["pending","paid","shipped","delivered","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td style={tdStyle}>{new Date(o.created_at).toLocaleDateString()}</td>
              <td style={tdStyle}><button style={linkBtn} onClick={() => setActive(o)}>VIEW</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {active && (
        <Modal onClose={() => setActive(null)} title={`Order · ${active.id.slice(0,8).toUpperCase()}`}>
          <div style={{ marginBottom: 10 }}>
            <div style={muted}>Customer</div>
            <div>{active.full_name} · {active.email} · {active.phone}</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={muted}>Shipping</div>
            <pre style={{ ...preStyle, fontSize: 11 }}>{JSON.stringify(active.shipping_address, null, 2)}</pre>
          </div>
          <div style={muted}>Items</div>
          <table style={tableStyle}>
            <thead><tr>{["Title","Price","Qty"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id}><td style={tdStyle}>{it.title}</td><td style={tdStyle}>₹{Number(it.price).toLocaleString()}</td><td style={tdStyle}>{it.qty}</td></tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}
    </Card>
  );
}

/* ════════════════ MESSAGES (chat inbox) ════════════════ */
function MessagesTab() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("id, user_id, conversation_key, sender, text, created_at")
        .order("created_at", { ascending: true });
      if (!cancelled) setRows(data || []);
    })();
    const ch = supabase.channel("admin-msgs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => setRows(prev => [...prev, payload.new]))
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, []);

  const conversations = useMemo(() => {
    const map = new Map();
    for (const m of rows) {
      const key = `${m.user_id}::${m.conversation_key}`;
      const cur = map.get(key);
      if (!cur || new Date(m.created_at) > new Date(cur.last_at)) {
        map.set(key, { user_id: m.user_id, conversation_key: m.conversation_key, last_text: m.text, last_at: m.created_at, last_sender: m.sender });
      }
    }
    return [...map.values()].sort((a, b) => new Date(b.last_at) - new Date(a.last_at));
  }, [rows]);

  useEffect(() => {
    if (!active) { setThread([]); return; }
    setThread(rows.filter(m => m.user_id === active.user_id && m.conversation_key === active.conversation_key));
  }, [active, rows]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [thread]);

  const send = async () => {
    const text = reply.trim();
    if (!text || !active || sending) return;
    setSending(true); setReply("");
    const sender = active.conversation_key.startsWith("artist:") ? "artist" : "curator";
    const { error } = await supabase.from("chat_messages").insert({
      user_id: active.user_id, conversation_key: active.conversation_key, sender, text,
    });
    setSending(false);
    if (error) alert(error.message);
  };

  return (
    <Card title="Messages">
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 12, minHeight: 460 }}>
        <div style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 8, overflowY: "auto" }}>
          {conversations.length === 0 && <div style={{ padding: 16, ...muted }}>No conversations.</div>}
          {conversations.map(c => {
            const isActive = active && c.user_id === active.user_id && c.conversation_key === active.conversation_key;
            return (
              <button key={`${c.user_id}::${c.conversation_key}`} onClick={() => setActive(c)}
                style={{
                  display: "block", width: "100%", textAlign: "left", padding: "10px 14px",
                  border: "none", borderBottom: "1px solid rgba(212,175,55,0.08)",
                  background: isActive ? "rgba(212,175,55,0.10)" : "transparent",
                  color: "#e8e0d0", cursor: "pointer",
                }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.14em", color: "#D4AF37" }}>{c.conversation_key}</div>
                <div style={{ fontSize: 12, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.last_text}</div>
                <div style={{ fontSize: 10, color: "rgba(200,191,160,0.45)", marginTop: 2 }}>{new Date(c.last_at).toLocaleString()}</div>
              </button>
            );
          })}
        </div>
        <div style={{ border: "1px solid rgba(212,175,55,0.18)", borderRadius: 8, display: "flex", flexDirection: "column" }}>
          {!active ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", ...muted }}>Select a conversation.</div>
          ) : (
            <>
              <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {thread.map(m => (
                  <div key={m.id} style={{ alignSelf: m.sender === "me" ? "flex-start" : "flex-end", maxWidth: "70%" }}>
                    <div style={{
                      padding: "8px 12px", borderRadius: 12,
                      background: m.sender === "me" ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#D4AF37,#e8c53a)",
                      color: m.sender === "me" ? "#e8e0d0" : "#111", fontSize: 13,
                    }}>{m.text}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: 10, borderTop: "1px solid rgba(212,175,55,0.15)", display: "flex", gap: 6 }}>
                <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(); }}
                  placeholder="Reply…" style={inputStyle} />
                <button onClick={send} disabled={sending || !reply.trim()} style={goldBtnStyle}>SEND</button>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ════════════════ CONTACT ════════════════ */
function ContactTab() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      setRows(data || []);
    })();
  }, []);
  return (
    <Card title="Contact Messages">
      {rows.length === 0 && <div style={muted}>No messages.</div>}
      {rows.map(m => (
        <div key={m.id} style={{ padding: 14, border: "1px solid rgba(212,175,55,0.12)", borderRadius: 8, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <strong>{m.name} · {m.email}</strong>
            <span style={muted}>{new Date(m.created_at).toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{m.message}</div>
        </div>
      ))}
    </Card>
  );
}

/* ════════════════ SUPPORT ════════════════ */
function SupportTab() {
  const [rows, setRows] = useState([]);
  const load = async () => {
    const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const setStatus = async (id, status) => {
    const { error } = await supabase.from("support_tickets").update({ status }).eq("id", id);
    if (error) alert(error.message); else load();
  };
  return (
    <Card title="Support Tickets">
      {rows.length === 0 && <div style={muted}>No tickets.</div>}
      {rows.map(t => (
        <div key={t.id} style={{ padding: 14, border: "1px solid rgba(212,175,55,0.12)", borderRadius: 8, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <strong>{t.subject || "(no subject)"} — {t.email}</strong>
            <select value={t.status} onChange={e => setStatus(t.id, e.target.value)} style={selectStyle}>
              {["open","in_progress","resolved","closed"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{t.message}</div>
          <div style={{ ...muted, marginTop: 6 }}>{new Date(t.created_at).toLocaleString()}</div>
        </div>
      ))}
    </Card>
  );
}

/* ════════════════ Shared UI bits ════════════════ */
const cardOuter = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 12, padding: 24 };
const tableStyle = { width: "100%", borderCollapse: "collapse", fontFamily: "'Raleway',sans-serif", fontSize: 13 };
const thStyle = { textAlign: "left", padding: "8px 10px", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", color: "#D4AF37", borderBottom: "1px solid rgba(212,175,55,0.2)" };
const tdStyle = { padding: "10px", verticalAlign: "top" };
const linkBtn = { background: "transparent", border: "none", color: "#D4AF37", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em" };
const goldBtnStyle = { background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 999, padding: "8px 18px", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em", cursor: "pointer" };
const ghostBtn = { background: "transparent", color: "#e8e0d0", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 999, padding: "8px 18px", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em", cursor: "pointer" };
const inputStyle = { flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 999, padding: "8px 14px", color: "#e8e0d0", fontSize: 13, outline: "none" };
const selectStyle = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 6, padding: "5px 8px", color: "#e8e0d0", fontSize: 12 };
const muted = { color: "rgba(200,191,160,0.55)", fontSize: 12 };
const preStyle = { background: "rgba(255,255,255,0.04)", padding: 10, borderRadius: 6, color: "#D4AF37", overflow: "auto" };
const chip = (on) => ({ padding: "3px 10px", borderRadius: 999, fontSize: 10, fontFamily: "'Cinzel',serif", letterSpacing: "0.12em", border: `1px solid ${on ? "#D4AF37" : "rgba(212,175,55,0.25)"}`, background: on ? "rgba(212,175,55,0.15)" : "transparent", color: on ? "#D4AF37" : "rgba(200,191,160,0.6)", cursor: "pointer" });

function Card({ title, right, children }) {
  return (
    <div style={cardOuter}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: "#fff" }}>{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}
function Center({ children }) {
  return <section style={{ padding: "120px 24px", textAlign: "center", color: "#e8e0d0" }}>{children}</section>;
}
function GoldButton({ children, ...p }) { return <button {...p} style={goldBtnStyle}>{children}</button>; }
function Label({ children }) { return <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.14em", color: "#D4AF37", marginBottom: 5 }}>{children}</div>; }
function Field({ label, value, onChange, type = "text", multiline }) {
  const common = { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 6, padding: "8px 12px", color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, outline: "none" };
  return (
    <div>
      <Label>{label}</Label>
      {multiline
        ? <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} style={{ ...common, resize: "vertical" }} />
        : <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)} style={common} />}
    </div>
  );
}
function Modal({ title, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#0e0c0a", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 12, width: "100%", maxWidth: 720, maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "#fff" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#D4AF37", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
