import { Router } from "express";
import { Report } from "../models/index.js";
import { User } from "../models/User.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const { userId, page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const query = {};
    if (req.user.role === "patient") query.userId = req.user.id;
    else if (userId) query.userId = userId;

    const [reports, total] = await Promise.all([
      Report.find(query).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ createdAt: -1 }).lean(),
      Report.countDocuments(query),
    ]);

    const userIds = [...new Set(reports.map(r => r.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u.name]));

    const data = reports.map(r => ({ ...r, id: r._id, patientName: userMap[r.userId.toString()] }));
    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticate, requireRole("admin", "doctor"), async (req, res) => {
  try {
    const { userId, bookingId, reportName, fileUrl } = req.body;
    const report = await Report.create({ userId, bookingId, reportName, fileUrl, status: "available" });
    res.status(201).json({ ...report.toObject(), id: report._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).lean();
    if (!report) return res.status(404).json({ error: "Not found" });
    res.json({ ...report, id: report._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
