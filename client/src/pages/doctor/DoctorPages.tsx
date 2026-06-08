import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar, Users, Clock, CheckCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const statusColor = (s: string) => ({
  completed: "bg-green-100 text-green-800", pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800", confirmed: "bg-blue-100 text-blue-800",
}[s] || "bg-slate-100 text-slate-800");

export function DoctorDashboard() {
  const { data: stats, isLoading: sl } = useQuery({ queryKey: ["doctor-stats"], queryFn: api.getDoctorStats });
  const { data: appointments, isLoading: al } = useQuery({
    queryKey: ["doctor-appointments", { limit: 5 }],
    queryFn: () => api.getAppointments({ limit: 5 }),
  });

  const cards = [
    { label: "Total Appointments", value: stats?.totalAppointments, icon: Calendar, color: "text-primary", bg: "bg-primary/10" },
    { label: "Today's Schedule", value: stats?.todayAppointments, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Pending", value: stats?.pendingAppointments, icon: CheckCircle, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Total Patients", value: stats?.totalPatients, icon: Users, color: "text-teal-600", bg: "bg-teal-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here's your schedule overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <Card key={i}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${c.bg}`}><c.icon className={`h-6 w-6 ${c.color}`} /></div>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                {sl ? <Skeleton className="h-7 w-12 mt-1" /> : <h3 className="text-2xl font-bold">{c.value ?? 0}</h3>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-4">Recent Appointments</h2>
        {al ? <Skeleton className="h-48 w-full" /> : appointments?.data?.length > 0 ? (
          <div className="space-y-3">
            {appointments.data.map((a: any) => (
              <Card key={a._id || a.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{a.patientName || "Patient"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />{format(new Date(a.appointmentDate), "MMM d, yyyy")} • {a.timeSlot}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(a.status)}`}>{a.status}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : <p className="text-muted-foreground text-center py-8">No appointments yet.</p>}
      </div>
    </div>
  );
}

export function DoctorAppointments() {
  const [status, setStatus] = useState("all");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["doctor-appointments-all", { status }],
    queryFn: () => api.getAppointments({ status: status !== "all" ? status : undefined, limit: 50 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateAppointment(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doctor-appointments-all"] }); toast({ title: "Appointment updated" }); },
    onError: (err: any) => toast({ variant: "destructive", title: "Failed", description: err.message }),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your patient consultations.</p>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["all", "pending", "confirmed", "completed", "cancelled"].map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>
        )) : data?.data?.length > 0 ? data.data.map((a: any) => (
          <Card key={a._id || a.id}>
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{a.patientName || "Patient"}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />{format(new Date(a.appointmentDate), "MMM d, yyyy")}
                    <Clock className="h-3 w-3 ml-1" />{a.timeSlot}
                  </p>
                  {a.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{a.notes}"</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(a.status)}`}>{a.status}</span>
                {a.status === "pending" && (
                  <Button size="sm" variant="outline" className="text-green-600 border-green-200"
                    onClick={() => updateMutation.mutate({ id: a._id || a.id, status: "confirmed" })}>
                    Confirm
                  </Button>
                )}
                {a.status === "confirmed" && (
                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-200"
                    onClick={() => updateMutation.mutate({ id: a._id || a.id, status: "completed" })}>
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )) : <p className="text-center text-muted-foreground py-10">No appointments found.</p>}
      </div>
    </div>
  );
}

export function DoctorProfile() {
  const { toast } = useToast();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: api.getMe });
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => { if (user) setForm({ name: user.name || "", phone: user.phone || "" }); }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await api.updateUser(user._id || user.id, form);
      toast({ title: "Profile updated!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed", description: err.message });
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">Update your doctor information.</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <input className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input disabled value={user?.email || ""} className="mt-1 flex h-10 w-full rounded-md border border-input bg-muted px-3 text-sm opacity-70" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
