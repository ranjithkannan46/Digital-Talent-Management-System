import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import "../styles/Dashboard.css";

const fixRole  = r => (!r || r === "player" || r === "Player") ? "user" : r;
const fmtShort = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user,    setUser]    = useState(null);
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const photo = localStorage.getItem("dtms_photo");

  useEffect(() => {
    Promise.all([axios.get("/auth/me"), axios.get("/tasks")])
      .then(([me, t]) => { setUser(me.data.user); setTasks(t.data.tasks); })
      .catch(() => navigate("/", { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="dash-loader">
        <div className="dash-spin" />
        Loading dashboard...
      </div>
    );
  }

  const role    = fixRole(user?.role);
  const isAdmin = role === "admin";
  const today   = new Date(); today.setHours(0, 0, 0, 0);

  const stats = {
    total:   tasks.length,
    todo:    tasks.filter(t => t.status === "todo").length,
    prog:    tasks.filter(t => t.status === "in_progress").length,
    done:    tasks.filter(t => t.status === "completed").length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== "completed").length,
  };
  const rate    = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const recent  = [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 7);
  const dueSoon = tasks.filter(t => {
    if (!t.dueDate || t.status === "completed") return false;
    const diff = Math.ceil((new Date(t.dueDate) - today) / 86400000);
    return diff >= 0 && diff <= 3;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 4);

  const hr    = new Date().getHours();
  const greet = hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening";
  const circ  = 2 * Math.PI * 25;
  const off   = circ - (rate / 100) * circ;
  const bars  = [28, 42, 18, 54, 36, 48, 32];

  const isOverdue = t => t.dueDate && new Date(t.dueDate) < today && t.status !== "completed";

  const fourthCard = stats.overdue > 0
    ? { cls: "scard-red",   num: stats.overdue, lbl: "Overdue",    ico: "⚠️", pct: 100 }
    : { cls: "scard-green", num: `${rate}%`,    lbl: "Completion", ico: "✅", pct: rate };

  return (
    <div className="dash">

      {/* Hero */}
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-body">
          <div>
            <div className={`hero-tag hero-tag-${role}`}>
              {isAdmin ? "🔑 Administrator" : "👤 Team Member"}
            </div>
            <div className="hero-name">{greet}, {user?.name} 👋</div>
            <div className="hero-date">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
          <div className="hero-bars">
            {bars.map((h, i) => (
              <div key={i} className={`hero-bar${i === 5 ? " lit" : ""}`} style={{ height: h }} />
            ))}
          </div>
        </div>
      </div>

      {/* Admin quick actions */}
      {isAdmin && (
        <div className="quick-row">
          <Link to="/tasks" state={{ openCreate: true }} className="qcard qcard-create">
            <div className="qcard-ico">➕</div>
            <div>
              <div className="qcard-title">Create New Task</div>
              <div className="qcard-sub">Assign work to a team member</div>
            </div>
          </Link>
          <Link to="/tasks" className="qcard qcard-manage">
            <div className="qcard-ico">📋</div>
            <div>
              <div className="qcard-title">Manage All Tasks</div>
              <div className="qcard-sub">Edit, reassign or track progress</div>
            </div>
          </Link>
        </div>
      )}

      {/* User progress banner */}
      {!isAdmin && (
        <div className="user-banner">
          <div className="ub-text">
            <h3>Your Task Progress</h3>
            <p>{stats.done} completed · {stats.prog} in progress · {stats.todo} remaining</p>
          </div>
          <div className="ub-ring">
            <div className="ring-wrap">
              <svg className="ring-svg" width="68" height="68" viewBox="0 0 68 68">
                <defs>
                  <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <circle className="ring-bg" cx="34" cy="34" r="25" strokeWidth="6" />
                <circle className="ring-fg" cx="34" cy="34" r="25" strokeWidth="6"
                  strokeDasharray={circ} strokeDashoffset={off} />
              </svg>
              <div className="ring-lbl">{rate}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {[
          { cls: "scard-purple", num: stats.total, lbl: "Total Tasks",  ico: "📋", pct: 100 },
          { cls: "scard-orange", num: stats.todo,  lbl: "To Do",        ico: "⏳", pct: stats.total ? (stats.todo / stats.total) * 100 : 0 },
          { cls: "scard-blue",   num: stats.prog,  lbl: "In Progress",  ico: "🔄", pct: stats.total ? (stats.prog / stats.total) * 100 : 0 },
          fourthCard,
        ].map(({ cls, num, lbl, ico, pct }) => (
          <div key={lbl} className={`scard ${cls}`}>
            <div className="scard-top">
              <div>
                <div className="scard-num">{num}</div>
                <div className="scard-lbl">{lbl}</div>
              </div>
              <div className="scard-ico">{ico}</div>
            </div>
            <div className="scard-bar">
              <div className="scard-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="dash-grid">

        {/* Task list */}
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">
              {isAdmin ? "Recent Task Activity" : "My Tasks"}
              <span className="panel-cnt">{tasks.length}</span>
            </span>
            <Link to="/tasks" className="panel-link">View all →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="dash-empty">
              {isAdmin ? "No tasks yet. Create one to get started." : "No tasks assigned to you yet."}
            </div>
          ) : recent.map(t => {
            const over = isOverdue(t);
            return (
              <div key={t.id} className={`trow trow-${isAdmin ? "admin" : "user"}`}>
                <div>
                  <div className="trow-name">{t.title}</div>
                  {isAdmin && t.assignedTo && <div className="trow-who">→ {t.assignedTo.name}</div>}
                </div>
                <span className={`badge badge-${t.priority}`}><span className="badge-dot" />{t.priority}</span>
                <span className={`badge badge-${over ? "overdue" : t.status}`}>
                  <span className="badge-dot" />
                  {over ? "Overdue" : t.status === "in_progress" ? "In Progress" : t.status === "completed" ? "Done" : "To Do"}
                </span>
                {isAdmin && (
                  <span style={{ fontSize: ".7rem", color: over ? "#fb7185" : "rgba(255,255,255,.26)" }}>
                    {fmtShort(t.dueDate)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Side column */}
        <div className="side-col">
          <div className="side-img">
            <div className="side-img-ov" />
            <div className="side-img-txt">
              <div className="side-img-label">Rynixsoft · DTMS</div>
              <div className="side-img-title">Built for high-performance teams</div>
            </div>
          </div>

          {dueSoon.length > 0 && (
            <div className="dl-card">
              <div className="dl-head">⚠️ Due Soon</div>
              {dueSoon.map(t => (
                <div key={t.id} className="dl-row">
                  <span className="dl-name">{t.title}</span>
                  <span className="dl-date">{fmtShort(t.dueDate)}</span>
                </div>
              ))}
            </div>
          )}

          {isAdmin ? (
            <div className="bkcard">
              <div className="bkcard-title">Task Breakdown</div>
              {[
                { lbl: "To Do",    cls: "bk-todo", val: stats.todo, pct: stats.total ? Math.round((stats.todo / stats.total) * 100) : 0 },
                { lbl: "Progress", cls: "bk-prog", val: stats.prog, pct: stats.total ? Math.round((stats.prog / stats.total) * 100) : 0 },
                { lbl: "Done",     cls: "bk-done", val: stats.done, pct: rate },
              ].map(({ lbl, cls, val, pct }) => (
                <div key={lbl} className="bk-row">
                  <div className="bk-lbl">{lbl}</div>
                  <div className="bk-track"><div className={`bk-fill ${cls}`} style={{ width: `${pct}%` }} /></div>
                  <div className="bk-num">{val}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ri-card">
              <div className="ring-wrap">
                <svg className="ring-svg" width="68" height="68" viewBox="0 0 68 68">
                  <defs>
                    <linearGradient id="rg2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                  <circle className="ring-bg" cx="34" cy="34" r="25" strokeWidth="6" />
                  <circle className="ring-fg" cx="34" cy="34" r="25" strokeWidth="6"
                    stroke="url(#rg2)" strokeDasharray={circ} strokeDashoffset={off} />
                </svg>
                <div className="ring-lbl">{rate}%</div>
              </div>
              <div className="ri-text">
                <h4>Progress</h4>
                <p>{stats.done} completed<br />{stats.prog} in progress<br />{stats.todo} remaining</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
