import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "../api/axios";
import "../styles/tasks.css";

const displayRole = (r) => {
  const role = r?.toLowerCase();
  if (role === "admin") return "Administrator";
  return "Talent / User";
};
const STATUS_LABELS = { todo: "To Do", in_progress: "In Progress", completed: "Completed" };
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";
const getUser = () => { try { return JSON.parse(localStorage.getItem("dtms_user")); } catch { return null; } };

const PRIORITY_META = {
  low:    { color: "#38bdf8", bg: "rgba(56,189,248,.1)",  icon: "▼", label: "Low" },
  medium: { color: "#fbbf24", bg: "rgba(251,191,36,.1)",  icon: "●", label: "Medium" },
  high:   { color: "#fb7185", bg: "rgba(251,113,133,.1)", icon: "▲", label: "High" },
};
const STATUS_META = {
  todo:        { color: "rgba(255,255,255,.45)", bg: "rgba(255,255,255,.06)", label: "To Do",       icon: "○" },
  in_progress: { color: "#fbbf24",              bg: "rgba(251,191,36,.1)",   label: "In Progress", icon: "◑" },
  completed:   { color: "#34d399",              bg: "rgba(52,211,153,.1)",   label: "Completed",   icon: "●" },
};

/* ── Professional Task Modal ── */
function TaskModal({ task, users, onClose, onSave }) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title:        task?.title            || "",
    description:  task?.description     || "",
    priority:     task?.priority        || "medium",
    status:       task?.status          || "todo",
    dueDate:      task?.dueDate ? task.dueDate.slice(0, 10) : "",
    assignedToId: task?.assignedTo?.id  || "",
  });
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");
  const [step, setStep] = useState(1); // multi-step feel

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async e => {
    e.preventDefault();
    if (!form.title.trim()) { setErr("Task title is required."); return; }
    setErr(""); setBusy(true);
    try {
      const payload = {
        title:        form.title.trim(),
        description:  form.description || null,
        priority:     form.priority,
        status:       form.status,
        dueDate:      form.dueDate || null,
        assignedToId: form.assignedToId || null,
      };
      const { data } = isEdit
        ? await axios.put(`/tasks/${task.id}`, payload)
        : await axios.post("/tasks", payload);
      onSave(data.task, isEdit ? "updated" : "created");
    } catch (ex) {
      setErr(ex.response?.data?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const assignedUser = users.find(u => u.id === form.assignedToId);

  return (
    <div className="tm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tm-panel">
        {/* Header */}
        <div className="tm-header">
          <div className="tm-header-left">
            <div className="tm-header-icon">{isEdit ? "✏️" : "✦"}</div>
            <div>
              <div className="tm-header-title">{isEdit ? "Edit Task" : "Create New Task"}</div>
              <div className="tm-header-sub">Fill in the details below to {isEdit ? "update" : "assign a new task"}</div>
            </div>
          </div>
          <button className="tm-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit} noValidate>
          <div className="tm-body">
            {err && <div className="tm-err"><span>⚠</span>{err}</div>}

            {/* Title */}
            <div className="tm-field-group">
              <label className="tm-label">Task Title <span className="tm-required">*</span></label>
              <input
                className="tm-input"
                type="text"
                placeholder="e.g. Design landing page, Fix login bug..."
                value={form.title}
                onChange={e => set("title", e.target.value)}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="tm-field-group">
              <label className="tm-label">Description <span className="tm-optional">optional</span></label>
              <textarea
                className="tm-textarea"
                placeholder="Add context, acceptance criteria, or any notes..."
                value={form.description}
                onChange={e => set("description", e.target.value)}
              />
            </div>

            {/* Priority + Status row */}
            <div className="tm-row">
              <div className="tm-field-group">
                <label className="tm-label">Priority</label>
                <div className="tm-priority-group">
                  {["low","medium","high"].map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`tm-priority-btn${form.priority === p ? " active" : ""}`}
                      style={form.priority === p ? { borderColor: PRIORITY_META[p].color, background: PRIORITY_META[p].bg, color: PRIORITY_META[p].color } : {}}
                      onClick={() => set("priority", p)}
                    >
                      <span>{PRIORITY_META[p].icon}</span> {PRIORITY_META[p].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="tm-field-group">
                <label className="tm-label">Status</label>
                <div className="tm-status-group">
                  {["todo","in_progress","completed"].map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`tm-status-opt${form.status === s ? " active" : ""}`}
                      style={form.status === s ? { borderColor: STATUS_META[s].color, background: STATUS_META[s].bg, color: STATUS_META[s].color } : {}}
                      onClick={() => set("status", s)}
                    >
                      {STATUS_META[s].icon} {STATUS_META[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Due date + Assign row */}
            <div className="tm-row">
              <div className="tm-field-group">
                <label className="tm-label">📅 Due Date</label>
                <input
                  className="tm-input"
                  type="date"
                  value={form.dueDate}
                  onChange={e => set("dueDate", e.target.value)}
                />
              </div>

              {users.length > 0 && (
                <div className="tm-field-group">
                  <label className="tm-label">👤 Assign To</label>
                  <select className="tm-select" value={form.assignedToId} onChange={e => set("assignedToId", e.target.value)}>
                    <option value="">— Unassigned —</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Assignee preview card */}
            {assignedUser && (
              <div className="tm-assignee-card">
                <div className="tm-assignee-av">{assignedUser.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="tm-assignee-name">{assignedUser.name}</div>
                  <div className="tm-assignee-email">{assignedUser.email}</div>
                </div>
                <div className="tm-assignee-badge">Assigned</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="tm-footer">
            <button type="button" className="tm-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="tm-btn-submit" disabled={busy}>
              {busy
                ? <><span className="tm-spin"/> Saving...</>
                : isEdit ? "💾 Save Changes" : "✦ Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Delete Confirm ── */
function DeleteModal({ task, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="del-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="del-box">
        <div className="del-icon">🗑️</div>
        <p className="del-title">Delete Task?</p>
        <p className="del-text">
          "<strong style={{ color: "#f1f5f9" }}>{task.title}</strong>" will be permanently removed.
        </p>
        <div className="del-btns">
          <button className="tm-btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="tm-btn-danger"
            disabled={busy}
            onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); }}
          >
            {busy ? <span className="tm-spin"/> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function Tasks() {
  const location = useLocation();
  const [tasks,    setTasks]    = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [showNew,  setShowNew]  = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [delTask,  setDelTask]  = useState(null);
  const [alert,    setAlert]    = useState({ type: "", msg: "" });

  const user    = getUser();
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const today   = new Date(); today.setHours(0, 0, 0, 0);

  useEffect(() => {
    loadData();
    if (location.state?.openCreate) setShowNew(true);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([
        axios.get("/tasks"),
        isAdmin ? axios.get("/tasks/users") : Promise.resolve({ data: { users: [] } }),
      ]);
      setTasks(tasksRes.data.tasks);
      setUsers(usersRes.data.users);
    } catch (ex) {
      showAlert("err", ex.response?.data?.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert({ type: "", msg: "" }), 3500); };

  const handleSave = (saved, action) => {
    setTasks(prev => prev.find(t => t.id === saved.id) ? prev.map(t => t.id === saved.id ? saved : t) : [saved, ...prev]);
    setShowNew(false); setEditTask(null);
    showAlert("ok", `Task ${action} successfully.`);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/tasks/${delTask.id}`);
      setTasks(prev => prev.filter(t => t.id !== delTask.id));
      showAlert("ok", "Task deleted.");
    } catch (ex) {
      showAlert("err", ex.response?.data?.message || "Delete failed.");
    } finally { setDelTask(null); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await axios.put(`/tasks/${id}`, { status });
      setTasks(prev => prev.map(t => t.id === id ? data.task : t));
    } catch { showAlert("err", "Failed to update status."); }
  };

  const filtered = tasks
    .filter(t => filter === "all" || t.status === filter)
    .filter(t => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.assignedTo?.name.toLowerCase().includes(q);
    });

  const stats = {
    total:    tasks.length,
    todo:     tasks.filter(t => t.status === "todo").length,
    progress: tasks.filter(t => t.status === "in_progress").length,
    done:     tasks.filter(t => t.status === "completed").length,
  };

  const isOverdue = t => t.dueDate && new Date(t.dueDate) < today && t.status !== "completed";

  return (
    <div className="tasks-page">
      {showNew  && <TaskModal users={users} onClose={() => setShowNew(false)} onSave={handleSave} />}
      {editTask && <TaskModal task={editTask} users={users} onClose={() => setEditTask(null)} onSave={handleSave} />}
      {delTask  && <DeleteModal task={delTask} onClose={() => setDelTask(null)} onConfirm={handleDelete} />}

      {/* Page Header */}
      <div className="tasks-header">
        <div>
          <p className="tasks-header-label">Digital Talent Management System</p>
          <h1 className="tasks-header-title">Task Management</h1>
          <p className="tasks-header-sub">{isAdmin ? "Create, assign and track all team tasks" : "Your assigned tasks — update status as you progress"}</p>
        </div>
        {isAdmin && (
          <button className="btn-new-task" onClick={() => setShowNew(true)}>
            <span className="btn-new-icon">✦</span> New Task
          </button>
        )}
      </div>

      {/* Alert */}
      {alert.msg && <div className={`t-alert ${alert.type === "ok" ? "t-alert-ok" : "t-alert-err"}`}>{alert.msg}</div>}

      {/* Stats */}
      <div className="t-stats">
        {[
          { label: "Total", num: stats.total,    cls: "t-stat-1", icon: "📋" },
          { label: "To Do", num: stats.todo,     cls: "t-stat-2", icon: "⏳" },
          { label: "In Progress", num: stats.progress, cls: "t-stat-3", icon: "🔄" },
          { label: "Completed",   num: stats.done,     cls: "t-stat-4", icon: "✅" },
        ].map(s => (
          <div key={s.label} className={`t-stat ${s.cls}`}>
            <div className="t-stat-top">
              <div className="t-stat-num">{s.num}</div>
              <div className="t-stat-ico">{s.icon}</div>
            </div>
            <div className="t-stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="t-toolbar">
        <div className="t-search-wrap">
          <span className="t-search-icon">🔍</span>
          <input className="t-search" type="text" placeholder="Search tasks, assignees..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="t-filters">
          {["all","todo","in_progress","completed"].map(f => (
            <button key={f} className={`t-filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards (if not loading) */}
      {loading ? (
        <div className="t-loading"><div className="t-spin"/> Loading tasks...</div>
      ) : filtered.length === 0 ? (
        <div className="t-empty">
          <div className="t-empty-icon">📔</div>
          {search 
            ? <p>No tasks matching "<strong>{search}</strong>"</p> 
            : filter === "all" 
              ? isAdmin 
                ? <p>No tasks found. Click <strong style={{ color: "#a78bfa" }}>✦ New Task</strong> to get started.</p> 
                : <p>No tasks assigned to you yet.</p> 
              : <p>No {STATUS_LABELS[filter]} tasks found.</p>
          }
        </div>
      ) : (
        <div className="task-card-grid">
          {filtered.map(t => {
            const over = isOverdue(t);
            const pm = PRIORITY_META[t.priority] || PRIORITY_META.medium;
            const sm = over ? { color:"#f87171", bg:"rgba(239,68,68,.1)", label:"Overdue", icon:"⚠" } : STATUS_META[t.status] || STATUS_META.todo;
            return (
              <div key={t.id} className={`task-card${over ? " task-card-overdue" : ""}`}>
                <div className="task-card-head">
                  <span className="task-card-priority" style={{ color: pm.color, background: pm.bg }}>{pm.icon} {pm.label}</span>
                  <span className="task-card-status" style={{ color: sm.color, background: sm.bg }}>{sm.icon} {sm.label}</span>
                </div>

                <div className="task-card-title">{t.title}</div>
                {t.description && <div className="task-card-desc">{t.description}</div>}

                <div className="task-card-meta">
                  {t.assignedTo && (
                    <div className="task-card-assignee">
                      <div className="task-card-av">{t.assignedTo.name.charAt(0).toUpperCase()}</div>
                      <span>{t.assignedTo.name}</span>
                    </div>
                  )}
                  {t.dueDate && (
                    <span className="task-card-due" style={{ color: over ? "#fb7185" : "rgba(255,255,255,.35)" }}>
                      📅 {fmtDate(t.dueDate)}{over ? " ⚠️" : ""}
                    </span>
                  )}
                </div>

                <div className="task-card-footer">
                  <select
                    className="task-status-sel"
                    style={{ color: sm.color, borderColor: sm.color + "44" }}
                    value={t.status}
                    onChange={e => handleStatusChange(t.id, e.target.value)}
                  >
                    <option value="todo">○ To Do</option>
                    <option value="in_progress">◑ In Progress</option>
                    <option value="completed">● Completed</option>
                  </select>

                  {isAdmin && (
                    <div className="task-card-actions">
                      <button className="tca-btn" title="Edit" onClick={() => setEditTask(t)}>✏️</button>
                      <button className="tca-btn danger" title="Delete" onClick={() => setDelTask(t)}>🗑️</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}