import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { ActivitySquare, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/hooks/use-auth";

export default function ForgotPassword() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setAuth } = useAuthStore();
  const [, setLocation] = useLocation();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forgotPassword({ email });
      toast({ title: "OTP Sent", description: "Check your email (or server logs in dev) for the reset code." });
      setStep("otp");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally { setLoading(false); }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.verifyOtp({ email, otp, newPassword });
      setAuth(data.token, data.user.role);
      toast({ title: "Password Reset!", description: "You have been logged in." });
      setLocation(`/${data.user.role}`);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <ActivitySquare className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">{step === "email" ? "Forgot Password" : "Enter OTP"}</CardTitle>
          <CardDescription>
            {step === "email" ? "Enter your email to receive a reset code" : `Enter the OTP sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send Reset Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">6-digit OTP</label>
                <Input placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <Input type="password" placeholder="At least 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Reset Password
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("email")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline font-medium flex items-center justify-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
