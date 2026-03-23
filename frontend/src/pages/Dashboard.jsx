import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";

const fixRole = r => (r === "player" || r === "Player") ? "user" : (r || "user");

const CSS = `
.dash { animation: fadeUp .45s ease both; }
@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

/* ── Hero Banner ── */
.D-hero {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  height: 200px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-end;
}
.D-hero__img {
  position: absolute;
  inset: 0;
  background-image: url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80');
  background-size: cover;
  background-position: center 30%;
  filter: brightness(.45) saturate(1.1);
}
.D-hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(15,10,40,.85) 0%, rgba(99,102,241,.25) 60%, transparent 100%);
}
.D-hero__content {
  position: relative;
  z-index: 2;
  padding: 1.5rem 2rem;
  width: 100%;
}
.D-hero__greeting {
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgba(255,255,255,.5);
  margin-bottom: .4rem;
}
.D-hero__name {
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.1;
  margin-bottom: .4rem;
  letter-spacing: -.02em;
}
.D-hero__meta {
  display: flex;
  align-items: center;
  gap: .75rem;
}
.D-hero__date {
  font-size: .78rem;
  color: rgba(255,255,255,.45);
}
.D-hero__role {
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  padding: .2rem .72rem;
  border-radius: 6px;
  font-size: .69rem;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.D-hero__role--admin { background: rgba(239,68,68,.2); border: 1px solid rgba(239,68,68,.35); color: #fca5a5; }
.D-hero__role--user  { background: rgba(74,222,128,.15); border: 1px solid rgba(74,222,128,.25); color: #86efac; }

/* ── Stats row ── */
.D-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.D-stat {
  border-radius: 14px;
  padding: 1.2rem 1.35rem;
  position: relative;
  overflow: hidden;
  transition: transform 200ms, box-shadow 200ms;
  cursor: default;
}
.D-stat:hover { transform: translateY(-3px); }
.D-stat--1 {
  background: linear-gradient(135deg, #1e1060, #312e81);
  border: 1px solid rgba(99,102,241,.3);
  box-shadow: 0 4px 20px rgba(79,70,229,.2);
}
.D-stat--2 {
  background: linear-gradient(135deg, #1c1010, #451a03);
  border: 1px solid rgba(251,146,60,.25);
  box-shadow: 0 4px 20px rgba(251,146,60,.1);
}
.D-stat--3 {
  background: linear-gradient(135deg, #0c1a38, #1e3a5f);
  border: 1px solid rgba(59,130,246,.25);
  box-shadow: 0 4px 20px rgba(59,130,246,.1);
}
.D-stat--4 {
  background: linear-gradient(135deg, #052e16, #14532d);
  border: 1px solid rgba(34,197,94,.25);
  box-shadow: 0 4px 20px rgba(34,197,94,.1);
}
.D-stat__glow {
  position: absolute;
  right: -20px; top: -20px;
  width: 100px; height: 100px;
  border-radius: 50%;
  filter: blur(28px);
  opacity: .35;
}
.D-stat--1 .D-stat__glow { background: #6366f1; }
.D-stat--2 .D-stat__glow { background: #f97316; }
.D-stat--3 .D-stat__glow { background: #3b82f6; }
.D-stat--4 .D-stat__glow { background: #22c55e; }
.D-stat__top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .9rem; }
.D-stat__ico { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; font-size: 1rem; background: rgba(255,255,255,.1); }
.D-stat__num { font-size: 2.1rem; font-weight: 800; color: #fff; line-height: 1; }
.D-stat__lbl { font-size: .71rem; color: rgba(255,255,255,.45); margin-top: .18rem; }
.D-stat__bar { height: 3px; background: rgba(255,255,255,.1); border-radius: 2px; overflow: hidden; }
.D-stat__bar-fill { height: 100%; border-radius: 2px; background: rgba(255,255,255,.4); transition: width .9s cubic-bezier(.22,1,.36,1); }

/* ── Admin quick links ── */
.D-quick { display: grid; grid-template-columns: repeat(2,1fr); gap: 1rem; margin-bottom: 1.5rem; }
.D-quick-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.3rem;
  border-radius: 13px;
  text-decoration: none;
  transition: all 180ms;
  position: relative;
  overflow: hidden;
}
.D-quick-card--create {
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  border: 1px solid rgba(99,102,241,.25);
}
.D-quick-card--manage {
  background: linear-gradient(135deg, #0f172a, #1e3a5f);
  border: 1px solid rgba(59,130,246,.2);
}
.D-quick-card:hover { transform: translateY(-2px); filter: brightness(1.1); }
.D-quick-ico { width: 44px; height: 44px; border-radius: 11px; display: grid; place-items: center; font-size: 1.15rem; flex-shrink: 0; background: rgba(255,255,255,.1); }
.D-quick-title { font-size: .86rem; font-weight: 700; color: #e2e8f0; }
.D-quick-sub   { font-size: .72rem; color: rgba(255,255,255,.35); margin-top: .1rem; }

/* ── Two column grid ── */
.D-grid { display: grid; grid-template-columns: 1fr 340px; gap: 1.25rem; }

/* ── Task table panel ── */
.D-panel {
  background: #0d1117;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px;
  overflow: hidden;
}
.D-panel__head {
  padding: .9rem 1.3rem;
  border-bottom: 1px solid rgba(255,255,255,.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255,255,255,.015);
}
.D-panel__title {
  font-size: .87rem;
  font-weight: 700;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: .45rem;
}
.D-panel__cnt {
  padding: .1rem .48rem;
  background: rgba(99,102,241,.15);
  border: 1px solid rgba(99,102,241,.2);
  border-radius: 5px;
  font-size: .67rem;
  font-weight: 700;
  color: #818cf8;
}
.D-panel__link { font-size: .73rem; color: #6366f1; text-decoration: none; font-weight: 500; }
.D-panel__link:hover { color: #818cf8; }
.D-tr {
  display: grid;
  gap: .75rem;
  padding: .82rem 1.3rem;
  border-bottom: 1px solid rgba(255,255,255,.035);
  transition: background 130ms;
  align-items: center;
}
.D-tr--admin { grid-template-columns: 1fr 80px 80px 60px; }
.D-tr--user  { grid-template-columns: 1fr 80px 90px; }
.D-tr:last-child { border-bottom: none; }
.D-tr:hover { background: rgba(255,255,255,.018); }
.D-tr-name  { font-size: .82rem; font-weight: 500; color: #cbd5e1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.D-tr-who   { font-size: .71rem; color: rgba(255,255,255,.28); margin-top: .12rem; }
.dp { display: inline-flex; align-items: center; gap: .27rem; padding: .19rem .52rem; border-radius: 5px; font-size: .68rem; font-weight: 600; white-space: nowrap; }
.dp-d { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.dp--todo        { background: rgba(255,255,255,.07); color: rgba(255,255,255,.42); }
.dp--in_progress { background: rgba(251,191,36,.12); color: #fbbf24; }
.dp--completed   { background: rgba(74,222,128,.12); color: #4ade80; }
.dp--low    { background: rgba(96,165,250,.1);  color: #60a5fa; }
.dp--medium { background: rgba(251,191,36,.1);  color: #fbbf24; }
.dp--high   { background: rgba(239,68,68,.1);   color: #f87171; }

/* ── Side panel (image card + user progress) ── */
.D-side { display: flex; flex-direction: column; gap: 1.1rem; }

.D-img-card {
  border-radius: 14px;
  overflow: hidden;
  height: 150px;
  position: relative;
}
.D-img-card__img {
  width: 100%; height: 100%;
  object-fit: cover;
  filter: brightness(.55) saturate(1.2);
}
.D-img-card__text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1rem 1.2rem;
  background: linear-gradient(0deg, rgba(0,0,0,.7) 0%, transparent 60%);
}
.D-img-card__label { font-size: .65rem; font-weight: 700; color: rgba(255,255,255,.55); letter-spacing: .1em; text-transform: uppercase; }
.D-img-card__title { font-size: .92rem; font-weight: 700; color: #fff; margin-top: .18rem; }

.D-progress-card {
  background: #0d1117;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px;
  padding: 1.2rem;
}
.D-prog__title { font-size: .83rem; font-weight: 700; color: #e2e8f0; margin-bottom: 1rem; }
.D-prog-item { display: flex; align-items: center; gap: .75rem; margin-bottom: .7rem; }
.D-prog-item:last-child { margin-bottom: 0; }
.D-prog-label { font-size: .74rem; color: rgba(255,255,255,.45); width: 65px; flex-shrink: 0; }
.D-prog-track { flex: 1; height: 6px; background: rgba(255,255,255,.07); border-radius: 3px; overflow: hidden; }
.D-prog-fill  { height: 100%; border-radius: 3px; transition: width .9s cubic-bezier(.22,1,.36,1); }
.D-prog-fill--todo   { background: linear-gradient(90deg,#b45309,#fbbf24); }
.D-prog-fill--prog   { background: linear-gradient(90deg,#1d4ed8,#60a5fa); }
.D-prog-fill--done   { background: linear-gradient(90deg,#15803d,#4ade80); }
.D-prog-count { font-size: .72rem; font-weight: 700; color: rgba(255,255,255,.5); width: 18px; text-align: right; flex-shrink: 0; }

/* User progress ring */
.D-ring-card {
  background: #0d1117;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px;
  padding: 1.2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.D-ring-wrap { position: relative; width: 72px; height: 72px; flex-shrink: 0; }
.D-ring-svg  { transform: rotate(-90deg); }
.D-ring-bg   { fill: none; stroke: rgba(255,255,255,.06); stroke-width: 6; }
.D-ring-fg   { fill: none; stroke: url(#ringGrad); stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset .9s ease; }
.D-ring-label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: .85rem; font-weight: 800; color: #818cf8; }
.D-ring-text h4 { font-size: .84rem; font-weight: 700; color: #e2e8f0; margin-bottom: .3rem; }
.D-ring-text p  { font-size: .73rem; color: rgba(255,255,255,.35); line-height: 1.55; }

.D-empty { padding: 2.5rem; text-align: center; color: rgba(255,255,255,.2); font-size: .82rem; }
.D-loader { display: flex; align-items: center; justify-content: center; min-height: 60vh; gap: .75rem; color: rgba(255,255,255,.28); }
.D-spin { width: 22px; height: 22px; border: 2.5px solid rgba(99,102,241,.2); border-top-color: #6366f1; border-radius: 50%; animation: dspin .7s linear infinite; }
@keyframes dspin { to { transform: rotate(360deg) } }

@media(max-width:900px) {
  .D-stats { grid-template-columns: 1fr 1fr; }
  .D-grid  { grid-template-columns: 1fr; }
  .D-quick { grid-template-columns: 1fr; }
}
`;

const fmt = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short"}) : "—";

export default function Dashboard() {
  const navigate  = useNavigate();
  const [user,    setUser]    = useState(null);
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const photo = localStorage.getItem("dtms_photo");

  useEffect(() => {
    if (!document.getElementById("dash-css")) {
      const s = document.createElement("style"); s.id = "dash-css"; s.textContent = CSS; document.head.appendChild(s);
    }
    Promise.all([axios.get("/auth/me"), axios.get("/tasks")])
      .then(([me, t]) => { setUser(me.data.user); setTasks(t.data.tasks); })
      .catch(() => navigate("/", { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="D-loader"><div className="D-spin"/> Loading...</div>;

  const role    = fixRole(user?.role);
  const isAdmin = role === "admin";
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";
  const stats   = {
    total: tasks.length,
    todo:  tasks.filter(t => t.status === "todo").length,
    prog:  tasks.filter(t => t.status === "in_progress").length,
    done:  tasks.filter(t => t.status === "completed").length,
  };
  const rate   = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const recent = [...tasks].sort((a,b) => new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0, 6);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // SVG ring
  const circ      = 2 * Math.PI * 26;
  const dashOff   = circ - (rate / 100) * circ;

  return (
    <div className="dash">

      {/* ── Hero ── */}
      <div className="D-hero">
        <div className="D-hero__img"/>
        <div className="D-hero__overlay"/>
        <div className="D-hero__content">
          <p className="D-hero__greeting">{greeting}</p>
          <h1 className="D-hero__name">{user?.name} 👋</h1>
          <div className="D-hero__meta">
            <span className={`D-hero__role D-hero__role--${role}`}>
              {isAdmin ? "🔑 Administrator" : "👤 Team Member"}
            </span>
            <span className="D-hero__date">
              {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
            </span>
          </div>
        </div>
      </div>

      {/* ── Admin quick actions ── */}
      {isAdmin && (
        <div className="D-quick">
          <Link to="/tasks" state={{openCreate:true}} className="D-quick-card D-quick-card--create">
            <div className="D-quick-ico">➕</div>
            <div>
              <div className="D-quick-title">Create New Task</div>
              <div className="D-quick-sub">Assign work to a team member</div>
            </div>
          </Link>
          <Link to="/tasks" className="D-quick-card D-quick-card--manage">
            <div className="D-quick-ico">📋</div>
            <div>
              <div className="D-quick-title">Manage All Tasks</div>
              <div className="D-quick-sub">Edit, reassign or track progress</div>
            </div>
          </Link>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="D-stats">
        {[
          { cls:"D-stat--1", num:stats.total, lbl:"Total Tasks",    ico:"📋", w:"100%"  },
          { cls:"D-stat--2", num:stats.todo,  lbl:"To Do",          ico:"⏳", w:stats.total?`${(stats.todo/stats.total)*100}%`:"0%" },
          { cls:"D-stat--3", num:stats.prog,  lbl:"In Progress",    ico:"🔄", w:stats.total?`${(stats.prog/stats.total)*100}%`:"0%" },
          { cls:"D-stat--4", num:`${rate}%`,  lbl:"Completion Rate",ico:"✅", w:`${rate}%` },
        ].map(({cls,num,lbl,ico,w}) => (
          <div key={lbl} className={`D-stat ${cls}`}>
            <div className="D-stat__glow"/>
            <div className="D-stat__top">
              <div><div className="D-stat__num">{num}</div><div className="D-stat__lbl">{lbl}</div></div>
              <div className="D-stat__ico">{ico}</div>
            </div>
            <div className="D-stat__bar"><div className="D-stat__bar-fill" style={{width:w}}/></div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="D-grid">

        {/* Recent tasks */}
        <div className="D-panel">
          <div className="D-panel__head">
            <span className="D-panel__title">
              {isAdmin ? "All Task Activity" : "My Tasks"}
              <span className="D-panel__cnt">{tasks.length}</span>
            </span>
            <Link to="/tasks" className="D-panel__link">View all →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="D-empty">
              {isAdmin ? "No tasks yet. Create one to get started." : "No tasks assigned yet."}
            </div>
          ) : recent.map(t => (
            <div key={t.id} className={`D-tr D-tr--${isAdmin?"admin":"user"}`}>
              <div>
                <div className="D-tr-name">{t.title}</div>
                {isAdmin && t.assignedTo && <div className="D-tr-who">→ {t.assignedTo.name}</div>}
              </div>
              <span className={`dp dp--${t.priority}`}><span className="dp-d"/>{t.priority}</span>
              <span className={`dp dp--${t.status}`}><span className="dp-d"/>{t.status==="in_progress"?"In Progress":t.status==="completed"?"Done":"To Do"}</span>
              {isAdmin && <span style={{fontSize:".7rem",color:"rgba(255,255,255,.28)"}}>{fmt(t.dueDate)}</span>}
            </div>
          ))}
        </div>

        {/* Side cards */}
        <div className="D-side">

          {/* Unsplash image card */}
          <div className="D-img-card">
            <img
              className="D-img-card__img"
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop&q=75"
              alt="team collaboration"
              loading="lazy"
            />
            <div className="D-img-card__text">
              <div className="D-img-card__label">Rynixsoft · DTMS</div>
              <div className="D-img-card__title">Built for high-performance teams</div>
            </div>
          </div>

          {/* Progress or ring */}
          {isAdmin ? (
            <div className="D-progress-card">
              <div className="D-prog__title">Task Breakdown</div>
              {[
                { label:"To Do",      fill:"todo",  count:stats.todo, pct: stats.total?Math.round((stats.todo/stats.total)*100):0 },
                { label:"In Progress",fill:"prog",  count:stats.prog, pct: stats.total?Math.round((stats.prog/stats.total)*100):0 },
                { label:"Completed",  fill:"done",  count:stats.done, pct: rate },
              ].map(({label,fill,count,pct}) => (
                <div key={fill} className="D-prog-item">
                  <div className="D-prog-label">{label}</div>
                  <div className="D-prog-track"><div className={`D-prog-fill D-prog-fill--${fill}`} style={{width:`${pct}%`}}/></div>
                  <div className="D-prog-count">{count}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="D-ring-card">
              <div className="D-ring-wrap">
                <svg className="D-ring-svg" width="72" height="72" viewBox="0 0 72 72">
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="#4f46e5"/>
                      <stop offset="100%" stopColor="#818cf8"/>
                    </linearGradient>
                  </defs>
                  <circle className="D-ring-bg" cx="36" cy="36" r="26"/>
                  <circle className="D-ring-fg" cx="36" cy="36" r="26"
                    strokeDasharray={circ} strokeDashoffset={dashOff}/>
                </svg>
                <div className="D-ring-label">{rate}%</div>
              </div>
              <div className="D-ring-text">
                <h4>Your Progress</h4>
                <p>
                  {stats.done} completed<br/>
                  {stats.prog} in progress<br/>
                  {stats.todo} remaining
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}