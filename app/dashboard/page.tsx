'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Recycle, TrendingUp, Leaf, Package, ArrowUpRight, Activity, Bookmark, Search, ChevronUp, ChevronDown, Bot, Sparkles, FileText, Download, Filter } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { AppShell } from '@/components/app-shell';
import { ProtectedRoute } from '@/components/protected-route';
import { StatCard } from '@/components/stat-card';
import { LeafletMapSafe as LeafletMap } from '@/components/leaflet-map-safe';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { WASTE_CATEGORY_LABELS, type Match, type WasteListing, type ActivityLog, type Notification } from '@/lib/types';
import { fetchListings, fetchMatches, fetchActivityFeed, fetchNotifications, toggleBookmark, fetchBookmarkedListingIds } from '@/lib/data';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'sonner';

const confidenceColors: Record<string, string> = { high: 'hsl(152 85% 43%)', medium: 'hsl(45 85% 58%)', low: 'hsl(25 90% 56%)' };
const statusColors: Record<string, string> = { pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', accepted: 'bg-blue-500/15 text-blue-600 dark:text-blue-400', completed: 'bg-accent/15 text-accent', rejected: 'bg-destructive/15 text-destructive', in_transit: 'bg-purple-500/15 text-purple-600 dark:text-purple-400' };

function DashboardContent() {
  const { user } = useAuth();
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'confidence'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    (async () => {
      try {
        const [l, m, a, n] = await Promise.all([fetchListings(), fetchMatches(), fetchActivityFeed(15), user ? fetchNotifications(user.id) : Promise.resolve([])]);
        setListings(l);
        setMatches(m);
        setActivity(a);
        setNotifications(n);
        if (user) {
          const bm = await fetchBookmarkedListingIds(user.id);
          setBookmarkedIds(bm);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const stats = useMemo(() => {
    const totalDiverted = matches.reduce((s, m) => s + Number(m.landfill_diverted_kg), 0);
    const totalCo2 = matches.reduce((s, m) => s + Number(m.co2_saved_kg), 0);
    const totalValue = matches.reduce((s, m) => s + Number(m.total_value), 0);
    const activeMatches = matches.filter((m) => m.status === 'pending' || m.status === 'accepted' || m.status === 'in_transit').length;
    return { totalDiverted, totalCo2, totalValue, activeMatches };
  }, [matches]);

  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    return months.map((m, i) => ({
      month: m,
      diverted: Math.round(8000 + Math.random() * 6000 + i * 1500),
      co2: Math.round(2800 + Math.random() * 2000 + i * 500),
    }));
  }, []);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((l) => { counts[l.category] = (counts[l.category] || 0) + 1; });
    return Object.entries(counts).map(([k, v]) => ({ name: WASTE_CATEGORY_LABELS[k as keyof typeof WASTE_CATEGORY_LABELS] || k, value: v, key: k }));
  }, [listings]);

  const pieColors = ['hsl(165 72% 24%)', 'hsl(172 70% 45%)', 'hsl(198 75% 55%)', 'hsl(45 85% 58%)', 'hsl(25 90% 56%)'];

  const filteredMatches = useMemo(() => {
    let result = matches;
    if (search) result = result.filter((m) => m.listing_title.toLowerCase().includes(search.toLowerCase()) || m.supplier_name.toLowerCase().includes(search.toLowerCase()) || m.receiver_name.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== 'all') result = result.filter((m) => m.status === statusFilter);
    if (categoryFilter !== 'all') result = result.filter((m) => m.category === categoryFilter);
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else if (sortBy === 'value') cmp = Number(a.total_value) - Number(b.total_value);
      else if (sortBy === 'confidence') cmp = a.confidence_score - b.confidence_score;
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [matches, search, statusFilter, categoryFilter, sortBy, sortDir]);

  const mapMarkers = listings.filter((l) => l.latitude && l.longitude).map((l) => ({
    id: l.id,
    lat: l.latitude!,
    lng: l.longitude!,
    title: l.title,
    popup: `${l.owner_org || l.owner_name} · ${Number(l.quantity_kg).toLocaleString()} kg · ${WASTE_CATEGORY_LABELS[l.category]}`,
    category: l.category,
  }));

  const handleBookmark = async (listingId: string) => {
    if (!user) return;
    const isBookmarked = bookmarkedIds.includes(listingId);
    setBookmarkedIds((prev) => isBookmarked ? prev.filter((id) => id !== listingId) : [...prev, listingId]);
    await toggleBookmark(user.id, listingId, isBookmarked);
    toast.success(isBookmarked ? 'Removed bookmark' : 'Bookmarked listing');
  };

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Welcome back, {user?.full_name.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {user?.organization ? `${user.organization} · ` : ''}Circularity Score: {user?.circularity_score}/100
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="glass" onClick={() => toast.info('AI match engine — configure AI_API_KEY in edge function secrets to enable')}>
              <Sparkles className="h-4 w-4 mr-1.5 text-accent" />
              Run AI Match
            </Button>
            <Button size="sm" asChild className="eco-gradient text-primary-foreground">
              <a href="/reports">Generate Report <FileText className="ml-1.5 h-4 w-4" /></a>
            </Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Waste Diverted" value={`${(stats.totalDiverted / 1000).toFixed(1)}T`} icon={Recycle} trend={{ value: '12.5% this month', positive: true }} delay={0} />
          <StatCard title="CO2 Saved" value={`${(stats.totalCo2 / 1000).toFixed(1)}T`} icon={Leaf} trend={{ value: '8.2% this month', positive: true }} delay={0.1} />
          <StatCard title="Active Matches" value={stats.activeMatches} icon={TrendingUp} trend={{ value: '3 new this week', positive: true }} delay={0.15} />
          <StatCard title="Total Value" value={`₹${(stats.totalValue / 100000).toFixed(1)}L`} icon={Package} trend={{ value: '15.3% this quarter', positive: true }} delay={0.2} />
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="glass border-border/40 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Waste Diversion & CO2 Savings</CardTitle>
              <CardDescription>Monthly trend over the last 7 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(152 85% 43%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(152 85% 43%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(172 65% 51%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(172 65% 51%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem' }} />
                  <Area type="monotone" dataKey="diverted" stroke="hsl(152 85% 43%)" fill="url(#g1)" strokeWidth={2} name="Waste Diverted (kg)" />
                  <Area type="monotone" dataKey="co2" stroke="hsl(172 65% 51%)" fill="url(#g2)" strokeWidth={2} name="CO2 Saved (kg)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass border-border/40">
            <CardHeader>
              <CardTitle className="text-base">Listings by Category</CardTitle>
              <CardDescription>Distribution across waste types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                    {categoryData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categoryData.map((c, i) => (
                  <div key={c.key} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                      <span>{c.name}</span>
                    </div>
                    <span className="text-muted-foreground">{c.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map + Activity */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="glass border-border/40 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Resource Map</CardTitle>
              <CardDescription>Active waste listings across India</CardDescription>
            </CardHeader>
            <CardContent>
              <LeafletMap markers={mapMarkers} height={320} />
            </CardContent>
          </Card>

          <Card className="glass border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[320px] overflow-y-auto scrollbar-thin pr-1">
                {activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                ) : activity.map((a) => (
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

        {/* Matches table */}
        <Card className="glass border-border/40">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">AI Matches</CardTitle>
                <CardDescription>{filteredMatches.length} matches found</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search matches..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 w-44" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(WASTE_CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Listing</TableHead>
                    <TableHead>Supplier → Receiver</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Qty (kg)</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('confidence')}>
                      <div className="flex items-center gap-1">Confidence {sortBy === 'confidence' && (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('value')}>
                      <div className="flex items-center gap-1">CO2 Saved {sortBy === 'value' && (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('date')}>
                      <div className="flex items-center gap-1">Date {sortBy === 'date' && (sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatches.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No matches found</TableCell></TableRow>
                  ) : filteredMatches.slice(0, 12).map((m) => (
                    <TableRow key={m.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium max-w-[200px] truncate">{m.listing_title}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">{m.supplier_name}</span>
                          <span className="flex items-center gap-1 text-xs"><ArrowUpRight className="h-3 w-3 text-accent" />{m.receiver_name}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{WASTE_CATEGORY_LABELS[m.category as keyof typeof WASTE_CATEGORY_LABELS] || m.category}</Badge></TableCell>
                      <TableCell>{Number(m.quantity_kg).toLocaleString()}</TableCell>
                      <TableCell className="font-medium">₹{Number(m.total_value).toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${m.confidence_score * 100}%`, background: confidenceColors[m.confidence] }} />
                          </div>
                          <span className="text-xs font-medium">{Math.round(m.confidence_score * 100)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-accent font-medium">{Number(m.co2_saved_kg).toLocaleString()} kg</TableCell>
                      <TableCell><Badge variant="secondary" className={`text-xs ${statusColors[m.status]}`}>{m.status.replace('_', ' ')}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Listings grid */}
        <Card className="glass border-border/40">
          <CardHeader>
            <CardTitle className="text-base">Available Listings</CardTitle>
            <CardDescription>Browse surplus waste from all organizations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.filter((l) => l.status === 'available').slice(0, 6).map((l) => (
                <div key={l.id} className="glass rounded-xl p-4 border border-border/40 card-hover">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">{WASTE_CATEGORY_LABELS[l.category]}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleBookmark(l.id)}>
                      <Bookmark className={`h-3.5 w-3.5 ${bookmarkedIds.includes(l.id) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                  <h4 className="font-medium text-sm line-clamp-2">{l.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{l.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                    <span className="text-sm font-medium">{Number(l.quantity_kg).toLocaleString()} kg</span>
                    <span className="text-sm font-medium text-primary">₹{l.unit_price_per_kg}/kg</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{l.city}, {l.country}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
    </div>
  );
}
