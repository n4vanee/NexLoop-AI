'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';

export default function Error() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-destructive/15 rounded-full blur-3xl animate-pulse-slow" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center max-w-md">
          <div className="flex justify-center mb-6">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          <h1 className="font-display text-7xl font-bold text-destructive">500</h1>
          <h2 className="font-display text-xl font-semibold mt-4">Something went wrong</h2>
          <p className="text-muted-foreground mt-2">
            An unexpected error occurred. Our team has been notified and is working on it.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Button onClick={() => window.location.reload()} className="eco-gradient text-primary-foreground">
              <RefreshCw className="h-4 w-4 mr-1.5" /> Try Again
            </Button>
            <Button variant="outline" asChild className="glass">
              <Link href="/"><Home className="h-4 w-4 mr-1.5" /> Go Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
