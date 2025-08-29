import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

const BUDGETS = [
  { id: "", label: "Any budget", min: 0, max: Infinity },
  { id: "0-500k", label: "0 - 500K", min: 0, max: 500_000 },
  { id: "500k-1m", label: "500K - 1M", min: 500_000, max: 1_000_000 },
  { id: "1m-2m", label: "1M - 2M", min: 1_000_000, max: 2_000_000 },
  { id: "2m-3m", label: "2M - 3M", min: 2_000_000, max: 3_000_000 },
  { id: "3m-5m", label: "3M - 5M", min: 3_000_000, max: 5_000_000 },
  { id: "5m-10m", label: "5M - 10M", min: 5_000_000, max: 10_000_000 },
  { id: "10m+", label: "Above 10M", min: 10_000_000, max: Infinity },
];

function parsePriceToNumber(price) {
  const text = String(price).toUpperCase();
  if (text.includes("M"))
    return parseFloat(text.replace(/[^0-9.]/g, "")) * 1_000_000;
  if (text.includes("K"))
    return parseFloat(text.replace(/[^0-9.]/g, "")) * 1_000;
  return parseFloat(text.replace(/[^0-9.]/g, ""));
}

const ALL_BRANDS = [
  "Toyota",
  "Mazda",
  "Subaru",
  "Nissan",
  "BMW",
  "Mercedes",
  "Lexus",
  "Porsche",
  "Land Rover",
  "Chevrolet",
];

const ALL_BODY_TYPES = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Pickup",
  "Convertible",
  "Van",
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [availability, setAvailability] = useState(
    searchParams.get("availability") || "both"
  );
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [budgetId, setBudgetId] = useState(searchParams.get("budget") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [bodyType, setBodyType] = useState(searchParams.get("body") || "");

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/vehicles.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load vehicles");
        const data = await res.json();
        if (mounted) setVehicles(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setError("Could not load vehicles.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Persist filters to URL
  useEffect(() => {
    const next = new URLSearchParams();
    if (availability && availability !== "both")
      next.set("availability", availability);
    if (query) next.set("q", query);
    if (budgetId) next.set("budget", budgetId);
    if (brand) next.set("brand", brand);
    if (bodyType) next.set("body", bodyType);
    const nextStr = next.toString();
    const currStr = searchParams.toString();
    if (nextStr !== currStr) setSearchParams(next);
  }, [
    availability,
    query,
    budgetId,
    brand,
    bodyType,
    setSearchParams,
    searchParams,
  ]);

  const budget = useMemo(
    () => BUDGETS.find((b) => b.id === budgetId) ?? BUDGETS[0],
    [budgetId]
  );

  const baseFiltered = useMemo(() => {
    return vehicles.filter((v) => {
      if (availability === "kenya" && v.tag !== "Available in Kenya")
        return false;
      if (availability === "import" && v.tag !== "Direct Import") return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!`${v.title} ${v.brand}`.toLowerCase().includes(q)) return false;
      }
      const price = parsePriceToNumber(v.price);
      if (!(price >= budget.min && price <= budget.max)) return false;
      if (brand && v.brand !== brand) return false;
      if (bodyType && v.bodyType !== bodyType) return false;
      return true;
    });
  }, [vehicles, availability, query, budget.min, budget.max, brand, bodyType]);

  const brandCounts = useMemo(() => {
    const counts = Object.fromEntries(ALL_BRANDS.map((b) => [b, 0]));
    vehicles.forEach((v) => {
      if (availability === "kenya" && v.tag !== "Available in Kenya") return;
      if (availability === "import" && v.tag !== "Direct Import") return;
      const price = parsePriceToNumber(v.price);
      if (!(price >= budget.min && price <= budget.max)) return;
      if (bodyType && v.bodyType !== bodyType) return;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!`${v.title} ${v.brand}`.toLowerCase().includes(q)) return;
      }
      counts[v.brand] = (counts[v.brand] || 0) + 1;
    });
    return counts;
  }, [vehicles, availability, budget.min, budget.max, bodyType, query]);

  const bodyCounts = useMemo(() => {
    const counts = Object.fromEntries(ALL_BODY_TYPES.map((t) => [t, 0]));
    vehicles.forEach((v) => {
      if (availability === "kenya" && v.tag !== "Available in Kenya") return;
      if (availability === "import" && v.tag !== "Direct Import") return;
      const price = parsePriceToNumber(v.price);
      if (!(price >= budget.min && price <= budget.max)) return;
      if (brand && v.brand !== brand) return;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!`${v.title} ${v.brand}`.toLowerCase().includes(q)) return;
      }
      counts[v.bodyType] = (counts[v.bodyType] || 0) + 1;
    });
    return counts;
  }, [vehicles, availability, budget.min, budget.max, brand, query]);

  function clearAll() {
    setAvailability("both");
    setQuery("");
    setBudgetId("");
    setBrand("");
    setBodyType("");
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>Kenya’s trusted car and bike marketplace</h1>
            <p>Find what fits you — your personality, dream and pocket.</p>
            <div className="hero-cta">
              <a className="btn primary" href="#vehicles">
                Explore vehicles
              </a>
              <a className="btn" href="#bikes">
                Buy a bike
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="search" className="section">
        <div className="container">
          <h2>Find what fits you</h2>
          <div className="search-panel">
            <div className="toggle">
              <button
                type="button"
                className={availability === "kenya" ? "selected" : ""}
                onClick={() => setAvailability("kenya")}
                aria-pressed={availability === "kenya"}
              >
                Available in Kenya
              </button>
              <button
                type="button"
                className={availability === "import" ? "selected" : ""}
                onClick={() => setAvailability("import")}
                aria-pressed={availability === "import"}
              >
                Direct Import
              </button>
              <button
                type="button"
                className={availability === "both" ? "selected" : ""}
                onClick={() => setAvailability("both")}
                aria-pressed={availability === "both"}
              >
                Both
              </button>
            </div>
            <div className="fields">
              <div className="field">
                <label htmlFor="q">Search vehicle</label>
                <input
                  id="q"
                  type="text"
                  placeholder="Type vehicle name (e.g. Demio, Vitz)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="budget">Filter by budget</label>
                <select
                  id="budget"
                  value={budgetId}
                  onChange={(e) => setBudgetId(e.target.value)}
                >
                  {BUDGETS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="subfilters">
              <div>
                <p className="subheading">Brands</p>
                <div className="grid-chips">
                  {ALL_BRANDS.map((b) => {
                    const count = brandCounts[b] || 0;
                    const isActive = brand === b;
                    return (
                      <button
                        key={b}
                        className={`chip${isActive ? " active" : ""}`}
                        type="button"
                        disabled={count === 0 && !isActive}
                        aria-pressed={isActive}
                        onClick={() => setBrand(isActive ? "" : b)}
                        title={
                          count === 0 ? "No results" : `${count} result(s)`
                        }
                      >
                        {b}
                        {count ? ` (${count})` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="subheading">Body types</p>
                <div className="grid-chips">
                  {ALL_BODY_TYPES.map((t) => {
                    const count = bodyCounts[t] || 0;
                    const isActive = bodyType === t;
                    return (
                      <button
                        key={t}
                        className={`chip${isActive ? " active" : ""}`}
                        type="button"
                        disabled={count === 0 && !isActive}
                        aria-pressed={isActive}
                        onClick={() => setBodyType(isActive ? "" : t)}
                        title={
                          count === 0 ? "No results" : `${count} result(s)`
                        }
                      >
                        {t}
                        {count ? ` (${count})` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="actions">
              <a
                className="btn"
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  clearAll();
                }}
              >
                Clear all
              </a>
              <a className="btn primary" href="/vehicles">
                Search
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="featured" className="section">
        <div className="container">
          <h2>Featured vehicles ({baseFiltered.length})</h2>
          {loading && <p>Loading vehicles…</p>}
          {error && <p>{error}</p>}
          <div className="vehicle-grid">
            {baseFiltered.map((v) => (
              <article key={v.id} className="vehicle-card">
                <img className="thumb" src={v.image} alt={v.title} />
                <div className="vehicle-info">
                  <h3>{v.title}</h3>
                  <p className="price">{v.price}</p>
                  <p className="tag">{v.tag}</p>
                </div>
              </article>
            ))}
            {!loading && !error && baseFiltered.length === 0 && (
              <p>No vehicles match your filters. Try clearing some filters.</p>
            )}
          </div>
        </div>
      </section>

      <section id="services" className="section">
        <div className="container">
          <h2>What we do</h2>
          <div className="cards">
            <article className="card">
              <h3>Sales of New and Used Cars</h3>
              <p>Wide range of vehicles to suit every preference and budget.</p>
            </article>
            <article id="bikes" className="card">
              <h3>Motorbike Sales</h3>
              <p>High‑end motorcycles for personal and commercial use.</p>
            </article>
            <article className="card">
              <h3>Vehicle Trade‑Ins & Insurance</h3>
              <p>Flexible trade‑ins and car insurance for peace of mind.</p>
            </article>
            <article className="card">
              <h3>Spare Parts Supply</h3>
              <p>Quality automotive spare parts for many makes and models.</p>
            </article>
            <article className="card">
              <h3>Car Import Services</h3>
              <p>
                Seamless importation of vehicles with a transparent process.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="about" className="section alt">
        <div className="container narrow">
          <h2>About Rydex Motors Limited</h2>
          <p>
            We are pleased to introduce Rydex Motors Limited, a proudly local
            automotive company committed to delivering top‑tier products and
            services across the motoring industry. Established with a passion
            for mobility and a focus on customer satisfaction, Rydex Motors has
            grown to become a trusted name in the car dealership business.
          </p>
          <p>
            At Rydex Motors Limited, we specialize in sales of new and used
            cars, motorbike sales, vehicle trade‑ins and insurance services,
            spare parts supply, and car import services.
          </p>
          <ul className="pill-list">
            <li>Motorbikes</li>
            <li>Car insurance</li>
            <li>Spare parts</li>
          </ul>
          <p>
            Our commitment to quality, transparency, and customer satisfaction
            sets us apart. Whether you're looking to purchase your next vehicle,
            insure your current one, or source genuine spare parts, Rydex Motors
            Limited is your reliable partner.
          </p>
          <p>
            We would be delighted to engage with you for any of your vehicle or
            motorbike needs and look forward to building a lasting relationship
            with you.
          </p>
        </div>
      </section>

      <section id="contact-section" className="section">
        <div className="container narrow">
          <h2>Contact & Location</h2>
          <div className="cards">
            <article className="card">
              <h3>Get in touch</h3>
              <p>
                Phone: <a href="tel:+254700000000">+254 700 000 000</a>
              </p>
              <p>
                Email:{" "}
                <a href="mailto:info@rydexmotors.ke">info@rydexmotors.ke</a>
              </p>
            </article>
            <article className="card">
              <h3>Visit us</h3>
              <p>Nairobi, Kenya</p>
              <p>Open Mon–Sat, 9am – 6pm</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
