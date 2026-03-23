const { verifyToken } = require("../utils/jwt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authenticated." });
  }

  const token = header.split(" ")[1];

  try {
    const payload = verifyToken(token);
    const user    = await prisma.user.findUnique({
      where:  { id: payload.id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) return res.status(401).json({ message: "User no longer exists." });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
};

module.exports = { protect, adminOnly };