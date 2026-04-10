const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { signToken } = require("../utils/jwt");
const { consumeVerification } = require("./otp.controller");
const { sendAdminApprovalNotification, sendUserApprovedEmail } = require("../utils/mailers");

const prisma = new PrismaClient();
const sanitizeUser = ({ password, ...safe }) => safe;

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ message:"Validation failed.", errors:errors.array().map(e=>({field:e.path,message:e.msg})) });
  const { name, email, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where:{email} });
    if (existing) return res.status(409).json({ message:"An account with this email already exists." });
    
    // VERIFY OTP state
    if (!consumeVerification(email, "register")) {
      return res.status(403).json({ message: "Email not verified. Please complete OTP verification first." });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user   = await prisma.user.create({ data:{ name, email, password:hashed, status: "pending" } });
    
    // Notify Admin
    try { await sendAdminApprovalNotification(user); } catch(e) { console.error("Admin Email failed", e); }

    const token  = signToken({ id:user.id, email:user.email });
    res.status(201).json({ message:"Account created. Waiting for admin approval.", token, user:sanitizeUser(user) });
  } catch(err) { console.error("[register]",err); res.status(500).json({ message:"Something went wrong." }); }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ message:"Validation failed.", errors:errors.array().map(e=>({field:e.path,message:e.msg})) });
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where:{email} });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message:"Invalid credentials." });
    
    if (user.status !== "approved" && user.role !== "admin") {
      return res.status(403).json({ 
        message: "Your account is pending approval.", 
        status: user.status 
      });
    }

    const token = signToken({ id:user.id, email:user.email });
    res.json({ message:"Login successful.", token, user:sanitizeUser(user) });
  } catch(err) { console.error("[login]",err); res.status(500).json({ message:"Something went wrong." }); }
};

const getMe = async (req, res) => { res.json({ user: req.user }); };

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) return res.status(400).json({ message:"Email and new password required." });
  if (newPassword.length < 8) return res.status(400).json({ message:"Password must be at least 8 characters." });
  try {
    const user = await prisma.user.findUnique({ where:{email} });
    if (!user) return res.status(404).json({ message:"No account found with this email." });

    // VERIFY OTP state
    if (!consumeVerification(email, "reset")) {
      return res.status(403).json({ message: "Verification required. Please complete OTP verification first." });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where:{email}, data:{ password:hashed } });
    res.json({ message:"Password reset successfully." });
  } catch(err) { console.error("[resetPassword]",err); res.status(500).json({ message:"Something went wrong." }); }
};

const updateProfile = async (req, res) => {
  const { name, email } = req.body;
  if (!name?.trim()) return res.status(400).json({ message:"Name is required." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message:"Valid email required." });
  try {
    const conflict = await prisma.user.findFirst({ where:{ email, NOT:{ id:req.user.id } } });
    if (conflict) return res.status(409).json({ message:"Email already in use." });
    const user = await prisma.user.update({
      where:  { id:req.user.id },
      data:   { name:name.trim(), email:email.trim() },
      select: { id:true, name:true, email:true, role:true, createdAt:true },
    });
    res.json({ message:"Profile updated.", user });
  } catch(err) { console.error("[updateProfile]",err); res.status(500).json({ message:"Something went wrong." }); }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message:"Both passwords required." });
  if (newPassword.length < 8) return res.status(400).json({ message:"New password must be at least 8 characters." });
  try {
    const user  = await prisma.user.findUnique({ where:{ id:req.user.id } });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message:"Current password is incorrect." });
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where:{ id:req.user.id }, data:{ password:hashed } });
    res.json({ message:"Password changed successfully." });
  } catch(err) { console.error("[changePassword]",err); res.status(500).json({ message:"Something went wrong." }); }
};

const getPendingUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only." });
    const users = await prisma.user.findMany({
      where: { status: "pending" },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    res.json({ users });
  } catch (err) { res.status(500).json({ message: "Error fetching users." }); }
};

const approveUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only." });
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id },
      data: { status: "approved" }
    });
    
    // Notify User
    try { await sendUserApprovedEmail(user.email, user.name); } catch(e) {}
    
    res.json({ message: "User approved successfully.", user: sanitizeUser(user) });
  } catch (err) { res.status(500).json({ message: "Error approving user." }); }
};

module.exports = { register, login, getMe, resetPassword, updateProfile, changePassword, getPendingUsers, approveUser };