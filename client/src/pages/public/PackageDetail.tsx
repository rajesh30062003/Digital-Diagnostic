import React from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/hooks/use-auth";

export default function PackageDetail({ params }: { params: { id: string } }) {
  const { data: pkg, isLoading } = useQuery({ queryKey: ["package", params.id], queryFn: () => api.getPackage(params.id) });
  const { token } = useAuthStore();
  const [, setLocation] = useLocation();

  if (isLoading) return <div className="container mx-auto px-4 py-10"><Skeleton className="h-64 w-full rounded-xl" /></div>;
  if (!pkg) return <div className="container mx-auto px-4 py-10 text-center text-muted-foreground">Package not found.</div>;

  const handleBook = () => {
    if (!token) { setLocation("/login"); return; }
    setLocation(`/patient/book?type=package&id=${pkg._id || pkg.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6"><Link href="/packages"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Packages</Link></Button>
      <Card>
        <CardContent className="p-8">
          <Badge variant="outline" className="mb-4">{pkg.category}</Badge>
          <h1 className="text-3xl font-bold mb-4">{pkg.name}</h1>
          <p className="text-muted-foreground mb-6">{pkg.description}</p>
          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <Clock className="h-4 w-4 mr-2 text-primary" />Turnaround: {pkg.turnaroundTime}
          </div>
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Tests Included ({pkg.testsIncluded?.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pkg.testsIncluded?.map((t: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/40">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />{t}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-6">
            <div>
              <p className="text-3xl font-bold text-primary">₹{pkg.price}</p>
              {pkg.originalPrice && (
                <p className="text-sm text-muted-foreground">
                  <span className="line-through">₹{pkg.originalPrice}</span>
                  <span className="text-green-600 ml-2">Save ₹{pkg.originalPrice - pkg.price}</span>
                </p>
              )}
            </div>
            <Button size="lg" onClick={handleBook}>Book This Package</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
