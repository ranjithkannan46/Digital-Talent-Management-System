import { useState, useRef } from "react";
import axios from "../api/axios";
import "../styles/profile.css";

const fixRole = r => (!r || r === "player" || r === "Player") ? "user" : r;

const EyeIcon = ({ open }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open?<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8"/><circle cx="12" cy="12" r="3"/></>:<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
  </svg>
);

const flash = (set,type,msg) => { set({type,msg}); setTimeout(()=>set({type:"",msg:""}),3500); };

export default function Profile() {
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