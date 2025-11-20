
import React, { useState, useEffect } from 'react';
import { TaxProfile, TaxResult, TaxPolicyYear, EntityType } from '../types';
import { Wallet, BookOpen, Home, Settings, Plus, Crown, BarChart, List, PieChart, TrendingUp, Calendar, AlertTriangle, FileText } from 'lucide-react';
import Calculator from './Calculator';
import EducationHub from './EducationHub';
import TransactionManager from './TransactionManager';
import Analytics from './Analytics';
import { TaxEngine } from '../services/taxEngine';
import { COMPLIANCE_DATES } from '../constants';
import Logo from './Logo';
import CreditCard from './CreditCard';
import PolicyModal from './PolicyModal';
import UpgradeModal from './UpgradeModal';

interface DashboardProps {
  profile: TaxProfile;
  onLogout: () => void;
}

type TabType = 'home' | 'transactions' | 'reports' | 'tax' | 'learn' | 'settings';

const Dashboard: React.FC<DashboardProps> = ({ profile, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentProfile, setCurrentProfile] = useState<TaxProfile>(profile);
  const [taxResult, setTaxResult] = useState<TaxResult | null>(null);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  // Auto-calculate latest tax result for dashboard stats
  useEffect(() => {
    const result = TaxEngine.calculate(currentProfile, currentProfile.preferredPolicy);
    setTaxResult(result);
  }, [currentProfile]);

  const handleUpgrade = () => {
    setCurrentProfile(prev => ({ ...prev, tier: 'Pro' }));
    setUpgradeModalOpen(false);
  };

  const formatNaira = (num: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(num);
  };

  const isPro = currentProfile.tier === 'Pro';

  const NavItem = ({ tab, icon: Icon, label }: { tab: TabType, icon: any, label: string }) => (
    <button 
        onClick={() => { setActiveTab(tab); }}
        className={`flex flex-col lg:flex-row items-center lg:gap-3 p-2 lg:px-4 lg:py-3 rounded-lg transition-all w-full text-left ${
            activeTab === tab 
            ? 'text-white bg-white/10 font-bold border-r-4 border-levy-mate' 
            : 'text-gray-400 hover:text-gray-100 lg:hover:bg-white/5'
        }`}
    >
        <Icon size={20} strokeWidth={activeTab === tab ? 2.5 : 2} />
        <span className="text-[10px] lg:text-sm mt-1 lg:mt-0 font-medium">{label}</span>
    </button>
  );

  // Render Home View
  const renderHome = () => {
    return (
    <div className="space-y-6 pb-24 lg:pb-0">
        <header className="flex justify-between items-center mb-2">
            <div>
                <h1 className="text-2xl font-display font-bold text-levy-text flex items-center gap-2">
                    Overview
                    {isPro && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-200 flex items-center gap-1"><Crown size={12} fill="currentColor" /> PRO</span>}
                </h1>
                <p className="text-levy-slate text-sm">Welcome back, {currentProfile.name}</p>
            </div>
            <div className="flex items-center gap-3">
                {/* Mobile Upgrade Button */}
                {!isPro && (
                    <button 
                        onClick={() => setUpgradeModalOpen(true)}
                        className="lg:hidden bg-gradient-to-r from-amber-300 to-yellow-500 text-amber-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                        <Crown size={14} fill="currentColor" /> Upgrade
                    </button>
                )}
                <div className="text-right hidden md:block">
                    <span className="text-xs font-bold text-gray-400 uppercase block">Tax Entity</span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">
                        {currentProfile.entityType}
                    </span>
                </div>
            </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Credit Card Widget */}
            <div className="md:col-span-1">
                <CreditCard 
                    name={currentProfile.name} 
                    amount={taxResult ? formatNaira(taxResult.totalTaxLiability) : '...'} 
                    label={taxResult?.statusLabel || 'Calculating'}
                    variant={isPro ? 'dark' : 'blue'}
                />
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Calendar size={14} /> Compliance Calendar
                </p>
                <div className="space-y-3">
                    {COMPLIANCE_DATES.map((d, i) => (
                        <div key={i} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <span className="text-gray-700 font-medium">{d.title}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{d.type}</span>
                                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold">{d.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4"></div>
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3 relative z-10 shadow-sm">
                    <TrendingUp size={28} />
                </div>
                <h4 className="font-bold text-gray-900 relative z-10">Input VAT Credit</h4>
                <p className="text-3xl font-bold text-green-600 mt-2 relative z-10">{formatNaira(taxResult?.vatInputCredit || 0)}</p>
                <p className="text-xs text-gray-400 mt-1 relative z-10">Recoverable on Expenses</p>
            </div>
        </div>

        {/* Compliance Alerts */}
        {taxResult?.complianceFlags && taxResult.complianceFlags.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg animate-in fade-in slide-in-from-bottom-2">
                <div className="flex gap-2">
                    <AlertTriangle className="text-yellow-600" size={20} />
                    <div>
                        <h4 className="font-bold text-yellow-800 text-sm">Compliance Action Required</h4>
                        <ul className="list-disc list-inside text-xs text-yellow-700 mt-1">
                            {taxResult.complianceFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        )}
    </div>
  )};

  return (
    <div className="min-h-screen flex bg-levy-offWhite">
      <PolicyModal isOpen={policyModalOpen} onClose={() => setPolicyModalOpen(false)} type="usage" />
      <UpgradeModal isOpen={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} onConfirm={handleUpgrade} />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0f172a] flex-col fixed h-full z-10 border-r border-white/5 shadow-2xl">
        <div className="h-24 flex items-center px-6 border-b border-white/10">
            <Logo variant="white" />
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
            <NavItem tab="home" icon={Home} label="Dashboard" />
            <NavItem tab="reports" icon={PieChart} label="Visual Reports" />
            <NavItem tab="transactions" icon={List} label="Transactions" />
            <NavItem tab="tax" icon={Wallet} label="Tax Engine" />
            <NavItem tab="learn" icon={BookOpen} label="Compliance Hub" />
        </nav>
        
        <div className="p-4 border-t border-white/10 bg-[#020617]">
            {!isPro && (
                <div className="bg-gradient-to-r from-amber-200 to-yellow-400 p-3 rounded-xl mb-4 text-center">
                    <p className="text-xs font-bold text-amber-900 mb-2">Unlock Pro Features</p>
                    <button 
                        onClick={() => setUpgradeModalOpen(true)}
                        className="bg-black/80 hover:bg-black text-white text-xs py-1.5 px-3 rounded-lg font-bold w-full transition-colors"
                    >
                        Upgrade
                    </button>
                </div>
            )}
            <button onClick={() => setPolicyModalOpen(true)} className="text-gray-500 hover:text-white text-xs flex items-center gap-2 mb-4 w-full pl-2">
                <FileText size={12} /> Legal & Policies
            </button>
            <button onClick={onLogout} className="text-gray-400 hover:text-white text-sm flex items-center gap-2 w-full pl-2">
                <Settings size={16} /> Log Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pb-24">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'home' && renderHome()}
            
            {activeTab === 'transactions' && (
                <TransactionManager 
                    profile={currentProfile} 
                    setProfile={setCurrentProfile} 
                />
            )}
            
            {activeTab === 'reports' && (
                <Analytics profile={currentProfile} />
            )}

            {activeTab === 'tax' && (
                <Calculator 
                    profile={currentProfile}
                    setProfile={setCurrentProfile}
                    onResultUpdate={setTaxResult}
                    policy={currentProfile.preferredPolicy}
                    setPolicy={(p) => setCurrentProfile({...currentProfile, preferredPolicy: p})}
                />
            )}

            {activeTab === 'learn' && (
                <EducationHub 
                    profile={currentProfile} 
                    onUsageUpdate={(count) => setCurrentProfile(prev => ({...prev, aiQueriesToday: prev.aiQueriesToday + count}))}
                />
            )}
          </div>
      </main>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 pb-safe pt-3 z-50 flex justify-between items-center">
          <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-levy-blue' : 'text-gray-400'}><Home size={24} /></button>
          <button onClick={() => setActiveTab('transactions')} className={activeTab === 'transactions' ? 'text-levy-blue' : 'text-gray-400'}><List size={24} /></button>
          <div className="relative -top-6">
            <button onClick={() => setActiveTab('reports')} className="bg-levy-blue text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center"><PieChart size={28} /></button>
          </div>
          <button onClick={() => setActiveTab('tax')} className={activeTab === 'tax' ? 'text-levy-blue' : 'text-gray-400'}><Wallet size={24} /></button>
          <button onClick={() => setActiveTab('learn')} className={activeTab === 'learn' ? 'text-levy-blue' : 'text-gray-400'}><BookOpen size={24} /></button>
      </nav>
    </div>
  );
};

export default Dashboard;
