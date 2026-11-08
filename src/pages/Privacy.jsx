import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Legal.css";

function Privacy() {
  return (
    <>
      <Navbar />

      <main className="legal-page">
        <h1>Privacy Policy</h1>
        <p>Last updated: October 10, 2026</p>

        <h2>1. Information We Collect</h2>
        <p>
          We may collect information you provide when creating
          an account, placing an order or contacting support,
          along with information needed to operate the website.
        </p>

        <h2>2. How We Use Information</h2>
        <p>
          Information may be used to manage accounts, process
          orders, deliver digital products, provide customer
          support and maintain website security.
        </p>

        <h2>3. Payments</h2>
        <p>
          Payment information is handled according to the
          payment provider's processes. Motifora should not
          store sensitive card details unless the appropriate
          compliant payment infrastructure is in place.
        </p>

        <h2>4. Sharing Information</h2>
        <p>
          Information may be shared with service providers
          when necessary to operate the website, process
          payments or fulfil orders, subject to applicable law.
        </p>

        <h2>5. Data Security and Retention</h2>
        <p>
          We take reasonable steps to protect information and
          retain it only as needed for legitimate business,
          security and legal purposes.
        </p>

        <h2>6. Your Choices</h2>
        <p>
          You may contact us to request access, correction or
          deletion of your personal information, subject to
          applicable legal requirements.
        </p>

        <h2>7. Contact</h2>
        <p>
          Contact Motifora support with privacy-related questions
          or requests.
        </p>
      </main>

      <Footer />
    </>
  );
}

export default Privacy;