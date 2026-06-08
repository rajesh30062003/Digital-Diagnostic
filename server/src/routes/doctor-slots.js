import { Router } from "express";
import { Appointment } from "../models/index.js";

const router = Router();

const ALL_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

router.get("/", async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) return res.status(400).json({ error: "doctorId and date required" });

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const booked = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: start, $lte: end },
      status: { $ne: "cancelled" },
    }).lean();

    const bookedSlots = new Set(booked.map(a => a.timeSlot));
    const slots = ALL_SLOTS.map(s => ({ slot: s, available: !bookedSlots.has(s) }));
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
