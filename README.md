# Digital Diagnostic – Tech Knife

A full-stack healthcare diagnostics platform built with **MongoDB + Express + React (Vite)**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Clone and install
```bash
npm install           # installs concurrently at root
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
# Edit server/.env and set MONGODB_URI, JWT_SECRET, etc.
```

### 3. Seed the database
```bash
npm run seed
```

### 4. Start in development mode
```bash
npm run dev
# Server → http://localhost:8080
# Client → http://localhost:5173
```

---

## 🔐 Demo Login Credentials
| Role    | Email                         | Password     |
|---------|-------------------------------|--------------|
| Admin   | admin@techknife.com           | password123  |
| Doctor  | priya.sharma@techknife.com    | password123  |
| Patient | aditya.verma@gmail.com        | password123  |

---

## 🏗 Architecture

```
digital-diagnostic/
├── server/                  # Express + MongoDB backend
│   ├── src/
│   │   ├── index.js         # Entry point
│   │   ├── seed.js          # Database seeder
│   │   ├── middleware/
│   │   │   └── auth.js      # JWT middleware
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── index.js     # All other models
│   │   └── routes/          # 14 route files
│   └── .env.example
│
└── client/                  # React + Vite frontend
    └── src/
        ├── App.tsx           # Router + all routes
        ├── lib/
        │   ├── api.ts        # All API calls
        │   └── utils.ts
        ├── hooks/
        │   ├── use-auth.ts   # Zustand auth store
        │   └── use-toast.ts
        ├── components/
        │   ├── Navbar.tsx
        │   ├── Footer.tsx
        │   ├── ProtectedRoute.tsx
        │   └── layout/
        │       ├── PublicLayout.tsx
        │       └── DashboardLayout.tsx
        └── pages/
            ├── auth/         # Login, Register, ForgotPassword
            ├── public/       # Home, Tests, Packages, Doctors, etc.
            ├── patient/      # Dashboard, Book, Bookings, Reports, etc.
            ├── doctor/       # Dashboard, Appointments, Profile
            └── admin/        # Dashboard, Users, Tests, Packages, etc.
```

---

## 📦 Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Database | MongoDB + Mongoose                        |
| Backend  | Express 4, JWT, bcryptjs                  |
| Frontend | React 18, Vite, TypeScript, Wouter        |
| UI       | Tailwind CSS, shadcn/ui, Recharts         |
| State    | TanStack Query, Zustand                   |
| Payments | Razorpay (set keys in .env)               |

---

## 🌐 API Endpoints (all prefixed `/api`)

- `POST /auth/register|login|forgot-password|verify-otp`
- `GET /auth/me`
- `GET|POST|PATCH|DELETE /tests`
- `GET|POST|PATCH|DELETE /packages`
- `GET|POST|PATCH|DELETE /doctors`
- `GET|POST|PATCH /bookings`
- `GET|POST|PATCH /appointments`
- `GET|POST /payments` + `/payments/create-order` + `/payments/verify`
- `GET|POST|DELETE /reports`
- `GET|PATCH|DELETE /users`
- `GET|POST|PATCH|DELETE /services`
- `GET|POST|PATCH|DELETE /centers`
- `GET|PATCH /notifications`
- `GET|POST|PATCH /contacts`
- `GET /dashboard/admin-stats|patient-stats|doctor-stats|revenue-chart|recent-activity`
- `GET /doctor-slots`
