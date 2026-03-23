import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;}
body{font-family:'Inter',sans-serif;background:#0b0e1a;color:#e2e8f0;-webkit-font-smoothing:antialiased;overflow-x:hidden;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:2px;}

.L-shell{display:flex;min-height:100vh;}

/* ── Sidebar ── */
.L-sb{
  width:220px;flex-shrink:0;
  background:linear-gradient(180deg,#0e1220 0%,#0c1019 100%);
  border-right:1px solid rgba(255,255,255,.06);
  display:flex;flex-direction:column;
  position:fixed;top:0;left:0;bottom:0;z-index:200;
}

.L-sb-top{
  padding:1.2rem 1rem 1rem;
  border-bottom:1px solid rgba(255,255,255,.05);
  display:flex;align-items:center;gap:.7rem;
}
.L-sb-icon{
  width:34px;height:34px;
  background:linear-gradient(135deg,#6366f1,#4f46e5);
  border-radius:9px;display:grid;place-items:center;
  font-size:.58rem;font-weight:800;color:#fff;letter-spacing:.04em;
  flex-shrink:0;box-shadow:0 4px 12px rgba(99,102,241,.4);
}
.L-sb-name{font-size:.68rem;font-weight:600;color:rgba(255,255,255,.45);line-height:1.4;}

.L-sb-nav{flex:1;padding:.5rem 0;overflow-y:auto;}
.L-nav-section{
  font-size:.58rem;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;
  color:rgba(255,255,255,.2);
  padding:.7rem 1rem .25rem;
}
.L-nav-link{
  display:flex;align-items:center;gap:.6rem;
  padding:.58rem .85rem;margin:.04rem .45rem;
  border-radius:8px;
  font-size:.81rem;font-weight:500;
  color:rgba(255,255,255,.4);
  text-decoration:none;
  transition:all 140ms ease;
  position:relative;
}
.L-nav-link:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.72);}
.L-nav-link.active{background:rgba(99,102,241,.15);color:#818cf8;font-weight:600;}
.L-nav-link.active::before{
  content:'';position:absolute;left:-.45rem;top:20%;bottom:20%;
  width:2.5px;background:#6366f1;border-radius:0 3px 3px 0;
}
.L-nav-icon{font-size:.88rem;width:16px;text-align:center;flex-shrink:0;}

.L-sb-foot{
  padding:.7rem .6rem .85rem;
  border-top:1px solid rgba(255,255,255,.05);
}
.L-user-chip{
  display:flex;align-items:center;gap:.55rem;
  padding:.5rem .6rem;border-radius:8px;
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.05);
  margin-bottom:.4rem;
}
.L-user-av{
  width:28px;height:28px;border-radius:50%;
  background:linear-gradient(135deg,#6366f1,#4f46e5);
  display:grid;place-items:center;
  font-size:.7rem;font-weight:700;color:#fff;
  flex-shrink:0;overflow:hidden;
  box-shadow:0 2px 8px rgba(99,102,241,.3);
}
.L-user-av img{width:100%;height:100%;object-fit:cover;}
.L-user-name{font-size:.74rem;font-weight:600;color:rgba(255,255,255,.68);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.L-user-role{font-size:.62rem;color:rgba(255,255,255,.3);text-transform:capitalize;}
.L-logout{
  width:100%;padding:.5rem;
  background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.1);
  border-radius:7px;color:rgba(248,113,113,.6);
  font-family:'Inter',sans-serif;font-size:.74rem;font-weight:500;
  cursor:pointer;transition:all 140ms;
  display:flex;align-items:center;justify-content:center;gap:.35rem;
}
.L-logout:hover{background:rgba(239,68,68,.12);color:#f87171;}

/* ── Main area ── */
.L-main{flex:1;margin-left:220px;min-height:100vh;display:flex;flex-direction:column;}

/* ── Topbar ── */
.L-topbar{
  position:sticky;top:0;z-index:150;
  background:rgba(11,14,26,.94);
  backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(255,255,255,.05);
  padding:.62rem 1.6rem;
  display:flex;align-items:center;justify-content:space-between;
}
.L-page-title{font-size:.88rem;font-weight:600;color:#e2e8f0;}

.L-tb-right{display:flex;align-items:center;gap:.6rem;position:relative;}

/* Notification bell */
.L-notif-btn{
  position:relative;
  width:34px;height:34px;
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.07);
  border-radius:8px;display:grid;place-items:center;
  cursor:pointer;transition:all 140ms;color:rgba(255,255,255,.5);font-size:1rem;
}
.L-notif-btn:hover{background:rgba(255,255,255,.08);color:rgba(255,255,255,.85);}
.L-notif-badge{
  position:absolute;top:-4px;right:-4px;
  min-width:16px;height:16px;padding:0 4px;
  background:#ef4444;border-radius:999px;
  font-size:.6rem;font-weight:700;color:#fff;
  display:flex;align-items:center;justify-content:center;
  border:2px solid #0b0e1a;
  animation:pulse-badge 2s ease infinite;
}
@keyframes pulse-badge{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}

/* Notification drawer */
.L-notif-drawer{
  position:absolute;top:calc(100% + .55rem);right:0;
  background:#131929;
  border:1px solid rgba(255,255,255,.08);
  border-radius:12px;
  width:320px;max-height:420px;
  display:flex;flex-direction:column;
  box-shadow:0 20px 60px rgba(0,0,0,.6);
  animation:ndIn .18s ease both;z-index:999;
}
@keyframes ndIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.ND-head{
  padding:.85rem 1rem .7rem;
  border-bottom:1px solid rgba(255,255,255,.06);
  display:flex;align-items:center;justify-content:space-between;
  flex-shrink:0;
}
.ND-head-title{font-size:.85rem;font-weight:700;color:#e2e8f0;}
.ND-mark-all{font-size:.72rem;color:#6366f1;cursor:pointer;background:none;border:none;font-family:'Inter',sans-serif;padding:0;transition:color 140ms;}
.ND-mark-all:hover{color:#818cf8;}
.ND-list{overflow-y:auto;flex:1;}
.ND-item{
  display:flex;gap:.75rem;align-items:flex-start;
  padding:.75rem 1rem;
  border-bottom:1px solid rgba(255,255,255,.04);
  cursor:pointer;transition:background 130ms;
}
.ND-item:last-child{border-bottom:none;}
.ND-item:hover{background:rgba(255,255,255,.03);}
.ND-item.unread{background:rgba(99,102,241,.06);}
.ND-item.unread:hover{background:rgba(99,102,241,.1);}
.ND-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;margin-top:.3rem;}
.ND-dot-assigned{background:#6366f1;}
.ND-dot-completed{background:#4ade80;}
.ND-dot-updated{background:#fbbf24;}
.ND-dot-info{background:rgba(255,255,255,.3);}
.ND-text{flex:1;}
.ND-title{font-size:.78rem;font-weight:600;color:#e2e8f0;margin-bottom:.15rem;}
.ND-msg{font-size:.72rem;color:rgba(255,255,255,.38);line-height:1.5;}
.ND-time{font-size:.66rem;color:rgba(255,255,255,.22);margin-top:.2rem;}
.ND-empty{padding:2rem;text-align:center;color:rgba(255,255,255,.25);font-size:.8rem;}

/* Profile dropdown */
.L-profile{
  display:flex;align-items:center;gap:.45rem;
  padding:.28rem .55rem .28rem .28rem;
  border-radius:8px;cursor:pointer;
  border:1px solid rgba(255,255,255,.06);
  background:rgba(255,255,255,.03);
  transition:all 140ms;user-select:none;
}
.L-profile:hover{background:rgba(255,255,255,.07);}
.L-profile-av{
  width:27px;height:27px;border-radius:50%;
  background:linear-gradient(135deg,#6366f1,#4f46e5);
  display:grid;place-items:center;
  font-size:.7rem;font-weight:700;color:#fff;
  flex-shrink:0;overflow:hidden;
  box-shadow:0 2px 8px rgba(99,102,241,.3);
}
.L-profile-av img{width:100%;height:100%;object-fit:cover;}
.L-profile-name{font-size:.77rem;font-weight:600;color:rgba(255,255,255,.72);max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.L-caret{font-size:.58rem;color:rgba(255,255,255,.3);transition:transform 140ms;}
.L-caret.open{transform:rotate(180deg);}

.L-dropdown{
  position:absolute;top:calc(100% + .45rem);right:0;
  background:#131929;border:1px solid rgba(255,255,255,.08);
  border-radius:10px;min-width:175px;
  box-shadow:0 16px 40px rgba(0,0,0,.55);
  animation:ndIn .15s ease both;z-index:999;
}
.L-dd-head{padding:.75rem .95rem .6rem;border-bottom:1px solid rgba(255,255,255,.06);}
.L-dd-name{font-size:.82rem;font-weight:600;color:#f0f9ff;}
.L-dd-role{font-size:.68rem;color:rgba(255,255,255,.3);text-transform:capitalize;margin-top:.08rem;}
.L-dd-item{
  display:flex;align-items:center;gap:.55rem;
  padding:.58rem .95rem;font-size:.78rem;
  color:rgba(255,255,255,.5);cursor:pointer;
  transition:all 130ms;text-decoration:none;
}
.L-dd-item:hover{background:rgba(255,255,255,.04);color:rgba(255,255,255,.82);}
.L-dd-item.danger{color:rgba(248,113,113,.55);}
.L-dd-item.danger:hover{background:rgba(239,68,68,.08);color:#f87171;}
.L-dd-sep{height:1px;background:rgba(255,255,255,.05);margin:.2rem 0;}

/* Content */
.L-content{flex:1;padding:1.5rem 1.75rem;}

@media(max-width:768px){
  .L-sb{display:none;}
  .L-main{margin-left:0;}
}
`;

const timeAgo = d => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

const fixRole = r => (r === "player" || r === "Player") ? "user" : (r || "user");
const PAGE_TITLES = { "/dashboard":"Dashboard", "/tasks":"Task Management", "/profile":"My Profile" };

export default function Layout({ children }) {
  const [ddOpen,    setDdOpen]    = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs,    setNotifs]    = useState([]);
  const [unread,    setUnread]    = useState(0);
  const ddRef    = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const user    = (() => { try { return JSON.parse(localStorage.getItem("dtms_user")); } catch { return null; } })();
  const photo   = localStorage.getItem("dtms_photo");
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    if (!document.getElementById("global-css")) {
      const s = document.createElement("style"); s.id = "global-css"; s.textContent = GLOBAL_CSS; document.head.appendChild(s);
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const close = e => {
      if (ddRef.current    && !ddRef.current.contains(e.target))    setDdOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const fetchNotifs = async () => {
    try {
      const { data } = await axios.get("/notifications");
      setNotifs(data.notifications);
      setUnread(data.unread);
    } catch {}
  };

  const markAllRead = async () => {
    try { await axios.put("/notifications/read-all"); setNotifs(p=>p.map(n=>({...n,read:true}))); setUnread(0); } catch {}
  };

  const markRead = async id => {
    try { await axios.put(`/notifications/${id}/read`); setNotifs(p=>p.map(n=>n.id===id?{...n,read:true}:n)); setUnread(p=>Math.max(0,p-1)); } catch {}
  };

  const signOut = () => { localStorage.removeItem("dtms_token"); localStorage.removeItem("dtms_user"); navigate("/"); };

  const dotClass = type => {
    if (type==="task_assigned") return "ND-dot ND-dot-assigned";
    if (type==="task_completed") return "ND-dot ND-dot-completed";
    if (type==="task_updated")   return "ND-dot ND-dot-updated";
    return "ND-dot ND-dot-info";
  };

  return (
    <div className="L-shell">
      <aside className="L-sb">
        <div className="L-sb-top">
          <div className="L-sb-icon">DT</div>
          <span className="L-sb-name">Digital Talent<br/>Management</span>
        </div>

        <nav className="L-sb-nav">
          <p className="L-nav-section">Main</p>
          <NavLink to="/dashboard" className={({isActive})=>`L-nav-link${isActive?" active":""}`}>
            <span className="L-nav-icon">📊</span>Dashboard
          </NavLink>
          <NavLink to="/tasks" className={({isActive})=>`L-nav-link${isActive?" active":""}`}>
            <span className="L-nav-icon">✅</span>Tasks
          </NavLink>
          <p className="L-nav-section">Account</p>
          <NavLink to="/profile" className={({isActive})=>`L-nav-link${isActive?" active":""}`}>
            <span className="L-nav-icon">👤</span>My Profile
          </NavLink>
        </nav>

        <div className="L-sb-foot">
          <button className="L-logout" onClick={signOut}>↩ Sign Out</button>
        </div>
      </aside>

      <div className="L-main">
        <header className="L-topbar">
          <span className="L-page-title">{PAGE_TITLES[pathname]||"DTMS"}</span>

          <div className="L-tb-right">
            {/* Notification bell */}
            <div ref={notifRef} style={{position:"relative"}}>
              <div className="L-notif-btn" onClick={()=>{setNotifOpen(p=>!p);setDdOpen(false);}}>
                🔔
                {unread > 0 && <span className="L-notif-badge">{unread > 9 ? "9+" : unread}</span>}
              </div>

              {notifOpen && (
                <div className="L-notif-drawer">
                  <div className="ND-head">
                    <span className="ND-head-title">Notifications {unread>0&&<span style={{fontSize:".68rem",color:"#6366f1",fontWeight:600}}>({unread} new)</span>}</span>
                    {unread > 0 && <button className="ND-mark-all" onClick={markAllRead}>Mark all read</button>}
                  </div>
                  <div className="ND-list">
                    {notifs.length === 0
                      ? <div className="ND-empty">🔔 No notifications yet</div>
                      : notifs.map(n => (
                        <div key={n.id} className={`ND-item${!n.read?" unread":""}`} onClick={()=>!n.read&&markRead(n.id)}>
                          <div className={dotClass(n.type)}/>
                          <div className="ND-text">
                            <div className="ND-title">{n.title}</div>
                            <div className="ND-msg">{n.message}</div>
                            <div className="ND-time">{timeAgo(n.createdAt)}</div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div ref={ddRef} style={{position:"relative"}}>
              <div className="L-profile" onClick={()=>{setDdOpen(p=>!p);setNotifOpen(false);}}>
                <div className="L-profile-av">{photo?<img src={photo} alt=""/>:initial}</div>
                <span className="L-profile-name">{user?.name||"User"}</span>
                <span className={`L-caret${ddOpen?" open":""}`}>▾</span>
              </div>
              {ddOpen && (
                <div className="L-dropdown">
                  <div className="L-dd-head">
                    <div className="L-dd-name">{user?.name}</div>
                    <div className="L-dd-role">{fixRole(user?.role)}</div>
                  </div>
                  <NavLink to="/profile" className="L-dd-item" onClick={()=>setDdOpen(false)}>✏️ &nbsp;Edit Profile</NavLink>
                  <div className="L-dd-sep"/>
                  <div className="L-dd-item danger" onClick={signOut}>↩ &nbsp;Sign Out</div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="L-content">{children}</main>
      </div>
    </div>
  );
}