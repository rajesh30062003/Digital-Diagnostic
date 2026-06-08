import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Home, Building2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export default function BookTest() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Pre-fill from query params
  const params = new URLSearchParams(window.location.search);
  const preType = params.get("type") as "test" | "package" | null;
  const preId = params.get("id");

  const [type, setType] = useState<"test" | "package">(preType || "test");
  const [selectedId, setSelectedId] = useState(preId || "");
  const [collectionType, setCollectionType] = useState<"home" | "center">("home");
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const { data: tests } = useQuery({ queryKey: ["tests-all"], queryFn: () => api.getTests({ limit: 100 }) });
  const { data: packages } = useQuery({ queryKey: ["packages-all"], queryFn: () => api.getPackages({ limit: 100 }) });
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: api.getMe });

  useEffect(() => { if (me?.address && !address) setAddress(me.address); }, [me]);

  const items = type === "test" ? tests?.data : packages?.data;
  const selected = items?.find((i: any) => (i._id || i.id)?.toString() === selectedId);

  const handlePay = async () => {
    if (!selected) return toast({ variant: "destructive", title: "Please select a test or package" });
    if (!date) return toast({ variant: "destructive", title: "Please select a date" });
    if (collectionType === "home" && !address) return toast({ variant: "destructive", title: "Please enter address" });

    setProcessing(true);
    try {
      const booking = await api.createBooking({
        type, itemId: selected._id || selected.id, itemName: selected.name,
        amount: selected.price, collectionType, scheduledDate: date, address
      });
      const order = await api.createOrder({ amount: selected.price, bookingId: booking._id || booking.id });
      // Simulate payment verification (no actual Razorpay in dev)
      await api.verifyPayment({
        razorpayOrderId: order.orderId, razorpayPaymentId: "pay_demo_" + Date.now(),
        razorpaySignature: "demo_sig", bookingId: booking._id || booking.id
      });
      setDone(true);
      toast({ title: "Booking Confirmed! 🎉", description: `Your ${type} has been booked successfully.` });
      setTimeout(() => setLocation("/patient/bookings"), 2000);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Booking Failed", description: err.message });
    } finally { setProcessing(false); }
  };

  if (done) return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
      <p className="text-muted-foreground">Redirecting to your bookings...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Book a Test</h1>
        <p className="text-muted-foreground mt-1">Select a test or package and schedule your appointment.</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <Tabs value={type} onValueChange={v => { setType(v as any); setSelectedId(""); }}>
            <TabsList className="w-full">
              <TabsTrigger value="test" className="flex-1">Diagnostic Test</TabsTrigger>
              <TabsTrigger value="package" className="flex-1">Health Package</TabsTrigger>
            </TabsList>
          </Tabs>

          <div>
            <label className="text-sm font-medium block mb-2">Select {type === "test" ? "Test" : "Package"}</label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger><SelectValue placeholder={`Choose a ${type}...`} /></SelectTrigger>
              <SelectContent>
                {items?.map((item: any) => (
                  <SelectItem key={item._id || item.id} value={(item._id || item.id).toString()}>
                    {item.name} – ₹{item.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Collection Type</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { v: "home", label: "Home Collection", icon: Home },
                { v: "center", label: "Visit Center", icon: Building2 },
              ].map(({ v, label, icon: Icon }) => (
                <button key={v} onClick={() => setCollectionType(v as any)}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-colors text-sm font-medium ${collectionType === v ? "border-primary bg-primary/5" : "hover:bg-accent"}`}>
                  <Icon className={`h-5 w-5 ${collectionType === v ? "text-primary" : "text-muted-foreground"}`} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Preferred Date</label>
            <input type="date" min={minDate} value={date} onChange={e => setDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>

          {collectionType === "home" && (
            <div>
              <label className="text-sm font-medium block mb-2">Collection Address</label>
              <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter your full address" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
          )}

          {selected && (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.turnaroundTime}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">₹{selected.price}</p>
                  {selected.originalPrice && <p className="text-xs text-muted-foreground line-through">₹{selected.originalPrice}</p>}
                </div>
              </div>
            </div>
          )}

          <Button className="w-full" size="lg" onClick={handlePay} disabled={processing || !selected}>
            {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : <><CreditCard className="mr-2 h-4 w-4" /> Pay & Book</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
