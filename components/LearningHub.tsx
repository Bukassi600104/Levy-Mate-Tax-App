
import React, { useState } from 'react';
import { LEARNING_ARTICLES } from '../constants';
import { ChevronRight, ArrowLeft, ChevronLeft, BookOpen, Lightbulb } from 'lucide-react';

interface LearningHubProps {
  onNavigateToFAQ?: () => void;
}

const LearningHub: React.FC<LearningHubProps> = ({ onNavigateToFAQ }) => {
  const [readingArticleId, setReadingArticleId] = useState<number | null>(null);

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
      <div onClick={() => setReadingArticleId(id)} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:border-levy-teal hover:shadow-md cursor-pointer transition-all group">
          <div>
              <span className="text-[10px] uppercase tracking-wider text-levy-teal font-bold">{category}</span>
              <h4 className="font-semibold text-gray-900 mt-1">{title}</h4>
              <span className="text-xs text-gray-400 mt-1 block">{duration} read</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-levy-teal group-hover:text-white transition-colors">
              <ChevronRight size={18} />
          </div>
      </div>
  );

  if (readingArticleId !== null && currentArticle) {
    // Article Reading View
    return (
      <div className="max-w-3xl mx-auto pb-24 lg:pb-0">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in zoom-in duration-200">
          <div className="mb-6 pb-4 border-b border-gray-100 flex items-center gap-3">
            <button onClick={() => setReadingArticleId(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <span className="text-xs font-bold uppercase text-levy-teal tracking-wider bg-levy-teal/10 px-3 py-1 rounded-full">{currentArticle.category}</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{currentArticle.title}</h1>
          
          <div className="prose prose-sm text-gray-600 leading-relaxed whitespace-pre-wrap max-w-none">
            {currentArticle.content}
          </div>

          <div className="pt-8 mt-8 border-t border-gray-100 flex justify-between items-center">
            <button 
              onClick={handlePrevArticle} 
              disabled={readingArticleId === 0}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 disabled:opacity-30 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-sm text-gray-400 font-medium">
              {readingArticleId + 1} / {LEARNING_ARTICLES.length}
            </span>
            <button 
              onClick={handleNextArticle}
              disabled={readingArticleId === LEARNING_ARTICLES.length - 1}
              className="flex items-center gap-2 text-sm font-medium text-gray-500 disabled:opacity-30 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="max-w-4xl mx-auto pb-24 lg:pb-0 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-levy-teal to-teal-600 rounded-2xl mb-4 shadow-lg">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Learning Hub</h1>
        <p className="text-gray-500 max-w-md mx-auto">Master Nigerian tax laws with our curated lessons and guides.</p>
      </div>

      {/* Daily Tip Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-2xl border border-amber-100 flex items-start gap-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-amber-900 text-sm mb-1">Daily Tip</h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            Did you know? Voluntary pension contributions are tax-exempt, allowing you to lower your taxable income while saving for the future.
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Stats */}
      <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{LEARNING_ARTICLES.length}</p>
          <p className="text-xs text-gray-500">Articles</p>
        </div>
        <div className="w-px h-10 bg-gray-200"></div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{LEARNING_ARTICLES.reduce((acc, a) => acc + parseInt(a.duration), 0)}</p>
          <p className="text-xs text-gray-500">Minutes of Content</p>
        </div>
        <div className="w-px h-10 bg-gray-200"></div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{new Set(LEARNING_ARTICLES.map(a => a.category)).size}</p>
          <p className="text-xs text-gray-500">Categories</p>
        </div>
      </div>
    </div>
  );
};

export default LearningHub;
