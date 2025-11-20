
import React, { useState, useRef, useEffect } from 'react';
import { TaxProfile, ChatMessage } from '../types';
import { getTaxAdvice } from '../services/geminiService';
import { DISCLAIMER_TEXT, AI_QUERY_LIMIT_FREE, LEARNING_ARTICLES } from '../constants';
import { Send, Bot, User, ShieldAlert, ChevronRight, Lock, ArrowLeft, BookOpen, ChevronLeft } from 'lucide-react';

interface EducationHubProps {
  profile: TaxProfile;
  onUsageUpdate: (count: number) => void;
}

const EducationHub: React.FC<EducationHubProps> = ({ profile, onUsageUpdate }) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([
    { role: 'model', text: `Hello ${profile.name}! I'm LevyMate AI. I can explain tax laws or analyze your potential deductions. What's on your mind?` }
  ]);
  const [loading, setLoading] = useState(false);
  const [readingArticleId, setReadingArticleId] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const isLimitReached = profile.tier === 'Free' && profile.aiQueriesToday >= AI_QUERY_LIMIT_FREE;
  const queriesLeft = Math.max(0, AI_QUERY_LIMIT_FREE - profile.aiQueriesToday);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSend = async () => {
    if (!query.trim() || isLimitReached) return;

    const userMsg: ChatMessage = { role: 'user', text: query };
    setHistory(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    // Increment usage
    onUsageUpdate(1);

    const responseText = await getTaxAdvice(profile, query);
    
    setHistory(prev => [...prev, { role: 'model', text: responseText }]);
    setLoading(false);
  };

  const currentArticle = readingArticleId !== null ? LEARNING_ARTICLES.find(a => a.id === readingArticleId) : null;

  const handleNextArticle = () => {
    if (readingArticleId !== null && readingArticleId < LEARNING_ARTICLES.length - 1) {
        setReadingArticleId(readingArticleId + 1);
    }
  };

  const handlePrevArticle = () => {
    if (readingArticleId !== null && readingArticleId > 0) {
        setReadingArticleId(readingArticleId - 1);
    }
  };

  const LessonCard: React.FC<{ id: number, title: string, category: string, duration: string }> = ({ id, title, category, duration }) => (
      <div onClick={() => setReadingArticleId(id)} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:border-levy-teal cursor-pointer transition-colors group">
          <div>
              <span className="text-[10px] uppercase tracking-wider text-levy-teal font-bold">{category}</span>
              <h4 className="font-medium text-gray-900 mt-1">{title}</h4>
              <span className="text-xs text-gray-400 mt-1 block">{duration} read</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-levy-teal group-hover:text-white transition-colors">
              <ChevronRight size={16} />
          </div>
      </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-24 lg:pb-0">
        {/* Left Column: Lessons */}
        <div className="lg:col-span-1 space-y-6 h-full">
            {readingArticleId === null ? (
                // List View
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                    <div>
                        <h2 className="text-xl font-display font-bold text-gray-900 mb-1">Learning Hub</h2>
                        <p className="text-sm text-gray-500">Quick lessons to master Nigerian tax.</p>
                    </div>
                    
                    <div className="space-y-3">
                        {LEARNING_ARTICLES.map(article => (
                            <LessonCard 
                                key={article.id} 
                                id={article.id}
                                title={article.title} 
                                category={article.category} 
                                duration={article.duration} 
                            />
                        ))}
                    </div>
                    
                    <div className="bg-levy-teal/5 p-4 rounded-xl border border-levy-teal/10">
                        <h3 className="font-bold text-levy-teal text-sm mb-2">Daily Tip</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Did you know? Voluntary pension contributions are tax-exempt, allowing you to lower your taxable income while saving for the future.
                        </p>
                    </div>
                </div>
            ) : (
                // Article Reading View
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col animate-in fade-in zoom-in duration-200">
                    <div className="mb-4 pb-4 border-b border-gray-100 flex items-center gap-2">
                        <button onClick={() => setReadingArticleId(null)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500">
                            <ArrowLeft size={20} />
                        </button>
                        <span className="text-xs font-bold uppercase text-levy-teal tracking-wider">{currentArticle?.category}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{currentArticle?.title}</h3>
                        <div className="prose prose-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {currentArticle?.content}
                        </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-gray-100 flex justify-between items-center">
                        <button 
                            onClick={handlePrevArticle} 
                            disabled={readingArticleId === 0}
                            className="flex items-center gap-1 text-xs font-bold text-gray-500 disabled:opacity-30 hover:text-gray-900"
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <span className="text-xs text-gray-400">
                            {readingArticleId + 1} / {LEARNING_ARTICLES.length}
                        </span>
                        <button 
                             onClick={handleNextArticle}
                             disabled={readingArticleId === LEARNING_ARTICLES.length - 1}
                             className="flex items-center gap-1 text-xs font-bold text-gray-500 disabled:opacity-30 hover:text-gray-900"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Right Column: Chat Interface */}
        <div className="lg:col-span-2 h-[600px] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-levy-teal text-white p-1.5 rounded-lg">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Tax Assistant</h3>
                        <p className="text-xs text-gray-500">Powered by Gemini AI</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {profile.tier === 'Free' && (
                        <span className={`text-xs font-medium px-2 py-1 rounded flex items-center gap-1 ${
                            isLimitReached ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                             {profile.tier} Plan
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white relative">
                {history.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-levy-teal text-white'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-gray-100 text-gray-800 rounded-tr-none' 
                        : 'bg-levy-tealLight text-gray-800 rounded-tl-none'
                    }`}>
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                    </div>
                </div>
                ))}
                {loading && (
                <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-400 text-xs px-4 py-2 rounded-full animate-pulse">
                    Thinking...
                    </div>
                </div>
                )}
                <div ref={endRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
                {isLimitReached ? (
                     <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                        <div className="inline-flex p-2 bg-red-100 rounded-full text-red-500 mb-2">
                            <Lock size={20} />
                        </div>
                        <h4 className="font-bold text-gray-900">Daily Limit Reached</h4>
                        <p className="text-xs text-gray-500 mb-3">You've used all {AI_QUERY_LIMIT_FREE} free queries for today. Upgrade to Pro for unlimited access.</p>
                     </div>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about deductions, bands, or laws..."
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-levy-teal/20 focus:border-levy-teal text-sm text-gray-900"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={loading || !query.trim()}
                            className="bg-levy-teal hover:bg-levy-tealDark disabled:opacity-50 text-white px-4 rounded-xl transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                )}
                {/* Freemium Chat Counter */}
                {profile.tier === 'Free' && !isLimitReached && (
                    <p className="text-[10px] text-gray-400 italic mt-2 text-center">
                        You have {queriesLeft} free {queriesLeft === 1 ? 'query' : 'queries'} left today.
                    </p>
                )}
                <div className="mt-2 flex items-center justify-center gap-1.5 opacity-50">
                    <ShieldAlert size={10} />
                    <span className="text-[10px] text-center">{DISCLAIMER_TEXT}</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default EducationHub;
