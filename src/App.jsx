
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Payment from "./pages/Payment";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UploadDesign from "./pages/UploadDesign";

// Legal and support pages
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Help from "./pages/Help";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main pages */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />

        {/* Product details */}
        <Route
          path="/product/:productId"
          element={<ProductDetails />}
        />

        {/* Cart and payment */}
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/payment/:productId"
          element={<Payment />}
        />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin pages */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/admin/upload"
          element={<UploadDesign />}
        />

        {/* Terms, privacy and support */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/help" element={<Help />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
