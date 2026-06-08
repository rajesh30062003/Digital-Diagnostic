import { Router } from "express";
import { Doctor } from "../models/index.js";
import { User } from "../models/User.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

const populateDoctor = async (doc) => {
  const user = await User.findById(doc.userId).lean();
  return { ...doc, id: doc._id, name: user?.name };
};

router.get("/", async (req, res) => {
  try {
    const { specialization, search, page = "1", limit = "20" } = req.query;
    const query = {};
    if (specialization) query.specialization = specialization;

    const pageNum = parseInt(page), limitNum = parseInt(limit);
    let doctors = await Doctor.find(query).skip((pageNum - 1) * limitNum).limit(limitNum).lean();

    // Populate names
    const userIds = [...new Set(doctors.map(d => d.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u.name]));

    let data = doctors.map(d => ({ ...d, id: d._id, name: userMap[d.userId.toString()] }));
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(d => d.name?.toLowerCase().includes(s) || d.specialization.toLowerCase().includes(s));
    }

    const total = await Doctor.countDocuments(query);
    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const doc = await Doctor.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    const user = await User.findById(doc.userId).lean();
    res.json({ ...doc, id: doc._id, name: user?.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const doc = await Doctor.create(req.body);
    const user = await User.findById(doc.userId).lean();
    res.status(201).json({ ...doc.toObject(), id: doc._id, name: user?.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", authenticate, async (req, res) => {
  try {
    const doc = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    const user = await User.findById(doc.userId).lean();
    res.json({ ...doc, id: doc._id, name: user?.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: "Doctor deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
