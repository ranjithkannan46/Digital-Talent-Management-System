const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const { signToken } = require("../utils/jwt");

const prisma = new PrismaClient();
const sanitizeUser = (user) => {
  const { password, ...safe } = user;
  return safe;
};

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }

  const { name, email, password } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const token = signToken({ id: user.id, email: user.email });

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("[register]", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken({ id: user.id, email: user.email });

    res.status(200).json({
      message: "Login successful.",
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("[login]", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };
