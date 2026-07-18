'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Map as MapIcon, Filter, Search, MapPin, Package, Leaf, Recycle } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { AppShell } from '@/components/app-shell';
import { ProtectedRoute } from '@/components/protected-route';
import { LeafletMapSafe as LeafletMap } from '@/components/leaflet-map-safe';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WASTE_CATEGORY_LABELS, type WasteListing, type WasteCategory } from '@/lib/types';
import { fetchListings } from '@/lib/data';

function MapContent() {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchListings().then(setListings).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = listings;
    if (search) result = result.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()) || l.city?.toLowerCase().includes(search.toLowerCase()) || l.owner_org?.toLowerCase().includes(search.toLowerCase()));
    if (categoryFilter !== 'all') result = result.filter((l) => l.category === categoryFilter);
    return result;
  }, [listings, search, categoryFilter]);

  const markers = filtered.filter((l) => l.latitude && l.longitude).map((l) => ({
    id: l.id, lat: l.latitude!, lng: l.longitude!, title: l.title,
    popup: `${l.owner_org || l.owner_name} · ${Number(l.quantity_kg).toLocaleString()} kg · ₹${l.unit_price_per_kg}/kg`,
    category: l.category,
  }));

  const categoryColors: Record<string, string> = {
    scrap_metal: '#64748b', plastic: '#3b82f6', textile: '#a855f7', e_waste: '#f59e0b', food_agro: '#22c55e',
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Resource Map</h1>
          <p className="text-muted-foreground text-sm mt-1">Geographic view of all surplus waste listings across India</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by title, city, or organization..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44"><Filter className="h-4 w-4 mr-1.5" /><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(WASTE_CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(WASTE_CATEGORY_LABELS).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 text-sm">
              <div className="h-3 w-3 rounded-full" style={{ background: categoryColors[k] }} />
              <span className="text-muted-foreground">{v}</span>
            </div>
          ))}
        </div>

        {/* Map */}
        <Card className="glass border-border/40">
          <CardContent className="p-2">
            {loading ? (
              <div className="h-[500px] flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading map...</div></div>
            ) : (
              <LeafletMap markers={markers} height={500} />
            )}
          </CardContent>
        </Card>

        {/* Listing cards */}
        <div>
          <h2 className="font-display text-lg font-semibold mb-3">{filtered.length} Listings</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((l, i) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="glass border-border/40 card-hover h-full">
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">{WASTE_CATEGORY_LABELS[l.category]}</Badge>
                      <Badge variant="outline" className="text-xs">Grade {l.quality_grade}</Badge>
                    </div>
                    <h4 className="font-medium text-sm line-clamp-2">{l.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{l.description}</p>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Package className="h-3.5 w-3.5" />{Number(l.quantity_kg).toLocaleString()} kg</div>
                      <div className="flex items-center gap-1 text-xs font-medium text-primary">₹{l.unit_price_per_kg}/kg</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5"><MapPin className="h-3 w-3" />{l.city}, {l.country}</div>
                    <div className="text-xs text-muted-foreground mt-1">{l.owner_org || l.owner_name}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function MapPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ProtectedRoute>
        <MapContent />
      </ProtectedRoute>
    </div>
  );
}
