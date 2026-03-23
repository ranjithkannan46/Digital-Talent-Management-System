const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* GET /api/notifications — current user's notifications */
const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take:    30,
    });
    const unread = notifications.filter(n => !n.read).length;
    res.json({ notifications, unread });
  } catch (err) {
    console.error("[getNotifications]", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

/* PUT /api/notifications/read-all */
const markAllRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data:  { read: true },
    });
    res.json({ message: "All marked as read." });
  } catch (err) {
    console.error("[markAllRead]", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};

/* PUT /api/notifications/:id/read */
const markRead = async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data:  { read: true },
    });
    res.json({ message: "Marked as read." });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

/* Helper used by task controller to create notifications */
const createNotification = async (userId, title, message, type = "info") => {
  try {
    await prisma.notification.create({ data: { userId, title, message, type } });
  } catch (err) {
    console.error("[createNotification]", err);
  }
};

module.exports = { getNotifications, markAllRead, markRead, createNotification };