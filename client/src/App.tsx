import React from "react";
import { Route, Switch, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/hooks/use-auth";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";

// Public pages
import Home from "@/pages/public/Home";
import Tests from "@/pages/public/Tests";
import TestDetail from "@/pages/public/TestDetail";
import Packages from "@/pages/public/Packages";
import PackageDetail from "@/pages/public/PackageDetail";
import Doctors from "@/pages/public/Doctors";
import DoctorDetail from "@/pages/public/DoctorDetail";
import { Services, Centers, Contact, About, Terms, Privacy } from "@/pages/public/StaticPages";

// Patient pages
import PatientDashboard from "@/pages/patient/Dashboard";
import BookTest from "@/pages/patient/Book";
import { Bookings, Appointments, Reports, Payments, Profile } from "@/pages/patient/PatientPages";

// Doctor pages
import { DoctorDashboard, DoctorAppointments, DoctorProfile } from "@/pages/doctor/DoctorPages";

// Admin pages
import {
  AdminDashboard, AdminUsers, AdminDoctors, AdminTests,
  AdminPackages, AdminServices, AdminBookings, AdminReports, AdminPayments
} from "@/pages/admin/AdminPages";

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 1000 * 30 } } });

function PatientRoute({ path, component: C }: { path: string; component: React.ComponentType }) {
  return (
    <ProtectedRoute path={path} component={() => (
      <DashboardLayout><C /></DashboardLayout>
    )} allowedRoles={["patient"]} />
  );
}
function DoctorRoute({ path, component: C }: { path: string; component: React.ComponentType }) {
  return (
    <ProtectedRoute path={path} component={() => (
      <DashboardLayout><C /></DashboardLayout>
    )} allowedRoles={["doctor"]} />
  );
}
function AdminRoute({ path, component: C }: { path: string; component: React.ComponentType }) {
  return (
    <ProtectedRoute path={path} component={() => (
      <DashboardLayout><C /></DashboardLayout>
    )} allowedRoles={["admin"]} />
  );
}

function PublicPage({ component: C }: { component: React.ComponentType<any>; params?: any }) {
  return <PublicLayout><C /></PublicLayout>;
}

export default function App() {
  const { token, role } = useAuthStore();

  return (
    <QueryClientProvider client={qc}>
      <Switch>
        {/* Auth */}
        <Route path="/login">{token ? <Redirect to={`/${role}`} /> : <Login />}</Route>
        <Route path="/register">{token ? <Redirect to={`/${role}`} /> : <Register />}</Route>
        <Route path="/forgot-password"><ForgotPassword /></Route>

        {/* Public */}
        <Route path="/"><PublicPage component={Home} /></Route>
        <Route path="/tests"><PublicPage component={Tests} /></Route>
        <Route path="/tests/:id">{(p) => <PublicLayout><TestDetail params={p} /></PublicLayout>}</Route>
        <Route path="/packages"><PublicPage component={Packages} /></Route>
        <Route path="/packages/:id">{(p) => <PublicLayout><PackageDetail params={p} /></PublicLayout>}</Route>
        <Route path="/doctors"><PublicPage component={Doctors} /></Route>
        <Route path="/doctors/:id">{(p) => <PublicLayout><DoctorDetail params={p} /></PublicLayout>}</Route>
        <Route path="/services"><PublicPage component={Services} /></Route>
        <Route path="/centers"><PublicPage component={Centers} /></Route>
        <Route path="/contact"><PublicPage component={Contact} /></Route>
        <Route path="/about"><PublicPage component={About} /></Route>
        <Route path="/terms"><PublicPage component={Terms} /></Route>
        <Route path="/privacy"><PublicPage component={Privacy} /></Route>

        {/* Patient */}
        <PatientRoute path="/patient" component={PatientDashboard} />
        <PatientRoute path="/patient/book" component={BookTest} />
        <PatientRoute path="/patient/bookings" component={Bookings} />
        <PatientRoute path="/patient/appointments" component={Appointments} />
        <PatientRoute path="/patient/reports" component={Reports} />
        <PatientRoute path="/patient/payments" component={Payments} />
        <PatientRoute path="/patient/profile" component={Profile} />

        {/* Doctor */}
        <DoctorRoute path="/doctor" component={DoctorDashboard} />
        <DoctorRoute path="/doctor/appointments" component={DoctorAppointments} />
        <DoctorRoute path="/doctor/profile" component={DoctorProfile} />

        {/* Admin */}
        <AdminRoute path="/admin" component={AdminDashboard} />
        <AdminRoute path="/admin/users" component={AdminUsers} />
        <AdminRoute path="/admin/doctors" component={AdminDoctors} />
        <AdminRoute path="/admin/tests" component={AdminTests} />
        <AdminRoute path="/admin/packages" component={AdminPackages} />
        <AdminRoute path="/admin/services" component={AdminServices} />
        <AdminRoute path="/admin/bookings" component={AdminBookings} />
        <AdminRoute path="/admin/reports" component={AdminReports} />
        <AdminRoute path="/admin/payments" component={AdminPayments} />

        {/* Fallback */}
        <Route>{() => <PublicLayout><div className="container mx-auto px-4 py-20 text-center"><h1 className="text-4xl font-bold mb-4">404</h1><p className="text-muted-foreground">Page not found.</p></div></PublicLayout>}</Route>
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}
