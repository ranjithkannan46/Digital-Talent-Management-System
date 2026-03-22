import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth, provider, signInWithPopup } from "../firebase";

const injectStyles = () => {
  if (document.getElementById("auth-css")) return;
  const s = document.createElement("style");
  s.id = "auth-css";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Inter:wght@300;400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Inter',system-ui,sans-serif; background:#061409; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:1.5rem; -webkit-font-smoothing:antialiased; }

    .toast { position:fixed; top:1.5rem; left:50%; transform:translateX(-50%); z-index:9999; display:flex; align-items:center; gap:.65rem; padding:.85rem 1.4rem; background:#0a2a10; border:1px solid rgba(74,222,128,.3); border-radius:12px; font-size:.83rem; font-weight:500; color:#86efac; box-shadow:0 8px 32px rgba(0,0,0,.5); animation:toastIn .35s cubic-bezier(.22,1,.36,1) both; white-space:nowrap; }
    .toast-icon { width:20px; height:20px; background:rgba(74,222,128,.15); border-radius:50%; display:grid; place-items:center; font-size:.7rem; }
    @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(-14px) scale(.95)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }

    .otp-overlay { position:fixed; inset:0; z-index:8000; background:rgba(0,0,0,.65); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:1.5rem; animation:fadeIn .2s ease both; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .otp-modal { background:#fff; border-radius:20px; width:100%; max-width:380px; padding:2.25rem 2rem 1.75rem; box-shadow:0 24px 60px rgba(0,0,0,.45); position:relative; animation:modalIn .3s cubic-bezier(.22,1,.36,1) both; }
    @keyframes modalIn { from{opacity:0;transform:translateY(20px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
    .otp-close { position:absolute; top:1rem; right:1rem; background:#f3f4f6; border:none; width:28px; height:28px; border-radius:50%; color:#6b7280; font-size:.85rem; cursor:pointer; display:grid; place-items:center; transition:all 150ms; }
    .otp-close:hover { background:#e5e7eb; }
    .otp-title { font-size:1.2rem; font-weight:700; color:#111827; text-align:center; margin-bottom:.4rem; }
    .otp-sub { font-size:.81rem; color:#6b7280; text-align:center; line-height:1.6; margin-bottom:1.6rem; }
    .otp-sub strong { color:#166534; font-weight:600; }
    .otp-boxes { display:flex; gap:.5rem; justify-content:center; margin-bottom:1.25rem; }
    .otp-box { width:46px; height:54px; background:#f0fdf4; border:2px solid #d1fae5; border-radius:12px; text-align:center; font-size:1.4rem; font-weight:700; color:#111827; outline:none; font-family:'Inter',sans-serif; transition:all 180ms; caret-color:transparent; }
    .otp-box:focus { border-color:#16a34a; background:#f0fdf4; box-shadow:0 0 0 3px rgba(22,163,74,.12); }
    .otp-box.filled { border-color:#16a34a; background:#dcfce7; color:#15803d; }
    .otp-box:disabled { opacity:.5; cursor:not-allowed; }
    .otp-err { font-size:.76rem; color:#ef4444; text-align:center; margin-bottom:.85rem; }
    .otp-verify-btn { width:100%; padding:.82rem; background:#15803d; border:none; border-radius:12px; color:#fff; font-family:'Inter',sans-serif; font-size:.88rem; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 180ms; margin-bottom:1.25rem; box-shadow:0 4px 20px rgba(21,128,61,.35); }
    .otp-verify-btn:hover:not(:disabled) { background:#166534; transform:translateY(-1px); box-shadow:0 6px 24px rgba(22,101,52,.45); }
    .otp-verify-btn:disabled { opacity:.4; cursor:not-allowed; }
    .otp-resend-row { text-align:center; font-size:.79rem; color:#9ca3af; }
    .otp-resend-btn { background:none; border:none; font-family:inherit; font-size:inherit; font-weight:600; color:#15803d; cursor:pointer; padding:0; }
    .otp-timer { color:#15803d; font-weight:600; font-variant-numeric:tabular-nums; }

    .modal-overlay { position:fixed; inset:0; z-index:8888; background:rgba(0,0,0,.8); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:1.5rem; animation:fadeIn .2s ease both; }
    .modal { background:#0d1427; border:1px solid rgba(99,102,241,.18); border-radius:18px; width:100%; max-width:600px; max-height:82vh; display:flex; flex-direction:column; box-shadow:0 32px 80px rgba(0,0,0,.7); animation:modalIn .3s cubic-bezier(.22,1,.36,1) both; }
    .modal-head { padding:1.5rem 1.75rem 1.25rem; border-bottom:1px solid rgba(99,102,241,.12); display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-shrink:0; }
    .modal-title { font-family:'Cormorant Garamond',serif; font-size:1.6rem; font-weight:700; color:#f0fff4; }
    .modal-close-btn { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); color:rgba(255,255,255,.5); cursor:pointer; font-size:.95rem; padding:5px 9px; border-radius:7px; transition:all 150ms; flex-shrink:0; }
    .modal-close-btn:hover { background:rgba(255,255,255,.1); color:#fff; }
    .modal-body { padding:1.25rem 1.75rem; overflow-y:auto; flex:1; }
    .modal-body::-webkit-scrollbar { width:4px; }
    .modal-body::-webkit-scrollbar-thumb { background:rgba(99,102,241,.3); border-radius:2px; }
    .modal-foot { padding:1rem 1.75rem; border-top:1px solid rgba(99,102,241,.12); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
    .modal-btn { background:#4f46e5; border:none; border-radius:8px; padding:.6rem 1.4rem; color:#fff; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:.4rem; transition:all 180ms; box-shadow:0 3px 12px rgba(21,128,61,.3); }
    .modal-btn:hover { background:#4338ca; transform:translateY(-1px); }

    .wrap { display:grid; grid-template-columns:1fr 460px; width:100%; max-width:1080px; min-height:680px; border-radius:22px; overflow:hidden; box-shadow:0 0 0 1px rgba(74,222,128,.08), 0 48px 120px rgba(0,0,0,.6); animation:rise .55s cubic-bezier(.22,1,.36,1) both; }
    @keyframes rise { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

    .left { position:relative; overflow:hidden; background:#061409; }
    .left-bg { position:absolute; inset:0; background: radial-gradient(ellipse at 25% 25%, rgba(21,128,61,0.5), transparent 55%), radial-gradient(ellipse at 75% 75%, rgba(16,185,129,0.3), transparent 50%), radial-gradient(ellipse at 55% 15%, rgba(74,222,128,0.2), transparent 45%), linear-gradient(160deg, #061409 0%, #0a2010 50%, #061409 100%); animation:gradShift 10s ease-in-out infinite alternate; }
    @keyframes gradShift { 0%{filter:hue-rotate(0deg) brightness(1)} 50%{filter:hue-rotate(12deg) brightness(1.08)} 100%{filter:hue-rotate(-8deg) brightness(.96)} }
    .left-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(74,222,128,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(74,222,128,.04) 1px,transparent 1px); background-size:48px 48px; pointer-events:none; }
    .orb { position:absolute; border-radius:50%; pointer-events:none; }
    .orb-1 { width:350px;height:350px;background:radial-gradient(circle,rgba(21,128,61,.3),transparent 70%);top:-100px;left:-100px;filter:blur(40px);animation:orbA 14s ease-in-out infinite; }
    .orb-2 { width:260px;height:260px;background:radial-gradient(circle,rgba(16,185,129,.2),transparent 70%);bottom:20px;right:-70px;filter:blur(50px);animation:orbB 18s ease-in-out infinite; }
    .orb-3 { width:180px;height:180px;background:radial-gradient(circle,rgba(74,222,128,.12),transparent 70%);top:50%;left:40%;filter:blur(35px);animation:orbC 22s linear infinite; }
    @keyframes orbA { 0%,100%{transform:translate(0,0)} 40%{transform:translate(60px,80px)} 70%{transform:translate(20px,140px)} }
    @keyframes orbB { 0%,100%{transform:translate(0,0)} 40%{transform:translate(-50px,-60px)} 70%{transform:translate(-15px,-100px)} }
    @keyframes orbC { 0%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(40px,-50px) rotate(180deg)} 100%{transform:translate(0,0) rotate(360deg)} }
    .neon-line { position:absolute; height:1px; background:linear-gradient(90deg,transparent,rgba(74,222,128,.4),transparent); pointer-events:none; animation:lineGlow 4s ease-in-out infinite; }
    .neon-line-1{width:60%;top:30%;left:0;animation-delay:0s;}
    .neon-line-2{width:40%;top:55%;right:0;animation-delay:1.5s;}
    .neon-line-3{width:50%;top:75%;left:10%;animation-delay:3s;}
    @keyframes lineGlow { 0%,100%{opacity:.3} 50%{opacity:1} }
    .particles { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
    .particle { position:absolute; border-radius:50%; animation:particleUp linear infinite; }
    @keyframes particleUp { 0%{transform:translateY(110vh);opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{transform:translateY(-60px);opacity:0} }
    .left-cards { position:absolute; inset:0; pointer-events:none; }
    .glass-card { position:absolute; background:rgba(255,255,255,.03); border:1px solid rgba(74,222,128,.15); border-radius:14px; padding:.85rem 1.1rem; backdrop-filter:blur(12px); animation:cardFloat ease-in-out infinite; box-shadow:0 8px 32px rgba(0,0,0,.3), inset 0 1px 0 rgba(74,222,128,.08); }
    .gc-1{top:18%;left:6%;animation-duration:6s;animation-delay:0s;}
    .gc-2{top:42%;right:8%;animation-duration:7.5s;animation-delay:1.8s;}
    .gc-3{top:65%;left:10%;animation-duration:5.5s;animation-delay:.8s;}
    @keyframes cardFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    .gc-label { font-size:.6rem; color:rgba(74,222,128,.55); letter-spacing:.1em; text-transform:uppercase; margin-bottom:.35rem; }
    .gc-value { font-size:1.05rem; font-weight:700; color:#f0fff4; }
    .gc-value span { font-size:.7rem; font-weight:400; color:rgba(74,222,128,.5); margin-left:4px; }
    .gc-row { display:flex; align-items:center; gap:.4rem; margin-top:3px; }
    .gc-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
    .gc-dot-a { background:#34d399; box-shadow:0 0 6px #34d399; }
    .gc-dot-b { background:#4ade80; box-shadow:0 0 6px #4ade80; }
    .gc-dot-c { background:#86efac; box-shadow:0 0 6px #86efac; }
    .gc-tag { font-size:.7rem; color:rgba(255,255,255,.35); }
    .left-bottom { position:absolute; bottom:2.5rem; left:2.5rem; right:2.5rem; z-index:2; }
    .left-logo-row { display:flex; align-items:center; gap:9px; margin-bottom:1rem; }
    .left-logo-box { width:32px;height:32px;background:rgba(21,128,61,.3);border:1px solid rgba(74,222,128,.25);border-radius:9px;display:grid;place-items:center; }
    .left-logo-box span { font-size:.58rem;font-weight:700;color:#86efac;letter-spacing:.06em; }
    .left-logo-name { font-size:.66rem;font-weight:600;color:rgba(255,255,255,.35); }
    .left-project-label { font-size:.58rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:rgba(74,222,128,.5);margin-bottom:.65rem; }
    .left-title { font-family:'Cormorant Garamond',serif;font-size:2.8rem;font-weight:700;color:#f0fff4;line-height:1.08;letter-spacing:-.02em; }
    .left-title em { font-style:italic;color:#4ade80; }

    .right { background:#0f2318; display:flex; flex-direction:column; justify-content:flex-start; padding:2rem 2.75rem 2.5rem; border-left:1px solid rgba(74,222,128,.08); overflow-y:auto; }
    .r-title { font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:700;color:#f0fff4;line-height:1.1;letter-spacing:-.02em;margin-bottom:.35rem; }
    .r-sub { font-size:.79rem;color:rgba(255,255,255,.4);margin-bottom:1.5rem;display:flex;align-items:center;gap:5px; }
    .r-sub button { background:none;border:none;font-family:inherit;font-size:inherit;color:#4ade80;cursor:pointer;padding:0;font-weight:500;transition:color 150ms; }
    .r-sub button:hover { color:#86efac; }
    .alert { border-radius:10px;padding:.65rem .9rem;font-size:.78rem;margin-bottom:1rem;display:flex;gap:8px;line-height:1.5;animation:drop .2s ease both; }
    @keyframes drop { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
    .alert-err { background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#fca5a5; }
    .alert-dup { background:rgba(74,222,128,.08);border:1px solid rgba(74,222,128,.2);color:#86efac; }
    .fields { display:flex;flex-direction:column;gap:.8rem; }
    .two-col { display:grid;grid-template-columns:1fr 1fr;gap:.8rem; }
    .f-label { font-size:.71rem;font-weight:500;color:rgba(255,255,255,.45);margin-bottom:.3rem;display:block; }
    .input { background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);border-radius:10px;padding:.78rem .9rem;color:#f0fff4;font-family:'Inter',sans-serif;font-size:.9rem;outline:none;width:100%;transition:all 200ms; }
    .input::placeholder { color:rgba(255,255,255,.2); }
    .input:focus { border-color:rgba(74,222,128,.5);background:rgba(255,255,255,.08);box-shadow:0 0 0 3px rgba(74,222,128,.1); }
    .input:disabled { opacity:.4;cursor:not-allowed; }
    .input.bad { border-color:rgba(239,68,68,.4); }
    .input.good { border-color:rgba(74,222,128,.4); }
    .pw-wrap { position:relative; }
    .pw-wrap .input { padding-right:2.6rem; }
    .eye { position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,.3);padding:0;display:flex;transition:color 150ms; }
    .eye:hover { color:#4ade80; }
    .pw-strength { display:flex;gap:4px;align-items:center;margin-top:5px; }
    .pw-bar { flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.08);transition:background 300ms; }
    .pw-bar.weak{background:#f87171;} .pw-bar.medium{background:#fbbf24;} .pw-bar.strong{background:#34d399;}
    .pw-label { font-size:.64rem;white-space:nowrap;min-width:36px;text-align:right; }
    .pw-label.weak{color:#f87171;} .pw-label.medium{color:#fbbf24;} .pw-label.strong{color:#34d399;}
    .match-hint { font-size:.7rem;margin-top:4px;display:flex;align-items:center;gap:4px; }
    .match-hint.ok{color:#34d399;} .match-hint.no{color:#f87171;}
    .field-err { font-size:.7rem;color:#fca5a5;margin-top:4px; }
    .forgot-row { display:flex;justify-content:flex-end;margin-top:-1px; }
    .forgot-link { background:none;border:none;font-family:inherit;font-size:.72rem;color:rgba(255,255,255,.3);cursor:pointer;padding:0;transition:color 150ms; }
    .forgot-link:hover { color:#4ade80; }
    .check-row { display:flex;align-items:center;gap:9px;cursor:pointer; }
    .check-box { width:18px;height:18px;border-radius:5px;border:1.5px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);display:grid;place-items:center;flex-shrink:0;transition:all 180ms; }
    .check-box.on { background:#15803d;border-color:#4ade80; }
    .check-box svg { display:none; } .check-box.on svg { display:block; }
    .check-label { font-size:.75rem;color:rgba(255,255,255,.4); }
    .check-label button { background:none;border:none;font-family:inherit;font-size:inherit;color:#4ade80;cursor:pointer;padding:0;text-decoration:underline;text-underline-offset:2px; }
    .btn-main { width:100%;padding:.82rem;background:#15803d;border:none;border-radius:10px;color:#fff;font-family:'Inter',sans-serif;font-size:.88rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 220ms;box-shadow:0 4px 20px rgba(21,128,61,.4); }
    .btn-main:hover:not(:disabled) { background:#166534;transform:translateY(-1px);box-shadow:0 8px 28px rgba(22,101,52,.5); }
    .btn-main:active:not(:disabled) { transform:none; }
    .btn-main:disabled { opacity:.35;cursor:not-allowed; }
    .or { display:flex;align-items:center;gap:10px; }
    .or::before,.or::after { content:'';flex:1;height:1px;background:rgba(255,255,255,.1); }
    .or span { font-size:.69rem;color:rgba(255,255,255,.3);letter-spacing:.05em; }
    .btn-google { width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:.76rem 1rem;background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.12);border-radius:10px;color:rgba(255,255,255,.7);font-family:'Inter',sans-serif;font-size:.84rem;font-weight:500;cursor:pointer;transition:all 180ms; }
    .btn-google:hover:not(:disabled) { background:rgba(255,255,255,.09);border-color:rgba(74,222,128,.3); }
    .btn-google:disabled { opacity:.45;cursor:not-allowed; }
    .fp-title { font-family:'Cormorant Garamond',serif;font-size:1.9rem;font-weight:700;color:#f0fff4;margin-bottom:.35rem; }
    .fp-desc  { font-size:.81rem;color:rgba(255,255,255,.4);line-height:1.7;margin-bottom:1.5rem; }
    .back-btn { background:none;border:none;font-family:'Inter',sans-serif;font-size:.78rem;color:rgba(255,255,255,.3);cursor:pointer;margin-top:10px;display:flex;align-items:center;gap:5px;padding:0;transition:color 150ms; }
    .back-btn:hover { color:#4ade80; }
    .spin { width:13px;height:13px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:ro .65s linear infinite; }
    .spin-dark { width:13px;height:13px;border:2px solid rgba(21,128,61,.2);border-top-color:#15803d;border-radius:50%;animation:ro .65s linear infinite; }
    .spin-sm { width:12px;height:12px;border:2px solid rgba(74,222,128,.2);border-top-color:#4ade80;border-radius:50%;animation:ro .65s linear infinite; }
    @keyframes ro { to{transform:rotate(360deg)} }

    /* Hide browser native password reveal button */
    .input::-ms-reveal,
    .input::-ms-clear,
    .input::-webkit-contacts-auto-fill-button,
    .input::-webkit-credentials-auto-fill-button { display:none !important; }
    .in { animation:si .22s ease both; }
    @keyframes si { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }
    @media(max-width:860px) { .wrap{grid-template-columns:1fr;} .left{display:none;} .right{padding:2rem 1.75rem;min-height:100vh;justify-content:flex-start;} body{padding:0;} .wrap{border-radius:0;min-height:100vh;} }
  `;
  document.head.appendChild(s);
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8"/><circle cx="12" cy="12" r="3"/></> : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>}
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="2,6 5,9 10,3"/>
  </svg>
);

const Particles = () => {
  const pts = [{left:"8%",delay:"0s",dur:"16s"},{left:"22%",delay:"2.5s",dur:"12s"},{left:"38%",delay:"5s",dur:"18s"},{left:"54%",delay:"1s",dur:"14s"},{left:"68%",delay:"7s",dur:"10s"},{left:"82%",delay:"3.5s",dur:"15s"},{left:"15%",delay:"9s",dur:"13s"},{left:"47%",delay:"6s",dur:"11s"},{left:"76%",delay:"4s",dur:"17s"}];
  return (<div className="particles">{pts.map((p,i) => <div key={i} className="particle" style={{left:p.left,bottom:"-6px",width:"2px",height:"2px",background:"rgba(74,222,128,.4)",animationDuration:p.dur,animationDelay:p.delay}}/>)}</div>);
};

const getStrength = pw => {
  if(!pw)return{label:"",level:""};
  let s=0;
  if(pw.length>=8)s++;if(pw.length>=12)s++;
  if(/[A-Z]/.test(pw)&&/[a-z]/.test(pw))s++;
  if(/[0-9]/.test(pw))s++;
  if(/[^A-Za-z0-9]/.test(pw))s++;
  if(s<=2)return{label:"Weak",level:"weak"};
  if(s<=3)return{label:"Medium",level:"medium"};
  return{label:"Strong",level:"strong"};
};

const vName  = v => { if(!v.trim())return"Name is required."; if(/\d/.test(v))return"Name should not contain numbers."; if(!/^[a-zA-Z\s'-]+$/.test(v))return"Letters only."; if(v.trim().length<2)return"Min 2 characters."; return""; };
const vEmail = v => { if(!v.trim())return"Email is required."; if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))return"Enter a valid email address."; return""; };
const vPw    = v => { if(!v)return"Password is required."; if(v.length<8)return"Minimum 8 characters."; return""; };

const OtpModal = ({ email, purpose, onClose, onSuccess }) => {
  const [digits,  setDigits]  = useState(["","","","","",""]);
  const [busy,    setBusy]    = useState(false);
  const [err,     setErr]     = useState("");
  const [timer,   setTimer]   = useState(60);
  const [sending, setSending] = useState(false);
  const refs = useRef([]);

  useEffect(()=>{refs.current[0]?.focus();},[]);
  useEffect(()=>{
    if(timer<=0)return;
    const t=setInterval(()=>setTimer(p=>p-1),1000);
    return()=>clearInterval(t);
  },[timer]);

  const handleKey=(e,idx)=>{
    if(e.key==="Backspace"){const n=[...digits];if(n[idx]){n[idx]="";setDigits(n);}else if(idx>0){n[idx-1]="";setDigits(n);refs.current[idx-1]?.focus();}return;}
    if(e.key==="ArrowLeft"&&idx>0){refs.current[idx-1]?.focus();return;}
    if(e.key==="ArrowRight"&&idx<5){refs.current[idx+1]?.focus();return;}
    if(!/^\d$/.test(e.key))return;
    const n=[...digits];n[idx]=e.key;setDigits(n);
    if(idx<5)refs.current[idx+1]?.focus();
  };

  const handlePaste=e=>{
    const p=e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if(!p)return;
    setDigits(p.split("").concat(["","","","","",""]).slice(0,6));
    refs.current[Math.min(p.length,5)]?.focus();
    e.preventDefault();
  };

  const verify=async e=>{
    e.preventDefault();
    const code=digits.join("");
    if(code.length<6){setErr("Enter the complete 6-digit code.");return;}
    setErr("");setBusy(true);
    try{await axios.post("/api/auth/verify-otp",{email,code});onSuccess();}
    catch(ex){setErr(ex.response?.data?.message||"Incorrect code. Try again.");setDigits(["","","","","",""]);refs.current[0]?.focus();}
    finally{setBusy(false);}
  };

  const resend=async()=>{
    setSending(true);
    try{await axios.post("/api/auth/send-otp",{email,purpose});setDigits(["","","","","",""]);setErr("");setTimer(60);refs.current[0]?.focus();}
    catch{setErr("Failed to resend.");}
    finally{setSending(false);}
  };

  return(
    <div className="otp-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="otp-modal">
        <button className="otp-close" onClick={onClose}>✕</button>
        <h2 className="otp-title">{purpose==="reset"?"Reset Password":"Verify Email"}</h2>
        <p className="otp-sub">{purpose==="reset"?"Reset code sent to":"Verification code sent to"}<br/><strong>{email}</strong></p>
        <form onSubmit={verify} noValidate>
          <div className="otp-boxes" onPaste={handlePaste}>
            {digits.map((d,i)=>(
              <input key={i} ref={el=>refs.current[i]=el}
                className={"otp-box"+(d?" filled":"")}
                type="text" inputMode="numeric" maxLength={1}
                value={d} onChange={()=>{}} onKeyDown={e=>handleKey(e,i)}
                disabled={busy} autoComplete="off"/>
            ))}
          </div>
          {err&&<p className="otp-err">{err}</p>}
          <button className="otp-verify-btn" disabled={digits.join("").length<6||busy}>
            {busy?<><span className="spin-dark"/>Verifying...</>:"Verify →"}
          </button>
        </form>
        <div className="otp-resend-row">
          Didn't receive it?{" "}
          {timer>0?<span>Resend in <span className="otp-timer">{timer}s</span></span>:<button className="otp-resend-btn" onClick={resend} disabled={sending}>{sending?"Sending...":"Resend Code"}</button>}
        </div>
      </div>
    </div>
  );
};

const TermsModal = ({ onClose }) => {
  const sections = [
    { icon:"📋", title:"Acceptance",       text:"By creating an account on the Digital Talent Management System, you agree to be bound by these Terms. If you do not agree, please do not use this platform." },
    { icon:"🏢", title:"Platform Use",      text:"DTMS is a professional workforce management platform. You agree to use it only for lawful purposes — managing tasks, tracking performance, and coordinating team activities." },
    { icon:"🔐", title:"Account Security",  text:"You are solely responsible for maintaining the confidentiality of your login credentials. Do not share your password with anyone. Report any suspected unauthorised access immediately." },
    { icon:"🛡️", title:"Data & Privacy",    text:"We collect your name, email address, and work activity data solely to operate the platform. Your data is never sold to third parties and is protected under strict confidentiality." },
    { icon:"👤", title:"Role-Based Access",  text:"Your access to features within DTMS is governed by your assigned role — Admin, Manager, or User. Attempting to exceed your permission level is a violation of these Terms." },
    { icon:"📊", title:"Performance Data",   text:"Task assignments, completion rates, and performance metrics are visible to authorised managers and administrators within your organisation." },
    { icon:"⚠️", title:"Termination",        text:"Your account may be suspended or permanently terminated by an administrator if these Terms are violated. Access is revoked immediately upon termination." },
    { icon:"🔄", title:"Updates to Terms",   text:"These Terms may be revised periodically. Continued use of DTMS after any update constitutes your acceptance of the revised Terms." },
    { icon:"✉️", title:"Contact & Support",  text:"For any questions regarding these Terms, please contact your organisation's DTMS administrator or reach out to the Rynixsoft support team." },
  ];
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:"600px"}}>
        <div className="modal-head">
          <div>
            <div style={{fontSize:".6rem",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"rgba(129,140,248,.65)",marginBottom:".35rem"}}>Rynixsoft · DTMS</div>
            <span className="modal-title" style={{fontSize:"1.6rem"}}>Terms &amp; Conditions</span>
            <p style={{fontSize:".78rem",color:"rgba(255,255,255,.4)",marginTop:".3rem",lineHeight:1.5}}>Please read carefully before creating your account. Last updated March 2026.</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{flexShrink:0,marginTop:".2rem"}}>✕</button>
        </div>
        <div className="modal-body" style={{padding:"1.25rem 1.75rem"}}>
          <div style={{display:"flex",flexDirection:"column",gap:".7rem"}}>
            {sections.map(({icon,title,text},i)=>(
              <div key={title} style={{display:"flex",gap:".9rem",padding:".85rem 1rem",background:"rgba(255,255,255,.02)",border:"1px solid rgba(74,222,128,.08)",borderRadius:"10px"}}>
                <div style={{width:"32px",height:"32px",flexShrink:0,background:"rgba(79,70,229,.18)",border:"1px solid rgba(129,140,248,.25)",borderRadius:"9px",display:"grid",placeItems:"center",fontSize:".9rem"}}>{icon}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:".5rem",marginBottom:".3rem"}}>
                    <span style={{fontSize:".62rem",fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"rgba(129,140,248,.7)"}}>{String(i+1).padStart(2,"0")}</span>
                    <span style={{fontSize:".82rem",fontWeight:600,color:"#e0e7ff"}}>{title}</span>
                  </div>
                  <p style={{fontSize:".78rem",color:"rgba(255,255,255,.4)",lineHeight:1.7}}>{text}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:"1rem",padding:".85rem 1rem",background:"rgba(79,70,229,.08)",border:"1px solid rgba(99,102,241,.2)",borderRadius:"10px",display:"flex",gap:".75rem",alignItems:"flex-start"}}>
            <span style={{fontSize:"1rem",flexShrink:0}}>💡</span>
            <p style={{fontSize:".75rem",color:"rgba(199,210,254,.55)",lineHeight:1.65}}>By clicking <strong style={{color:"#a5b4fc"}}>I Understand</strong> below, you confirm that you have read and agreed to all the terms above. These terms form a binding agreement between you and Rynixsoft.</p>
          </div>
        </div>
        <div className="modal-foot">
          <span style={{fontSize:".72rem",color:"rgba(255,255,255,.2)"}}>© 2026 Rynixsoft · All rights reserved</span>
          <button className="modal-btn" onClick={onClose}><span>✓</span> I Understand</button>
        </div>
      </div>
    </div>
  );
};

const LeftCards = () => (
  <div className="left-cards">
    <div className="glass-card gc-1"><p className="gc-label">Active Tasks</p><p className="gc-value">248 <span>this week</span></p></div>
    <div className="glass-card gc-2">
      <p className="gc-label">Team Status</p>
      <div style={{display:"flex",flexDirection:"column",gap:"5px",marginTop:"4px"}}>
        <div className="gc-row"><span className="gc-dot gc-dot-a"/><span className="gc-tag">Online now</span></div>
        <div className="gc-row"><span className="gc-dot gc-dot-b"/><span className="gc-tag">In review</span></div>
        <div className="gc-row"><span className="gc-dot gc-dot-c"/><span className="gc-tag">Scheduled</span></div>
      </div>
    </div>
    <div className="glass-card gc-3"><p className="gc-label">Completion</p><p className="gc-value">92% <span>on track</span></p></div>
  </div>
);

export default function Auth() {
  const navigate = useNavigate();
  const [screen,      setScreen]      = useState("signin");
  const [busy,        setBusy]        = useState(false);
  const [gBusy,       setGBusy]       = useState(false);
  const [err,         setErr]         = useState("");
  const [toast,       setToast]       = useState("");
  const [showTerms,   setShowTerms]   = useState(false);
  const [showOtp,     setShowOtp]     = useState(false);
  const [otpPurpose,  setOtpPurpose]  = useState("register");
  const [pendingData, setPendingData] = useState(null);
  const [siEmail,setSiEmail]=useState("");const[siPass,setSiPass]=useState("");const[showSiPw,setShowSiPw]=useState(false);const[siT,setSiT]=useState({});
  const[firstName,setFirstName]=useState("");const[lastName,setLastName]=useState("");const[suEmail,setSuEmail]=useState("");const[suPass,setSuPass]=useState("");const[suConfirm,setSuConfirm]=useState("");const[agreed,setAgreed]=useState(false);const[showSuPw,setShowSuPw]=useState(false);const[showConPw,setShowConPw]=useState(false);const[suT,setSuT]=useState({});
  const[fpEmail,setFpEmail]=useState("");const[fpT,setFpT]=useState(false);
  const[newPass,setNewPass]=useState("");const[newConf,setNewConf]=useState("");const[showNpw,setShowNpw]=useState(false);const[showCpw,setShowCpw]=useState(false);const[npT,setNpT]=useState({});

  useEffect(()=>{injectStyles();},[]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(""),3200);return()=>clearTimeout(t);},[toast]);

  const clear=()=>setErr("");
  const go=s=>{setScreen(s);clear();};

  const signIn=async e=>{
    e.preventDefault();setSiT({email:true,pass:true});
    const eE=vEmail(siEmail);const pE=vPw(siPass);
    if(eE){setErr(eE);return;}if(pE){setErr(pE);return;}
    clear();setBusy(true);
    try{
      const{data}=await axios.post("/api/auth/login",{email:siEmail.trim(),password:siPass});
      localStorage.setItem("dtms_token",data.token);localStorage.setItem("dtms_user",JSON.stringify(data.user));
      setToast("Login successful! Redirecting...");setTimeout(()=>navigate("/dashboard"),1200);
    }catch(ex){setErr(ex.response?.data?.message||"Incorrect email or password.");}
    finally{setBusy(false);}
  };

  const handleSignUp=e=>{
    e.preventDefault();setSuT({first:true,email:true,pass:true});
    const nE=vName(firstName);const eE=vEmail(suEmail);const pE=vPw(suPass);
    if(nE){setErr(nE);return;}if(eE){setErr(eE);return;}if(pE){setErr(pE);return;}
    if(suPass!==suConfirm){setErr("Passwords do not match.");return;}
    if(!agreed){setErr("Please agree to the Terms & Conditions.");return;}
    clear();
    const name=`${firstName.trim()} ${lastName.trim()}`.trim();
    const email=suEmail.trim();
    setPendingData({name,email,password:suPass});
    setOtpPurpose("register");setShowOtp(true);
    axios.post("/api/auth/send-otp",{email,purpose:"register"}).catch(ex=>{
      if(ex.response?.status===409){setShowOtp(false);setErr("__duplicate__");}
    });
  };

  const handleRegOtp=async()=>{
    setShowOtp(false);setBusy(true);
    try{
      const{data}=await axios.post("/api/auth/register",pendingData);
      localStorage.setItem("dtms_token",data.token);localStorage.setItem("dtms_user",JSON.stringify(data.user));
      setToast("Account created! Welcome to DTMS.");setTimeout(()=>navigate("/dashboard"),1400);
    }catch(ex){setErr(ex.response?.data?.message||"Could not create account.");}
    finally{setBusy(false);}
  };

  const handleForgotSend=e=>{
    e.preventDefault();setFpT(true);
    const eE=vEmail(fpEmail);if(eE){setErr(eE);return;}
    clear();
    setPendingData({email:fpEmail.trim()});
    setOtpPurpose("reset");setShowOtp(true);
    axios.post("/api/auth/send-otp",{email:fpEmail.trim(),purpose:"reset"}).catch(()=>{});
  };

  const handleResetPw=async e=>{
    e.preventDefault();setNpT({pass:true});
    const pE=vPw(newPass);if(pE){setErr(pE);return;}
    if(newPass!==newConf){setErr("Passwords do not match.");return;}
    clear();setBusy(true);
    try{
      await axios.post("/api/auth/reset-password",{email:pendingData.email,newPassword:newPass});
      setToast("Password reset successfully!");
      setTimeout(()=>{go("signin");setNewPass("");setNewConf("");setFpEmail("");},1500);
    }catch(ex){setErr(ex.response?.data?.message||"Reset failed.");}
    finally{setBusy(false);}
  };

  const googleAuth=async()=>{
    clear();setGBusy(true);
    try{
      const result=await signInWithPopup(auth,provider);
      const{displayName,email,uid}=result.user;
      const{data}=await axios.post("/api/auth/google",{name:displayName||email.split("@")[0],email,uid});
      localStorage.setItem("dtms_token",data.token);localStorage.setItem("dtms_user",JSON.stringify(data.user));
      setToast("Signed in with Google!");setTimeout(()=>navigate("/dashboard"),1200);
    }catch(ex){
      if(ex.code==="auth/popup-closed-by-user"||ex.code==="auth/cancelled-popup-request")return;
      setErr(ex.response?.data?.message||ex.message||"Google sign-in failed.");
    }finally{setGBusy(false);}
  };

  const fnE=suT.first?vName(firstName):"";const seE=suT.email?vEmail(suEmail):"";const spE=suT.pass?vPw(suPass):"";
  const fpeE=fpT?vEmail(fpEmail):"";const npE=npT.pass?vPw(newPass):"";
  const pwM=suConfirm.length>0&&suPass===suConfirm;const pwNM=suConfirm.length>0&&suPass!==suConfirm;
  const ncM=newConf.length>0&&newPass===newConf;const ncNM=newConf.length>0&&newPass!==newConf;
  const str=getStrength(suPass);const nStr=getStrength(newPass);
  const canIn=siEmail&&siPass&&!busy;
  const canUp=firstName.trim()&&!vName(firstName)&&suEmail&&!vEmail(suEmail)&&suPass.length>=8&&suPass===suConfirm&&agreed&&!busy;
  const canFp=fpEmail&&!vEmail(fpEmail)&&!busy;
  const canReset=newPass.length>=8&&newPass===newConf&&!busy;

  return(
    <>
      {toast&&<div className="toast"><div className="toast-icon">✓</div>{toast}</div>}
      {showTerms&&<TermsModal onClose={()=>setShowTerms(false)}/>}
      {showOtp&&pendingData&&(
        <OtpModal email={pendingData.email} purpose={otpPurpose}
          onClose={()=>setShowOtp(false)}
          onSuccess={otpPurpose==="reset"?()=>{setShowOtp(false);setScreen("forgot-reset");clear();}:handleRegOtp}/>
      )}

      <div className="wrap">
        <div className="left">
          <div className="left-bg"/><div className="left-grid"/>
          <Particles/>
          <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>
          <div className="neon-line neon-line-1"/><div className="neon-line neon-line-2"/><div className="neon-line neon-line-3"/>
          <LeftCards/>
          <div className="left-bottom">
            <div className="left-logo-row">
              <div className="left-logo-box"><span>DT</span></div>
              <span className="left-logo-name">Rynixsoft</span>
            </div>
            <p className="left-project-label">Digital Talent Management System</p>
            <h1 className="left-title">Every task.<br/>Every person.<br/><em>One place.</em></h1>
          </div>
        </div>

        <div className="right">

          {screen==="signin"&&(
            <div className="in">
              <div style={{marginBottom:"1.5rem",paddingTop:".25rem"}}>
                <h2 style={{fontFamily:"'Inter',sans-serif",fontSize:"1.75rem",fontWeight:800,color:"#ffffff",letterSpacing:"-.03em",lineHeight:1.1,marginBottom:".75rem"}}>Digital Talent<br/>Management System</h2>
                <div style={{height:"1px",background:"rgba(255,255,255,0.15)",width:"100%"}}/>
              </div>
              <p className="r-title">Welcome back</p>
              <p className="r-sub">No account? <button onClick={()=>go("signup")}>Create a new account</button></p>
              {err&&<div className="alert alert-err">{err}</div>}
              <form className="fields" onSubmit={signIn} noValidate>
                <div>
                  <label className="f-label">Email address</label>
                  <input type="email" placeholder="rynixsoft@gmail.com" value={siEmail} onChange={e=>setSiEmail(e.target.value)} onBlur={()=>setSiT(p=>({...p,email:true}))} className={"input"+(siT.email&&vEmail(siEmail)?" bad":"")} disabled={busy} autoComplete="email"/>
                  {siT.email&&vEmail(siEmail)&&<p className="field-err">{vEmail(siEmail)}</p>}
                </div>
                <div>
                  <label className="f-label">Password</label>
                  <div className="pw-wrap">
                    <input type={showSiPw?"text":"password"} placeholder="Your password" value={siPass} onChange={e=>setSiPass(e.target.value)} className="input" disabled={busy} autoComplete="off" readOnly onFocus={e=>e.target.removeAttribute("readOnly")}/>
                    <button type="button" className="eye" onClick={()=>setShowSiPw(p=>!p)}><EyeIcon open={showSiPw}/></button>
                  </div>
                  <div className="forgot-row" style={{marginTop:".75rem"}}><button type="button" className="forgot-link" onClick={()=>{go("forgot-email");setFpEmail("");setFpT(false);}}>Forgot password?</button></div>
                </div>
                <button className="btn-main" disabled={!canIn}>{busy?<><span className="spin"/>Signing in...</>:"Sign In →"}</button>
                <div className="or"><span>or</span></div>
                <button type="button" className="btn-google" onClick={googleAuth} disabled={gBusy}>{gBusy?<span className="spin-sm"/>:<GoogleIcon/>} Continue with Google</button>
              </form>
            </div>
          )}

          {screen==="signup"&&(
            <div className="in">
              <p className="r-title">Create account</p>
              <p className="r-sub">Already registered? <button onClick={()=>go("signin")}>Sign in</button></p>
              {err==="__duplicate__"?<div className="alert alert-dup">ⓘ &nbsp;This email is already registered. <button type="button" onClick={()=>go("signin")} style={{background:"none",border:"none",fontFamily:"inherit",fontSize:"inherit",cursor:"pointer",fontWeight:700,padding:0,color:"inherit",textDecoration:"underline",textUnderlineOffset:"2px"}}>Sign in →</button></div>:err?<div className="alert alert-err">{err}</div>:null}
              <form className="fields" onSubmit={handleSignUp} noValidate>
                <div className="two-col">
                  <div>
                    <label className="f-label">First name</label>
                    <input type="text" placeholder="John" value={firstName} onChange={e=>setFirstName(e.target.value)} onBlur={()=>setSuT(p=>({...p,first:true}))} className={"input"+(fnE?" bad":"")} disabled={busy} autoComplete="given-name"/>
                    {fnE&&<p className="field-err">{fnE}</p>}
                  </div>
                  <div>
                    <label className="f-label">Last name</label>
                    <input type="text" placeholder="Doe" value={lastName} onChange={e=>setLastName(e.target.value)} className="input" disabled={busy} autoComplete="family-name"/>
                  </div>
                </div>
                <div>
                  <label className="f-label">Email address</label>
                  <input type="email" placeholder="rynixsoft@gmail.com" value={suEmail} onChange={e=>setSuEmail(e.target.value)} onBlur={()=>setSuT(p=>({...p,email:true}))} className={"input"+(seE?" bad":"")} disabled={busy} autoComplete="email"/>
                  {seE&&<p className="field-err">{seE}</p>}
                </div>
                <div>
                  <label className="f-label">Password</label>
                  <div className="pw-wrap">
                    <input type={showSuPw?"text":"password"} placeholder="Min. 8 characters" value={suPass} onChange={e=>setSuPass(e.target.value)} onBlur={()=>setSuT(p=>({...p,pass:true}))} className={"input"+(spE?" bad":"")} disabled={busy} autoComplete="off" readOnly onFocus={e=>e.target.removeAttribute("readOnly")}/>
                    <button type="button" className="eye" onClick={()=>setShowSuPw(p=>!p)}><EyeIcon open={showSuPw}/></button>
                  </div>
                  {suPass&&<div className="pw-strength">{[1,2,3].map(i=><div key={i} className={"pw-bar "+(str.level==="weak"&&i===1?"weak":str.level==="medium"&&i<=2?"medium":str.level==="strong"?"strong":"")}/>)}<span className={"pw-label "+str.level}>{str.label}</span></div>}
                  {spE&&<p className="field-err">{spE}</p>}
                </div>
                <div>
                  <label className="f-label">Confirm password</label>
                  <div className="pw-wrap">
                    <input type={showConPw?"text":"password"} placeholder="Repeat your password" value={suConfirm} onChange={e=>setSuConfirm(e.target.value)} className={"input"+(pwNM?" bad":"")+(pwM?" good":"")} disabled={busy} autoComplete="off" readOnly onFocus={e=>e.target.removeAttribute("readOnly")}/>
                    <button type="button" className="eye" onClick={()=>setShowConPw(p=>!p)}><EyeIcon open={showConPw}/></button>
                  </div>
                  {pwM&&<p className="match-hint ok">✓ Passwords match</p>}
                  {pwNM&&<p className="match-hint no">✕ Passwords do not match</p>}
                </div>
                <div className="check-row" onClick={()=>setAgreed(p=>!p)}>
                  <div className={"check-box"+(agreed?" on":"")}><CheckIcon/></div>
                  <span className="check-label">I agree to the <button type="button" onClick={e=>{e.stopPropagation();setShowTerms(true);}}>Terms &amp; Conditions</button></span>
                </div>
                <button className="btn-main" disabled={!canUp}>{busy?<><span className="spin"/>Sending OTP...</>:"Create Account →"}</button>
                <div className="or"><span>or</span></div>
                <button type="button" className="btn-google" onClick={googleAuth} disabled={gBusy}>{gBusy?<span className="spin-sm"/>:<GoogleIcon/>} Continue with Google</button>
              </form>
            </div>
          )}

          {screen==="forgot-email"&&(
            <div className="in">
              <p className="fp-title">Forgot Password?</p>
              <p className="fp-desc">Enter your registered email. We'll send a verification code to reset your password.</p>
              {err&&<div className="alert alert-err">{err}</div>}
              <form className="fields" onSubmit={handleForgotSend} noValidate>
                <div>
                  <label className="f-label">Email address</label>
                  <input type="email" placeholder="rynixsoft@gmail.com" value={fpEmail} onChange={e=>setFpEmail(e.target.value)} onBlur={()=>setFpT(true)} className={"input"+(fpeE?" bad":"")} disabled={busy} autoComplete="email"/>
                  {fpeE&&<p className="field-err">{fpeE}</p>}
                </div>
                <button className="btn-main" disabled={!canFp}>{busy?<><span className="spin"/>Sending...</>:"Send Verification Code →"}</button>
              </form>
              <button className="back-btn" onClick={()=>go("signin")}>← Back to sign in</button>
            </div>
          )}

          {screen==="forgot-reset"&&(
            <div className="in">
              <p className="fp-title">Set New Password</p>
              <p className="fp-desc">Create a new password for <strong style={{color:"#4ade80"}}>{pendingData?.email}</strong></p>
              {err&&<div className="alert alert-err">{err}</div>}
              <form className="fields" onSubmit={handleResetPw} noValidate>
                <div>
                  <label className="f-label">New password</label>
                  <div className="pw-wrap">
                    <input type={showNpw?"text":"password"} placeholder="Min. 8 characters" value={newPass} onChange={e=>setNewPass(e.target.value)} onBlur={()=>setNpT(p=>({...p,pass:true}))} className={"input"+(npE?" bad":"")} disabled={busy} autoComplete="off" readOnly onFocus={e=>e.target.removeAttribute("readOnly")}/>
                    <button type="button" className="eye" onClick={()=>setShowNpw(p=>!p)}><EyeIcon open={showNpw}/></button>
                  </div>
                  {newPass&&<div className="pw-strength">{[1,2,3].map(i=><div key={i} className={"pw-bar "+(nStr.level==="weak"&&i===1?"weak":nStr.level==="medium"&&i<=2?"medium":nStr.level==="strong"?"strong":"")}/>)}<span className={"pw-label "+nStr.level}>{nStr.label}</span></div>}
                  {npE&&<p className="field-err">{npE}</p>}
                </div>
                <div>
                  <label className="f-label">Confirm new password</label>
                  <div className="pw-wrap">
                    <input type={showCpw?"text":"password"} placeholder="Repeat new password" value={newConf} onChange={e=>setNewConf(e.target.value)} className={"input"+(ncNM?" bad":"")+(ncM?" good":"")} disabled={busy} autoComplete="off" readOnly onFocus={e=>e.target.removeAttribute("readOnly")}/>
                    <button type="button" className="eye" onClick={()=>setShowCpw(p=>!p)}><EyeIcon open={showCpw}/></button>
                  </div>
                  {ncM&&<p className="match-hint ok">✓ Passwords match</p>}
                  {ncNM&&<p className="match-hint no">✕ Passwords do not match</p>}
                </div>
                <button className="btn-main" disabled={!canReset}>{busy?<><span className="spin"/>Resetting...</>:"Reset Password →"}</button>
              </form>
              <button className="back-btn" onClick={()=>go("signin")}>← Back to sign in</button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}