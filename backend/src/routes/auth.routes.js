const { Router } = require("express");
const { body } = require("express-validator");
const { register, login, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = Router();

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
  body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

router.post("/register", registerRules, register);
router.post("/login", loginRules, login);
router.get("/me", protect, getMe);

module.exports = router;
