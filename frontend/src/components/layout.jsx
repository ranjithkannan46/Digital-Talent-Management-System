import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import "../styles/layout.css";
 
const fixRole = r => (!r || r === "player" || r === "Player") ? "user" : r;
 
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
    document.body.classList.remove('auth-page');
    document.body.style.background = '#0c0f1a';
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
 
          <p className="sb-section" style={{marginTop:".5rem"}}>Account</p>
 
          {/* Notifications */}
          <div ref={notifRef} style={{position:"relative"}}>
            <div className="sb-link" style={{cursor:"pointer"}} onClick={()=>{setNotifOpen(p=>!p);setDdOpen(false);}}>
              <span className="sb-icon">🔔</span>
              Notifications
              {unread>0&&<span style={{marginLeft:"auto",minWidth:18,height:18,background:"#ef4444",borderRadius:999,fontSize:".6rem",fontWeight:700,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{unread>9?"9+":unread}</span>}
            </div>
            {notifOpen&&(
              <div className="notif-drawer" style={{top:"auto",bottom:"calc(100% + .4rem)",left:0,right:0,width:"auto"}}>
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
 
          {/* Profile */}
          <div ref={ddRef} style={{position:"relative"}}>
            <div className="sb-link" style={{cursor:"pointer"}} onClick={()=>{setDdOpen(p=>!p);setNotifOpen(false);}}>
              <div className="sb-user-av">{photo?<img src={photo} alt=""/>:initial}</div>
              <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name||"User"}</span>
              <span style={{marginLeft:"auto",fontSize:".58rem",color:"rgba(255,255,255,.28)",transition:"transform .14s",transform:ddOpen?"rotate(180deg)":"none"}}>▾</span>
            </div>
            {ddOpen&&(
              <div className="tb-dd" style={{top:"auto",bottom:"calc(100% + .4rem)",left:".45rem",right:".45rem",minWidth:"auto"}}>
                <div className="dd-head"><div className="dd-name">{user?.name}</div><div className="dd-role">{role}</div></div>
                <NavLink to="/profile" className="dd-item" onClick={()=>setDdOpen(false)}>✏️ &nbsp;Edit Profile</NavLink>
                <div className="dd-sep"/>
                <div className="dd-item red" onClick={signOut}>↩ &nbsp;Sign Out</div>
              </div>
            )}
          </div>
        </nav>
 
        <div className="sb-footer">
          <button className="sb-signout" onClick={signOut}>↩ Sign Out</button>
        </div>
      </aside>
 
      <div className="app-main">
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}