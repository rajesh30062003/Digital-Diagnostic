import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import * as Icons from "lucide-react";

export function Services() {
  const { data: services, isLoading } = useQuery({ queryKey: ["services"], queryFn: api.getServices });
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Our Services</h1>
        <p className="text-muted-foreground">Comprehensive healthcare services tailored for you</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-32 w-full" /></CardContent></Card>)
          : services?.map((svc: any) => {
            const Icon = (Icons as any)[svc.icon] || Icons.Activity;
            return (
              <Card key={svc._id || svc.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{svc.name}</h3>
                  <p className="text-sm text-muted-foreground">{svc.description}</p>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}

export function Centers() {
  const { data: centers, isLoading } = useQuery({ queryKey: ["centers"], queryFn: api.getCenters });
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Our Centers</h1>
        <p className="text-muted-foreground">Visit any of our state-of-the-art diagnostic centers across India</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>)
          : centers?.map((c: any) => (
            <Card key={c._id || c.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icons.Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold leading-tight">{c.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{c.city}, {c.state}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2"><Icons.MapPin className="h-4 w-4 shrink-0 mt-0.5" />{c.address}</p>
                  <p className="flex items-center gap-2"><Icons.Phone className="h-4 w-4" />{c.phone}</p>
                  <p className="flex items-center gap-2"><Icons.Clock className="h-4 w-4" />{c.workingHours}</p>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}

export function Contact() {
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createContact(form);
      setSent(true);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-8">Have a question? We'd love to hear from you.</p>
      {sent ? (
        <Card><CardContent className="p-8 text-center">
          <Icons.CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-bold text-xl mb-2">Message Sent!</h3>
          <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium">Name</label>
                <input className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><label className="text-sm font-medium">Email</label>
                <input type="email" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
            </div>
            <div><label className="text-sm font-medium">Phone</label>
              <input className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><label className="text-sm font-medium">Subject</label>
              <input className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required /></div>
            <div><label className="text-sm font-medium">Message</label>
              <textarea className="mt-1 flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.message} onChange={e => setForm({...form, message: e.target.value})} required /></div>
            <button type="submit" disabled={loading} className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Icons.Loader2 className="h-4 w-4 animate-spin" />} Send Message
            </button>
          </form>
        </CardContent></Card>
      )}
    </div>
  );
}

export function About() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">About Digital Diagnostic</h1>
      <div className="prose prose-slate max-w-none space-y-4 text-muted-foreground">
        <p className="text-lg text-foreground font-medium">Digital Diagnostic is India's leading healthcare diagnostic platform, trusted by over one million patients across the country.</p>
        <p>Founded by Tech Knife, we are on a mission to make high-quality diagnostics accessible, affordable, and convenient for every Indian family. With state-of-the-art equipment, NABL-accredited laboratories, and a panel of 200+ specialist doctors, we deliver accurate results you can trust.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
          {[{n:"1M+",l:"Patients Served"},{n:"200+",l:"Specialist Doctors"},{n:"5",l:"Cities & Growing"}].map(s=>(
            <div key={s.l} className="text-center p-6 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-3xl font-bold text-primary">{s.n}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.l}</p>
            </div>
          ))}
        </div>
        <p>Our home sample collection service operates 7 days a week, and our digital report delivery ensures you never have to wait in a queue again. Whether you need a routine CBC or a comprehensive annual health check, Digital Diagnostic has you covered.</p>
      </div>
    </div>
  );
}

export function Terms() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="space-y-6 text-muted-foreground">
        <section><h2 className="text-xl font-semibold text-foreground mb-2">1. Acceptance of Terms</h2><p>By accessing and using Digital Diagnostic, you accept these Terms of Service. If you do not agree, please discontinue use.</p></section>
        <section><h2 className="text-xl font-semibold text-foreground mb-2">2. Services</h2><p>We provide diagnostic test booking, health package subscriptions, and doctor consultation scheduling. All tests are conducted in NABL-accredited laboratories.</p></section>
        <section><h2 className="text-xl font-semibold text-foreground mb-2">3. User Accounts</h2><p>You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorised use.</p></section>
        <section><h2 className="text-xl font-semibold text-foreground mb-2">4. Payments & Refunds</h2><p>All payments are processed securely via Razorpay. Refunds are processed within 5-7 business days for eligible cancellations made 24 hours before the scheduled test.</p></section>
        <section><h2 className="text-xl font-semibold text-foreground mb-2">5. Medical Disclaimer</h2><p>Diagnostic reports are for informational purposes only and should not replace professional medical advice. Always consult a qualified healthcare provider.</p></section>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-6 text-muted-foreground">
        <section><h2 className="text-xl font-semibold text-foreground mb-2">1. Information We Collect</h2><p>We collect name, email, phone number, address, and health information necessary to provide our diagnostic services.</p></section>
        <section><h2 className="text-xl font-semibold text-foreground mb-2">2. How We Use Information</h2><p>Your information is used to process bookings, deliver reports, facilitate doctor consultations, and improve our services. We do not sell your data to third parties.</p></section>
        <section><h2 className="text-xl font-semibold text-foreground mb-2">3. Data Security</h2><p>We employ industry-standard encryption and security measures to protect your personal and health information at all times.</p></section>
        <section><h2 className="text-xl font-semibold text-foreground mb-2">4. Your Rights</h2><p>You may request access to, correction of, or deletion of your personal data at any time by contacting our Data Protection Officer at privacy@techknife.com.</p></section>
      </div>
    </div>
  );
}
