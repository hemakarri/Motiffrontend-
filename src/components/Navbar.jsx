import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState(getCurrentUser);
  const [cartCount, setCartCount] = useState(0);

  // =========================
  // CART STORAGE KEY
  // =========================

  const getCartKey = (currentUser) => {
    if (!currentUser) {
      return "cart_guest";
    }

    return `cart_${
      currentUser.id ||
      currentUser._id ||
      currentUser.email
    }`;
  };

  // =========================
  // UPDATE LOGIN STATUS
  // =========================

  const updateUser = () => {
    setUser(getCurrentUser());
  };

  // =========================
  // UPDATE CART COUNT
  // =========================

  const updateCartCount = () => {
    try {
      const currentUser = getCurrentUser();
      const cartKey = getCartKey(currentUser);
      const savedCart = localStorage.getItem(cartKey);
      const cart = savedCart ? JSON.parse(savedCart) : [];

      const count = Array.isArray(cart)
        ? cart.reduce(
            (total, item) =>
              total + Number(item.quantity || 1),
            0
          )
        : 0;

      setCartCount(count);
    } catch (error) {
      console.error("Error reading cart:", error);
      setCartCount(0);
    }
  };

  // =========================
  // LISTEN FOR LOGIN / LOGOUT
  // =========================

  useEffect(() => {
    updateUser();
    updateCartCount();

    window.addEventListener("authUpdated", updateUser);
    window.addEventListener("authUpdated", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateUser);
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("authUpdated", updateUser);
      window.removeEventListener("authUpdated", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setCartCount(0);

    window.dispatchEvent(new Event("authUpdated"));
    window.dispatchEvent(new Event("cartUpdated"));

    navigate("/login");
  };

  // =========================
  // NAVBAR
  // =========================

  return (
    <header className="navbar">
      {/* LOGO */}

      <Link
        to="/"
        className="logo"
        aria-label="Motifora Home"
      >
        <span className="logo-main">Motifora</span>
        <span className="logo-sub">DIGITAL DESIGN STUDIO</span>
      </Link>

      {/* NAVIGATION */}

      <nav className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive ? "active" : ""
          }
        >
          Designs
        </NavLink>

        {user ? (
          <>
            {user.role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? "active" : ""
                }
              >
                Admin Dashboard
              </NavLink>
            )}

            {user.role !== "admin" && (
              <span className="navbar-user">
                Hi, {user.name || "Customer"}
              </span>
            )}

            <button
              type="button"
              className="navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            Login
          </NavLink>
        )}
      </nav>

      {/* CART */}

      {user?.role !== "admin" && (
        <Link
          to="/cart"
          className="cart-link"
          aria-label={`Shopping Cart${
            cartCount > 0 ? `, ${cartCount} items` : ""
          }`}
        >
          <span className="cart-icon">
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 4H5L7.2 14.5C7.4 15.4 8.2 16 9.1 16H17.8C18.7 16 19.5 15.4 19.7 14.5L21 8H6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle cx="9" cy="20" r="1.5" fill="currentColor" />
              <circle cx="18" cy="20" r="1.5" fill="currentColor" />
            </svg>
          </span>

          <span className="cart-text">Cart</span>

          {cartCount > 0 && (
            <span className="cart-count">
              {cartCount}
            </span>
          )}
        </Link>
      )}
    </header>
  );
}

export default Navbar;