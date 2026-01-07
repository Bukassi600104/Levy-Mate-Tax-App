
import React, { useState, useRef, useEffect } from 'react';
import { TaxProfile, ChatMessage } from '../types';
import { getTaxAdvice } from '../services/geminiService';
import { DISCLAIMER_TEXT, AI_QUERY_LIMIT_FREE, ADMIN_EMAILS } from '../constants';
import { Send, User, ShieldAlert, Lock, Sparkles, MessageCircle } from 'lucide-react';
import { LogoIcon } from './Logo';
import { useToastContext } from '../contexts/ToastContext';

interface AIChatProps {
  profile: TaxProfile;
  onUsageUpdate: (count: number) => void;
}

const AIChat: React.FC<AIChatProps> = ({ profile, onUsageUpdate }) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([
    { role: 'model', text: `Hello ${profile.name}! I'm Levy, your AI tax assistant. I can explain Nigerian tax laws, analyze your potential deductions, or answer any tax-related questions. What would you like to know?` }
  ]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const { toast } = useToastContext();

  const isAdmin = profile.email && ADMIN_EMAILS.includes(profile.email.toLowerCase());
  const isPro = profile.tier === 'Pro' || isAdmin;
  const isLimitReached = !isPro && profile.aiQueriesToday >= AI_QUERY_LIMIT_FREE;
  const queriesLeft = Math.max(0, AI_QUERY_LIMIT_FREE - profile.aiQueriesToday);

  // Scroll only the chat container, not the entire page
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Only scroll on new messages, not on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    scrollToBottom();
  }, [history]);

  const handleSend = async () => {
    if (!query.trim() || isLimitReached || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: query };
    setHistory(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    // Increment usage
    onUsageUpdate(1);

    try {
      const responseText = await getTaxAdvice(profile, query);
      setHistory(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      toast.error('AI Unavailable', 'Failed to get response. Please try again.');
      setHistory(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  // Quick question suggestions
  const suggestions = [
    "What are the new tax bands under NTA 2025?",
    "How do I calculate my PAYE?",
    "What deductions can I claim?",
    "Explain rent relief exemption"
  ];

  return (
    <div className="max-w-4xl mx-auto pb-24 lg:pb-0">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-levy-teal to-teal-600 rounded-2xl mb-4 shadow-lg">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">AI Tax Assistant</h1>
        <p className="text-gray-500 max-w-md mx-auto">Ask Levy anything about Nigerian tax laws, deductions, and compliance.</p>
        
        {/* Plan Badge */}
        <div className="mt-4 inline-flex items-center gap-2">
          {isPro ? (
            <span className="text-sm font-medium px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200">
              <Sparkles className="w-4 h-4 inline mr-1" /> Pro Plan - Unlimited
            </span>
          ) : (
            <span className={`text-sm font-medium px-4 py-1.5 rounded-full ${
              isLimitReached 
                ? 'bg-red-100 text-red-600 border border-red-200' 
                : 'bg-blue-50 text-blue-600 border border-blue-200'
            }`}>
              Free Plan - {queriesLeft} queries left today
            </span>
          )}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-3">
          <div className="bg-levy-teal text-white p-2 rounded-xl shadow-sm">
            <LogoIcon className="w-6 h-6" white />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Chat with Levy</h3>
            <p className="text-xs text-gray-500">Your AI-powered tax advisor</p>
          </div>
        </div>

        {/* Messages Area */}
        <div ref={chatContainerRef} className="h-[450px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
          {history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gradient-to-br from-levy-teal to-teal-600 text-white'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <LogoIcon className="w-5 h-5" white />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'  
                    ? 'bg-gray-900 text-white rounded-tr-md' 
                    : 'bg-white text-gray-800 rounded-tl-md border border-gray-100'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-levy-teal to-teal-600 text-white shadow-sm">
                  <LogoIcon className="w-5 h-5" white />
                </div>
                <div className="bg-white text-gray-400 text-sm px-4 py-3 rounded-2xl rounded-tl-md border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-levy-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-levy-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-levy-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestions - Only show when history has just the initial message */}
        {history.length === 1 && !loading && (
          <div className="px-6 pb-4 flex flex-wrap gap-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(suggestion)}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-levy-teal hover:text-white text-gray-600 rounded-full transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          {isLimitReached ? (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-5 text-center">
              <div className="inline-flex p-3 bg-red-100 rounded-full text-red-500 mb-3">
                <Lock size={24} />
              </div>
              <h4 className="font-bold text-gray-900 mb-1">Daily Limit Reached</h4>
              <p className="text-sm text-gray-500 mb-4">You've used all {AI_QUERY_LIMIT_FREE} free queries for today. Upgrade to Pro for unlimited access.</p>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask about deductions, tax bands, or laws..."
                className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-levy-teal/20 focus:border-levy-teal text-sm text-gray-900 placeholder:text-gray-400"
              />
              <button 
                onClick={handleSend}
                disabled={loading || !query.trim()}
                className="bg-gradient-to-r from-levy-teal to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                <Send size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-1.5 text-gray-400">
            <ShieldAlert size={12} />
            <span className="text-[10px] text-center">{DISCLAIMER_TEXT}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
