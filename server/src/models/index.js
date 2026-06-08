import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    turnaroundTime: { type: String, required: true },
    preparation: { type: String },
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    testsIncluded: { type: [String], default: [] },
    turnaroundTime: { type: String, default: "24-48 hours" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    qualification: { type: String, required: true },
    location: { type: String },
    bio: { type: String },
    avatar: { type: String },
    consultationFee: { type: Number, required: true },
    rating: { type: Number },
    totalReviews: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // "test" | "package"
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemName: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: "pending" },
    collectionType: { type: String, default: "center" }, // "home" | "center"
    scheduledDate: { type: Date, required: true },
    address: { type: String },
    centerId: { type: mongoose.Schema.Types.ObjectId, ref: "Center" },
  },
  { timestamps: true }
);

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, default: "pending" },
    notes: { type: String },
    consultationFee: { type: Number },
  },
  { timestamps: true }
);

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, default: "pending" },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    reportName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const centerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    phone: { type: String, required: true },
    email: { type: String },
    workingHours: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "general" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: "new" },
  },
  { timestamps: true }
);

export const Test = mongoose.model("Test", testSchema);
export const Package = mongoose.model("Package", packageSchema);
export const Doctor = mongoose.model("Doctor", doctorSchema);
export const Booking = mongoose.model("Booking", bookingSchema);
export const Appointment = mongoose.model("Appointment", appointmentSchema);
export const Payment = mongoose.model("Payment", paymentSchema);
export const Report = mongoose.model("Report", reportSchema);
export const Service = mongoose.model("Service", serviceSchema);
export const Center = mongoose.model("Center", centerSchema);
export const Notification = mongoose.model("Notification", notificationSchema);
export const Contact = mongoose.model("Contact", contactSchema);
