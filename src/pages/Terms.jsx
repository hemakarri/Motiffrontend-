import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Legal.css";

function Terms() {
  return (
    <>
      <Navbar />

      <main className="legal-page">
        <h1>Terms &amp; Conditions</h1>
        <p>Last updated: October 10, 2026</p>

        <h2>1. Introduction</h2>
        <p>
          Welcome to Motifora, a digital design platform.
          By accessing or using our website, you agree to
          these terms.
        </p>

        <h2>2. Digital Products</h2>
        <p>
          Motifora offers digital designs in formats such as
          SVG and PNG. Please review the product description,
          format and price before purchasing.
        </p>

        <h2>3. Payments and Delivery</h2>
        <p>
          Orders are subject to successful payment confirmation.
          Digital files will be provided through the delivery
          method described on the website.
        </p>

        <h2>4. Intellectual Property</h2>
        <p>
          Designs may be protected by intellectual property
          rights. Customers must follow the applicable licence
          and usage permissions provided for each product.
        </p>

        <h2>5. Refunds and Support</h2>
        <p>
          Refund and cancellation requests will be handled
          according to the refund policy disclosed at checkout
          and applicable law.
        </p>

        <h2>6. Contact</h2>
        <p>
          For questions about these terms, contact our support
          team using the contact details published on Motifora.
        </p>
      </main>

      <Footer />
    </>
  );
}

export default Terms;