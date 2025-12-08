import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TaxProfile, TaxResult, TaxPolicyYear, EntityType, TaxCalculationHistory } from '../types';
import { Wallet, BookOpen, Home, Settings, Plus, Crown, BarChart, List, PieChart, TrendingUp, Calendar, AlertTriangle, FileText, MessageSquare, HelpCircle, History, X, Sparkles, ArrowRight, Calculator as CalculatorIcon } from 'lucide-react';
import Calculator from './Calculator';
import EducationHub from './EducationHub';
import TransactionManager from './TransactionManager';
import Analytics from './Analytics';
import FAQPage from './FAQPage';
import SettingsPage from './SettingsPage';
import HistoryPage from './HistoryPage';
import { TaxEngine } from '../services/taxEngine';
import { updateProfile, getTransactionsByProfile } from '../services/amplifyService';
import { authGetCurrentUser } from '../services/authService';
import { COMPLIANCE_DATES, PRICING_PLANS, ADMIN_EMAILS } from '../constants';
import Logo from './Logo';
import CreditCard from './CreditCard';
import PolicyModal from './PolicyModal';
import UpgradeModal from './UpgradeModal';
import CheckoutModal from './CheckoutModal';
import DeleteAccountModal from './DeleteAccountModal';

interface DashboardProps {
  profile: TaxProfile;
  onLogout: () => void;
  onProfileUpdate?: (profile: TaxProfile) => void;
  onViewFeedback?: () => void;
}

type TabType = 'home' | 'transactions' | 'reports' | 'tax' | 'learn' | 'faq' | 'settings' | 'history';

// History storage key - will be made user-specific
const getHistoryStorageKey = (userId: string) => `levymate_calculation_history_${userId}`;
const getTutorialKey = (userId: string) => `levymate_tutorial_completed_${userId}`;

// Tutorial steps configuration
interface TutorialStep {
  id: string;
  target: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    target: 'nav-home',
    title: 'Welcome to LevyMate! 🎉',
    description: 'This is your dashboard home. Here you can see your tax summary and quick actions.',
    placement: 'right'
  },
  {
    id: 'calculator',
    target: 'nav-tax',
    title: 'Tax Calculator',
    description: 'Calculate your taxes instantly. Input your income and see real-time PAYE, CIT, and levy estimates.',
    placement: 'right'
  },
  {
    id: 'transactions',
    target: 'nav-transactions',
    title: 'Transaction Manager',
    description: 'Track your income and expenses. Log transactions to monitor deductible VAT.',
    placement: 'right'
  },
  {
    id: 'analytics',
    target: 'nav-reports',
    title: 'Visual Analytics',
    description: 'See beautiful charts showing where your money goes and tax breakdowns.',
    placement: 'right'
  },
  {
    id: 'learn',
    target: 'nav-learn',
    title: 'Education Hub & AI Assistant',
    description: 'Learn about Nigerian tax laws and chat with our AI assistant for tax advice.',
    placement: 'right'
  },
  {
    id: 'settings',
    target: 'nav-settings',
    title: 'Settings',
    description: 'Update your profile, financial details, and tax preferences here.',
    placement: 'right'
  }
];

// Tutorial Tooltip Component - positioned near target elements with pointer
interface TutorialTooltipProps {
  step: TutorialStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

const TutorialTooltip: React.FC<TutorialTooltipProps> = ({ step, stepIndex, totalSteps, onNext, onSkip }) => {
  const [position, setPosition] = useState({ top: 0, left: 0, arrowDirection: 'left' as 'left' | 'right' | 'top' | 'bottom' });
  
  useEffect(() => {
    const targetEl = document.getElementById(step.target);
    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      const isMobile = window.innerWidth < 1024;
      
      if (isMobile) {
        // On mobile, position tooltip in center-bottom area
        setPosition({
          top: Math.min(rect.bottom + 20, window.innerHeight - 250),
          left: window.innerWidth / 2,
          arrowDirection: 'top'
        });
      } else {
        // On desktop, position to the right of sidebar items
        setPosition({
          top: rect.top + rect.height / 2,
          left: rect.right + 20,
          arrowDirection: 'left'
        });
      }
    }
  }, [step.target]);

  const arrowStyles: Record<string, string> = {
    left: 'left-0 top-1/2 -translate-x-full -translate-y-1/2 border-r-white border-r-8 border-y-8 border-y-transparent border-l-0',
    right: 'right-0 top-1/2 translate-x-full -translate-y-1/2 border-l-white border-l-8 border-y-8 border-y-transparent border-r-0',
    top: 'top-0 left-1/2 -translate-y-full -translate-x-1/2 border-b-white border-b-8 border-x-8 border-x-transparent border-t-0',
    bottom: 'bottom-0 left-1/2 translate-y-full -translate-x-1/2 border-t-white border-t-8 border-x-8 border-x-transparent border-b-0'
  };

  return (
      /* Tooltip card - no full-screen overlay to allow navigation clicks */
      <div 
        className="fixed z-[80] bg-white rounded-2xl p-5 shadow-2xl max-w-xs animate-in fade-in slide-in-from-left-4 duration-300 border border-gray-100"
        style={{ 
          top: position.top,
          left: position.arrowDirection === 'left' ? position.left : 'auto',
          right: position.arrowDirection === 'right' ? position.left : 'auto',
          transform: position.arrowDirection === 'top' ? 'translateX(-50%)' : 
                     position.arrowDirection === 'left' ? 'translateY(-50%)' : 'translateY(-50%)'
        }}
      >
        {/* Pointer Arrow */}
        <div className={`absolute w-0 h-0 ${arrowStyles[position.arrowDirection]}`} />
        
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            {stepIndex + 1}
          </div>
          <span className="text-xs text-gray-400 font-medium">Step {stepIndex + 1} of {totalSteps}</span>
        </div>
        
        <h4 className="font-bold text-gray-900 mb-2 text-sm">{step.title}</h4>
        <p className="text-xs text-gray-600 mb-4 leading-relaxed">{step.description}</p>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div 
              key={idx} 
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                idx === stepIndex ? 'bg-blue-600' : idx < stepIndex ? 'bg-blue-300' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 px-3 py-2 text-gray-500 text-xs font-medium hover:text-gray-700 transition-colors"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
          >
            {stepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ profile, onLogout, onProfileUpdate, onViewFeedback }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentProfile, setCurrentProfile] = useState<TaxProfile>(profile);
  const [taxResult, setTaxResult] = useState<TaxResult | null>(null);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [calculationHistory, setCalculationHistory] = useState<TaxCalculationHistory[]>([]);
  
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  
  // Deletion confirmation state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    open: boolean;
    type: 'single' | 'all';
    itemId?: string;
  }>({ open: false, type: 'single' });

  // User-specific storage key
  const historyKey = profile.id ? getHistoryStorageKey(profile.id) : 'levymate_calculation_history_temp';
  const tutorialKey = profile.id ? getTutorialKey(profile.id) : 'levymate_tutorial_temp';

  // Load transactions in background after dashboard mounts (for fast sign-in)
  useEffect(() => {
    const loadTransactions = async () => {
      if (profile.id && (!profile.transactions || profile.transactions.length === 0)) {
        try {
          const transactions = await getTransactionsByProfile(profile.id);
          if (transactions && transactions.length > 0) {
            setCurrentProfile(prev => ({ ...prev, transactions }));
          }
        } catch (err) {
          console.error('Background transaction load failed:', err);
        }
      }
    };
    loadTransactions();
  }, [profile.id]);

  // Check if tutorial should be shown - only for NEW users who haven't seen it
  useEffect(() => {
    if (profile.id) {
      const completed = localStorage.getItem(tutorialKey);
      
      // Only show tutorial if:
      // 1. User hasn't completed it before (not in localStorage)
      // 2. Account is relatively new (created within last 7 days) OR has no transactions
      const isNewAccount = () => {
        if (!profile.lastLoginDate) return true;
        const accountAge = Date.now() - new Date(profile.lastLoginDate).getTime();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        return accountAge < sevenDays || !profile.transactions || profile.transactions.length === 0;
      };
      
      if (!completed && isNewAccount()) {
        // Small delay to let the UI render first
        setTimeout(() => setShowTutorial(true), 800);
      }
    }
  }, [profile.id, tutorialKey, profile.lastLoginDate, profile.transactions]);

  const completeTutorial = () => {
    setShowTutorial(false);
    setTutorialStep(0);
    localStorage.setItem(tutorialKey, 'true');
  };

  const nextTutorialStep = () => {
    if (tutorialStep < TUTORIAL_STEPS.length - 1) {
      setTutorialStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const skipTutorial = () => {
    completeTutorial();
  };

  // Apply spotlight class to current tutorial target
  useEffect(() => {
    if (showTutorial && TUTORIAL_STEPS[tutorialStep]) {
      const targetElement = document.getElementById(TUTORIAL_STEPS[tutorialStep].target);
      if (targetElement) {
        targetElement.classList.add('tutorial-spotlight');
      }
      // Cleanup: remove class from all elements when step changes or tutorial closes
      return () => {
        TUTORIAL_STEPS.forEach(step => {
          const el = document.getElementById(step.target);
          if (el) el.classList.remove('tutorial-spotlight');
        });
      };
    }
  }, [showTutorial, tutorialStep]);

  // Load calculation history from localStorage (user-specific)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(historyKey);
      if (saved) {
        setCalculationHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load calculation history:', e);
    }
  }, [historyKey]);

  // Save calculation history to localStorage
  const saveHistory = (history: TaxCalculationHistory[]) => {
    setCalculationHistory(history);
    localStorage.setItem(historyKey, JSON.stringify(history));
  };

  // Add new calculation to history
  const addToHistory = (result: TaxResult) => {
    const historyItem: TaxCalculationHistory = {
      id: `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      grossIncome: currentProfile.entityType === EntityType.COMPANY 
        ? currentProfile.annualTurnover || 0 
        : currentProfile.annualGrossIncome,
      taxableIncome: result.taxableIncome,
      totalTax: result.totalTaxLiability,
      effectiveRate: result.effectiveTaxRate,
      policyUsed: currentProfile.preferredPolicy,
      breakdown: result.breakdown,
      deductions: result.deductions
    };
    
    const newHistory = [historyItem, ...calculationHistory].slice(0, 100); // Keep last 100
    saveHistory(newHistory);
  };

  // Clear all history - with confirmation
  const clearHistory = () => {
    setDeleteConfirmModal({ open: true, type: 'all' });
  };

  // Delete single history item - with confirmation
  const deleteHistoryItem = (id: string) => {
    setDeleteConfirmModal({ open: true, type: 'single', itemId: id });
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (deleteConfirmModal.type === 'all') {
      saveHistory([]);
    } else if (deleteConfirmModal.itemId) {
      saveHistory(calculationHistory.filter(h => h.id !== deleteConfirmModal.itemId));
    }
    setDeleteConfirmModal({ open: false, type: 'single' });
  };

  // Check if user is admin
  const isAdmin = currentProfile.email && ADMIN_EMAILS.includes(currentProfile.email.toLowerCase());
  const isPro = currentProfile.tier === 'Pro' || isAdmin;

  // Memoized callbacks to prevent re-renders
  const handleResultUpdate = useCallback((result: TaxResult) => {
    setTaxResult(result);
  }, []);

  const handlePolicyChange = useCallback((p: TaxPolicyYear) => {
    setCurrentProfile(prev => ({ ...prev, preferredPolicy: p }));
  }, []);

  const handleUsageUpdate = useCallback((count: number) => {
    setCurrentProfile(prev => ({ ...prev, aiQueriesToday: prev.aiQueriesToday + count }));
  }, []);

  const handleNavigateToFAQ = useCallback(() => {
    setActiveTab('faq');
  }, []);

  const handleBackFromFAQ = useCallback(() => {
    setActiveTab('learn');
  }, []);

  const handleProfileUpdate = useCallback((updatedProfile: TaxProfile) => {
    setCurrentProfile(updatedProfile);
  }, []);
  
  // Auto-calculate latest tax result for dashboard stats
  useEffect(() => {
    const result = TaxEngine.calculate(currentProfile, currentProfile.preferredPolicy);
    setTaxResult(result);
  }, [currentProfile]);

  // Ensure profile has email (backfill for old profiles)
  useEffect(() => {
      const checkEmail = async () => {
          if (!currentProfile.email) {
              try {
                  const user = await authGetCurrentUser();
                  if (user?.email) {
                      console.log("Backfilling missing email for profile:", user.email);
                      setCurrentProfile(prev => ({ ...prev, email: user.email }));
                  }
              } catch (e) {
                  console.error("Failed to fetch auth email", e);
              }
          }
      };
      checkEmail();
  }, []);

  // Sync profile changes to database (debounced)
  useEffect(() => {
    // Only sync if profile has an ID (meaning it's already in database)
    if (!currentProfile.id) return;

    // Debounce database update by 2 seconds to avoid too many writes
    const timeoutId = setTimeout(async () => {
      try {
        await updateProfile(currentProfile.id!, currentProfile);
        onProfileUpdate?.(currentProfile); // Notify parent of update
      } catch (err) {
        console.error('Error syncing profile to database:', err);
      }
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile.id, currentProfile.name, currentProfile.tier, currentProfile.annualGrossIncome, currentProfile.annualTurnover, currentProfile.pensionContribution, currentProfile.nhfContribution, currentProfile.rentPaid, currentProfile.preferredPolicy, currentProfile.phoneNumber, currentProfile.stateOfResidence, currentProfile.lifeInsurance, currentProfile.totalFixedAssets, currentProfile.persona, currentProfile.entityType]);

  const handleUpgrade = () => {
    setUpgradeModalOpen(false);
    setCheckoutModalOpen(true);
  };

  const handleCheckoutSuccess = (plan: 'Monthly' | 'Yearly') => {
    const now = new Date();
    const expiryDate = new Date(now);
    
    if (plan === 'Monthly') {
        expiryDate.setDate(expiryDate.getDate() + 30);
    } else {
        expiryDate.setDate(expiryDate.getDate() + 365);
    }

    setCurrentProfile(prev => ({ 
        ...prev, 
        tier: 'Pro',
        subscriptionPlan: plan,
        subscriptionExpiryDate: expiryDate.toISOString()
    }));
    setCheckoutModalOpen(false);
  };

  const formatNaira = (num: number) => {
    // Handle NaN, undefined, or invalid numbers
    if (num === undefined || num === null || isNaN(num)) {
      return '₦0';
    }
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(num);
  };

  // Check for subscription expiry
  const daysToExpiry = currentProfile.subscriptionExpiryDate 
    ? Math.ceil((new Date(currentProfile.subscriptionExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const NavItem = ({ tab, icon: Icon, label, id }: { tab: TabType, icon: any, label: string, id?: string }) => (
    <button 
        type="button"
        id={id}
        onClick={() => setActiveTab(tab)}
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
        {/* Subscription Renewal Alert */}
        {isPro && daysToExpiry !== null && daysToExpiry <= 7 && (
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-3 items-center">
                    <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-900 text-sm">Subscription Renewing Soon</h4>
                        <p className="text-xs text-indigo-700">
                            Your Pro plan expires in <span className="font-bold">{daysToExpiry} days</span>. 
                            {daysToExpiry <= 0 ? " Please renew to keep access." : " Auto-renewal is active."}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => setCheckoutModalOpen(true)}
                    className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Renew Now
                </button>
            </div>
        )}

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

        {/* Mobile Quick Actions Grid - Only visible on mobile */}
        <div className="lg:hidden">
            <div className="grid grid-cols-3 gap-3">
                <button 
                    onClick={() => setActiveTab('tax')}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 hover:border-levy-teal/30 hover:shadow-md transition-all active:scale-95"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <CalculatorIcon size={24} className="text-blue-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">Calculator</span>
                </button>

                <button 
                    onClick={() => setActiveTab('transactions')}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 hover:border-levy-teal/30 hover:shadow-md transition-all active:scale-95"
                >
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <List size={24} className="text-green-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">Transactions</span>
                </button>

                <button 
                    onClick={() => setActiveTab('reports')}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 hover:border-levy-teal/30 hover:shadow-md transition-all active:scale-95"
                >
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <PieChart size={24} className="text-purple-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">Reports</span>
                </button>

                <button 
                    onClick={() => setActiveTab('learn')}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 hover:border-levy-teal/30 hover:shadow-md transition-all active:scale-95"
                >
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <BookOpen size={24} className="text-amber-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">Learn</span>
                </button>

                <button 
                    onClick={() => setActiveTab('history')}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 hover:border-levy-teal/30 hover:shadow-md transition-all active:scale-95"
                >
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                        <History size={24} className="text-teal-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">History</span>
                </button>

                <button 
                    onClick={() => setActiveTab('settings')}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 hover:border-levy-teal/30 hover:shadow-md transition-all active:scale-95"
                >
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Settings size={24} className="text-gray-600" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">Settings</span>
                </button>
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
      <CheckoutModal 
        isOpen={checkoutModalOpen} 
        onClose={() => setCheckoutModalOpen(false)} 
        onSuccess={handleCheckoutSuccess}
        planName="Business Pro"
        email={currentProfile.email || ''}
      />
      <DeleteAccountModal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        profileId={currentProfile.id!} 
        onDeleteSuccess={onLogout}
      />

      {/* Delete History Confirmation Modal */}
      {deleteConfirmModal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
              {deleteConfirmModal.type === 'all' ? 'Clear All History?' : 'Delete This Record?'}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              {deleteConfirmModal.type === 'all' 
                ? 'This will permanently delete all your calculation history. This action cannot be undone.'
                : 'This will permanently delete this calculation record. This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmModal({ open: false, type: 'single' })}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Tooltip - Positioned near target elements */}
      {showTutorial && <TutorialTooltip 
        step={TUTORIAL_STEPS[tutorialStep]} 
        stepIndex={tutorialStep}
        totalSteps={TUTORIAL_STEPS.length}
        onNext={nextTutorialStep}
        onSkip={skipTutorial}
      />}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#0f172a] flex-col fixed h-full z-40 border-r border-white/5 shadow-2xl">
        <div className="h-24 flex items-center px-6 border-b border-white/10">
            <Logo variant="white" />
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
            <NavItem tab="home" icon={Home} label="Dashboard" id="nav-home" />
            <NavItem tab="reports" icon={PieChart} label="Visual Reports" id="nav-reports" />
            <NavItem tab="transactions" icon={List} label="Transactions" id="nav-transactions" />
            <NavItem tab="tax" icon={Wallet} label="Tax Engine" id="nav-tax" />
            <NavItem tab="history" icon={History} label="History" id="nav-history" />
            <NavItem tab="learn" icon={BookOpen} label="Compliance Hub" id="nav-learn" />
            <NavItem tab="faq" icon={HelpCircle} label="FAQ" id="nav-faq" />
            <NavItem tab="settings" icon={Settings} label="Settings" id="nav-settings" />
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
            {onViewFeedback && (
                <button onClick={onViewFeedback} className="text-gray-500 hover:text-white text-xs flex items-center gap-2 mb-4 w-full pl-2">
                    <MessageSquare size={12} /> Feedback
                </button>
            )}
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
                    onResultUpdate={handleResultUpdate}
                    policy={currentProfile.preferredPolicy}
                    setPolicy={handlePolicyChange}
                />
            )}

            {activeTab === 'learn' && (
                <EducationHub 
                    profile={currentProfile} 
                    onUsageUpdate={handleUsageUpdate}
                    onNavigateToFAQ={handleNavigateToFAQ}
                />
            )}

            {activeTab === 'faq' && (
                <FAQPage 
                    onBack={handleBackFromFAQ}
                />
            )}

            {activeTab === 'settings' && (
                <SettingsPage 
                    profile={currentProfile}
                    onProfileUpdate={handleProfileUpdate}
                    onLogout={onLogout}
                    onViewFeedback={onViewFeedback}
                />
            )}

            {activeTab === 'history' && (
                <HistoryPage 
                    profile={currentProfile}
                    calculationHistory={calculationHistory}
                    onClearHistory={clearHistory}
                    onDeleteHistoryItem={deleteHistoryItem}
                    onUpgradeClick={() => setUpgradeModalOpen(true)}
                />
            )}
          </div>
      </main>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 pb-safe pt-3 z-50 flex justify-between items-center">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-levy-blue' : 'text-gray-400'}`}>
            <Home size={20} />
            <span className="text-[9px]">Home</span>
          </button>
          <button onClick={() => setActiveTab('transactions')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'transactions' ? 'text-levy-blue' : 'text-gray-400'}`}>
            <List size={20} />
            <span className="text-[9px]">Records</span>
          </button>
          <div className="relative -top-6">
            <button onClick={() => setActiveTab('reports')} className="bg-levy-blue text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center"><PieChart size={26} /></button>
          </div>
          <button onClick={() => setActiveTab('learn')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'learn' ? 'text-levy-blue' : 'text-gray-400'}`}>
            <BookOpen size={20} />
            <span className="text-[9px]">AI Chat</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-0.5 ${activeTab === 'settings' ? 'text-levy-blue' : 'text-gray-400'}`}>
            <Settings size={20} />
            <span className="text-[9px]">Settings</span>
          </button>
      </nav>
    </div>
  );
};

export default Dashboard;
