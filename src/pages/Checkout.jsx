import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import SafeImage from "../components/SafeImage";
import { CopyIcon, CheckIcon } from "../components/Icons";
import { useLocale } from "../context/Locale";
import { getCart, setCart as persistCart } from "../utils/cartStore";
import { supabase } from "../utils/supabase";
import { useAuth } from "../context/Auth";

// Razorpay load script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
};

const TIMELINE = [
  { state: "active", label: "ORDER CONFIRMED", time: "Just now" },
  { state: "pending", label: "CURATION & CRATING", time: "Within 24 hours" },
  {
    state: "pending",
    label: "DISPATCHED VIA GLOBAL EXPRESS",
    time: "Estimated in 2 days",
  },
  {
    state: "pending",
    label: "OUT FOR WHITE-GLOVE DELIVERY",
    time: "Estimated in 5–6 days",
  },
  {
    state: "pending",
    label: "FINAL INSTALLATION",
    time: "Estimated in 7 days",
  },
];

const PAY_METHODS = [
  { id: "upi", label: "UPI / QR Code", desc: "Scan & pay instantly" },
  { id: "card", label: "Credit / Debit Card", desc: "Visa, Mastercard, Amex" },
  { id: "cod", label: "Cash on Delivery", desc: "Pay our courier on arrival" },
];

const fmtId = () => "AU-" + Math.floor(10000 + Math.random() * 89999);
const fmtTrack = () =>
  "AUR-" +
  Math.floor(1000 + Math.random() * 8999) +
  "-" +
  String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
  String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
  "X-0" +
  Math.floor(1 + Math.random() * 8);

export default function Checkout() {
  const navigate = useNavigate();
  const { formatPrice } = useLocale();
  const { user } = useAuth();

  const [items, setItems] = useState(() =>
    getCart().map((c) => ({ ...c, qty: 1 })),
  );
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });
  const [pay, setPay] = useState("upi");
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState(fmtId);
  const [submitting, setSubmitting] = useState(false);
  const [trackingId] = useState(fmtTrack);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  /* keep localStorage cart in sync (without qty) */
  useEffect(() => {
    if (!placed) persistCart(items.map(({ qty, ...rest }) => rest));
  }, [items, placed]);

  const remove = (id) => setItems(items.filter((i) => i.id !== id));
  const setQty = (id, qty) => {
    if (qty < 1) return;
    setItems(items.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const subtotal = items.reduce(
    (s, i) => s + (Number(i.price) || 0) * i.qty,
    0,
  );
  const shipping = 0;
  const total = subtotal + shipping;

  const addressValid =
    address.name.trim() &&
    address.phone.trim() &&
    address.line1.trim() &&
    address.city.trim() &&
    address.zip.trim();

  const placeOrder = async () => {
    if (!items.length || !addressValid || submitting) return;
    setSubmitting(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        email: user?.email ?? null,
        full_name: address.name,
        phone: address.phone,
        shipping_address: address,
        subtotal,
        total,
        status: "pending",
        payment_provider: pay === "card" ? "razorpay" : pay,
      })
      .select()
      .single();
    if (error || !order) {
      setSubmitting(false);
      alert(error?.message || "Could not place order");
      return;
    }
    const lineItems = items.map((it) => ({
      order_id: order.id,
      artwork_id: it.id,
      title: it.title,
      price: it.price,
      qty: it.qty,
    }));
    const { error: itemErr } = await supabase
      .from("order_items")
      .insert(lineItems);
    if (itemErr) {
      setSubmitting(false);
      alert(itemErr.message);
      return;
    }

    // If paying with card/razorpay, initiate payment
    if (pay === "card" || pay === "upi") {
      try {
        const Razorpay = await loadRazorpay();
        if (!Razorpay) {
          alert("Failed to load payment gateway. Please try again.");
          setSubmitting(false);
          return;
        }

        // Call Edge Function to create Razorpay order
        const { data: paymentData, error: paymentError } =
          await supabase.functions.invoke("create-payment", {
            body: { order_id: order.id },
          });

        if (paymentError || !paymentData) {
          console.error("Payment error:", paymentError);
          // Continue without payment for now (fallback to pending)
        } else {
          // Open Razorpay checkout
          const razorpay = new Razorpay({
            key: paymentData.key_id,
            order_id: paymentData.razorpay_order_id,
            amount: paymentData.amount,
            currency: paymentData.currency,
            name: "Art Coliseum",
            description: `Order #${order.id.slice(0, 8).toUpperCase()}`,
            image: "https://your-domain.com/logo.png",
            handler: async (response) => {
              // Payment successful - verify and update order
              try {
                await supabase.functions.invoke("verify-payment", {
                  body: {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    order_id: order.id,
                  },
                });
              } catch (e) {
                console.error("Payment verification error:", e);
              }
            },
            modal: {
              ondismiss: () => {
                // User closed without paying - order stays pending
                console.log("Payment modal dismissed");
              },
            },
          });
          razorpay.open();
        }
      } catch (paymentErr) {
        console.error("Payment initialization error:", paymentErr);
        // Continue with pending order
      }
    }

    setOrderId(order.id.slice(0, 8).toUpperCase());
    setPlaced(true);
    persistCart([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSubmitting(false);
  };

  /* ───── PLACED VIEW (tracking) ───── */
  if (placed) {
    return (
      <section
        style={{
          padding: "100px 24px 80px",
          maxWidth: 1200,
          margin: "0 auto",
        }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="order-modal-tick" style={{ margin: "0 auto 18px" }}>
            <CheckIcon size={32} />
          </div>
          <div
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "#D4AF37",
              marginBottom: 10,
            }}>
            ORDER PLACED
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 48,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.1,
              marginBottom: 14,
            }}>
            Thank you, {address.name.split(" ")[0] || "Collector"}
          </h1>
          <p
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 14,
              color: "rgba(200,191,160,0.65)",
              maxWidth: 540,
              margin: "0 auto",
              lineHeight: 1.7,
            }}>
            Your order{" "}
            <span className="num-value" style={{ color: "#D4AF37" }}>
              #{orderId}
            </span>{" "}
            has been confirmed. We've sent a confirmation to your registered
            details and our curator will be in touch within 24 hours.
          </p>
        </motion.div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 36 }}
          className="ck-grid">
          {/* Tracking */}
          <div
            style={{
              padding: "30px 28px",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: 12,
              background: "rgba(255,255,255,0.02)",
            }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}>
              <span
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  color: "#D4AF37",
                }}>
                ORDER TRACKING
              </span>
              <span
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  fontFamily: "'Cinzel',serif",
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  background: "rgba(212,175,55,0.1)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  color: "#D4AF37",
                }}>
                CONFIRMED
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond',serif",
                fontSize: 26,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 24,
              }}>
              Order #{orderId}
            </h2>

            <div style={{ position: "relative", marginBottom: 26 }}>
              {TIMELINE.map((t, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    paddingBottom: i !== TIMELINE.length - 1 ? 22 : 0,
                    position: "relative",
                  }}>
                  {i !== TIMELINE.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        left: 11,
                        top: 24,
                        bottom: 0,
                        width: 1,
                        background:
                          t.state === "done"
                            ? "#D4AF37"
                            : "rgba(212,175,55,0.2)",
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        t.state === "done" || t.state === "active"
                          ? "#D4AF37"
                          : "rgba(212,175,55,0.15)",
                      color:
                        t.state === "done" || t.state === "active"
                          ? "#111"
                          : "rgba(200,191,160,0.4)",
                      fontSize: 10,
                      fontWeight: 700,
                      boxShadow:
                        t.state === "active"
                          ? "0 0 0 4px rgba(212,175,55,0.2)"
                          : "none",
                    }}>
                    {t.state === "done" ? "✓" : t.state === "active" ? "●" : ""}
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Cinzel',serif",
                        fontSize: 10,
                        letterSpacing: "0.16em",
                        color:
                          t.state === "active"
                            ? "#D4AF37"
                            : t.state === "done"
                              ? "#e8e0d0"
                              : "rgba(200,191,160,0.45)",
                      }}>
                      {t.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Raleway',sans-serif",
                        fontSize: 11,
                        color: "rgba(200,191,160,0.5)",
                        marginTop: 4,
                      }}>
                      {t.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                height: 1,
                background: "rgba(212,175,55,0.18)",
                margin: "0 0 18px",
              }}
            />

            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  color: "rgba(200,191,160,0.55)",
                  marginBottom: 6,
                }}>
                TRACKING ID
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <div
                  className="num-value"
                  style={{
                    fontFamily: "'Raleway',sans-serif",
                    fontSize: 14,
                    color: "#D4AF37",
                    letterSpacing: "0.1em",
                  }}>
                  {trackingId}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(trackingId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#D4AF37",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "'Cinzel',serif",
                    fontSize: 9,
                    letterSpacing: "0.16em",
                  }}>
                  <CopyIcon size={14} />
                  {copied && <span>COPIED</span>}
                </button>
              </div>
            </div>

            <button
              onClick={() => setHistoryOpen(true)}
              style={{
                width: "100%",
                padding: "13px",
                marginTop: 8,
                background: "transparent",
                border: "1px solid rgba(212,175,55,0.3)",
                color: "#e8e0d0",
                fontFamily: "'Cinzel',serif",
                fontSize: 11,
                letterSpacing: "0.18em",
                borderRadius: 6,
                cursor: "pointer",
              }}>
              VIEW DETAILED HISTORY
            </button>
          </div>

          {/* Summary */}
          <div
            style={{
              padding: "30px 28px",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: 12,
              background: "rgba(255,255,255,0.02)",
              height: "fit-content",
            }}>
            <div
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: 11,
                letterSpacing: "0.18em",
                color: "#D4AF37",
                marginBottom: 18,
              }}>
              ORDER SUMMARY
            </div>

            {items.map((it) => (
              <div
                key={it.id}
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 14,
                  alignItems: "center",
                }}>
                <SafeImage
                  src={it.img}
                  alt={it.title}
                  style={{
                    width: 50,
                    height: 50,
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontSize: 16,
                      color: "#fff",
                    }}>
                    {it.title}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Raleway',sans-serif",
                      fontSize: 11,
                      color: "rgba(200,191,160,0.55)",
                    }}>
                    Qty: <span className="num-value">{it.qty}</span>
                  </div>
                </div>
                <div
                  className="num-value"
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#D4AF37",
                  }}>
                  {formatPrice((it.price || 0) * it.qty)}
                </div>
              </div>
            ))}

            <div
              style={{
                height: 1,
                background: "rgba(212,175,55,0.18)",
                margin: "16px 0",
              }}
            />

            <Row label="Subtotal" value={formatPrice(subtotal)} />
            <Row
              label="Delivery"
              value={<span style={{ color: "#D4AF37" }}>Included</span>}
            />
            <Row
              label="Payment"
              value={PAY_METHODS.find((p) => p.id === pay)?.label}
            />

            <div
              style={{
                height: 1,
                background: "rgba(212,175,55,0.18)",
                margin: "16px 0",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 22,
              }}>
              <span
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  color: "#fff",
                }}>
                TOTAL PAID
              </span>
              <span
                className="num-value"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "#D4AF37",
                }}>
                {formatPrice(total)}
              </span>
            </div>

            <div
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "rgba(200,191,160,0.55)",
                marginBottom: 6,
              }}>
              SHIPPING TO
            </div>
            <div
              style={{
                fontFamily: "'Raleway',sans-serif",
                fontSize: 13,
                color: "#e8e0d0",
                lineHeight: 1.55,
                marginBottom: 18,
              }}>
              {address.name}
              <br />
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}
              <br />
              {address.city}, {address.state} {address.zip}
              <br />
              {address.country} ·{" "}
              <span className="num-value">{address.phone}</span>
            </div>

            <button
              onClick={() => navigate("/")}
              style={{
                width: "100%",
                padding: "13px",
                background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
                color: "#111",
                fontFamily: "'Cinzel',serif",
                fontSize: 11,
                letterSpacing: "0.18em",
                border: "none",
                borderRadius: 999,
                cursor: "pointer",
              }}>
              CONTINUE BROWSING →
            </button>
          </div>
        </div>

        <HistoryModal
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
          orderId={orderId}
          trackingId={trackingId}
        />

        <style>{`@media (max-width: 900px){.ck-grid{grid-template-columns:1fr!important}}`}</style>
      </section>
    );
  }

  /* ───── CHECKOUT VIEW ───── */
  return (
    <section
      style={{ padding: "100px 24px 80px", maxWidth: 1280, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "#D4AF37",
            marginBottom: 10,
          }}>
          CHECKOUT
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 48,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.1,
            marginBottom: 14,
          }}>
          Place Your Order
        </h1>
        <p
          style={{
            fontFamily: "'Raleway',sans-serif",
            fontSize: 14,
            color: "rgba(200,191,160,0.6)",
            maxWidth: 540,
            margin: "0 auto",
            lineHeight: 1.7,
          }}>
          Confirm your acquisitions, where to send them, and how to pay.
        </p>
      </motion.div>

      {items.length === 0 ? (
        <div
          style={{
            padding: 80,
            textAlign: "center",
            border: "1px solid rgba(212,175,55,0.18)",
            borderRadius: 12,
          }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 26,
              color: "#fff",
              marginBottom: 12,
            }}>
            Your cart is empty
          </div>
          <button
            onClick={() => navigate("/categories")}
            style={{
              marginTop: 14,
              padding: "13px 28px",
              background: "linear-gradient(135deg,#D4AF37,#e8c53a)",
              color: "#111",
              border: "none",
              borderRadius: 999,
              cursor: "pointer",
              fontFamily: "'Cinzel',serif",
              fontSize: 11,
              letterSpacing: "0.18em",
            }}>
            BROWSE COLLECTION
          </button>
        </div>
      ) : (
        <div
          style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 36 }}
          className="ck-grid">
          {/* LEFT — items, address, payment */}
          <div>
            <SectionLabel>SELECTED ARTWORKS</SectionLabel>
            <div style={{ marginBottom: 36 }}>
              {items.map((it, i) => (
                <div
                  key={it.id}
                  style={{
                    display: "flex",
                    gap: 22,
                    alignItems: "center",
                    padding: "20px 0",
                    borderBottom:
                      i !== items.length - 1
                        ? "1px solid rgba(212,175,55,0.15)"
                        : "none",
                  }}>
                  <SafeImage
                    src={it.img}
                    alt={it.title}
                    style={{
                      width: 86,
                      height: 86,
                      objectFit: "cover",
                      borderRadius: 4,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "'Cinzel',serif",
                        fontSize: 10,
                        letterSpacing: "0.16em",
                        color: "rgba(200,191,160,0.55)",
                      }}>
                      {(it.artist || "").toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#fff",
                        marginTop: 4,
                      }}>
                      {it.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Raleway',sans-serif",
                        fontSize: 12,
                        color: "rgba(200,191,160,0.55)",
                        marginTop: 4,
                      }}>
                      {it.desc}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 8,
                    }}>
                    <div
                      className="num-value"
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#D4AF37",
                      }}>
                      {formatPrice((it.price || 0) * it.qty)}
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0,
                        border: "1px solid rgba(212,175,55,0.3)",
                        borderRadius: 999,
                        overflow: "hidden",
                      }}>
                      <button
                        onClick={() => setQty(it.id, it.qty - 1)}
                        style={qtyBtn}>
                        −
                      </button>
                      <span
                        className="num-value"
                        style={{
                          minWidth: 30,
                          textAlign: "center",
                          padding: "0 4px",
                          fontFamily: "'Raleway',sans-serif",
                          fontSize: 13,
                          color: "#fff",
                        }}>
                        {it.qty}
                      </span>
                      <button
                        onClick={() => setQty(it.id, it.qty + 1)}
                        style={qtyBtn}>
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => remove(it.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "'Cinzel',serif",
                        fontSize: 9,
                        letterSpacing: "0.18em",
                        color: "rgba(200,191,160,0.55)",
                      }}>
                      REMOVE
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery address */}
            <SectionLabel>DELIVERY ADDRESS</SectionLabel>
            <div style={addrBox}>
              <div style={twoCol}>
                <Input
                  label="Full Name *"
                  value={address.name}
                  onChange={(v) => setAddress({ ...address, name: v })}
                />
                <Input
                  label="Phone *"
                  value={address.phone}
                  onChange={(v) => setAddress({ ...address, phone: v })}
                  type="tel"
                />
              </div>
              <Input
                label="Address Line 1 *"
                value={address.line1}
                onChange={(v) => setAddress({ ...address, line1: v })}
              />
              <Input
                label="Address Line 2"
                value={address.line2}
                onChange={(v) => setAddress({ ...address, line2: v })}
              />
              <div style={twoCol}>
                <Input
                  label="City *"
                  value={address.city}
                  onChange={(v) => setAddress({ ...address, city: v })}
                />
                <Input
                  label="State"
                  value={address.state}
                  onChange={(v) => setAddress({ ...address, state: v })}
                />
              </div>
              <div style={twoCol}>
                <Input
                  label="ZIP / Postal Code *"
                  value={address.zip}
                  onChange={(v) => setAddress({ ...address, zip: v })}
                />
                <Input
                  label="Country"
                  value={address.country}
                  onChange={(v) => setAddress({ ...address, country: v })}
                />
              </div>
            </div>

            {/* Payment */}
            <SectionLabel>PAYMENT METHOD</SectionLabel>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 18,
              }}>
              {PAY_METHODS.map((m) => (
                <label
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    background:
                      pay === m.id
                        ? "rgba(212,175,55,0.08)"
                        : "rgba(255,255,255,0.02)",
                    border:
                      pay === m.id
                        ? "1px solid #D4AF37"
                        : "1px solid rgba(212,175,55,0.18)",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}>
                  <input
                    type="radio"
                    name="pay"
                    checked={pay === m.id}
                    onChange={() => setPay(m.id)}
                    style={{ accentColor: "#D4AF37" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "'Cinzel',serif",
                        fontSize: 12,
                        letterSpacing: "0.14em",
                        color: "#fff",
                      }}>
                      {m.label.toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Raleway',sans-serif",
                        fontSize: 11,
                        color: "rgba(200,191,160,0.55)",
                        marginTop: 3,
                      }}>
                      {m.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {pay === "upi" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  padding: 22,
                  background: "rgba(212,175,55,0.05)",
                  border: "1px dashed rgba(212,175,55,0.3)",
                  borderRadius: 10,
                  marginBottom: 18,
                }}>
                <QRPlaceholder value={`UPI:aureum@bank?am=${total}&cu=INR`} />
                <div>
                  <div
                    style={{
                      fontFamily: "'Cinzel',serif",
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      color: "#D4AF37",
                      marginBottom: 6,
                    }}>
                    SCAN TO PAY
                  </div>
                  <div
                    className="num-value"
                    style={{
                      fontFamily: "'Cormorant Garamond',serif",
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#fff",
                    }}>
                    {formatPrice(total)}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Raleway',sans-serif",
                      fontSize: 11,
                      color: "rgba(200,191,160,0.6)",
                      marginTop: 6,
                    }}>
                    UPI ID:{" "}
                    <span className="num-value" style={{ color: "#D4AF37" }}>
                      aureum@bank
                    </span>
                  </div>
                </div>
              </div>
            )}
            {pay === "card" && (
              <div
                style={{
                  padding: 18,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(212,175,55,0.18)",
                  borderRadius: 10,
                  marginBottom: 18,
                }}>
                <Input
                  label="Card Number"
                  type="tel"
                  value=""
                  onChange={() => {}}
                  placeholder="•••• •••• •••• ••••"
                />
                <div style={twoCol}>
                  <Input
                    label="Expiry"
                    type="tel"
                    value=""
                    onChange={() => {}}
                    placeholder="MM / YY"
                  />
                  <Input
                    label="CVV"
                    type="tel"
                    value=""
                    onChange={() => {}}
                    placeholder="•••"
                  />
                </div>
              </div>
            )}
            {pay === "cod" && (
              <div
                style={{
                  padding: 18,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(212,175,55,0.18)",
                  borderRadius: 10,
                  marginBottom: 18,
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 13,
                  color: "rgba(200,191,160,0.7)",
                  lineHeight: 1.65,
                }}>
                Pay our white-glove courier on arrival. We accept cash and
                contactless cards. A government-issued ID may be requested at
                delivery.
              </div>
            )}
          </div>

          {/* RIGHT — summary */}
          <div
            style={{
              padding: "30px 28px",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: 12,
              background: "rgba(255,255,255,0.02)",
              height: "fit-content",
              position: "sticky",
              top: 100,
            }}>
            <div
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: 11,
                letterSpacing: "0.18em",
                color: "#D4AF37",
                marginBottom: 18,
              }}>
              ORDER SUMMARY
            </div>

            <Row
              label={`Subtotal (${items.length} ${items.length === 1 ? "piece" : "pieces"})`}
              value={formatPrice(subtotal)}
            />
            <Row
              label="White-glove delivery"
              value={<span style={{ color: "#D4AF37" }}>Included</span>}
            />

            <div
              style={{
                height: 1,
                background: "rgba(212,175,55,0.18)",
                margin: "16px 0",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 24,
              }}>
              <span
                style={{
                  fontFamily: "'Cinzel',serif",
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  color: "#fff",
                }}>
                TOTAL
              </span>
              <span
                className="num-value"
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#D4AF37",
                }}>
                {formatPrice(total)}
              </span>
            </div>

            <motion.button
              onClick={placeOrder}
              disabled={!addressValid}
              whileHover={addressValid ? { scale: 1.02 } : {}}
              whileTap={addressValid ? { scale: 0.98 } : {}}
              style={{
                width: "100%",
                padding: "16px",
                background: addressValid
                  ? "linear-gradient(135deg,#D4AF37,#e8c53a)"
                  : "rgba(212,175,55,0.25)",
                color: addressValid ? "#111" : "rgba(255,255,255,0.5)",
                fontFamily: "'Cinzel',serif",
                fontSize: 12,
                letterSpacing: "0.2em",
                border: "none",
                borderRadius: 999,
                cursor: addressValid ? "pointer" : "not-allowed",
                boxShadow: addressValid
                  ? "0 8px 24px rgba(212,175,55,0.25)"
                  : "none",
              }}>
              PLACE ORDER →
            </motion.button>

            {!addressValid && (
              <div
                style={{
                  marginTop: 10,
                  fontFamily: "'Raleway',sans-serif",
                  fontSize: 11,
                  color: "rgba(200,191,160,0.5)",
                  textAlign: "center",
                }}>
                Fill in delivery address to continue
              </div>
            )}

            <div
              style={{
                marginTop: 18,
                paddingTop: 16,
                borderTop: "1px dashed rgba(212,175,55,0.2)",
                fontFamily: "'Raleway',sans-serif",
                fontSize: 11,
                color: "rgba(200,191,160,0.55)",
                lineHeight: 1.65,
                textAlign: "center",
              }}>
              Secure checkout · Provenance ledger · 30-day return on undamaged
              works
            </div>
          </div>
        </div>
      )}

      <style>{`@media (max-width: 900px){.ck-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

/* ── helpers ── */
function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: "'Cinzel',serif",
        fontSize: 11,
        letterSpacing: "0.18em",
        color: "#D4AF37",
        marginBottom: 14,
      }}>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 10,
        fontFamily: "'Raleway',sans-serif",
        fontSize: 13,
        color: "rgba(200,191,160,0.75)",
      }}>
      <span>{label}</span>
      <span className="num-value" style={{ color: "#fff" }}>
        {value}
      </span>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontFamily: "'Cinzel',serif",
          fontSize: 9,
          letterSpacing: "0.16em",
          color: "rgba(200,191,160,0.55)",
          marginBottom: 5,
        }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "11px 14px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: 6,
          color: "#e8e0d0",
          fontFamily: "'Raleway',sans-serif",
          fontSize: 13,
          outline: "none",
        }}
      />
    </div>
  );
}

const qtyBtn = {
  width: 28,
  height: 28,
  background: "transparent",
  border: "none",
  color: "#D4AF37",
  cursor: "pointer",
  fontSize: 16,
  lineHeight: 1,
};
const addrBox = {
  padding: 22,
  marginBottom: 30,
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(212,175,55,0.18)",
  borderRadius: 10,
};
const twoCol = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };

/* ── QR placeholder (CSS-art faux QR) ── */
function QRPlaceholder({ value }) {
  // deterministic dot pattern from the value
  const cells = 17;
  const seed = (value || "x")
    .split("")
    .reduce((s, c) => s + c.charCodeAt(0), 0);
  const dots = [];
  for (let i = 0; i < cells * cells; i++) {
    const on = Math.sin(seed + i * 13.7) + Math.cos(seed * 0.3 + i) > 0.2;
    dots.push(on);
  }
  return (
    <div
      style={{
        width: 130,
        height: 130,
        padding: 8,
        background: "#fff",
        borderRadius: 8,
        flexShrink: 0,
        display: "grid",
        gridTemplateColumns: `repeat(${cells}, 1fr)`,
      }}>
      {dots.map((on, i) => (
        <div key={i} style={{ background: on ? "#0a0807" : "transparent" }} />
      ))}
    </div>
  );
}

function HistoryModal({ open, onClose, orderId, trackingId }) {
  const log = [
    {
      time: "Just now",
      title: "Order Confirmed",
      detail: `Order #${orderId} received. Payment authorised.`,
    },
    {
      time: "Within 24 hrs",
      title: "Curator Assigned",
      detail:
        "Senior curator will be assigned to oversee crating and shipment.",
    },
    {
      time: "+1 day",
      title: "Condition Report",
      detail: "Pre-shipment condition photographs added to digital ledger.",
    },
    {
      time: "+1 day",
      title: "Crating Complete",
      detail: "Climate-controlled crate sealed at our vault.",
    },
    {
      time: "+2 days",
      title: "Customs Cleared",
      detail: "Export documentation filed and approved.",
    },
    {
      time: "+2 days",
      title: "Dispatched",
      detail: `Handed to Art Coliseum Logistics. Tracking ID: ${trackingId}.`,
    },
  ];
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 5000,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            overflowY: "auto",
          }}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            style={{
              background: "#0e0c0a",
              border: "1px solid rgba(212,175,55,0.25)",
              borderRadius: 14,
              padding: "32px 32px 28px",
              width: "100%",
              maxWidth: 580,
            }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 22,
              }}>
              <div>
                <div
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    color: "#D4AF37",
                    marginBottom: 6,
                  }}>
                  SHIPMENT HISTORY
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 26,
                    fontWeight: 700,
                    color: "#fff",
                  }}>
                  Order #{orderId}
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "transparent",
                  border: "1px solid rgba(212,175,55,0.25)",
                  color: "#D4AF37",
                  cursor: "pointer",
                  fontSize: 16,
                }}>
                ×
              </button>
            </div>
            <div
              style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: 4 }}>
              {log.map((h, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    paddingBottom: i !== log.length - 1 ? 18 : 0,
                    position: "relative",
                  }}>
                  {i !== log.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        left: 5,
                        top: 18,
                        bottom: 0,
                        width: 1,
                        background: "rgba(212,175,55,0.2)",
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: i === 0 ? "#D4AF37" : "rgba(212,175,55,0.45)",
                      flexShrink: 0,
                      marginTop: 6,
                      boxShadow:
                        i === 0 ? "0 0 0 4px rgba(212,175,55,0.18)" : "none",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      className="num-value"
                      style={{
                        fontFamily: "'Raleway',sans-serif",
                        fontSize: 11,
                        color: "rgba(200,191,160,0.55)",
                        letterSpacing: "0.05em",
                      }}>
                      {h.time}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond',serif",
                        fontSize: 17,
                        fontWeight: 600,
                        color: "#fff",
                        marginTop: 3,
                      }}>
                      {h.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Raleway',sans-serif",
                        fontSize: 12,
                        color: "rgba(200,191,160,0.65)",
                        lineHeight: 1.6,
                        marginTop: 4,
                      }}>
                      {h.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
