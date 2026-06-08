import { Router } from "express";
import { Booking } from "../models/index.js";
import { User } from "../models/User.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const { userId, status, page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page), limitNum = parseInt(limit);

    const query = {};
    if (req.user.role === "patient") query.userId = req.user.id;
    else if (userId) query.userId = userId;
    if (status) query.status = status;

    const [bookings, total] = await Promise.all([
      Booking.find(query).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ createdAt: -1 }).lean(),
      Booking.countDocuments(query),
    ]);

    // Populate patient names
    const userIds = [...new Set(bookings.map(b => b.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).lean();
    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u.name]));

    const data = bookings.map(b => ({ ...b, id: b._id, patientName: userMap[b.userId.toString()] }));
    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { type, itemId, amount, collectionType, scheduledDate, address, centerId, itemName } = req.body;
    const booking = await Booking.create({
      userId: req.user.id, type, itemId, itemName: itemName || "Booking",
      amount, collectionType, scheduledDate: new Date(scheduledDate), address, centerId
    });
    res.status(201).json({ ...booking.toObject(), id: booking._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) return res.status(404).json({ error: "Not found" });
    res.json({ ...booking, id: booking._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", authenticate, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!booking) return res.status(404).json({ error: "Not found" });
    res.json({ ...booking, id: booking._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
