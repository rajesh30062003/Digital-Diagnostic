import React, { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, MapPin, Search, Stethoscope } from "lucide-react";
import { api } from "@/lib/api";

const SPECS = ["All", "Cardiologist", "Neurologist", "Gynecologist", "Orthopedician", "Dermatologist", "Diabetologist", "Oncologist"];

export default function Doctors() {
  const [search, setSearch] = useState("");
  const [spec, setSpec] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: ["doctors", { search, spec }],
    queryFn: () => api.getDoctors({ search: search || undefined, specialization: spec !== "All" ? spec : undefined, limit: 20 }),
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Our Doctors</h1>
        <p className="text-muted-foreground">Consult with our panel of 200+ experienced specialists</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search doctors..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SPECS.map(s => (
            <Button key={s} variant={spec === s ? "default" : "outline"} size="sm" className="shrink-0" onClick={() => setSpec(s)}>{s}</Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>)
          : data?.data?.map((doc: any) => (
            <Card key={doc._id || doc.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Stethoscope className="h-7 w-7 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg leading-tight">{doc.name}</h3>
                    <Badge variant="outline" className="text-xs mt-1">{doc.specialization}</Badge>
                  </div>
                </div>
                <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                  <p>{doc.qualification}</p>
                  <p>{doc.experience} years experience</p>
                  {doc.location && <p className="flex items-center gap-1"><MapPin className="h-3 w-3" />{doc.location}</p>}
                  {doc.rating && (
                    <p className="flex items-center gap-1 text-amber-600">
                      <Star className="h-3 w-3 fill-amber-500" />{doc.rating} ({doc.totalReviews} reviews)
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Consultation Fee</p>
                    <p className="font-bold text-primary">₹{doc.consultationFee}</p>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/doctors/${doc._id || doc.id}`}>Book Appointment</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
