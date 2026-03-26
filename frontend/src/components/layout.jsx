import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";

const fixRole = r => (!r || r === "player" || r === "Player") ? "user" : r;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;}
body{font-family:'Inter',sans-serif;background:#0c0f1a;color:#e2e8f0;-webkit-font-smoothing:antialiased;}
::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px;}
.app-shell{display:flex;min-height:100vh;}
.sidebar{width:215px;flex-shrink:0;background:#10141e;border-right:1px solid rgba(255,255,255,.055);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:200;}
.sb-brand{padding:1.25rem 1.1rem 1rem;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;gap:.7rem;}
.sb-brand-icon{width:34px;height:34px;background:linear-gradient(135deg,#7c3aed,#5b21b6);border-radius:9px;display:grid;place-items:center;font-size:.58rem;font-weight:800;color:#fff;letter-spacing:.04em;flex-shrink:0;box-shadow:0 4px 12px rgba(124,58,237,.35);}
.sb-brand-name{font-size:.68rem;font-weight:600;color:rgba(255,255,255,.4);line-height:1.4;}
.sb-nav{flex:1;padding:.6rem 0;}
.sb-section{font-size:.58rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.18);padding:.65rem 1.05rem .25rem;}
.sb-link{display:flex;align-items:center;gap:.6rem;padding:.56rem .82rem;margin:.05rem .45rem;border-radius:7px;font-size:.8rem;font-weight:500;color:rgba(255,255,255,.38);text-decoration:none;transition:all 140ms ease;position:relative;}
.sb-link:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.7);}
.sb-link.on{background:rgba(124,58,237,.15);color:#a78bfa;font-weight:600;}
.sb-link.on::before{content:'';position:absolute;left:-.45rem;top:22%;bottom:22%;width:2.5px;background:#7c3aed;border-radius:0 2px 2px 0;}
.sb-icon{font-size:.86rem;width:15px;text-align:center;flex-shrink:0;}
.sb-footer{padding:.75rem .65rem .9rem;border-top:1px solid rgba(255,255,255,.05);}
.sb-signout{width:100%;padding:.52rem;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.1);border-radius:7px;color:rgba(248,113,113,.6);font-family:'Inter',sans-serif;font-size:.74rem;font-weight:500;cursor:pointer;transition:all 140ms;display:flex;align-items:center;justify-content:center;gap:.35rem;}
.sb-signout:hover{background:rgba(239,68,68,.12);color:#f87171;}
.app-main{flex:1;margin-left:215px;min-height:100vh;display:flex;flex-direction:column;}
.topbar{position:sticky;top:0;z-index:150;background:rgba(12,15,26,.95);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.05);padding:.62rem 1.6rem;display:flex;align-items:center;justify-content:space-between;height:52px;}
.tb-title{font-size:.87rem;font-weight:600;color:#e2e8f0;}
.tb-right{display:flex;align-items:center;gap:.55rem;position:relative;}
.tb-bell{position:relative;width:33px;height:33px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:8px;display:grid;place-items:center;cursor:pointer;transition:all 140ms;font-size:.95rem;color:rgba(255,255,255,.5);}
.tb-bell:hover{background:rgba(255,255,255,.08);color:rgba(255,255,255,.85);}
.tb-badge{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;padding:0 3px;background:#ef4444;border-radius:999px;font-size:.58rem;font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;border:2px solid #0c0f1a;}
.notif-drawer{position:absolute;top:calc(100% + .5rem);right:0;background:#141929;border:1px solid rgba(255,255,255,.08);border-radius:12px;width:310px;max-height:400px;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.6);animation:ddIn .18s ease both;z-index:999;}
@keyframes ddIn{from{opacity:0;transform:translateY(-7px)}to{opacity:1;transform:translateY(0)}}
.nd-head{padding:.8rem 1rem .65rem;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.nd-head-title{font-size:.84rem;font-weight:700;color:#e2e8f0;}
.nd-mark{font-size:.71rem;color:#7c3aed;cursor:pointer;background:none;border:none;font-family:'Inter',sans-serif;padding:0;} .nd-mark:hover{color:#a78bfa;}
.nd-list{overflow-y:auto;flex:1;}
.nd-item{display:flex;gap:.7rem;align-items:flex-start;padding:.72rem 1rem;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;transition:background 120ms;}
.nd-item:last-child{border-bottom:none;} .nd-item:hover{background:rgba(255,255,255,.025);} .nd-item.unread{background:rgba(124,58,237,.06);}
.nd-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:.28rem;}
.nd-dot-a{background:#7c3aed;} .nd-dot-c{background:#10b981;} .nd-dot-u{background:#f59e0b;} .nd-dot-i{background:rgba(255,255,255,.25);}
.nd-title{font-size:.77rem;font-weight:600;color:#e2e8f0;margin-bottom:.12rem;} .nd-msg{font-size:.71rem;color:rgba(255,255,255,.38);line-height:1.45;} .nd-time{font-size:.64rem;color:rgba(255,255,255,.2);margin-top:.18rem;}
.nd-empty{padding:2rem;text-align:center;color:rgba(255,255,255,.22);font-size:.79rem;}
.tb-profile{display:flex;align-items:center;gap:.45rem;padding:.28rem .55rem .28rem .28rem;border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);transition:all 140ms;user-select:none;}
.tb-profile:hover{background:rgba(255,255,255,.07);}
.tb-av{width:27px;height:27px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#5b21b6);display:grid;place-items:center;font-size:.7rem;font-weight:700;color:#fff;flex-shrink:0;overflow:hidden;}
.tb-av img{width:100%;height:100%;object-fit:cover;}
.tb-name{font-size:.77rem;font-weight:600;color:rgba(255,255,255,.72);max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.tb-caret{font-size:.58rem;color:rgba(255,255,255,.28);transition:transform 140ms;} .tb-caret.open{transform:rotate(180deg);}
.tb-dd{position:absolute;top:calc(100% + .45rem);right:0;background:#141929;border:1px solid rgba(255,255,255,.08);border-radius:10px;min-width:185px;box-shadow:0 16px 40px rgba(0,0,0,.55);animation:ddIn .15s ease both;z-index:999;}
.dd-head{padding:.75rem .95rem .6rem;border-bottom:1px solid rgba(255,255,255,.06);} .dd-name{font-size:.82rem;font-weight:600;color:#f0f9ff;} .dd-role{font-size:.68rem;color:rgba(255,255,255,.3);text-transform:capitalize;margin-top:.07rem;}
.dd-item{display:flex;align-items:center;gap:.55rem;padding:.58rem .95rem;font-size:.78rem;color:rgba(255,255,255,.5);cursor:pointer;transition:all 120ms;text-decoration:none;}
.dd-item:hover{background:rgba(255,255,255,.04);color:rgba(255,255,255,.82);}
.dd-item.red{color:rgba(248,113,113,.55);} .dd-item.red:hover{background:rgba(239,68,68,.08);color:#f87171;}
.dd-sep{height:1px;background:rgba(255,255,255,.05);margin:.2rem 0;}
.app-content{flex:1;padding:1.5rem 1.75rem;}
@media(max-width:768px){.sidebar{display:none;}.app-main{margin-left:0;}}
`;

const timeAgo = d => { const m=Math.floor((Date.now()-new Date(d))/60000); if(m<1)return"just now"; if(m<60)return`${m}m ago`; const h=Math.floor(m/60); if(h<24)return`${h}h ago`; return`${Math.floor(h/24)}d ago`; };
const TITLES = { "/dashboard":"Dashboard", "/tasks":"Task Management", "/profile":"My Profile" };

export default function Layout({ children }) {
  const [ddOpen,    setDdOpen]    = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs,    setNotifs]    = useState([]);
  const [unread,    setUnread]    = useState(0);
  const ddRef=useRef(null); const notifRef=useRef(null);
  const navigate=useNavigate(); const {pathname}=useLocation();
  const user   =(() => { try{return JSON.parse(localStorage.getItem("dtms_user"));}catch{return null;} })();
  const photo  = localStorage.getItem("dtms_photo");
  const initial= user?.name?.charAt(0)?.toUpperCase()||"U";
  const role   = fixRole(user?.role);

  useEffect(()=>{
    if(!document.getElementById("layout-css")){const s=document.createElement("style");s.id="layout-css";s.textContent=CSS;document.head.appendChild(s);}
    loadNotifs();
    const iv=setInterval(loadNotifs,30000);
    return()=>clearInterval(iv);
  },[]);

  useEffect(()=>{
    const close=e=>{
      if(ddRef.current&&!ddRef.current.contains(e.target))setDdOpen(false);
      if(notifRef.current&&!notifRef.current.contains(e.target))setNotifOpen(false);
    };
    document.addEventListener("mousedown",close);
    return()=>document.removeEventListener("mousedown",close);
  },[]);

  const loadNotifs=async()=>{ try{const{data}=await axios.get("/notifications");setNotifs(data.notifications);setUnread(data.unread);}catch{} };
  const markAll=async()=>{ try{await axios.put("/notifications/read-all");setNotifs(p=>p.map(n=>({...n,read:true})));setUnread(0);}catch{} };
  const markOne=async id=>{ try{await axios.put(`/notifications/${id}/read`);setNotifs(p=>p.map(n=>n.id===id?{...n,read:true}:n));setUnread(p=>Math.max(0,p-1));}catch{} };
  const signOut=()=>{localStorage.removeItem("dtms_token");localStorage.removeItem("dtms_user");navigate("/");};
  const dotCls=t=>t==="task_assigned"?"nd-dot nd-dot-a":t==="task_completed"?"nd-dot nd-dot-c":t==="task_updated"?"nd-dot nd-dot-u":"nd-dot nd-dot-i";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-brand-icon">DT</div>
          <span className="sb-brand-name">Digital Talent<br/>Management</span>
        </div>
        <nav className="sb-nav">
          <p className="sb-section">Main</p>
          <NavLink to="/dashboard" className={({isActive})=>`sb-link${isActive?" on":""}`}><span className="sb-icon">📊</span>Dashboard</NavLink>
          <NavLink to="/tasks"     className={({isActive})=>`sb-link${isActive?" on":""}`}><span className="sb-icon">✅</span>Tasks</NavLink>
        </nav>
        <div className="sb-footer">
          <button className="sb-signout" onClick={signOut}>↩ Sign Out</button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <span className="tb-title">{TITLES[pathname]||"DTMS"}</span>
          <div className="tb-right">
            <div ref={notifRef} style={{position:"relative"}}>
              <div className="tb-bell" onClick={()=>{setNotifOpen(p=>!p);setDdOpen(false);}}>
                🔔{unread>0&&<span className="tb-badge">{unread>9?"9+":unread}</span>}
              </div>
              {notifOpen&&(
                <div className="notif-drawer">
                  <div className="nd-head">
                    <span className="nd-head-title">Notifications{unread>0&&<span style={{fontSize:".68rem",color:"#7c3aed",fontWeight:600,marginLeft:".3rem"}}>({unread} new)</span>}</span>
                    {unread>0&&<button className="nd-mark" onClick={markAll}>Mark all read</button>}
                  </div>
                  <div className="nd-list">
                    {notifs.length===0?<div className="nd-empty">🔔 No notifications yet</div>
                      :notifs.map(n=>(
                        <div key={n.id} className={`nd-item${!n.read?" unread":""}`} onClick={()=>!n.read&&markOne(n.id)}>
                          <div className={dotCls(n.type)}/>
                          <div><div className="nd-title">{n.title}</div><div className="nd-msg">{n.message}</div><div className="nd-time">{timeAgo(n.createdAt)}</div></div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
            <div ref={ddRef} style={{position:"relative"}}>
              <div className="tb-profile" onClick={()=>{setDdOpen(p=>!p);setNotifOpen(false);}}>
                <div className="tb-av">{photo?<img src={photo} alt=""/>:initial}</div>
                <span className="tb-name">{user?.name||"User"}</span>
                <span className={`tb-caret${ddOpen?" open":""}`}>▾</span>
              </div>
              {ddOpen&&(
                <div className="tb-dd">
                  <div className="dd-head"><div className="dd-name">{user?.name}</div><div className="dd-role">{role}</div></div>
                  <NavLink to="/profile" className="dd-item" onClick={()=>setDdOpen(false)}>✏️ &nbsp;Edit Profile</NavLink>
                  <div className="dd-sep"/>
                  <div className="dd-item red" onClick={signOut}>↩ &nbsp;Sign Out</div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}