import React, { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, Search, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export default function Packages() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["packages", { search, page }],
    queryFn: () => api.getPackages({ search: search || undefined, page, limit: 9 }),
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Health Packages</h1>
        <p className="text-muted-foreground">Comprehensive wellness packages bundling multiple tests at great value</p>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search packages..." className="pl-10" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>)
          : data?.data?.map((pkg: any) => (
            <Card key={pkg._id || pkg.id} className="hover:border-primary/50 transition-colors flex flex-col">
              <CardContent className="p-6 flex flex-col flex-1">
                <Badge variant="outline" className="self-start mb-3 text-xs">{pkg.category}</Badge>
                <h3 className="font-bold text-lg mb-2">{pkg.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{pkg.description}</p>
                <div className="flex items-center text-xs text-muted-foreground mb-4">
                  <Clock className="h-3 w-3 mr-1" />{pkg.turnaroundTime}
                </div>
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">{pkg.testsIncluded?.length} tests included:</p>
                  <ul className="space-y-1">
                    {pkg.testsIncluded?.slice(0, 3).map((t: string, i: number) => (
                      <li key={i} className="flex items-center text-xs text-muted-foreground gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />{t}
                      </li>
                    ))}
                    {pkg.testsIncluded?.length > 3 && <li className="text-xs text-primary">+{pkg.testsIncluded.length - 3} more</li>}
                  </ul>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <div>
                    <span className="text-2xl font-bold text-primary">₹{pkg.price}</span>
                    {pkg.originalPrice && <span className="text-sm text-muted-foreground line-through ml-2">₹{pkg.originalPrice}</span>}
                  </div>
                  <Button size="sm" asChild><Link href={`/packages/${pkg._id || pkg.id}`}>View & Book</Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
