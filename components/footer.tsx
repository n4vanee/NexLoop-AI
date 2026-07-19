'use client';

import Link from 'next/link';
import { Recycle, Mail, MapPin, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Recycle className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-bold">NexLoop AI</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              AI-powered industrial symbiosis platform turning industrial surplus waste into resources.
              Building the circular economy, one match at a time.
            </p>
            <div className="flex gap-3 mt-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Github className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/analytics" className="hover:text-primary transition-colors">Analytics</Link></li>
              <li><Link href="/map" className="hover:text-primary transition-colors">Resource Map</Link></li>
              <li><Link href="/assistant" className="hover:text-primary transition-colors">AI Assistant</Link></li>
              <li><Link href="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> hello@nexloop.ai</li>
              <li className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Chennai, India</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NexLoop AI. Built for the Clean & Green Technology .
          </p>
          <p className="text-xs text-muted-foreground">
            Powering the circular economy with AI.
          </p>
        </div>
      </div>
    </footer>
  );
}
