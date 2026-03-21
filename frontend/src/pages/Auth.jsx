import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const injectStyles = () => {
  if (document.getElementById("auth-css")) return;
  const s = document.createElement("style");
  s.id = "auth-css";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Inter:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: #1e1c2e;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      -webkit-font-smoothing: antialiased;
    }

    .wrap {
      display: grid;
      grid-template-columns: 1fr 480px;
      width: 100%;
      max-width: 1120px;
      min-height: 700px;
      background: #28263c;
      border-radius: 22px;
      overflow: hidden;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.06), 0 48px 120px rgba(0,0,0,0.5);
      animation: rise 0.55s cubic-bezier(0.22,1,0.36,1) both;
    }

    @keyframes rise {
      from { opacity:0; transform:translateY(24px); }
      to   { opacity:1; transform:translateY(0); }
    }

    /* ═══════════════════════════════
       LEFT ANIMATED PANEL
    ═══════════════════════════════ */
    .left {
      position: relative;
      overflow: hidden;
      padding: 2.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #0f0d1a;
    }

    /* Animated gradient background — shifts colour slowly */
    .left-gradient {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.4), transparent 55%),
        radial-gradient(ellipse at 80% 70%, rgba(99,102,241,0.3), transparent 50%),
        radial-gradient(ellipse at 55% 45%, rgba(168,85,247,0.2), transparent 45%),
        linear-gradient(145deg, #0f0d1a 0%, #1a1530 60%, #0d0b18 100%);
      animation: gradShift 8s ease-in-out infinite alternate;
    }

    @keyframes gradShift {
      0%   { filter: hue-rotate(0deg) brightness(1); }
      50%  { filter: hue-rotate(20deg) brightness(1.1); }
      100% { filter: hue-rotate(-15deg) brightness(0.95); }
    }

    /* Floating orbs */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      pointer-events: none;
      animation: float linear infinite;
    }

    .orb-1 {
      width: 280px; height: 280px;
      background: rgba(139,92,246,0.25);
      top: -60px; left: -60px;
      animation-duration: 12s;
      animation-name: floatA;
    }

    .orb-2 {
      width: 220px; height: 220px;
      background: rgba(99,102,241,0.2);
      bottom: 60px; right: -40px;
      animation-duration: 15s;
      animation-name: floatB;
    }

    .orb-3 {
      width: 160px; height: 160px;
      background: rgba(236,72,153,0.15);
      top: 45%; left: 30%;
      animation-duration: 18s;
      animation-name: floatC;
    }

    @keyframes floatA {
      0%   { transform: translate(0,0) scale(1); }
      33%  { transform: translate(60px,80px) scale(1.1); }
      66%  { transform: translate(30px,140px) scale(0.95); }
      100% { transform: translate(0,0) scale(1); }
    }

    @keyframes floatB {
      0%   { transform: translate(0,0) scale(1); }
      33%  { transform: translate(-50px,-60px) scale(1.15); }
      66%  { transform: translate(-20px,-110px) scale(0.9); }
      100% { transform: translate(0,0) scale(1); }
    }

    @keyframes floatC {
      0%   { transform: translate(0,0) scale(1) rotate(0deg); }
      50%  { transform: translate(40px,-50px) scale(1.2) rotate(180deg); }
      100% { transform: translate(0,0) scale(1) rotate(360deg); }
    }

    /* Subtle grid on top */
    .left-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }

    /* Floating particles using CSS */
    .particles {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .particle {
      position: absolute;
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: rgba(167,139,250,0.6);
      animation: particleFloat linear infinite;
    }

    @keyframes particleFloat {
      0%   { transform: translateY(100vh) scale(0); opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { transform: translateY(-100px) scale(1); opacity: 0; }
    }

    /* All z-indexed content sits above the bg */
    .left-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }

    /* Logo */
    .l-logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .l-logo-box {
      width: 36px; height: 36px;
      background: rgba(139,92,246,0.25);
      border: 1px solid rgba(167,139,250,0.3);
      border-radius: 10px;
      display: grid;
      place-items: center;
      backdrop-filter: blur(10px);
    }

    .l-logo-box span {
      font-size: 0.62rem;
      font-weight: 700;
      color: #c4b5fd;
      letter-spacing: 0.06em;
    }

    .l-logo-name {
      font-size: 0.72rem;
      font-weight: 600;
      color: rgba(255,255,255,0.45);
      letter-spacing: 0.04em;
      line-height: 1.3;
    }

    /* Main headline area */
    .l-main { flex: 1; display: flex; flex-direction: column; justify-content: center; }

    .l-tag {
      font-size: 0.62rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #a78bfa;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .l-tag::before {
      content: '';
      width: 20px; height: 1px;
      background: #a78bfa;
      opacity: 0.6;
    }

    .l-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.9rem;
      font-weight: 700;
      color: #f0eeff;
      line-height: 1.1;
      letter-spacing: -0.01em;
      margin-bottom: 1rem;
      animation: textReveal 1s ease both;
    }

    @keyframes textReveal {
      from { opacity:0; transform: translateY(16px); }
      to   { opacity:1; transform: translateY(0); }
    }

    .l-title em {
      font-style: italic;
      font-weight: 600;
      color: #c4b5fd;
    }

    .l-desc {
      font-size: 0.83rem;
      font-weight: 300;
      color: rgba(255,255,255,0.4);
      line-height: 1.8;
      max-width: 340px;
      margin-bottom: 2rem;
    }

    /* Animated stat bars / work lines */
    .work-lines {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .work-line {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .work-line-label {
      font-size: 0.68rem;
      color: rgba(255,255,255,0.35);
      width: 90px;
      flex-shrink: 0;
      letter-spacing: 0.02em;
    }

    .work-line-bar {
      flex: 1;
      height: 4px;
      background: rgba(255,255,255,0.06);
      border-radius: 2px;
      overflow: hidden;
    }

    .work-line-fill {
      height: 100%;
      border-radius: 2px;
      animation: fillBar 1.8s cubic-bezier(0.4,0,0.2,1) both;
    }

    @keyframes fillBar {
      from { width: 0%; }
    }

    .work-line-pct {
      font-size: 0.65rem;
      font-family: 'Inter', monospace;
      color: rgba(255,255,255,0.3);
      width: 30px;
      text-align: right;
    }

    /* Bottom section */
    .l-bottom { }

    .l-profiles {
      display: flex;
      align-items: center;
      gap: 0;
      margin-bottom: 0.6rem;
    }

    .l-avatar {
      width: 28px; height: 28px;
      border-radius: 50%;
      border: 2px solid #28263c;
      margin-left: -7px;
      font-size: 0.6rem;
      font-weight: 600;
      display: grid;
      place-items: center;
      color: #fff;
      flex-shrink: 0;
    }

    .l-avatar:first-child { margin-left: 0; }

    .l-more {
      background: rgba(139,92,246,0.25);
      border-color: rgba(167,139,250,0.2) !important;
      font-size: 0.55rem;
      color: #c4b5fd;
    }

    .l-people-text {
      font-size: 0.73rem;
      color: rgba(255,255,255,0.35);
      line-height: 1.5;
    }

    .l-people-text strong {
      color: rgba(255,255,255,0.65);
      font-weight: 500;
    }

    /* ═══════════════════════════════
       RIGHT FORM PANEL
    ═══════════════════════════════ */
    .right {
      background: #28263c;
      display: flex;
      flex-direction: column;
      padding: 2.5rem 2.75rem;
      border-left: 1px solid rgba(255,255,255,0.05);
    }

    /* Page title */
    .r-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.4rem;
      font-weight: 700;
      color: #f0eeff;
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }

    .r-sub {
      font-size: 0.8rem;
      color: #6b6789;
      margin-bottom: 1.75rem;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .r-sub button {
      background: none; border: none;
      font-family: inherit; font-size: inherit;
      color: #a78bfa; cursor: pointer; padding: 0;
      font-weight: 500;
      transition: color 150ms ease;
    }

    .r-sub button:hover { color: #c4b5fd; }

    /* Alert */
    .alert {
      border-radius: 10px;
      padding: 0.65rem 0.9rem;
      font-size: 0.78rem;
      margin-bottom: 1rem;
      display: flex; gap: 8px;
      animation: drop .2s ease both;
    }

    @keyframes drop {
      from { opacity:0; transform:translateY(-4px); }
      to   { opacity:1; transform:translateY(0); }
    }

    .alert-err { background: rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.2); color:#fca5a5; }
    .alert-ok  { background: rgba(52,211,153,.1); border:1px solid rgba(52,211,153,.2); color:#6ee7b7; }

    /* Fields */
    .fields { display:flex; flex-direction:column; gap:.85rem; }

    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:.85rem; }

    .input {
      background: rgba(255,255,255,0.05);
      border: 1.5px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      padding: .82rem 1rem;
      color: #f0eeff;
      font-family: 'Inter', sans-serif;
      font-size: .87rem;
      font-weight: 400;
      outline: none; width: 100%;
      transition: border-color 200ms ease, background 200ms ease, box-shadow 200ms ease;
    }

    .input::placeholder { color: #3d3a58; }

    .input:focus {
      border-color: rgba(167,139,250,.45);
      background: rgba(255,255,255,.08);
      box-shadow: 0 0 0 3px rgba(167,139,250,.08);
    }

    .input:disabled { opacity:.4; cursor:not-allowed; }
    .input.bad { border-color: rgba(239,68,68,.4); }

    .pw-wrap { position:relative; }
    .pw-wrap .input { padding-right:2.75rem; }

    .eye {
      position:absolute; right:12px; top:50%; transform:translateY(-50%);
      background:none; border:none; cursor:pointer; color:#3d3a58; padding:0;
      display:flex; transition:color 150ms ease;
    }
    .eye:hover { color:#a78bfa; }

    .field-err { font-size:.7rem; color:#fca5a5; margin-top:4px; }

    /* forgot link */
    .forgot-row {
      display:flex; justify-content:flex-end; margin-top:-2px;
    }
    .forgot-link {
      background:none; border:none;
      font-family:inherit; font-size:.73rem;
      color:#524e6b; cursor:pointer; padding:0;
      transition:color 150ms ease;
    }
    .forgot-link:hover { color:#a78bfa; }

    /* Checkbox */
    .check-row {
      display:flex; align-items:center; gap:10px; cursor:pointer;
    }

    .check-box {
      width:20px; height:20px; border-radius:6px;
      border:2px solid rgba(255,255,255,.12);
      background:rgba(255,255,255,.05);
      display:grid; place-items:center; flex-shrink:0;
      transition:all 180ms ease;
    }
    .check-box.on { background:#7c3aed; border-color:#7c3aed; }
    .check-box svg { display:none; }
    .check-box.on svg { display:block; }

    .check-label { font-size:.77rem; color:#6b6789; }
    .check-label a { color:#a78bfa; text-decoration:none; }
    .check-label a:hover { color:#c4b5fd; }

    /* Purple button */
    .btn-main {
      width:100%; padding:.85rem;
      background:#7c3aed; border:none; border-radius:12px;
      color:#fff; font-family:'Inter',sans-serif;
      font-size:.88rem; font-weight:600;
      cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;
      transition:all 180ms ease;
    }
    .btn-main:hover:not(:disabled) {
      background:#6d28d9; transform:translateY(-1px);
      box-shadow:0 8px 28px rgba(124,58,237,.35);
    }
    .btn-main:active:not(:disabled) { transform:none; box-shadow:none; }
    .btn-main:disabled { opacity:.35; cursor:not-allowed; }

    /* Or line */
    .or {
      display:flex; align-items:center; gap:10px;
    }
    .or::before,.or::after {
      content:''; flex:1; height:1px; background:rgba(255,255,255,.06);
    }
    .or span { font-size:.7rem; color:#3d3a58; letter-spacing:.05em; }

    /* Social buttons */
    .socials { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }

    .btn-social {
      display:flex; align-items:center; justify-content:center; gap:8px;
      padding:.74rem 1rem;
      background:rgba(255,255,255,.05);
      border:1.5px solid rgba(255,255,255,.08);
      border-radius:12px;
      color:#c4b5fd; font-family:'Inter',sans-serif;
      font-size:.83rem; font-weight:500;
      cursor:pointer; transition:all 180ms ease;
    }
    .btn-social:hover {
      background:rgba(255,255,255,.09);
      border-color:rgba(167,139,250,.25);
    }

    /* Spinner */
    .spin {
      width:13px; height:13px;
      border:2px solid rgba(255,255,255,.2);
      border-top-color:#fff; border-radius:50%;
      animation:ro .65s linear infinite;
    }
    @keyframes ro { to { transform:rotate(360deg); } }

    /* Forgot screen */
    .fp-title { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:700; color:#f0eeff; margin-bottom:.35rem; }
    .fp-desc  { font-size:.82rem; color:#6b6789; line-height:1.7; margin-bottom:1.5rem; }

    .back-btn {
      background:none; border:none; font-family:'Inter',sans-serif;
      font-size:.79rem; color:#524e6b; cursor:pointer;
      margin-top:10px; display:flex; align-items:center; gap:5px;
      padding:0; transition:color 150ms ease;
    }
    .back-btn:hover { color:#a78bfa; }

    /* Terms */
    .terms { margin-top:12px; text-align:center; font-size:.69rem; color:#3d3a58; line-height:1.6; }
    .terms a { color:#524e6b; text-decoration:none; }
    .terms a:hover { color:#a78bfa; }

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

/* ── Icons ─────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.013 17.64 11.705 17.64 9.2z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 814 1000" fill="currentColor">
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-43.4-150.3-109.7C73.8 736.6 40 662.1 40 589.9c0-193.3 128.4-295.5 254.7-295.5 33.2 0 91.5 11.3 138.6 43.2zm-190.5-175.2c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="2,6 5,9 10,3"/>
  </svg>
);

/* Animated particles */
const Particles = () => {
  const positions = [
    { left:"12%", delay:"0s",   duration:"14s" },
    { left:"28%", delay:"3s",   duration:"11s" },
    { left:"44%", delay:"1.5s", duration:"16s" },
    { left:"60%", delay:"5s",   duration:"12s" },
    { left:"75%", delay:"2s",   duration:"18s" },
    { left:"88%", delay:"7s",   duration:"13s" },
    { left:"20%", delay:"9s",   duration:"15s" },
    { left:"52%", delay:"4s",   duration:"10s" },
  ];

  return (
    <div className="particles">
      {positions.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: p.left,
            bottom: "-10px",
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

/* Work progress lines */
const workData = [
  { label: "Tasks done",   pct: 87, color: "#a78bfa" },
  { label: "On schedule",  pct: 72, color: "#818cf8" },
  { label: "Team output",  pct: 94, color: "#c4b5fd" },
  { label: "Goals met",    pct: 68, color: "#7c3aed" },
];

const avatarColors = ["#7c3aed","#4f46e5","#0891b2","#059669","#d97706"];
const avatarLetters = ["A","R","S","K","J"];

/* ── Main Component ─────────────────────────────────────── */
export default function Auth() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState("signup"); // signup | signin | forgot
  const [busy,   setBusy]   = useState(false);
  const [err,    setErr]    = useState("");
  const [note,   setNote]   = useState("");

  // sign in
  const [siEmail,  setSiEmail]  = useState("");
  const [siPass,   setSiPass]   = useState("");
  const [showSiPw, setShowSiPw] = useState(false);

  // sign up
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [suEmail,   setSuEmail]   = useState("");
  const [suPass,    setSuPass]    = useState("");
  const [agreed,    setAgreed]    = useState(false);
  const [showSuPw,  setShowSuPw]  = useState(false);
  const [touched,   setTouched]   = useState({});

  // forgot
  const [fpEmail, setFpEmail] = useState("");

  useEffect(() => { injectStyles(); }, []);

  const clear = () => { setErr(""); setNote(""); };
  const go    = (s) => { setScreen(s); clear(); };

  const signIn = async (e) => {
    e.preventDefault(); clear(); setBusy(true);
    try {
      const { data } = await axios.post("/api/auth/login", {
        email: siEmail.trim(), password: siPass,
      });
      localStorage.setItem("dtms_token", data.token);
      localStorage.setItem("dtms_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (ex) {
      setErr(ex.response?.data?.message || "Incorrect email or password.");
    } finally { setBusy(false); }
  };

  const signUp = async (e) => {
    e.preventDefault();
    if (!agreed) { setErr("Please agree to the Terms & Conditions to continue."); return; }
    clear(); setBusy(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const { data } = await axios.post("/api/auth/register", {
        name: fullName, email: suEmail.trim(), password: suPass,
      });
      localStorage.setItem("dtms_token", data.token);
      localStorage.setItem("dtms_user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (ex) {
      setErr(ex.response?.data?.message || "Could not create account. Try again.");
    } finally { setBusy(false); }
  };

  const forgot = async (e) => {
    e.preventDefault(); clear(); setBusy(true);
    await new Promise(r => setTimeout(r, 1100));
    setBusy(false);
    setNote("Reset link sent — check your inbox.");
  };

  /*
    Google & Apple OAuth — to make these work for real:
    1. Go to console.firebase.google.com
    2. Create project → Authentication → Sign-in methods
    3. Enable Google and Apple
    4. Add your Firebase config below
    5. Replace the alert with: signInWithPopup(auth, new GoogleAuthProvider())
  */
  const googleAuth = () => {
    // TODO: replace with Firebase signInWithPopup
    alert(
      "To enable Google login:\n\n" +
      "1. Create a project at console.firebase.google.com\n" +
      "2. Enable Google auth under Authentication\n" +
      "3. Add your Firebase config to this file\n\n" +
      "For now use email & password."
    );
  };

  const appleAuth = () => {
    alert(
      "To enable Apple login:\n\n" +
      "1. You need an Apple Developer account ($99/yr)\n" +
      "2. Enable Sign in with Apple in Firebase Authentication\n" +
      "3. Configure your App ID at developer.apple.com\n\n" +
      "For now use email & password."
    );
  };

  const firstErr = touched.first  && !firstName.trim();
  const passErr  = touched.suPass && suPass.length > 0 && suPass.length < 8;
  const canIn    = siEmail && siPass && !busy;
  const canUp    = firstName.trim() && suEmail && suPass.length >= 8 && !busy;

  return (
    <div className="wrap">

      {/* ════ LEFT ANIMATED PANEL ════ */}
      <div className="left">
        <div className="left-gradient" />
        <div className="left-grid" />
        <Particles />

        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="left-content">

          {/* Logo */}
          <div className="l-logo">
            <div className="l-logo-box"><span>DT</span></div>
            <span className="l-logo-name">Digital Talent<br/>Management System</span>
          </div>

          {/* Main text */}
          <div className="l-main">
            <p className="l-tag">Workforce Platform</p>

            <h1 className="l-title">
              See every<br />
              person's <em>hard work</em><br />
              in real time.
            </h1>

            <p className="l-desc">
              Track tasks, monitor progress, and celebrate achievements.
              Every contribution is visible — no effort goes unnoticed.
            </p>

            {/* Animated progress bars */}
            <div className="work-lines">
              {workData.map((w, i) => (
                <div className="work-line" key={w.label}>
                  <span className="work-line-label">{w.label}</span>
                  <div className="work-line-bar">
                    <div
                      className="work-line-fill"
                      style={{
                        width: `${w.pct}%`,
                        background: w.color,
                        animationDelay: `${i * 0.2 + 0.5}s`,
                      }}
                    />
                  </div>
                  <span className="work-line-pct">{w.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom — team avatars */}
          <div className="l-bottom">
            <div className="l-profiles">
              {avatarLetters.map((l, i) => (
                <div
                  key={i}
                  className="l-avatar"
                  style={{ background: avatarColors[i] }}
                >
                  {l}
                </div>
              ))}
              <div className="l-avatar l-more">+12</div>
            </div>
            <p className="l-people-text">
              <strong>240+ team members</strong> already tracking<br />
              their work and hitting goals daily.
            </p>
          </div>

        </div>
      </div>

      {/* ════ RIGHT FORM PANEL ════ */}
      <div className="right">

        {/* ── Forgot Password ── */}
        {screen === "forgot" && (
          <div className="in">
            <p className="fp-title">Reset Password</p>
            <p className="fp-desc">
              Enter the email linked to your account — we'll send you a reset link right away.
            </p>

            {note && <div className="alert alert-ok">{note}</div>}
            {err  && <div className="alert alert-err">{err}</div>}

            {!note && (
              <form className="fields" onSubmit={forgot} noValidate>
                <input
                  type="email"
                  placeholder="Your email address"
                  value={fpEmail}
                  onChange={e => setFpEmail(e.target.value)}
                  className="input"
                  disabled={busy}
                />
                <button className="btn-main" disabled={!fpEmail || busy}>
                  {busy ? <><span className="spin" /> Sending...</> : "Send Reset Link"}
                </button>
              </form>
            )}

            <button className="back-btn" onClick={() => go("signin")}>
              ← Back to sign in
            </button>
          </div>
        )}

        {/* ── Sign In ── */}
        {screen === "signin" && (
          <div className="in">
            <p className="r-title">Welcome Back</p>
            <p className="r-sub">
              No account?&nbsp;
              <button onClick={() => go("signup")}>Create one free</button>
            </p>

            {err && <div className="alert alert-err">{err}</div>}

            <form className="fields" onSubmit={signIn} noValidate>
              <input
                type="email"
                placeholder="Email"
                value={siEmail}
                onChange={e => setSiEmail(e.target.value)}
                className="input"
                disabled={busy}
                autoComplete="email"
              />

              <div>
                <div className="pw-wrap">
                  <input
                    type={showSiPw ? "text" : "password"}
                    placeholder="Password"
                    value={siPass}
                    onChange={e => setSiPass(e.target.value)}
                    className="input"
                    disabled={busy}
                    autoComplete="current-password"
                  />
                  <button type="button" className="eye" onClick={() => setShowSiPw(p => !p)}>
                    <EyeIcon open={showSiPw} />
                  </button>
                </div>
                <div className="forgot-row">
                  <button type="button" className="forgot-link" onClick={() => go("forgot")}>
                    Forgot password?
                  </button>
                </div>
              </div>

              <button className="btn-main" disabled={!canIn}>
                {busy ? <><span className="spin" /> Signing in...</> : "Sign In"}
              </button>

              <div className="or"><span>or continue with</span></div>

              <div className="socials">
                <button type="button" className="btn-social" onClick={googleAuth}>
                  <GoogleIcon /> Google
                </button>
                <button type="button" className="btn-social" onClick={appleAuth}>
                  <AppleIcon /> Apple
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Sign Up ── */}
        {screen === "signup" && (
          <div className="in">
            <p className="r-title">Create account</p>
            <p className="r-sub">
              Already registered?&nbsp;
              <button onClick={() => go("signin")}>Sign in</button>
            </p>

            {err && <div className="alert alert-err">{err}</div>}

            <form className="fields" onSubmit={signUp} noValidate>
              <div className="two-col">
                <div>
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    onBlur={() => setTouched(p => ({ ...p, first: true }))}
                    className={`input${firstErr ? " bad" : ""}`}
                    disabled={busy}
                    autoComplete="given-name"
                  />
                  {firstErr && <p className="field-err">Required.</p>}
                </div>
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="input"
                  disabled={busy}
                  autoComplete="family-name"
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                value={suEmail}
                onChange={e => setSuEmail(e.target.value)}
                className="input"
                disabled={busy}
                autoComplete="email"
              />

              <div>
                <div className="pw-wrap">
                  <input
                    type={showSuPw ? "text" : "password"}
                    placeholder="Password — min. 8 characters"
                    value={suPass}
                    onChange={e => setSuPass(e.target.value)}
                    onBlur={() => setTouched(p => ({ ...p, suPass: true }))}
                    className={`input${passErr ? " bad" : ""}`}
                    disabled={busy}
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye" onClick={() => setShowSuPw(p => !p)}>
                    <EyeIcon open={showSuPw} />
                  </button>
                </div>
                {passErr && <p className="field-err">Too short — 8 characters minimum.</p>}
              </div>

              <div className="check-row" onClick={() => setAgreed(p => !p)}>
                <div className={`check-box${agreed ? " on" : ""}`}>
                  <CheckIcon />
                </div>
                <span className="check-label">
                  I agree to the{" "}
                  <a href="#" onClick={e => e.stopPropagation()}>Terms &amp; Conditions</a>
                </span>
              </div>

              <button className="btn-main" disabled={!canUp}>
                {busy ? <><span className="spin" /> Creating account...</> : "Create account"}
              </button>

              <div className="or"><span>or continue with</span></div>

              <div className="socials">
                <button type="button" className="btn-social" onClick={googleAuth}>
                  <GoogleIcon /> Google
                </button>
                <button type="button" className="btn-social" onClick={appleAuth}>
                  <AppleIcon /> Apple
                </button>
              </div>
            </form>

            <p className="terms">
              By registering you agree to our{" "}
              <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
