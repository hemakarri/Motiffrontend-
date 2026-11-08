import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <main className="admin-dashboard">
      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-header-content">
            <p className="admin-brand">MOTIFORA</p>
            <h1>Admin Dashboard</h1>
            <p className="admin-welcome">
              Welcome, <strong>{user?.name || "Admin"}</strong>!
            </p>
          </div>

          <button
            type="button"
            className="admin-btn admin-btn-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </header>

        <section className="admin-card">
          <div className="admin-card-heading">
            <div className="admin-icon">✦</div>
            <div>
              <h2>Design Management</h2>
              <p>
                Manage your Motifora designs in one place. Upload SVG and PNG
                designs, manage categories, and view your available products.
              </p>
            </div>
          </div>

          <div className="admin-actions">
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => navigate("/admin/upload")}
            >
              <span className="admin-button-icon">+</span>
              Upload Design
            </button>

            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => navigate("/products")}
            >
              View Products
              <span className="admin-button-arrow">→</span>
            </button>
          </div>
        </section>

        <footer className="admin-footer">
          <p>© {new Date().getFullYear()} Motifora. All rights reserved.</p>
          <p>Designed for creativity.</p>
        </footer>
      </div>
    </main>
  );
}