
import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
  const navigate = useNavigate();

  // CURRENT USER
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("Unable to read user information:", error);
  }

  const isAdmin = user?.role === "admin";

  const isUploadedDesign = Boolean(
    product.previewUrl ||
    product.storedName ||
    product.originalName
  );

  // OPEN PRODUCT DETAILS
  const handleOpenProduct = () => {
    navigate(`/product/${encodeURIComponent(product.id)}`);
  };

  // BUY NOW
  const handleBuy = () => {
    if (isAdmin) {
      alert("Admin accounts cannot purchase designs.");
      return;
    }

    navigate(`/payment/${encodeURIComponent(product.id)}`);
  };

  // ADD TO CART
  const handleAddToCart = () => {
    if (isAdmin) {
      alert("Admin accounts cannot add designs to the cart.");
      return;
    }

    try {
      const cartKey = user
        ? `cart_${user.id || user._id || user.email}`
        : "cart_guest";

      const savedCart = localStorage.getItem(cartKey);
      const existingCart = savedCart ? JSON.parse(savedCart) : [];

      if (!Array.isArray(existingCart)) {
        throw new Error("Invalid cart data");
      }

      const existingProductIndex = existingCart.findIndex(
        (item) => String(item.id) === String(product.id)
      );

      if (existingProductIndex !== -1) {
        existingCart[existingProductIndex].quantity =
          Number(existingCart[existingProductIndex].quantity || 1) + 1;
      } else {
        existingCart.push({
          ...product,
          quantity: 1,
        });
      }

      localStorage.setItem(cartKey, JSON.stringify(existingCart));
      window.dispatchEvent(new Event("cartUpdated"));

      alert(`${product.name} added to cart`);
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Unable to add product to cart.");
    }
  };

  // REMOVE DESIGN (ADMIN)
  const handleRemoveDesign = async () => {
    if (!isAdmin) {
      alert("Only administrators can remove designs.");
      return;
    }

    if (!isUploadedDesign) {
      alert("Only designs uploaded through the admin panel can be removed here.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Your admin session has expired. Please log in again.");
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

      let data = {};

      try {
        data = await response.json();
      } catch {
        // Response body may be empty.
      }

      if (response.status === 401 || response.status === 403) {
        alert(
          data.message ||
            "You are not authorized to remove this design."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove design.");
      }

      alert("Design removed successfully.");
      window.location.reload();
    } catch (error) {
      console.error("Remove design error:", error);
      alert(error.message || "Unable to remove the design.");
    }
  };

  return (
    <article className="product-card">
      {/* PRODUCT IMAGE */}
      <div
        className="product-image"
        onContextMenu={(e) => e.preventDefault()}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          draggable="false"
          onClick={handleOpenProduct}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleOpenProduct();
            }
          }}
          title={`View ${product.name}`}
          style={{ cursor: "pointer" }}
        />

        {/* WATERMARK */}
        <div className="watermark-overlay" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => (
            <span key={index}>Motifora</span>
          ))}
        </div>

        {/* FORMAT BADGE */}
        <span className="svg-badge">
          {(
            product.format ||
            product.type ||
            (product.filename || "").split(".").pop() ||
            "svg"
          ).toUpperCase()}
        </span>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="product-info">
        <span className="product-category">
          {product.category || "Design"}
        </span>

        <h3
          onClick={handleOpenProduct}
          style={{ cursor: "pointer" }}
          title={`View ${product.name}`}
        >
          {product.name}
        </h3>

        {/* PRODUCT FOOTER */}
        <div className="product-footer">
          <div className="price-container">
            <span>Digital Design</span>

            <strong>
              ₹{Number(product.price || 0).toLocaleString("en-IN")}
            </strong>
          </div>

          {/* CUSTOMER ACTIONS */}
          {!isAdmin && (
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
                onClick={handleBuy}
              >
                Buy Now
              </button>
            </div>
          )}

          {/* ADMIN ACTION */}
          {isAdmin && (
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
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
