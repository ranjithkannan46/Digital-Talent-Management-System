require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? "https://yourdomain.com" : "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Routes ---
app.get("/api/health", (_, res) => res.json({ status: "ok", ts: Date.now() }));
app.use("/api/auth", authRoutes);

// --- 404 handler ---
app.use((_, res) => {
  res.status(404).json({ message: "Route not found." });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error("[unhandled]", err);
  res.status(500).json({ message: "An unexpected error occurred." });
});

app.listen(PORT, () => {
  console.log(`\n🎮 Talent System API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}\n`);
});
