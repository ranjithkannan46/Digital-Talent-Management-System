import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";

const fixRole = r => (!r || r === "player" || r === "Player") ? "user" : r;

const CSS = `
.dash{animation:fadeUp .4s ease both;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

/* ── Hero ── */
.D-hero{
  position:relative;border-radius:20px;overflow:hidden;
  height:220px;margin-bottom:1.5rem;display:flex;align-items:flex-end;
}
.D-hero-img{
  position:absolute;inset:0;
  background:url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&auto=format&fit=crop&q=80') center/cover;
  filter:brightness(.4) saturate(1.2);transition:filter .3s;
}
.D-hero:hover .D-hero-img{filter:brightness(.45) saturate(1.2);}
.D-hero-overlay{position:absolute;inset:0;background:linear-gradient(100deg,rgba(0,0,0,.85) 0%,rgba(30,10,60,.6) 55%,rgba(0,0,0,.15) 100%);}
.D-hero-content{position:relative;z-index:2;padding:1.6rem 2rem;width:100%;}
.D-hero-tag{display:inline-flex;align-items:center;gap:.35rem;padding:.22rem .75rem;border-radius:6px;font-size:.65rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:.55rem;}
.D-hero-tag--admin{background:rgba(251,113,133,.18);border:1px solid rgba(251,113,133,.3);color:#fda4af;}
.D-hero-tag--user{background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.25);color:#6ee7b7;}
.D-hero-name{font-size:2rem;font-weight:800;color:#fff;line-height:1.1;margin-bottom:.35rem;letter-spacing:-.025em;}
.D-hero-date{font-size:.79rem;color:rgba(255,255,255,.4);}

/* ── 4 colorful stat cards ── */
.D-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.5rem;}
.SC{border-radius:14px;padding:1.25rem 1.3rem;position:relative;overflow:hidden;transition:transform 200ms;cursor:default;}
.SC:hover{transform:translateY(-3px);}
.SC-1{background:linear-gradient(140deg,#1a0533,#2d1060);border:1px solid rgba(167,139,250,.2);}
.SC-2{background:linear-gradient(140deg,#1c0a00,#4a1500);border:1px solid rgba(251,146,60,.2);}
.SC-3{background:linear-gradient(140deg,#001429,#002952);border:1px solid rgba(56,189,248,.18);}
.SC-4{background:linear-gradient(140deg,#001a10,#003322);border:1px solid rgba(52,211,153,.18);}
.SC-glow{position:absolute;right:-15px;top:-15px;width:90px;height:90px;border-radius:50%;filter:blur(25px);opacity:.4;pointer-events:none;}
.SC-1 .SC-glow{background:#7c3aed;} .SC-2 .SC-glow{background:#ea580c;} .SC-3 .SC-glow{background:#0ea5e9;} .SC-4 .SC-glow{background:#10b981;}
.SC-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.85rem;}
.SC-ico{width:36px;height:36px;border-radius:9px;display:grid;place-items:center;font-size:.95rem;background:rgba(255,255,255,.1);}
.SC-num{font-size:2rem;font-weight:800;color:#fff;line-height:1;}
.SC-lbl{font-size:.7rem;color:rgba(255,255,255,.42);margin-top:.16rem;}
.SC-bar{height:3px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden;}
.SC-fill{height:100%;border-radius:2px;transition:width .9s cubic-bezier(.22,1,.36,1);}
.SC-1 .SC-fill{background:linear-gradient(90deg,#7c3aed,#c4b5fd);}
.SC-2 .SC-fill{background:linear-gradient(90deg,#c2410c,#fb923c);}
.SC-3 .SC-fill{background:linear-gradient(90deg,#0369a1,#38bdf8);}
.SC-4 .SC-fill{background:linear-gradient(90deg,#065f46,#34d399);}

/* Admin action cards */
.D-actions{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;}
.D-ac{
  display:flex;align-items:center;gap:.9rem;
  padding:1.1rem 1.3rem;border-radius:13px;
  text-decoration:none;transition:all 180ms;
  position:relative;overflow:hidden;
}
.D-ac--new{background:linear-gradient(140deg,#1e1060,#2d1b69);border:1px solid rgba(167,139,250,.2);}
.D-ac--manage{background:linear-gradient(140deg,#0a1628,#102040);border:1px solid rgba(56,189,248,.15);}
.D-ac:hover{transform:translateY(-2px);filter:brightness(1.12);}
.D-ac-ico{width:44px;height:44px;border-radius:11px;display:grid;place-items:center;font-size:1.1rem;flex-shrink:0;background:rgba(255,255,255,.1);}
.D-ac-title{font-size:.85rem;font-weight:700;color:#e2e8f0;margin-bottom:.1rem;}
.D-ac-sub{font-size:.71rem;color:rgba(255,255,255,.32);}

/* Content grid */
.D-grid{display:grid;grid-template-columns:1fr 330px;gap:1.25rem;}

/* Task panel */
.D-panel{background:#0e1220;border:1px solid rgba(255,255,255,.065);border-radius:14px;overflow:hidden;}
.D-ph{padding:.9rem 1.3rem;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.015);}
.D-ph-title{font-size:.86rem;font-weight:700;color:#e2e8f0;display:flex;align-items:center;gap:.45rem;}
.D-ph-cnt{padding:.1rem .48rem;background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.2);border-radius:5px;font-size:.67rem;font-weight:700;color:#a78bfa;}
.D-ph-link{font-size:.73rem;color:#7c3aed;text-decoration:none;font-weight:500;} .D-ph-link:hover{color:#a78bfa;}
.D-tr{display:grid;gap:.75rem;padding:.82rem 1.3rem;border-bottom:1px solid rgba(255,255,255,.04);transition:background 130ms;align-items:center;}
.D-tr-admin{grid-template-columns:1fr 85px 90px 55px;}
.D-tr-user{grid-template-columns:1fr 85px 90px;}
.D-tr:last-child{border-bottom:none;} .D-tr:hover{background:rgba(255,255,255,.018);}
.D-tr-name{font-size:.82rem;font-weight:500;color:#cbd5e1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.D-tr-who{font-size:.7rem;color:rgba(255,255,255,.26);margin-top:.1rem;}
.p{display:inline-flex;align-items:center;gap:.27rem;padding:.2rem .52rem;border-radius:5px;font-size:.68rem;font-weight:600;white-space:nowrap;}
.pd{width:5px;height:5px;border-radius:50%;background:currentColor;}
.p-todo{background:rgba(255,255,255,.07);color:rgba(255,255,255,.42);}
.p-in_progress{background:rgba(251,191,36,.12);color:#fbbf24;}
.p-completed{background:rgba(52,211,153,.12);color:#34d399;}
.p-low{background:rgba(56,189,248,.1);color:#38bdf8;}
.p-medium{background:rgba(251,191,36,.1);color:#fbbf24;}
.p-high{background:rgba(251,113,133,.1);color:#fb7185;}

/* Side column */
.D-side{display:flex;flex-direction:column;gap:1rem;}

/* Image cards in side */
.D-img-a{
  border-radius:14px;overflow:hidden;height:145px;position:relative;display:flex;align-items:flex-end;
  background:url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&auto=format&fit=crop&q=75') center/cover;
}
.D-img-b{
  border-radius:14px;overflow:hidden;height:125px;position:relative;display:flex;align-items:flex-end;
  background:url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=75') center/cover;
}
.D-img-overlay{position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.72) 0%,transparent 60%);}
.D-img-text{position:relative;z-index:2;padding:.85rem 1rem;}
.D-img-label{font-size:.6rem;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.1em;text-transform:uppercase;}
.D-img-title{font-size:.85rem;font-weight:700;color:#fff;margin-top:.12rem;}

/* Progress bar card */
.D-prog-card{background:#0e1220;border:1px solid rgba(255,255,255,.065);border-radius:14px;padding:1.2rem;}
.D-prog-title{font-size:.83rem;font-weight:700;color:#e2e8f0;margin-bottom:.9rem;}
.D-prog-row{display:flex;align-items:center;gap:.75rem;margin-bottom:.65rem;}
.D-prog-row:last-child{margin-bottom:0;}
.D-prog-key{font-size:.73rem;color:rgba(255,255,255,.4);width:70px;flex-shrink:0;}
.D-prog-track{flex:1;height:7px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden;}
.D-prog-fill{height:100%;border-radius:4px;transition:width .9s cubic-bezier(.22,1,.36,1);}
.D-prog-fill-todo{background:linear-gradient(90deg,#c2410c,#fb923c);}
.D-prog-fill-prog{background:linear-gradient(90deg,#0369a1,#38bdf8);}
.D-prog-fill-done{background:linear-gradient(90deg,#065f46,#34d399);}
.D-prog-num{font-size:.72rem;font-weight:700;color:rgba(255,255,255,.45);width:18px;text-align:right;flex-shrink:0;}

/* Ring */
.D-ring-card{background:#0e1220;border:1px solid rgba(255,255,255,.065);border-radius:14px;padding:1.15rem;display:flex;align-items:center;gap:1rem;}
.D-ring-wrap{position:relative;width:70px;height:70px;flex-shrink:0;}
.D-ring-svg{transform:rotate(-90deg);}
.D-ring-bg{fill:none;stroke:rgba(255,255,255,.06);stroke-width:7;}
.D-ring-fg{fill:none;stroke:url(#rg);stroke-width:7;stroke-linecap:round;transition:stroke-dashoffset .9s ease;}
.D-ring-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:.82rem;font-weight:800;color:#a78bfa;}
.D-ring-info h4{font-size:.83rem;font-weight:700;color:#e2e8f0;margin-bottom:.28rem;}
.D-ring-info p{font-size:.72rem;color:rgba(255,255,255,.34);line-height:1.55;}

/* User hero with image */
.D-user-hero{
  border-radius:14px;overflow:hidden;position:relative;
  margin-bottom:1.5rem;padding:1.5rem 2rem;
  background:url('https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=1000&auto=format&fit=crop&q=75') center/cover;
  display:flex;align-items:center;gap:1.5rem;min-height:130px;
}
.D-user-hero::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.85) 0%,rgba(0,0,0,.5) 60%,transparent 100%);}
.D-user-hero-text{position:relative;z-index:1;}
.D-user-hero-text h3{font-size:1rem;font-weight:700;color:#fff;margin-bottom:.2rem;}
.D-user-hero-text p{font-size:.78rem;color:rgba(255,255,255,.45);}
.D-user-hero-ring{position:relative;z-index:1;margin-left:auto;}

.D-empty{padding:2.5rem;text-align:center;color:rgba(255,255,255,.2);font-size:.82rem;}
.D-loader{display:flex;align-items:center;justify-content:center;min-height:60vh;gap:.75rem;color:rgba(255,255,255,.28);}
.D-sp{width:22px;height:22px;border:2.5px solid rgba(124,58,237,.2);border-top-color:#7c3aed;border-radius:50%;animation:dsp .7s linear infinite;}
@keyframes dsp{to{transform:rotate(360deg)}}

@media(max-width:900px){.D-stats{grid-template-columns:1fr 1fr;}.D-grid{grid-template-columns:1fr;}.D-actions{grid-template-columns:1fr;}}
`;

// Inject styles immediately on module load (prevents flash on navigation)
(() => {
  if (typeof document !== 'undefined' && !document.getElementById('dash-css')) {
    const _s = document.createElement('style');
    _s.id = 'dash-css';
    _s.textContent = CSS;
    document.head.appendChild(_s);
  }
})();



const fmt = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const photo = localStorage.getItem("dtms_photo");

  useEffect(() => {
    Promise.all([axios.get("/auth/me"), axios.get("/tasks")])
      .then(([me, t]) => { setUser(me.data.user); setTasks(t.data.tasks); })
      .catch(() => navigate("/", { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="D-loader"><div className="D-sp" /> Loading...</div>;

  const role = fixRole(user?.role);
  const isAdmin = role === "admin";
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";
  const stats = { total: tasks.length, todo: tasks.filter(t => t.status === "todo").length, prog: tasks.filter(t => t.status === "in_progress").length, done: tasks.filter(t => t.status === "completed").length };
  const rate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const recent = [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6);
  const hr = new Date().getHours();
  const greet = hr < 12 ? "Good Morning" : hr < 17 ? "Good Afternoon" : "Good Evening";
  const circ = 2 * Math.PI * 25;
  const dashOff = circ - (rate / 100) * circ;

  return (
    <div className="dash">

      {/* Hero */}
      <div className="D-hero">
        <div className="D-hero-img" />
        <div className="D-hero-overlay" />
        <div className="D-hero-content">
          <div className={`D-hero-tag D-hero-tag--${role}`}>{isAdmin ? "🔑 Administrator" : "👤 Team Member"}</div>
          <div className="D-hero-name">{greet}, {user?.name} 👋</div>
          <div className="D-hero-date">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div className="D-actions">
          <Link to="/tasks" state={{ openCreate: true }} className="D-ac D-ac--new">
            <div className="D-ac-ico">➕</div>
            <div><div className="D-ac-title">Create New Task</div><div className="D-ac-sub">Assign work to a team member</div></div>
          </Link>
          <Link to="/tasks" className="D-ac D-ac--manage">
            <div className="D-ac-ico">📋</div>
            <div><div className="D-ac-title">Manage All Tasks</div><div className="D-ac-sub">Edit, reassign or track progress</div></div>
          </Link>
        </div>
      )}

      {/* User progress hero */}
      {!isAdmin && (
        <div className="D-user-hero">
          <div className="D-user-hero-text">
            <h3>Your Task Progress</h3>
            <p>{stats.done} completed · {stats.prog} in progress · {stats.todo} remaining</p>
          </div>
          <div className="D-user-hero-ring">
            <div className="D-ring-wrap" style={{ width: 65, height: 65 }}>
              <svg className="D-ring-svg" width="65" height="65" viewBox="0 0 65 65">
                <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#a78bfa" /></linearGradient></defs>
                <circle className="D-ring-bg" cx="32" cy="32" r="25" strokeWidth="6" />
                <circle className="D-ring-fg" cx="32" cy="32" r="25" strokeWidth="6" strokeDasharray={circ} strokeDashoffset={dashOff} />
              </svg>
              <div className="D-ring-num">{rate}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="D-stats">
        {[
          { cls: "SC-1", num: stats.total, lbl: "Total Tasks", ico: "📋", w: "100%" },
          { cls: "SC-2", num: stats.todo, lbl: "To Do", ico: "⏳", w: stats.total ? `${(stats.todo / stats.total) * 100}%` : "0%" },
          { cls: "SC-3", num: stats.prog, lbl: "In Progress", ico: "🔄", w: stats.total ? `${(stats.prog / stats.total) * 100}%` : "0%" },
          { cls: "SC-4", num: `${rate}%`, lbl: "Completion", ico: "✅", w: `${rate}%` },
        ].map(({ cls, num, lbl, ico, w }) => (
          <div key={lbl} className={`SC ${cls}`}>
            <div className="SC-glow" />
            <div className="SC-top">
              <div><div className="SC-num">{num}</div><div className="SC-lbl">{lbl}</div></div>
              <div className="SC-ico">{ico}</div>
            </div>
            <div className="SC-bar"><div className="SC-fill" style={{ width: w }} /></div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="D-grid">
        <div className="D-panel">
          <div className="D-ph">
            <span className="D-ph-title">{isAdmin ? "All Task Activity" : "My Tasks"}<span className="D-ph-cnt">{tasks.length}</span></span>
            <Link to="/tasks" className="D-ph-link">View all →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="D-empty">{isAdmin ? "No tasks yet. Create one to get started." : "No tasks assigned to you yet."}</div>
          ) : recent.map(t => (
            <div key={t.id} className={`D-tr D-tr-${isAdmin ? "admin" : "user"}`}>
              <div><div className="D-tr-name">{t.title}</div>{isAdmin && t.assignedTo && <div className="D-tr-who">→ {t.assignedTo.name}</div>}</div>
              <span className={`p p-${t.priority}`}><span className="pd" />{t.priority}</span>
              <span className={`p p-${t.status}`}><span className="pd" />{t.status === "in_progress" ? "In Progress" : t.status === "completed" ? "Done" : "To Do"}</span>
              {isAdmin && <span style={{ fontSize: ".7rem", color: "rgba(255,255,255,.26)" }}>{fmt(t.dueDate)}</span>}
            </div>
          ))}
        </div>

        <div className="D-side">
          <div className="D-img-a">
            <div className="D-img-overlay" />
            <div className="D-img-text"><div className="D-img-label">Rynixsoft · DTMS</div><div className="D-img-title">Built for high-performance teams</div></div>
          </div>

          {isAdmin ? (
            <div className="D-prog-card">
              <div className="D-prog-title">Task Breakdown</div>
              {[
                { key: "To Do", cls: "todo", w: stats.total ? Math.round((stats.todo / stats.total) * 100) : 0, n: stats.todo },
                { key: "Progress", cls: "prog", w: stats.total ? Math.round((stats.prog / stats.total) * 100) : 0, n: stats.prog },
                { key: "Done", cls: "done", w: rate, n: stats.done },
              ].map(({ key, cls, w, n }) => (
                <div key={key} className="D-prog-row">
                  <div className="D-prog-key">{key}</div>
                  <div className="D-prog-track"><div className={`D-prog-fill D-prog-fill-${cls}`} style={{ width: `${w}%` }} /></div>
                  <div className="D-prog-num">{n}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="D-img-b">
              <div className="D-img-overlay" />
              <div className="D-img-text"><div className="D-img-label">Team collaboration</div><div className="D-img-title">Work smart, deliver fast</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}