
import React, { useMemo, useState } from 'react';
import { TaxProfile, TimeFrame } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Calendar, ShieldCheck, TrendingUp, AlertTriangle, Lock, Crown } from 'lucide-react';

interface AnalyticsProps {
  profile: TaxProfile;
}

const Analytics: React.FC<AnalyticsProps> = ({ profile }) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('yearly');
  const isPro = profile.tier === 'Pro';

  const EXEMPTION_THRESHOLD_ANNUAL = 800000;

  // --- Helpers ---
  const getMultiplier = (tf: TimeFrame) => {
    if (tf === 'monthly') return 1/12;
    if (tf === 'quarterly') return 0.25;
    return 1;
  };

  const multiplier = getMultiplier(timeframe);
  const periodThreshold = EXEMPTION_THRESHOLD_ANNUAL * multiplier;

  const formatNaira = (num: number) => {
    if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `₦${(num / 1000).toFixed(0)}k`;
    return `₦${(num).toLocaleString()}`;
  };

  // --- Data Filtering ---
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return profile.transactions.filter(t => {
      const tDate = new Date(t.date);
      if (timeframe === 'monthly') {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      }
      if (timeframe === 'quarterly') {
        const qNow = Math.floor(now.getMonth() / 3);
        const qTx = Math.floor(tDate.getMonth() / 3);
        return qTx === qNow && tDate.getFullYear() === now.getFullYear();
      }
      // Yearly
      return tDate.getFullYear() === now.getFullYear();
    });
  }, [profile.transactions, timeframe]);

  // --- Chart 1: Exemption Monitor (The "Crossing the Line" Chart) ---
  const exemptionData = useMemo(() => {
    // If no transactions, use profile estimate scaled to period
    let totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    // If transactions are empty, fallback to estimated gross scaled
    if (totalIncome === 0 && filteredTransactions.length === 0) {
        totalIncome = (profile.entityType === 'Company' ? profile.annualTurnover : profile.annualGrossIncome) * multiplier;
    }

    if (totalIncome < periodThreshold) {
      return [
        { name: 'Tax-Free Used', value: totalIncome, color: '#10B981' }, // Green
        { name: 'Allowance Remaining', value: periodThreshold - totalIncome, color: '#E5E7EB' } // Grey
      ];
    } else {
      return [
        { name: 'Tax-Free Limit', value: periodThreshold, color: '#10B981' }, // Green
        { name: 'Taxable Excess', value: totalIncome - periodThreshold, color: '#EF4444' } // Red
      ];
    }
  }, [filteredTransactions, profile, multiplier, periodThreshold]);

  // --- Chart 2: Deductibility (The "Tax Saver" Chart) ---
  const deductibilityData = useMemo(() => {
    // 1. Statutory Reliefs (Tax Savers)
    // Pension + NHF (Monthly * months in period) + LifeIns (Annual * multiplier)
    const monthsInPeriod = timeframe === 'yearly' ? 12 : (timeframe === 'quarterly' ? 3 : 1);
    const statutoryReliefs = (profile.pensionContribution * monthsInPeriod) + 
                             (profile.nhfContribution * monthsInPeriod) + 
                             (profile.lifeInsurance * multiplier);
    
    // Rent Relief (Logic: Min(Rent*0.2, 500k) scaled to period)
    // Note: Relief is usually claimed annually, but for viz we scale it
    const rentRelief = Math.min(profile.rentPaid * 0.2, 500000) * multiplier;

    const taxSavers = statutoryReliefs + rentRelief;

    // 2. Business Costs (WREN) & 3. Personal
    let businessCosts = 0;
    let personalCosts = 0;

    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
        if (t.isTaxDeductible) {
            businessCosts += t.amount;
        } else {
            personalCosts += t.amount;
        }
    });

    const data = [
        { name: 'Tax Savers', value: taxSavers, color: '#3B82F6' }, // Blue (Reliefs)
        { name: 'Business (WREN)', value: businessCosts, color: '#F97316' }, // Orange
        { name: 'Personal/Non-Ded', value: personalCosts, color: '#9CA3AF' } // Grey
    ];
    
    return data.filter(d => d.value > 0);
  }, [filteredTransactions, profile, timeframe, multiplier]);

  // --- Chart 3: Income Source Analysis ---
  const incomeSourceData = useMemo(() => {
    const data: Record<string, number> = {};
    const incomeTx = filteredTransactions.filter(t => t.type === 'income');

    if (incomeTx.length === 0) {
        // Fallback dummy for empty state
        return [];
    }

    incomeTx.forEach(t => {
        const cat = t.category || 'Uncategorized';
        data[cat] = (data[cat] || 0) + t.amount;
    });

    const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F59E0B'];
    
    return Object.entries(data).map(([name, value], idx) => ({
        name, 
        value,
        color: colors[idx % colors.length]
    }));
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
        {/* Header with Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-2xl font-display font-bold text-gray-900">Visual Insights</h1>
                <p className="text-sm text-gray-500">Understand your tax position at a glance.</p>
            </div>
            
            {/* Timeframe Toggle */}
            <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-bold relative">
                {(['monthly', 'quarterly', 'yearly'] as TimeFrame[]).map((tf) => {
                    const isLocked = !isPro && tf !== 'yearly';
                    return (
                        <button
                            key={tf}
                            disabled={isLocked}
                            onClick={() => setTimeframe(tf)}
                            className={`px-4 py-2 rounded-md capitalize transition-all flex items-center gap-1 ${
                                timeframe === tf 
                                ? 'bg-white shadow text-levy-blue' 
                                : isLocked ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            {tf}
                            {isLocked && <Lock size={10} />}
                        </button>
                    );
                })}
            </div>
        </div>

        {!isPro && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between text-sm text-amber-800">
                <span className="flex items-center gap-2"><Crown size={16} /> Upgrade to Pro to unlock Monthly & Quarterly trends.</span>
                <span className="font-bold">Yearly View Only</span>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* CHART 1: EXEMPTION MONITOR */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-green-600"/> Tax-Free Limit
                    </h3>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded font-bold">
                        {formatNaira(periodThreshold)} Limit
                    </span>
                </div>
                
                <div className="h-48 relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={exemptionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                            >
                                {exemptionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val: number) => formatNaira(val)} />
                        </PieChart>
                     </ResponsiveContainer>
                     {/* Centered Label */}
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="text-xs text-gray-400 block">Used</span>
                            <span className="text-lg font-bold text-gray-800">
                                {((exemptionData[0].value / (exemptionData[0].value + exemptionData[1].value)) * 100).toFixed(0)}%
                            </span>
                        </div>
                     </div>
                </div>

                <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">Tax-Free Allowance</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-gray-600">Taxable Excess</span>
                    </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 leading-tight">
                    {exemptionData.find(d => d.name === 'Taxable Excess') 
                        ? "You have crossed the tax-free line. Every Naira in the red zone is taxed."
                        : "You are in the safe zone. No tax payable yet on this income."}
                </div>
            </div>

            {/* CHART 2: DEDUCTIBILITY (Tax Savers) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600"/> Where Money Goes
                    </h3>
                </div>

                <div className="h-48">
                    {deductibilityData.length > 0 ? (
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deductibilityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {deductibilityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val: number) => formatNaira(val)} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm">No expense data</div>
                    )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                     <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-gray-600">Tax Savers (Reliefs)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-gray-600">Business (WREN)</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        <span className="text-gray-600">Personal</span>
                    </div>
                </div>
                 <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-800 leading-tight">
                    Spend more on <b>Blue</b> (Pension/Health) to lower your tax bill legally.
                </div>
            </div>

            {/* CHART 3: INCOME SOURCES */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Calendar size={18} className="text-purple-600"/> Income Sources
                    </h3>
                </div>

                <div className="h-48">
                    {incomeSourceData.length > 0 ? (
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={incomeSourceData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {incomeSourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val: number) => formatNaira(val)} />
                                <Legend iconSize={8} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '10px'}}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center px-4">
                            Record transactions to see income breakdown.
                        </div>
                    )}
                </div>
                
                <div className="mt-6 p-3 bg-purple-50 rounded-xl text-xs text-purple-800 leading-tight flex gap-2">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>Passive income (Rent/Dividends) is often taxed differently from Active Trade.</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Analytics;
