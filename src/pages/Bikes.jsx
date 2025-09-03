import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const FALLBACK =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360' viewBox='0 0 640 360'%3E%3Crect width='100%25' height='100%25' fill='%23eef3f8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2390a4b8' font-family='Arial' font-size='18'%3ENo image%3C/text%3E%3C/svg%3E";
const EMAIL = "info@rydexmotorsltd.co.ke";
const PHONE = "020207333";

export default function Bikes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wanted, setWanted] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/bikes.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load bikes");
        const data = await res.json();
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setError("Could not load bikes.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const emailLink = (() => {
    const subject = encodeURIComponent("Motorbike enquiry (not listed)");
    const body = encodeURIComponent(
      `Hello Rydex Motors,%0D%0A%0D%0AI am looking for: ${
        wanted || "<add motorbike>"
      }. Please advise availability.%0D%0A%0D%0AThank you.`
    );
    return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  })();

  return (
    <section className="section">
      <div className="container">
        <h2>Bikes</h2>

        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>
            Can’t find a specific motorbike?
          </h3>
          <div
            className="fields"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 260px 140px",
              gap: 10,
            }}
          >
            <input
              type="text"
              placeholder="e.g. Yamaha MT-07, Suzuki GSX-R..."
              value={wanted}
              onChange={(e) => setWanted(e.target.value)}
              style={{
                padding: "10px 12px",
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            />
            <a className="btn primary" href={emailLink}>
              Message
            </a>
            <a className="btn" href={`tel:${PHONE}`}>
              Call now
            </a>
          </div>
        </div>

        {loading && <p>Loading…</p>}
        {error && <p>{error}</p>}
        <div className="vehicle-grid">
          {items.map((v) => (
            <Link
              key={v.id}
              to={`/bikes/${encodeURIComponent(v.id)}`}
              className="vehicle-card"
            >
              <img
                className="thumb"
                src={v.image}
                alt={v.title}
                loading="lazy"
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK)
                    e.currentTarget.src = FALLBACK;
                }}
              />
              <div className="vehicle-info">
                <h3>{v.title}</h3>
                <p className="price">
                  {v?.price && String(v.price).trim().length
                    ? v.price
                    : "Price on request"}
                </p>
                <p className="tag">{v.tag}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
