const { Router } = require("express");
const { body }   = require("express-validator");
const { register, login, getMe, resetPassword, updateProfile, changePassword } = require("../controllers/auth.controller");
const { googleLogin }      = require("../controllers/google.controller");
const { sendOtp, verifyOtp } = require("../controllers/otp.controller");
const { protect }          = require("../middleware/auth.middleware");

const router = Router();

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ min:2 }),
  body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password").isLength({ min:8 }).withMessage("Password must be at least 8 characters."),
];
const loginRules = [
  body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

router.post("/register",       registerRules, register);
router.post("/login",          loginRules,    login);
router.post("/google",                        googleLogin);
router.post("/send-otp",                      sendOtp);
router.post("/verify-otp",                    verifyOtp);
router.post("/reset-password",                resetPassword);
router.get ("/me",             protect,       getMe);
router.put ("/profile",        protect,       updateProfile);
router.put ("/password",       protect,       changePassword);

module.exports = router;