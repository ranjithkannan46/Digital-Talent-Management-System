import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth, provider, signInWithPopup } from "../firebase";

const injectStyles = () => {
  if (document.getElementById("auth-css")) return;
  const s = document.createElement("style");
  s.id = "auth-css";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Inter:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Inter',system-ui,sans-serif; background:#1e1c2e; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:1.5rem; -webkit-font-smoothing:antialiased; }

    /* Toast */
    .toast { position:fixed; top:1.5rem; left:50%; transform:translateX(-50%); z-index:9999; display:flex; align-items:center; gap:.65rem; padding:.85rem 1.4rem; border-radius:12px; font-size:.83rem; font-weight:500; box-shadow:0 8px 32px rgba(0,0,0,.5); animation:toastIn .35s cubic-bezier(.22,1,.36,1) both; white-space:nowrap; background:#0d2818; border:1px solid rgba(52,211,153,.3); color:#6ee7b7; }
    .toast-icon { width:20px; height:20px; background:rgba(52,211,153,.15); border-radius:50%; display:grid; place-items:center; font-size:.7rem; flex-shrink:0; }
    @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(-14px) scale(.95)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }

    /* OTP Modal */
    .otp-overlay { position:fixed; inset:0; z-index:8000; background:rgba(0,0,0,.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:1.5rem; animation:fadeIn .2s ease both; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .otp-modal { background:#ffffff; border-radius:20px; width:100%; max-width:380px; padding:2rem 2rem 1.75rem; box-shadow:0 24px 60px rgba(0,0,0,.45); position:relative; animation:modalIn .3s cubic-bezier(.22,1,.36,1) both; }
    @keyframes modalIn { from{opacity:0;transform:translateY(20px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
    .otp-close { position:absolute; top:1rem; right:1rem; background:#f3f4f6; border:none; width:28px; height:28px; border-radius:50%; color:#6b7280; font-size:.85rem; cursor:pointer; display:grid; place-items:center; transition:background 150ms ease; }
    .otp-close:hover { background:#e5e7eb; color:#111; }
    .otp-title { font-family:'Inter',sans-serif; font-size:1.2rem; font-weight:700; color:#111827; text-align:center; margin-bottom:.45rem; }
    .otp-sub { font-size:.81rem; color:#6b7280; text-align:center; line-height:1.6; margin-bottom:1.6rem; }
    .otp-sub strong { color:#7c3aed; font-weight:600; }
    .otp-boxes { display:flex; gap:.5rem; justify-content:center; margin-bottom:1.25rem; }
    .otp-box { width:44px; height:52px; background:#f3f4f6; border:2px solid #e5e7eb; border-radius:10px; text-align:center; font-size:1.3rem; font-weight:700; color:#111827; outline:none; font-family:'Inter',sans-serif; transition:border-color 180ms ease, background 180ms ease, box-shadow 180ms ease; caret-color:transparent; }
    .otp-box:focus { border-color:#7c3aed; background:#faf5ff; box-shadow:0 0 0 3px rgba(124,58,237,.12); }
    .otp-box.filled { border-color:#7c3aed; background:#faf5ff; color:#7c3aed; }
    .otp-box:disabled { opacity:.5; cursor:not-allowed; }
    .otp-err { font-size:.76rem; color:#ef4444; text-align:center; margin-bottom:.85rem; }
    .otp-verify { width:100%; padding:.82rem; background:#7c3aed; border:none; border-radius:12px; color:#fff; font-family:'Inter',sans-serif; font-size:.88rem; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 180ms ease; margin-bottom:1.1rem; }
    .otp-verify:hover:not(:disabled) { background:#6d28d9; transform:translateY(-1px); box-shadow:0 6px 20px rgba(124,58,237,.3); }
    .otp-verify:disabled { opacity:.4; cursor:not-allowed; }
    .otp-resend-row { text-align:center; font-size:.79rem; color:#9ca3af; }
    .otp-resend-btn { background:none; border:none; font-family:'Inter',sans-serif; font-size:inherit; font-weight:600; color:#7c3aed; cursor:pointer; padding:0; transition:color 150ms ease; }
    .otp-resend-btn:hover { color:#6d28d9; }
    .otp-resend-btn:disabled { color:#d1d5db; cursor:default; }
    .otp-timer { color:#7c3aed; font-weight:600; font-variant-numeric:tabular-nums; }

    /* Terms Modal */
    .modal-overlay { position:fixed; inset:0; z-index:8888; background:rgba(0,0,0,.75); display:flex; align-items:center; justify-content:center; padding:1.5rem; animation:fadeIn .2s ease both; }
    .modal { background:#1a1730; border:1px solid rgba(255,255,255,.08); border-radius:18px; width:100%; max-width:560px; max-height:80vh; display:flex; flex-direction:column; box-shadow:0 32px 80px rgba(0,0,0,.7); animation:modalIn .3s cubic-bezier(.22,1,.36,1) both; }
    .modal-head { padding:1.5rem 1.75rem 1rem; border-bottom:1px solid rgba(255,255,255,.06); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
    .modal-title { font-family:'Cormorant Garamond',serif; font-size:1.4rem; font-weight:700; color:#f0eeff; }
    .modal-close-btn { background:none; border:none; color:#524e6b; cursor:pointer; font-size:1.1rem; padding:4px; line-height:1; transition:color 150ms ease; border-radius:6px; }
    .modal-close-btn:hover { color:#f0eeff; background:rgba(255,255,255,.06); }
    .modal-body { padding:1.5rem 1.75rem; overflow-y:auto; flex:1; }
    .modal-body::-webkit-scrollbar { width:4px; }
    .modal-body::-webkit-scrollbar-thumb { background:rgba(255,255,255,.08); border-radius:2px; }
    .modal-section { margin-bottom:1.5rem; }
    .modal-section:last-child { margin-bottom:0; }
    .modal-h { font-size:.78rem; font-weight:600; color:#a78bfa; letter-spacing:.08em; text-transform:uppercase; margin-bottom:.5rem; }
    .modal-p { font-size:.82rem; color:#6b6789; line-height:1.75; }
    .modal-foot { padding:1rem 1.75rem; border-top:1px solid rgba(255,255,255,.06); display:flex; justify-content:flex-end; flex-shrink:0; }
    .modal-btn { background:#7c3aed; border:none; border-radius:8px; padding:.6rem 1.5rem; color:#fff; font-family:'Inter',sans-serif; font-size:.82rem; font-weight:600; cursor:pointer; transition:background 180ms ease; }
    .modal-btn:hover { background:#6d28d9; }

    /* Main card */
    .wrap { display:grid; grid-template-columns:1fr 460px; width:100%; max-width:1080px; min-height:680px; background:#28263c; border-radius:22px; overflow:hidden; box-shadow:0 0 0 1px rgba(255,255,255,0.06), 0 48px 120px rgba(0,0,0,0.5); animation:rise .55s cubic-bezier(.22,1,.36,1) both; }
    @keyframes rise { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

    /* Left */
    .left { position:relative; overflow:hidden; background:#0a0818; }
    .left-gradient { position:absolute; inset:0; background: radial-gradient(ellipse at 30% 30%, rgba(124,58,237,0.45), transparent 55%), radial-gradient(ellipse at 70% 70%, rgba(99,102,241,0.3), transparent 50%), radial-gradient(ellipse at 60% 20%, rgba(168,85,247,0.25), transparent 45%), linear-gradient(160deg, #0a0818 0%, #150f2a 50%, #0a0818 100%); animation:gradShift 10s ease-in-out infinite alternate; }
    @keyframes gradShift { 0%{filter:hue-rotate(0deg) brightness(1)} 50%{filter:hue-rotate(22deg) brightness(1.08)} 100%{filter:hue-rotate(-10deg) brightness(0.96)} }
    .left-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(167,139,250,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(167,139,250,.018) 1px,transparent 1px); background-size:48px 48px; pointer-events:none; }
    .orb { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; }
    .orb-1 { width:350px;height:350px;background:rgba(124,58,237,.22);top:-100px;left:-100px;animation:floatA 14s ease-in-out infinite; }
    .orb-2 { width:260px;height:260px;background:rgba(99,102,241,.18);bottom:20px;right:-70px;animation:floatB 18s ease-in-out infinite; }
    .orb-3 { width:200px;height:200px;background:rgba(236,72,153,.12);top:50%;left:40%;animation:floatC 22s linear infinite; }
    @keyframes floatA { 0%,100%{transform:translate(0,0)} 40%{transform:translate(60px,80px)} 70%{transform:translate(20px,140px)} }
    @keyframes floatB { 0%,100%{transform:translate(0,0)} 40%{transform:translate(-50px,-60px)} 70%{transform:translate(-15px,-110px)} }
    @keyframes floatC { 0%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(40px,-50px) rotate(180deg)} 100%{transform:translate(0,0) rotate(360deg)} }
    .particles { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
    .particle { position:absolute; border-radius:50%; background:rgba(167,139,250,.4); animation:particleUp linear infinite; }
    @keyframes particleUp { 0%{transform:translateY(110vh);opacity:0} 8%{opacity:1} 92%{opacity:1} 100%{transform:translateY(-60px);opacity:0} }
    .left-cards { position:absolute; inset:0; pointer-events:none; }
    .float-card { position:absolute; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:.85rem 1.1rem; backdrop-filter:blur(12px); animation:cardFloat ease-in-out infinite; }
    .fc-1 { top:22%; left:8%; animation-duration:6s; }
    .fc-2 { top:42%; right:10%; animation-duration:7.5s; animation-delay:1.5s; }
    .fc-3 { top:65%; left:12%; animation-duration:5.5s; animation-delay:.8s; }
    @keyframes cardFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    .fc-label { font-size:.62rem; color:rgba(255,255,255,.35); letter-spacing:.06em; text-transform:uppercase; margin-bottom:.3rem; }
    .fc-value { font-size:1.1rem; font-weight:700; color:#f0eeff; }
    .fc-value span { font-size:.72rem; font-weight:400; color:#a78bfa; margin-left:4px; }
    .fc-row { display:flex; align-items:center; gap:.4rem; }
    .fc-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
    .fc-dot-green  { background:#34d399; box-shadow:0 0 6px #34d399; }
    .fc-dot-purple { background:#a78bfa; box-shadow:0 0 6px #a78bfa; }
    .fc-dot-blue   { background:#60a5fa; box-shadow:0 0 6px #60a5fa; }
    .fc-tag { font-size:.7rem; color:rgba(255,255,255,.4); }
    .left-bottom { position:absolute; bottom:2.5rem; left:2.5rem; right:2.5rem; z-index:2; }
    .left-logo-row { display:flex; align-items:center; gap:9px; margin-bottom:1rem; }
    .left-logo-box { width:32px; height:32px; background:rgba(124,58,237,.25); border:1px solid rgba(167,139,250,.2); border-radius:9px; display:grid; place-items:center; }
    .left-logo-box span { font-size:.58rem; font-weight:700; color:#c4b5fd; letter-spacing:.06em; }
    .left-logo-name { font-size:.66rem; font-weight:600; color:rgba(255,255,255,.35); }
    .left-project-label { font-size:.58rem; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:rgba(167,139,250,.5); margin-bottom:.65rem; }
    .left-title { font-family:'Cormorant Garamond',serif; font-size:2.8rem; font-weight:700; color:#f0eeff; line-height:1.08; letter-spacing:-.02em; animation:textIn 1s ease both; }
    @keyframes textIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .left-title em { font-style:italic; color:#c4b5fd; }

    /* Right */
    .right { background:#28263c; display:flex; flex-direction:column; justify-content:center; padding:2.75rem; border-left:1px solid rgba(255,255,255,.05); overflow-y:auto; }
    .r-title { font-family:'Cormorant Garamond',serif; font-size:2.2rem; font-weight:700; color:#f0eeff; line-height:1.1; letter-spacing:-.02em; margin-bottom:.4rem; }
    .r-sub { font-size:.79rem; color:#6b6789; margin-bottom:1.6rem; display:flex; align-items:center; gap:5px; }
    .r-sub button { background:none; border:none; font-family:inherit; font-size:inherit; color:#a78bfa; cursor:pointer; padding:0; font-weight:500; transition:color 150ms ease; }
    .r-sub button:hover { color:#c4b5fd; }

    .alert { border-radius:10px; padding:.65rem .9rem; font-size:.78rem; margin-bottom:1rem; display:flex; gap:8px; line-height:1.5; animation:drop .2s ease both; }
    @keyframes drop { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
    .alert-err { background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.2); color:#fca5a5; }
    .alert-dup { background:rgba(167,139,250,.08); border:1px solid rgba(167,139,250,.2); color:#c4b5fd; }

    .fields { display:flex; flex-direction:column; gap:.8rem; }
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:.8rem; }
    .f-label { font-size:.71rem; font-weight:500; color:#524e6b; margin-bottom:.3rem; display:block; letter-spacing:.02em; }

    .input { background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.07); border-radius:10px; padding:.78rem .9rem; color:#f0eeff; font-family:'Inter',sans-serif; font-size:.86rem; font-weight:400; outline:none; width:100%; transition:border-color 200ms ease,background 200ms ease,box-shadow 200ms ease; }
    .input::placeholder { color:#3d3a58; }
    .input:focus { border-color:rgba(167,139,250,.45); background:rgba(255,255,255,.07); box-shadow:0 0 0 3px rgba(167,139,250,.07); }
    .input:disabled { opacity:.4; cursor:not-allowed; }
    .input.bad  { border-color:rgba(239,68,68,.4); }
    .input.good { border-color:rgba(52,211,153,.3); }

    .pw-wrap { position:relative; }
    .pw-wrap .input { padding-right:2.6rem; }
    .eye { position:absolute; right:11px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#3d3a58; padding:0; display:flex; transition:color 150ms ease; }
    .eye:hover { color:#a78bfa; }

    .pw-strength { display:flex; gap:4px; align-items:center; margin-top:5px; }
    .pw-bar { flex:1; height:3px; border-radius:2px; background:rgba(255,255,255,.06); transition:background 300ms ease; }
    .pw-bar.weak { background:#f87171; } .pw-bar.medium { background:#fbbf24; } .pw-bar.strong { background:#34d399; }
    .pw-label { font-size:.64rem; white-space:nowrap; min-width:36px; text-align:right; }
    .pw-label.weak { color:#f87171; } .pw-label.medium { color:#fbbf24; } .pw-label.strong { color:#34d399; }

    .match-hint { font-size:.7rem; margin-top:4px; display:flex; align-items:center; gap:4px; }
    .match-hint.ok { color:#34d399; } .match-hint.no { color:#f87171; }

    .field-err { font-size:.7rem; color:#fca5a5; margin-top:4px; }

    .forgot-row { display:flex; justify-content:flex-end; margin-top:-1px; }
    .forgot-link { background:none; border:none; font-family:inherit; font-size:.72rem; color:#3d3a58; cursor:pointer; padding:0; transition:color 150ms ease; }
    .forgot-link:hover { color:#a78bfa; }

    .check-row { display:flex; align-items:center; gap:9px; cursor:pointer; }
    .check-box { width:18px; height:18px; border-radius:5px; border:1.5px solid rgba(255,255,255,.12); background:rgba(255,255,255,.04); display:grid; place-items:center; flex-shrink:0; transition:all 180ms ease; }
    .check-box.on { background:#7c3aed; border-color:#7c3aed; }
    .check-box svg { display:none; } .check-box.on svg { display:block; }
    .check-label { font-size:.75rem; color:#524e6b; }
    .check-label button { background:none; border:none; font-family:inherit; font-size:inherit; color:#a78bfa; cursor:pointer; padding:0; text-decoration:underline; text-underline-offset:2px; }

    .btn-main { width:100%; padding:.82rem; background:#7c3aed; border:none; border-radius:10px; color:#fff; font-family:'Inter',sans-serif; font-size:.87rem; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 180ms ease; }
    .btn-main:hover:not(:disabled) { background:#6d28d9; transform:translateY(-1px); box-shadow:0 8px 28px rgba(124,58,237,.3); }
    .btn-main:active:not(:disabled) { transform:none; box-shadow:none; }
    .btn-main:disabled { opacity:.35; cursor:not-allowed; }

    .or { display:flex; align-items:center; gap:10px; }
    .or::before,.or::after { content:''; flex:1; height:1px; background:rgba(255,255,255,.06); }
    .or span { font-size:.69rem; color:#3d3a58; letter-spacing:.05em; }

    .btn-google { width:100%; display:flex; align-items:center; justify-content:center; gap:10px; padding:.76rem 1rem; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.08); border-radius:10px; color:#b0a8d0; font-family:'Inter',sans-serif; font-size:.84rem; font-weight:500; cursor:pointer; transition:all 180ms ease; }
    .btn-google:hover:not(:disabled) { background:rgba(255,255,255,.08); border-color:rgba(167,139,250,.2); }
    .btn-google:disabled { opacity:.45; cursor:not-allowed; }

    .fp-title { font-family:'Cormorant Garamond',serif; font-size:1.9rem; font-weight:700; color:#f0eeff; margin-bottom:.35rem; }
    .fp-desc  { font-size:.81rem; color:#6b6789; line-height:1.7; margin-bottom:1.5rem; }
    .back-btn { background:none; border:none; font-family:'Inter',sans-serif; font-size:.78rem; color:#3d3a58; cursor:pointer; margin-top:10px; display:flex; align-items:center; gap:5px; padding:0; transition:color 150ms ease; }
    .back-btn:hover { color:#a78bfa; }

    .spin { width:13px; height:13px; border:2px solid rgba(255,255,255,.2); border-top-color:#fff; border-radius:50%; animation:ro .65s linear infinite; }
    .spin-dark { width:13px; height:13px; border:2px solid rgba(124,58,237,.2); border-top-color:#7c3aed; border-radius:50%; animation:ro .65s linear infinite; }
    .spin-sm { width:12px; height:12px; border:2px solid rgba(196,181,253,.2); border-top-color:#c4b5fd; border-radius:50%; animation:ro .65s linear infinite; }
    @keyframes ro { to{transform:rotate(360deg)} }

    .in { animation:si .22s ease both; }
    @keyframes si { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }

    @media(max-width:860px) {
      .wrap { grid-template-columns:1fr; }
      .left { display:none; }
      .right { padding:2.5rem 1.75rem; min-height:100vh; }
      body { padding:0; }
      .wrap { border-radius:0; min-height:100vh; }
    }
  `;
  document.head.appendChild(s);
};

/* ── Icons ── */
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
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="2,6 5,9 10,3"/>
  </svg>
);

const Particles = () => {
  const pts = [
    {left:"8%",delay:"0s",dur:"16s",size:"2px"},{left:"22%",delay:"2.5s",dur:"12s",size:"3px"},
    {left:"38%",delay:"5s",dur:"18s",size:"2px"},{left:"54%",delay:"1s",dur:"14s",size:"3px"},
    {left:"68%",delay:"7s",dur:"10s",size:"2px"},{left:"82%",delay:"3.5s",dur:"15s",size:"2px"},
    {left:"15%",delay:"9s",dur:"13s",size:"3px"},{left:"47%",delay:"6s",dur:"11s",size:"2px"},
    {left:"76%",delay:"4s",dur:"17s",size:"3px"},
  ];
  return (
    <div className="particles">
      {pts.map((p, i) => (
        <div key={i} className="particle" style={{ left:p.left, bottom:"-6px", width:p.size, height:p.size, animationDuration:p.dur, animationDelay:p.delay }} />
      ))}
    </div>
  );
};

const getStrength = (pw) => {
  if (!pw) return { label:"", level:"" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { label:"Weak", level:"weak" };
  if (score <= 3) return { label:"Medium", level:"medium" };
  return { label:"Strong", level:"strong" };
};

/* ── Validation helpers ── */
const validateName = (val) => {
  if (!val.trim())            return "Name is required.";
  if (/\d/.test(val))         return "Name should not contain numbers.";
  if (!/^[a-zA-Z\s'-]+$/.test(val)) return "Name can only contain letters.";
  if (val.trim().length < 2)  return "Name must be at least 2 characters.";
  return "";
};

const validateEmail = (val) => {
  if (!val.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Please enter a valid email address.";
  return "";
};

const validatePassword = (val) => {
  if (!val) return "Password is required.";
  if (val.length < 8) return "Password must be at least 8 characters.";
  return "";
};

/* ── OTP Modal ── */
const OtpModal = ({ email, purpose, onClose, onSuccess }) => {
  const [digits,  setDigits]  = useState(["","","","","",""]);
  const [busy,    setBusy]    = useState(false);
  const [err,     setErr]     = useState("");
  const [timer,   setTimer]   = useState(60);
  const [sending, setSending] = useState(false);
  const refs = useRef([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  const handleKey = (e, idx) => {
    if (e.key === "Backspace") {
      const next = [...digits];
      if (next[idx]) { next[idx] = ""; setDigits(next); }
      else if (idx > 0) { next[idx-1] = ""; setDigits(next); refs.current[idx-1]?.focus(); }
      return;
    }
    if (e.key === "ArrowLeft"  && idx > 0) { refs.current[idx-1]?.focus(); return; }
    if (e.key === "ArrowRight" && idx < 5) { refs.current[idx+1]?.focus(); return; }
    if (!/^\d$/.test(e.key)) return;
    const next = [...digits]; next[idx] = e.key; setDigits(next);
    if (idx < 5) refs.current[idx+1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (!pasted) return;
    const next = pasted.split("").concat(["","","","","",""]).slice(0,6);
    setDigits(next);
    refs.current[Math.min(pasted.length,5)]?.focus();
    e.preventDefault();
  };

  const verify = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) { setErr("Enter the complete 6-digit code."); return; }
    setErr(""); setBusy(true);
    try {
      await axios.post("/api/auth/verify-otp", { email, code });
      onSuccess();
    } catch (ex) {
      setErr(ex.response?.data?.message || "Incorrect code. Try again.");
      setDigits(["","","","","",""]);
      refs.current[0]?.focus();
    } finally { setBusy(false); }
  };

  const resend = async () => {
    setSending(true);
    try {
      await axios.post("/api/auth/send-otp", { email, purpose });
      setDigits(["","","","","",""]); setErr(""); setTimer(60);
      refs.current[0]?.focus();
    } catch { setErr("Failed to resend. Please try again."); }
    finally { setSending(false); }
  };

  const label = purpose === "reset" ? "Reset your password" : "Verify your email";
  const sub   = purpose === "reset"
    ? "We sent a 6-digit code to reset your password"
    : "We sent a 6-digit verification code to";

  return (
    <div className="otp-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="otp-modal">
        <button className="otp-close" onClick={onClose}>✕</button>
        <h2 className="otp-title">{label}</h2>
        <p className="otp-sub">
          {sub}<br/><strong>{email}</strong>
        </p>
        <form onSubmit={verify} noValidate>
          <div className="otp-boxes" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i} ref={el => refs.current[i] = el}
                className={`otp-box${d ? " filled" : ""}`}
                type="text" inputMode="numeric" maxLength={1}
                value={d} onChange={() => {}}
                onKeyDown={e => handleKey(e, i)}
                disabled={busy} autoComplete="off"
              />
            ))}
          </div>
          {err && <p className="otp-err">{err}</p>}
          <button className="otp-verify" disabled={digits.join("").length < 6 || busy}>
            {busy ? <><span className="spin-dark" /> Verifying...</> : "Verify"}
          </button>
        </form>
        <div className="otp-resend-row">
          Didn't receive the code?{" "}
          {timer > 0
            ? <span>Resend in <span className="otp-timer">{timer}s</span></span>
            : <button className="otp-resend-btn" onClick={resend} disabled={sending}>
                {sending ? "Sending..." : "Resend Code"}
              </button>
          }
        </div>
      </div>
    </div>
  );
};

/* ── Terms Modal ── */
const TermsModal = ({ onClose }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal">
      <div className="modal-head">
        <span className="modal-title">Terms &amp; Conditions</span>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="modal-body">
        {[
          ["1. Acceptance of Terms","By creating an account on the Digital Talent Management System (DTMS), you agree to be bound by these Terms and Conditions."],
          ["2. Use of the Platform","DTMS is a workforce management platform for professional use. You agree to use it only for lawful purposes — managing tasks, tracking performance, and coordinating team activities."],
          ["3. Account Responsibility","You are responsible for maintaining the security of your account credentials. Do not share your password with anyone."],
          ["4. Data & Privacy","DTMS collects your name, email, and work activity solely to operate the platform. Your data will not be sold to third parties."],
          ["5. Role-Based Access","Your access is determined by your assigned role (Admin, Manager, or User). Do not attempt to access features beyond your permission level."],
          ["6. Task & Performance Data","Tasks and completion metrics are visible to authorised managers within your organisation."],
          ["7. Termination","Your account may be suspended if you violate these terms. Access will be revoked immediately upon termination."],
          ["8. Updates to Terms","These Terms may be updated. Continued use after changes constitutes acceptance of the revised Terms."],
          ["9. Contact","For questions, contact your DTMS administrator or Rynixsoft support."],
        ].map(([h, p]) => (
          <div className="modal-section" key={h}>
            <p className="modal-h">{h}</p>
            <p className="modal-p">{p}</p>
          </div>
        ))}
      </div>
      <div className="modal-foot">
        <button className="modal-btn" onClick={onClose}>I Understand</button>
      </div>
    </div>
  </div>
);

const LeftCards = () => (
  <div className="left-cards">
    <div className="float-card fc-1">
      <p className="fc-label">Active Tasks</p>
      <p className="fc-value">248 <span>this week</span></p>
    </div>
    <div className="float-card fc-2">
      <p className="fc-label">Team Status</p>
      <div style={{display:"flex",flexDirection:"column",gap:"5px",marginTop:"4px"}}>
        <div className="fc-row"><span className="fc-dot fc-dot-green"/><span className="fc-tag">Online now</span></div>
        <div className="fc-row"><span className="fc-dot fc-dot-purple"/><span className="fc-tag">In review</span></div>
        <div className="fc-row"><span className="fc-dot fc-dot-blue"/><span className="fc-tag">Scheduled</span></div>
      </div>
    </div>
    <div className="float-card fc-3">
      <p className="fc-label">Completion</p>
      <p className="fc-value">92% <span>on track</span></p>
    </div>
  </div>
);

/* ── Main Component ── */
export default function Auth() {
  const navigate = useNavigate();

  // screen: signin | signup | forgot-email | forgot-reset
  const [screen,    setScreen]    = useState("signin");
  const [busy,      setBusy]      = useState(false);
  const [gBusy,     setGBusy]     = useState(false);
  const [err,       setErr]       = useState("");
  const [toast,     setToast]     = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [showOtp,   setShowOtp]   = useState(false);
  const [otpPurpose, setOtpPurpose] = useState("register");
  const [pendingData, setPendingData] = useState(null);

  /* Sign in */
  const [siEmail,  setSiEmail]  = useState("");
  const [siPass,   setSiPass]   = useState("");
  const [showSiPw, setShowSiPw] = useState(false);
  const [siTouched, setSiTouched] = useState({});

  /* Sign up */
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [suEmail,   setSuEmail]   = useState("");
  const [suPass,    setSuPass]    = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [agreed,    setAgreed]    = useState(false);
  const [showSuPw,  setShowSuPw]  = useState(false);
  const [showConPw, setShowConPw] = useState(false);
  const [suTouched, setSuTouched] = useState({});

  /* Forgot */
  const [fpEmail,   setFpEmail]   = useState("");
  const [fpTouched, setFpTouched] = useState(false);
  const [newPass,   setNewPass]   = useState("");
  const [newConf,   setNewConf]   = useState("");
  const [showNpw,   setShowNpw]   = useState(false);
  const [showCpw,   setShowCpw]   = useState(false);
  const [fpPassTouched, setFpPassTouched] = useState({});

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const clear = () => setErr("");
  const go    = (s) => { setScreen(s); clear(); };

  /* ── Sign in ── */
  const signIn = async (e) => {
    e.preventDefault();
    setSiTouched({ email: true, pass: true });
    const eErr = validateEmail(siEmail);
    const pErr = validatePassword(siPass);
    if (eErr) { setErr(eErr); return; }
    if (pErr) { setErr(pErr); return; }
    clear(); setBusy(true);
    try {
      const { data } = await axios.post("/api/auth/login", {
        email: siEmail.trim(), password: siPass,
      });
      localStorage.setItem("dtms_token", data.token);
      localStorage.setItem("dtms_user",  JSON.stringify(data.user));
      setToast("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (ex) {
      setErr(ex.response?.data?.message || "Incorrect email or password.");
    } finally { setBusy(false); }
  };

  /* ── Sign up — step 1: validate, send OTP ── */
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setSuTouched({ first:true, email:true, pass:true, confirm:true });

    const nErr = validateName(firstName);
    const eErr = validateEmail(suEmail);
    const pErr = validatePassword(suPass);

    if (nErr) { setErr(nErr); return; }
    if (eErr) { setErr(eErr); return; }
    if (pErr) { setErr(pErr); return; }
    if (suPass !== suConfirm) { setErr("Passwords do not match."); return; }
    if (!agreed) { setErr("Please agree to the Terms & Conditions."); return; }

    clear();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const email    = suEmail.trim();
    // Show modal immediately — email sends in background
    setPendingData({ name: fullName, email, password: suPass });
    setOtpPurpose("register");
    setShowOtp(true);
    // Fire and forget — modal handles resend if it fails
    axios.post("/api/auth/send-otp", { email, purpose: "register" }).catch(ex => {
      if (ex.response?.status === 409) { setShowOtp(false); setErr("__duplicate__"); }
    });
  };

  /* ── Sign up — step 2: OTP verified, register ── */
  const handleRegisterOtpSuccess = async () => {
    setShowOtp(false); setBusy(true);
    try {
      const { data } = await axios.post("/api/auth/register", pendingData);
      localStorage.setItem("dtms_token", data.token);
      localStorage.setItem("dtms_user",  JSON.stringify(data.user));
      setToast("Account created successfully! Welcome to DTMS.");
      setTimeout(() => navigate("/dashboard"), 1400);
    } catch (ex) {
      setErr(ex.response?.data?.message || "Could not create account.");
    } finally { setBusy(false); }
  };

  /* ── Forgot — step 1: enter email, send OTP ── */
  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setFpTouched(true);
    const eErr = validateEmail(fpEmail);
    if (eErr) { setErr(eErr); return; }
    clear();
    const resetEmail = fpEmail.trim();
    // Show modal immediately
    setPendingData({ email: resetEmail });
    setOtpPurpose("reset");
    setShowOtp(true);
    // Send in background
    axios.post("/api/auth/send-otp", { email: resetEmail, purpose: "reset" }).catch(() => {});
  };

  /* ── Forgot — step 2: OTP verified → show reset form ── */
  const handleResetOtpSuccess = () => {
    setShowOtp(false);
    setScreen("forgot-reset");
    clear();
  };

  /* ── Forgot — step 3: set new password ── */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFpPassTouched({ pass:true, confirm:true });
    const pErr = validatePassword(newPass);
    if (pErr) { setErr(pErr); return; }
    if (newPass !== newConf) { setErr("Passwords do not match."); return; }
    clear(); setBusy(true);
    try {
      await axios.post("/api/auth/reset-password", {
        email: pendingData.email, newPassword: newPass,
      });
      setToast("Password reset successfully! Please sign in.");
      setTimeout(() => { go("signin"); setNewPass(""); setNewConf(""); setFpEmail(""); }, 1500);
    } catch (ex) {
      setErr(ex.response?.data?.message || "Reset failed. Please try again.");
    } finally { setBusy(false); }
  };

  /* ── Google ── */
  const googleAuth = async () => {
    clear(); setGBusy(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const { displayName, email, uid } = result.user;
      const { data } = await axios.post("/api/auth/google", {
        name: displayName || email.split("@")[0], email, uid,
      });
      localStorage.setItem("dtms_token", data.token);
      localStorage.setItem("dtms_user",  JSON.stringify(data.user));
      setToast("Signed in with Google successfully!");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (ex) {
      if (ex.code === "auth/popup-closed-by-user" ||
          ex.code === "auth/cancelled-popup-request") return;
      setErr(ex.response?.data?.message || ex.message || "Google sign-in failed.");
    } finally { setGBusy(false); }
  };

  /* Validation states */
  const firstNameErr = suTouched.first   ? validateName(firstName)    : "";
  const suEmailErr   = suTouched.email   ? validateEmail(suEmail)     : "";
  const suPassErr    = suTouched.pass    ? validatePassword(suPass)   : "";
  const fpEmailErr   = fpTouched         ? validateEmail(fpEmail)     : "";
  const newPassErr   = fpPassTouched.pass    ? validatePassword(newPass)  : "";
  const newConfMatch = newConf.length > 0 && newPass === newConf;
  const newConfNoMatch = newConf.length > 0 && newPass !== newConf;
  const pwMatch    = suConfirm.length > 0 && suPass === suConfirm;
  const pwNoMatch  = suConfirm.length > 0 && suPass !== suConfirm;

  const strength = getStrength(suPass);
  const canIn    = siEmail && siPass && !busy;
  const canUp    = firstName.trim() && !validateName(firstName) && suEmail && !validateEmail(suEmail) && suPass.length >= 8 && suPass === suConfirm && agreed && !busy;
  const canFp    = fpEmail && !validateEmail(fpEmail) && !busy;
  const canReset = newPass.length >= 8 && newPass === newConf && !busy;

  return (
    <>
      {toast && <div className="toast"><div className="toast-icon">✓</div>{toast}</div>}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showOtp && pendingData && (
        <OtpModal
          email={pendingData.email}
          purpose={otpPurpose}
          onClose={() => setShowOtp(false)}
          onSuccess={otpPurpose === "reset" ? handleResetOtpSuccess : handleRegisterOtpSuccess}
        />
      )}

      <div className="wrap">
        {/* LEFT */}
        <div className="left">
          <div className="left-gradient"/><div className="left-grid"/>
          <Particles/>
          <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>
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

        {/* RIGHT */}
        <div className="right">

          {/* ── Sign In ── */}
          {screen === "signin" && (
            <div className="in">
              <p className="r-title">Welcome back</p>
              <p className="r-sub">No account? <button onClick={() => go("signup")}>Create one free</button></p>
              {err && <div className="alert alert-err">{err}</div>}
              <form className="fields" onSubmit={signIn} noValidate>
                <div>
                  <label className="f-label">Email address</label>
                  <input type="email" placeholder="you@company.com" value={siEmail}
                    onChange={e => setSiEmail(e.target.value)}
                    onBlur={() => setSiTouched(p => ({...p,email:true}))}
                    className={`input${siTouched.email && validateEmail(siEmail) ? " bad" : ""}`}
                    disabled={busy} autoComplete="email" />
                  {siTouched.email && validateEmail(siEmail) && <p className="field-err">{validateEmail(siEmail)}</p>}
                </div>
                <div>
                  <label className="f-label">Password</label>
                  <div className="pw-wrap">
                    <input type={showSiPw ? "text" : "password"} placeholder="Your password" value={siPass}
                      onChange={e => setSiPass(e.target.value)}
                      onBlur={() => setSiTouched(p => ({...p,pass:true}))}
                      className="input" disabled={busy} autoComplete="current-password"/>
                    <button type="button" className="eye" onClick={() => setShowSiPw(p => !p)}><EyeIcon open={showSiPw}/></button>
                  </div>
                  <div className="forgot-row">
                    <button type="button" className="forgot-link" onClick={() => { go("forgot-email"); setFpEmail(""); setFpTouched(false); }}>
                      Forgot password?
                    </button>
                  </div>
                </div>
                <button className="btn-main" disabled={!canIn}>
                  {busy ? <><span className="spin"/> Signing in...</> : "Sign In →"}
                </button>
                <div className="or"><span>or</span></div>
                <button type="button" className="btn-google" onClick={googleAuth} disabled={gBusy}>
                  {gBusy ? <span className="spin-sm"/> : <GoogleIcon/>} Continue with Google
                </button>
              </form>
            </div>
          )}

          {/* ── Sign Up ── */}
          {screen === "signup" && (
            <div className="in">
              <p className="r-title">Create account</p>
              <p className="r-sub">Already registered? <button onClick={() => go("signin")}>Sign in</button></p>

              {err === "__duplicate__" ? (
                <div className="alert alert-dup">
                  <span>ⓘ</span>
                  <span>This email is already registered.{" "}
                    <button type="button" onClick={() => go("signin")} style={{background:"none",border:"none",color:"#a78bfa",fontFamily:"inherit",fontSize:"inherit",cursor:"pointer",fontWeight:600,padding:0,textDecoration:"underline",textUnderlineOffset:"2px"}}>
                      Sign in instead →
                    </button>
                  </span>
                </div>
              ) : err ? <div className="alert alert-err">{err}</div> : null}

              <form className="fields" onSubmit={handleSignUpSubmit} noValidate>
                <div className="two-col">
                  <div>
                    <label className="f-label">First name</label>
                    <input type="text" placeholder="John" value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      onBlur={() => setSuTouched(p => ({...p,first:true}))}
                      className={`input${firstNameErr ? " bad" : ""}`}
                      disabled={busy} autoComplete="given-name"/>
                    {firstNameErr && <p className="field-err">{firstNameErr}</p>}
                  </div>
                  <div>
                    <label className="f-label">Last name</label>
                    <input type="text" placeholder="Doe" value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      className="input" disabled={busy} autoComplete="family-name"/>
                  </div>
                </div>

                <div>
                  <label className="f-label">Email address</label>
                  <input type="email" placeholder="you@company.com" value={suEmail}
                    onChange={e => setSuEmail(e.target.value)}
                    onBlur={() => setSuTouched(p => ({...p,email:true}))}
                    className={`input${suEmailErr ? " bad" : ""}`}
                    disabled={busy} autoComplete="email"/>
                  {suEmailErr && <p className="field-err">{suEmailErr}</p>}
                </div>

                <div>
                  <label className="f-label">Password</label>
                  <div className="pw-wrap">
                    <input type={showSuPw ? "text" : "password"} placeholder="Min. 8 characters" value={suPass}
                      onChange={e => setSuPass(e.target.value)}
                      onBlur={() => setSuTouched(p => ({...p,pass:true}))}
                      className={`input${suPassErr ? " bad" : ""}`}
                      disabled={busy} autoComplete="new-password"/>
                    <button type="button" className="eye" onClick={() => setShowSuPw(p => !p)}><EyeIcon open={showSuPw}/></button>
                  </div>
                  {suPass && (
                    <div className="pw-strength">
                      {[1,2,3].map(i => (
                        <div key={i} className={`pw-bar ${strength.level==="weak"&&i===1?"weak":strength.level==="medium"&&i<=2?"medium":strength.level==="strong"?"strong":""}`}/>
                      ))}
                      <span className={`pw-label ${strength.level}`}>{strength.label}</span>
                    </div>
                  )}
                  {suPassErr && <p className="field-err">{suPassErr}</p>}
                </div>

                <div>
                  <label className="f-label">Confirm password</label>
                  <div className="pw-wrap">
                    <input type={showConPw ? "text" : "password"} placeholder="Repeat your password" value={suConfirm}
                      onChange={e => setSuConfirm(e.target.value)}
                      className={`input${pwNoMatch?" bad":""}${pwMatch?" good":""}`}
                      disabled={busy} autoComplete="new-password"/>
                    <button type="button" className="eye" onClick={() => setShowConPw(p => !p)}><EyeIcon open={showConPw}/></button>
                  </div>
                  {pwMatch   && <p className="match-hint ok">✓ Passwords match</p>}
                  {pwNoMatch && <p className="match-hint no">✕ Passwords do not match</p>}
                </div>

                <div className="check-row" onClick={() => setAgreed(p => !p)}>
                  <div className={`check-box${agreed?" on":""}`}><CheckIcon/></div>
                  <span className="check-label">
                    I agree to the{" "}
                    <button type="button" onClick={e => { e.stopPropagation(); setShowTerms(true); }}>
                      Terms &amp; Conditions
                    </button>
                  </span>
                </div>

                <button className="btn-main" disabled={!canUp}>
                  {busy ? <><span className="spin"/> Sending OTP...</> : "Create Account →"}
                </button>
                <div className="or"><span>or</span></div>
                <button type="button" className="btn-google" onClick={googleAuth} disabled={gBusy}>
                  {gBusy ? <span className="spin-sm"/> : <GoogleIcon/>} Continue with Google
                </button>
              </form>
            </div>
          )}

          {/* ── Forgot — Step 1: Enter Email ── */}
          {screen === "forgot-email" && (
            <div className="in">
              <p className="fp-title">Forgot Password?</p>
              <p className="fp-desc">
                Enter your registered email address. We'll send you a verification code to reset your password.
              </p>
              {err && <div className="alert alert-err">{err}</div>}
              <form className="fields" onSubmit={handleForgotSendOtp} noValidate>
                <div>
                  <label className="f-label">Email address</label>
                  <input type="email" placeholder="you@company.com" value={fpEmail}
                    onChange={e => setFpEmail(e.target.value)}
                    onBlur={() => setFpTouched(true)}
                    className={`input${fpEmailErr ? " bad" : ""}`}
                    disabled={busy} autoComplete="email"/>
                  {fpEmailErr && <p className="field-err">{fpEmailErr}</p>}
                </div>
                <button className="btn-main" disabled={!canFp}>
                  {busy ? <><span className="spin"/> Sending OTP...</> : "Send Verification Code →"}
                </button>
              </form>
              <button className="back-btn" onClick={() => go("signin")}>← Back to sign in</button>
            </div>
          )}

          {/* ── Forgot — Step 2: New Password (after OTP verified) ── */}
          {screen === "forgot-reset" && (
            <div className="in">
              <p className="fp-title">Set New Password</p>
              <p className="fp-desc">
                Create a new password for <strong style={{color:"#a78bfa"}}>{pendingData?.email}</strong>
              </p>
              {err && <div className="alert alert-err">{err}</div>}
              <form className="fields" onSubmit={handleResetPassword} noValidate>
                <div>
                  <label className="f-label">New password</label>
                  <div className="pw-wrap">
                    <input type={showNpw ? "text" : "password"} placeholder="Min. 8 characters" value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      onBlur={() => setFpPassTouched(p => ({...p,pass:true}))}
                      className={`input${newPassErr ? " bad" : ""}`}
                      disabled={busy}/>
                    <button type="button" className="eye" onClick={() => setShowNpw(p => !p)}><EyeIcon open={showNpw}/></button>
                  </div>
                  {newPass && (
                    <div className="pw-strength">
                      {[1,2,3].map(i => {
                        const st = getStrength(newPass);
                        return <div key={i} className={`pw-bar ${st.level==="weak"&&i===1?"weak":st.level==="medium"&&i<=2?"medium":st.level==="strong"?"strong":""}`}/>;
                      })}
                      <span className={`pw-label ${getStrength(newPass).level}`}>{getStrength(newPass).label}</span>
                    </div>
                  )}
                  {newPassErr && <p className="field-err">{newPassErr}</p>}
                </div>
                <div>
                  <label className="f-label">Confirm new password</label>
                  <div className="pw-wrap">
                    <input type={showCpw ? "text" : "password"} placeholder="Repeat new password" value={newConf}
                      onChange={e => setNewConf(e.target.value)}
                      className={`input${newConfNoMatch?" bad":""}${newConfMatch?" good":""}`}
                      disabled={busy}/>
                    <button type="button" className="eye" onClick={() => setShowCpw(p => !p)}><EyeIcon open={showCpw}/></button>
                  </div>
                  {newConfMatch   && <p className="match-hint ok">✓ Passwords match</p>}
                  {newConfNoMatch && <p className="match-hint no">✕ Passwords do not match</p>}
                </div>
                <button className="btn-main" disabled={!canReset}>
                  {busy ? <><span className="spin"/> Resetting...</> : "Reset Password →"}
                </button>
              </form>
              <button className="back-btn" onClick={() => go("signin")}>← Back to sign in</button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}