import { useState, useRef } from "react";
import axios from "../api/axios";

const fixRole = r => (r === 'player' || r === 'Player') ? 'user' : (r || 'user');

const CSS = `
.profile-page{max-width:660px;animation:fadeUp .35s ease both;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

/* Hero */
.P-hero{
  background:linear-gradient(135deg,#0d2318,#0f2a1a);
  border:1px solid rgba(74,222,128,.1);
  border-radius:14px;padding:1.75rem 2rem;
  margin-bottom:1.25rem;
  display:flex;align-items:center;gap:1.5rem;
}
.P-av-wrap{position:relative;flex-shrink:0;}
.P-av{
  width:72px;height:72px;
  background:linear-gradient(135deg,#16a34a,#15803d);
  border-radius:50%;display:grid;place-items:center;
  font-size:1.75rem;font-weight:700;color:#fff;
  overflow:hidden;
  box-shadow:0 6px 20px rgba(36, 173, 236, 0.35);
  cursor:pointer;position:relative;
}
.P-av img{width:100%;height:100%;object-fit:cover;}
.P-av-overlay{
  position:absolute;inset:0;border-radius:50%;
  background:rgba(0,0,0,.5);
  display:flex;align-items:center;justify-content:center;
  opacity:0;transition:opacity 150ms;
  font-size:.75rem;color:#fff;font-weight:600;
  text-align:center;line-height:1.3;
  cursor:pointer;
}
.P-av:hover .P-av-overlay{opacity:1;}
.P-hero__name{font-size:1.2rem;font-weight:700;color:#f0fff4;margin-bottom:.2rem;}
.P-hero__email{font-size:.78rem;color:rgba(255,255,255,.35);}
.P-hero__badge{display:inline-block;margin-top:.45rem;padding:.2rem .65rem;border-radius:999px;font-size:.68rem;font-weight:600;text-transform:capitalize;}
.P-hero__badge--admin{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#f87171;}
.P-hero__badge--user{background:rgba(22,163,74,.12);border:1px solid rgba(74,222,128,.2);color:#4ade80;}

/* Cards */
.P-card{background:#131820;border:1px solid rgba(255,255,255,.055);border-radius:12px;overflow:hidden;margin-bottom:1.1rem;}
.P-card__head{padding:.85rem 1.3rem;border-bottom:1px solid rgba(255,255,255,.04);display:flex;align-items:center;gap:.55rem;}
.P-card__icon{font-size:.95rem;}
.P-card__title{font-size:.86rem;font-weight:600;color:#e2e8f0;}
.P-card__sub{font-size:.71rem;color:rgba(255,255,255,.27);margin-top:.05rem;}
.P-card__body{padding:1.15rem 1.3rem;display:flex;flex-direction:column;gap:.8rem;}

/* Info rows */
.I-row{display:flex;align-items:center;justify-content:space-between;padding:.52rem 1.3rem;border-bottom:1px solid rgba(255,255,255,.04);}
.I-row:last-child{border-bottom:none;}
.I-row__k{font-size:.74rem;color:rgba(255,255,255,.3);}
.I-row__v{font-size:.77rem;font-weight:500;color:rgba(255,255,255,.62);}

/* Fields */
.PF-field{display:flex;flex-direction:column;gap:.26rem;}
.PF-label{font-size:.7rem;font-weight:500;color:rgba(255,255,255,.38);}
.PF-input{background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.09);border-radius:8px;padding:.67rem .9rem;color:#e2e8f0;font-family:'Inter',sans-serif;font-size:.85rem;outline:none;width:100%;transition:all 180ms;}
.PF-input::placeholder{color:rgba(255,255,255,.18);}
.PF-input:focus{border-color:rgba(74,222,128,.4);background:rgba(255,255,255,.07);box-shadow:0 0 0 3px rgba(74,222,128,.07);}
.PF-input:disabled{opacity:.4;cursor:not-allowed;}
.PF-row{display:grid;grid-template-columns:1fr 1fr;gap:.85rem;}
.PF-foot{display:flex;justify-content:flex-end;gap:.65rem;padding-top:.2rem;}
.PW-wrap{position:relative;}
.PW-wrap .PF-input{padding-right:2.5rem;}
.PW-eye{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,.28);padding:0;display:flex;transition:color 140ms;}
.PW-eye:hover{color:#4ade80;}

/* Buttons */
.btn-ps{padding:.6rem 1.3rem;background:#15803d;border:none;border-radius:8px;color:#fff;font-family:'Inter',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;transition:all 180ms;display:flex;align-items:center;gap:.4rem;box-shadow:0 3px 10px rgba(21,128,61,.25);}
.btn-ps:hover{background:#166534;transform:translateY(-1px);}
.btn-ps:disabled{opacity:.4;cursor:not-allowed;transform:none;}
.btn-pc{padding:.6rem 1rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:8px;color:rgba(255,255,255,.45);font-family:'Inter',sans-serif;font-size:.82rem;font-weight:500;cursor:pointer;transition:all 160ms;}
.btn-pc:hover{background:rgba(255,255,255,.09);}

/* Alert */
.P-alert{padding:.6rem .9rem;border-radius:8px;font-size:.77rem;margin-bottom:.65rem;}
.P-ok{background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.2);color:#86efac;}
.P-err{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#fca5a5;}

/* Photo upload hint */
.photo-hint{font-size:.7rem;color:rgba(255,255,255,.25);margin-top:.4rem;text-align:center;max-width:72px;}

.spin-ps{width:12px;height:12px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:pspin .65s linear infinite;display:inline-block;}
@keyframes pspin{to{transform:rotate(360deg)}}

.role-pill{padding:.18rem .6rem;border-radius:999px;font-size:.68rem;font-weight:600;text-transform:capitalize;}
.role-pill--admin{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#f87171;}
.role-pill--user{background:rgba(22,163,74,.1);border:1px solid rgba(74,222,128,.2);color:#4ade80;}
`;

const EyeIcon = ({ open }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
  </svg>
);

const flash = (setter,type,msg) => { setter({type,msg}); setTimeout(()=>setter({type:"",msg:""}),3500); };

export default function Profile() {
  if (!document.getElementById("profile-css")) {
    const s = document.createElement("style"); s.id = "profile-css"; s.textContent = CSS; document.head.appendChild(s);
  }

  const fileRef = useRef(null);
  const stored  = (() => { try { return JSON.parse(localStorage.getItem("dtms_user")); } catch { return null; } })();
  const [photo, setPhoto] = useState(localStorage.getItem("dtms_photo") || "");

  const initial = stored?.name?.charAt(0)?.toUpperCase() || "U";
  const joined  = stored?.createdAt ? new Date(stored.createdAt).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
  const empId   = `EMP-${stored?.id?.slice(-6).toUpperCase()}`;

  const [pForm,  setPForm]  = useState({ name:stored?.name||"", email:stored?.email||"" });
  const [pBusy,  setPBusy]  = useState(false);
  const [pAlert, setPAlert] = useState({type:"",msg:""});

  const [pw,     setPw]     = useState({cur:"",nw:"",con:""});
  const [pwBusy, setPwBusy] = useState(false);
  const [pwAlert,setPwAlert]= useState({type:"",msg:""});
  const [showC,  setShowC]  = useState(false);
  const [showN,  setShowN]  = useState(false);
  const [showCo, setShowCo] = useState(false);

  /* Photo upload — stored in localStorage as base64 */
  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target.result;
      localStorage.setItem("dtms_photo", b64);
      setPhoto(b64);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async e => {
    e.preventDefault();
    if (!pForm.name.trim()) { flash(setPAlert,"err","Name is required."); return; }
    setPBusy(true);
    try {
      const {data} = await axios.put("/auth/profile", pForm);
      localStorage.setItem("dtms_user", JSON.stringify({...stored, name:data.user.name, email:data.user.email}));
      flash(setPAlert,"ok","Profile updated successfully.");
    } catch(ex) { flash(setPAlert,"err",ex.response?.data?.message||"Update failed."); }
    finally { setPBusy(false); }
  };

  const changePw = async e => {
    e.preventDefault();
    if (!pw.cur||!pw.nw) { flash(setPwAlert,"err","All fields required."); return; }
    if (pw.nw.length<8) { flash(setPwAlert,"err","Min 8 characters."); return; }
    if (pw.nw!==pw.con) { flash(setPwAlert,"err","Passwords do not match."); return; }
    setPwBusy(true);
    try {
      await axios.put("/auth/password", {currentPassword:pw.cur, newPassword:pw.nw});
      setPw({cur:"",nw:"",con:""});
      flash(setPwAlert,"ok","Password changed.");
    } catch(ex) { flash(setPwAlert,"err",ex.response?.data?.message||"Failed."); }
    finally { setPwBusy(false); }
  };

  return (
    <div className="profile-page">
      <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhoto}/>

      {/* Hero */}
      <div className="P-hero">
        <div>
          <div className="P-av-wrap">
            <div className="P-av" onClick={()=>fileRef.current?.click()}>
              {photo ? <img src={photo} alt="profile"/> : initial}
              <div className="P-av-overlay">📷<br/>Change</div>
            </div>
            <div className="photo-hint">Click to upload</div>
          </div>
        </div>
        <div>
          <div className="P-hero__name">{stored?.name}</div>
          <div className="P-hero__email">{stored?.email}</div>
          <div className={`P-hero__badge P-hero__badge--${fixRole(stored?.role)}`}>{stored?.role || "user"}</div>
        </div>
      </div>

      {/* Account info */}
      <div className="P-card">
        <div className="P-card__head">
          <span className="P-card__icon">🪪</span>
          <div><div className="P-card__title">Account Details</div><div className="P-card__sub">Your system information — read only</div></div>
        </div>
        <div className="I-row"><span className="I-row__k">Employee ID</span><span className="I-row__v">{empId}</span></div>
        <div className="I-row">
          <span className="I-row__k">Role</span>
          <span className={`role-pill role-pill--${fixRole(stored?.role)}`}>{fixRole(stored?.role)}</span>
        </div>
        <div className="I-row"><span className="I-row__k">Member Since</span><span className="I-row__v">{joined}</span></div>
        <div className="I-row"><span className="I-row__k">Status</span><span className="I-row__v" style={{color:"#4ade80"}}>● Active</span></div>
      </div>

      {/* Edit profile */}
      <div className="P-card">
        <div className="P-card__head">
          <span className="P-card__icon">✏️</span>
          <div><div className="P-card__title">Edit Profile</div><div className="P-card__sub">Update your name and email</div></div>
        </div>
        <div className="P-card__body">
          {pAlert.msg && <div className={`P-alert ${pAlert.type==="ok"?"P-ok":"P-err"}`}>{pAlert.msg}</div>}
          <form onSubmit={saveProfile} noValidate>
            <div className="PF-row" style={{marginBottom:".8rem"}}>
              <div className="PF-field">
                <label className="PF-label">Full Name</label>
                <input className="PF-input" type="text" placeholder="Your full name" value={pForm.name} onChange={e=>setPForm(p=>({...p,name:e.target.value}))} disabled={pBusy}/>
              </div>
              <div className="PF-field">
                <label className="PF-label">Email Address</label>
                <input className="PF-input" type="email" placeholder="your@email.com" value={pForm.email} onChange={e=>setPForm(p=>({...p,email:e.target.value}))} disabled={pBusy}/>
              </div>
            </div>
            <div className="PF-foot">
              <button type="submit" className="btn-ps" disabled={pBusy}>
                {pBusy?<><span className="spin-ps"/> Saving...</>:"Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Change password */}
      <div className="P-card">
        <div className="P-card__head">
          <span className="P-card__icon">🔐</span>
          <div><div className="P-card__title">Change Password</div><div className="P-card__sub">Minimum 8 characters</div></div>
        </div>
        <div className="P-card__body">
          {pwAlert.msg && <div className={`P-alert ${pwAlert.type==="ok"?"P-ok":"P-err"}`}>{pwAlert.msg}</div>}
          <form onSubmit={changePw} noValidate>
            <div className="PF-field" style={{marginBottom:".8rem"}}>
              <label className="PF-label">Current Password</label>
              <div className="PW-wrap">
                <input className="PF-input" type={showC?"text":"password"} placeholder="Enter current password" value={pw.cur} onChange={e=>setPw(p=>({...p,cur:e.target.value}))} disabled={pwBusy}/>
                <button type="button" className="PW-eye" onClick={()=>setShowC(p=>!p)}><EyeIcon open={showC}/></button>
              </div>
            </div>
            <div className="PF-row" style={{marginBottom:".8rem"}}>
              <div className="PF-field">
                <label className="PF-label">New Password</label>
                <div className="PW-wrap">
                  <input className="PF-input" type={showN?"text":"password"} placeholder="Min. 8 characters" value={pw.nw} onChange={e=>setPw(p=>({...p,nw:e.target.value}))} disabled={pwBusy}/>
                  <button type="button" className="PW-eye" onClick={()=>setShowN(p=>!p)}><EyeIcon open={showN}/></button>
                </div>
              </div>
              <div className="PF-field">
                <label className="PF-label">Confirm New Password</label>
                <div className="PW-wrap">
                  <input className="PF-input" type={showCo?"text":"password"} placeholder="Repeat new password" value={pw.con} onChange={e=>setPw(p=>({...p,con:e.target.value}))} disabled={pwBusy}/>
                  <button type="button" className="PW-eye" onClick={()=>setShowCo(p=>!p)}><EyeIcon open={showCo}/></button>
                </div>
              </div>
            </div>
            <div className="PF-foot">
              <button type="button" className="btn-pc" onClick={()=>setPw({cur:"",nw:"",con:""})}>Clear</button>
              <button type="submit" className="btn-ps" disabled={pwBusy}>
                {pwBusy?<><span className="spin-ps"/> Updating...</>:"Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}