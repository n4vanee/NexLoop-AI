'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Recycle, ArrowRight, Sparkles, TrendingUp, Leaf, Bot, MapPin, BarChart3, FileText, Factory, Building2, Users, ShieldCheck, Zap, Globe2 } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  { icon: Bot, title: 'AI Waste-to-Resource Matching', desc: 'Our AI engine analyzes material specs, proximity, and processing capacity to match surplus waste with industries that can reuse it as raw material.' },
  { icon: TrendingUp, title: 'AI Price Recommendation', desc: 'Get fair, market-aware price suggestions for every listing based on material quality, category, and current demand patterns.' },
  { icon: Leaf, title: 'CO2 & Landfill Impact Prediction', desc: 'Every potential match is scored for environmental impact — CO2 saved, landfill diverted, and tree-equivalent calculations.' },
  { icon: Sparkles, title: 'Circularity Score (0-100)', desc: 'Each organization gets an AI-computed Circularity Score that reflects their circular economy engagement and sustainability performance.' },
  { icon: FileText, title: 'AI-Generated ESG Reports', desc: 'Generate professional sustainability and ESG reports with AI-written narratives, ready for stakeholders and regulators.' },
  { icon: Bot, title: 'AI Chatbot Assistant', desc: 'Ask questions, get match recommendations, and navigate the platform with our conversational AI assistant.' },
];

const roles = [
  { icon: Users, title: 'Citizens', desc: 'Track local waste initiatives, earn leaderboard points, and contribute to community circular economy goals.' },
  { icon: Factory, title: 'Industries', desc: 'List surplus waste, receive AI matches, manage transactions, and generate compliance reports.' },
  { icon: Building2, title: 'Municipalities', desc: 'Manage city-wide waste streams, connect with recyclers, and track municipal circularity metrics.' },
  { icon: ShieldCheck, title: 'Administrators', desc: 'Oversee platform health, verify organizations, and access system-wide analytics and controls.' },
];

const stats = [
  { value: '546T', label: 'Waste Diverted' },
  { value: '198T', label: 'CO2 Saved' },
  { value: '186', label: 'Active Matches' },
  { value: '42', label: 'Partner Orgs' },
];

const categories = [
  { name: 'Scrap Metal', icon: '⚙️', count: '12 listings' },
  { name: 'Plastic', icon: '🧴', count: '18 listings' },
  { name: 'Textile', icon: '🧵', count: '8 listings' },
  { name: 'E-Waste', icon: '💻', count: '15 listings' },
  { name: 'Food & Agro', icon: '🌾', count: '22 listings' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-slow" />

        <div className="relative mx-auto max-w-7xl px-4 lg:px-8 pt-20 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="secondary" className="mb-6 glass border-primary/20">
              <Sparkles className="h-3 w-3 mr-1.5 text-accent" />
              AI-Powered Industrial Symbiosis
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
              Turn industrial waste into
              <span className="block eco-text-gradient">resources worth recovering</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              NexLoop AI matches surplus industrial waste — scrap metal, plastic, textile, e-waste, and food waste — with industries that can reuse it as raw material. Stop sending value to landfill.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="eco-gradient text-primary-foreground glow-primary h-12 px-8 text-base">
                <Link href="/signup">
                  Start matching waste
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="glass h-12 px-8 text-base">
                <Link href="/about">See how it works</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-6 text-center card-hover">
                <div className="font-display text-3xl md:text-4xl font-bold eco-text-gradient">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Waste categories we handle</h2>
          <p className="text-muted-foreground mt-2">Five major industrial waste streams, one AI matching engine</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="glass border-border/40 card-hover text-center">
                <CardContent className="pt-6 pb-6">
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <div className="font-medium">{cat.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{cat.count}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="glass mb-4">
            <Zap className="h-3 w-3 mr-1.5 text-accent" />
            Core AI Features
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Intelligence built into every match</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Six AI-powered capabilities that make circular economy transactions faster, smarter, and more transparent.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass border-border/40 card-hover h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl eco-gradient flex items-center justify-center mb-2">
                    <f.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{f.desc}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold">Built for every stakeholder</h2>
          <p className="text-muted-foreground mt-2">Role-based dashboards for citizens, industries, municipalities, and administrators</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass border-border/40 card-hover h-full">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-1">
                    <r.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{r.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{r.desc}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl eco-gradient p-12 md:p-16 text-center"
        >
          <div className="absolute inset-0 grid-bg opacity-10" />
          <div className="relative">
            <Globe2 className="h-12 w-12 text-primary-foreground mx-auto mb-4" />
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground">
              Join the circular economy
            </h2>
            <p className="text-primary-foreground/80 mt-4 max-w-2xl mx-auto text-lg">
              Every kilogram of waste matched is a kilogram kept out of landfill. Start your sustainability journey today.
            </p>
            <Button size="lg" variant="secondary" asChild className="mt-8 h-12 px-8 text-base">
              <Link href="/signup">
                Create your account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
