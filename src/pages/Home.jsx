import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { references, products } from "../Data/products";
import Footer from "../components/Footer";

function Home() {
  const featuredProducts = products.slice(0, 6);

  const referenceImages = references.slice(0, 3);

  const Watermark = () => (
    <div className="home-watermark-overlay" aria-hidden="true">
      <span>Motifora</span>
      <span>Motifora</span>
      <span>Motifora</span>
      <span>Motifora</span>
      <span>Motifora</span>
      <span>Motifora</span>
      <span>Motifora</span>
      <span>Motifora</span>
      <span>Motifora</span>
    </div>
  );

  return (
    <>
      <Navbar />

      {/* =================================
          HERO
      ================================= */}

      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">
            PREMIUM DIGITAL TEXTILE DESIGNS
          </span>

          <h1>
            Designs That Bring
            <br />
            <span>Creativity to Life.</span>
          </h1>

          <p>
            Discover premium digital SVG designs
            created for fashion designers, textile
            artists and creative professionals.
          </p>

          <div className="hero-buttons">
            <Link to="/products" className="primary-button">
              Explore Designs
            </Link>

            <a href="#about" className="secondary-button">
              Learn More
            </a>
          </div>
        </div>

        {/* HERO DECORATION */}

        <div className="hero-decoration">
          <div className="hero-circle"></div>

          <div className="hero-card">
            <span>PREMIUM SVG</span>

            <strong>₹500</strong>

            <small>Per Design</small>
          </div>
        </div>
      </section>

      {/* =================================
          INTRO
      ================================= */}

      <section className="intro-section" id="about">
        <div className="intro-text">
          <span className="eyebrow">
            ABOUT OUR COLLECTION
          </span>

          <h2>
            Designed for
            <br />
            creative professionals.
          </h2>

          <p>
            Our digital design collection brings
            together elegant textile motifs, sleeve
            designs, borders and fashion elements
            that can be used in your creative work.
          </p>

          <p>
            Every design is provided as a high-quality
            SVG file for flexible digital use.
          </p>

          <Link to="/products" className="text-link">
            View All Designs →
          </Link>
        </div>

        <div className="intro-stats">
          <div>
            <strong>{products.length}+</strong>

            <span>Digital Designs</span>
          </div>

          <div>
            <strong>₹500</strong>

            <span>Per Design</span>
          </div>

          <div>
            <strong>SVG</strong>

            <span>Premium Format</span>
          </div>
        </div>
      </section>

      {/* =================================
          REFERENCE IMAGES
      ================================= */}

      {referenceImages.length > 0 && (
        <section className="reference-section">
          <div className="section-heading">
            <span className="eyebrow">
              OUR WORK
            </span>

            <h2>
              Design References
            </h2>

            <p>
              Explore some of our design references
              and creative work.
            </p>
          </div>

          <div className="reference-grid">
            {referenceImages.map((reference) => (
              <div
                className="reference-card"
                key={reference.id}
              >
                {/* IMAGE WITH WATERMARK */}
                <div
                  className="home-protected-image"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <img
                    src={reference.image}
                    alt={reference.name}
                    loading="lazy"
                    draggable="false"
                  />

                  <Watermark />

                  <span className="home-image-badge">
                    MOTIFORA
                  </span>
                </div>

                <div>
                  <span>
                    DESIGN REFERENCE
                  </span>

                  <h3>
                    {reference.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =================================
          FEATURED PRODUCTS
      ================================= */}

      <section className="featured-section">
        <div className="section-heading">
          <span className="eyebrow">
            SHOP DIGITAL DESIGNS
          </span>

          <h2>
            Featured Collection
          </h2>

          <p>
            Premium SVG designs available
            for ₹500 per design.
          </p>
        </div>

        <div className="featured-grid">
          {featuredProducts.map((product) => (
            <Link
              to={`/payment/${encodeURIComponent(product.id)}`}
              className="featured-card"
              key={product.id}
            >
              {/* PROTECTED FEATURED IMAGE */}
              <div
                className="featured-image home-protected-image"
                onContextMenu={(e) => e.preventDefault()}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  draggable="false"
                />

                <Watermark />

                <span className="home-image-badge">
                  SVG
                </span>
              </div>

              <div className="featured-info">
                <span>
                  {product.category}
                </span>

                <h3>
                  {product.name}
                </h3>

                <strong>
                  ₹{product.price}
                </strong>
              </div>
            </Link>
          ))}
        </div>

        <div className="center-button">
          <Link
            to="/products"
            className="primary-button"
          >
            View All Designs
          </Link>
        </div>
      </section>

      {/* =================================
          HOW IT WORKS
      ================================= */}

      <section className="how-section">
        <div className="section-heading">
          <span className="eyebrow">
            SIMPLE PROCESS
          </span>

          <h2>
            How It Works
          </h2>
        </div>

        <div className="steps">
          <div className="step">
            <span className="step-number">
              01
            </span>

            <h3>
              Choose a Design
            </h3>

            <p>
              Browse our collection and select
              the SVG design you love.
            </p>
          </div>

          <div className="step">
            <span className="step-number">
              02
            </span>

            <h3>
              Make Payment
            </h3>

            <p>
              Enter your email and securely pay
              ₹500 for your selected design.
            </p>
          </div>

          <div className="step">
            <span className="step-number">
              03
            </span>

            <h3>
              Receive Your Design
            </h3>

            <p>
              After successful payment, your
              purchased SVG will be delivered
              to your email.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Home;