import React from "react";
import { Link } from "wouter";
import { ActivitySquare } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <ActivitySquare className="h-5 w-5 text-primary" />
              <span>Digital Diagnostic</span>
            </Link>
            <p className="text-sm text-muted-foreground">Precision diagnostics, delivered with care. Trusted by 1M+ patients across India.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tests" className="hover:text-foreground">Lab Tests</Link></li>
              <li><Link href="/packages" className="hover:text-foreground">Health Packages</Link></li>
              <li><Link href="/doctors" className="hover:text-foreground">Doctors</Link></li>
              <li><Link href="/centers" className="hover:text-foreground">Centers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              <li><Link href="/services" className="hover:text-foreground">Our Services</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Digital Diagnostic by Tech Knife. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
