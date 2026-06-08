import React from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/hooks/use-auth";

export default function TestDetail({ params }: { params: { id: string } }) {
  const { data: test, isLoading } = useQuery({
    queryKey: ["test", params.id],
    queryFn: () => api.getTest(params.id),
  });
  const { token } = useAuthStore();
  const [, setLocation] = useLocation();

  if (isLoading) return <div className="container mx-auto px-4 py-10"><Skeleton className="h-64 w-full rounded-xl" /></div>;
  if (!test) return <div className="container mx-auto px-4 py-10 text-center text-muted-foreground">Test not found.</div>;

  const handleBook = () => {
    if (!token) { setLocation("/login"); return; }
    setLocation(`/patient/book?type=test&id=${test._id || test.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6"><Link href="/tests"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Tests</Link></Button>
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">{test.category}</Badge>
            {test.isPopular && <Badge className="bg-amber-100 text-amber-700 border-amber-200">Popular</Badge>}
          </div>
          <h1 className="text-3xl font-bold mb-4">{test.name}</h1>
          <p className="text-muted-foreground mb-6">{test.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Price</p>
              <p className="text-2xl font-bold text-primary">₹{test.price}</p>
              {test.originalPrice && <p className="text-sm text-muted-foreground line-through">₹{test.originalPrice}</p>}
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">Turnaround Time</p>
              <p className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{test.turnaroundTime}</p>
            </div>
          </div>

          {test.preparation && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 mb-6">
              <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1 text-sm">Preparation Required</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">{test.preparation}</p>
            </div>
          )}

          <Button size="lg" className="w-full" onClick={handleBook}>Book This Test</Button>
        </CardContent>
      </Card>
    </div>
  );
}
