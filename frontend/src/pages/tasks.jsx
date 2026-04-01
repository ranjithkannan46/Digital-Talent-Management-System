import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "../api/axios";
import "../styles/tasks.css";
 
const fixRole = r => (!r || r === "player" || r === "Player") ? "user" : r;
const STATUS_LABELS = { todo: "To Do", in_progress: "In Progress", completed: "Completed" };
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : "—";
const getUser = () => { try { return JSON.parse(localStorage.getItem("dtms_user")); } catch { return null; } };
 
/* ─────────── Task Modal ─────────── */
function TaskModal({ task, users, onClose, onSave }) {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title:        task?.title             || "",
    description:  task?.description      || "",
    priority:     task?.priority         || "medium",
    status:       task?.status           || "todo",
    dueDate:      task?.dueDate ? task.dueDate.slice(0, 10) : "",
    assignedToId: task?.assignedTo?.id   || "",
  });
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");
 
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
 
  const submit = async e => {
    e.preventDefault();
    if (!form.title.trim()) { setErr("Title is required."); return; }
    setErr("");
    setBusy(true);
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
 
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-head">
          <h3>{isEdit ? "Edit Task" : "Create New Task"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="modal-body">
            {err && <div className="t-alert t-alert-err">{err}</div>}
 
            <div className="f-group">
              <label className="f-label">Task Title *</label>
              <input
                className="f-input"
                type="text"
                placeholder="e.g. Fix login page bug"
                value={form.title}
                onChange={e => set("title", e.target.value)}
                autoFocus
              />
            </div>
 
            <div className="f-group">
              <label className="f-label">Description <span style={{ color: "rgba(255,255,255,.22)" }}>(optional)</span></label>
              <textarea
                className="f-textarea"
                placeholder="Add detailed notes, acceptance criteria..."
                value={form.description}
                onChange={e => set("description", e.target.value)}
              />
            </div>
 
            <div className="f-row">
              <div className="f-group">
                <label className="f-label">Priority</label>
                <select className="f-select" value={form.priority} onChange={e => set("priority", e.target.value)}>
                  <option value="low">🔵 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
              <div className="f-group">
                <label className="f-label">Status</label>
                <select className="f-select" value={form.status} onChange={e => set("status", e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
 
            <div className="f-row">
              <div className="f-group">
                <label className="f-label">Due Date</label>
                <input className="f-input" type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
              </div>
              <div className="f-group">
                <label className="f-label">Assign To</label>
                <select className="f-select" value={form.assignedToId} onChange={e => set("assignedToId", e.target.value)}>
                  <option value="">— Unassigned —</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
 
          <div className="modal-foot">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? <><span className="btn-spin" /> Saving...</> : isEdit ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
 
/* ─────────── Delete Confirm ─────────── */
function DeleteModal({ task, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
 
  return (
    <div className="del-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="del-box">
        <div className="del-icon">🗑️</div>
        <p className="del-title">Delete Task?</p>
        <p className="del-text">
          "<strong style={{ color: "#f1f5f9" }}>{task.title}</strong>" will be permanently removed and cannot be recovered.
        </p>
        <div className="del-btns">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-danger"
            disabled={busy}
            onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); }}
          >
            {busy ? <span className="btn-spin" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
 
/* ─────────── Main Component ─────────── */
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
  const isAdmin = fixRole(user?.role) === "admin";
 
  const today = new Date();
  today.setHours(0, 0, 0, 0);
 
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
 
  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: "", msg: "" }), 3500);
  };
 
  const handleSave = (saved, action) => {
    setTasks(prev =>
      prev.find(t => t.id === saved.id)
        ? prev.map(t => t.id === saved.id ? saved : t)
        : [saved, ...prev]
    );
    setShowNew(false);
    setEditTask(null);
    showAlert("ok", `Task ${action} successfully.`);
  };
 
  const handleDelete = async () => {
    try {
      await axios.delete(`/tasks/${delTask.id}`);
      setTasks(prev => prev.filter(t => t.id !== delTask.id));
      showAlert("ok", "Task deleted.");
    } catch (ex) {
      showAlert("err", ex.response?.data?.message || "Delete failed.");
    } finally {
      setDelTask(null);
    }
  };
 
  const handleStatusChange = async (id, status) => {
    try {
      const { data } = await axios.put(`/tasks/${id}`, { status });
      setTasks(prev => prev.map(t => t.id === id ? data.task : t));
    } catch {
      showAlert("err", "Failed to update status.");
    }
  };
 
  // Filter + search
  const filtered = tasks
    .filter(t => filter === "all" || t.status === filter)
    .filter(t => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.assignedTo?.name.toLowerCase().includes(q)
      );
    });
 
  const stats = {
    total:    tasks.length,
    todo:     tasks.filter(t => t.status === "todo").length,
    progress: tasks.filter(t => t.status === "in_progress").length,
    done:     tasks.filter(t => t.status === "completed").length,
  };
 
  const isOverdue = t =>
    t.dueDate && new Date(t.dueDate) < today && t.status !== "completed";
 
  return (
    <div className="tasks-page">
      {showNew && <TaskModal users={users} onClose={() => setShowNew(false)} onSave={handleSave} />}
      {editTask && <TaskModal task={editTask} users={users} onClose={() => setEditTask(null)} onSave={handleSave} />}
      {delTask  && <DeleteModal task={delTask} onClose={() => setDelTask(null)} onConfirm={handleDelete} />}
 
      {/* Banner */}
      <div className="t-banner">
        <div className="t-banner-ov" />
        <div className="t-banner-body">
          <div>
            <div className="t-banner-title">Task Management</div>
            <div className="t-banner-sub">
              {isAdmin ? "Create, assign and track all team tasks" : "Your assigned tasks — update status as you progress"}
            </div>
          </div>
          {isAdmin && (
            <button className="btn-new-task" onClick={() => setShowNew(true)}>
              + New Task
            </button>
          )}
        </div>
      </div>
 
      {/* Alert */}
      {alert.msg && (
        <div className={`t-alert ${alert.type === "ok" ? "t-alert-ok" : "t-alert-err"}`}>
          {alert.msg}
        </div>
      )}
 
      {/* Stats */}
      <div className="t-stats">
        <div className="t-stat t-stat-1">
          <div className="t-stat-num">{stats.total}</div>
          <div className="t-stat-lbl">Total Tasks</div>
        </div>
        <div className="t-stat t-stat-2">
          <div className="t-stat-num">{stats.todo}</div>
          <div className="t-stat-lbl">To Do</div>
        </div>
        <div className="t-stat t-stat-3">
          <div className="t-stat-num">{stats.progress}</div>
          <div className="t-stat-lbl">In Progress</div>
        </div>
        <div className="t-stat t-stat-4">
          <div className="t-stat-num">{stats.done}</div>
          <div className="t-stat-lbl">Completed</div>
        </div>
      </div>
 
      {/* Toolbar: search + filters */}
      <div className="t-toolbar">
        <div className="t-search-wrap">
          <span className="t-search-icon">🔍</span>
          <input
            className="t-search"
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="t-filters">
          {["all", "todo", "in_progress", "completed"].map(f => (
            <button
              key={f}
              className={`t-filter-btn${filter === f ? " active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
      </div>
 
      {/* Table */}
      <div className="t-table-card">
        {loading ? (
          <div className="t-loading"><div className="t-spin" /> Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div className="t-empty">
            <div className="t-empty-icon">📋</div>
            {search
              ? `No tasks matching "${search}"`
              : filter === "all"
                ? isAdmin
                  ? <span>No tasks yet. Click <strong style={{ color: "#a78bfa" }}>+ New Task</strong> to create one.</span>
                  : "No tasks assigned to you yet."
                : `No ${STATUS_LABELS[filter]} tasks.`
            }
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                {isAdmin && <th>Assigned To</th>}
                <th>Due Date</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const overdue = isOverdue(t);
                return (
                  <tr key={t.id}>
                    <td>
                      <div className="t-task-name">{t.title}</div>
                      {t.description && <div className="t-task-desc">{t.description}</div>}
                    </td>
                    <td>
                      <span className={`t-badge t-badge-${t.priority}`}>
                        <span className="t-dot" />{t.priority}
                      </span>
                    </td>
                    <td>
                      <select
                        className={`t-status-sel t-badge t-badge-${overdue ? "overdue" : t.status}`}
                        value={t.status}
                        onChange={e => handleStatusChange(t.id, e.target.value)}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    {isAdmin && (
                      <td>{t.assignedTo?.name || <span style={{ color: "rgba(255,255,255,.22)" }}>Unassigned</span>}</td>
                    )}
                    <td>
                      <span style={{ color: overdue ? "#fb7185" : "rgba(255,255,255,.55)", fontSize: ".78rem" }}>
                        {fmtDate(t.dueDate)}
                        {overdue && " ⚠️"}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="t-actions">
                          <button className="t-act-btn" title="Edit" onClick={() => setEditTask(t)}>✏️</button>
                          <button className="t-act-btn danger" title="Delete" onClick={() => setDelTask(t)}>🗑️</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          );
        }