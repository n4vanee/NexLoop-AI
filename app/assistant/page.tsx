'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Loader2, Sparkles, Trash2, User } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { AppShell } from '@/components/app-shell';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { aiChat } from '@/lib/ai-service';
import type { ChatMessage } from '@/lib/types';
import { toast } from 'sonner';

const suggestedPrompts = [
  'How does AI matching work?',
  'What is my Circularity Score?',
  'How much CO2 have I saved?',
  'Generate an ESG report',
  'Find matches for my plastic waste',
];

function AssistantContent() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);
      if (data && data.length > 0) {
        setMessages(data as ChatMessage[]);
      } else {
        const welcome: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: `Hello ${user?.full_name.split(' ')[0] || 'there'}! I'm NexLoop AI, your industrial symbiosis assistant. I can help you with waste-to-resource matching, price recommendations, CO2 impact predictions, ESG reports, and circularity scores. What would you like to know?`,
          created_at: new Date().toISOString(),
        };
        setMessages([welcome]);
      }
    })();
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const message = (text || input).trim();
    if (!message || loading) return;
    setInput('');
    setLoading(true);

    const userMsg: ChatMessage = { id: 'temp-user', role: 'user', content: message, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // AI call goes through the centralized client (lib/ai-client.ts) → edge function
      const reply = await aiChat(message, user?.organization ?? undefined);

      const assistantMsg: ChatMessage = { id: 'temp-assistant', role: 'assistant', content: reply, created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, assistantMsg]);

      if (user) {
        await supabase.from('chat_messages').insert([
          { user_id: user.id, role: 'user', content: message },
          { user_id: user.id, role: 'assistant', content: reply },
        ]);
      }
    } catch (e) {
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!user) return;
    await supabase.from('chat_messages').delete().eq('user_id', user.id);
    setMessages([{ id: 'welcome', role: 'assistant', content: 'Conversation cleared. How can I help you?', created_at: new Date().toISOString() }]);
    toast.success('Chat cleared');
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Bot className="h-7 w-7 text-primary" /> AI Assistant
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Ask about matches, pricing, CO2 impact, reports, and circularity</p>
          </div>
          <Button variant="outline" size="sm" className="glass" onClick={handleClear}>
            <Trash2 className="h-4 w-4 mr-1.5" /> Clear
          </Button>
        </div>

        <Card className="glass-strong border-border/60 flex flex-col h-[calc(100vh-16rem)]">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === 'user' ? 'bg-primary/15' : 'eco-gradient'
                  }`}>
                    {m.role === 'user' ? <User className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4 text-primary-foreground" />}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'glass rounded-tl-sm'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="h-9 w-9 rounded-full eco-gradient flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="glass rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Suggested prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {suggestedPrompts.map((p) => (
                <button key={p} onClick={() => handleSend(p)} className="text-xs glass rounded-full px-3 py-1.5 hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary">
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border/40 p-4 flex gap-2">
            <Input
              placeholder="Ask NexLoop AI anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="glass"
            />
            <Button onClick={() => handleSend()} disabled={loading || !input.trim()} className="eco-gradient text-primary-foreground px-4">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </Card>

        <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5 px-1">
          <Sparkles className="h-3 w-3 text-accent" />
          Powered by Groq (Llama 3.3 70B) via the centralized AI client. Swap providers by changing edge function secrets.
        </p>
      </div>
    </AppShell>
  );
}

export default function AssistantPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <ProtectedRoute>
        <AssistantContent />
      </ProtectedRoute>
    </div>
  );
}
