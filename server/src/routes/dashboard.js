import { Router } from "express";
import { User } from "../models/User.js";
import { Doctor, Booking, Appointment, Report, Payment, Contact } from "../models/index.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/admin-stats", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const [
      totalUsers, totalDoctors, totalBookings, totalAppointments,
      totalReports, newContacts, pendingBookings, paidPayments, allBookings
    ] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Booking.countDocuments(),
      Appointment.countDocuments(),
      Report.countDocuments(),
      Contact.countDocuments({ status: "new" }),
      Booking.countDocuments({ status: "pending" }),
      Payment.find({ status: "paid" }).lean(),
      Booking.find().lean(),
    ]);

    const totalRevenue = paidPayments.reduce((s, p) => s + p.amount, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayBookings = allBookings.filter(b => new Date(b.createdAt) >= today).length;

    res.json({
      totalUsers, totalDoctors, totalBookings, totalAppointments,
      totalRevenue, totalReports, pendingBookings, todayBookings, newContacts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/patient-stats", authenticate, async (req, res) => {
  try {
    const uid = req.user.id;
    const [bookings, appointments, reports, payments] = await Promise.all([
      Booking.find({ userId: uid }).lean(),
      Appointment.find({ userId: uid }).lean(),
      Report.find({ userId: uid }).lean(),
      Payment.find({ userId: uid }).lean(),
    ]);

    const totalSpent = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
    const pendingBookings = bookings.filter(b => b.status === "pending").length;
    const upcomingAppointments = appointments.filter(a => ["pending", "confirmed"].includes(a.status)).length;

    res.json({
      totalBookings: bookings.length, totalAppointments: appointments.length,
      totalReports: reports.length, totalSpent, pendingBookings, upcomingAppointments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/doctor-stats", authenticate, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id }).lean();
    if (!doctor) return res.json({ totalAppointments: 0, todayAppointments: 0, pendingAppointments: 0, completedAppointments: 0, totalPatients: 0 });

    const appointments = await Appointment.find({ doctorId: doctor._id }).lean();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayAppointments = appointments.filter(a => new Date(a.appointmentDate) >= today).length;
    const pendingAppointments = appointments.filter(a => a.status === "pending").length;
    const completedAppointments = appointments.filter(a => a.status === "completed").length;
    const totalPatients = new Set(appointments.map(a => a.userId.toString())).size;

    res.json({ totalAppointments: appointments.length, todayAppointments, pendingAppointments, completedAppointments, totalPatients });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/revenue-chart", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const now = new Date();
    const [payments, bookings] = await Promise.all([
      Payment.find({ status: "paid" }).lean(),
      Booking.find().lean(),
    ]);

    const data = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const month = months[d.getMonth()];
      const revenue = payments.filter(p => {
        const pd = new Date(p.createdAt);
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
      }).reduce((s, p) => s + p.amount, 0);
      const bk = bookings.filter(b => {
        const bd = new Date(b.createdAt);
        return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
      }).length;
      return { month, revenue, bookings: bk };
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/recent-activity", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const [recentBookings, recentAppts] = await Promise.all([
      Booking.find().sort({ createdAt: -1 }).limit(5).lean(),
      Appointment.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const activity = [
      ...recentBookings.map(b => ({ id: b._id, type: "booking", message: `New ${b.type} booking: ${b.itemName}`, time: b.createdAt })),
      ...recentAppts.map(a => ({ id: a._id, type: "appointment", message: `Appointment #${a._id.toString().slice(-6)} ${a.status}`, time: a.createdAt })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
