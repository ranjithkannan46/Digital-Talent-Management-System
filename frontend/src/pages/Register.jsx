import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Auth.css";

const Register = () => {
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    register(form.name.trim(), form.email.trim(), form.password);
  };

  return (
    <div className="auth-scene">
      <div className="auth-glow auth-glow--violet" />
      <div className="auth-glow auth-glow--cyan" />

      <div className="auth-card">
        <div className="auth-card__header">
          <span className="auth-card__badge">NEW USER</span>
          <h1 className="auth-card__title">Create Account</h1>
          <p className="auth-card__sub">Join the talent arena. Build your legacy.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="auth-form__error" role="alert">
              <span className="error-icon">⚠</span> {error}
            </div>
          )}

          <div className="field-group">
            <label htmlFor="name" className="field-label">User Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`field-input ${touched.name && !form.name ? "field-input--error" : ""}`}
              disabled={loading}
            />
            {touched.name && !form.name && (
              <span className="field-hint field-hint--error">Name is required</span>
            )}
          </div>

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
              onBlur={handleBlur}
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
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`field-input ${touched.password && form.password.length < 8 && form.password ? "field-input--error" : ""}`}
              disabled={loading}
            />
            {touched.password && form.password && form.password.length < 8 && (
              <span className="field-hint field-hint--error">Must be at least 8 characters</span>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading || !form.name || !form.email || form.password.length < 8}
          >
            {loading ? (
              <span className="auth-btn__loading">
                <span className="spinner" /> INITIALIZING...
              </span>
            ) : (
              "DEPLOY ACCOUNT →"
            )}
          </button>
        </form>

        <p className="auth-card__footer">
          Already registered?{" "}
          <Link to="/login" className="auth-link">Enter the Page</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
