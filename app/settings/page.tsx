'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Bell, Shield, Globe, Palette, Check } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { AppShell } from '@/components/app-shell';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/components/auth-provider';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

function SettingsContent() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [notifMatch, setNotifMatch] = useState(true);
  const [notifPrice, setNotifPrice] = useState(true);
  const [notifReport, setNotifReport] = useState(false);
  const [notifSystem, setNotifSystem] = useState(true);
  const [language, setLanguage] = useState('en');

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-7 w-7 text-primary" /> Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your preferences and account configuration</p>
        </div>

        {/* Appearance */}
        <Card className="glass border-border/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> Appearance</CardTitle>
            <CardDescription>Customize how NexLoop AI looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <div>
                  <Label>Theme</Label>
                  <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('light')} className={theme === 'light' ? 'eco-gradient text-primary-foreground' : 'glass'}>
                  {theme === 'light' && <Check className="h-3.5 w-3.5 mr-1" />} Light
                </Button>
                <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('dark')} className={theme === 'dark' ? 'eco-gradient text-primary-foreground' : 'glass'}>
                  {theme === 'dark' && <Check className="h-3.5 w-3.5 mr-1" />} Dark
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="glass border-border/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notifications</CardTitle>
            <CardDescription>Choose what alerts you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Match Alerts', desc: 'Get notified when AI finds a new match', value: notifMatch, setter: setNotifMatch },
              { label: 'Price Alerts', desc: 'Market price changes for your waste categories', value: notifPrice, setter: setNotifPrice },
              { label: 'Report Ready', desc: 'When AI-generated reports are available', value: notifReport, setter: setNotifReport },
              { label: 'System Updates', desc: 'Platform announcements and maintenance', value: notifSystem, setter: setNotifSystem },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between">
                <div>
                  <Label>{n.label}</Label>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch checked={n.value} onCheckedChange={n.setter} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card className="glass border-border/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Language & Region</CardTitle>
            <CardDescription>Set your preferred language and measurement units</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label>Language</Label><p className="text-xs text-muted-foreground">Interface language</p></div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                  <SelectItem value="te">Telugu</SelectItem>
                  <SelectItem value="mr">Marathi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="glass border-border/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Security</CardTitle>
            <CardDescription>Account security and access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline" size="sm" className="glass" onClick={() => toast.info('2FA setup — connect Supabase Auth MFA to enable')}>Enable 2FA</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Active Sessions</Label>
                <p className="text-xs text-muted-foreground">Manage your logged-in devices</p>
              </div>
              <Badge variant="secondary" className="glass">1 active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Change Password</Label>
                <p className="text-xs text-muted-foreground">Update your account password</p>
              </div>
              <Button variant="outline" size="sm" className="glass" onClick={() => toast.info('Password change flow — connect Supabase Auth')}>Change</Button>
            </div>
          </CardContent>
        </Card>

        {/* Account info */}
        <Card className="glass border-border/40">
          <CardHeader>
            <CardTitle className="text-base">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{user?.email}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Role</span><Badge variant="secondary" className="capitalize">{user?.role}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Organization</span><span className="font-medium">{user?.organization || 'Individual'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Member Since</span><span className="font-medium">{user && new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ProtectedRoute>
        <SettingsContent />
      </ProtectedRoute>
    </div>
  );
}
