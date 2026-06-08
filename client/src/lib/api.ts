const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

function getToken() {
  return localStorage.getItem("dd_token");
}

async function request(method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) => request("POST", "/auth/login", data),
  register: (data: unknown) => request("POST", "/auth/register", data),
  forgotPassword: (data: { email: string }) => request("POST", "/auth/forgot-password", data),
  verifyOtp: (data: { email: string; otp: string; newPassword: string }) => request("POST", "/auth/verify-otp", data),
  getMe: () => request("GET", "/auth/me"),

  // Tests
  getTests: (params?: Record<string, unknown>) => request("GET", `/tests?${new URLSearchParams(params as Record<string, string>).toString()}`),
  getPopularTests: () => request("GET", "/tests/popular"),
  getTest: (id: string) => request("GET", `/tests/${id}`),
  createTest: (data: unknown) => request("POST", "/tests", data),
  updateTest: (id: string | number, data: unknown) => request("PATCH", `/tests/${id}`, data),
  deleteTest: (id: string | number) => request("DELETE", `/tests/${id}`),

  // Packages
  getPackages: (params?: Record<string, unknown>) => request("GET", `/packages?${new URLSearchParams(params as Record<string, string>).toString()}`),
  getPackage: (id: string) => request("GET", `/packages/${id}`),
  createPackage: (data: unknown) => request("POST", "/packages", data),
  updatePackage: (id: string | number, data: unknown) => request("PATCH", `/packages/${id}`, data),
  deletePackage: (id: string | number) => request("DELETE", `/packages/${id}`),

  // Doctors
  getDoctors: (params?: Record<string, unknown>) => request("GET", `/doctors?${new URLSearchParams(params as Record<string, string>).toString()}`),
  getDoctor: (id: string) => request("GET", `/doctors/${id}`),
  createDoctor: (data: unknown) => request("POST", "/doctors", data),
  updateDoctor: (id: string | number, data: unknown) => request("PATCH", `/doctors/${id}`, data),
  deleteDoctor: (id: string | number) => request("DELETE", `/doctors/${id}`),

  // Bookings
  getBookings: (params?: Record<string, unknown>) => request("GET", `/bookings?${new URLSearchParams(params as Record<string, string>).toString()}`),
  createBooking: (data: unknown) => request("POST", "/bookings", data),
  getBooking: (id: string | number) => request("GET", `/bookings/${id}`),
  updateBooking: (id: string | number, data: unknown) => request("PATCH", `/bookings/${id}`, data),

  // Appointments
  getAppointments: (params?: Record<string, unknown>) => request("GET", `/appointments?${new URLSearchParams(params as Record<string, string>).toString()}`),
  createAppointment: (data: unknown) => request("POST", "/appointments", data),
  updateAppointment: (id: string | number, data: unknown) => request("PATCH", `/appointments/${id}`, data),

  // Payments
  getPayments: (params?: Record<string, unknown>) => request("GET", `/payments?${new URLSearchParams(params as Record<string, string>).toString()}`),
  createOrder: (data: unknown) => request("POST", "/payments/create-order", data),
  verifyPayment: (data: unknown) => request("POST", "/payments/verify", data),

  // Reports
  getReports: (params?: Record<string, unknown>) => request("GET", `/reports?${new URLSearchParams(params as Record<string, string>).toString()}`),
  createReport: (data: unknown) => request("POST", "/reports", data),

  // Users
  getUsers: (params?: Record<string, unknown>) => request("GET", `/users?${new URLSearchParams(params as Record<string, string>).toString()}`),
  getUser: (id: string | number) => request("GET", `/users/${id}`),
  updateUser: (id: string | number, data: unknown) => request("PATCH", `/users/${id}`, data),
  deleteUser: (id: string | number) => request("DELETE", `/users/${id}`),

  // Services
  getServices: () => request("GET", "/services"),
  createService: (data: unknown) => request("POST", "/services", data),
  updateService: (id: string | number, data: unknown) => request("PATCH", `/services/${id}`, data),
  deleteService: (id: string | number) => request("DELETE", `/services/${id}`),

  // Centers
  getCenters: () => request("GET", "/centers"),

  // Dashboard
  getAdminStats: () => request("GET", "/dashboard/admin-stats"),
  getPatientStats: () => request("GET", "/dashboard/patient-stats"),
  getDoctorStats: () => request("GET", "/dashboard/doctor-stats"),
  getRevenueChart: () => request("GET", "/dashboard/revenue-chart"),
  getRecentActivity: () => request("GET", "/dashboard/recent-activity"),

  // Notifications
  getNotifications: (params?: Record<string, unknown>) => request("GET", `/notifications?${new URLSearchParams(params as Record<string, string>).toString()}`),

  // Contacts
  createContact: (data: unknown) => request("POST", "/contacts", data),
};
