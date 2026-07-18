'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Leaf, Recycle, Package, Download, Calculator, Bot, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { AppShell } from '@/components/app-shell';
import { ProtectedRoute } from '@/components/protected-route';
import { StatCard } from '@/components/stat-card';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WASTE_CATEGORY_LABELS, type Match, type WasteListing, type WasteCategory } from '@/lib/types';
import { fetchListings, fetchMatches } from '@/lib/data';
import { aiPredictImpact } from '@/lib/ai-service';
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, CartesianGrid, Legend, RadialBarChart, RadialBar } from 'recharts';
import { toast } from 'sonner';

function AnalyticsContent() {
  const { user } = useAuth();
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Carbon calculator state
  const [calcCategory, setCalcCategory] = useState<WasteCategory>('scrap_metal');
  const [calcQty, setCalcQty] = useState('1000');
  const [calcResult, setCalcResult] = useState<{ co2SavedKg: number; landfillDivertedKg: number; treesEquivalent: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [l, m] = await Promise.all([fetchListings(), fetchMatches()]);
        setListings(l);
        setMatches(m);
      } finally { setLoading(false); }
    })();
  }, []);

  const categoryImpact = useMemo(() => {
    const byCat: Record<string, { co2: number; diverted: number; count: number }> = {};
    matches.forEach((m) => {
      if (!byCat[m.category]) byCat[m.category] = { co2: 0, diverted: 0, count: 0 };
      byCat[m.category].co2 += Number(m.co2_saved_kg);
      byCat[m.category].diverted += Number(m.landfill_diverted_kg);
      byCat[m.category].count += 1;
    });
    return Object.entries(byCat).map(([k, v]) => ({
      name: WASTE_CATEGORY_LABELS[k as keyof typeof WASTE_CATEGORY_LABELS] || k,
      co2: Math.round(v.co2),
      diverted: Math.round(v.diverted),
      matches: v.count,
    }));
  }, [matches]);

  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    return months.map((m, i) => ({
      month: m,
      matches: Math.round(8 + Math.random() * 12 + i * 2),
      revenue: Math.round(150000 + Math.random() * 80000 + i * 25000),
    }));
  }, []);

  const radarData = useMemo(() => [
    { metric: 'Diversion', value: 85 },
    { metric: 'CO2 Savings', value: 78 },
    { metric: 'Match Rate', value: 92 },
    { metric: 'Response Time', value: 88 },
    { metric: 'Recovery Rate', value: 76 },
    { metric: 'Compliance', value: 94 },
  ], []);

  const radialData = useMemo(() => [{ name: 'Score', value: user?.circularity_score || 0, fill: 'hsl(152 85% 43%)' }], [user]);

  const totalCo2 = matches.reduce((s, m) => s + Number(m.co2_saved_kg), 0);
  const totalDiverted = matches.reduce((s, m) => s + Number(m.landfill_diverted_kg), 0);
  const totalValue = matches.reduce((s, m) => s + Number(m.total_value), 0);

  const handleCalculate = async () => {
    const qty = parseFloat(calcQty);
    if (!qty || qty <= 0) { toast.error('Enter a valid quantity'); return; }
    const result = await aiPredictImpact(calcCategory, qty);
    setCalcResult(result);
    toast.success('Impact calculated');
  };

  const handleExportCSV = () => {
    const headers = ['Listing', 'Supplier', 'Receiver', 'Category', 'Quantity (kg)', 'Value (INR)', 'CO2 Saved (kg)', 'Status', 'Date'];
    const rows = matches.map((m) => [m.listing_title, m.supplier_name, m.receiver_name, m.category, m.quantity_kg, m.total_value, m.co2_saved_kg, m.status, new Date(m.created_at).toLocaleDateString()]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'nexloop-analytics.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics exported as CSV');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">Deep dive into your circular economy performance</p>
          </div>
          <Button variant="outline" size="sm" className="glass" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total CO2 Saved" value={`${(totalCo2 / 1000).toFixed(1)}T`} icon={Leaf} delay={0} />
          <StatCard title="Total Diverted" value={`${(totalDiverted / 1000).toFixed(1)}T`} icon={Recycle} delay={0.1} />
          <StatCard title="Total Matches" value={matches.length} icon={TrendingUp} delay={0.15} />
          <StatCard title="Total Value" value={`₹${(totalValue / 100000).toFixed(1)}L`} icon={Package} delay={0.2} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="glass border-border/40">
            <CardHeader>
              <CardTitle className="text-base">CO2 Impact by Category</CardTitle>
              <CardDescription>Kilograms of CO2 saved per waste category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryImpact}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem' }} />
                  <Bar dataKey="co2" fill="hsl(152 85% 43%)" radius={[6, 6, 0, 0]} name="CO2 Saved (kg)" />
                  <Bar dataKey="diverted" fill="hsl(172 65% 51%)" radius={[6, 6, 0, 0]} name="Diverted (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass border-border/40">
            <CardHeader>
              <CardTitle className="text-base">Matches & Revenue Trend</CardTitle>
              <CardDescription>Monthly match count and transaction value</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="matches" stroke="hsl(152 85% 43%)" strokeWidth={2} dot={{ r: 4 }} name="Matches" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="hsl(172 65% 51%)" strokeWidth={2} dot={{ r: 4 }} name="Revenue (₹)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="glass border-border/40">
            <CardHeader>
              <CardTitle className="text-base">Circularity Radar</CardTitle>
              <CardDescription>Performance across key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Radar dataKey="value" stroke="hsl(152 85% 43%)" fill="hsl(152 85% 43%)" fillOpacity={0.3} strokeWidth={2} />
                  <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem' }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass border-border/40">
            <CardHeader>
              <CardTitle className="text-base">Circularity Score</CardTitle>
              <CardDescription>Your overall circular economy rating</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadialBarChart innerRadius="40%" outerRadius="100%" data={radialData} startAngle={90} endAngle={-270}>
                  <RadialBar background dataKey="value" cornerRadius={12} />
                  <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '0.75rem' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="text-center -mt-16">
                <div className="font-display text-4xl font-bold eco-text-gradient">{user?.circularity_score}</div>
                <div className="text-xs text-muted-foreground">out of 100</div>
              </div>
            </CardContent>
          </Card>

          {/* Carbon Footprint Calculator */}
          <Card className="glass border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" />Carbon Footprint Calculator</CardTitle>
              <CardDescription>Estimate impact of diverting waste</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Waste Category</Label>
                <Select value={calcCategory} onValueChange={(v) => setCalcCategory(v as WasteCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(WASTE_CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qty">Quantity (kg)</Label>
                <Input id="qty" type="number" value={calcQty} onChange={(e) => setCalcQty(e.target.value)} placeholder="1000" />
              </div>
              <Button onClick={handleCalculate} className="w-full eco-gradient text-primary-foreground" size="sm">
                <Sparkles className="h-4 w-4 mr-1.5 text-accent" /> Calculate Impact
              </Button>
              {calcResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-2 border-t border-border/40">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">CO2 Saved</span><span className="font-medium text-accent">{calcResult.co2SavedKg.toLocaleString()} kg</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Landfill Diverted</span><span className="font-medium">{calcResult.landfillDivertedKg.toLocaleString()} kg</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Trees Equivalent</span><span className="font-medium text-primary">{calcResult.treesEquivalent} trees</span></div>
                </motion.div>
              )}
              <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                <Bot className="h-3 w-3" /> AI-powered estimates via Groq (Llama 3.3 70B)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ProtectedRoute>
        <AnalyticsContent />
      </ProtectedRoute>
    </div>
  );
}
