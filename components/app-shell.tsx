'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutDashboard, BarChart3, FileText, Map, Bot, User, Settings, Shield, Trophy, Bookmark } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/reports', label: 'Reports', icon: FileText },
  { href: '/map', label: 'Resource Map', icon: Map },
  { href: '/assistant', label: 'AI Assistant', icon: Bot },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role } = useAuth();

  const items = [...navItems];
  if (role === 'administrator') {
    items.push({ href: '/admin', label: 'Admin', icon: Shield });
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/40 glass-strong shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        <nav className="flex-1 flex flex-col gap-1 p-4">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  active ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <item.icon className="relative h-4 w-4 shrink-0" />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {user && (
          <div className="p-4 border-t border-border/40">
            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-medium">Circularity Score</span>
              </div>
              <div className="text-2xl font-bold font-display">{user.circularity_score}<span className="text-sm text-muted-foreground">/100</span></div>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full eco-gradient rounded-full transition-all" style={{ width: `${user.circularity_score}%` }} />
              </div>
            </div>
          </div>
        )}
      </aside>
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
