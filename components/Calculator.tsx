
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { TaxProfile, TaxResult, EntityType, TaxPolicyYear } from '../types';
import { TaxEngine } from '../services/taxEngine';
import { DISCLAIMER_TEXT } from '../constants';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Lock, FileJson, Info, Briefcase, User, TrendingDown, X, Lightbulb, Calculator as CalcIcon, ArrowDown, ArrowUp } from 'lucide-react';

const TAX_ENGINE_TUTORIAL_KEY = 'levymate_tax_engine_tutorial_dismissed';

// Format number with commas for display
const formatWithCommas = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  if (isNaN(num) || num === 0) return '';
  return num.toLocaleString('en-NG');
};

// Parse comma-formatted string to number
const parseFormattedNumber = (value: string): number => {
  const cleaned = value.replace(/,/g, '');
  return parseFloat(cleaned) || 0;
};

// Formatted Number Input Component
const FormattedNumberInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  prefix?: string;
}> = ({ value, onChange, placeholder, className, prefix }) => {
  const [displayValue, setDisplayValue] = useState(formatWithCommas(value));

  useEffect(() => {
    setDisplayValue(formatWithCommas(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(rawValue) || 0;
    setDisplayValue(formatWithCommas(numValue));
    onChange(numValue);
  };

  return (
    <div className="relative">
      {prefix && <span className="absolute left-4 top-3.5 text-gray-400">{prefix}</span>}
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
      />
    </div>
  );
};

interface CalculatorProps {
  profile: TaxProfile;
  setProfile: (p: TaxProfile) => void;
  onResultUpdate: (r: TaxResult) => void;
  policy: TaxPolicyYear;
  setPolicy: (p: TaxPolicyYear) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ profile, setProfile, onResultUpdate, policy, setPolicy }) => {
  
  const [showTutorial, setShowTutorial] = useState(false);

  // Check if tutorial should be shown
  useEffect(() => {
    const dismissed = localStorage.getItem(TAX_ENGINE_TUTORIAL_KEY);
    if (!dismissed) {
      setShowTutorial(true);
    }
  }, []);

  const dismissTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem(TAX_ENGINE_TUTORIAL_KEY, 'true');
  };

  // Memoize calculation to prevent infinite loops
  const taxResultState = useMemo(() => {
    return TaxEngine.calculate(profile, policy);
  }, [
    profile.annualGrossIncome, 
    profile.annualTurnover, 
    profile.pensionContribution, 
    profile.nhfContribution,
    profile.nhfOptIn,
    profile.nhisContribution,
    profile.employerSector, 
    profile.rentPaid, 
    profile.rentVerified,
    profile.lifeInsurance,
    profile.lifeInsuranceSpouse,
    profile.capitalGains, 
    profile.entityType, 
    profile.totalFixedAssets, 
    policy
  ]);

  // Notify parent only when result changes
  useEffect(() => {
    if (taxResultState) {
      onResultUpdate(taxResultState);
    }
  }, [taxResultState, onResultUpdate]);

  const handleInputChange = (field: keyof TaxProfile, value: number | string | boolean) => {
    setProfile({ ...profile, [field]: value });
  };

  const formatNaira = (num: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(num);
  };

  const isCompany = profile.entityType === EntityType.COMPANY;

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      {/* Tax Engine Tutorial Card */}
      {showTutorial && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl relative animate-in fade-in slide-in-from-top-4">
          <button 
            onClick={dismissTutorial}
            className="absolute top-3 right-3 p-1 hover:bg-amber-200/50 rounded-full transition-colors text-amber-700"
          >
            <X size={18} />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Lightbulb size={24} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 mb-2">How to Use the Tax Engine</h3>
              <div className="space-y-2 text-sm text-amber-800">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <p><strong>Enter your income</strong> – Input your annual gross income or company turnover</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <p><strong>Add deductions</strong> – Include pension, NHF, and rent for tax relief</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <p><strong>Switch policies</strong> – Compare 2020 vs 2026 tax rules to see which saves more</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <p><strong>View breakdown</strong> – See exactly how your tax is calculated band by band</p>
                </div>
              </div>
              <button 
                onClick={dismissTutorial}
                className="mt-3 text-amber-700 font-bold text-sm hover:text-amber-900 transition-colors"
              >
                Got it, let's start →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
                {isCompany ? <Briefcase className="text-levy-amber"/> : <User className="text-levy-blue"/>}
                {isCompany ? 'Corporate Tax Engine' : 'Personal Tax Engine'}
            </h1>
            <p className="text-sm text-gray-500">{policy === 'ACT_2026_PROPOSED' ? 'Using Nigeria Tax Act 2025 Logic' : 'Using Finance Act 2020 Logic'}</p>
          </div>
          <div className="bg-gray-100 p-1 rounded-lg inline-flex text-xs font-bold">
              <button onClick={() => setPolicy('ACT_2024')} className={`px-3 py-2 rounded-md transition-all ${policy === 'ACT_2024' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>2020 Rules</button>
              <button onClick={() => setPolicy('ACT_2026_PROPOSED')} className={`px-3 py-2 rounded-md transition-all flex items-center gap-1 ${policy === 'ACT_2026_PROPOSED' ? 'bg-levy-blue shadow text-white' : 'text-gray-500'}`}>
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
                            <FormattedNumberInput 
                                value={isCompany ? profile.annualTurnover : profile.annualGrossIncome}
                                onChange={(val) => handleInputChange(isCompany ? 'annualTurnover' : 'annualGrossIncome', val)}
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
                                Turnover ≤ ₦100m qualifies as a Small Company (0% CIT under NTA 2025).
                            </p>
                        </div>
                    ) : (
                        // PIT Specifics - NTA 2025 Enhanced
                        <div className="space-y-4">
                            {/* Employer Sector (NTA 2025) */}
                            {policy === 'ACT_2026_PROPOSED' && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <label className="block text-xs font-medium text-blue-800 mb-2">Employer Sector (NTA 2025)</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="employerSector"
                                                checked={profile.employerSector === 'Private'}
                                                onChange={() => handleInputChange('employerSector', 'Private')}
                                                className="accent-levy-blue"
                                            />
                                            <span className="text-sm text-gray-700">Private Sector</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="employerSector"
                                                checked={profile.employerSector === 'Public'}
                                                onChange={() => handleInputChange('employerSector', 'Public')}
                                                className="accent-levy-blue"
                                            />
                                            <span className="text-sm text-gray-700">Public Sector</span>
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-blue-600 mt-1">NHF is mandatory for public sector, voluntary for private.</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Pension (Monthly)</label>
                                    <FormattedNumberInput 
                                        value={profile.pensionContribution || 0}
                                        onChange={(val) => handleInputChange('pensionContribution', val)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-levy-blue/30 bg-gray-50 focus:bg-white text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Annual Rent Paid</label>
                                    <FormattedNumberInput 
                                        value={profile.rentPaid || 0}
                                        onChange={(val) => handleInputChange('rentPaid', val)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-levy-blue/30 bg-gray-50 focus:bg-white text-gray-900"
                                    />
                                    {policy === 'ACT_2026_PROPOSED' && profile.rentPaid > 0 && (
                                        <p className="text-[10px] text-green-600 mt-1 font-medium">
                                            Rent Relief: {formatNaira(Math.min(profile.rentPaid * 0.2, 500000))} {profile.rentPaid * 0.2 > 500000 ? '(capped at ₦500k)' : ''}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* NTA 2025: NHF Opt-In (Private Sector Only) */}
                            {policy === 'ACT_2026_PROPOSED' && profile.employerSector === 'Private' && (
                                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                    <input 
                                        type="checkbox" 
                                        id="nhfOptIn"
                                        checked={profile.nhfOptIn || false}
                                        onChange={(e) => handleInputChange('nhfOptIn', e.target.checked)}
                                        className="w-4 h-4 accent-levy-blue"
                                    />
                                    <label htmlFor="nhfOptIn" className="text-sm text-gray-700 cursor-pointer">
                                        <span className="font-medium">Opt-in to NHF</span>
                                        <span className="text-xs text-amber-700 block">2.5% of gross income - voluntary under NTA 2025</span>
                                    </label>
                                </div>
                            )}

                            {/* Additional NTA 2025 Fields */}
                            {policy === 'ACT_2026_PROPOSED' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Life Insurance (Annual)</label>
                                        <FormattedNumberInput 
                                            value={profile.lifeInsurance || 0}
                                            onChange={(val) => handleInputChange('lifeInsurance', val)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-levy-blue/30 bg-gray-50 focus:bg-white text-gray-900"
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1">100% tax deductible</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Capital Gains (Annual)</label>
                                        <FormattedNumberInput 
                                            value={profile.capitalGains || 0}
                                            onChange={(val) => handleInputChange('capitalGains', val)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-levy-blue/30 bg-gray-50 focus:bg-white text-gray-900"
                                        />
                                        <p className="text-[10px] text-gray-500 mt-1">Taxed at marginal PIT rate (NTA 2025)</p>
                                    </div>
                                </div>
                            )}
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
