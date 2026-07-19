'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, Loader2, MessageSquare } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setName(''); setEmail(''); setSubject(''); setMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="relative mx-auto max-w-4xl px-4 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
              Get in <span className="eco-text-gradient">touch</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Questions about industrial symbiosis, partnership opportunities, or platform access? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: Mail, title: 'Email', value: 'hello@nexloop.ai', desc: 'We reply within 24 hours' },
            { icon: Phone, title: 'Phone', value: '+91 9342524057', desc: 'Mon-Fri, 9am-6pm IST' },
            { icon: MapPin, title: 'Office', value: 'Chennai, India', desc: 'Indiranagar, 560038' },
          ].map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass border-border/40 card-hover">
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-lg eco-gradient flex items-center justify-center mb-3">
                    <c.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-sm font-medium mt-1">{c.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-strong border-border/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Send us a message</CardTitle>
              </div>
              <CardDescription>Fill out the form below and we'll get back to you shortly</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="What's this about?" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Tell us more..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required />
                </div>
                <Button type="submit" className="eco-gradient text-primary-foreground h-11 px-8" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send message <Send className="ml-2 h-4 w-4" /></>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
