'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Recycle, Home, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse-slow" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative text-center max-w-md">
          <div className="flex justify-center mb-6">
            <Recycle className="h-16 w-16 text-primary animate-float" />
          </div>
          <h1 className="font-display text-7xl font-bold eco-text-gradient">404</h1>
          <h2 className="font-display text-xl font-semibold mt-4">Page not found</h2>
          <p className="text-muted-foreground mt-2">
            This page may have been recycled. Let's get you back to something useful.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Button asChild className="eco-gradient text-primary-foreground">
              <Link href="/"><Home className="h-4 w-4 mr-1.5" /> Go Home</Link>
            </Button>
            <Button variant="outline" asChild className="glass">
              <Link href="/dashboard"><ArrowLeft className="h-4 w-4 mr-1.5" /> Dashboard</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
