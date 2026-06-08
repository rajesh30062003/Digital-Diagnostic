import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ActivitySquare, LayoutDashboard, Calendar, FileText, CreditCard,
  User, Stethoscope, Users, Activity, Package, Settings,
  LogOut, Menu, X, Bell, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const patientNav = [
  { href: "/patient", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patient/book", label: "Book Test", icon: Activity },
  { href: "/patient/bookings", label: "My Bookings", icon: Package },
  { href: "/patient/appointments", label: "Appointments", icon: Calendar },
  { href: "/patient/reports", label: "Reports", icon: FileText },
  { href: "/patient/payments", label: "Payments", icon: CreditCard },
  { href: "/patient/profile", label: "Profile", icon: User },
];

const doctorNav = [
  { href: "/doctor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
  { href: "/doctor/patients", label: "Patients", icon: Users },
  { href: "/doctor/profile", label: "Profile", icon: User },
];

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/tests", label: "Tests", icon: Activity },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/services", label: "Services", icon: Settings },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role, clearAuth } = useAuthStore();
  const [location, setLocation] = useLocation();

  const navItems = role === "patient" ? patientNav : role === "doctor" ? doctorNav : adminNav;

  const handleLogout = () => {
    clearAuth();
    setLocation("/");
  };

  const Sidebar = () => (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col transition-transform duration-200",
      sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="h-16 flex items-center px-6 border-b shrink-0">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <ActivitySquare className="h-5 w-5 text-primary" />
          <span>Digital Diagnostic</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = location === item.href || (item.href !== `/${role}` && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-2 mb-3 px-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate capitalize">{role}</p>
            <p className="text-xs text-muted-foreground">Account</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 border-b bg-background/95 backdrop-blur">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/${role}/notifications`}><Bell className="h-5 w-5" /></Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${role}/profile`}>
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </Link>
            </Button>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
