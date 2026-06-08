import { Router } from "express";
import { Notification } from "../models/index.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const { unread } = req.query;
    const query = { userId: req.user.id };
    if (unread === "true") query.isRead = false;
    const data = await Notification.find(query).sort({ createdAt: -1 }).lean();
    res.json(data.map(n => ({ ...n, id: n._id })));
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/:id/read", authenticate, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    ).lean();
    if (!notif) return res.status(404).json({ error: "Not found" });
    res.json({ ...notif, id: notif._id });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

export default router;
