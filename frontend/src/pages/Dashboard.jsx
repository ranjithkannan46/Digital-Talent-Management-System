import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Dashboard.css";

const StatCard = ({ label, value, accent }) => (
  <div className="stat-card" style={{ "--accent": accent }}>
    <span className="stat-card__label">{label}</span>
    <span className="stat-card__value">{value}</span>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch {
        // Token is invalid or expired — auth interceptor already cleared storage
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("talent_token");
    localStorage.removeItem("talent_user");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-loading__spinner" />
        <span>Loading arena...</span>
      </div>
    );
  }

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "—";

  return (
    <div className="dashboard">
      {/* Top nav bar */}
      <header className="dash-nav">
        <div className="dash-nav__brand">
          <span className="dash-nav__logo">◈</span>
          <span className="dash-nav__name">TalentOS</span>
        </div>
        <div className="dash-nav__right">
          <span className="dash-nav__user">{user?.name}</span>
          <button className="dash-nav__logout" onClick={handleLogout}>
            DISCONNECT
          </button>
        </div>
      </header>

      <main className="dash-main">
        {/* Hero welcome block */}
        <section className="dash-hero">
          <div className="dash-hero__glow" />
          <div className="dash-hero__content">
            <p className="dash-hero__greeting">WELCOME BACK, PLAYER</p>
            <h1 className="dash-hero__name">{user?.name}</h1>
            <p className="dash-hero__email">{user?.email}</p>
          </div>
          <div className="dash-hero__badge">
            <span className="role-badge">{user?.role?.toUpperCase() || "PLAYER"}</span>
            <span className="status-dot" title="Online" />
          </div>
        </section>

        {/* Stats row */}
        <section className="dash-stats">
          <StatCard label="Player ID"     value={`#${user?.id?.slice(-6).toUpperCase()}`} accent="var(--neon-cyan)"   />
          <StatCard label="Role"          value={user?.role || "Player"}                   accent="var(--neon-violet)" />
          <StatCard label="Member Since"  value={joinedDate}                               accent="var(--neon-green)"  />
          <StatCard label="Season"        value="S1 — SPRINT 1"                            accent="var(--neon-pink)"   />
        </section>

        {/* Activity placeholder */}
        <section className="dash-panel">
          <div className="dash-panel__header">
            <h2 className="dash-panel__title">Recent Activity</h2>
            <span className="dash-panel__tag">LIVE</span>
          </div>
          <div className="dash-panel__empty">
            <div className="empty-icon">◎</div>
            <p>No activity yet. Your journey starts here.</p>
            <p className="empty-sub">Sprint 2 will bring missions, rankings, and more.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
