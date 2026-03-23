const { Router } = require("express");
const { body }   = require("express-validator");
const { protect, adminOnly } = require("../middleware/auth.middleware");
const {
  getTasks, getTask, createTask, updateTask, deleteTask, getUsers,
} = require("../controllers/task.controller");

const router = Router();

// All task routes require login
router.use(protect);

const createRules = [
  body("title").trim().notEmpty().withMessage("Title is required.").isLength({ max: 200 }),
  body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority."),
  body("status").optional().isIn(["todo", "in_progress", "completed"]).withMessage("Invalid status."),
];

const updateRules = [
  body("title").optional().trim().notEmpty().withMessage("Title cannot be empty."),
  body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority."),
  body("status").optional().isIn(["todo", "in_progress", "completed"]).withMessage("Invalid status."),
];

router.get  ("/users",  adminOnly, getUsers);   // list users for assign dropdown
router.get  ("/",       getTasks);
router.get  ("/:id",    getTask);
router.post ("/",       adminOnly, createRules, createTask);
router.put  ("/:id",    updateRules, updateTask);
router.delete("/:id",  adminOnly, deleteTask);

module.exports = router;