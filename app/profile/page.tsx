'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Building2, Recycle, Leaf, TrendingUp, Award, Calendar, Upload, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { AppShell } from '@/components/app-shell';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

function ProfileContent() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [country, setCountry] = useState(user?.country || 'India');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: fullName,
      organization: organization || null,
      phone: phone || null,
      city: city || null,
      country,
    });
    setSaving(false);
    if (error) toast.error('Failed to update profile');
    else toast.success('Profile updated');
  };

  if (!user) return null;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account and organization details</p>
        </div>

        {/* Profile header */}
        <Card className="glass-strong border-border/60 overflow-hidden">
          <div className="h-32 eco-gradient relative">
            <div className="absolute inset-0 grid-bg opacity-10" />
          </div>
          <CardContent className="pt-0 -mt-12">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <Avatar className="h-24 w-24 border-4 border-card shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold font-display">
                  {user.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold">{user.full_name}</h2>
                  <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.organization || 'Individual contributor'}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <Button variant="outline" size="sm" className="glass" onClick={() => toast.info('Image upload — connect Supabase Storage to enable')}>
                <Upload className="h-4 w-4 mr-1.5" /> Upload Photo
              </Button>
            </div>

            {/* Impact stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {[
                { icon: Recycle, label: 'Waste Diverted', value: `${(Number(user.total_diverted_kg) / 1000).toFixed(1)}T` },
                { icon: Leaf, label: 'CO2 Saved', value: `${(Number(user.total_co2_saved_kg) / 1000).toFixed(1)}T` },
                { icon: TrendingUp, label: 'Total Matches', value: user.total_matches },
                { icon: Award, label: 'Circularity Score', value: `${user.circularity_score}/100` },
              ].map((s) => (
                <div key={s.label} className="glass rounded-xl p-3 text-center">
                  <s.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                  <div className="font-display text-lg font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card className="glass border-border/40">
          <CardHeader>
            <CardTitle className="text-base">Edit Profile</CardTitle>
            <CardDescription>Update your personal and organization information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" value={user.email} disabled className="pl-10 opacity-60" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="organization" value={organization} onChange={(e) => setOrganization(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="eco-gradient text-primary-foreground">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ProtectedRoute>
        <ProfileContent />
      </ProtectedRoute>
    </div>
  );
}
