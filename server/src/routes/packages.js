import { Router } from "express";
import { Package } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
const fmt = (p) => ({ ...p, id: p._id });

router.get("/", async (req, res) => {
  try {
    const { category, search, page = "1", limit = "20" } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };

    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const [data, total] = await Promise.all([
      Package.find(query).skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      Package.countDocuments(query),
    ]);
    res.json({ data: data.map(fmt), total, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id).lean();
    if (!pkg) return res.status(404).json({ error: "Not found" });
    res.json(fmt(pkg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json(fmt(pkg.toObject()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!pkg) return res.status(404).json({ error: "Not found" });
    res.json(fmt(pkg));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.json({ message: "Package deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
