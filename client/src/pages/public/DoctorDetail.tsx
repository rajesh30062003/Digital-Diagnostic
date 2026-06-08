import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, MapPin, Stethoscope, Loader2, Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const SLOTS = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM"];

export default function DoctorDetail({ params }: { params: { id: string } }) {
  const { data: doc, isLoading } = useQuery({ queryKey: ["doctor", params.id], queryFn: () => api.getDoctor(params.id) });
  const { token, role } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const bookMutation = useMutation({
    mutationFn: () => api.createAppointment({ doctorId: doc._id || doc.id, appointmentDate: selectedDate, timeSlot: selectedSlot }),
    onSuccess: () => {
      toast({ title: "Appointment Booked!", description: `${selectedSlot} on ${selectedDate}` });
      setLocation("/patient/appointments");
    },
    onError: (err: any) => toast({ variant: "destructive", title: "Booking Failed", description: err.message }),
  });

  const handleBook = () => {
    if (!token) { setLocation("/login"); return; }
    if (role !== "patient") { toast({ variant: "destructive", title: "Only patients can book appointments" }); return; }
    if (!selectedDate || !selectedSlot) { toast({ variant: "destructive", title: "Please select date and time" }); return; }
    bookMutation.mutate();
  };

  if (isLoading) return <div className="container mx-auto px-4 py-10"><Skeleton className="h-64 w-full rounded-xl" /></div>;
  if (!doc) return <div className="container mx-auto px-4 py-10 text-center">Doctor not found.</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6"><Link href="/doctors"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Doctors</Link></Button>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Stethoscope className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{doc.name}</h1>
                  <Badge variant="outline" className="mt-1">{doc.specialization}</Badge>
                  <p className="text-sm text-muted-foreground mt-2">{doc.qualification}</p>
                  {doc.rating && (
                    <div className="flex items-center gap-1 mt-2 text-amber-600 text-sm">
                      <Star className="h-4 w-4 fill-amber-500" />{doc.rating} ({doc.totalReviews} reviews)
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="font-semibold">{doc.experience} years</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Consultation Fee</p>
                  <p className="font-semibold text-primary">₹{doc.consultationFee}</p>
                </div>
              </div>
              {doc.bio && <p className="text-muted-foreground text-sm">{doc.bio}</p>}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle className="text-lg">Book Appointment</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Select Date</label>
                <input type="date" min={minDate} max={maxDate} value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              {selectedDate && (
                <div>
                  <label className="text-sm font-medium block mb-2">Select Time Slot</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SLOTS.map(slot => (
                      <button key={slot} onClick={() => setSelectedSlot(slot)}
                        className={`text-xs py-2 px-2 rounded-md border transition-colors ${selectedSlot === slot ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent border-input"}`}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Button className="w-full" onClick={handleBook} disabled={bookMutation.isPending}>
                {bookMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
