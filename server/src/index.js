import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRouter from "./routes/auth.js";
import testsRouter from "./routes/tests.js";
import packagesRouter from "./routes/packages.js";
import doctorsRouter from "./routes/doctors.js";
import bookingsRouter from "./routes/bookings.js";
import appointmentsRouter from "./routes/appointments.js";
import paymentsRouter from "./routes/payments.js";
import reportsRouter from "./routes/reports.js";
import usersRouter from "./routes/users.js";
import servicesRouter from "./routes/services.js";
import centersRouter from "./routes/centers.js";
import notificationsRouter from "./routes/notifications.js";
import contactsRouter from "./routes/contacts.js";
import dashboardRouter from "./routes/dashboard.js";
import doctorSlotsRouter from "./routes/doctor-slots.js";

const app = express();
const PORT = process.env.PORT || 10000;

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/digital-diagnostic";

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// CORS
const allowedOrigins = [
  "https://digital-diagnostic.vercel.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    console.log("Origin:", origin);

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get("/", (req, res) => {
  res.status(200).send("Digital Diagnostic API Running");
});

// Health route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// CORS test route
app.get("/api/cors-test", (req, res) => {
  res.status(200).json({
    success: true,
    origin: req.headers.origin || null,
  });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/tests", testsRouter);
app.use("/api/packages", packagesRouter);
app.use("/api/doctors", doctorsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/users", usersRouter);
app.use("/api/services", servicesRouter);
app.use("/api/centers", centersRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/doctor-slots", doctorSlotsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// MongoDB connection
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });