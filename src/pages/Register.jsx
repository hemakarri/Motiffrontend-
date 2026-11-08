import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      navigate("/login", {
        state: { message: "Account created successfully. Please log in." },
      });
    } catch (err) {
      setError(err.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <section className="register-card">
        <Link to="/" className="register-brand">
          MOTIFORA
        </Link>

        <div className="register-heading">
          <h1>Create Your Account</h1>
          <p>
            Join Motifora and discover beautiful designs for your creativity.
          </p>
        </div>

        <form onSubmit={handleRegister} className="register-form">
          <div className="register-field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              maxLength={100}
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="register-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create a password (minimum 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <span className="register-hint">
              Use at least 8 characters for your password.
            </span>
          </div>

          {error && (
            <div className="register-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="register-login">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        <div className="register-bottom">
          <Link to="/">← Back to Home</Link>
        </div>
      </section>
    </main>
  );
}