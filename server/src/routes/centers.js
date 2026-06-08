import { Router } from "express";
import { Center } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const data = await Center.find({ isActive: true }).lean();
    res.json(data.map(c => ({ ...c, id: c._id })));
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

router.get("/:id", async (req, res) => {
  try {
    const center = await Center.findById(req.params.id).lean();
    if (!center) return res.status(404).json({ error: "Not found" });
    res.json({ ...center, id: center._id });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const center = await Center.create(req.body);
    res.status(201).json({ ...center.toObject(), id: center._id });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const center = await Center.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!center) return res.status(404).json({ error: "Not found" });
    res.json({ ...center, id: center._id });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    await Center.findByIdAndDelete(req.params.id);
    res.json({ message: "Center deleted" });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

export default router;
