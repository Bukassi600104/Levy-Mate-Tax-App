import React, { useState } from 'react';
import { FAQ_ITEMS, FAQItem } from '../constants';
import { Search, ChevronDown, ChevronUp, HelpCircle, Shield, Building, Users, Laptop, MapPin, FileText, Filter } from 'lucide-react';

interface FAQPageProps {
  onBack?: () => void;
}

const categoryConfig: Record<FAQItem['category'], { icon: React.ElementType; color: string; bgColor: string }> = {
  'General': { icon: HelpCircle, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  'PIT': { icon: Users, color: 'text-green-600', bgColor: 'bg-green-50' },
  'CIT': { icon: Building, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  'VAT': { icon: FileText, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  'Compliance': { icon: Shield, color: 'text-red-600', bgColor: 'bg-red-50' },
  'Informal Sector': { icon: Users, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  'Digital Economy': { icon: Laptop, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  'State-Specific': { icon: MapPin, color: 'text-teal-600', bgColor: 'bg-teal-50' },
};

const FAQPage: React.FC<FAQPageProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FAQItem['category'] | 'All'>('All');

  const categories: (FAQItem['category'] | 'All')[] = ['All', 'General', 'PIT', 'CIT', 'VAT', 'Compliance', 'Informal Sector', 'Digital Economy', 'State-Specific'];

  const filteredFAQs = FAQ_ITEMS.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const FAQCard: React.FC<{ faq: FAQItem }> = ({ faq }) => {
    const isExpanded = expandedId === faq.id;
    const config = categoryConfig[faq.category];
    const Icon = config.icon;

    return (
      <div 
        className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
          isExpanded 
            ? 'border-levy-teal shadow-lg shadow-levy-teal/10' 
            : 'border-gray-200 hover:border-gray-300 shadow-sm'
        }`}
      >
        <button
          onClick={() => toggleExpand(faq.id)}
          className="w-full p-5 flex items-start gap-4 text-left"
        >
          {/* Category Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${config.bgColor} ${config.color} flex items-center justify-center`}>
            <Icon size={20} />
          </div>

          {/* Question */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                {faq.category}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-snug pr-4">
              {faq.question}
            </h3>
          </div>

          {/* Expand Icon */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isExpanded ? 'bg-levy-teal text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {/* Answer (Expandable) */}
        <div className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="px-5 pb-5 pt-0">
            <div className="pl-14">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-levy-teal/10 text-levy-teal flex items-center justify-center">
                  <HelpCircle size={22} />
                </div>
                Frequently Asked Questions
              </h1>
              <p className="text-gray-500 text-sm mt-1 ml-12">
                Everything you need to know about Nigerian taxes in 2026
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search questions... e.g., 'CRA', 'small business', 'VAT'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-levy-teal/20 focus:border-levy-teal transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Filter by Category</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const config = cat !== 'All' ? categoryConfig[cat] : null;
            
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-levy-teal text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat === 'All' ? `All (${FAQ_ITEMS.length})` : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ List */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {filteredFAQs.length > 0 ? (
          <div className="space-y-3">
            {filteredFAQs.map((faq) => (
              <FAQCard key={faq.id} faq={faq} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 text-sm font-medium text-levy-teal hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Results Count */}
        {filteredFAQs.length > 0 && (
          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {filteredFAQs.length} of {FAQ_ITEMS.length} questions
            </p>
          </div>
        )}
      </div>

      {/* Help Banner */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-gradient-to-r from-levy-teal to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8"></div>
          
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-2">Can't find what you're looking for?</h3>
            <p className="text-white/80 text-sm mb-4">
              Chat with Levy, our AI tax assistant, for personalized answers based on your profile.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={onBack}
                className="bg-white text-levy-teal px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/90 transition-colors shadow-sm"
              >
                Ask Levy AI
              </button>
              <a 
                href="https://taxpromax.firs.gov.ng" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Visit FIRS Portal →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <Shield size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 text-sm">Important Notice</h4>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              This FAQ is for educational purposes only and reflects the Nigeria Tax Act 2025 (effective January 2026). 
              It does not constitute legal or tax advice. For binding interpretations, consult a qualified tax professional 
              or contact the Federal Inland Revenue Service (FIRS) directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
