import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import { Skeleton, SkeletonRows } from "../components/ui/Skeleton";
import { CopyIcon, CheckIcon } from "../components/Icons";
import { useLocale } from "../context/Locale";
import { useAuth } from "../context/Auth";
import { api, realtime } from "../utils/api";
import { loadRazorpay } from "../utils/razorpay";
import { validateForm, isValid, required, phoneIN, pincodeIN, futureDate, todayISO, genId } from "../utils/validation";

const STAGE_ORDER = ["order_confirmed", "curation_crating", "dispatched", "out_for_delivery", "installation", "delivered"];
const STAGE_LABEL = {
  order_confirmed: "ORDER CONFIRMED",
  curation_crating: "CURATION & CRATING",
  dispatched: "DISPATCHED VIA BLUE DART",
  out_for_delivery: "OUT FOR DELIVERY",
  installation: "FINAL INSTALLATION",
  delivered: "DELIVERED",
};

const PAY_METHODS = [
  { id: "razorpay", label: "UPI / Card (Razorpay)", desc: "Secure online payment" },
];

// Fallback shown only until the backend vault loads (see /deliveries/estimate).
const VAULT_FALLBACK = {
  name: "Art Coliseum Vault",
  address: "Kala Ghoda Arts Precinct, Fort, Mumbai, Maharashtra 400001",
  hours: "Mon–Sat · 11:00–19:00",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { formatPrice } = useLocale();
  const { user, loading } = useAuth();

  const [data, setData] = useState(null);      // cart breakdown
  const [address, setAddress] = useState({ name: "", phone: "", line1: "", line2: "", city: "", state: "", zip: "", country: "India" });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveAddr, setSaveAddr] = useState(true);
  const [vault, setVault] = useState(VAULT_FALLBACK);
  const [pickup, setPickup] = useState({ date: "", slot: "" });
  const [touched, setTouched] = useState(false);   // show errors only after a submit attempt
  const [pay, setPay] = useState("razorpay");
  const [order, setOrder] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [showPayOverlay, setShowPayOverlay] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payNotice, setPayNotice] = useState("");   // shown after a failed/cancelled payment
  const [otp, setOtp] = useState("");
  const [otpErr, setOtpErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [review, setReview] = useState({ rating: 5, text: "" });
  const [reviewDone, setReviewDone] = useState(false);
  const [est, setEst] = useState(null);   // pincode delivery estimate
  const [ckLoading, setCkLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/signin"); return; }
    setCkLoading(true);
    api.cart.breakdown().then(setData).catch(() => setData(null)).finally(() => setCkLoading(false));
    // Backend warehouse details (single source of truth) for self-pickup.
    api.deliveries.estimate().then((e) => { if (e?.vault) setVault(e.vault); }).catch(() => {});
    // Prefill from the buyer's profile + load their saved address book.
    api.auth.me().then((m) => {
      const addrs = m?.addresses || [];
      setSavedAddresses(addrs);
      const def = addrs.find((a) => a.is_default) || addrs[0];
      setAddress((prev) => ({
        ...prev,
        name: prev.name || m?.full_name || "",
        phone: prev.phone || m?.phone || "",
        ...(def ? pickAddr(def) : {}),
      }));
    }).catch(() => {});
  }, [user, loading]);

  // Fetch the shipping zone / ETA / fee whenever a 6-digit pincode is entered.
  useEffect(() => {
    const pin = address.zip.trim();
    if (pin.length < 6) { setEst(null); return; }
    let cancelled = false;
    api.deliveries.estimate(pin).then((e) => { if (!cancelled) setEst(e); }).catch(() => {});
    return () => { cancelled = true; };
  }, [address.zip]);

  // Live delivery updates after the order is placed.
  useEffect(() => {
    if (!order) return;
    const sub = realtime.channel("*").on("message", (m) => {
      if (m.type === "delivery" && m.order_id === order.id) {
        api.deliveries.byOrder(order.id).then(setDelivery).catch(() => {});
      }
    }).subscribe();
    return () => sub.unsubscribe();
  }, [order]);

  const items = data?.items || [];
  // Zone delivery fee applies only when something is shipped (not pure self-pickup).
  const needsTransport = items.some((it) => it.fulfillment !== "self_pickup");
  const hasPickup = items.some((it) => it.fulfillment === "self_pickup");
  const zoneFee = needsTransport && est ? est.delivery_fee : 0;
  const grandTotal = (data?.total || 0) + zoneFee;   // data.total already includes GST

  // Validation depends on fulfillment: name/phone always; full address when shipping;
  // a pickup date when any item is self-pickup.
  const errors = {
    ...validateForm(address, { name: [required("Full name")], phone: [required("Phone"), phoneIN] }),
    ...(needsTransport ? validateForm(address, {
      line1: [required("Address line 1")], city: [required("City")],
      state: [required("State")], zip: [required("PIN code"), pincodeIN],
    }) : {}),
  };
  const pickupErrors = hasPickup ? validateForm(pickup, { date: [required("Pickup date"), futureDate] }) : {};
  const formValid = isValid(errors) && isValid(pickupErrors);
  const err = (field) => (touched ? errors[field] : "");

  const applySaved = (a) => setAddress((prev) => ({ ...prev, ...pickAddr(a) }));

  const placeOrder = async () => {
    if (!items.length || submitting) return;
    if (!formValid) { setTouched(true); return; }
    setSubmitting(true);
    setPayNotice("");
    try {
      // Reuse the still-unpaid order from a previous (failed/cancelled) attempt so
      // we don't create duplicate pending orders — the cart is preserved server-side
      // until payment actually succeeds.
      let created = order && order.status === "pending" ? order : null;
      if (!created) {
        created = await api.orders.create({
          full_name: address.name, phone: address.phone,
          shipping_address: needsTransport ? address : {},
          payment_provider: pay,
          pincode: needsTransport ? address.zip : null,
          pickup_date: hasPickup ? pickup.date : null,
          pickup_slot: hasPickup ? pickup.slot : null,
        });
        // Save this address to the buyer's book (transport orders only, when asked).
        if (needsTransport && saveAddr && !addressInBook(savedAddresses, address)) {
          const entry = { id: genId("addr"), label: address.city || "Address", ...pickAddr(address), is_default: savedAddresses.length === 0 };
          const next = [...savedAddresses, entry];
          api.auth.updateMe({ addresses: next }).then((m) => setSavedAddresses(m?.addresses || next)).catch(() => {});
        }
        setOrder(created);
      }
      // Real Razorpay checkout when keys are configured (backend returns a
      // razorpay_order_id); otherwise the built-in demo overlay.
      if (created.razorpay_order_id) {
        await openRazorpay(created);
      } else {
        setShowPayOverlay(true);
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Open the hosted Razorpay checkout, then verify the result server-side.
  const openRazorpay = async (created) => {
    const Razorpay = await loadRazorpay();
    const rzp = new Razorpay({
      key: created.razorpay_key_id,
      order_id: created.razorpay_order_id,
      amount: created.amount_due,
      currency: created.currency || "INR",
      name: "Art Coliseum",
      description: `Order #${created.id.slice(0, 8).toUpperCase()}`,
      prefill: { name: address.name, email: user?.email || "", contact: address.phone },
      theme: { color: "#D4AF37" },
      handler: async (resp) => {
        try {
          const paid = await api.orders.verify(created.id, {
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
          setOrder(paid);
          setPayNotice("");
          const d = await api.deliveries.byOrder(created.id).catch(() => null);
          setDelivery(d);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (e) {
          alert(e.message);
        }
      },
      // Buyer closed the Razorpay window without paying — keep their cart & order
      // so they can simply hit "Place Order" again.
      modal: {
        ondismiss: () =>
          setPayNotice("Payment cancelled — your items are still in your cart. You can try again whenever you're ready."),
      },
    });
    rzp.on("payment.failed", (r) =>
      setPayNotice(
        (r.error?.description ? `${r.error.description} ` : "Payment failed. ") +
          "Your items are saved in your cart — please try again.",
      ),
    );
    rzp.open();
  };

  // Demo flow only (no Razorpay keys configured).
  const finalizePaid = async (orderId) => {
    const paid = await api.orders.pay(orderId);
    setOrder(paid);
    setShowPayOverlay(false);
    const d = await api.deliveries.byOrder(orderId).catch(() => null);
    setDelivery(d);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmOtp = async () => {
    setOtpErr("");
    try {
      const d = await api.deliveries.confirm(delivery.id, otp.trim());
      setDelivery(d);
      setOrder((o) => ({ ...o, status: "delivered" }));
    } catch (e) {
      setOtpErr(e.message);
    }
  };

  const submitReview = async () => {
    try {
      await api.reviews.create({ artwork_id: items[0]?.artwork_id, order_id: order.id, rating: review.rating, text: review.text });
      setReviewDone(true);
    } catch (e) { alert(e.message); }
  };

  /* ───── PLACED VIEW ───── */
  if (order && order.status !== "pending") {
    const currentIdx = delivery ? STAGE_ORDER.indexOf(delivery.stage) : 0;
    const delivered = delivery?.stage === "delivered";
    return (
      <section style={{ padding: "100px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="order-modal-tick" style={{ margin: "0 auto 18px" }}><CheckIcon size={32} /></div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 10 }}>ORDER PLACED</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 48, fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 14 }}>
            Thank you, {address.name.split(" ")[0] || "Collector"}
          </h1>
          <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.65)", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
            Order <span className="num-value" style={{ color: "#D4AF37" }}>#{order.id.slice(0, 8).toUpperCase()}</span> is confirmed.
            Track its journey below — you'll confirm receipt with an OTP at installation.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 36 }} className="ck-grid">
          {/* Tracking */}
          <div style={{ padding: "30px 28px", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37" }}>ORDER TRACKING</span>
              <span style={{ padding: "5px 12px", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.18em", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37" }}>
                {delivery ? STAGE_LABEL[delivery.stage] : "CONFIRMED"}
              </span>
            </div>

            <div style={{ position: "relative", marginBottom: 26 }}>
              {STAGE_ORDER.map((stage, i) => {
                const state = i < currentIdx ? "done" : i === currentIdx ? "active" : "pending";
                return (
                  <div key={stage} style={{ display: "flex", gap: 14, paddingBottom: i !== STAGE_ORDER.length - 1 ? 22 : 0, position: "relative" }}>
                    {i !== STAGE_ORDER.length - 1 && (
                      <div style={{ position: "absolute", left: 11, top: 24, bottom: 0, width: 1, background: i < currentIdx ? "#D4AF37" : "rgba(212,175,55,0.2)" }} />
                    )}
                    <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      background: state !== "pending" ? "#D4AF37" : "rgba(212,175,55,0.15)", color: state !== "pending" ? "#111" : "rgba(200,191,160,0.4)",
                      fontSize: 10, fontWeight: 700, boxShadow: state === "active" ? "0 0 0 4px rgba(212,175,55,0.2)" : "none" }}>
                      {state === "done" ? "✓" : state === "active" ? "●" : ""}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: state === "active" ? "#D4AF37" : state === "done" ? "#e8e0d0" : "rgba(200,191,160,0.45)" }}>
                        {STAGE_LABEL[stage]}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ height: 1, background: "rgba(212,175,55,0.18)", margin: "0 0 18px" }} />
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.18em", color: "rgba(200,191,160,0.55)", marginBottom: 6 }}>TRACKING ID · {delivery?.courier || "Blue Dart"}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="num-value" style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "#D4AF37", letterSpacing: "0.1em" }}>{delivery?.tracking_id || "—"}</div>
              <button onClick={() => { navigator.clipboard?.writeText(delivery?.tracking_id || ""); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#D4AF37", display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em" }}>
                <CopyIcon size={14} />{copied && <span>COPIED</span>}
              </button>
            </div>
            {delivery?.eta && (
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.7)", marginTop: 8 }}>
                Estimated arrival · <span style={{ color: "#D4AF37" }}>{delivery.eta}</span>
              </div>
            )}

            {/* OTP confirm */}
            {delivery && !delivered && (
              <div style={{ marginTop: 22, padding: 18, background: "rgba(212,175,55,0.05)", border: "1px dashed rgba(212,175,55,0.3)", borderRadius: 10 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: "#D4AF37", marginBottom: 8 }}>CONFIRM RECEIPT</div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.65)", marginBottom: 12, lineHeight: 1.6 }}>
                  When your piece is installed, our team shares a 6-digit OTP. Enter it to confirm receipt.
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP"
                    style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 8, padding: "11px 14px", color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 14, letterSpacing: "0.2em", outline: "none" }} />
                  <button onClick={confirmOtp} disabled={otp.trim().length < 4}
                    style={{ padding: "0 22px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 8, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.14em", cursor: "pointer" }}>CONFIRM</button>
                </div>
                {otpErr && <div style={{ color: "#ff8a8a", fontFamily: "'Raleway',sans-serif", fontSize: 12, marginTop: 8 }}>{otpErr}</div>}
              </div>
            )}

            {/* Review */}
            {delivered && (
              <div style={{ marginTop: 22, padding: 18, background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 10 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: "#D4AF37", marginBottom: 8 }}>YOUR PIECE HAS ARRIVED ✦</div>
                {reviewDone ? (
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.75)" }}>Thank you — your testimonial has been recorded.</div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setReview({ ...review, rating: n })}
                          style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 22, color: n <= review.rating ? "#D4AF37" : "rgba(200,191,160,0.3)" }}>★</button>
                      ))}
                    </div>
                    <textarea value={review.text} onChange={(e) => setReview({ ...review, text: e.target.value })} placeholder="Share your experience…" rows={3}
                      style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 8, padding: "10px 12px", color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, outline: "none", marginBottom: 10 }} />
                    <button onClick={submitReview}
                      style={{ width: "100%", padding: "11px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 999, fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", cursor: "pointer" }}>SUBMIT TESTIMONIAL</button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Summary */}
          <div style={{ padding: "30px 28px", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 12, background: "rgba(255,255,255,0.02)", height: "fit-content" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 18 }}>ORDER SUMMARY</div>
            {(order.items || []).map((it) => (
              <Row key={it.id} label={it.title || "Artwork"} value={formatPrice((it.price || 0) + (it.transport_cost || 0) + (it.setup_cost || 0))} />
            ))}
            {order.tax > 0 && <Row label="GST (12%)" value={formatPrice(order.tax)} />}
            {order.delivery_fee > 0 && <Row label="Delivery" value={formatPrice(order.delivery_fee)} />}
            <div style={{ height: 1, background: "rgba(212,175,55,0.18)", margin: "16px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 22 }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", color: "#fff" }}>TOTAL PAID</span>
              <span className="num-value" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "#D4AF37" }}>{formatPrice(order.total)}</span>
            </div>
            <button onClick={() => navigate("/profile")}
              style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", border: "none", borderRadius: 999, cursor: "pointer" }}>
              VIEW IN MY PROFILE →
            </button>
          </div>
        </div>
        <style>{`@media (max-width: 900px){.ck-grid{grid-template-columns:1fr!important}}`}</style>
      </section>
    );
  }

  /* ───── CHECKOUT FORM ───── */
  return (
    <section style={{ padding: "100px 24px 80px", maxWidth: 1280, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.2em", color: "#D4AF37", marginBottom: 10 }}>CHECKOUT</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 48, fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 14 }}>Place Your Order</h1>
        <p style={{ fontFamily: "'Raleway',sans-serif", fontSize: 14, color: "rgba(200,191,160,0.6)", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
          Confirm your acquisitions, where to send them, and how to pay.
        </p>
      </motion.div>

      {ckLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 36 }} className="ck-grid">
          <SkeletonRows count={3} height={120} gap={14} />
          <Skeleton height={420} radius={10} />
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: 80, textAlign: "center", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 12 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, color: "#fff", marginBottom: 12 }}>Your cart is empty</div>
          <button onClick={() => navigate("/categories")} style={{ marginTop: 14, padding: "13px 28px", background: "linear-gradient(135deg,#D4AF37,#e8c53a)", color: "#111", border: "none", borderRadius: 999, cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em" }}>BROWSE COLLECTION</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 36 }} className="ck-grid">
          <div>
            <SectionLabel>SELECTED ARTWORKS</SectionLabel>
            <div style={{ marginBottom: 36 }}>
              {items.map((it, i) => (
                <div key={it.id} style={{ display: "flex", gap: 22, alignItems: "center", padding: "20px 0", borderBottom: i !== items.length - 1 ? "1px solid rgba(212,175,55,0.15)" : "none" }}>
                  <SafeImage src={it.image} alt={it.title} style={{ width: 86, height: 86, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 10, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)" }}>{(it.artist_name || "").toUpperCase()}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 600, color: "#fff", marginTop: 4 }}>{it.title}</div>
                    <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", marginTop: 4, textTransform: "capitalize" }}>{it.fulfillment.replace(/_/g, " ")}</div>
                  </div>
                  <div className="num-value" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: "#D4AF37" }}>{formatPrice(it.line_total)}</div>
                </div>
              ))}
            </div>

            <SectionLabel>{needsTransport ? "DELIVERY ADDRESS" : "PICKUP CONTACT"}</SectionLabel>

            {needsTransport && savedAddresses.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", marginBottom: 8 }}>Use a saved address:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {savedAddresses.map((a) => (
                    <button key={a.id} onClick={() => applySaved(a)} style={savedChip}>
                      <span style={{ color: "#D4AF37" }}>{a.label || a.city || "Address"}</span>
                      <span style={{ color: "rgba(200,191,160,0.55)" }}> · {a.line1}{a.city ? `, ${a.city}` : ""}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={addrBox}>
              <div style={twoCol}>
                <Input label="Full Name *" value={address.name} onChange={(v) => setAddress({ ...address, name: v })} error={err("name")} />
                <Input label="Phone *" value={address.phone} onChange={(v) => setAddress({ ...address, phone: v })} type="tel" inputMode="numeric" maxLength={10} error={err("phone")} />
              </div>
              {needsTransport && (
                <>
                  <Input label="Address Line 1 *" value={address.line1} onChange={(v) => setAddress({ ...address, line1: v })} error={err("line1")} />
                  <Input label="Address Line 2" value={address.line2} onChange={(v) => setAddress({ ...address, line2: v })} />
                  <div style={twoCol}>
                    <Input label="City *" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} error={err("city")} />
                    <Input label="State *" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} error={err("state")} />
                  </div>
                  <div style={twoCol}>
                    <Input label="PIN Code *" value={address.zip} onChange={(v) => setAddress({ ...address, zip: v })} inputMode="numeric" maxLength={6} error={err("zip")} />
                    <Input label="Country" value={address.country} onChange={(v) => setAddress({ ...address, country: v })} />
                  </div>
                  {est && (
                    <div style={{ marginTop: 4, padding: "10px 14px", borderRadius: 8, background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.22)", fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.8)" }}>
                      <strong style={{ color: "#D4AF37" }}>{est.courier}</strong> · {est.zone} · ETA {est.eta} · delivery {zoneFee ? formatPrice(zoneFee) : "free"}
                    </div>
                  )}
                  <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, cursor: "pointer", fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.75)" }}>
                    <input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} style={{ accentColor: "#D4AF37" }} />
                    Save this address to my account
                  </label>
                </>
              )}
            </div>

            {hasPickup && (
              <div style={{ marginBottom: 30, padding: "16px 18px", borderRadius: 10, background: "rgba(212,175,55,0.05)", border: "1px dashed rgba(212,175,55,0.3)" }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "#D4AF37", marginBottom: 8 }}>SELF-PICKUP LOCATION</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "#fff" }}>{vault.name}</div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.7)", marginTop: 3, lineHeight: 1.6 }}>{vault.address}</div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 12, color: "rgba(200,191,160,0.55)", marginTop: 6 }}>Hours: {vault.hours} · bring a photo ID and your pickup OTP.</div>
                <div style={{ ...twoCol, marginTop: 14 }}>
                  <div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)", marginBottom: 5 }}>Pickup Date *</div>
                    <input type="date" min={todayISO()} value={pickup.date} onChange={(e) => setPickup({ ...pickup, date: e.target.value })}
                      style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${touched && pickupErrors.date ? "rgba(255,120,120,0.7)" : "rgba(212,175,55,0.2)"}`, borderRadius: 6, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, outline: "none", colorScheme: "dark" }} />
                    {touched && pickupErrors.date && <div style={errText}>{pickupErrors.date}</div>}
                  </div>
                  <Input label="Preferred Time (optional)" value={pickup.slot} onChange={(v) => setPickup({ ...pickup, slot: v })} placeholder="e.g. 11:00–13:00" />
                </div>
              </div>
            )}

            <SectionLabel>PAYMENT METHOD</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {PAY_METHODS.map((m) => (
                <label key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: pay === m.id ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.02)", border: pay === m.id ? "1px solid #D4AF37" : "1px solid rgba(212,175,55,0.18)", borderRadius: 10, cursor: "pointer" }}>
                  <input type="radio" name="pay" checked={pay === m.id} onChange={() => setPay(m.id)} style={{ accentColor: "#D4AF37" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.14em", color: "#fff" }}>{m.label.toUpperCase()}</div>
                    <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", marginTop: 3 }}>{m.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* summary */}
          <div style={{ padding: "30px 28px", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 12, background: "rgba(255,255,255,0.02)", height: "fit-content", position: "sticky", top: 100 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 18 }}>ORDER SUMMARY</div>
            <Row label="Artwork subtotal" value={formatPrice(data.artwork_subtotal)} />
            <Row label="Handling & insurance" value={data.transport_subtotal ? formatPrice(data.transport_subtotal) : "—"} />
            <Row label="Installation / setup" value={data.setup_subtotal ? formatPrice(data.setup_subtotal) : "—"} />
            <Row label="GST (12%)" value={data.gst ? formatPrice(data.gst) : "—"} />
            <Row
              label={needsTransport ? (est ? `Delivery · ${est.zone}` : "Delivery (enter pincode)") : "Delivery · self-pickup"}
              value={needsTransport ? (est ? (zoneFee ? formatPrice(zoneFee) : "Free") : "—") : "Free"}
            />
            {needsTransport && est && (
              <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "rgba(200,191,160,0.55)", marginBottom: 10 }}>
                {est.courier} · ETA {est.eta}{!est.serviceable ? " (estimate)" : ""}
              </div>
            )}
            <div style={{ height: 1, background: "rgba(212,175,55,0.18)", margin: "16px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.16em", color: "#fff" }}>TOTAL</span>
              <span className="num-value" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: "#D4AF37" }}>{formatPrice(grandTotal)}</span>
            </div>
            {payNotice && (
              <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 10, background: "rgba(251,191,36,0.10)", border: "1px solid rgba(251,191,36,0.4)", fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "#fbbf24", lineHeight: 1.6 }}>
                {payNotice}
              </div>
            )}
            <motion.button onClick={placeOrder} disabled={submitting}
              whileHover={formValid ? { scale: 1.02 } : {}} whileTap={formValid ? { scale: 0.98 } : {}}
              style={{ width: "100%", padding: "16px", background: formValid ? "linear-gradient(135deg,#D4AF37,#e8c53a)" : "rgba(212,175,55,0.25)", color: formValid ? "#111" : "rgba(255,255,255,0.5)", fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: "0.2em", border: "none", borderRadius: 999, cursor: submitting ? "wait" : "pointer" }}>
              {submitting ? "PLACING…" : (order && order.status === "pending") ? "TRY PAYMENT AGAIN →" : "PLACE ORDER →"}
            </motion.button>
            {touched && !formValid && <div style={{ marginTop: 10, fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "#ff8a8a", textAlign: "center" }}>{needsTransport ? "Please complete the delivery address" : "Please choose a pickup date"}</div>}
          </div>
        </div>
      )}

      {/* Dummy Razorpay-style payment overlay */}
      <AnimatePresence>
        {showPayOverlay && order && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 6000, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 380, overflow: "hidden", fontFamily: "system-ui, sans-serif" }}>
              <div style={{ background: "#0a1f44", color: "#fff", padding: "18px 22px" }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Razorpay</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Art Coliseum · DEMO MODE</div>
              </div>
              <div style={{ padding: 22 }}>
                <div style={{ fontSize: 13, color: "#555" }}>Amount payable</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: "#0a1f44", marginBottom: 16 }}>{formatPrice(order.total)}</div>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 18, lineHeight: 1.5 }}>
                  This is a dummy gateway. No real payment is processed. Click below to simulate a successful payment.
                </div>
                <button onClick={() => finalizePaid(order.id)}
                  style={{ width: "100%", padding: "14px", background: "#0a1f44", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  Pay {formatPrice(order.total)}
                </button>
                <button onClick={() => setShowPayOverlay(false)}
                  style={{ width: "100%", padding: "10px", marginTop: 8, background: "transparent", color: "#888", border: "none", fontSize: 13, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@media (max-width: 900px){.ck-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, letterSpacing: "0.18em", color: "#D4AF37", marginBottom: 14 }}>{children}</div>;
}
function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontFamily: "'Raleway',sans-serif", fontSize: 13, color: "rgba(200,191,160,0.75)" }}>
      <span style={{ maxWidth: "65%" }}>{label}</span>
      <span className="num-value" style={{ color: "#fff" }}>{value}</span>
    </div>
  );
}
function Input({ label, value, onChange, type = "text", placeholder, error, inputMode, maxLength }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, letterSpacing: "0.16em", color: "rgba(200,191,160,0.55)", marginBottom: 5 }}>{label}</div>
      <input type={type} value={value} placeholder={placeholder} inputMode={inputMode} maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", padding: "11px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${error ? "rgba(255,120,120,0.7)" : "rgba(212,175,55,0.2)"}`, borderRadius: 6, color: "#e8e0d0", fontFamily: "'Raleway',sans-serif", fontSize: 13, outline: "none" }} />
      {error && <div style={errText}>{error}</div>}
    </div>
  );
}
const errText = { fontFamily: "'Raleway',sans-serif", fontSize: 11, color: "#ff8a8a", marginTop: 4 };
const savedChip = { textAlign: "left", padding: "8px 12px", borderRadius: 8, cursor: "pointer", background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.22)", fontFamily: "'Raleway',sans-serif", fontSize: 12 };
const addrBox = { padding: 22, marginBottom: 30, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.18)", borderRadius: 10 };
const twoCol = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

/** Map a saved address-book entry → the checkout form shape. */
function pickAddr(a) {
  return {
    name: a.name || "", phone: a.phone || "",
    line1: a.line1 || "", line2: a.line2 || "",
    city: a.city || "", state: a.state || "", zip: a.zip || "", country: a.country || "India",
  };
}
/** True when an equivalent address is already saved (avoid duplicates). */
function addressInBook(book, a) {
  return book.some((x) => (x.line1 || "") === (a.line1 || "") && (x.zip || "") === (a.zip || "") && (x.city || "") === (a.city || ""));
}
