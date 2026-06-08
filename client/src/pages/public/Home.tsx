import React from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivitySquare, MapPin, Clock, ArrowRight, ShieldCheck, Microscope, CalendarCheck, Star } from "lucide-react";
import { api } from "@/lib/api";

export default function Home() {
  const { data: popularTests, isLoading: testsLoading } = useQuery({ queryKey: ["popular-tests"], queryFn: api.getPopularTests });
  const { data: servicesData, isLoading: servicesLoading } = useQuery({ queryKey: ["services"], queryFn: api.getServices });
  const { data: packagesData, isLoading: packagesLoading } = useQuery({ queryKey: ["packages", { limit: 3 }], queryFn: () => api.getPackages({ limit: 3 }) });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative bg-slate-50 dark:bg-slate-900 pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
              <ActivitySquare className="mr-2 h-4 w-4" /> Trusted by 1M+ Patients Across India
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              Precision Diagnostics,<br />
              <span className="text-primary">Delivered with Care.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              Book tests, consult top doctors, and manage your health records in one premium platform. Accurate results, zero hassle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="rounded-full px-8">
                <Link href="/tests">Book a Test</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8">
                <Link href="/doctors">Find a Doctor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Microscope, title: "Advanced Technology", desc: "State-of-the-art equipment ensuring precise and accurate diagnostic results every time.", color: "text-primary", bg: "bg-primary/10" },
              { icon: ShieldCheck, title: "Certified Experts", desc: "Our team of experienced pathologists and doctors guarantee the highest standard of care.", color: "text-green-600", bg: "bg-green-50" },
              { icon: CalendarCheck, title: "Home Collection", desc: "Book a test from the comfort of your home. We'll collect the sample safely and quickly.", color: "text-blue-600", bg: "bg-blue-50" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6">
                <div className={`h-16 w-16 rounded-full ${f.bg} flex items-center justify-center mb-6`}>
                  <f.icon className={`h-8 w-8 ${f.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tests */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-1">Popular Tests</h2>
              <p className="text-muted-foreground">Frequently booked diagnostic tests</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/tests">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {testsLoading
              ? Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardContent className="p-5"><Skeleton className="h-24 w-full" /></CardContent></Card>)
              : popularTests?.slice(0, 8).map((test: any) => (
                <Card key={test._id || test.id} className="hover:border-primary/50 transition-colors group cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors leading-tight">{test.name}</h3>
                      {test.isPopular && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0 ml-2">Popular</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{test.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-primary">₹{test.price}</span>
                        {test.originalPrice && <span className="text-xs text-muted-foreground line-through ml-2">₹{test.originalPrice}</span>}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />{test.turnaroundTime}
                      </div>
                    </div>
                    <Button size="sm" className="w-full mt-3" asChild>
                      <Link href={`/tests/${test._id || test.id}`}>Book Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-1">Health Packages</h2>
              <p className="text-muted-foreground">Comprehensive wellness packages at great value</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/packages">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packagesLoading
              ? Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>)
              : packagesData?.data?.slice(0, 3).map((pkg: any) => (
                <Card key={pkg._id || pkg.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="inline-block text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full mb-3">{pkg.category}</div>
                    <h3 className="font-bold text-lg mb-2">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{pkg.description}</p>
                    <p className="text-xs text-muted-foreground mb-4">{pkg.testsIncluded?.length} tests included</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">₹{pkg.price}</span>
                        {pkg.originalPrice && <span className="text-sm text-muted-foreground line-through ml-2">₹{pkg.originalPrice}</span>}
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/packages/${pkg._id || pkg.id}`}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to take charge of your health?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">Join over a million Indians who trust Digital Diagnostic for their healthcare needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="rounded-full px-8">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full px-8 border-white/30 text-white hover:bg-white/10">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
