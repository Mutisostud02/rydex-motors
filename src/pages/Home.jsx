import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>Kenya’s trusted car and bike marketplace</h1>
            <p>Find what fits you — your personality, dream and pocket.</p>
            <div className="hero-cta">
              <Link className="btn primary" to="/vehicles">
                Explore vehicles
              </Link>
              <Link className="btn" to="/bikes">
                Buy a bike
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Removed search and filters from Home */}

      {/* Removed featured vehicles grid from Home; moved to Vehicles page */}

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
                Phone: <a href="tel:0202324344">0202324344</a>
              </p>
              <p>
                Email:{" "}
                <a href="mailto:info@rydexmotorsltd.co.ke">
                  info@rydexmotorsltd.co.ke
                </a>
              </p>
            </article>
            <article className="card">
              <h3>Visit us</h3>
              <p>Ground floor Prestige plaza, Ngong road, Nairobi kenya.</p>
              <p>Open Mon–Sat, 9am – 6pm</p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
