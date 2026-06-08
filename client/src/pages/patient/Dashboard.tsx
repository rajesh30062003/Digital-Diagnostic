import React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar, FileText, CreditCard, ArrowRight, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { format } from "date-fns";

export default function PatientDashboard() {
  const { data: stats, isLoading: sl } = useQuery({ queryKey: ["patient-stats"], queryFn: api.getPatientStats });
  const { data: bookings, isLoading: bl } = useQuery({ queryKey: ["bookings", {limit:3}], queryFn: () => api.getBookings({ limit: 3 }) });
  const { data: appointments, isLoading: al } = useQuery({ queryKey: ["appointments", {limit:3}], queryFn: () => api.getAppointments({ limit: 3 }) });

  const statCards = [
    { label: "Total Bookings", value: stats?.totalBookings, icon: Activity, color: "text-primary", bg: "bg-primary/10" },
    { label: "Appointments", value: stats?.totalAppointments, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Reports", value: stats?.totalReports, icon: FileText, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Total Spent", value: stats?.totalSpent != null ? `₹${stats.totalSpent}` : null, icon: CreditCard, color: "text-green-600", bg: "bg-green-50" },
  ];

  const statusColor = (s: string) => ({
    completed: "bg-green-100 text-green-800", pending: "bg-amber-100 text-amber-800",
    cancelled: "bg-red-100 text-red-800", confirmed: "bg-blue-100 text-blue-800",
  }[s] || "bg-slate-100 text-slate-800");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground mt-1">Here's a summary of your health activities.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg}`}><s.icon className={`h-6 w-6 ${s.color}`} /></div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                {sl ? <Skeleton className="h-7 w-16 mt-1" /> : <h3 className="text-2xl font-bold">{s.value ?? 0}</h3>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Recent Bookings</h2>
            <Button variant="ghost" size="sm" asChild><Link href="/patient/bookings">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
          </div>
          {bl ? <Skeleton className="h-40 w-full" /> : bookings?.data?.length > 0 ? (
            <div className="space-y-3">
              {bookings.data.map((b: any) => (
                <Card key={b._id || b.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{b.itemName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />{format(new Date(b.scheduledDate), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">₹{b.amount}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(b.status)}`}>{b.status}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : <p className="text-muted-foreground text-sm text-center py-8">No bookings yet. <Link href="/patient/book" className="text-primary hover:underline">Book a test</Link></p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Upcoming Appointments</h2>
            <Button variant="ghost" size="sm" asChild><Link href="/patient/appointments">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
          </div>
          {al ? <Skeleton className="h-40 w-full" /> : appointments?.data?.length > 0 ? (
            <div className="space-y-3">
              {appointments.data.map((a: any) => (
                <Card key={a._id || a.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{a.doctorName || "Dr."}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />{format(new Date(a.appointmentDate), "MMM d, yyyy")} • {a.timeSlot}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(a.status)}`}>{a.status}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : <p className="text-muted-foreground text-sm text-center py-8">No appointments. <Link href="/doctors" className="text-primary hover:underline">Find a doctor</Link></p>}
        </div>
      </div>
    </div>
  );
}
