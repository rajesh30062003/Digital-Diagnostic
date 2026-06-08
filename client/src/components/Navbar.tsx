import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { ActivitySquare, Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/hooks/use-auth";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { token, role, clearAuth } = useAuthStore();
  const [, setLocation] = useLocation();

  const links = [
    { href: "/tests", label: "Tests" },
    { href: "/packages", label: "Packages" },
    { href: "/doctors", label: "Doctors" },
    { href: "/services", label: "Services" },
    { href: "/centers", label: "Centers" },
    { href: "/about", label: "About" },
  ];

  const handleLogout = () => {
    clearAuth();
    setLocation("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <ActivitySquare className="h-6 w-6 text-primary" />
          <span>Digital Diagnostic</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${role}`}><User className="h-4 w-4 mr-1" /> Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link href="/login">Login</Link></Button>
              <Button size="sm" asChild><Link href="/register">Register</Link></Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground py-1">
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t flex flex-col gap-2">
            {token ? (
              <>
                <Button variant="outline" size="sm" asChild onClick={() => setOpen(false)}>
                  <Link href={`/${role}`}>Dashboard</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setOpen(false); }}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild onClick={() => setOpen(false)}><Link href="/login">Login</Link></Button>
                <Button size="sm" asChild onClick={() => setOpen(false)}><Link href="/register">Register</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
