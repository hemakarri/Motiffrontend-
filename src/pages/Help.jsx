import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Legal.css";

function Help() {
  return (
    <>
      <Navbar />

      <main className="legal-page help-page">
        <h1>Help Center</h1>
        <p>
          Need help with Motifora? Find answers to common questions.
        </p>

        <h2>How do I purchase a design?</h2>
        <p>
          Browse the Designs page, select a design, and click
          Buy Now or Add to Cart to continue.
        </p>

        <h2>Which file formats are available?</h2>
        <p>
          Available formats depend on the individual product.
          Check the product card and details before purchasing.
        </p>

        <h2>How do I access my purchased design?</h2>
        <p>
          Follow the delivery instructions shown after your
          payment is confirmed. Contact support if your design
          is not delivered as expected.
        </p>

        <h2>Can I use a design commercially?</h2>
        <p>
          Commercial use depends on the licence supplied with
          the design. Review the relevant usage terms before
          using it commercially.
        </p>

        <h2>How can I contact support?</h2>
        <p>
          Email our support team using the address listed below.
        </p>

        <a
          className="help-contact-button"
          href="mailto:support@motifora.com"
        >
          Contact Support
        </a>

        <p>
          You can also <Link to="/products">browse our designs</Link>.
        </p>
      </main>

      <Footer />
    </>
  );
}

export default Help;