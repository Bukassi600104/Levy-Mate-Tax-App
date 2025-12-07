import React, { useState, useMemo } from 'react';
import { TaxCalculationHistory, TaxProfile, TaxPolicyYear } from '../types';
import { ADMIN_EMAILS } from '../constants';
import { History, Calendar, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Filter, Trash2, Download, Crown, Lock, Calculator, Percent, Receipt } from 'lucide-react';

interface HistoryPageProps {
  profile: TaxProfile;
  calculationHistory: TaxCalculationHistory[];
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  onUpgradeClick: () => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ 
  profile, 
  calculationHistory, 
  onClearHistory,
  onDeleteHistoryItem,
  onUpgradeClick 
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterPolicy, setFilterPolicy] = useState<TaxPolicyYear | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const isAdmin = profile.email && ADMIN_EMAILS.includes(profile.email.toLowerCase());
  const isPro = profile.tier === 'Pro' || isAdmin;

  const filteredHistory = useMemo(() => {
    let result = [...calculationHistory];
    
    if (filterPolicy !== 'all') {
      result = result.filter(h => h.policyUsed === filterPolicy);
    }
    
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [calculationHistory, filterPolicy, sortOrder]);

  const stats = useMemo(() => {
    if (calculationHistory.length === 0) return null;
    
    const totalTaxPaid = calculationHistory.reduce((sum, h) => sum + h.totalTax, 0);
    const avgEffectiveRate = calculationHistory.reduce((sum, h) => sum + h.effectiveRate, 0) / calculationHistory.length;
    const totalGrossIncome = calculationHistory.reduce((sum, h) => sum + h.grossIncome, 0);
    
    return { totalTaxPaid, avgEffectiveRate, totalGrossIncome, count: calculationHistory.length };
  }, [calculationHistory]);

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString()}`;
  const formatPercent = (rate: number) => `${rate.toFixed(2)}%`;
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-NG', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportHistory = () => {
    const csv = [
      ['Date', 'Gross Income', 'Taxable Income', 'Total Tax', 'Effective Rate', 'Policy Used'].join(','),
      ...calculationHistory.map(h => [
        h.date,
        h.grossIncome,
        h.taxableIncome,
        h.totalTax,
        h.effectiveRate,
        h.policyUsed
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `levymate-tax-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Pro Gate
  if (!isPro) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pb-24 lg:pb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pro Feature</h2>
          <p className="text-gray-500 text-sm mb-6">
            Calculation history tracking is available for Pro users. Upgrade to keep a record of all your tax calculations and insights.
          </p>
          <button
            onClick={onUpgradeClick}
            className="w-full bg-gradient-to-r from-levy-teal to-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Crown size={18} /> Upgrade to Pro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
              <History size={24} className="text-levy-teal" />
              Calculation History
            </h1>
            <p className="text-gray-500 text-sm">Track all your tax calculations over time</p>
          </div>
          
          {calculationHistory.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={exportHistory}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Download size={16} /> Export
              </button>
              <button
                onClick={onClearHistory}
                className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-red-100 transition-colors"
              >
                <Trash2 size={16} /> Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Calculator size={14} />
              Calculations
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Receipt size={14} />
              Total Tax Calculated
            </div>
            <p className="text-2xl font-bold text-levy-teal">{formatCurrency(stats.totalTaxPaid)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <Percent size={14} />
              Avg. Effective Rate
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatPercent(stats.avgEffectiveRate)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
              <TrendingUp size={14} />
              Total Gross Income
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalGrossIncome)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      {calculationHistory.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={14} />
            Filter:
          </div>
          <select
            value={filterPolicy}
            onChange={(e) => setFilterPolicy(e.target.value as TaxPolicyYear | 'all')}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-levy-teal/20"
          >
            <option value="all">All Policies</option>
            <option value="ACT_2024">Finance Act 2020</option>
            <option value="ACT_2026_PROPOSED">Tax Act 2025</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50"
          >
            <Calendar size={14} />
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      )}

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <History size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Calculations Yet</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            {filterPolicy !== 'all' 
              ? 'No calculations found for the selected policy filter.'
              : 'Your tax calculation history will appear here. Use the calculator to compute your taxes and they\'ll be saved automatically.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const isExpanded = expandedId === item.id;
            const trend = item.effectiveRate > 20 ? 'high' : item.effectiveRate > 10 ? 'medium' : 'low';
            
            return (
              <div 
                key={item.id} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
              >
                {/* Main Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      trend === 'high' ? 'bg-red-100' : trend === 'medium' ? 'bg-amber-100' : 'bg-green-100'
                    }`}>
                      {trend === 'high' ? (
                        <TrendingUp size={20} className="text-red-600" />
                      ) : trend === 'low' ? (
                        <TrendingDown size={20} className="text-green-600" />
                      ) : (
                        <Calculator size={20} className="text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{formatCurrency(item.totalTax)}</p>
                      <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(item.grossIncome)}</p>
                      <p className="text-xs text-gray-500">Gross Income</p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-medium text-gray-900">{formatPercent(item.effectiveRate)}</p>
                      <p className="text-xs text-gray-500">Effective Rate</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      item.policyUsed === 'ACT_2026_PROPOSED' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.policyUsed === 'ACT_2026_PROPOSED' ? '2025 Act' : '2020 Act'}
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Gross Income</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(item.grossIncome)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Taxable Income</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(item.taxableIncome)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Tax</p>
                        <p className="font-semibold text-levy-teal">{formatCurrency(item.totalTax)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Effective Rate</p>
                        <p className="font-semibold text-gray-900">{formatPercent(item.effectiveRate)}</p>
                      </div>
                    </div>

                    {/* Deductions */}
                    {item.deductions && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">Deductions Applied</p>
                        <div className="flex flex-wrap gap-2">
                          {item.deductions.pension > 0 && (
                            <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-700 border border-gray-200">
                              Pension: {formatCurrency(item.deductions.pension)}
                            </span>
                          )}
                          {item.deductions.nhf > 0 && (
                            <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-700 border border-gray-200">
                              NHF: {formatCurrency(item.deductions.nhf)}
                            </span>
                          )}
                          {item.deductions.rentRelief > 0 && (
                            <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-700 border border-gray-200">
                              Rent Relief: {formatCurrency(item.deductions.rentRelief)}
                            </span>
                          )}
                          {item.deductions.cra > 0 && (
                            <span className="px-2 py-1 bg-white rounded-lg text-xs text-gray-700 border border-gray-200">
                              CRA: {formatCurrency(item.deductions.cra)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tax Breakdown */}
                    {item.breakdown && item.breakdown.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">Tax Breakdown by Band</p>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          {item.breakdown.map((band, idx) => (
                            <div key={idx} className={`flex justify-between p-2 text-xs ${idx !== item.breakdown.length - 1 ? 'border-b border-gray-100' : ''}`}>
                              <span className="text-gray-600">{band.label}</span>
                              <span className="font-medium text-gray-900">{formatCurrency(band.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delete Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteHistoryItem(item.id);
                        }}
                        className="text-red-500 text-xs flex items-center gap-1 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={12} /> Delete this entry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
