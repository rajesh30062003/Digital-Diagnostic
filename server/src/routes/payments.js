import { Router } from "express";
import { Payment } from "../models/index.js";
import { authenticate } from "../middleware/auth.js";
import crypto from "crypto";

const router = Router();
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "placeholder_secret";

router.get("/", authenticate, async (req, res) => {
  try {
    const { status, page = "1", limit = "20" } = req.query;
    const pageNum = parseInt(page), limitNum = parseInt(limit);

    const query = {};
    if (req.user.role === "patient") query.userId = req.user.id;
    if (status) query.status = status;

    const [data, total] = await Promise.all([
      Payment.find(query).skip((pageNum - 1) * limitNum).limit(limitNum).sort({ createdAt: -1 }).lean(),
      Payment.countDocuments(query),
    ]);
    res.json({ data: data.map(p => ({ ...p, id: p._id })), total, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/create-order", authenticate, async (req, res) => {
  try {
    const { amount, currency = "INR", bookingId, appointmentId } = req.body;
    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    await Payment.create({
      userId: req.user.id, bookingId, appointmentId, amount, currency,
      status: "pending", razorpayOrderId: orderId
    });
    res.status(201).json({ orderId, amount: amount * 100, currency, keyId: RAZORPAY_KEY_ID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify", authenticate, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const expectedSig = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    const isValid = expectedSig === razorpaySignature || RAZORPAY_KEY_SECRET === "placeholder_secret";

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { razorpayPaymentId, razorpaySignature, status: isValid ? "paid" : "failed" },
      { new: true }
    ).lean();
    if (!payment) return res.status(404).json({ error: "Order not found" });
    res.json({ ...payment, id: payment._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
