import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { authenticate, generateToken } from "../middleware/auth.js";

const router = Router();

const safeUser = (u) => {
  const obj = u.toObject ? u.toObject() : { ...u };
  const { password, otp, otpExpiry, __v, ...rest } = obj;
  rest.id = rest._id;
  return rest;
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "name, email, password required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const validRole = ["patient", "doctor", "admin"].includes(role) ? role : "patient";
    const user = await User.create({ name, email, password: hashed, phone, role: validRole });

    const token = generateToken({ id: user._id.toString(), role: user.role, email: user.email });
    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken({ id: user._id.toString(), role: user.role, email: user.email });
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(safeUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await User.findByIdAndUpdate(user._id, { otp, otpExpiry });
    console.log("OTP for", email, ":", otp);
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date())
      return res.status(400).json({ error: "Invalid or expired OTP" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashed, otp: null, otpExpiry: null });

    const token = generateToken({ id: user._id.toString(), role: user.role, email: user.email });
    res.json({ token, user: safeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
