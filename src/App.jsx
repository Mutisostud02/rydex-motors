import "@fontsource/jost";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import Bikes from "./pages/Bikes.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import VehicleDetail from "./pages/VehicleDetail.jsx";
import BikeDetail from "./pages/BikeDetail.jsx";
import { useState } from "react";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand">
            <img
              src="/logo/favicon-32x32.png"
              alt="Rydex Motors logo"
              width="24"
              height="24"
              style={{ marginRight: 8 }}
            />
            Rydex Motors Ltd
          </div>
          <button
            className="menu-btn"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
          <nav
            className={`nav ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <Link to="/">Home</Link>
            <Link to="/vehicles">Vehicles</Link>
            <Link to="/bikes">Bikes</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />
        <Route path="/bikes" element={<Bikes />} />
        <Route path="/bikes/:id" element={<BikeDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      <footer id="contact" className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="brand">Rydex Motors Ltd</div>
            <p>© Jan 2023 Rydex Motors Limited. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/vehicles">Vehicles</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </BrowserRouter>
  );
}

export default App;
