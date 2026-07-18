'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  delay?: number;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, delay = 0, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={cn('glass border-border/40 card-hover', className)}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="font-display text-2xl md:text-3xl font-bold mt-1">{value}</p>
              {trend && (
                <p className={cn('text-xs mt-1.5 flex items-center gap-1', trend.positive ? 'text-accent' : 'text-destructive')}>
                  {trend.positive ? '↑' : '↓'} {trend.value}
                </p>
              )}
            </div>
            <div className="h-10 w-10 rounded-xl eco-gradient flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
