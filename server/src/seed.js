import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { Test, Package, Doctor, Service, Center } from "./models/index.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/digital-diagnostic";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Test.deleteMany({}),
    Package.deleteMany({}),
    Doctor.deleteMany({}),
    Service.deleteMany({}),
    Center.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  // Users
  const hash = (pw) => bcrypt.hash(pw, 10);
  const [adminPw, docPw, patPw] = await Promise.all([
    hash("password123"), hash("password123"), hash("password123"),
  ]);

  const admin = await User.create({
    name: "Admin User", email: "admin@techknife.com",
    password: adminPw, role: "admin", phone: "9999000001",
  });

  const doctorUsers = await User.insertMany([
    { name: "Dr. Priya Sharma", email: "priya.sharma@techknife.com", password: docPw, role: "doctor", phone: "9876543210" },
    { name: "Dr. Rajesh Gupta", email: "rajesh.gupta@techknife.com", password: docPw, role: "doctor", phone: "9876543211" },
    { name: "Dr. Anjali Mehta", email: "anjali.mehta@techknife.com", password: docPw, role: "doctor", phone: "9876543212" },
    { name: "Dr. Vikram Singh", email: "vikram.singh@techknife.com", password: docPw, role: "doctor", phone: "9876543213" },
    { name: "Dr. Sunita Patel", email: "sunita.patel@techknife.com", password: docPw, role: "doctor", phone: "9876543214" },
  ]);

  const patientUsers = await User.insertMany([
    { name: "Aditya Verma", email: "aditya.verma@gmail.com", password: patPw, role: "patient", phone: "9988776655", address: "123 MG Road, Bengaluru" },
    { name: "Pooja Nair", email: "pooja.nair@gmail.com", password: patPw, role: "patient", phone: "9988776644" },
    { name: "Rohit Kumar", email: "rohit.kumar@gmail.com", password: patPw, role: "patient", phone: "9988776633" },
  ]);

  console.log("Users created");

  // Doctors
  await Doctor.insertMany([
    { userId: doctorUsers[0]._id, specialization: "Cardiologist", experience: 12, qualification: "MBBS, MD Cardiology, DM", location: "Bengaluru", bio: "Dr. Priya Sharma is a leading cardiologist with 12 years of experience in treating complex cardiac conditions.", consultationFee: 800, rating: 4.8, totalReviews: 234, isAvailable: true },
    { userId: doctorUsers[1]._id, specialization: "Neurologist", experience: 15, qualification: "MBBS, MD Neurology, DM", location: "Mumbai", bio: "Dr. Rajesh Gupta specialises in neurological disorders with over 15 years of clinical expertise.", consultationFee: 1000, rating: 4.7, totalReviews: 189, isAvailable: true },
    { userId: doctorUsers[2]._id, specialization: "Gynecologist", experience: 10, qualification: "MBBS, MS Obstetrics & Gynecology", location: "Delhi", bio: "Dr. Anjali Mehta is dedicated to women's health, providing compassionate care for all life stages.", consultationFee: 700, rating: 4.9, totalReviews: 312, isAvailable: true },
    { userId: doctorUsers[3]._id, specialization: "Orthopedician", experience: 14, qualification: "MBBS, MS Orthopedics, DNB", location: "Hyderabad", bio: "Dr. Vikram Singh is a renowned orthopaedic surgeon with expertise in joint replacement and sports injuries.", consultationFee: 900, rating: 4.6, totalReviews: 156, isAvailable: true },
    { userId: doctorUsers[4]._id, specialization: "Dermatologist", experience: 8, qualification: "MBBS, MD Dermatology", location: "Chennai", bio: "Dr. Sunita Patel specialises in skin, hair, and nail conditions with a focus on cosmetic dermatology.", consultationFee: 600, rating: 4.5, totalReviews: 278, isAvailable: true },
  ]);
  console.log("Doctors created");

  // Tests (20 tests)
  await Test.insertMany([
    { name: "Complete Blood Count (CBC)", category: "Haematology", description: "Measures the different components of blood including red blood cells, white blood cells, and platelets.", price: 350, originalPrice: 500, turnaroundTime: "4-6 hours", preparation: "No special preparation required.", isPopular: true },
    { name: "Blood Sugar Fasting", category: "Biochemistry", description: "Measures blood glucose levels after an overnight fast. Used to diagnose diabetes and prediabetes.", price: 80, originalPrice: 120, turnaroundTime: "2-4 hours", preparation: "8-12 hours fasting required.", isPopular: true },
    { name: "HbA1c (Glycated Haemoglobin)", category: "Biochemistry", description: "Reflects average blood sugar levels over the past 2-3 months. Key test for diabetes management.", price: 450, originalPrice: 600, turnaroundTime: "6-8 hours", preparation: "No fasting required.", isPopular: true },
    { name: "Lipid Profile", category: "Biochemistry", description: "Measures cholesterol and triglycerides to assess cardiovascular risk.", price: 500, originalPrice: 700, turnaroundTime: "4-6 hours", preparation: "12 hours fasting required.", isPopular: true },
    { name: "Thyroid Profile (T3, T4, TSH)", category: "Endocrinology", description: "Evaluates thyroid gland function by measuring key thyroid hormones.", price: 600, originalPrice: 850, turnaroundTime: "6-8 hours", preparation: "No special preparation required.", isPopular: true },
    { name: "Liver Function Test (LFT)", category: "Biochemistry", description: "Assesses the health of the liver by measuring enzymes, proteins, and bilirubin.", price: 550, originalPrice: 750, turnaroundTime: "4-6 hours", preparation: "8 hours fasting preferred.", isPopular: true },
    { name: "Kidney Function Test (KFT)", category: "Biochemistry", description: "Evaluates kidney health through creatinine, urea, and electrolyte measurements.", price: 550, originalPrice: 750, turnaroundTime: "4-6 hours", preparation: "No special preparation required.", isPopular: false },
    { name: "Urine Routine Examination", category: "Microbiology", description: "Analyzes urine for various components to detect kidney, liver, and metabolic disorders.", price: 150, originalPrice: 200, turnaroundTime: "2-4 hours", preparation: "First-morning urine sample preferred.", isPopular: false },
    { name: "COVID-19 RT-PCR Test", category: "Virology", description: "Detects the presence of SARS-CoV-2 RNA in respiratory samples.", price: 700, originalPrice: 900, turnaroundTime: "24-48 hours", preparation: "Avoid eating, drinking, or smoking 30 minutes before the test.", isPopular: false },
    { name: "Vitamin D3 (25-OH)", category: "Endocrinology", description: "Measures the amount of vitamin D in the blood to assess deficiency.", price: 800, originalPrice: 1100, turnaroundTime: "6-8 hours", preparation: "No fasting required.", isPopular: true },
    { name: "Vitamin B12", category: "Haematology", description: "Measures vitamin B12 levels to diagnose deficiency affecting nerve and blood cell health.", price: 700, originalPrice: 950, turnaroundTime: "6-8 hours", preparation: "No special preparation required.", isPopular: false },
    { name: "Iron Studies (Serum Iron, TIBC, Ferritin)", category: "Haematology", description: "Comprehensive panel to evaluate iron metabolism and diagnose anaemia.", price: 900, originalPrice: 1200, turnaroundTime: "6-8 hours", preparation: "8-12 hours fasting recommended.", isPopular: false },
    { name: "ESR (Erythrocyte Sedimentation Rate)", category: "Haematology", description: "Non-specific marker of inflammation used to monitor inflammatory conditions.", price: 100, originalPrice: 150, turnaroundTime: "2-4 hours", preparation: "No special preparation required.", isPopular: false },
    { name: "PSA (Prostate-Specific Antigen)", category: "Oncology", description: "Screens for prostate cancer and monitors treatment response.", price: 800, originalPrice: 1100, turnaroundTime: "6-8 hours", preparation: "No special preparation required.", isPopular: false },
    { name: "Dengue NS1 Antigen + IgM/IgG", category: "Serology", description: "Comprehensive dengue fever diagnostic panel for early and late detection.", price: 1200, originalPrice: 1600, turnaroundTime: "4-6 hours", preparation: "No special preparation required.", isPopular: false },
    { name: "Malaria Antigen Test (Rapid)", category: "Microbiology", description: "Rapid detection of Plasmodium falciparum and vivax antigens in blood.", price: 350, originalPrice: 500, turnaroundTime: "1-2 hours", preparation: "No special preparation required.", isPopular: false },
    { name: "CRP (C-Reactive Protein) - hs", category: "Biochemistry", description: "Highly sensitive test for detecting low-grade inflammation and cardiovascular risk.", price: 500, originalPrice: 700, turnaroundTime: "4-6 hours", preparation: "No special preparation required.", isPopular: false },
    { name: "Serum Calcium", category: "Biochemistry", description: "Measures calcium levels to assess bone health, kidney function, and hormonal disorders.", price: 200, originalPrice: 300, turnaroundTime: "2-4 hours", preparation: "No fasting required.", isPopular: false },
    { name: "ECG (Electrocardiogram)", category: "Cardiology", description: "Records electrical activity of the heart to diagnose arrhythmias and cardiac events.", price: 300, originalPrice: 450, turnaroundTime: "Immediate", preparation: "No special preparation required.", isPopular: true },
    { name: "2D Echo (Echocardiogram)", category: "Cardiology", description: "Ultrasound imaging of the heart to evaluate cardiac structure and function.", price: 2500, originalPrice: 3500, turnaroundTime: "Same day", preparation: "No special preparation required.", isPopular: false },
  ]);
  console.log("Tests created");

  // Packages (8 packages)
  await Package.insertMany([
    { name: "Basic Health Checkup", category: "Preventive Care", description: "Essential health screening for a quick overview of your overall health status.", price: 799, originalPrice: 1400, testsIncluded: ["Complete Blood Count (CBC)", "Blood Sugar Fasting", "Urine Routine Examination", "ESR"], turnaroundTime: "24 hours" },
    { name: "Comprehensive Health Checkup", category: "Preventive Care", description: "A thorough health assessment covering all major organ systems.", price: 1999, originalPrice: 3500, testsIncluded: ["Complete Blood Count (CBC)", "Lipid Profile", "Liver Function Test (LFT)", "Kidney Function Test (KFT)", "Thyroid Profile (T3, T4, TSH)", "HbA1c", "Blood Sugar Fasting", "Urine Routine Examination"], turnaroundTime: "24-48 hours" },
    { name: "Diabetes Care Package", category: "Disease Management", description: "Complete diabetes monitoring and management panel.", price: 999, originalPrice: 1800, testsIncluded: ["Blood Sugar Fasting", "HbA1c (Glycated Haemoglobin)", "Kidney Function Test (KFT)", "Lipid Profile", "Urine Routine Examination"], turnaroundTime: "24 hours" },
    { name: "Heart Health Package", category: "Cardiology", description: "Comprehensive cardiac risk assessment and monitoring.", price: 1499, originalPrice: 2600, testsIncluded: ["Lipid Profile", "ECG (Electrocardiogram)", "CRP (C-Reactive Protein) - hs", "Blood Sugar Fasting", "Complete Blood Count (CBC)"], turnaroundTime: "24 hours" },
    { name: "Women's Wellness Package", category: "Women's Health", description: "Tailored health screening for women covering hormonal and reproductive health.", price: 2499, originalPrice: 4200, testsIncluded: ["Complete Blood Count (CBC)", "Thyroid Profile (T3, T4, TSH)", "Vitamin D3 (25-OH)", "Vitamin B12", "Iron Studies", "Serum Calcium", "Blood Sugar Fasting", "Urine Routine Examination"], turnaroundTime: "24-48 hours" },
    { name: "Senior Citizen Package", category: "Geriatrics", description: "Designed for adults above 60 to monitor age-related health changes.", price: 2999, originalPrice: 5200, testsIncluded: ["Complete Blood Count (CBC)", "Lipid Profile", "Liver Function Test (LFT)", "Kidney Function Test (KFT)", "Thyroid Profile (T3, T4, TSH)", "Vitamin D3 (25-OH)", "Vitamin B12", "2D Echo (Echocardiogram)", "PSA (for men)", "ECG"], turnaroundTime: "24-48 hours" },
    { name: "Fever & Infection Panel", category: "Infectious Diseases", description: "Quick assessment for common fever-causing infections in India.", price: 1299, originalPrice: 2200, testsIncluded: ["Complete Blood Count (CBC)", "Dengue NS1 Antigen + IgM/IgG", "Malaria Antigen Test", "CRP", "ESR"], turnaroundTime: "12-24 hours" },
    { name: "Liver & Kidney Wellness", category: "Organ Health", description: "Detailed evaluation of two of the body's most vital detox organs.", price: 1099, originalPrice: 1900, testsIncluded: ["Liver Function Test (LFT)", "Kidney Function Test (KFT)", "Serum Calcium", "Urine Routine Examination"], turnaroundTime: "24 hours" },
  ]);
  console.log("Packages created");

  // Services (12 services)
  await Service.insertMany([
    { name: "Home Sample Collection", icon: "Home", description: "Certified phlebotomists collect samples at your doorstep, 7 days a week, 7 AM – 8 PM." },
    { name: "Online Report Delivery", icon: "FileText", description: "Receive your secure, digitally signed reports via email and the patient portal within the promised turnaround time." },
    { name: "Doctor Consultation", icon: "Stethoscope", description: "Book online or in-person consultations with our panel of 200+ specialist doctors." },
    { name: "Pre-Employment Health Check", icon: "Briefcase", description: "Comprehensive pre-employment medical packages tailored to corporate requirements." },
    { name: "Annual Health Packages", icon: "CalendarCheck", description: "Customised yearly wellness packages with priority appointments and dedicated health managers." },
    { name: "Radiology & Imaging", icon: "Scan", description: "Advanced imaging services including X-Ray, Ultrasound, MRI, and CT Scan at all major centres." },
    { name: "Cardiology Services", icon: "Heart", description: "ECG, 2D Echo, Stress Test, Holter Monitoring, and full cardiovascular risk assessments." },
    { name: "Women's Health Programme", icon: "Baby", description: "Complete reproductive and hormonal health services, maternity profiles, and pelvic ultrasounds." },
    { name: "Paediatric Diagnostics", icon: "Users", description: "Child-friendly diagnostic services with paediatric phlebotomists and rapid turnaround." },
    { name: "Corporate Wellness Programme", icon: "Building", description: "On-site health camps, bulk testing, executive health checks, and health analytics for organisations." },
    { name: "Vaccination Services", icon: "Syringe", description: "Childhood and adult vaccination schedules administered by trained nurses at our centres." },
    { name: "Diet & Nutrition Consultation", icon: "Apple", description: "Personalised nutrition counselling based on your diagnostic reports to help manage chronic conditions." },
  ]);
  console.log("Services created");

  // Centers (5 centers)
  await Center.insertMany([
    { name: "Tech Knife Diagnostics – Bengaluru Central", address: "12, Brigade Road, Near MG Road Metro", city: "Bengaluru", state: "Karnataka", phone: "080-41234567", email: "blr@techknife.com", workingHours: "6:00 AM – 9:00 PM (Mon–Sun)", latitude: 12.9716, longitude: 77.5946 },
    { name: "Tech Knife Diagnostics – Mumbai Andheri", address: "Plot 45, Andheri-Kurla Road, MIDC", city: "Mumbai", state: "Maharashtra", phone: "022-61234567", email: "mum@techknife.com", workingHours: "6:00 AM – 9:00 PM (Mon–Sun)", latitude: 19.1136, longitude: 72.8697 },
    { name: "Tech Knife Diagnostics – Delhi Saket", address: "C-Block, Saket District Centre, Near Select Citywalk", city: "New Delhi", state: "Delhi", phone: "011-41234567", email: "del@techknife.com", workingHours: "6:00 AM – 9:00 PM (Mon–Sun)", latitude: 28.5244, longitude: 77.2167 },
    { name: "Tech Knife Diagnostics – Hyderabad Hitech City", address: "Building 7, Cyber Gateway, Hitech City", city: "Hyderabad", state: "Telangana", phone: "040-61234567", email: "hyd@techknife.com", workingHours: "6:00 AM – 9:00 PM (Mon–Sun)", latitude: 17.4506, longitude: 78.3810 },
    { name: "Tech Knife Diagnostics – Chennai Anna Nagar", address: "Plot 23, 2nd Avenue, Anna Nagar West", city: "Chennai", state: "Tamil Nadu", phone: "044-61234567", email: "che@techknife.com", workingHours: "6:00 AM – 9:00 PM (Mon–Sun)", latitude: 13.0827, longitude: 80.2707 },
  ]);
  console.log("Centers created");

  console.log("\n✅ Seed completed!\n");
  console.log("Login credentials (password: password123):");
  console.log("  Admin:   admin@techknife.com");
  console.log("  Doctor:  priya.sharma@techknife.com");
  console.log("  Patient: aditya.verma@gmail.com");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
