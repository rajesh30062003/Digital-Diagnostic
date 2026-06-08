import { Router } from "express";
import { User } from "../models/User.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

const safeUser = (u) => {
  const { password, otp, otpExpiry, __v, ...rest } = u;
  rest.id = rest._id;
  return rest;
};

router.get("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { role, page = "1", limit = "20", search } = req.query;
    const pageNum = parseInt(page), limitNum = parseInt(limit);
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

    const [users, total] = await Promise.all([
      User.find(query).select("-password -otp -otpExpiry -__v").skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
      User.countDocuments(query),
    ]);
    res.json({ data: users.map(u => ({ ...u, id: u._id })), total, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    if (req.user.role !== "admin" && req.user.id !== id)
      return res.status(403).json({ error: "Forbidden" });

    const user = await User.findById(id).select("-password -otp -otpExpiry -__v").lean();
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json({ ...user, id: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", authenticate, async (req, res) => {
  try {
    const id = req.params.id;
    if (req.user.role !== "admin" && req.user.id !== id)
      return res.status(403).json({ error: "Forbidden" });

    const { name, phone, address, avatar, isActive } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (avatar !== undefined) updates.avatar = avatar;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(id, updates, { new: true })
      .select("-password -otp -otpExpiry -__v").lean();
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json({ ...user, id: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
