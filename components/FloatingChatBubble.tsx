import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, UserPlus, Lock, ChevronDown } from 'lucide-react';
import { getTaxAdvice } from '../services/geminiService';
import { DISCLAIMER_TEXT } from '../constants';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface FloatingChatBubbleProps {
  onSignUp: () => void;
}

const GUEST_QUERY_LIMIT = 5;
const STORAGE_KEY = 'levymate_guest_queries';

// Get today's date as YYYY-MM-DD
const getTodayKey = () => new Date().toISOString().split('T')[0];

// Get guest query count from localStorage
const getGuestQueryCount = (): number => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === getTodayKey()) {
        return data.count;
      }
    }
    return 0;
  } catch {
    return 0;
  }
};

// Increment guest query count
const incrementGuestQueryCount = (): number => {
  const currentCount = getGuestQueryCount();
  const newCount = currentCount + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    date: getTodayKey(),
    count: newCount
  }));
  return newCount;
};

const FloatingChatBubble: React.FC<FloatingChatBubbleProps> = ({ onSignUp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryCount, setQueryCount] = useState(getGuestQueryCount());
  const [showPulse, setShowPulse] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  const queriesLeft = Math.max(0, GUEST_QUERY_LIMIT - queryCount);
  const isLimitReached = queryCount >= GUEST_QUERY_LIMIT;

  // Initial welcome message
  useEffect(() => {
    if (isOpen && chatHistory.length === 0) {
      setChatHistory([{
        role: 'assistant',
        text: "Hi! 👋 I'm Levy, your Nigerian tax assistant. Ask me anything about Nigerian tax laws, PAYE, CIT, VAT, or how to use LevyMate!\n\nAs a guest, you have 5 free questions. Sign up for unlimited access!"
      }]);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  // Stop pulse animation after first open
  useEffect(() => {
    if (isOpen) setShowPulse(false);
  }, [isOpen]);

  const handleSend = async () => {
    if (!query.trim() || loading || isLimitReached) return;

    const userMessage = query.trim();
    setQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // Call AI service without profile (guest mode)
      const response = await getTaxAdvice(null, userMessage);
      setChatHistory(prev => [...prev, { role: 'assistant', text: response }]);
      
      // Increment query count
      const newCount = incrementGuestQueryCount();
      setQueryCount(newCount);
    } catch (error) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        text: "Sorry, I'm having trouble connecting right now. Please try again later." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 md:right-8 w-[calc(100vw-32px)] md:w-96 max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 z-[100] animate-in slide-in-from-bottom-4 duration-300 flex flex-col overflow-hidden"
             style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-levy-blue to-blue-700 text-white p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Levy - Tax Assistant</h3>
                <p className="text-xs text-white/80">Ask me about Nigerian taxes</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-[200px] max-h-[40vh]">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-levy-blue text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-400 text-xs px-4 py-2 rounded-full animate-pulse shadow-sm border border-gray-100">
                  Levy is thinking...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
            {isLimitReached ? (
              <div className="bg-gradient-to-r from-levy-blue/5 to-blue-50 border border-levy-blue/20 rounded-xl p-4 text-center">
                <div className="inline-flex p-2 bg-levy-blue/10 rounded-full text-levy-blue mb-2">
                  <Lock size={20} />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Guest Limit Reached</h4>
                <p className="text-xs text-gray-500 mb-3">
                  You've used all {GUEST_QUERY_LIMIT} free guest queries. Sign up for unlimited access!
                </p>
                <button
                  onClick={onSignUp}
                  className="w-full bg-levy-blue hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <UserPlus size={16} />
                  Sign Up Free
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about PAYE, CIT, VAT..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue text-sm text-gray-900"
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !query.trim()}
                    className="bg-levy-blue hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-xl transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center">
                  {queriesLeft} of {GUEST_QUERY_LIMIT} free questions remaining • <button onClick={onSignUp} className="text-levy-blue font-semibold hover:underline">Sign up</button> for unlimited
                </p>
              </>
            )}
          </div>

          {/* Disclaimer */}
          <div className="px-4 pb-3 pt-0 bg-white">
            <p className="text-[9px] text-gray-400 text-center leading-tight">{DISCLAIMER_TEXT}</p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 md:right-8 w-14 h-14 bg-gradient-to-r from-levy-blue to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center z-[100] transition-all duration-300 ${
          isOpen ? 'rotate-0' : ''
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open tax assistant chat'}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <MessageCircle size={24} />
            {/* Pulse animation for first-time visitors */}
            {showPulse && (
              <span className="absolute w-full h-full rounded-full bg-levy-blue animate-ping opacity-30"></span>
            )}
          </>
        )}
      </button>

      {/* Tooltip for closed state */}
      {!isOpen && showPulse && (
        <div className="fixed bottom-20 right-4 md:right-8 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-[99] animate-bounce">
          Ask me about Nigerian taxes! 💬
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </>
  );
};

export default FloatingChatBubble;
