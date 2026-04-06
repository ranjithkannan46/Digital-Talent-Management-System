import { useState, useRef, useEffect } from "react";
import axios from "../api/axios";
import "../styles/profile.css";

const fixRole = r => (!r || r === "player" || r === "Player") ? "user" : r;

const EyeIcon = ({ open }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8" /><circle cx="12" cy="12" r="3" /></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
    }
  </svg>
);

const flash = (setter, type, msg) => {
  setter({ type, msg });
  setTimeout(() => setter({ type: "", msg: "" }), 3500);
};

export default function Profile() {
  const fileRef = useRef(null);
  const [stored, setStored] = useState(() => {
    try { return JSON.parse(localStorage.getItem("dtms_user")); } catch { return null; }
  });
  const [photo, setPhoto]   = useState(localStorage.getItem("dtms_photo") || "");
  const [tasks, setTasks]   = useState([]);

  const role    = fixRole(stored?.role);
  const initial = stored?.name?.charAt(0)?.toUpperCase() || "U";
  const joined  = stored?.createdAt
    ? new Date(stored.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const empId   = `EMP-${stored?.id?.slice(-6).toUpperCase()}`;

  // ── Profile form ──
  const [pForm,  setPForm]  = useState({ name: stored?.name || "", email: stored?.email || "" });
  const [pBusy,  setPBusy]  = useState(false);
  const [pAlert, setPAlert] = useState({ type: "", msg: "" });

  // ── Password form — always start empty ──
  const [pw,      setPw]      = useState({ cur: "", nw: "", con: "" });
  const [pwBusy,  setPwBusy]  = useState(false);
  const [pwAlert, setPwAlert] = useState({ type: "", msg: "" });
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);

  useEffect(() => {
    axios.get("/tasks").then(r => setTasks(r.data.tasks)).catch(() => {});
  }, []);

  const taskStats = {
    total:     tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    pending:   tasks.filter(t => t.status !== "completed").length,
  };

  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Max 2MB"); return; }
    const r = new FileReader();
    r.onload = ev => { localStorage.setItem("dtms_photo", ev.target.result); setPhoto(ev.target.result); };
    r.readAsDataURL(file);
  };

  const saveProfile = async e => {
    e.preventDefault();
    if (!pForm.name.trim()) { flash(setPAlert, "err", "Name is required."); return; }
    if (!pForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pForm.email)) {
      flash(setPAlert, "err", "Enter a valid email address.");
      return;
    }
    setPBusy(true);
    try {
      const { data } = await axios.put("/auth/profile", { name: pForm.name.trim(), email: pForm.email.trim() });
      const updated  = { ...stored, name: data.user.name, email: data.user.email };
      localStorage.setItem("dtms_user", JSON.stringify(updated));
      setStored(updated);
      flash(setPAlert, "ok", "Profile updated successfully.");
    } catch (ex) {
      flash(setPAlert, "err", ex.response?.data?.message || "Update failed.");
    } finally {
      setPBusy(false);
    }
  };

  const changePassword = async e => {
    e.preventDefault();
    if (!pw.cur)           { flash(setPwAlert, "err", "Current password is required."); return; }
    if (!pw.nw)            { flash(setPwAlert, "err", "New password is required.");     return; }
    if (pw.nw.length < 8)  { flash(setPwAlert, "err", "Minimum 8 characters.");          return; }
    if (pw.nw !== pw.con)  { flash(setPwAlert, "err", "Passwords do not match.");        return; }
    if (pw.cur === pw.nw)  { flash(setPwAlert, "err", "New password must be different."); return; }
    setPwBusy(true);
    try {
      await axios.put("/auth/password", { currentPassword: pw.cur, newPassword: pw.nw });
      setPw({ cur: "", nw: "", con: "" });
      setShowCur(false); setShowNew(false); setShowCon(false);
      flash(setPwAlert, "ok", "Password changed successfully.");
    } catch (ex) {
      flash(setPwAlert, "err", ex.response?.data?.message || "Incorrect current password.");
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <div className="profile-page">
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />

      {/* Hero */}
      <div className="p-hero">
        <div className="p-hero-bg" />
        <div className="p-hero-ov" />
        <div className="p-hero-body">
          <div className="p-av-wrap">
            <div className="p-av" onClick={() => fileRef.current?.click()}>
              {photo ? <img src={photo} alt="profile" /> : initial}
            </div>
            <div className="p-av-badge" title="Upload photo" onClick={() => fileRef.current?.click()}>📷</div>
          </div>
          <div>
            <div className="p-hero-name">{stored?.name}</div>
            <div className="p-hero-email">{stored?.email}</div>
            <div className={`p-role-tag p-role-${role}`}>{role}</div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="p-layout">

        {/* Left: account info + task stats */}
        <div className="p-left-col">

          <div className="p-card">
            <div className="p-card-head">
              <span className="p-card-icon">🪪</span>
              <div>
                <div className="p-card-title">Account Info</div>
                <div className="p-card-sub">Read-only system data</div>
              </div>
            </div>
            <div className="p-info-row"><span className="p-info-key">Employee ID</span><span className="p-info-val">{empId}</span></div>
            <div className="p-info-row">
              <span className="p-info-key">Role</span>
              <span className={`p-info-role p-info-role-${role}`}>{role}</span>
            </div>
            <div className="p-info-row"><span className="p-info-key">Member Since</span><span className="p-info-val">{joined}</span></div>
            <div className="p-info-row"><span className="p-info-key">Status</span><span className="p-info-val" style={{ color: "#34d399" }}>● Active</span></div>
          </div>

          <div className="p-card">
            <div className="p-card-head">
              <span className="p-card-icon">📊</span>
              <div>
                <div className="p-card-title">Task Summary</div>
                <div className="p-card-sub">Your activity overview</div>
              </div>
            </div>
            <div className="p-task-stats">
              <div className="p-ts-item">
                <div className="p-ts-num">{taskStats.total}</div>
                <div className="p-ts-lbl">Total</div>
              </div>
              <div className="p-ts-item">
                <div className="p-ts-num" style={{ color: "#34d399" }}>{taskStats.completed}</div>
                <div className="p-ts-lbl">Done</div>
              </div>
              <div className="p-ts-item">
                <div className="p-ts-num" style={{ color: "#fbbf24" }}>{taskStats.pending}</div>
                <div className="p-ts-lbl">Pending</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right: edit forms */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Edit profile */}
          <div className="p-card">
            <div className="p-card-head">
              <span className="p-card-icon">✏️</span>
              <div>
                <div className="p-card-title">Edit Profile</div>
                <div className="p-card-sub">Update your name and email address</div>
              </div>
            </div>
            <div className="p-card-body">
              {pAlert.msg && (
                <div className={`pf-alert ${pAlert.type === "ok" ? "pf-ok" : "pf-err"}`}>{pAlert.msg}</div>
              )}
              <form onSubmit={saveProfile} noValidate>
                <div className="pf-row" style={{ marginBottom: ".9rem" }}>
                  <div className="pf-group">
                    <label className="pf-label">Full Name</label>
                    <input
                      className="pf-input"
                      type="text"
                      placeholder="Your full name"
                      value={pForm.name}
                      onChange={e => setPForm(p => ({ ...p, name: e.target.value }))}
                      disabled={pBusy}
                      autoComplete="name"
                    />
                  </div>
                  <div className="pf-group">
                    <label className="pf-label">Email Address</label>
                    <input
                    className="pf-input"
                    type="email"
                    value={pForm.email}
                    readOnly   /* ✅ instead of editable */
                    disabled/>
                  </div>
                </div>
                <div className="pf-foot">
                  <button type="submit" className="btn-teal" disabled={pBusy}>
                    {pBusy ? <><span className="btn-spin" /> Saving...</> : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Change password */}
          <div className="p-card">
            <div className="p-card-head">
              <span className="p-card-icon">🔐</span>
              <div>
                <div className="p-card-title">Change Password</div>
                <div className="p-card-sub">Minimum 8 characters required</div>
              </div>
            </div>
            <div className="p-card-body">
              {pwAlert.msg && (
                <div className={`pf-alert ${pwAlert.type === "ok" ? "pf-ok" : "pf-err"}`}>{pwAlert.msg}</div>
              )}
              <form onSubmit={changePassword} noValidate autoComplete="off">
                {/* Hidden username field to stop browser autofill */}
                <input type="text" name="username" style={{ display: "none" }} autoComplete="username" />

                <div className="pf-group" style={{ marginBottom: ".85rem" }}>
                  <label className="pf-label">Current Password</label>
                  <div className="pw-wrap">
                    <input
                      className="pf-input"
                      type={showCur ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={pw.cur}
                      onChange={e => setPw(p => ({ ...p, cur: e.target.value }))}
                      disabled={pwBusy}
                      autoComplete="current-password"
                    />
                    <button type="button" className="pw-eye" tabIndex={-1} onClick={() => setShowCur(p => !p)}>
                      <EyeIcon open={showCur} />
                    </button>
                  </div>
                </div>

                <div className="pf-row" style={{ marginBottom: ".85rem" }}>
                  <div className="pf-group">
                    <label className="pf-label">New Password</label>
                    <div className="pw-wrap">
                      <input
                        className="pf-input"
                        type={showNew ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={pw.nw}
                        onChange={e => setPw(p => ({ ...p, nw: e.target.value }))}
                        disabled={pwBusy}
                        autoComplete="new-password"
                      />
                      <button type="button" className="pw-eye" tabIndex={-1} onClick={() => setShowNew(p => !p)}>
                        <EyeIcon open={showNew} />
                      </button>
                    </div>
                  </div>
                  <div className="pf-group">
                    <label className="pf-label">Confirm New Password</label>
                    <div className="pw-wrap">
                      <input
                        className="pf-input"
                        type={showCon ? "text" : "password"}
                        placeholder="Repeat new password"
                        value={pw.con}
                        onChange={e => setPw(p => ({ ...p, con: e.target.value }))}
                        disabled={pwBusy}
                        autoComplete="new-password"
                      />
                      <button type="button" className="pw-eye" tabIndex={-1} onClick={() => setShowCon(p => !p)}>
                        <EyeIcon open={showCon} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pf-foot">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => { setPw({ cur: "", nw: "", con: "" }); setShowCur(false); setShowNew(false); setShowCon(false); }}
                  >
                    Clear
                  </button>
                  <button type="submit" className="btn-teal" disabled={pwBusy}>
                    {pwBusy ? <><span className="btn-spin" /> Updating...</> : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}