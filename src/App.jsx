import "@fontsource/jost";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import Bikes from "./pages/Bikes.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";

function App() {
  return (
    <BrowserRouter>
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand">Rydex Motors Ltd</div>
          <nav className="nav">
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
        <Route path="/bikes" element={<Bikes />} />
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
