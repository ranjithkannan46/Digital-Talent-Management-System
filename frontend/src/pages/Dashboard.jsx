import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import "../styles/dashboard.css";

const fixRole = r => (!r || r === "player" || r === "Player") ? "user" : r;

const fmt = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short"}) : "—";

export default function Dashboard() {
  const navigate=useNavigate();
  const [user,setUser]=useState(null);
  const [tasks,setTasks]=useState([]);
  const [loading,setLoading]=useState(true);
  const photo=localStorage.getItem("dtms_photo");

  useEffect(()=>{
Promise.all([axios.get("/auth/me"),axios.get("/tasks")])
      .then(([me,t])=>{setUser(me.data.user);setTasks(t.data.tasks);})
      .catch(()=>navigate("/",{replace:true}))
      .finally(()=>setLoading(false));
  },[navigate]);

  if(loading) return <div className="D-loader"><div className="D-sp"/> Loading...</div>;

  const role=fixRole(user?.role);
  const isAdmin=role==="admin";
  const initial=user?.name?.charAt(0)?.toUpperCase()||"U";
  const stats={total:tasks.length,todo:tasks.filter(t=>t.status==="todo").length,prog:tasks.filter(t=>t.status==="in_progress").length,done:tasks.filter(t=>t.status==="completed").length};
  const rate=stats.total>0?Math.round((stats.done/stats.total)*100):0;
  const recent=[...tasks].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,6);
  const hr=new Date().getHours();
  const greet=hr<12?"Good Morning":hr<17?"Good Afternoon":"Good Evening";
  const circ=2*Math.PI*25;
  const dashOff=circ-(rate/100)*circ;

  return (
    <div className="dash">

      {/* Hero */}
      <div className="D-hero">
        <div className="D-hero-img"/>
        <div className="D-hero-overlay"/>
        <div className="D-hero-content">
          <div className={`D-hero-tag D-hero-tag--${role}`}>{isAdmin?"🔑 Administrator":"👤 Team Member"}</div>
          <div className="D-hero-name">{greet}, {user?.name} 👋</div>
          <div className="D-hero-date">{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        </div>
      </div>

      {/* Admin actions */}
      {isAdmin&&(
        <div className="D-actions">
          <Link to="/tasks" state={{openCreate:true}} className="D-ac D-ac--new">
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
      {!isAdmin&&(
        <div className="D-user-hero">
          <div className="D-user-hero-text">
            <h3>Your Task Progress</h3>
            <p>{stats.done} completed · {stats.prog} in progress · {stats.todo} remaining</p>
          </div>
          <div className="D-user-hero-ring">
            <div className="D-ring-wrap" style={{width:65,height:65}}>
              <svg className="D-ring-svg" width="65" height="65" viewBox="0 0 65 65">
                <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient></defs>
                <circle className="D-ring-bg" cx="32" cy="32" r="25" strokeWidth="6"/>
                <circle className="D-ring-fg" cx="32" cy="32" r="25" strokeWidth="6" strokeDasharray={circ} strokeDashoffset={dashOff}/>
              </svg>
              <div className="D-ring-num">{rate}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="D-stats">
        {[
          {cls:"SC-1",num:stats.total,lbl:"Total Tasks",ico:"📋",w:"100%"},
          {cls:"SC-2",num:stats.todo, lbl:"To Do",      ico:"⏳",w:stats.total?`${(stats.todo/stats.total)*100}%`:"0%"},
          {cls:"SC-3",num:stats.prog, lbl:"In Progress",ico:"🔄",w:stats.total?`${(stats.prog/stats.total)*100}%`:"0%"},
          {cls:"SC-4",num:`${rate}%`, lbl:"Completion", ico:"✅",w:`${rate}%`},
        ].map(({cls,num,lbl,ico,w})=>(
          <div key={lbl} className={`SC ${cls}`}>
            <div className="SC-glow"/>
            <div className="SC-top">
              <div><div className="SC-num">{num}</div><div className="SC-lbl">{lbl}</div></div>
              <div className="SC-ico">{ico}</div>
            </div>
            <div className="SC-bar"><div className="SC-fill" style={{width:w}}/></div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="D-grid">
        <div className="D-panel">
          <div className="D-ph">
            <span className="D-ph-title">{isAdmin?"All Task Activity":"My Tasks"}<span className="D-ph-cnt">{tasks.length}</span></span>
            <Link to="/tasks" className="D-ph-link">View all →</Link>
          </div>
          {recent.length===0?(
            <div className="D-empty">{isAdmin?"No tasks yet. Create one to get started.":"No tasks assigned to you yet."}</div>
          ):recent.map(t=>(
            <div key={t.id} className={`D-tr D-tr-${isAdmin?"admin":"user"}`}>
              <div><div className="D-tr-name">{t.title}</div>{isAdmin&&t.assignedTo&&<div className="D-tr-who">→ {t.assignedTo.name}</div>}</div>
              <span className={`p p-${t.priority}`}><span className="pd"/>{t.priority}</span>
              <span className={`p p-${t.status}`}><span className="pd"/>{t.status==="in_progress"?"In Progress":t.status==="completed"?"Done":"To Do"}</span>
              {isAdmin&&<span style={{fontSize:".7rem",color:"rgba(255,255,255,.26)"}}>{fmt(t.dueDate)}</span>}
            </div>
          ))}
        </div>

        <div className="D-side">
          <div className="D-img-a">
            <div className="D-img-overlay"/>
            <div className="D-img-text"><div className="D-img-label">Rynixsoft · DTMS</div><div className="D-img-title">Built for high-performance teams</div></div>
          </div>

          {isAdmin?(
            <div className="D-prog-card">
              <div className="D-prog-title">Task Breakdown</div>
              {[
                {key:"To Do",   cls:"todo",w:stats.total?Math.round((stats.todo/stats.total)*100):0,n:stats.todo},
                {key:"Progress",cls:"prog",w:stats.total?Math.round((stats.prog/stats.total)*100):0,n:stats.prog},
                {key:"Done",    cls:"done",w:rate,n:stats.done},
              ].map(({key,cls,w,n})=>(
                <div key={key} className="D-prog-row">
                  <div className="D-prog-key">{key}</div>
                  <div className="D-prog-track"><div className={`D-prog-fill D-prog-fill-${cls}`} style={{width:`${w}%`}}/></div>
                  <div className="D-prog-num">{n}</div>
                </div>
              ))}
            </div>
          ):(
            <div className="D-img-b">
              <div className="D-img-overlay"/>
              <div className="D-img-text"><div className="D-img-label">Team collaboration</div><div className="D-img-title">Work smart, deliver fast</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}