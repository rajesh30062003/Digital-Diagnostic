import { Router } from "express";
import { Contact } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const [data, total] = await Promise.all([
      Contact.find().skip((pageNum - 1) * limitNum).limit(limitNum).sort({ createdAt: -1 }).lean(),
      Contact.countDocuments(),
    ]);
    res.json({ data: data.map(c => ({ ...c, id: c._id })), total, page: pageNum, limit: limitNum });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

router.post("/", async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ ...contact.toObject(), id: contact._id });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).lean();
    if (!contact) return res.status(404).json({ error: "Not found" });
    res.json({ ...contact, id: contact._id });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

export default router;
