const { Router } = require("express");
const { protect } = require("../middleware/auth.middleware");
const { getNotifications, markAllRead, markRead } = require("../controllers/notification.controller");

const router = Router();
router.use(protect);

router.get("/",           getNotifications);
router.put("/read-all",   markAllRead);
router.put("/:id/read",   markRead);

module.exports = router;