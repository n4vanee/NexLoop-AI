'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, Recycle, Leaf, TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { AppShell } from '@/components/app-shell';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { fetchLeaderboard } from '@/lib/data';
import type { Profile } from '@/lib/types';

function LeaderboardContent() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard(20).then(setLeaders).finally(() => setLoading(false));
  }, []);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);
  const podiumIcons = [Crown, Medal, Award];
  const podiumColors = ['from-amber-500/20 to-amber-500/5', 'from-slate-400/20 to-slate-400/5', 'from-orange-700/20 to-orange-700/5'];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-7 w-7 text-primary" /> Community Leaderboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Top contributors to the circular economy — ranked by leaderboard points</p>
        </div>

        {/* Podium */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {top3.map((l, i) => {
            const Icon = podiumIcons[i];
            return (
              <motion.div key={l.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`relative ${i === 0 ? 'md:scale-105' : ''}`}>
                <Card className={`glass-strong border-border/60 bg-gradient-to-b ${podiumColors[i]} card-hover`}>
                  <CardContent className="pt-6 text-center">
                    <div className="flex justify-center mb-2">
                      <Icon className={`h-8 w-8 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : 'text-orange-700'}`} />
                    </div>
                    <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-border/60">
                      <AvatarFallback className="bg-primary/15 text-primary font-bold">{l.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-sm truncate">{l.full_name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{l.organization || 'Citizen'}</p>
                    <div className="font-display text-xl font-bold mt-2 eco-text-gradient">{l.leaderboard_points.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Full leaderboard */}
        <Card className="glass border-border/40">
          <CardHeader>
            <CardTitle className="text-base">Full Rankings</CardTitle>
            <CardDescription>{leaders.length} organizations ranked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">Loading...</div>
              ) : rest.map((l, i) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${user?.id === l.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/30'}`}
                >
                  <div className="font-display text-lg font-bold w-8 text-center text-muted-foreground">{i + 4}</div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">{l.full_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{l.full_name}</span>
                      {user?.id === l.id && <Badge variant="secondary" className="text-xs">You</Badge>}
                      <Badge variant="outline" className="text-xs capitalize">{l.role}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{l.organization || 'Individual contributor'}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground"><Recycle className="h-3.5 w-3.5" />{(Number(l.total_diverted_kg) / 1000).toFixed(1)}T</div>
                    <div className="flex items-center gap-1 text-muted-foreground"><Leaf className="h-3.5 w-3.5" />{(Number(l.total_co2_saved_kg) / 1000).toFixed(1)}T</div>
                    <div className="flex items-center gap-1 text-muted-foreground"><TrendingUp className="h-3.5 w-3.5" />{l.total_matches}</div>
                  </div>
                  <div className="font-display font-bold text-sm w-20 text-right">{l.leaderboard_points.toLocaleString()}</div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ProtectedRoute>
        <LeaderboardContent />
      </ProtectedRoute>
    </div>
  );
}
