import { Router } from "express";
import { Test } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { category, search, page = "1", limit = "20" } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: "i" };

    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const [data, total] = await Promise.all([
      Test.find(query).skip(skip).limit(limitNum).lean(),
      Test.countDocuments(query),
    ]);
    res.json({ data: data.map(t => ({ ...t, id: t._id })), total, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/popular", async (req, res) => {
  try {
    const data = await Test.find({ isPopular: true, isActive: true }).limit(8).lean();
    res.json(data.map(t => ({ ...t, id: t._id })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).lean();
    if (!test) return res.status(404).json({ error: "Not found" });
    res.json({ ...test, id: test._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { name, category, description, price, originalPrice, turnaroundTime, preparation, isPopular } = req.body;
    const test = await Test.create({ name, category, description, price, originalPrice, turnaroundTime, preparation, isPopular: isPopular ?? false });
    res.status(201).json({ ...test.toObject(), id: test._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!test) return res.status(404).json({ error: "Not found" });
    res.json({ ...test, id: test._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.json({ message: "Test deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
