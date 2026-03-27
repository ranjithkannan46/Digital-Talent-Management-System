import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "../api/axios";

const fixRole = r => (!r || r === "player" || r === "Player") ? "user" : r;

const CSS = `
.T-page{animation:fadeUp .35s ease both;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

/* Banner */
.T-banner{
  border-radius:16px;overflow:hidden;position:relative;
  height:130px;margin-bottom:1.4rem;display:flex;align-items:flex-end;
  background:url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=75') center 40%/cover;
}
.T-banner-ov{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.82) 0%,rgba(20,10,40,.65) 55%,transparent 100%);}
.T-banner-content{position:relative;z-index:2;padding:1.1rem 1.5rem;width:100%;display:flex;align-items:flex-end;justify-content:space-between;}
.T-banner-left h1{font-size:1.25rem;font-weight:800;color:#fff;letter-spacing:-.02em;}
.T-banner-left p{font-size:.76rem;color:rgba(255,255,255,.4);margin-top:.15rem;}
.btn-new{
  display:flex;align-items:center;gap:.4rem;
  padding:.58rem 1.1rem;
  background:linear-gradient(135deg,#7c3aed,#6d28d9);
  border:none;border-radius:9px;
  color:#fff;font-family:'Inter',sans-serif;font-size:.82rem;font-weight:600;
  cursor:pointer;transition:all 170ms;
  box-shadow:0 3px 14px rgba(124,58,237,.4);white-space:nowrap;
}
.btn-new:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,58,237,.5);}

/* Stats */
.T-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:.9rem;margin-bottom:1.3rem;}
.T-stat{
  border-radius:11px;padding:.95rem 1.15rem;
  position:relative;overflow:hidden;
}
.T-stat-1{background:linear-gradient(135deg,#1a0533,#2d1060);border:1px solid rgba(167,139,250,.2);}
.T-stat-2{background:linear-gradient(135deg,#200a00,#4a1500);border:1px solid rgba(251,146,60,.2);}
.T-stat-3{background:linear-gradient(135deg,#001529,#003060);border:1px solid rgba(56,189,248,.18);}
.T-stat-4{background:linear-gradient(135deg,#001a10,#003322);border:1px solid rgba(52,211,153,.18);}
.T-stat-num{font-size:1.7rem;font-weight:800;color:#fff;line-height:1;margin-bottom:.15rem;}
.T-stat-lbl{font-size:.68rem;color:rgba(255,255,255,.38);letter-spacing:.04em;}

/* Filters */
.T-filters{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1.2rem;}
.T-fb{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:7px;padding:.36rem .82rem;font-family:'Inter',sans-serif;font-size:.74rem;font-weight:500;color:rgba(255,255,255,.42);cursor:pointer;transition:all 140ms;}
.T-fb:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.68);}
.T-fb.on{background:rgba(124,58,237,.15);border-color:rgba(124,58,237,.3);color:#a78bfa;}

/* Table */
.T-card{background:#0e1220;border:1px solid rgba(255,255,255,.065);border-radius:13px;overflow:hidden;}
table.T-tbl{width:100%;border-collapse:collapse;}
table.T-tbl th{padding:.72rem 1.15rem;font-size:.67rem;font-weight:600;color:rgba(255,255,255,.28);text-transform:uppercase;letter-spacing:.07em;text-align:left;border-bottom:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.015);}
table.T-tbl td{padding:.88rem 1.15rem;font-size:.81rem;color:rgba(255,255,255,.65);border-bottom:1px solid rgba(255,255,255,.035);vertical-align:middle;}
table.T-tbl tr:last-child td{border-bottom:none;}
table.T-tbl tr:hover td{background:rgba(255,255,255,.015);}
.T-name{font-weight:600;color:#e2e8f0;max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.T-desc{font-size:.71rem;color:rgba(255,255,255,.27);margin-top:.15rem;max-width:210px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

/* Badges */
.bd{display:inline-flex;align-items:center;gap:.27rem;padding:.2rem .55rem;border-radius:5px;font-size:.68rem;font-weight:600;}
.bdd{width:5px;height:5px;border-radius:50%;background:currentColor;}
.bd-todo{background:rgba(255,255,255,.07);color:rgba(255,255,255,.42);}
.bd-in_progress{background:rgba(251,191,36,.12);color:#fbbf24;}
.bd-completed{background:rgba(52,211,153,.12);color:#34d399;}
.bd-low{background:rgba(56,189,248,.1);color:#38bdf8;}
.bd-medium{background:rgba(251,191,36,.1);color:#fbbf24;}
.bd-high{background:rgba(251,113,133,.1);color:#fb7185;}

.T-ssel{background:transparent;border:none;font-family:'Inter',sans-serif;font-size:.68rem;font-weight:600;cursor:pointer;outline:none;border-radius:5px;padding:.2rem .35rem;}
.T-ssel:focus{outline:1px solid rgba(124,58,237,.4);}
.T-acts{display:flex;gap:.35rem;}
.T-ab{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:6px;width:27px;height:27px;display:grid;place-items:center;cursor:pointer;transition:all 120ms;font-size:.75rem;color:rgba(255,255,255,.4);}
.T-ab:hover{background:rgba(255,255,255,.09);color:#fff;}
.T-ab.del:hover{background:rgba(251,113,133,.1);border-color:rgba(251,113,133,.2);color:#fb7185;}

/* Modal */
.M-ov{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.78);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:1.5rem;animation:mfade .18s ease both;}
@keyframes mfade{from{opacity:0}to{opacity:1}}
.M-box{background:#111827;border:1px solid rgba(255,255,255,.09);border-radius:16px;width:100%;max-width:500px;box-shadow:0 32px 80px rgba(0,0,0,.7);animation:ms .25s cubic-bezier(.22,1,.36,1) both;}
@keyframes ms{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.M-head{padding:1.2rem 1.5rem 1rem;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:space-between;}
.M-head h3{font-size:1rem;font-weight:700;color:#f1f5f9;}
.M-cls{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09);width:26px;height:26px;border-radius:50%;color:rgba(255,255,255,.45);cursor:pointer;display:grid;place-items:center;font-size:.8rem;transition:all 130ms;}
.M-cls:hover{background:rgba(255,255,255,.12);color:#fff;}
.M-body{padding:1.2rem 1.5rem;display:flex;flex-direction:column;gap:.85rem;}
.M-foot{padding:.9rem 1.5rem;border-top:1px solid rgba(255,255,255,.06);display:flex;justify-content:flex-end;gap:.65rem;}
.F-g{display:flex;flex-direction:column;gap:.26rem;}
.F-l{font-size:.7rem;font-weight:500;color:rgba(255,255,255,.38);}
.F-i,.F-s,.F-t{background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.09);border-radius:8px;padding:.65rem .88rem;color:#e2e8f0;font-family:'Inter',sans-serif;font-size:.84rem;outline:none;width:100%;transition:all 175ms;}
.F-i::placeholder,.F-t::placeholder{color:rgba(255,255,255,.18);}
.F-i:focus,.F-s:focus,.F-t:focus{border-color:rgba(124,58,237,.45);background:rgba(255,255,255,.07);box-shadow:0 0 0 3px rgba(124,58,237,.08);}
.F-t{resize:vertical;min-height:70px;}
.F-s option{background:#111827;color:#e2e8f0;}
.F-2{display:grid;grid-template-columns:1fr 1fr;gap:.85rem;}

/* Del modal */
.D-ov{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.78);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:1.5rem;animation:mfade .18s ease both;}
.D-box{background:#111827;border:1px solid rgba(251,113,133,.18);border-radius:16px;max-width:380px;width:100%;padding:1.75rem 2rem;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.6);animation:ms .25s cubic-bezier(.22,1,.36,1) both;}
.D-box__icon{font-size:2rem;margin-bottom:.65rem;}
.D-box__title{font-size:1rem;font-weight:700;color:#f1f5f9;margin-bottom:.4rem;}
.D-box__text{font-size:.79rem;color:rgba(255,255,255,.38);line-height:1.6;margin-bottom:1.4rem;}
.D-box__btns{display:flex;gap:.65rem;justify-content:center;}

/* Buttons */
.btn-save{padding:.58rem 1.3rem;background:linear-gradient(135deg,#7c3aed,#6d28d9);border:none;border-radius:8px;color:#fff;font-family:'Inter',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;transition:all 175ms;display:flex;align-items:center;gap:.4rem;}
.btn-save:hover{filter:brightness(1.1);transform:translateY(-1px);}
.btn-save:disabled{opacity:.4;cursor:not-allowed;transform:none;}
.btn-cncl{padding:.58rem 1rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:8px;color:rgba(255,255,255,.45);font-family:'Inter',sans-serif;font-size:.82rem;font-weight:500;cursor:pointer;transition:all 155ms;}
.btn-cncl:hover{background:rgba(255,255,255,.09);color:rgba(255,255,255,.75);}
.btn-danger{padding:.58rem 1.3rem;background:linear-gradient(135deg,#dc2626,#b91c1c);border:none;border-radius:8px;color:#fff;font-family:'Inter',sans-serif;font-size:.82rem;font-weight:600;cursor:pointer;transition:all 180ms;}
.btn-danger:hover{filter:brightness(1.1);}
.btn-danger:disabled{opacity:.4;cursor:not-allowed;}

/* Alerts */
.T-al{padding:.58rem .9rem;border-radius:8px;font-size:.77rem;margin-bottom:.9rem;}
.T-ok{background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.18);color:#6ee7b7;}
.T-err{background:rgba(251,113,133,.08);border:1px solid rgba(251,113,133,.18);color:#fda4af;}

.T-empty{padding:3rem;text-align:center;color:rgba(255,255,255,.2);font-size:.82rem;}
.T-empty-ic{font-size:2.2rem;margin-bottom:.7rem;}
.T-loading{display:flex;align-items:center;justify-content:center;min-height:180px;gap:.6rem;color:rgba(255,255,255,.28);}
.T-sp{width:18px;height:18px;border:2px solid rgba(124,58,237,.2);border-top-color:#7c3aed;border-radius:50%;animation:tsp .65s linear infinite;}
@keyframes tsp{to{transform:rotate(360deg)}}
.sp-s{width:12px;height:12px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:tsp .65s linear infinite;display:inline-block;}

@media(max-width:768px){
  .T-strip{grid-template-columns:1fr 1fr;}
  table.T-tbl th:nth-child(n+4),table.T-tbl td:nth-child(n+4){display:none;}
}
`;

// Inject styles immediately on module load (prevents flash on navigation)
(() => {
  if (typeof document !== 'undefined' && !document.getElementById('tasks-css')) {
    const _s = document.createElement('style');
    _s.id = 'tasks-css';
    _s.textContent = CSS;
    document.head.appendChild(_s);
  }
})();


// Inject CSS immediately at module load
(function(){
    }());

const SM = { todo:"To Do", in_progress:"In Progress", completed:"Completed" };
const fmt = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"2-digit"}) : "—";

const TaskModal = ({ task, users, onClose, onSave }) => {
  const isEdit=!!task;
  const [form,setForm]=useState({title:task?.title||"",description:task?.description||"",priority:task?.priority||"medium",status:task?.status||"todo",dueDate:task?.dueDate?task.dueDate.slice(0,10):"",assignedToId:task?.assignedTo?.id||""});
  const [busy,setBusy]=useState(false);const [err,setErr]=useState("");
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  const submit=async e=>{
    e.preventDefault();if(!form.title.trim()){setErr("Title is required.");return;}
    setErr("");setBusy(true);
    try{
      const payload={title:form.title.trim(),description:form.description||null,priority:form.priority,status:form.status,dueDate:form.dueDate||null,assignedToId:form.assignedToId||null};
      const{data}=isEdit?await axios.put(`/tasks/${task.id}`,payload):await axios.post("/tasks",payload);
      onSave(data.task,isEdit?"updated":"created");
    }catch(ex){setErr(ex.response?.data?.message||"Something went wrong.");}
    finally{setBusy(false);}
  };
  return (
    <div className="M-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="M-box">
        <div className="M-head"><h3>{isEdit?"Edit Task":"Create New Task"}</h3><button className="M-cls" onClick={onClose}>✕</button></div>
        <form onSubmit={submit} noValidate>
          <div className="M-body">
            {err&&<div className="T-al T-err">{err}</div>}
            <div className="F-g"><label className="F-l">Task Title *</label><input className="F-i" type="text" placeholder="e.g. Fix login page bug" value={form.title} onChange={e=>set("title",e.target.value)} autoFocus/></div>
            <div className="F-g"><label className="F-l">Description (optional)</label><textarea className="F-t" placeholder="Detailed notes..." value={form.description} onChange={e=>set("description",e.target.value)}/></div>
            <div className="F-2">
              <div className="F-g"><label className="F-l">Priority</label><select className="F-s" value={form.priority} onChange={e=>set("priority",e.target.value)}><option value="low">🔵 Low</option><option value="medium">🟡 Medium</option><option value="high">🔴 High</option></select></div>
              <div className="F-g"><label className="F-l">Status</label><select className="F-s" value={form.status} onChange={e=>set("status",e.target.value)}><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="completed">Completed</option></select></div>
            </div>
            <div className="F-2">
              <div className="F-g"><label className="F-l">Due Date</label><input className="F-i" type="date" value={form.dueDate} onChange={e=>set("dueDate",e.target.value)}/></div>
              <div className="F-g"><label className="F-l">Assign To</label><select className="F-s" value={form.assignedToId} onChange={e=>set("assignedToId",e.target.value)}><option value="">— Unassigned —</option>{users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
            </div>
          </div>
          <div className="M-foot">
            <button type="button" className="btn-cncl" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save" disabled={busy}>{busy?<><span className="sp-s"/> Saving...</>:isEdit?"Save Changes":"Create Task"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DelModal = ({ task, onClose, onConfirm }) => {
  const [busy,setBusy]=useState(false);
  return (
    <div className="D-ov" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="D-box">
        <div className="D-box__icon">🗑️</div>
        <p className="D-box__title">Delete Task?</p>
        <p className="D-box__text">"<strong style={{color:"#f1f5f9"}}>{task.title}</strong>" will be permanently removed.</p>
        <div className="D-box__btns">
          <button className="btn-cncl" onClick={onClose}>Cancel</button>
          <button className="btn-danger" disabled={busy} onClick={async()=>{setBusy(true);await onConfirm();setBusy(false);}}>{busy?<span className="sp-s"/>:"Delete"}</button>
        </div>
      </div>
    </div>
  );
};

export default function Tasks() {
  const location=useLocation();
  const [tasks,setTasks]=useState([]);const [users,setUsers]=useState([]);const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("all");const [showNew,setShowNew]=useState(false);const [editTask,setEditTask]=useState(null);const [delTask,setDelTask]=useState(null);
  const [alert,setAlert]=useState({type:"",msg:""});
  const user=(() => { try{return JSON.parse(localStorage.getItem("dtms_user"));}catch{return null;} })();
  const isAdmin=fixRole(user?.role)==="admin";

  useEffect(()=>{
load();
    if(location.state?.openCreate)setShowNew(true);
  },[]);

  const load=async()=>{
    setLoading(true);
    try{
      const[tr,ur]=await Promise.all([axios.get("/tasks"),isAdmin?axios.get("/tasks/users"):Promise.resolve({data:{users:[]}})]);
      setTasks(tr.data.tasks);setUsers(ur.data.users);
    }catch(ex){flash("err",ex.response?.data?.message||"Failed to load.");}
    finally{setLoading(false);}
  };

  const flash=(type,msg)=>{setAlert({type,msg});setTimeout(()=>setAlert({type:"",msg:""}),3500);};
  const handleSave=(saved,action)=>{setTasks(p=>p.find(t=>t.id===saved.id)?p.map(t=>t.id===saved.id?saved:t):[saved,...p]);setShowNew(false);setEditTask(null);flash("ok",`Task ${action} successfully.`);};
  const handleDel=async()=>{try{await axios.delete(`/tasks/${delTask.id}`);setTasks(p=>p.filter(t=>t.id!==delTask.id));flash("ok","Task deleted.");}catch(ex){flash("err",ex.response?.data?.message||"Delete failed.");}setDelTask(null);};
  const handleStatus=async(id,status)=>{ try{const{data}=await axios.put(`/tasks/${id}`,{status});setTasks(p=>p.map(t=>t.id===id?data.task:t));}catch{flash("err","Failed to update.");} };

  const filtered=filter==="all"?tasks:tasks.filter(t=>t.status===filter);
  const stats={total:tasks.length,todo:tasks.filter(t=>t.status==="todo").length,ip:tasks.filter(t=>t.status==="in_progress").length,done:tasks.filter(t=>t.status==="completed").length};

  return (
    <div className="T-page">
      {showNew&&<TaskModal users={users} onClose={()=>setShowNew(false)} onSave={handleSave}/>}
      {editTask&&<TaskModal task={editTask} users={users} onClose={()=>setEditTask(null)} onSave={handleSave}/>}
      {delTask&&<DelModal task={delTask} onClose={()=>setDelTask(null)} onConfirm={handleDel}/>}

      {/* Banner */}
      <div className="T-banner">
        <div className="T-banner-ov"/>
        <div className="T-banner-content">
          <div className="T-banner-left">
            <h1>Task Management</h1>
            <p>{isAdmin?"Create, assign and track all team tasks":"Your assigned tasks — update status as you progress"}</p>
          </div>
          {isAdmin&&<button className="btn-new" onClick={()=>setShowNew(true)}>+ New Task</button>}
        </div>
      </div>

      {alert.msg&&<div className={`T-al ${alert.type==="ok"?"T-ok":"T-err"}`}>{alert.msg}</div>}

      <div className="T-strip">
        <div className="T-stat T-stat-1"><div className="T-stat-num">{stats.total}</div><div className="T-stat-lbl">Total Tasks</div></div>
        <div className="T-stat T-stat-2"><div className="T-stat-num">{stats.todo}</div><div className="T-stat-lbl">To Do</div></div>
        <div className="T-stat T-stat-3"><div className="T-stat-num">{stats.ip}</div><div className="T-stat-lbl">In Progress</div></div>
        <div className="T-stat T-stat-4"><div className="T-stat-num">{stats.done}</div><div className="T-stat-lbl">Completed</div></div>
      </div>

      <div className="T-filters">
        {["all","todo","in_progress","completed"].map(f=>(
          <button key={f} className={`T-fb${filter===f?" on":""}`} onClick={()=>setFilter(f)}>
            {f==="all"?"All Tasks":SM[f]}
          </button>
        ))}
      </div>

      <div className="T-card">
        {loading?<div className="T-loading"><div className="T-sp"/> Loading tasks...</div>
        :filtered.length===0?<div className="T-empty"><div className="T-empty-ic">📋</div>{filter==="all"?isAdmin?<span>No tasks yet. Click <strong style={{color:"#a78bfa"}}>+ New Task</strong> to create one.</span>:"No tasks assigned to you yet.":`No ${SM[filter]} tasks.`}</div>
        :(
          <table className="T-tbl">
            <thead>
              <tr>
                <th>Task</th><th>Priority</th><th>Status</th>
                {isAdmin&&<th>Assigned To</th>}
                <th>Due Date</th>
                {isAdmin&&<th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t=>(
                <tr key={t.id}>
                  <td><div className="T-name">{t.title}</div>{t.description&&<div className="T-desc">{t.description}</div>}</td>
                  <td><span className={`bd bd-${t.priority}`}><span className="bdd"/>{t.priority}</span></td>
                  <td>
                    <select className={`T-ssel bd bd-${t.status}`} value={t.status} onChange={e=>handleStatus(t.id,e.target.value)}>
                      <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
                    </select>
                  </td>
                  {isAdmin&&<td>{t.assignedTo?.name||<span style={{color:"rgba(255,255,255,.2)"}}>Unassigned</span>}</td>}
                  <td>{fmt(t.dueDate)}</td>
                  {isAdmin&&<td><div className="T-acts"><button className="T-ab" title="Edit" onClick={()=>setEditTask(t)}>✏️</button><button className="T-ab del" title="Delete" onClick={()=>setDelTask(t)}>🗑️</button></div></td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}