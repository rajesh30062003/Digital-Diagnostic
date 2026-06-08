import { Router } from "express";
import { Appointment, Doctor } from "../models/index.js";
import { User } from "../models/User.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const { userId, doctorId, status, page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page), limitNum = parseInt(limit);

    const query = {};
    if (req.user.role === "patient") query.userId = req.user.id;
    else if (userId) query.userId = userId;
    if (doctorId) query.doctorId = doctorId;
    if (status) query.status = status;

    const [appointments, total] = await Promise.all([
      Appointment.find(query).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ createdAt: -1 }).lean(),
      Appointment.countDocuments(query),
    ]);

    // Populate patient and doctor names
    const userIds = [...new Set(appointments.map(a => a.userId.toString()))];
    const docIds = [...new Set(appointments.map(a => a.doctorId.toString()))];
    const [users, doctors] = await Promise.all([
      User.find({ _id: { $in: userIds } }).lean(),
      Doctor.find({ _id: { $in: docIds } }).lean(),
    ]);
    const docUserIds = [...new Set(doctors.map(d => d.userId.toString()))];
    const docUsers = await User.find({ _id: { $in: docUserIds } }).lean();

    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u.name]));
    const docUserMap = Object.fromEntries(docUsers.map(u => [u._id.toString(), u.name]));
    const doctorMap = Object.fromEntries(doctors.map(d => [d._id.toString(), { spec: d.specialization, name: docUserMap[d.userId.toString()] }]));

    const data = appointments.map(a => ({
      ...a, id: a._id,
      patientName: userMap[a.userId.toString()],
      doctorName: doctorMap[a.doctorId.toString()]?.name || doctorMap[a.doctorId.toString()]?.spec,
    }));
    res.json({ data, total, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, notes } = req.body;
    const doctor = await Doctor.findById(doctorId).lean();
    const appt = await Appointment.create({
      userId: req.user.id, doctorId, appointmentDate: new Date(appointmentDate),
      timeSlot, notes, consultationFee: doctor?.consultationFee
    });
    res.status(201).json({ ...appt.toObject(), id: appt._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id).lean();
    if (!appt) return res.status(404).json({ error: "Not found" });
    res.json({ ...appt, id: appt._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", authenticate, async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!appt) return res.status(404).json({ error: "Not found" });
    res.json({ ...appt, id: appt._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
