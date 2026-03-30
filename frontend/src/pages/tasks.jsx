import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "../api/axios";
import "../styles/tasks.css";

const fixRole = r => (!r || r === "player" || r === "Player") ? "user" : r;

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