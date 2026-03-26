import { useState, useRef } from "react";
import axios from "../api/axios";

const fixRole = r => (!r || r === "player" || r === "Player") ? "user" : r;

const CSS = `
.profile-page{max-width:680px;animation:fadeUp .35s ease both;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

/* Hero card — teal gradient, no glow */
.P-hero{
  border-radius:16px;overflow:hidden;
  margin-bottom:1.25rem;
  position:relative;
}
.P-hero-img{
  position:absolute;inset:0;
  background:url('https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&auto=format&fit=crop&q=70') center/cover;
  filter:brightness(.3) saturate(.8);
}
.P-hero-overlay{position:absolute;inset:0;background:linear-gradient(135deg,rgba(0,40,60,.92),rgba(0,20,40,.85));}
.P-hero-body{position:relative;z-index:2;padding:1.75rem 2rem;display:flex;align-items:center;gap:1.5rem;}

/* Avatar — clean, no glow ring */
.P-av-wrap{position:relative;flex-shrink:0;}
.P-av{
  width:76px;height:76px;
  background:linear-gradient(135deg,#0e7490,#0891b2);
  border-radius:16px;
  display:grid;place-items:center;
  font-size:1.9rem;font-weight:700;color:#fff;
  overflow:hidden;cursor:pointer;
  border:2px solid rgba(255,255,255,.15);
  transition:border-color 150ms;
}
.P-av:hover{border-color:rgba(255,255,255,.35);}
.P-av img{width:100%;height:100%;object-fit:cover;}
.P-av-change{
  position:absolute;bottom:-4px;right:-4px;
  width:22px;height:22px;border-radius:50%;
  background:#0891b2;border:2px solid #0c0f1a;
  display:grid;place-items:center;font-size:.65rem;
  cursor:pointer;
}
.P-hero-info{}
.P-hero-name{font-size:1.25rem;font-weight:700;color:#f0f9ff;margin-bottom:.18rem;}
.P-hero-email{font-size:.78rem;color:rgba(255,255,255,.45);margin-bottom:.5rem;}
.P-role-tag{display:inline-flex;align-items:center;gap:.3rem;padding:.2rem .7rem;border-radius:5px;font-size:.68rem;font-weight:600;text-transform:capitalize;}
.P-role-admin{background:rgba(251,113,133,.15);border:1px solid rgba(251,113,133,.25);color:#fda4af;}
.P-role-user{background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.2);color:#6ee7b7;}

/* Info card */
.P-card{
  background:#0e1220;
  border:1px solid rgba(255,255,255,.065);
  border-radius:14px;overflow:hidden;
  margin-bottom:1.1rem;
}
.P-card-head{
  padding:.88rem 1.3rem;
  border-bottom:1px solid rgba(255,255,255,.05);
  display:flex;align-items:center;gap:.55rem;
  background:rgba(255,255,255,.018);
}
.P-card-icon{font-size:.95rem;}
.P-card-title{font-size:.85rem;font-weight:600;color:#e2e8f0;}
.P-card-sub{font-size:.71rem;color:rgba(255,255,255,.27);margin-top:.04rem;}
.P-card-body{padding:1.15rem 1.3rem;display:flex;flex-direction:column;gap:.8rem;}

/* Info rows — no glow, clean */
.I-row{display:flex;align-items:center;justify-content:space-between;padding:.55rem 1.3rem;border-bottom:1px solid rgba(255,255,255,.04);}
.I-row:last-child{border-bottom:none;}
.I-key{font-size:.74rem;color:rgba(255,255,255,.32);}
.I-val{font-size:.78rem;font-weight:500;color:rgba(255,255,255,.65);}
.I-role{padding:.18rem .62rem;border-radius:5px;font-size:.68rem;font-weight:600;text-transform:capitalize;}
.I-role-admin{background:rgba(251,113,133,.12);border:1px solid rgba(251,113,133,.2);color:#fda4af;}
.I-role-user{background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.18);color:#6ee7b7;}

/* Form fields */
.PF{display:flex;flex-direction:column;gap:.27rem;}
.PF-label{font-size:.7rem;font-weight:500;color:rgba(255,255,255,.38);}
.PF-input{
  background:rgba(255,255,255,.05);
  border:1.5px solid rgba(255,255,255,.09);
  border-radius:8px;padding:.67rem .9rem;
  color:#e2e8f0;font-family:'Inter',sans-serif;font-size:.85rem;
  outline:none;width:100%;transition:all 175ms;
}
.PF-input::placeholder{color:rgba(255,255,255,.18);}
.PF-input:focus{border-color:rgba(8,145,178,.5);background:rgba(255,255,255,.07);box-shadow:0 0 0 3px rgba(8,145,178,.08);}
.PF-input:disabled{opacity:.4;cursor:not-allowed;}
.PF-row{display:grid;grid-template-columns:1fr 1fr;gap:.85rem;}
.PF-foot{display:flex;justify-content:flex-end;gap:.65rem;padding-top:.2rem;}

/* Password eye */
.PW-w{position:relative;} .PW-w .PF-input{padding-right:2.5rem;}
.PW-eye{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,.28);padding:0;display:flex;transition:color 140ms;}
.PW-eye:hover{color:#38bdf8;}

/* Buttons — teal not green */
.btn-teal{
  padding:.62rem 1.3rem;
  background:linear-gradient(135deg,#0e7490,#0891b2);
  border:none;border-radius:8px;
  color:#fff;font-family:'Inter',sans-serif;font-size:.82rem;font-weight:600;
  cursor:pointer;transition:all 175ms;
  display:flex;align-items:center;gap:.4rem;
}
.btn-teal:hover{filter:brightness(1.12);transform:translateY(-1px);}
.btn-teal:disabled{opacity:.4;cursor:not-allowed;transform:none;}
.btn-ghost{padding:.62rem 1rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:8px;color:rgba(255,255,255,.45);font-family:'Inter',sans-serif;font-size:.82rem;font-weight:500;cursor:pointer;transition:all 155ms;}
.btn-ghost:hover{background:rgba(255,255,255,.09);color:rgba(255,255,255,.75);}

/* Alerts */
.P-alert{padding:.6rem .9rem;border-radius:8px;font-size:.77rem;margin-bottom:.65rem;}
.P-ok{background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.18);color:#6ee7b7;}
.P-err{background:rgba(251,113,133,.08);border:1px solid rgba(251,113,133,.18);color:#fda4af;}

.sp-t{width:12px;height:12px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spt .65s linear infinite;display:inline-block;}
@keyframes spt{to{transform:rotate(360deg)}}
`;

const EyeIcon = ({ open }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open?<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8"/><circle cx="12" cy="12" r="3"/></>:<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
  </svg>
);

const flash = (set,type,msg) => { set({type,msg}); setTimeout(()=>set({type:"",msg:""}),3500); };

export default function Profile() {
  if(!document.getElementById("profile-css")){const s=document.createElement("style");s.id="profile-css";s.textContent=CSS;document.head.appendChild(s);}

  const fileRef=useRef(null);
  const stored=(() => { try{return JSON.parse(localStorage.getItem("dtms_user"));}catch{return null;} })();
  const [photo,setPhoto]=useState(localStorage.getItem("dtms_photo")||"");
  const role=fixRole(stored?.role);
  const initial=stored?.name?.charAt(0)?.toUpperCase()||"U";
  const joined=stored?.createdAt?new Date(stored.createdAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—";
  const empId=`EMP-${stored?.id?.slice(-6).toUpperCase()}`;

  const [pForm,setPForm]=useState({name:stored?.name||"",email:stored?.email||""});
  const [pBusy,setPBusy]=useState(false);
  const [pAlert,setPAlert]=useState({type:"",msg:""});
  const [pw,setPw]=useState({cur:"",nw:"",con:""});
  const [pwBusy,setPwBusy]=useState(false);
  const [pwAlert,setPwAlert]=useState({type:"",msg:""});
  const [showC,setShowC]=useState(false);const [showN,setShowN]=useState(false);const [showCo,setShowCo]=useState(false);

  const handlePhoto=e=>{
    const f=e.target.files[0];if(!f)return;
    if(f.size>2*1024*1024){alert("Image must be under 2MB.");return;}
    const r=new FileReader();
    r.onload=ev=>{localStorage.setItem("dtms_photo",ev.target.result);setPhoto(ev.target.result);};
    r.readAsDataURL(f);
  };

  const saveProfile=async e=>{
    e.preventDefault();
    if(!pForm.name.trim()){flash(setPAlert,"err","Name is required.");return;}
    setPBusy(true);
    try{
      const{data}=await axios.put("/auth/profile",pForm);
      localStorage.setItem("dtms_user",JSON.stringify({...stored,name:data.user.name,email:data.user.email}));
      flash(setPAlert,"ok","Profile updated.");
    }catch(ex){flash(setPAlert,"err",ex.response?.data?.message||"Update failed.");}
    finally{setPBusy(false);}
  };

  const changePw=async e=>{
    e.preventDefault();
    if(!pw.cur||!pw.nw){flash(setPwAlert,"err","All fields required.");return;}
    if(pw.nw.length<8){flash(setPwAlert,"err","Min 8 characters.");return;}
    if(pw.nw!==pw.con){flash(setPwAlert,"err","Passwords do not match.");return;}
    setPwBusy(true);
    try{
      await axios.put("/auth/password",{currentPassword:pw.cur,newPassword:pw.nw});
      setPw({cur:"",nw:"",con:""});
      flash(setPwAlert,"ok","Password changed successfully.");
    }catch(ex){flash(setPwAlert,"err",ex.response?.data?.message||"Failed.");}
    finally{setPwBusy(false);}
  };

  return (
    <div className="profile-page">
      <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>

      {/* Hero */}
      <div className="P-hero">
        <div className="P-hero-img"/>
        <div className="P-hero-overlay"/>
        <div className="P-hero-body">
          <div className="P-av-wrap">
            <div className="P-av" onClick={()=>fileRef.current?.click()}>
              {photo?<img src={photo} alt="profile"/>:initial}
            </div>
            <div className="P-av-change" onClick={()=>fileRef.current?.click()}>📷</div>
          </div>
          <div className="P-hero-info">
            <div className="P-hero-name">{stored?.name}</div>
            <div className="P-hero-email">{stored?.email}</div>
            <div className={`P-role-tag P-role-${role}`}>{role}</div>
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="P-card">
        <div className="P-card-head">
          <span className="P-card-icon">🪪</span>
          <div><div className="P-card-title">Account Details</div><div className="P-card-sub">Read-only system information</div></div>
        </div>
        <div className="I-row"><span className="I-key">Employee ID</span><span className="I-val">{empId}</span></div>
        <div className="I-row"><span className="I-key">Role</span><span className={`I-role I-role-${role}`}>{role}</span></div>
        <div className="I-row"><span className="I-key">Member Since</span><span className="I-val">{joined}</span></div>
        <div className="I-row"><span className="I-key">Status</span><span className="I-val" style={{color:"#34d399"}}>● Active</span></div>
      </div>

      {/* Edit profile */}
      <div className="P-card">
        <div className="P-card-head">
          <span className="P-card-icon">✏️</span>
          <div><div className="P-card-title">Edit Profile</div><div className="P-card-sub">Update your name and email address</div></div>
        </div>
        <div className="P-card-body">
          {pAlert.msg&&<div className={`P-alert ${pAlert.type==="ok"?"P-ok":"P-err"}`}>{pAlert.msg}</div>}
          <form onSubmit={saveProfile} noValidate>
            <div className="PF-row" style={{marginBottom:".8rem"}}>
              <div className="PF">
                <label className="PF-label">Full Name</label>
                <input className="PF-input" type="text" placeholder="Your full name" value={pForm.name} onChange={e=>setPForm(p=>({...p,name:e.target.value}))} disabled={pBusy}/>
              </div>
              <div className="PF">
                <label className="PF-label">Email Address</label>
                <input className="PF-input" type="email" placeholder="your@email.com" value={pForm.email} onChange={e=>setPForm(p=>({...p,email:e.target.value}))} disabled={pBusy}/>
              </div>
            </div>
            <div className="PF-foot">
              <button type="submit" className="btn-teal" disabled={pBusy}>
                {pBusy?<><span className="sp-t"/> Saving...</>:"Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Change password */}
      <div className="P-card">
        <div className="P-card-head">
          <span className="P-card-icon">🔐</span>
          <div><div className="P-card-title">Change Password</div><div className="P-card-sub">Minimum 8 characters required</div></div>
        </div>
        <div className="P-card-body">
          {pwAlert.msg&&<div className={`P-alert ${pwAlert.type==="ok"?"P-ok":"P-err"}`}>{pwAlert.msg}</div>}
          <form onSubmit={changePw} noValidate>
            <div className="PF" style={{marginBottom:".8rem"}}>
              <label className="PF-label">Current Password</label>
              <div className="PW-w">
                <input className="PF-input" type={showC?"text":"password"} placeholder="Enter current password" value={pw.cur} onChange={e=>setPw(p=>({...p,cur:e.target.value}))} disabled={pwBusy}/>
                <button type="button" className="PW-eye" onClick={()=>setShowC(p=>!p)}><EyeIcon open={showC}/></button>
              </div>
            </div>
            <div className="PF-row" style={{marginBottom:".8rem"}}>
              <div className="PF">
                <label className="PF-label">New Password</label>
                <div className="PW-w">
                  <input className="PF-input" type={showN?"text":"password"} placeholder="Min. 8 characters" value={pw.nw} onChange={e=>setPw(p=>({...p,nw:e.target.value}))} disabled={pwBusy}/>
                  <button type="button" className="PW-eye" onClick={()=>setShowN(p=>!p)}><EyeIcon open={showN}/></button>
                </div>
              </div>
              <div className="PF">
                <label className="PF-label">Confirm New Password</label>
                <div className="PW-w">
                  <input className="PF-input" type={showCo?"text":"password"} placeholder="Repeat new password" value={pw.con} onChange={e=>setPw(p=>({...p,con:e.target.value}))} disabled={pwBusy}/>
                  <button type="button" className="PW-eye" onClick={()=>setShowCo(p=>!p)}><EyeIcon open={showCo}/></button>
                </div>
              </div>
            </div>
            <div className="PF-foot">
              <button type="button" className="btn-ghost" onClick={()=>setPw({cur:"",nw:"",con:""})}>Clear</button>
              <button type="submit" className="btn-teal" disabled={pwBusy}>
                {pwBusy?<><span className="sp-t"/> Updating...</>:"Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}