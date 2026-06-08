import { Router } from "express";
import { Service } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const data = await Service.find({ isActive: true }).lean();
    res.json(data.map(s => ({ ...s, id: s._id })));
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

router.get("/:id", async (req, res) => {
  try {
    const svc = await Service.findById(req.params.id).lean();
    if (!svc) return res.status(404).json({ error: "Not found" });
    res.json({ ...svc, id: svc._id });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const svc = await Service.create(req.body);
    res.status(201).json({ ...svc.toObject(), id: svc._id });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

router.patch("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const svc = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!svc) return res.status(404).json({ error: "Not found" });
    res.json({ ...svc, id: svc._id });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted" });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

export default router;
