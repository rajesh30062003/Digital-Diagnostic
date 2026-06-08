import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Users, Stethoscope, Activity, Package, BarChart2,
  Trash2, Pencil, Plus, Loader2, TrendingUp, Calendar
} from "lucide-react";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const statusColor = (s: string) => ({
  completed: "bg-green-100 text-green-800", pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800", confirmed: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800", failed: "bg-red-100 text-red-800",
  patient: "bg-blue-100 text-blue-800", doctor: "bg-purple-100 text-purple-800",
  admin: "bg-red-100 text-red-800",
}[s] || "bg-slate-100 text-slate-800");

// ─── ADMIN DASHBOARD ────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { data: stats, isLoading: sl } = useQuery({ queryKey: ["admin-stats"], queryFn: api.getAdminStats });
  const { data: chart, isLoading: cl } = useQuery({ queryKey: ["revenue-chart"], queryFn: api.getRevenueChart });
  const { data: activity, isLoading: al } = useQuery({ queryKey: ["recent-activity"], queryFn: api.getRecentActivity });

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Doctors", value: stats?.totalDoctors, icon: Stethoscope, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Total Bookings", value: stats?.totalBookings, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Revenue (₹)", value: stats?.totalRevenue != null ? `₹${stats.totalRevenue.toLocaleString()}` : null, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and analytics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <Card key={i}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${c.bg}`}><c.icon className={`h-6 w-6 ${c.color}`} /></div>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                {sl ? <Skeleton className="h-7 w-20 mt-1" /> : <h3 className="text-2xl font-bold">{c.value ?? 0}</h3>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Revenue & Bookings (Last 6 months)</CardTitle></CardHeader>
          <CardContent>
            {cl ? <Skeleton className="h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chart} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: any, n: any) => [n === "revenue" ? `₹${v}` : v, n === "revenue" ? "Revenue" : "Bookings"]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bookings" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {al ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />) :
              activity?.slice(0, 5).map((a: any) => (
                <div key={a.id} className="text-sm">
                  <p className="font-medium line-clamp-1">{a.message}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(a.time), "MMM d, h:mm a")}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Bookings", value: stats?.todayBookings, color: "text-primary" },
          { label: "Pending Bookings", value: stats?.pendingBookings, color: "text-amber-600" },
          { label: "Total Reports", value: stats?.totalReports, color: "text-teal-600" },
          { label: "New Contacts", value: stats?.newContacts, color: "text-purple-600" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-5 text-center">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              {sl ? <Skeleton className="h-8 w-12 mx-auto" /> : <p className={`text-3xl font-bold ${s.color}`}>{s.value ?? 0}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN USERS ────────────────────────────────────────────────────────────

export function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", { roleFilter, page }],
    queryFn: () => api.getUsers({ role: roleFilter !== "all" ? roleFilter : undefined, page, limit: 15 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast({ title: "User deleted" }); },
    onError: (err: any) => toast({ variant: "destructive", title: "Failed", description: err.message }),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Users</h1><p className="text-muted-foreground mt-1">Manage platform users.</p></div>
        <Select value={roleFilter} onValueChange={v => { setRoleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="patient">Patients</SelectItem>
            <SelectItem value="doctor">Doctors</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="p-4"><Skeleton className="h-8 w-full" /></td></tr>
                )) : data?.data?.map((u: any) => (
                  <tr key={u._id || u.id} className="border-b hover:bg-muted/20">
                    <td className="p-4 font-medium">{u.name}</td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor(u.role)}`}>{u.role}</span></td>
                    <td className="p-4 text-muted-foreground">{u.phone || "—"}</td>
                    <td className="p-4 text-muted-foreground">{format(new Date(u.createdAt), "MMM d, yyyy")}</td>
                    <td className="p-4">
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                        onClick={() => { if (window.confirm("Delete this user?")) deleteMutation.mutate(u._id || u.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {data && data.total > 15 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-muted-foreground px-4">Page {page} of {Math.ceil(data.total / 15)}</span>
          <Button variant="outline" size="sm" disabled={page * 15 >= data.total} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

// ─── GENERIC CRUD HELPERS ───────────────────────────────────────────────────

function FieldInput({ label, name, value, onChange, type = "text", required = false, placeholder = "" }: any) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    </div>
  );
}

// ─── ADMIN TESTS ────────────────────────────────────────────────────────────

const emptyTest = { name: "", category: "", description: "", price: "", originalPrice: "", turnaroundTime: "", preparation: "", isPopular: false };

export function AdminTests() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyTest);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({ queryKey: ["admin-tests", page], queryFn: () => api.getTests({ page, limit: 15 }) });

  const upsert = useMutation({
    mutationFn: (data: any) => editing ? api.updateTest(editing._id || editing.id, data) : api.createTest(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tests"] }); setOpen(false); toast({ title: editing ? "Test updated" : "Test created" }); },
    onError: (err: any) => toast({ variant: "destructive", title: "Failed", description: err.message }),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.deleteTest(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-tests"] }); toast({ title: "Test deleted" }); },
  });

  const openNew = () => { setEditing(null); setForm(emptyTest); setOpen(true); };
  const openEdit = (t: any) => { setEditing(t); setForm({ ...t, price: t.price ?? "", originalPrice: t.originalPrice ?? "" }); setOpen(true); };
  const set = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); upsert.mutate({ ...form, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined }); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Manage Tests</h1><p className="text-muted-foreground mt-1">Add, edit, or remove diagnostic tests.</p></div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Test</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">TAT</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="p-4"><Skeleton className="h-8 w-full" /></td></tr>
                )) : data?.data?.map((t: any) => (
                  <tr key={t._id || t.id} className="border-b hover:bg-muted/20">
                    <td className="p-4 font-medium">{t.name}</td>
                    <td className="p-4 text-muted-foreground">{t.category}</td>
                    <td className="p-4 font-medium text-primary">₹{t.price}</td>
                    <td className="p-4 text-muted-foreground">{t.turnaroundTime}</td>
                    <td className="p-4 flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (window.confirm("Delete?")) del.mutate(t._id || t.id); }}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {data && data.total > 15 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm px-4">Page {page} of {Math.ceil(data.total / 15)}</span>
          <Button variant="outline" size="sm" disabled={page * 15 >= data.total} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Test" : "New Test"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 py-2">
            <FieldInput label="Test Name" name="name" value={form.name} onChange={set} required />
            <FieldInput label="Category" name="category" value={form.category} onChange={set} required />
            <FieldInput label="Description" name="description" value={form.description} onChange={set} />
            <div className="grid grid-cols-2 gap-3">
              <FieldInput label="Price (₹)" name="price" value={form.price} onChange={set} type="number" required />
              <FieldInput label="Original Price (₹)" name="originalPrice" value={form.originalPrice} onChange={set} type="number" />
            </div>
            <FieldInput label="Turnaround Time" name="turnaroundTime" value={form.turnaroundTime} onChange={set} required placeholder="e.g. 4-6 hours" />
            <FieldInput label="Preparation" name="preparation" value={form.preparation} onChange={set} placeholder="e.g. 8-12 hours fasting" />
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isPopular" name="isPopular" checked={form.isPopular} onChange={set} className="h-4 w-4 rounded border" />
              <label htmlFor="isPopular" className="text-sm font-medium">Mark as Popular</label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={upsert.isPending}>{upsert.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── ADMIN PACKAGES ─────────────────────────────────────────────────────────

const emptyPkg = { name: "", category: "", description: "", price: "", originalPrice: "", testsIncluded: "", turnaroundTime: "24-48 hours" };

export function AdminPackages() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyPkg);

  const { data, isLoading } = useQuery({ queryKey: ["admin-packages"], queryFn: () => api.getPackages({ limit: 50 }) });

  const upsert = useMutation({
    mutationFn: (data: any) => editing ? api.updatePackage(editing._id || editing.id, data) : api.createPackage(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-packages"] }); setOpen(false); toast({ title: editing ? "Package updated" : "Package created" }); },
    onError: (err: any) => toast({ variant: "destructive", title: "Failed", description: err.message }),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.deletePackage(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-packages"] }); toast({ title: "Package deleted" }); },
  });

  const openNew = () => { setEditing(null); setForm(emptyPkg); setOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ ...p, price: p.price ?? "", originalPrice: p.originalPrice ?? "", testsIncluded: (p.testsIncluded || []).join(", ") }); setOpen(true); };
  const set = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tests = form.testsIncluded.split(",").map((s: string) => s.trim()).filter(Boolean);
    upsert.mutate({ ...form, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined, testsIncluded: tests });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Manage Packages</h1><p className="text-muted-foreground mt-1">Create and edit health packages.</p></div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Package</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-5"><Skeleton className="h-32 w-full" /></CardContent></Card>)
          : data?.data?.map((p: any) => (
            <Card key={p._id || p.id}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category} · {p.testsIncluded?.length} tests</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (window.confirm("Delete?")) del.mutate(p._id || p.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <p className="text-primary font-bold">₹{p.price}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Package" : "New Package"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 py-2">
            <FieldInput label="Package Name" name="name" value={form.name} onChange={set} required />
            <FieldInput label="Category" name="category" value={form.category} onChange={set} required />
            <FieldInput label="Description" name="description" value={form.description} onChange={set} />
            <div className="grid grid-cols-2 gap-3">
              <FieldInput label="Price (₹)" name="price" value={form.price} onChange={set} type="number" required />
              <FieldInput label="Original Price (₹)" name="originalPrice" value={form.originalPrice} onChange={set} type="number" />
            </div>
            <FieldInput label="Turnaround Time" name="turnaroundTime" value={form.turnaroundTime} onChange={set} />
            <div>
              <label className="text-sm font-medium block mb-1">Tests Included (comma-separated)</label>
              <textarea name="testsIncluded" value={form.testsIncluded} onChange={set}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="CBC, Lipid Profile, LFT, ..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={upsert.isPending}>{upsert.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── ADMIN SERVICES ─────────────────────────────────────────────────────────

const emptySvc = { name: "", icon: "Activity", description: "" };

export function AdminServices() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptySvc);

  const { data: services, isLoading } = useQuery({ queryKey: ["services"], queryFn: api.getServices });

  const upsert = useMutation({
    mutationFn: (data: any) => editing ? api.updateService(editing._id || editing.id, data) : api.createService(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["services"] }); setOpen(false); toast({ title: editing ? "Service updated" : "Service created" }); },
    onError: (err: any) => toast({ variant: "destructive", title: "Failed", description: err.message }),
  });
  const del = useMutation({
    mutationFn: (id: string) => api.deleteService(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["services"] }); toast({ title: "Service deleted" }); },
  });

  const openNew = () => { setEditing(null); setForm(emptySvc); setOpen(true); };
  const openEdit = (s: any) => { setEditing(s); setForm({ ...s }); setOpen(true); };
  const set = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Manage Services</h1><p className="text-muted-foreground mt-1">Edit the services shown on the public page.</p></div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Service</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardContent className="p-5"><Skeleton className="h-24 w-full" /></CardContent></Card>)
          : services?.map((s: any) => (
            <Card key={s._id || s.id}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 pr-4">
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (window.confirm("Delete?")) del.mutate(s._id || s.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Service" : "New Service"}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); upsert.mutate(form); }} className="space-y-3 py-2">
            <FieldInput label="Service Name" name="name" value={form.name} onChange={set} required />
            <FieldInput label="Icon (Lucide name)" name="icon" value={form.icon} onChange={set} placeholder="e.g. Home, Heart, Stethoscope" />
            <div>
              <label className="text-sm font-medium block mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={set} required
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={upsert.isPending}>{upsert.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── ADMIN BOOKINGS ─────────────────────────────────────────────────────────

export function AdminBookings() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings", { status, page }],
    queryFn: () => api.getBookings({ status: status !== "all" ? status : undefined, page, limit: 15 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateBooking(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-bookings"] }); toast({ title: "Booking updated" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">All Bookings</h1></div>
        <Select value={status} onValueChange={v => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["all", "pending", "confirmed", "completed", "cancelled"].map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Patient</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Item</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="p-4"><Skeleton className="h-8 w-full" /></td></tr>
                )) : data?.data?.map((b: any) => (
                  <tr key={b._id || b.id} className="border-b hover:bg-muted/20">
                    <td className="p-4 font-medium">{b.patientName || "—"}</td>
                    <td className="p-4">{b.itemName}</td>
                    <td className="p-4 text-muted-foreground">{format(new Date(b.scheduledDate), "MMM d, yyyy")}</td>
                    <td className="p-4 font-medium text-primary">₹{b.amount}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(b.status)}`}>{b.status}</span></td>
                    <td className="p-4">
                      {b.status === "pending" && (
                        <Button size="sm" variant="outline" className="text-xs"
                          onClick={() => updateMutation.mutate({ id: b._id || b.id, status: "confirmed" })}>Confirm</Button>
                      )}
                      {b.status === "confirmed" && (
                        <Button size="sm" variant="outline" className="text-xs"
                          onClick={() => updateMutation.mutate({ id: b._id || b.id, status: "completed" })}>Complete</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── ADMIN REPORTS ───────────────────────────────────────────────────────────

export function AdminReports() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ userId: "", bookingId: "", reportName: "", fileUrl: "" });
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["admin-reports"], queryFn: () => api.getReports({ limit: 50 }) });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createReport(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reports"] }); setOpen(false); toast({ title: "Report created" }); },
    onError: (err: any) => toast({ variant: "destructive", title: "Failed", description: err.message }),
  });

  const set = (e: any) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Reports</h1><p className="text-muted-foreground mt-1">Upload and manage patient reports.</p></div>
        <Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Upload Report</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Patient</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Report Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={4} className="p-4"><Skeleton className="h-8 w-full" /></td></tr>
                )) : data?.data?.map((r: any) => (
                  <tr key={r._id || r.id} className="border-b hover:bg-muted/20">
                    <td className="p-4 font-medium">{r.patientName || "—"}</td>
                    <td className="p-4">{r.reportName}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(r.status)}`}>{r.status}</span></td>
                    <td className="p-4 text-muted-foreground">{format(new Date(r.createdAt), "MMM d, yyyy")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Report</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-3 py-2">
            <FieldInput label="User ID (MongoDB ObjectId)" name="userId" value={form.userId} onChange={set} required />
            <FieldInput label="Booking ID (MongoDB ObjectId)" name="bookingId" value={form.bookingId} onChange={set} required />
            <FieldInput label="Report Name" name="reportName" value={form.reportName} onChange={set} required />
            <FieldInput label="File URL" name="fileUrl" value={form.fileUrl} onChange={set} required placeholder="https://..." />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Upload</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── ADMIN PAYMENTS ──────────────────────────────────────────────────────────

export function AdminPayments() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-payments"], queryFn: () => api.getPayments({ limit: 50 }) });

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Payments</h1><p className="text-muted-foreground mt-1">All platform transactions.</p></div>
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
                {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={4} className="p-4"><Skeleton className="h-8 w-full" /></td></tr>
                )) : data?.data?.map((p: any) => (
                  <tr key={p._id || p.id} className="border-b hover:bg-muted/20">
                    <td className="p-4 font-mono text-xs">{p.razorpayOrderId?.slice(-16)}</td>
                    <td className="p-4 text-muted-foreground">{format(new Date(p.createdAt), "MMM d, yyyy")}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(p.status)}`}>{p.status}</span></td>
                    <td className="p-4 text-right font-bold">₹{p.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── ADMIN DOCTORS ───────────────────────────────────────────────────────────

export function AdminDoctors() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-doctors"],
    queryFn: () => api.getDoctors({ limit: 50 }),
  });

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Doctors</h1><p className="text-muted-foreground mt-1">All registered doctors on the platform.</p></div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Specialization</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Experience</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Location</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Fee</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="p-4"><Skeleton className="h-8 w-full" /></td></tr>
                )) : data?.data?.map((d: any) => (
                  <tr key={d._id || d.id} className="border-b hover:bg-muted/20">
                    <td className="p-4 font-medium">{d.name}</td>
                    <td className="p-4">{d.specialization}</td>
                    <td className="p-4 text-muted-foreground">{d.experience} yrs</td>
                    <td className="p-4 text-muted-foreground">{d.location || "—"}</td>
                    <td className="p-4 font-medium text-primary">₹{d.consultationFee}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${d.isAvailable ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
                        {d.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
