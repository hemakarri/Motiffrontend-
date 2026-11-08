import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const API_URL = "http://localhost:5000/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid login response from server.");
      }

      // The backend determines the user's actual role.
      const isAdmin = data.user.role === "admin";

      // Do not allow a customer login selection to change account permissions.
      if (loginType === "admin" && !isAdmin) {
        throw new Error("This account does not have administrator access.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate(isAdmin ? "/admin" : "/products");
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <Link to="/" className="login-brand">
          MOTIFORA
        </Link>

        <div className="login-heading">
          <h1>Welcome Back</h1>
          <p>Sign in to continue your Motifora experience.</p>
        </div>

        <div className="login-tabs" role="group" aria-label="Login type">
          <button
            type="button"
            className={`login-tab ${
              loginType === "customer" ? "active" : ""
            }`}
            onClick={() => {
              setLoginType("customer");
              setError("");
            }}
            aria-pressed={loginType === "customer"}
          >
            Customer Login
          </button>

          <button
            type="button"
            className={`login-tab ${
              loginType === "admin" ? "active" : ""
            }`}
            onClick={() => {
              setLoginType("admin");
              setError("");
            }}
            aria-pressed={loginType === "admin"}
          >
            Admin Login
          </button>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : loginType === "admin"
              ? "Login as Admin"
              : "Login"}
          </button>
        </form>

        {loginType === "customer" && (
          <div className="login-register">
            <p>
              New to Motifora?{" "}
              <Link to="/register">Create Account</Link>
            </p>
          </div>
        )}

        {loginType === "admin" && (
          <p className="login-admin-note">
            Administrator access is available only to authorized admin accounts.
          </p>
        )}

        <div className="login-bottom">
          <Link to="/">← Back to Home</Link>
        </div>
      </section>
    </main>
  );
}