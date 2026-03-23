import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "../api/axios";

const CSS = `
.tasks-page{animation:fadeUp .35s ease both;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

.TP-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.4rem;gap:1rem;flex-wrap:wrap;}
.TP-header h1{font-size:1.25rem;font-weight:700;color:#f1f5f9;}
.TP-header p{font-size:.78rem;color:rgba(255,255,255,.3);margin-top:.15rem;}

/* Stat strip */
.TP-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:.85rem;margin-bottom:1.3rem;}
.TS{background:#0f1524;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:.95rem 1.15rem;}
.TS__n{font-size:1.55rem;font-weight:700;color:#f1f5f9;line-height:1;margin-bottom:.18rem;}
.TS__l{font-size:.68rem;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.05em;}
.TS--i{border-top:2px solid rgba(99,102,241,.4);}
.TS--y{border-top:2px solid rgba(251,191,36,.35);}
.TS--b{border-top:2px solid rgba(96,165,250,.35);}
.TS--g{border-top:2px solid rgba(74,222,128,.35);}

/* Filters */
.TP-filters{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.2rem;}
.TF-btn{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:7px;padding:.36rem .82rem;font-family:'Inter',sans-serif;font-size:.75rem;font-weight:500;color:rgba(255,255,255,.42);cursor:pointer;transition:all 140ms;}
.TF-btn:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.68);}
.TF-btn.on{background:rgba(99,102,241,.15);border-color:rgba(99,102,241,.3);color:#818cf8;}

/* Table */
.TP-card{background:#0f1524;border:1px solid rgba(255,255,255,.06);border-radius:12px;overflow:hidden;}
table.T-table{width:100%;border-collapse:collapse;}
table.T-table th{padding:.7rem 1.15rem;font-size:.68rem;font-weight:600;color:rgba(255,255,255,.28);text-transform:uppercase;letter-spacing:.07em;text-align:left;border-bottom:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.015);}
table.T-table td{padding:.85rem 1.15rem;font-size:.81rem;color:rgba(255,255,255,.68);border-bottom:1px solid rgba(255,255,255,.03);vertical-align:middle;}
table.T-table tr:last-child td{border-bottom:none;}
table.T-table tr:hover td{background:rgba(255,255,255,.015);}

.T-task-name{font-weight:600;color:#e2e8f0;max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.T-task-desc{font-size:.72rem;color:rgba(255,255,255,.28);margin-top:.15rem;max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

.T-badge{display:inline-flex;align-items:center;gap:.28rem;padding:.2rem .55rem;border-radius:5px;font-size:.69rem;font-weight:600;}
.T-bdot{width:5px;height:5px;border-radius:50%;background:currentColor;}
.TB--todo{background:rgba(255,255,255,.07);color:rgba(255,255,255,.45);}
.TB--in_progress{background:rgba(251,191,36,.1);color:#fbbf24;}
.TB--completed{background:rgba(74,222,128,.1);color:#4ade80;}
.TB--low{background:rgba(96,165,250,.1);color:#60a5fa;}
.TB--medium{background:rgba(251,191,36,.1);color:#fbbf24;}
.TB--high{background:rgba(239,68,68,.1);color:#f87171;}

.T-status-sel{background:transparent;border:none;font-family:'Inter',sans-serif;font-size:.69rem;font-weight:600;cursor:pointer;outline:none;border-radius:5px;padding:.2rem .35rem;}
.T-status-sel:focus{outline:1px solid rgba(99,102,241,.4);}

.T-act{display:flex;gap:.35rem;}
.T-act-btn{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:6px;width:27px;height:27px;display:grid;place-items:center;cursor:pointer;transition:all 120ms;font-size:.75rem;color:rgba(255,255,255,.4);}
.T-act-btn:hover{background:rgba(255,255,255,.09);color:#fff;}
.T-act-btn.del:hover{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.2);color:#f87171;}

/* New task button */
.btn-new-task{
  display:flex;align-items:center;gap:.45rem;
  padding:.58rem 1.1rem;
  background:linear-gradient(135deg,#4f46e5,#6366f1);
  border:none;border-radius:9px;
  color:#fff;font-family:'Inter',sans-serif;
  font-size:.82rem;font-weight:600;
  cursor:pointer;transition:all 180ms;
  box-shadow:0 3px 14px rgba(99,102,241,.35);
  white-space:nowrap;
}
.btn-new-task:hover{background:linear-gradient(135deg,#4338ca,#4f46e5);transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,.4);}

/* Modal */
.M-ov{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:1.5rem;animation:mov .18s ease both;}
@keyframes mov{from{opacity:0}to{opacity:1}}
.M-bx{background:#111827;border:1px solid rgba(255,255,255,.09);border-radius:16px;width:100%;max-width:500px;box-shadow:0 32px 80px rgba(0,0,0,.7);animation:mslide .25s cubic-bezier(.22,1,.36,1) both;}
@keyframes mslide{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.M-head{padding:1.2rem 1.5rem 1rem;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:space-between;}
.M-head h3{font-size:1rem;font-weight:700;color:#f1f5f9;}
.M-cls{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);width:26px;height:26px;border-radius:50%;color:rgba(255,255,255,.45);cursor:pointer;display:grid;place-items:center;font-size:.8rem;transition:all 130ms;}
.M-cls:hover{background:rgba(255,255,255,.12);color:#fff;}
.M-body{padding:1.2rem 1.5rem;display:flex;flex-direction:column;gap:.85rem;}
.M-foot{padding:.9rem 1.5rem;border-top:1px solid rgba(255,255,255,.06);display:flex;justify-content:flex-end;gap:.65rem;}

.F-g{display:flex;flex-direction:column;gap:.26rem;}
.F-l{font-size:.7rem;font-weight:500;color:rgba(255,255,255,.38);}
.F-i,.F-s,.F-t{
  background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.09);
  border-radius:8px;padding:.65rem .88rem;
  color:#e2e8f0;font-family:'Inter',sans-serif;font-size:.84rem;
  outline:none;width:100%;transition:all 175ms;
}
.F-i::placeholder,.F-t::placeholder{color:rgba(255,255,255,.18);}
.F-i:focus,.F-s:focus,.F-t:focus{border-color:rgba(99,102,241,.45);background:rgba(255,255,255,.07);box-shadow:0 0 0 3px rgba(99,102,241,.08);}
.F-t{resize:vertical;min-height:70px;}
.F-s option{background:#111827;color:#e2e8f0;}
.F-2{display:grid;grid-template-columns:1fr 1fr;gap:.85rem;}

/* Confirm delete */
.D-ov{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:1.5rem;animation:mov .18s ease both;}
.D-bx{background:#111827;border:1px solid rgba(239,68,68,.15);border-radius:16px;max-width:380px;width:100%;padding:1.75rem 2rem;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.6);animation:mslide .25s cubic-bezier(.22,1,.36,1) both;}
.D-bx__icon{font-size:2rem;margin-bottom:.65rem;}
.D-bx__title{font-size:1rem;font-weight:700;color:#f1f5f9;margin-bottom:.4rem;}
.D-bx__text{font-size:.79rem;color:rgba(255,255,255,.38);line-height:1.6;margin-bottom:1.4rem;}
.D-bx__btns{display:flex;gap:.65rem;justify-content:center;}

/* Buttons */
.btn-save{padding:.58rem 1.3rem;background:linear-gradient(135deg,#4f46e5,#6366f1);border:none;border-radius:8px;color:#fff;font-family:'Inter',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;transition:all 175ms;display:flex;align-items:center;gap:.4rem;box-shadow:0 3px 10px rgba(99,102,241,.25);}
.btn-save:hover{background:linear-gradient(135deg,#4338ca,#4f46e5);transform:translateY(-1px);}
.btn-save:disabled{opacity:.4;cursor:not-allowed;transform:none;}
.btn-cncl{padding:.58rem 1rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:8px;color:rgba(255,255,255,.45);font-family:'Inter',sans-serif;font-size:.82rem;font-weight:500;cursor:pointer;transition:all 155ms;}
.btn-cncl:hover{background:rgba(255,255,255,.09);color:rgba(255,255,255,.75);}
.btn-del{padding:.58rem 1.3rem;background:#dc2626;border:none;border-radius:8px;color:#fff;font-family:'Inter',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;transition:all 180ms;}
.btn-del:hover{background:#b91c1c;}
.btn-del:disabled{opacity:.4;cursor:not-allowed;}

/* Alert */
.T-al{padding:.58rem .9rem;border-radius:8px;font-size:.77rem;margin-bottom:.9rem;}
.T-ok{background:rgba(74,222,128,.08);border:1px solid rgba(74,222,128,.18);color:#86efac;}
.T-err{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.18);color:#fca5a5;}

.T-empty{padding:3rem;text-align:center;color:rgba(255,255,255,.2);font-size:.82rem;}
.T-empty__ic{font-size:2.2rem;margin-bottom:.7rem;}
.T-loading{display:flex;align-items:center;justify-content:center;min-height:180px;gap:.6rem;color:rgba(255,255,255,.28);}
.T-sp{width:18px;height:18px;border:2px solid rgba(99,102,241,.2);border-top-color:#6366f1;border-radius:50%;animation:tsp .65s linear infinite;}
@keyframes tsp{to{transform:rotate(360deg)}}
.sp-s{width:12px;height:12px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:tsp .65s linear infinite;display:inline-block;}

@media(max-width:768px){
  .TP-strip{grid-template-columns:1fr 1fr;}
  table.T-table th:nth-child(n+4),table.T-table td:nth-child(n+4){display:none;}
}
`;

const STATUS_MAP = { todo:"To Do", in_progress:"In Progress", completed:"Completed" };
const fmt = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"2-digit"}) : "—";

/* ── Task Modal ── */
const TaskModal = ({ task, users, onClose, onSave }) => {
  const isEdit = !!task;
  const [form, setForm] = useState({
    title:        task?.title            || "",
    description:  task?.description     || "",
    priority:     task?.priority        || "medium",
    status:       task?.status          || "todo",
    dueDate:      task?.dueDate         ? task.dueDate.slice(0,10) : "",
    assignedToId: task?.assignedTo?.id  || "",
  });
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState("");
  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  const submit = async e => {
    e.preventDefault();
    if (!form.title.trim()) { setErr("Title is required."); return; }
    setErr(""); setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description||null,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate||null,
        assignedToId: form.assignedToId||null,
      };
      const {data} = isEdit
        ? await axios.put(`/tasks/${task.id}`, payload)
        : await axios.post("/tasks", payload);
      onSave(data.task, isEdit?"updated":"created");
    } catch(ex) { setErr(ex.response?.data?.message||"Something went wrong."); }
    finally { setBusy(false); }
  };

  return (
    <div className="M-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="M-bx">
        <div className="M-head">
          <h3>{isEdit?"Edit Task":"Create New Task"}</h3>
          <button className="M-cls" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit} noValidate>
          <div className="M-body">
            {err && <div className="T-al T-err">{err}</div>}
            <div className="F-g">
              <label className="F-l">Task Title *</label>
              <input className="F-i" type="text" placeholder="e.g. Fix login page bug" value={form.title} onChange={e=>set("title",e.target.value)} autoFocus/>
            </div>
            <div className="F-g">
              <label className="F-l">Description <span style={{color:"rgba(255,255,255,.2)"}}>(optional)</span></label>
              <textarea className="F-t" placeholder="What needs to be done, any details..." value={form.description} onChange={e=>set("description",e.target.value)}/>
            </div>
            <div className="F-2">
              <div className="F-g">
                <label className="F-l">Priority</label>
                <select className="F-s" value={form.priority} onChange={e=>set("priority",e.target.value)}>
                  <option value="low">🔵 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
              <div className="F-g">
                <label className="F-l">Status</label>
                <select className="F-s" value={form.status} onChange={e=>set("status",e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="F-2">
              <div className="F-g">
                <label className="F-l">Due Date</label>
                <input className="F-i" type="date" value={form.dueDate} onChange={e=>set("dueDate",e.target.value)}/>
              </div>
              <div className="F-g">
                <label className="F-l">Assign To</label>
                <select className="F-s" value={form.assignedToId} onChange={e=>set("assignedToId",e.target.value)}>
                  <option value="">— Unassigned —</option>
                  {users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="M-foot">
            <button type="button" className="btn-cncl" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={busy}>
              {busy?<><span className="sp-s"/> Saving...</>:isEdit?"Save Changes":"Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Delete confirm ── */
const DelModal = ({ task, onClose, onConfirm }) => {
  const [busy, setBusy] = useState(false);
  return (
    <div className="D-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="D-bx">
        <div className="D-bx__icon">🗑️</div>
        <p className="D-bx__title">Delete Task?</p>
        <p className="D-bx__text">"<strong style={{color:"#f1f5f9"}}>{task.title}</strong>" will be permanently removed and cannot be recovered.</p>
        <div className="D-bx__btns">
          <button className="btn-cncl" onClick={onClose}>Cancel</button>
          <button className="btn-del" disabled={busy} onClick={async()=>{setBusy(true);await onConfirm();setBusy(false);}}>
            {busy?<span className="sp-s"/>:"Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main ── */
export default function Tasks() {
  const location = useLocation();
  const [tasks,   setTasks]   = useState([]);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [editTask,setEditTask]= useState(null);
  const [delTask, setDelTask] = useState(null);
  const [alert,   setAlert]   = useState({type:"",msg:""});

  const user    = (() => { try { return JSON.parse(localStorage.getItem("dtms_user")); } catch { return null; } })();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!document.getElementById("tasks-css")) {
      const s = document.createElement("style"); s.id = "tasks-css"; s.textContent = CSS; document.head.appendChild(s);
    }
    load();
    // Auto-open create modal if navigated from dashboard with state
    if (location.state?.openCreate) setShowNew(true);
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [tr, ur] = await Promise.all([
        axios.get("/tasks"),
        isAdmin ? axios.get("/tasks/users") : Promise.resolve({data:{users:[]}}),
      ]);
      setTasks(tr.data.tasks);
      setUsers(ur.data.users);
    } catch(ex) { flash("err", ex.response?.data?.message||"Failed to load."); }
    finally { setLoading(false); }
  };

  const flash = (type,msg) => { setAlert({type,msg}); setTimeout(()=>setAlert({type:"",msg:""}),3500); };

  const handleSave = (saved, action) => {
    setTasks(p => p.find(t=>t.id===saved.id) ? p.map(t=>t.id===saved.id?saved:t) : [saved,...p]);
    setShowNew(false); setEditTask(null);
    flash("ok", `Task ${action} successfully.`);
  };

  const handleDel = async () => {
    try { await axios.delete(`/tasks/${delTask.id}`); setTasks(p=>p.filter(t=>t.id!==delTask.id)); flash("ok","Task deleted."); }
    catch(ex) { flash("err", ex.response?.data?.message||"Delete failed."); }
    setDelTask(null);
  };

  const handleStatus = async (id, status) => {
    try { const {data} = await axios.put(`/tasks/${id}`,{status}); setTasks(p=>p.map(t=>t.id===id?data.task:t)); }
    catch { flash("err","Failed to update."); }
  };

  const filtered = filter==="all" ? tasks : tasks.filter(t=>t.status===filter);
  const stats    = { total:tasks.length, todo:tasks.filter(t=>t.status==="todo").length, ip:tasks.filter(t=>t.status==="in_progress").length, done:tasks.filter(t=>t.status==="completed").length };

  return (
    <div className="tasks-page">
      {showNew  && <TaskModal users={users} onClose={()=>setShowNew(false)} onSave={handleSave}/>}
      {editTask && <TaskModal task={editTask} users={users} onClose={()=>setEditTask(null)} onSave={handleSave}/>}
      {delTask  && <DelModal task={delTask} onClose={()=>setDelTask(null)} onConfirm={handleDel}/>}

      <div className="TP-header">
        <div>
          <h1>Task Management</h1>
          <p>{isAdmin ? "Create and assign tasks to team members, track progress in real time" : "Your assigned tasks — update status as you progress"}</p>
        </div>
        {isAdmin && (
          <button className="btn-new-task" onClick={()=>setShowNew(true)}>
            + New Task
          </button>
        )}
      </div>

      {alert.msg && <div className={`T-al ${alert.type==="ok"?"T-ok":"T-err"}`}>{alert.msg}</div>}

      <div className="TP-strip">
        <div className="TS TS--i"><div className="TS__n">{stats.total}</div><div className="TS__l">Total</div></div>
        <div className="TS TS--y"><div className="TS__n">{stats.todo}</div><div className="TS__l">To Do</div></div>
        <div className="TS TS--b"><div className="TS__n">{stats.ip}</div><div className="TS__l">In Progress</div></div>
        <div className="TS TS--g"><div className="TS__n">{stats.done}</div><div className="TS__l">Completed</div></div>
      </div>

      <div className="TP-filters">
        {["all","todo","in_progress","completed"].map(f=>(
          <button key={f} className={`TF-btn${filter===f?" on":""}`} onClick={()=>setFilter(f)}>
            {f==="all"?"All Tasks":STATUS_MAP[f]}
          </button>
        ))}
      </div>

      <div className="TP-card">
        {loading ? (
          <div className="T-loading"><div className="T-sp"/> Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div className="T-empty">
            <div className="T-empty__ic">📋</div>
            {filter==="all"
              ? isAdmin ? <span>No tasks yet. Click <strong style={{color:"#818cf8"}}>+ New Task</strong> to create one.</span> : "No tasks assigned to you yet."
              : `No ${STATUS_MAP[filter]} tasks.`
            }
          </div>
        ) : (
          <table className="T-table">
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
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>
                    <div className="T-task-name">{t.title}</div>
                    {t.description && <div className="T-task-desc">{t.description}</div>}
                  </td>
                  <td>
                    <span className={`T-badge TB--${t.priority}`}>
                      <span className="T-bdot"/>{t.priority}
                    </span>
                  </td>
                  <td>
                    <select
                      className={`T-status-sel T-badge TB--${t.status}`}
                      value={t.status}
                      onChange={e=>handleStatus(t.id,e.target.value)}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  {isAdmin && <td>{t.assignedTo?.name || <span style={{color:"rgba(255,255,255,.2)"}}>Unassigned</span>}</td>}
                  <td>{fmt(t.dueDate)}</td>
                  {isAdmin && (
                    <td>
                      <div className="T-act">
                        <button className="T-act-btn" title="Edit" onClick={()=>setEditTask(t)}>✏️</button>
                        <button className="T-act-btn del" title="Delete" onClick={()=>setDelTask(t)}>🗑️</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}