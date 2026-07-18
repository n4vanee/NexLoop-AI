'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Factory, Building, Recycle, Leaf, TrendingUp, Package, CheckCircle, AlertCircle, Activity, Server } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { AppShell } from '@/components/app-shell';
import { ProtectedRoute } from '@/components/protected-route';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchAllProfiles, fetchListings, fetchMatches, fetchActivityFeed } from '@/lib/data';
import type { Profile, WasteListing, Match, ActivityLog, UserRole } from '@/lib/types';
import { WASTE_CATEGORY_LABELS } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

function AdminContent() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, l, m, a] = await Promise.all([fetchAllProfiles(), fetchListings(), fetchMatches(), fetchActivityFeed(10)]);
        setProfiles(p); setListings(l); setMatches(m); setActivity(a);
      } finally { setLoading(false); }
    })();
  }, []);

  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    profiles.forEach((p) => { counts[p.role] = (counts[p.role] || 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v }));
  }, [profiles]);

  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((l) => { counts[l.category] = (counts[l.category] || 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({ name: WASTE_CATEGORY_LABELS[k as keyof typeof WASTE_CATEGORY_LABELS] || k, value: v }));
  }, [listings]);

  const totalCo2 = matches.reduce((s, m) => s + Number(m.co2_saved_kg), 0);
  const totalDiverted = matches.reduce((s, m) => s + Number(m.landfill_diverted_kg), 0);
  const totalValue = matches.reduce((s, m) => s + Number(m.total_value), 0);
  const verifiedOrgs = profiles.filter((p) => p.role === 'industry' || p.role === 'municipality').length;

  const pieColors = ['hsl(165 72% 24%)', 'hsl(172 70% 45%)', 'hsl(198 75% 55%)', 'hsl(45 85% 58%)'];

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" /> Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Platform-wide oversight and analytics</p>
          </div>
          <Badge variant="secondary" className="glass"><Server className="h-3 w-3 mr-1 text-accent" /> System Healthy</Badge>
        </div>

        {/* Platform stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={profiles.length} icon={Users} delay={0} />
          <StatCard title="Active Listings" value={listings.length} icon={Package} delay={0.1} />
          <StatCard title="Total Matches" value={matches.length} icon={TrendingUp} delay={0.15} />
          <StatCard title="Verified Orgs" value={verifiedOrgs} icon={CheckCircle} delay={0.2} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Platform CO2 Saved" value={`${(totalCo2 / 1000).toFixed(1)}T`} icon={Leaf} delay={0} />
          <StatCard title="Waste Diverted" value={`${(totalDiverted / 1000).toFixed(1)}T`} icon={Recycle} delay={0.1} />
          <StatCard title="Transaction Value" value={`₹${(totalValue / 100000).toFixed(1)}L`} icon={Package} delay={0.15} />
          <StatCard title="Avg Circularity" value={`${Math.round(profiles.reduce((s, p) => s + p.circularity_score, 0) / (profiles.length || 1))}`} icon={Activity} delay={0.2} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="glass border-border/40">
            <CardHeader>
              <CardTitle className="text-base">Users by Role</CardTitle>
              <CardDescription>Distribution of platform accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={roleDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem' }} />
                  <Bar dataKey="value" fill="hsl(152 85% 43%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass border-border/40">
            <CardHeader>
              <CardTitle className="text-base">Listings by Category</CardTitle>
              <CardDescription>Platform-wide waste distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={categoryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                    {categoryDistribution.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* User management table */}
        <Card className="glass border-border/40">
          <CardHeader>
            <CardTitle className="text-base">User Management</CardTitle>
            <CardDescription>{profiles.length} registered accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Matches</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.slice(0, 15).map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{p.full_name.charAt(0)}</AvatarFallback></Avatar>
                          <div><div className="text-sm font-medium">{p.full_name}</div><div className="text-xs text-muted-foreground">{p.email}</div></div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs capitalize">{p.role}</Badge></TableCell>
                      <TableCell className="text-sm">{p.organization || '—'}</TableCell>
                      <TableCell className="text-sm">{p.city || '—'}</TableCell>
                      <TableCell className="font-medium">{p.circularity_score}</TableCell>
                      <TableCell>{p.total_matches}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs bg-accent/15 text-accent">Active</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* System activity */}
        <Card className="glass border-border/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> System Activity</CardTitle>
            <CardDescription>Recent platform-wide events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
              {activity.map((a) => (
                <div key={a.id} className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Avatar className="h-7 w-7"><AvatarFallback className="bg-transparent text-xs text-primary">{a.user_name.charAt(0)}</AvatarFallback></Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.action}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{a.detail}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">{new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ProtectedRoute allowedRoles={['administrator']}>
        <AdminContent />
      </ProtectedRoute>
    </div>
  );
}
