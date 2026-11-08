
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { products } from "../Data/products";

import "./ProductDetails.css";

const API_URL = "http://localhost:5000";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState(products);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // LOAD PRODUCT AND ALL AVAILABLE DESIGNS
  useEffect(() => {
    let cancelled = false;

    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        let uploadedDesigns = [];

        try {
          const response = await fetch(`${API_URL}/api/designs`);

          if (response.ok) {
            const data = await response.json();

            const designs = Array.isArray(data)
              ? data
              : data.designs || [];

            uploadedDesigns = designs.map((design) => ({
              ...design,
              id: design.id || design._id,
              name:
                design.name ||
                design.title ||
                design.originalName ||
                "Untitled Design",
              image: design.previewUrl
                ? design.previewUrl.startsWith("http")
                  ? design.previewUrl
                  : `${API_URL}${design.previewUrl}`
                : design.image,
              category:
                design.categoryName ||
                design.category ||
                "Design",
              format: design.format || design.type || "",
              price: Number(design.price || 500),
              description:
                design.description ||
                "Explore this unique digital design from Motifora.",
            }));
          }
        } catch (apiError) {
          // Static products remain available if the backend is offline.
          console.warn(
            "Unable to load uploaded designs:",
            apiError.message
          );
        }

        const combinedProducts = [
          ...products,
          ...uploadedDesigns,
        ];

        if (cancelled) return;

        setAllProducts(combinedProducts);

        const selectedProduct = combinedProducts.find(
          (item) => String(item.id) === String(productId)
        );

        if (!selectedProduct) {
          setProduct(null);
          setError("We couldn't find this design.");
          return;
        }

        setProduct({
          ...selectedProduct,
          image:
            selectedProduct.image ||
            (selectedProduct.previewUrl
              ? selectedProduct.previewUrl.startsWith("http")
                ? selectedProduct.previewUrl
                : `${API_URL}${selectedProduct.previewUrl}`
              : ""),
          name:
            selectedProduct.name ||
            selectedProduct.title ||
            "Untitled Design",
          category:
            selectedProduct.categoryName ||
            selectedProduct.category ||
            "Design",
          price: Number(selectedProduct.price || 500),
          description:
            selectedProduct.description ||
            "A unique digital design from Motifora.",
        });
      } catch (loadError) {
        console.error("Product loading error:", loadError);

        if (!cancelled) {
          setError("Unable to load this design. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  // ADD TO CART
  const handleAddToCart = () => {
    let user = null;

    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      user = null;
    }

    if (user?.role === "admin") {
      alert("Admin accounts cannot purchase designs.");
      return;
    }

    try {
      const cartKey = user
        ? `cart_${user.id || user._id || user.email}`
        : "cart_guest";

      const cart = JSON.parse(
        localStorage.getItem(cartKey) || "[]"
      );

      if (!Array.isArray(cart)) {
        throw new Error("Invalid cart data");
      }

      const existingIndex = cart.findIndex(
        (item) => String(item.id) === String(product.id)
      );

      if (existingIndex >= 0) {
        cart[existingIndex].quantity =
          Number(cart[existingIndex].quantity || 1) + 1;
      } else {
        cart.push({
          ...product,
          quantity: 1,
        });
      }

      localStorage.setItem(cartKey, JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));

      alert(`${product.name} added to cart.`);
    } catch (cartError) {
      console.error("Add to cart error:", cartError);
      alert("Unable to add this design to your cart.");
    }
  };

  // BUY NOW
  const handleBuyNow = () => {
    let user = null;

    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      user = null;
    }

    if (user?.role === "admin") {
      alert("Admin accounts cannot purchase designs.");
      return;
    }

    navigate(
      `/payment/${encodeURIComponent(product.id)}`
    );
  };

  // LOADING STATE
  if (loading) {
    return (
      <>
        <Navbar />

        <div className="product-loading">
          <p>Loading design...</p>
        </div>
      </>
    );
  }

  // PRODUCT NOT FOUND
  if (!product) {
    return (
      <>
        <Navbar />

        <div className="product-not-found">
          <h2>Design not found</h2>

          <p>
            {error ||
              "This design may have been removed or is no longer available."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
          >
            Back to Designs
          </button>
        </div>
      </>
    );
  }

  // RELATED DESIGNS
  const sameCategory = allProducts.filter((item) => {
    const sameId =
      String(item.id) === String(product.id);

    const itemCategory = (
      item.categoryName ||
      item.category ||
      ""
    ).trim().toLowerCase();

    const selectedCategory = (
      product.categoryName ||
      product.category ||
      ""
    ).trim().toLowerCase();

    return (
      !sameId &&
      selectedCategory !== "" &&
      itemCategory === selectedCategory
    );
  });

  // Show other designs from the same category first.
  // Fill remaining spaces with other designs if necessary.
  const otherCategories = allProducts.filter(
    (item) =>
      String(item.id) !== String(product.id) &&
      !sameCategory.some(
        (related) =>
          String(related.id) === String(item.id)
      )
  );

  const relatedProducts = [
    ...sameCategory,
    ...otherCategories,
  ].slice(0, 4);

  return (
    <>
      <Navbar />

      <main className="product-details-page">
        {/* BACK BUTTON */}
        <button
          type="button"
          className="back-to-products"
          onClick={() => navigate("/products")}
        >
          ← Back to Designs
        </button>

        {/* PRODUCT DETAILS */}
        <section className="product-details-layout">
          <div
            className="product-details-image"
            onContextMenu={(event) => event.preventDefault()}
          >
            <img
              src={product.image}
              alt={product.name}
              draggable="false"
            />

            <div
              className="details-watermark"
              aria-hidden="true"
            >
              Motifora
            </div>
          </div>

          <div className="product-details-info">
            <p className="details-category">
              {product.category || "Digital Design"}
            </p>

            <h1>{product.name}</h1>

            <p className="details-price">
              ₹{Number(product.price || 0).toLocaleString("en-IN")}
            </p>

            <p className="details-description">
              {product.description ||
                "Explore this unique design from Motifora."}
            </p>

            <div className="details-features">
              <p>✓ Digital design</p>
              <p>✓ Unique design for your collection</p>
              <p>✓ Secure checkout</p>
            </div>

            <div className="details-buttons">
              <button
                type="button"
                className="details-cart-button"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>

              <button
                type="button"
                className="details-buy-button"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            <p className="details-note">
              Please review your design and price before checkout.
            </p>
          </div>
        </section>

        {/* RELATED DESIGNS */}
        {relatedProducts.length > 0 && (
          <section className="related-designs">
            <div className="related-designs-heading">
              <div>
                <p className="related-eyebrow">
                  DISCOVER MORE
                </p>

                <h2>
                  More Designs in{" "}
                  {product.category || "This Collection"}
                </h2>

                <p>
                  Explore more designs selected for you.
                </p>
              </div>

              <button
                type="button"
                className="view-all-designs"
                onClick={() => navigate("/products")}
              >
                View All Designs →
              </button>
            </div>

            <div className="related-designs-grid">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default ProductDetails;
