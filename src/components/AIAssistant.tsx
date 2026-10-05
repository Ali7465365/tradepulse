import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Crown, Trash2, Bot, User, Zap } from 'lucide-react';
import { generateAIResponse } from '@/lib/aiEngine';
import { LocationInfo, MarketAnalytics, ChatMessage } from '@/lib/types';
import { getMarketAnalytics } from '@/lib/dataEngine';
import { saveChatMessage, fetchChatHistory, clearChatHistory } from '@/lib/supabase';

interface AIAssistantProps {
  product: string;
  location: LocationInfo;
  isPro: boolean;
  onUpgradeClick: () => void;
}

export default function AIAssistant({ product, location, isPro, onUpgradeClick }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<'free' | 'pro'>(isPro ? 'pro' : 'free');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from Supabase
  useEffect(() => {
    (async () => {
      const history = await fetchChatHistory();
      if (history.length > 0) {
        setMessages(
          history.map((h) => ({
            id: h.id,
            role: h.role,
            content: h.content,
            mode: h.mode as 'free' | 'pro',
            timestamp: new Date(h.created_at),
          }))
        );
      } else {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Hello! I'm your TradePulse AI Assistant. ${isPro ? 'You have PRO access — I can provide deep trade optimization, exact local pricing strategies, and competitive edge analysis.' : 'I can help with trade problem-solving, pricing advice, and strategy recommendations.'} ${product ? `I see you're researching ${product} in ${location.city || location.country}.` : 'Search for a product and select a location to get started.'} Ask me anything!`,
            mode: isPro ? 'pro' : 'free',
            timestamp: new Date(),
          },
        ]);
      }
    })();
  }, []);

  // Update mode when pro status changes
  useEffect(() => {
    if (isPro) setMode('pro');
    else setMode('free');
  }, [isPro]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      mode,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Persist to Supabase
    await saveChatMessage('user', userMessage, mode);

    setIsTyping(true);

    // Generate response
    const analytics: MarketAnalytics = product
      ? getMarketAnalytics(product, location)
      : null as any;

    setTimeout(async () => {
      const response = generateAIResponse(userMessage, {
        product: product || 'general trade',
        location,
        analytics,
        mode,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        mode,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);

      await saveChatMessage('assistant', response, mode);
    }, 800 + Math.random() * 600);
  };

  const handleClear = async () => {
    await clearChatHistory();
    setMessages([
      {
        id: 'welcome-new',
        role: 'assistant',
        content: 'Conversation cleared. How can I help you with your trade research?',
        mode,
        timestamp: new Date(),
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    `What's the best pricing strategy for ${product || 'my product'}?`,
    `Analyze market demand in ${location.country}`,
    `Where can I find suppliers?`,
    `Give me a trade strategy`,
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* AI Header */}
      <div className="px-6 py-4 border-b border-[var(--tp-border)] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mode === 'pro' ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-blue-500/10'}`}>
            {mode === 'pro' ? <Crown className="text-white" size={20} /> : <Bot className="text-blue-500" size={20} />}
          </div>
          <div>
            <h2 className="font-semibold text-[var(--tp-text)]">
              {mode === 'pro' ? 'PRO AI Assistant' : 'AI Assistant'}
            </h2>
            <p className="text-xs text-[var(--tp-text-muted)]">
              {mode === 'pro' ? 'Advanced trade optimization & deep market insights' : 'Trade problem-solving & pricing advice'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
            <button
              onClick={() => !isPro && onUpgradeClick()}
              disabled={isPro}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'pro' && isPro
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'text-[var(--tp-text-muted)] hover:text-[var(--tp-text)]'
              }`}
            >
              <Crown size={14} />
              PRO
            </button>
            <button
              onClick={() => setMode('free')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'free'
                  ? 'bg-blue-500 text-white'
                  : 'text-[var(--tp-text-muted)] hover:text-[var(--tp-text)]'
              }`}
            >
              <Bot size={14} />
              Free
            </button>
          </div>

          <button
            onClick={handleClear}
            className="p-2 rounded-lg bg-[var(--tp-surface)] border border-[var(--tp-border)] text-[var(--tp-text-muted)] hover:text-red-500 transition-colors"
            title="Clear conversation"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              msg.role === 'user'
                ? 'bg-blue-500'
                : msg.mode === 'pro'
                ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                : 'bg-[var(--tp-surface)] border border-[var(--tp-border)]'
            }`}>
              {msg.role === 'user' ? (
                <User className="text-white" size={16} />
              ) : msg.mode === 'pro' ? (
                <Crown className="text-white" size={16} />
              ) : (
                <Bot className="text-blue-500" size={16} />
              )}
            </div>
            <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-tr-sm'
                  : msg.mode === 'pro'
                  ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-[var(--tp-text)] rounded-tl-sm'
                  : 'bg-[var(--tp-surface)] border border-[var(--tp-border)] text-[var(--tp-text)] rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
              <div className={`text-xs text-[var(--tp-text-muted)] mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.mode === 'pro' && msg.role === 'assistant' && (
                  <span className="ml-2 text-amber-500 flex items-center gap-1 inline-flex">
                    <Sparkles size={10} /> PRO
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              mode === 'pro' ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-[var(--tp-surface)] border border-[var(--tp-border)]'
            }`}>
              {mode === 'pro' ? <Crown className="text-white" size={16} /> : <Bot className="text-blue-500" size={16} />}
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[var(--tp-surface)] border border-[var(--tp-border)]">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--tp-text-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[var(--tp-text-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[var(--tp-text-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-6 pb-2 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s)}
              className="px-3 py-1.5 rounded-lg bg-[var(--tp-surface)] border border-[var(--tp-border)] text-xs text-[var(--tp-text-muted)] hover:border-blue-500/40 hover:text-[var(--tp-text)] transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-[var(--tp-border)]">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--tp-surface)] border border-[var(--tp-border)] focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          {mode === 'pro' && isPro && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10">
              <Zap size={14} className="text-amber-500" />
            </div>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'pro' && isPro ? 'Ask for deep trade optimization...' : 'Ask about pricing, demand, sourcing, or strategy...'}
            className="flex-1 bg-transparent text-sm text-[var(--tp-text)] placeholder:text-[var(--tp-text-muted)] focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-2 rounded-lg transition-all ${
              input.trim()
                ? mode === 'pro' && isPro
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105'
                  : 'bg-blue-500 text-white hover:scale-105'
                : 'bg-[var(--tp-border)] text-[var(--tp-text-muted)] cursor-not-allowed'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
        {!isPro && (
          <div className="mt-2 flex items-center gap-2 text-xs text-[var(--tp-text-muted)]">
            <Sparkles size={12} className="text-amber-500" />
            <span>Using Free AI. Upgrade to PRO for advanced deep-trade optimization.</span>
          </div>
        )}
      </div>
    </div>
  );
}
