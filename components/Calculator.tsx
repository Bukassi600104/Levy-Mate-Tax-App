
import React, { useEffect, useState } from 'react';
import { TaxProfile, TaxResult, EntityType, TaxPolicyYear } from '../types';
import { TaxEngine } from '../services/taxEngine';
import { DISCLAIMER_TEXT } from '../constants';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Lock, FileJson, Info, Briefcase, User, TrendingDown } from 'lucide-react';

interface CalculatorProps {
  profile: TaxProfile;
  setProfile: (p: TaxProfile) => void;
  onResultUpdate: (r: TaxResult) => void;
  policy: TaxPolicyYear;
  setPolicy: (p: TaxPolicyYear) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ profile, setProfile, onResultUpdate, policy, setPolicy }) => {
  
  const [taxResultState, setTaxResultState] = useState<TaxResult | null>(null);

  // Auto-calculate on change
  useEffect(() => {
    const result = TaxEngine.calculate(profile, policy);
    setTaxResultState(result);
    onResultUpdate(result);
  }, [profile, policy, onResultUpdate]);

  const handleInputChange = (field: keyof TaxProfile, value: number) => {
    setProfile({ ...profile, [field]: value });
  };

  const formatNaira = (num: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(num);
  };

  const isCompany = profile.entityType === EntityType.COMPANY;

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
                {isCompany ? <Briefcase className="text-levy-amber"/> : <User className="text-levy-blue"/>}
                {isCompany ? 'Corporate Tax Engine' : 'Personal Tax Engine'}
            </h1>
            <p className="text-sm text-gray-500">{policy === '2026_PROPOSED' ? 'Using Nigeria Tax Act 2025 Logic' : 'Using Finance Act 2020 Logic'}</p>
          </div>
          <div className="bg-gray-100 p-1 rounded-lg inline-flex text-xs font-bold">
              <button onClick={() => setPolicy('2024_ACT')} className={`px-3 py-2 rounded-md transition-all ${policy === '2024_ACT' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>2020 Rules</button>
              <button onClick={() => setPolicy('2026_PROPOSED')} className={`px-3 py-2 rounded-md transition-all flex items-center gap-1 ${policy === '2026_PROPOSED' ? 'bg-levy-blue shadow text-white' : 'text-gray-500'}`}>
                  2026 Rules <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Configuration Panel */}
        <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4">
                    {isCompany ? 'Company Financials' : 'Income & Reliefs'}
                </h3>
                
                <div className="space-y-4">
                    {/* Primary Income Input */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                            {isCompany ? 'Annual Turnover' : 'Gross Annual Income'}
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-gray-400">₦</span>
                            <input 
                                type="number" 
                                value={isCompany ? profile.annualTurnover : profile.annualGrossIncome}
                                onChange={(e) => handleInputChange(isCompany ? 'annualTurnover' : 'annualGrossIncome', parseFloat(e.target.value) || 0)}
                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-medium outline-none focus:ring-2 focus:ring-levy-blue/30 bg-gray-50 focus:bg-white text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Entity Specific Inputs */}
                    {isCompany ? (
                        // CIT Specifics
                        <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                            <h4 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                                <Info size={16}/> Small Company Test
                            </h4>
                            <p className="text-xs text-orange-700 mb-3">
                                Turnover ≤ ₦50m qualifies as a Small Company (0% CIT).
                            </p>
                        </div>
                    ) : (
                        // PIT Specifics
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Pension (Monthly)</label>
                                <input 
                                    type="number" 
                                    value={profile.pensionContribution || ''}
                                    onChange={(e) => handleInputChange('pensionContribution', parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-levy-blue/30 bg-gray-50 focus:bg-white text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Annual Rent Paid</label>
                                <input 
                                    type="number" 
                                    value={profile.rentPaid || ''}
                                    onChange={(e) => handleInputChange('rentPaid', parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-levy-blue/30 bg-gray-50 focus:bg-white text-gray-900"
                                />
                                {policy === '2026_PROPOSED' && (
                                    <p className="text-[10px] text-green-600 mt-1 font-medium">
                                        Deduction: {formatNaira(Math.min(profile.rentPaid * 0.2, 500000))}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Insights Panel */}
            <div className="space-y-2">
                {taxResultState?.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                        <Info size={16} className="mt-0.5 shrink-0"/>
                        <span>{insight}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* RIGHT: Result Panel */}
        <div className="lg:col-span-5 space-y-6">
            <div className={`text-white p-6 rounded-xl shadow-xl relative overflow-hidden transition-colors duration-500 ${isCompany ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-levy-blue'}`}>
                
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="text-xs text-white/70 uppercase tracking-wider font-bold">Total Liability</h4>
                        <div className="text-3xl font-display font-bold mt-1">
                            {taxResultState ? formatNaira(taxResultState.totalTaxLiability) : '...'}
                        </div>
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded text-xs font-bold backdrop-blur-sm">
                        {taxResultState?.statusLabel}
                    </div>
                </div>

                <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-white/70">{isCompany ? 'Assessable Profit' : 'Taxable Income'}</span>
                        <span className="font-bold">{formatNaira(taxResultState?.taxableIncome || 0)}</span>
                    </div>
                     <div className="flex justify-between">
                         <span className="text-white/70">Effective Rate</span>
                         <span className="font-bold">{taxResultState?.effectiveTaxRate.toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 font-semibold text-gray-800 flex justify-between items-center">
                    <span>Calculated Breakdown</span>
                </div>
                <div className="divide-y divide-gray-50">
                    {taxResultState?.breakdown.map((item, idx) => (
                        <div key={idx} className={`p-4 flex justify-between items-center text-sm ${item.isRelief ? 'bg-green-50/50' : ''}`}>
                            <div>
                                <p className={`font-medium ${item.isRelief ? 'text-green-700' : 'text-gray-900'}`}>{item.label}</p>
                                <p className="text-xs text-gray-500">{item.rate} on {formatNaira(item.taxableAmount)}</p>
                                {item.note && <p className="text-[10px] font-medium mt-0.5 text-gray-400">{item.note}</p>}
                            </div>
                            <span className={`font-bold ${item.isRelief ? 'text-green-600' : 'text-gray-700'}`}>
                                {item.taxAmount < 0 ? '-' : ''}{formatNaira(Math.abs(item.taxAmount))}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
