import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            Motifora
          </Link>
          <p>Digital Design Studio</p>
          <span>
            Creative designs for fashion, textiles and more.
          </span>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/products">Explore Designs</Link>
          <Link to="/cart">Shopping Cart</Link>
        </div>

        <div className="footer-links">
          <h3>Legal</h3>
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>

        <div className="footer-links">
          <h3>Customer Support</h3>
          <Link to="/help">Help Center</Link>
          <a href="mailto:support@motifora.com">
            Contact Support
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Motifora. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;