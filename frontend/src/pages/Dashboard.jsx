import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  let user = null;
  try { user = JSON.parse(localStorage.getItem("dtms_user")); } catch {}

  const signOut = () => {
    localStorage.removeItem("dtms_token");
    localStorage.removeItem("dtms_user");
    navigate("/", { replace: true });
  };

  return (
    <div className="dash-wrap">
      <header className="dash-nav">
        <div className="dash-nav__brand">
          <div className="dash-nav__mark">DT</div>
          <span className="dash-nav__label">Digital Talent Management System</span>
        </div>
        <div className="dash-nav__right">
          <span className="dash-nav__user">{user?.name}</span>
          <button className="dash-nav__out" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <main className="dash-main">
        <div className="dash-cards">
          {["My Tasks", "Assigned to Me", "Completed", "Overdue"].map((label) => (
            <div className="dash-card" key={label}>
              <div className="dash-card__num">—</div>
              <div className="dash-card__label">{label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;