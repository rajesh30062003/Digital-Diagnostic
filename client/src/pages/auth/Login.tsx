import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { ActivitySquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      setAuth(data.token, data.user.role);
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
      setLocation(`/${data.user.role}`);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Login Failed", description: err.message || "Invalid credentials." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <ActivitySquare className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Digital Diagnostic account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Sign In
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p className="mb-3">Demo accounts (password: <code className="bg-muted px-1 rounded">password123</code>)</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { label: "Admin", email: "admin@techknife.com" },
                { label: "Doctor", email: "priya.sharma@techknife.com" },
                { label: "Patient", email: "aditya.verma@gmail.com" },
              ].map(({ label, email: e }) => (
                <button key={e} onClick={() => { setEmail(e); setPassword("password123"); }}
                  className="border rounded px-2 py-1.5 hover:bg-accent transition-colors text-left">
                  <span className="font-medium block">{label}</span>
                  <span className="text-muted-foreground truncate block">{e.split("@")[0]}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
