import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
  const navigate = useNavigate();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const isAdmin = user?.role === "admin";

  const isUploadedDesign = Boolean(
    product.storedName ||
    product.originalName ||
    product.previewUrl
  );

  const handleAddToCart = () => {
    if (isAdmin) {
      alert("Admin accounts cannot purchase designs.");
      return;
    }

    try {
      const cartKey = user
        ? `cart_${user.id || user._id || user.email}`
        : "cart_guest";

      const savedCart = localStorage.getItem(cartKey);
      const cart = savedCart ? JSON.parse(savedCart) : [];

      const index = cart.findIndex(
        (item) => String(item.id) === String(product.id)
      );

      if (index !== -1) {
        cart[index].quantity =
          Number(cart[index].quantity || 1) + 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem(cartKey, JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));

      alert(`${product.name} added to cart`);
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Unable to add product to cart.");
    }
  };

  const handleBuyNow = () => {
    if (isAdmin) {
      alert("Admin accounts cannot purchase designs.");
      return;
    }

    navigate(`/payment/${encodeURIComponent(product.id)}`);
  };

  const handleRemoveDesign = async () => {
    if (!isAdmin || !isUploadedDesign) {
      return;
    }

    const confirmed = window.confirm(
      `Remove "${product.name}" from Motifora?`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in as an administrator.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/designs/${encodeURIComponent(product.id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove design.");
      }

      alert("Design removed successfully.");
      window.location.reload();
    } catch (error) {
      console.error("Remove design error:", error);
      alert(error.message || "Unable to remove design.");
    }
  };

  const openProductDetails = () => {
    navigate(`/product/${encodeURIComponent(product.id)}`);
  };

  return (
    <article className="product-card">
      <div
        className="product-image"
        onContextMenu={(e) => e.preventDefault()}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          draggable="false"
          onClick={openProductDetails}
          style={{ cursor: "pointer" }}
        />

        <div className="watermark-overlay" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => (
            <span key={index}>Motifora</span>
          ))}
        </div>

        <span className="svg-badge">
          {(
            product.format ||
            product.type ||
            (product.filename || "").split(".").pop() ||
            "SVG"
          ).toUpperCase()}
        </span>
      </div>

      <div className="product-info">
        <span className="product-category">
          {product.category || "Design"}
        </span>

        <h3
          onClick={openProductDetails}
          style={{ cursor: "pointer" }}
        >
          {product.name}
        </h3>

        <div className="product-footer">
          <div className="price-container">
            <span>Digital Design</span>
            <strong>
              ₹{Number(product.price || 0).toLocaleString("en-IN")}
            </strong>
          </div>

          {isAdmin ? (
            <div className="product-actions">
              {isUploadedDesign ? (
                <button
                  type="button"
                  className="remove-design-button"
                  onClick={handleRemoveDesign}
                >
                  Remove Design
                </button>
              ) : (
                <span className="admin-design-label">
                  Existing Design
                </span>
              )}
            </div>
          ) : (
            <div className="product-actions">
              <button
                type="button"
                className="cart-button"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>

              <button
                type="button"
                className="buy-button"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;