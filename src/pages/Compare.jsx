import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SafeImage from "../components/SafeImage";
import { api } from "../utils/api";
import { useLocale } from "../context/Locale";
import {
  getCompare,
  removeCompare,
  clearCompare,
  onCompareChange,
} from "../utils/compareStore";

const gold = "#D4AF37";

export default function Compare() {
  const { formatPrice } = useLocale();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    const ids = getCompare();
    if (ids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(ids.map((id) => api.catalog.artwork(id).catch(() => null)))
      .then((rows) => setItems(rows.filter(Boolean)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    return onCompareChange(load);
  }, []);

  const priceCell = (a) =>
    a.customizable
      ? a.price_per_unit
        ? `${formatPrice(a.price_per_unit)} / ${a.unit || "unit"}²`
        : "On enquiry"
      : formatPrice(a.price);

  const ROWS = [
    ["Artist", (a) => a.artist_name || "—"],
    ["Price", priceCell],
    ["Type", (a) => (a.customizable ? "Made to size" : "Fixed size")],
    ["Dimensions", (a) => a.base_dimensions || "—"],
    ["Medium", (a) => a.medium || "—"],
    ["Category", (a) => a.category_id || "—"],
    ["Availability", (a) => (a.in_stock === false ? "Reserved" : "Available")],
  ];

  return (
    <section
      style={{ padding: "110px 24px 80px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 46,
            fontWeight: 700,
            color: "#fff",
            marginTop: 6,
          }}>
          Comparing Side by Side
        </h1>
        {items.length > 0 && (
          <button
            onClick={() => clearCompare()}
            style={{
              marginTop: 10,
              background: "transparent",
              border: "1px solid rgba(212,175,55,0.3)",
              color: gold,
              borderRadius: 999,
              padding: "8px 18px",
              fontFamily: "'Cinzel',serif",
              fontSize: 10,
              letterSpacing: "0.16em",
              cursor: "pointer",
            }}>
            CLEAR ALL
          </button>
        )}
      </div>

      {loading ? (
        <div
          style={{
            color: "rgba(200,191,160,0.6)",
            fontFamily: "'Raleway',sans-serif",
          }}>
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            padding: "80px 30px",
            textAlign: "center",
            border: "1px solid rgba(212,175,55,0.15)",
            borderRadius: 12,
          }}>
          <div
            style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: 28,
              color: "#fff",
              marginBottom: 12,
            }}>
            Nothing to compare yet
          </div>
          <p
            style={{
              fontFamily: "'Raleway',sans-serif",
              fontSize: 14,
              color: "rgba(200,191,160,0.6)",
              marginBottom: 24,
            }}>
            Tick the <strong style={{ color: gold }}>Compare</strong> box on any
            gallery piece to line them up here.
          </p>
          <Link
            to="/categories"
            className="btn-gold-main"
            style={{
              textDecoration: "none",
              padding: "14px 30px",
              fontSize: 12,
            }}>
            BROWSE COLLECTION
          </Link>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `160px repeat(${items.length}, minmax(220px, 1fr))`,
              gap: 0,
              minWidth: 520,
            }}>
            {/* header row: images + titles */}
            <div />
            {items.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: 14,
                  borderLeft: "1px solid rgba(212,175,55,0.12)",
                }}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: 10,
                    overflow: "hidden",
                    border: "1px solid rgba(212,175,55,0.2)",
                    marginBottom: 12,
                  }}>
                  <SafeImage
                    src={a.images?.[0]}
                    alt={a.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                  <button
                    onClick={() => removeCompare(a.id)}
                    title="Remove"
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)",
                      border: "1px solid rgba(212,175,55,0.4)",
                      color: gold,
                      cursor: "pointer",
                    }}>
                    ×
                  </button>
                </div>
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond',serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1.15,
                  }}>
                  {a.title}
                </div>
                <Link
                  to={`/product/${a.id}`}
                  style={{
                    fontFamily: "'Cinzel',serif",
                    fontSize: 9,
                    letterSpacing: "0.16em",
                    color: gold,
                    textDecoration: "none",
                  }}>
                  VIEW →
                </Link>
              </div>
            ))}

            {/* attribute rows */}
            {ROWS.map(([label, fn], ri) => (
              <Row
                key={label}
                label={label}
                cells={items.map((a) => fn(a))}
                zebra={ri % 2 === 0}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Row({ label, cells, zebra }) {
  const bg = zebra ? "rgba(255,255,255,0.02)" : "transparent";
  return (
    <>
      <div
        style={{
          padding: "14px 12px",
          background: bg,
          fontFamily: "'Cinzel',serif",
          fontSize: 10,
          letterSpacing: "0.14em",
          color: "rgba(212,175,55,0.75)",
        }}>
        {label.toUpperCase()}
      </div>
      {cells.map((c, i) => (
        <div
          key={i}
          style={{
            padding: "14px 14px",
            background: bg,
            borderLeft: "1px solid rgba(212,175,55,0.12)",
            fontFamily: "'Raleway',sans-serif",
            fontSize: 14,
            color: "#e8e0d0",
          }}>
          {c}
        </div>
      ))}
    </>
  );
}
