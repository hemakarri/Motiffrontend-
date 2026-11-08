import {
  useParams,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import { products } from "../Data/products";

function Payment() {
  const { productId } = useParams();

  const navigate = useNavigate();

  const location = useLocation();

  // =====================================
  // CHECK WHETHER PAYMENT IS FROM CART
  // =====================================

  const isCartPayment =
    productId === "cart";


  // =====================================
  // GET CART ITEMS
  // =====================================

  const getCartItems = () => {
    try {
      // First get cart data passed from Cart.jsx
      if (
        location.state &&
        Array.isArray(location.state.cart)
      ) {
        return location.state.cart;
      }

      // Otherwise get from localStorage
      const savedCart =
        localStorage.getItem("cart");

      if (!savedCart) {
        return [];
      }

      const parsedCart =
        JSON.parse(savedCart);

      return Array.isArray(parsedCart)
        ? parsedCart
        : [];

    } catch (error) {
      console.error(
        "Error loading cart:",
        error
      );

      return [];
    }
  };


  const cartItems = isCartPayment
    ? getCartItems()
    : [];


  // =====================================
  // GET SINGLE PRODUCT (bundled or API-uploaded)
  // =====================================

  const decodedProductId = productId ? decodeURIComponent(productId) : "";
  const [uploadedProduct, setUploadedProduct] = useState(null);

  useEffect(() => {
    if (isCartPayment || !decodedProductId || products.some((item) => String(item.id) === String(decodedProductId))) return;
    let cancelled = false;
    fetch("http://localhost:5000/api/designs")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Could not load design")))
      .then((data) => {
        if (cancelled) return;
        const found = (data.designs || []).find((item) => String(item.id) === String(decodedProductId));
        if (found) setUploadedProduct({ ...found, image: `http://localhost:5000${found.previewUrl}`, category: found.categoryName || found.category, type: found.format, filename: found.filename });
      })
      .catch((error) => console.error("Could not load uploaded product:", error));
    return () => { cancelled = true; };
  }, [isCartPayment, decodedProductId]);

  const product = isCartPayment ? null : (products.find((item) => String(item.id) === String(decodedProductId)) || uploadedProduct);


  // =====================================
  // PAYMENT ITEMS
  // =====================================

  const paymentItems = isCartPayment
    ? cartItems
    : product
      ? [
          {
            ...product,
            quantity: 1,
          },
        ]
      : [];


  // =====================================
  // TOTAL
  // =====================================

  const totalAmount =
    paymentItems.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          Number(item.quantity || 1),
      0
    );


  // =====================================
  // EMAIL
  // =====================================

  const [email, setEmail] =
    useState("");


  // =====================================
  // LOADING
  // =====================================

  const [loading, setLoading] =
    useState(false);


  // =====================================
  // SUCCESS
  // =====================================

  const [success, setSuccess] =
    useState(false);


  // =====================================
  // ORDER
  // =====================================

  const [order, setOrder] =
    useState(null);


  // =====================================
  // PRODUCT NOT FOUND
  // =====================================

  if (
    !isCartPayment &&
    !product
  ) {
    return (
      <>
        <Navbar />

        <main className="not-found">

          <h1>
            Design Not Found
          </h1>

          <p>
            The design you selected
            could not be found.
          </p>

          <Link
            to="/products"
            className="primary-button"
          >
            Back to Designs
          </Link>

        </main>
      </>
    );
  }


  // =====================================
  // CART EMPTY
  // =====================================

  if (
    isCartPayment &&
    paymentItems.length === 0
  ) {
    return (
      <>
        <Navbar />

        <main className="not-found">

          <h1>
            Your Cart is Empty
          </h1>

          <p>
            Please add a design to your
            cart before proceeding to payment.
          </p>

          <Link
            to="/products"
            className="primary-button"
          >
            Browse Designs
          </Link>

        </main>
      </>
    );
  }


  // =====================================
  // PAYMENT
  // =====================================

  const handlePayment =
    async (event) => {

      event.preventDefault();


      if (!email.trim()) {

        alert(
          "Please enter customer email."
        );

        return;
      }


      setLoading(true);


      try {

        // =================================
        // CART PAYMENT
        // =================================

        if (isCartPayment) {

          const response =
            await fetch(
              "http://localhost:5000/api/mock-payment",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({

                  email:
                    email.trim(),

                  cart:
                    paymentItems.map(
                      (item) => ({
                        productId:
                          item.id,

                        quantity:
                          Number(
                            item.quantity ||
                            1
                          ),

                        price:
                          Number(
                            item.price ||
                            0
                          ),
                      })
                    ),

                  total:
                    totalAmount,

                }),
              }
            );


          const data =
            await response.json();


          if (!response.ok) {

            throw new Error(
              data.message ||
              "Payment failed"
            );

          }


          console.log(
            "CART PAYMENT RESPONSE:",
            data
          );


          setOrder(data);

          setSuccess(true);


          // Clear cart after successful payment
          localStorage.removeItem(
            "cart"
          );

          window.dispatchEvent(
            new Event("cartUpdated")
          );


          return;
        }


        // =================================
        // SINGLE PRODUCT PAYMENT
        // =================================

        const response =
          await fetch(
            "http://localhost:5000/api/mock-payment",
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                productId:
                  product.id,

                email:
                  email.trim(),

              }),

            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
            "Payment failed"
          );

        }


        console.log(
          "PAYMENT RESPONSE:",
          data
        );


        setOrder(data);

        setSuccess(true);


      } catch (error) {

        console.error(
          "Payment error:",
          error
        );

        alert(
          error.message ||
          "Something went wrong."
        );

      } finally {

        setLoading(false);

      }

    };


  // =====================================
  // SUCCESS SCREEN
  // =====================================

  if (success && order) {

    return (
      <>
        <Navbar />

        <main className="payment-page">

          <div
            className="success-container"
          >

            <div
              className="success-icon"
            >
              ✓
            </div>


            <span className="eyebrow">
              PAYMENT SUCCESSFUL
            </span>


            <h1>
              Your Design Has Been Sent
            </h1>


            <p>
              The purchased SVG
              {paymentItems.length > 1
                ? "s have"
                : " has"}{" "}
              been sent to:
            </p>


            <strong
              className="success-email"
            >
              {order.email ||
                email}
            </strong>


            {/* =========================
                CART ORDER
            ========================= */}

            {isCartPayment ? (

              <div className="order-details">

                <div>

                  <span>
                    Order ID
                  </span>

                  <strong>
                    {order.orderId ||
                      "Generated"}
                  </strong>

                </div>


                <div>

                  <span>
                    Designs
                  </span>

                  <strong>
                    {paymentItems.length}
                  </strong>

                </div>


                <div>

                  <span>
                    Total Items
                  </span>

                  <strong>
                    {paymentItems.reduce(
                      (count, item) =>
                        count +
                        Number(
                          item.quantity ||
                          1
                        ),
                      0
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Amount
                  </span>

                  <strong>
                    ₹{totalAmount}
                  </strong>

                </div>

              </div>

            ) : (

              /* =========================
                 SINGLE PRODUCT ORDER
              ========================= */

              <div
                className="order-details"
              >

                <div>

                  <span>
                    Order ID
                  </span>

                  <strong>
                    {order.orderId}
                  </strong>

                </div>


                <div>

                  <span>
                    Design
                  </span>

                  <strong>
                    {order.product?.name ||
                      product.name}
                  </strong>

                </div>


                <div>

                  <span>
                    File
                  </span>

                  <strong>
                    {order.product?.filename ||
                      product.filename ||
                      "SVG File"}
                  </strong>

                </div>


                <div>

                  <span>
                    Amount
                  </span>

                  <strong>
                    ₹
                    {order.product?.price ||
                      product.price}
                  </strong>

                </div>

              </div>

            )}


            {/* =========================
                CART PRODUCTS
            ========================= */}

            {isCartPayment && (

              <div
                className="payment-success-items"
              >

                {paymentItems.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="success-cart-item"
                    >

                      <span>
                        {item.name}
                      </span>

                      <strong>
                        ×
                        {item.quantity || 1}
                      </strong>

                    </div>

                  )
                )}

              </div>

            )}


            {/* =========================
                FILE VERIFICATION
            ========================= */}

            {!isCartPayment &&
              order.fileHash && (

                <div
                  className="verification-box"
                >

                  <strong>
                    ✓ SVG File Verified
                  </strong>

                  <p>
                    The exact SVG selected
                    for this order was
                    attached to the email.
                  </p>

                  <small>
                    SHA-256:
                    <br />
                    {order.fileHash}
                  </small>

                </div>

              )}


            {/* =========================
                BUTTONS
            ========================= */}

            <div
              className="success-buttons"
            >

              <Link
                to="/products"
                className="primary-button"
              >
                Continue Shopping
              </Link>


              <Link
                to="/"
                className="secondary-button"
              >
                Back Home
              </Link>

            </div>

          </div>

        </main>
      </>
    );
  }


  // =====================================
  // PAYMENT PAGE
  // =====================================

  return (
    <>
      <Navbar />

      <main className="payment-page">

        <div className="payment-container">


          {/* =================================
              LEFT SIDE
          ================================= */}

          <div className="payment-intro">

            <span className="eyebrow">
              SECURE CHECKOUT
            </span>


            <h1>
              Complete Your
              <br />
              Purchase
            </h1>


            <p>
              Enter the customer's email
              address below. After the mock
              payment, the selected SVG
              design will be sent to that
              email.
            </p>


            <div className="security-info">

              <div>
                ✓ Digital Design
              </div>

              <div>
                ✓ Exact SVG Selected
              </div>

              <div>
                ✓ Email Delivery
              </div>

              <div>
                ✓ File Verification
              </div>

            </div>

          </div>


          {/* =================================
              PAYMENT CARD
          ================================= */}

          <div className="payment-card">


            {/* =================================
                CART PREVIEW
            ================================= */}

            {isCartPayment ? (

              <>

                <div className="payment-cart-heading">

                  <span className="eyebrow">
                    YOUR CART
                  </span>

                  <h2>
                    {paymentItems.length}{" "}
                    {paymentItems.length === 1
                      ? "Design"
                      : "Designs"}
                  </h2>

                </div>


                <div className="payment-cart-items">

                  {paymentItems.map(
                    (item) => (

                      <div
                        className="payment-cart-item"
                        key={item.id}
                      >

                        <div className="payment-preview">

                          <img
                            src={item.image}
                            alt={item.name}
                            draggable="false"
                          />

                          <span>
                            SVG
                          </span>

                        </div>


                        <div
                          className="payment-product"
                        >

                          <span className="product-category">
                            {item.category}
                          </span>

                          <h2>
                            {item.name}
                          </h2>

                          <div className="payment-quantity">
                            Qty:{" "}
                            {item.quantity || 1}
                          </div>

                          <div className="payment-price">

                            ₹
                            {Number(
                              item.price || 0
                            ) *
                              Number(
                                item.quantity ||
                                1
                              )}

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </>

            ) : (

              /* =================================
                 SINGLE PRODUCT PREVIEW
              ================================= */

              <>

                <div className="payment-preview">

                  <img
                    src={product.image}
                    alt={product.name}
                    draggable="false"
                  />

                  <span>
                    SVG
                  </span>

                </div>


                <div className="payment-product">

                  <span className="product-category">
                    {product.category}
                  </span>

                  <h2>
                    {product.name}
                  </h2>

                  <div className="payment-price">
                    ₹{product.price}
                  </div>

                </div>

              </>

            )}


            <div className="payment-divider" />


            {/* =================================
                ORDER TOTAL
            ================================= */}

            <div className="payment-order-summary">

              <div>

                <span>
                  {isCartPayment
                    ? "Total Designs"
                    : "Design"}
                </span>

                <strong>
                  {isCartPayment
                    ? paymentItems.length
                    : product.name}
                </strong>

              </div>


              {isCartPayment && (

                <div>

                  <span>
                    Total Items
                  </span>

                  <strong>
                    {paymentItems.reduce(
                      (count, item) =>
                        count +
                        Number(
                          item.quantity ||
                          1
                        ),
                      0
                    )}
                  </strong>

                </div>

              )}


              <div>

                <span>
                  Total Amount
                </span>

                <strong>
                  ₹{totalAmount}
                </strong>

              </div>

            </div>


            <div className="payment-divider" />


            {/* =================================
                EMAIL FORM
            ================================= */}

            <form
              onSubmit={handlePayment}
            >

              <label htmlFor="customer-email">
                Customer Email Address
              </label>


              <input
                id="customer-email"
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
              />


              <p className="email-note">

                {isCartPayment
                  ? "All selected SVG designs will be attached to this email after the mock payment is completed."
                  : "The selected SVG will be attached to this email after the mock payment is completed."}

              </p>


              <button
                type="submit"
                className="payment-button"
                disabled={loading}
              >

                {loading
                  ? "Processing Payment..."
                  : `Pay ₹${totalAmount}`}

              </button>

            </form>


            <p className="payment-terms">

              TEST MODE — No real money
              will be charged.

            </p>

          </div>

        </div>

      </main>

    </>
  );
}

export default Payment;