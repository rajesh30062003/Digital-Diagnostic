import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Calendar, Clock, FileText, Download, CreditCard, Package, Activity, MapPin } from "lucide-react";
import { api } from "@/lib/api";

const statusColor = (s: string) => ({
  completed: "bg-green-100 text-green-800", pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800", confirmed: "bg-blue-100 text-blue-800",
  available: "bg-green-100 text-green-800", paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
}[s] || "bg-slate-100 text-slate-800");

export function Bookings() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", { status, page }],
    queryFn: () => api.getBookings({ status: status !== "all" ? status : undefined, page, limit: 10 }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.updateBooking(id, { status: "cancelled" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bookings"] }); toast({ title: "Booking cancelled" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-3xl font-bold">My Bookings</h1><p className="text-muted-foreground mt-1">View and manage your test bookings.</p></div>
        <Select value={status} onValueChange={v => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? Array.from({length:3}).map((_,i)=><Card key={i}><CardContent className="p-5"><Skeleton className="h-20"/></CardContent></Card>)
      : data?.data?.length > 0 ? data.data.map((b: any) => (
        <Card key={b._id||b.id}>
          <CardContent className="p-5 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {b.type==="test" ? <Activity className="h-5 w-5 text-primary"/> : <Package className="h-5 w-5 text-primary"/>}
              </div>
              <div>
                <p className="font-semibold">{b.itemName}</p>
                <p className="text-xs text-muted-foreground capitalize">{b.type} · {b.collectionType} collection</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="h-3 w-3"/>{format(new Date(b.scheduledDate),"MMM d, yyyy")}</p>
              </div>
            </div>
            <div className="flex sm:flex-col items-center sm:items-end gap-3">
              <p className="font-bold text-lg">₹{b.amount}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(b.status)}`}>{b.status}</span>
              {b.status === "pending" && (
                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={()=>cancelMutation.mutate(b._id||b.id)}>Cancel</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )) : <p className="text-center text-muted-foreground py-10">No bookings found.</p>}
    </div>
  );
}

export function Appointments() {
  const [status, setStatus] = useState("all");
  const { data, isLoading } = useQuery({
    queryKey: ["appointments", { status }],
    queryFn: () => api.getAppointments({ status: status !== "all" ? status : undefined, limit: 20 }),
  });
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Appointments</h1><p className="text-muted-foreground mt-1">Your doctor consultations.</p></div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["all","pending","confirmed","completed","cancelled"].map(s=><SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? Array.from({length:4}).map((_,i)=><Card key={i}><CardContent className="p-5"><Skeleton className="h-24"/></CardContent></Card>)
        : data?.data?.length > 0 ? data.data.map((a: any) => (
          <Card key={a._id||a.id}>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{a.doctorName || "Doctor"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Consultation</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(a.status)}`}>{a.status}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/>{format(new Date(a.appointmentDate),"MMM d, yyyy")}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{a.timeSlot}</span>
              </div>
              {a.consultationFee && <p className="text-sm font-medium mt-2">Fee: ₹{a.consultationFee}</p>}
            </CardContent>
          </Card>
        )) : <p className="text-muted-foreground col-span-2 text-center py-10">No appointments found.</p>}
      </div>
    </div>
  );
}

export function Reports() {
  const { data, isLoading } = useQuery({ queryKey: ["reports"], queryFn: () => api.getReports({ limit: 20 }) });
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Medical Reports</h1><p className="text-muted-foreground mt-1">Download and view your diagnostic reports.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({length:3}).map((_,i)=><Card key={i}><CardContent className="p-5"><Skeleton className="h-24"/></CardContent></Card>)
        : data?.data?.length > 0 ? data.data.map((r: any) => (
          <Card key={r._id||r.id} className="group hover:border-primary/50 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-blue-600"/>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{r.reportName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(r.createdAt),"MMM d, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(r.status)}`}>{r.status}</span>
                {r.status==="available" && (
                  <Button size="sm" variant="ghost" asChild className="h-8 text-primary">
                    <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"><Download className="h-3 w-3 mr-1"/>Download</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )) : <p className="text-muted-foreground col-span-3 text-center py-10">No reports available yet.</p>}
      </div>
    </div>
  );
}

export function Payments() {
  const { data, isLoading } = useQuery({ queryKey: ["payments"], queryFn: () => api.getPayments({ limit: 20 }) });
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Payment History</h1><p className="text-muted-foreground mt-1">Track your transactions.</p></div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({length:3}).map((_,i)=>(
                  <tr key={i}><td colSpan={4} className="p-4"><Skeleton className="h-8 w-full"/></td></tr>
                )) : data?.data?.length > 0 ? data.data.map((p: any) => (
                  <tr key={p._id||p.id} className="border-b hover:bg-muted/20">
                    <td className="p-4 font-mono text-xs">{p.razorpayOrderId?.slice(-12)}</td>
                    <td className="p-4 text-muted-foreground">{format(new Date(p.createdAt),"MMM d, yyyy")}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(p.status)}`}>{p.status}</span></td>
                    <td className="p-4 text-right font-bold">₹{p.amount}</td>
                  </tr>
                )) : <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No transactions yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Profile() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: user, isLoading } = useQuery({ queryKey: ["me"], queryFn: api.getMe });
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => { if (user) setForm({ name: user.name||"", phone: user.phone||"", address: user.address||"" }); }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await api.updateUser(user._id || user.id, form);
      qc.invalidateQueries({ queryKey: ["me"] });
      toast({ title: "Profile updated!" });
    } catch (err: any) { toast({ variant: "destructive", title: "Update failed", description: err.message }); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div><h1 className="text-3xl font-bold">Profile</h1><p className="text-muted-foreground mt-1">Manage your personal information.</p></div>
      <Card>
        <CardContent className="p-6">
          {isLoading ? <Skeleton className="h-48 w-full"/> : (
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="text-sm font-medium">Full Name</label>
                <input className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
              <div><label className="text-sm font-medium">Email</label>
                <input disabled value={user?.email||""} className="mt-1 flex h-10 w-full rounded-md border border-input bg-muted px-3 text-sm opacity-70"/></div>
              <div><label className="text-sm font-medium">Phone</label>
                <input className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div>
              <div><label className="text-sm font-medium">Address</label>
                <textarea className="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving && <span className="mr-2 h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full inline-block"/>}Save Changes
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
