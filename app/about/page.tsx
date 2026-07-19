'use client';

import { motion } from 'framer-motion';
import { Recycle, Target, Leaf, TrendingDown, Users, Globe2, Zap, BarChart3 } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const values = [
  { icon: Target, title: 'Mission', desc: 'Eliminate industrial waste landfill by creating the world\'s largest AI-powered industrial symbiosis network.' },
  { icon: Leaf, title: 'Sustainability', desc: 'Every match on our platform diverts waste from landfill and reduces CO2 emissions — measurable, verifiable impact.' },
  { icon: TrendingDown, title: 'Efficiency', desc: 'AI matching reduces the time and cost of finding the right buyer for surplus material from weeks to minutes.' },
  { icon: Users, title: 'Community', desc: 'We connect industries, municipalities, and citizens in a shared circular economy ecosystem with transparent metrics.' },
];

const milestones = [
  { year: '2025', title: 'The Idea', desc: 'Born from a simple observation: industries throw away resources other industries are actively searching for.' },
  { year: '2026', title: 'Prototype Built', desc: 'Designed and shipped a working AI matching engine — surplus waste listings, price recommendations, and CO2 impact predictions.' },
  { year: '2026', title: 'Circularity Scoring & ESG Reports', desc: 'Added a 0–100 Circularity Score per organization and AI-generated sustainability reports, turning raw match data into something businesses could actually act on.' },
  { year: '2026', title: 'Demo-Ready at Scale', desc: 'Simulated a live marketplace with realistic seed data — waste listings, matches, and impact metrics' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="relative mx-auto max-w-4xl px-4 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="secondary" className="glass mb-4">
              <Globe2 className="h-3 w-3 mr-1.5 text-accent" />
              About NexLoop AI
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
              Building the <span className="eco-text-gradient">circular economy</span> with AI
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Industrial symbiosis — where one industry's waste becomes another's raw material — has existed for decades.
              NexLoop AI scales it with artificial intelligence, making matches that humans would miss and measuring impact that matters.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="glass border-border/40 card-hover h-full">
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg eco-gradient flex items-center justify-center mb-1">
                    <v.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-base">{v.title}</CardTitle>
                </CardHeader>
                <CardContent><CardDescription className="text-sm leading-relaxed">{v.desc}</CardDescription></CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 lg:px-8 py-16">
        <h2 className="font-display text-3xl font-bold text-center mb-12">Our journey</h2>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
          {milestones.map((m, i) => (
            <motion.div key={m.year} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative flex gap-6 mb-8 last:mb-0">
              <div className="h-12 w-12 rounded-full eco-gradient flex items-center justify-center shrink-0 z-10">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 glass rounded-xl p-4">
                <div className="flex items-center gap-3 mb-1">
                  <Badge variant="secondary" className="glass">{m.year}</Badge>
                  <h3 className="font-semibold">{m.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <Card className="glass border-border/40 overflow-hidden">
          <CardContent className="grid md:grid-cols-3 gap-6 p-8">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="font-display text-3xl font-bold">546T</div>
              <div className="text-sm text-muted-foreground">Total waste diverted</div>
            </div>
            <div className="text-center">
              <Leaf className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="font-display text-3xl font-bold">198T</div>
              <div className="text-sm text-muted-foreground">CO2 emissions saved</div>
            </div>
            <div className="text-center">
              <Recycle className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="font-display text-3xl font-bold">9,400</div>
              <div className="text-sm text-muted-foreground">Trees equivalent</div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
}
