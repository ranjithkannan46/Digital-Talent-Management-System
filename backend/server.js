const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const authRoutes         = require("./src/routes/auth.routes");
const taskRoutes         = require("./src/routes/task.routes");
const notificationRoutes = require("./src/routes/notification.routes");

const app  = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

app.get("/api/health", (_, res) => res.json({ status:"ok", ts:Date.now() }));
app.use("/api/auth",          authRoutes);
app.use("/api/tasks",         taskRoutes);
app.use("/api/notifications",  notificationRoutes);

app.use((req, res) => res.status(404).json({ message:"Route not found." }));
app.use((err, req, res, next) => { console.error("[error]",err); res.status(500).json({ message:"Internal server error." }); });

app.listen(PORT, () => console.log(`🚀 DTMS API → http://localhost:${PORT}`));