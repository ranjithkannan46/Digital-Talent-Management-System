import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Auth.css";

const Login = () => {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form.email.trim(), form.password);
  };

  return (
    <div className="auth-scene">
      <div className="auth-glow auth-glow--cyan" />
      <div className="auth-glow auth-glow--violet" style={{ top: "70%", left: "60%" }} />

      <div className="auth-card">
        <div className="auth-card__header">
          <span className="auth-card__badge">RETURNING PLAYER</span>
          <h1 className="auth-card__title">Enter Game</h1>
          <p className="auth-card__sub">Your stats are waiting. Resume the grind.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="auth-form__error" role="alert">
              <span className="error-icon">⚠</span> {error}
            </div>
          )}

          <div className="field-group">
            <label htmlFor="email" className="field-label">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="field-input"
              disabled={loading}
            />
          </div>

          <div className="field-group">
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              className="field-input"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading || !form.email || !form.password}
          >
            {loading ? (
              <span className="auth-btn__loading">
                <span className="spinner" /> AUTHENTICATING...
              </span>
            ) : (
              "LAUNCH SESSION →"
            )}
          </button>
        </form>

        <p className="auth-card__footer">
          New here?{" "}
          <Link to="/register" className="auth-link">Create player account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
