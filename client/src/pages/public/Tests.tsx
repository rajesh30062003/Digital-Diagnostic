import React, { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Search } from "lucide-react";
import { api } from "@/lib/api";

const CATEGORIES = ["All", "Haematology", "Biochemistry", "Endocrinology", "Cardiology", "Microbiology", "Serology", "Oncology", "Virology"];

export default function Tests() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["tests", { search, category, page }],
    queryFn: () => api.getTests({ search: search || undefined, category: category !== "All" ? category : undefined, page, limit: 12 }),
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Diagnostic Tests</h1>
        <p className="text-muted-foreground">Browse and book from our comprehensive catalogue of diagnostic tests</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tests..." className="pl-10" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={category} onValueChange={v => { setCategory(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <Card key={i}><CardContent className="p-5"><Skeleton className="h-32 w-full" /></CardContent></Card>)
          : data?.data?.map((test: any) => (
            <Card key={test._id || test.id} className="hover:border-primary/50 transition-colors group">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="text-xs">{test.category}</Badge>
                  {test.isPopular && <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">Popular</Badge>}
                </div>
                <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors leading-snug">{test.name}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{test.description}</p>
                <div className="flex items-center text-xs text-muted-foreground mb-3">
                  <Clock className="h-3 w-3 mr-1" />{test.turnaroundTime}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-primary text-lg">₹{test.price}</span>
                    {test.originalPrice && <span className="text-xs text-muted-foreground line-through ml-2">₹{test.originalPrice}</span>}
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/tests/${test._id || test.id}`}>Book</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {data && data.total > 12 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-muted-foreground px-4">Page {page} of {Math.ceil(data.total / 12)}</span>
          <Button variant="outline" size="sm" disabled={page * 12 >= data.total} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
