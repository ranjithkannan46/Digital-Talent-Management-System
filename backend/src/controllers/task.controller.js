const { PrismaClient } =require("@prisma/client");
const { validationResult } = require("express-validator");
const { createNotification } = require("./notification.controller");

const prisma = new PrismaClient();
async function main() {
  const assignedToId = process.argv[2];
  if (!assignedToId) {
    throw new Error("Usage: node scripts/debug-tasks.js <assignedToId>");
  }
  const tasks = await prisma.task.findMany({
    where: { assignedToId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      createdAt: true,
      createdById: true,
      assignedToId: true,
    },
  });
  console.log(JSON.stringify({ assignedToId, count: tasks.length, tasks }, null, 2));
}
const safeTask = (t) => ({
  id: t.id, title: t.title, description: t.description,
  status: t.status, priority: t.priority, dueDate: t.dueDate,
  createdAt: t.createdAt, updatedAt: t.updatedAt,
  createdBy:  t.createdBy  ? { id: t.createdBy.id,  name: t.createdBy.name,  email: t.createdBy.email  } : null,
  assignedTo: t.assignedTo ? { id: t.assignedTo.id, name: t.assignedTo.name, email: t.assignedTo.email } : null,
});

const include = {
  createdBy:  { select: { id:true, name:true, email:true } },
  assignedTo: { select: { id:true, name:true, email:true } },
};

const getTasks = async (req, res) => {
  try {
    const where = req.user.role === "admin" ? {} : { assignedToId: req.user.id };
    const tasks = await prisma.task.findMany({ where, include, orderBy: { createdAt: "desc" } });
    res.json({ tasks: tasks.map(safeTask) });
  } catch (err) { console.error("[getTasks]",err); res.status(500).json({ message:"Something went wrong." }); }
};

const getTask = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where:{ id:req.params.id }, include });
    if (!task) return res.status(404).json({ message:"Task not found." });
    if (req.user.role !== "admin" && task.assignedToId !== req.user.id) return res.status(403).json({ message:"Access denied." });
    res.json({ task: safeTask(task) });
  } catch (err) { console.error("[getTask]",err); res.status(500).json({ message:"Something went wrong." }); }
};

const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ message:"Validation failed.", errors:errors.array().map(e=>({field:e.path,message:e.msg})) });

  const { title, description, priority, dueDate, assignedToId } = req.body;
  try {
    if (assignedToId) {
      const assignee = await prisma.user.findUnique({ where:{ id:assignedToId } });
      if (!assignee) return res.status(404).json({ message:"Assigned user not found." });
    }

    const task = await prisma.task.create({
      data: {
        title, description: description||null,
        priority: priority||"medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: req.user.id,
        assignedToId: assignedToId||null,
      },
      include,
    });

    // Notify assignee
    if (assignedToId) {
      await createNotification(
        assignedToId,
        "New Task Assigned",
        `You have been assigned a new task: "${title}" by ${req.user.name}`,
        "task_assigned"
      );
    }

    res.status(201).json({ message:"Task created.", task: safeTask(task) });
  } catch (err) { console.error("[createTask]",err); res.status(500).json({ message:"Something went wrong." }); }
};

const updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ message:"Validation failed.", errors:errors.array().map(e=>({field:e.path,message:e.msg})) });

  try {
    const existing = await prisma.task.findUnique({ where:{ id:req.params.id }, include });
    if (!existing) return res.status(404).json({ message:"Task not found." });

    let data = {};
    let notifyAdminId = existing.createdById;
    let notifyAssigneeId = null;

    if (req.user.role === "admin") {
      const { title, description, priority, status, dueDate, assignedToId } = req.body;
      if (title)                    data.title       = title;
      if (description !== undefined) data.description = description;
      if (priority)                 data.priority    = priority;
      if (status)                   data.status      = status;
      if (dueDate !== undefined)    data.dueDate     = dueDate ? new Date(dueDate) : null;
      if (assignedToId !== undefined) {
        data.assignedToId = assignedToId || null;
        // Notify new assignee
        if (assignedToId && assignedToId !== existing.assignedToId) {
          notifyAssigneeId = assignedToId;
        }
      }
    } else {
      if (existing.assignedToId !== req.user.id) return res.status(403).json({ message:"Access denied." });
      if (req.body.status) {
        data.status = req.body.status;
        // Notify admin when user updates status
        if (req.body.status === "completed") {
          await createNotification(
            notifyAdminId,
            "Task Completed",
            `"${existing.title}" was marked as completed by ${req.user.name}`,
            "task_completed"
          );
        } else {
          await createNotification(
            notifyAdminId,
            "Task Status Updated",
            `"${existing.title}" status changed to ${req.body.status.replace("_"," ")} by ${req.user.name}`,
            "task_updated"
          );
        }
      }
    }

    if (notifyAssigneeId) {
      await createNotification(
        notifyAssigneeId,
        "Task Assigned to You",
        `You have been assigned: "${existing.title}"`,
        "task_assigned"
      );
    }

    const task = await prisma.task.update({ where:{ id:req.params.id }, data, include });
    res.json({ message:"Task updated.", task: safeTask(task) });
  } catch (err) { console.error("[updateTask]",err); res.status(500).json({ message:"Something went wrong." }); }
};

const deleteTask = async (req, res) => {
  try {
    const existing = await prisma.task.findUnique({ where:{ id:req.params.id } });
    if (!existing) return res.status(404).json({ message:"Task not found." });
    await prisma.task.delete({ where:{ id:req.params.id } });
    res.json({ message:"Task deleted." });
  } catch (err) { console.error("[deleteTask]",err); res.status(500).json({ message:"Something went wrong." }); }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where:   { role: "user" },
      select:  { id:true, name:true, email:true, role:true },
      orderBy: { name:"asc" },
    });
    res.json({ users });
  } catch (err) { console.error("[getUsers]",err); res.status(500).json({ message:"Something went wrong." }); }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, getUsers };