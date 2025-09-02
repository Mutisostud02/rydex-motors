import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const FALLBACK =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='100%25' height='100%25' fill='%23eef3f8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2390a4b8' font-family='Arial' font-size='18'%3ENo image%3C/text%3E%3C/svg%3E";
const PHONE = "020207333";
const EMAIL = "info@rydexmotorsltd.co.ke";

export default function BikeDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/bikes.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load bikes");
        const data = await res.json();
        const found = (Array.isArray(data) ? data : []).find(
          (v) => String(v.id) === decodeURIComponent(id)
        );
        if (!found) throw new Error("Bike not found");
        if (mounted) setItem(found);
      } catch {
        if (mounted) setError("Could not load bike.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading)
    return (
      <section className="section">
        <div className="container">
          <p>Loading…</p>
        </div>
      </section>
    );
  if (error || !item)
    return (
      <section className="section">
        <div className="container">
          <p>{error || "Not found"}</p>
        </div>
      </section>
    );

  const subject = encodeURIComponent(`Enquiry: ${item.title}`);
  const body = encodeURIComponent(
    `Hello Rydex Motors,%0D%0A%0D%0AI am interested in ${item.title} (${item.price}). Please share availability and next steps.%0D%0A%0D%0AThank you.`
  );
  const emailLink = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

  return (
    <section className="section">
      <div className="container">
        <h2>{item.title}</h2>
        <div className="detail-grid">
          <div className="image-box">
            <img
              src={item.image}
              alt={item.title}
              onError={(e) => {
                if (e.currentTarget.src !== FALLBACK)
                  e.currentTarget.src = FALLBACK;
              }}
            />
          </div>
          <div className="detail-info">
            <p className="price">{item.price}</p>
            <p className="tag">{item.tag}</p>
            {item.description && (
              <p style={{ marginTop: 8 }}>{item.description}</p>
            )}
            <div className="hero-cta" style={{ marginTop: 12 }}>
              <a className="btn primary" href={emailLink}>
                Message
              </a>
              <a className="btn" href={`tel:${PHONE}`}>
                Call now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
