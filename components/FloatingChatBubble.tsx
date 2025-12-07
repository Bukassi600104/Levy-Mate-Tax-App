import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, UserPlus, LogIn, ChevronDown } from 'lucide-react';
import { getTaxAdvice } from '../services/geminiService';
import { DISCLAIMER_TEXT } from '../constants';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  showSignUpPrompt?: boolean;
  showSignInPrompt?: boolean;
}

interface FloatingChatBubbleProps {
  onSignUp: () => void;
  onLogin: () => void;
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

const FloatingChatBubble: React.FC<FloatingChatBubbleProps> = ({ onSignUp, onLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [queryCount, setQueryCount] = useState(getGuestQueryCount());
  const [showPulse, setShowPulse] = useState(true);
  const [hasAskedAboutAccount, setHasAskedAboutAccount] = useState(false);
  const [waitingForAccountResponse, setWaitingForAccountResponse] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Initial welcome message - simple and conversational
  useEffect(() => {
    if (isOpen && chatHistory.length === 0) {
      setChatHistory([{
        role: 'assistant',
        text: "Hi there! 👋 My name is Levy, how may I help you?"
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

  // Check if user response indicates sign up or sign in intent
  const checkAccountIntent = (message: string): 'signup' | 'signin' | null => {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('sign up') || lowerMsg.includes('signup') || lowerMsg.includes('register') || lowerMsg.includes('create account') || lowerMsg.includes('new account')) {
      return 'signup';
    }
    if (lowerMsg.includes('sign in') || lowerMsg.includes('signin') || lowerMsg.includes('login') || lowerMsg.includes('log in') || lowerMsg.includes('already have')) {
      return 'signin';
    }
    return null;
  };

  const handleSend = async () => {
    if (!query.trim() || loading) return;

    const userMessage = query.trim();
    setQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    // Check if we're waiting for account response
    if (waitingForAccountResponse) {
      const intent = checkAccountIntent(userMessage);
      setWaitingForAccountResponse(false);
      
      if (intent === 'signup') {
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          text: "Great choice! Click the button below to create your free account and get unlimited access to all my features! 🚀",
          showSignUpPrompt: true
        }]);
        setLoading(false);
        return;
      } else if (intent === 'signin') {
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          text: "Welcome back! Click below to sign in to your account. 😊",
          showSignInPrompt: true
        }]);
        setLoading(false);
        return;
      }
      // If neither, continue with normal response
    }

    try {
      // Call AI service without profile (guest mode)
      const response = await getTaxAdvice(null, userMessage);
      
      // Increment query count
      const newCount = incrementGuestQueryCount();
      setQueryCount(newCount);

      // After 5 questions, ask about account (only once)
      if (newCount >= GUEST_QUERY_LIMIT && !hasAskedAboutAccount) {
        setChatHistory(prev => [...prev, { role: 'assistant', text: response }]);
        
        // Add a follow-up message asking about account
        setTimeout(() => {
          setChatHistory(prev => [...prev, { 
            role: 'assistant', 
            text: "By the way, you've been asking great questions! 💡 Do you have a LevyMate account? Would you like to sign up for unlimited access, or do you already have an account and want to sign in?"
          }]);
          setHasAskedAboutAccount(true);
          setWaitingForAccountResponse(true);
        }, 1000);
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', text: response }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        text: "Oops! I'm having a bit of trouble connecting right now. Mind trying again in a moment?" 
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

  // Render message with potential action buttons
  const renderMessage = (msg: ChatMessage, idx: number) => (
    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${msg.role === 'user' ? '' : ''}`}>
        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
          msg.role === 'user'
            ? 'bg-levy-blue text-white rounded-tr-none'
            : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-100'
        }`}>
          <div className="whitespace-pre-wrap">{msg.text}</div>
        </div>
        
        {/* Sign Up Button */}
        {msg.showSignUpPrompt && (
          <button
            onClick={onSignUp}
            className="mt-2 w-full bg-levy-blue hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <UserPlus size={16} />
            Create Free Account
          </button>
        )}
        
        {/* Sign In Button */}
        {msg.showSignInPrompt && (
          <button
            onClick={onLogin}
            className="mt-2 w-full bg-gray-800 hover:bg-gray-900 text-white py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <LogIn size={16} />
            Sign In
          </button>
        )}
      </div>
    </div>
  );

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
                <h3 className="font-bold text-sm">Levy</h3>
                <p className="text-xs text-white/80">Your Tax Assistant</p>
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
            {chatHistory.map((msg, idx) => renderMessage(msg, idx))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-400 text-xs px-4 py-2 rounded-full animate-pulse shadow-sm border border-gray-100">
                  Levy is typing...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about Nigerian taxes..."
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
          </div>

          {/* Permanent Disclaimer at Bottom */}
          <div className="px-4 pb-3 pt-1 bg-white border-t border-gray-50">
            <p className="text-[9px] text-gray-400 text-center italic leading-tight">
              {DISCLAIMER_TEXT}
            </p>
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
          Need help with taxes? 💬
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </>
  );
};

export default FloatingChatBubble;
