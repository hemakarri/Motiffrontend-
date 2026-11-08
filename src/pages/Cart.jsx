import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Cart() {
  const navigate = useNavigate();

  // =========================
  // CURRENT USER
  // =========================

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const user = getCurrentUser();

  // Keep each account's cart separate.
  // Guests use a separate cart from registered users.
  const cartKey = user
    ? `cart_${user.id || user._id || user.email}`
    : "cart_guest";

  // =========================
  // LOAD CART
  // =========================

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(cartKey);

      if (!savedCart) {
        return [];
      }

      const parsedCart = JSON.parse(savedCart);

      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
      console.error("Error loading cart:", error);
      return [];
    }
  });

  const [notice, setNotice] = useState("");

  // =========================
  // SAVE CART
  // =========================

  useEffect(() => {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Error saving cart:", error);
      setNotice("Unable to save your cart. Please check browser storage.");
    }
  }, [cart, cartKey]);

  // =========================
  // INCREASE QUANTITY
  // =========================

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (String(item.id) === String(id)) {
          return {
            ...item,
            quantity: Number(item.quantity || 1) + 1,
          };
        }

        return item;
      })
    );
  };

  // =========================
  // DECREASE QUANTITY
  // =========================

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (String(item.id) === String(id)) {
          return {
            ...item,
            quantity: Math.max(
              Number(item.quantity || 1) - 1,
              1
            ),
          };
        }

        return item;
      })
    );
  };

  // =========================
  // REMOVE ITEM
  // =========================

  const removeItem = (id) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => String(item.id) !== String(id)
      )
    );

    setNotice("");
  };

  // =========================
  // CLEAR CART
  // =========================

  const clearCart = () => {
    localStorage.removeItem(cartKey);
    setCart([]);
    setNotice("");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // =========================
  // TOTAL ITEMS
  // =========================

  const totalItems = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 1),
    0
  );

  // =========================
  // SUBTOTAL
  // =========================

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  // =========================
  // CHECKOUT
  // =========================

  const handleCheckout = () => {
    setNotice("");

    // Require login before checkout.
    if (!user) {
      navigate("/login", {
        state: { from: "/cart" },
      });
      return;
    }

    // Admin accounts cannot purchase designs.
    if (user.role === "admin") {
      setNotice(
        "Administrator accounts cannot purchase designs. Please sign in with a customer account."
      );
      return;
    }

    if (cart.length === 0) {
      return;
    }

    navigate("/payment/cart", {
      state: {
        cart,
        subtotal,
        totalItems,
      },
    });
  };

  // =========================
  // EMPTY CART
  // =========================

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <div className="empty-cart-icon">🛒</div>

          <h1>Your Cart is Empty</h1>

          <p>
            You haven't added any designs to your cart yet.
          </p>

          <Link
            to="/products"
            className="continue-shopping-button"
          >
            Browse Designs
          </Link>

          {!user && (
            <p className="cart-login-prompt">
              Already have an account?{" "}
              <Link to="/login">Login</Link>
            </p>
          )}
        </div>
      </main>
    );
  }

  // =========================
  // CART PAGE
  // =========================

  return (
    <main className="cart-page">
      {/* HEADER */}

      <div className="cart-header">
        <div>
          <span className="cart-label">MOTIFORA</span>

          <h1>Your Cart</h1>

          <p>
            {totalItems}{" "}
            {totalItems === 1 ? "design" : "designs"} in your cart
          </p>

          {user && (
            <p className="cart-account-label">
              Signed in as {user.name || user.email}
            </p>
          )}
        </div>

        <button
          type="button"
          className="clear-cart-button"
          onClick={clearCart}
        >
          Clear Cart
        </button>
      </div>

      {/* NOTICE */}

      {notice && (
        <div className="cart-notice" role="alert">
          {notice}
        </div>
      )}

      {/* CART CONTENT */}

      <div className="cart-layout">
        {/* ITEMS */}

        <section className="cart-items">
          {cart.map((item) => (
            <article
              className="cart-item"
              key={item.id}
            >
              {/* IMAGE */}

              <div className="cart-item-image">
                <img
                  src={item.image}
                  alt={item.name || "Motifora design"}
                  draggable="false"
                />

                <div
                  className="cart-watermark"
                  aria-hidden="true"
                >
                  Motifora
                </div>
              </div>

              {/* DETAILS */}

              <div className="cart-item-details">
                <span className="cart-item-category">
                  {item.category || "Design"}
                </span>

                <h2>{item.name || "Untitled Design"}</h2>

                <span className="cart-item-type">
                  Digital Design • {item.format || "SVG"}
                </span>

                <strong className="cart-item-price">
                  ₹{Number(item.price || 0).toLocaleString("en-IN")}
                </strong>

                {/* ACTIONS */}

                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.id)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>

                    <span>{item.quantity || 1}</span>

                    <button
                      type="button"
                      onClick={() => increaseQuantity(item.id)}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* ORDER SUMMARY */}

        <aside className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Designs</span>
            <span>{totalItems}</span>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>
              ₹{subtotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <span>Free</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">
            <span>Total</span>
            <strong>
              ₹{subtotal.toLocaleString("en-IN")}
            </strong>
          </div>

          <button
            type="button"
            className="checkout-button"
            onClick={handleCheckout}
          >
            Proceed to Payment
          </button>

          {!user && (
            <p className="cart-login-prompt">
              Please log in to continue to payment.
            </p>
          )}

          <Link
            to="/products"
            className="continue-shopping"
          >
            ← Continue Shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}

export default Cart;