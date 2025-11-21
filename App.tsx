
import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import FeaturesPage from './components/FeaturesPage';
import { TaxProfile, PersonaType, EntityType, UserTier } from './types';
import { PERSONA_DESCRIPTIONS, NIGERIAN_STATES, PRICING_PLANS } from './constants';
import { 
  CheckCircle, ArrowRight, Building, User, 
  Shield, Lock, Mail, Calculator, Wallet, PieChart, ChevronRight, Briefcase, FileText, MapPin, Phone, Check, ArrowLeft, Loader
} from 'lucide-react';
import Logo from './components/Logo';
import PolicyModal from './components/PolicyModal';
import { authSignUp, authSignIn, authSignOut, authGetCurrentUser, authIsAuthenticated } from './services/authService';
import { createProfile, getProfile, updateProfile } from './services/amplifyService';
import outputs from './amplify_outputs.json';

// Configure Amplify
Amplify.configure(outputs);

type AuthView = 'login' | 'register' | 'onboarding' | 'confirm-email';

// --- Main App Component ---

const App: React.FC = () => {
  const [profile, setProfile] = useState<TaxProfile | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [viewState, setViewState] = useState<'landing' | 'features' | 'auth' | 'loading'>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Onboarding State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      entityType: EntityType.INDIVIDUAL,
      persona: PersonaType.SALARY,
      turnover: 0,
      rentPaid: 0,
      state: 'Lagos',
      phone: '+234',
      tier: 'Free' as UserTier
  });
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');

  // Policy Modal State
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'usage'>('usage');

  const openPolicy = (type: 'privacy' | 'usage') => {
      setPolicyType(type);
      setPolicyModalOpen(true);
  };

  // Initialize: Check if user is authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const isAuth = await authIsAuthenticated();
        
        if (isAuth) {
          // User is signed in, load their profile from database
          const userProfile = await getProfile();
          if (userProfile) {
            setProfile(userProfile as TaxProfile);
            setViewState('auth');
          } else {
            // User authenticated but no profile yet - show onboarding
            setViewState('auth');
            setAuthView('onboarding');
            setStep(1);
          }
        } else {
          // No authenticated user - show landing
          setViewState('landing');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setViewState('landing');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const handleEnterApp = () => {
      setViewState('auth');
      setAuthView('register');
      setStep(1);
      setError(null);
  };

  const handleLogin = () => {
      setViewState('auth');
      setAuthView('login');
      setError(null);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    try {
      setIsLoading(true);
      await authSignUp({
        email: formData.email,
        password: formData.password,
        name: formData.name || formData.email,
      });
      
      setAuthView('confirm-email');
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
      setIsLoading(false);
    }
  };

  const handleConfirmEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!confirmationCode) {
      setError('Confirmation code is required');
      return;
    }

    try {
      setIsLoading(true);
      // Import confirmSignUp if available
      const { confirmSignUp } = await import('./services/authService');
      await confirmSignUp(formData.email, confirmationCode);
      
      // Auto sign in after confirming email
      await authSignIn({
        email: formData.email,
        password: formData.password,
      });
      
      setAuthView('onboarding');
      setConfirmationCode('');
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Email confirmation failed');
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    try {
      setIsLoading(true);
      await authSignIn({
        email: formData.email,
        password: formData.password,
      });

      // Load user's profile or show onboarding
      const userProfile = await getProfile();
      if (userProfile) {
        setProfile(userProfile as TaxProfile);
      } else {
        setAuthView('onboarding');
        setStep(1);
      }
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    if (!disclaimerAgreed) return;

    const today = new Date().toISOString().split('T')[0];
    
    const newProfile: TaxProfile = {
      name: formData.name,
      entityType: formData.entityType,
      persona: formData.persona,
      stateOfResidence: formData.state,
      phoneNumber: formData.phone,
      annualGrossIncome: formData.entityType === EntityType.INDIVIDUAL ? formData.turnover : 0,
      annualTurnover: formData.entityType === EntityType.COMPANY ? formData.turnover : 0,
      totalFixedAssets: 0,
      pensionContribution: 0,
      nhfContribution: 0,
      rentPaid: formData.rentPaid,
      lifeInsurance: 0,
      transactions: [],
      tier: formData.tier,
      aiQueriesToday: 0,
      lastLoginDate: today,
      preferredPolicy: '2026_PROPOSED'
    };

    try {
      setIsLoading(true);
      // Create profile in database
      const createdProfile = await createProfile(newProfile);
      setProfile(createdProfile as TaxProfile);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to create profile');
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authSignOut();
      setProfile(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        entityType: EntityType.INDIVIDUAL,
        persona: PersonaType.SALARY,
        turnover: 0,
        rentPaid: 0,
        state: 'Lagos',
        phone: '+234',
        tier: 'Free'
      });
      setViewState('landing');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isLoading && viewState === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="animate-spin text-levy-blue" size={48} />
      </div>
    );
  }

  if (profile) {
    return <Dashboard profile={profile} onLogout={handleLogout} onProfileUpdate={setProfile} />;
  }

  if (viewState === 'features') {
      return <FeaturesPage onBack={() => setViewState('landing')} onGetStarted={handleEnterApp} />;
  }

  if (viewState === 'landing') {
      return (
        <>
            <LandingPage 
                onGetStarted={handleEnterApp} 
                onLogin={handleLogin} 
                openPolicy={openPolicy} 
                onViewFeatures={() => setViewState('features')} 
            />
            <PolicyModal isOpen={policyModalOpen} onClose={() => setPolicyModalOpen(false)} type={policyType} />
        </>
      );
  }

  // Auth & Registration Flow
  return (
    <div className="min-h-screen bg-white flex flex-col">
        <PolicyModal isOpen={policyModalOpen} onClose={() => setPolicyModalOpen(false)} type={policyType} />
        
        <div className="flex-1 flex flex-col lg:flex-row">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-5/12 bg-[#0f172a] p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <div className="mb-8"><Logo variant="white" /></div>
                    <h1 className="text-5xl font-display font-bold text-white leading-tight mb-6">
                        Ready for the <span className="text-levy-mate">2026</span> Tax Engine?
                    </h1>
                    <p className="text-slate-300 text-lg font-light leading-relaxed max-w-md">
                        Configure your profile for the new Nigeria Tax Act. Whether you're a Small Company or an Individual, we've got you covered.
                    </p>
                </div>
                <div className="relative z-10 text-xs text-slate-500 flex gap-4">
                    <button onClick={() => openPolicy('privacy')} className="hover:text-slate-300">Privacy Policy</button>
                    <button onClick={() => openPolicy('usage')} className="hover:text-slate-300">Terms of Usage</button>
                </div>
            </div>

            {/* Right Panel */}
            <div className="lg:w-7/12 flex items-center justify-center p-6 lg:p-24 bg-levy-offWhite">
                <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-white relative">
                    
                    {/* Back Button for Auth Screens */}
                    {authView === 'register' && step > 1 && (
                        <button 
                            onClick={() => setStep(step - 1)}
                            className="absolute top-8 left-8 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    {authView !== 'onboarding' && (
                        <button 
                            onClick={() => setViewState('landing')}
                            className="absolute top-8 left-8 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}

                    {/* Auth View */}
                    {authView !== 'onboarding' && (
                        <div className="space-y-6 animate-in fade-in duration-300 mt-6 lg:mt-0">
                             <div className="lg:hidden flex justify-center mb-6"><Logo variant="full" /></div>
                            <h2 className="text-2xl font-display font-bold text-gray-900 text-center lg:text-left">
                                {authView === 'login' ? 'Welcome Back' : authView === 'register' ? 'Create Account' : 'Verify Email'}
                            </h2>

                            {error && (
                              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                              </div>
                            )}
                            
                            {authView === 'confirm-email' ? (
                              <form onSubmit={handleConfirmEmail} className="space-y-4">
                                <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Confirmation Code</label>
                                  <input 
                                    type="text" 
                                    value={confirmationCode}
                                    onChange={(e) => setConfirmationCode(e.target.value)}
                                    placeholder="Enter code from email"
                                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 transition-all text-gray-900 placeholder:text-gray-400"
                                  />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-levy-blue text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-50"
                                >
                                    {isLoading ? 'Verifying...' : 'Confirm Email'}
                                </button>
                              </form>
                            ) : (
                              <form onSubmit={authView === 'login' ? handleSignIn : handleSignUp} className="space-y-4">
                                {authView === 'register' && (
                                  <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 transition-all text-gray-900 placeholder:text-gray-400"
                                    placeholder="Full Name"
                                  />
                                )}
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 transition-all text-gray-900 placeholder:text-gray-400"
                                    placeholder="Email Address"
                                />
                                <input 
                                    type="password" 
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 transition-all text-gray-900 placeholder:text-gray-400"
                                    placeholder="Password"
                                />

                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-levy-blue text-white py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-50"
                                >
                                    {isLoading ? (authView === 'login' ? 'Signing In...' : 'Creating Account...') : (authView === 'login' ? 'Sign In' : 'Create Account')}
                                </button>
                              </form>
                            )}
                            
                            {authView !== 'confirm-email' && (
                              <div className="text-center text-sm">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setAuthView(authView === 'login' ? 'register' : 'login');
                                    setError(null);
                                  }} 
                                  className="text-levy-blue font-bold hover:underline"
                                >
                                    {authView === 'login' ? 'Create Account' : 'Log In'}
                                </button>
                              </div>
                            )}
                        </div>
                    )}

                    {/* Onboarding Steps */}
                    {authView === 'onboarding' && (
                        <>
                            <div className="flex gap-2 mb-8 pt-6">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${step >= i ? 'bg-levy-blue' : 'bg-gray-100'}`}></div>
                                ))}
                            </div>

                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-2xl font-bold text-gray-900">Who are you?</h2>
                                    <div className="grid grid-cols-1 gap-3">
                                        <button
                                            onClick={() => setFormData({...formData, entityType: EntityType.INDIVIDUAL})}
                                            className={`p-4 border rounded-xl text-left flex items-center gap-4 ${formData.entityType === EntityType.INDIVIDUAL ? 'border-levy-blue bg-blue-50 ring-1 ring-levy-blue' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><User size={20}/></div>
                                            <div>
                                                <span className="font-bold block text-gray-900">Individual</span>
                                                <span className="text-xs text-gray-500">Freelancer, Employee, Enterprise</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setFormData({...formData, entityType: EntityType.COMPANY, persona: PersonaType.COMPANY})}
                                            className={`p-4 border rounded-xl text-left flex items-center gap-4 ${formData.entityType === EntityType.COMPANY ? 'border-levy-blue bg-blue-50 ring-1 ring-levy-blue' : 'bg-white hover:bg-gray-50'}`}
                                        >
                                            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center"><Building size={20}/></div>
                                            <div>
                                                <span className="font-bold block text-gray-900">Company (Ltd)</span>
                                                <span className="text-xs text-gray-500">Registered Limited Liability Company</span>
                                            </div>
                                        </button>
                                    </div>
                                    
                                    <input 
                                        type="text" 
                                        placeholder="Your Name / Company Name"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-levy-blue bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                                    />

                                    <button onClick={() => setStep(2)} disabled={!formData.name} className="w-full bg-levy-blue text-white py-3.5 rounded-xl font-bold disabled:opacity-50">Next</button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {formData.entityType === EntityType.COMPANY ? 'Company Details' : 'Income Source'}
                                    </h2>
                                    
                                    {formData.entityType === EntityType.INDIVIDUAL ? (
                                        <div className="space-y-3">
                                             <label className="text-xs font-bold text-gray-500 uppercase">Primary Persona</label>
                                             <select 
                                                className="w-full p-3 border rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none"
                                                value={formData.persona}
                                                onChange={e => setFormData({...formData, persona: e.target.value as PersonaType})}
                                             >
                                                {Object.values(PersonaType).filter(p => p !== PersonaType.COMPANY).map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                             </select>
                                             <p className="text-xs text-gray-500 p-2 bg-gray-50 rounded">{PERSONA_DESCRIPTIONS[formData.persona]}</p>
                                        </div>
                                    ) : (
                                        <div className="bg-orange-50 p-4 rounded-xl text-orange-800 text-sm">
                                            <Building size={20} className="mb-2"/>
                                            Under the 2026 Act, companies with turnover ≤ ₦50m are <b>Small Companies</b> and exempt from CIT.
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                                            Est. Annual {formData.entityType === EntityType.COMPANY ? 'Turnover' : 'Gross Income'}
                                        </label>
                                        <input 
                                            type="number" 
                                            value={formData.turnover || ''}
                                            onChange={e => setFormData({...formData, turnover: parseFloat(e.target.value)})}
                                            className="w-full p-3 border border-gray-200 rounded-xl font-bold text-lg bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                                            placeholder="₦ 0.00"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(1)} className="px-6 py-3 text-gray-500 font-bold">Back</button>
                                        <button onClick={() => setStep(3)} className="flex-1 bg-levy-blue text-white py-3.5 rounded-xl font-bold">Next</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Location & Contact */}
                            {step === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-2xl font-bold text-gray-900">Location & Compliance</h2>
                                    
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1">
                                            <MapPin size={12}/> State of Residence
                                        </label>
                                        <select 
                                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none"
                                            value={formData.state}
                                            onChange={e => setFormData({...formData, state: e.target.value})}
                                        >
                                            {NIGERIAN_STATES.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                        <p className="text-[11px] text-gray-500 mt-1.5">
                                            We need this to tell you which state government collects your tax (Principal Place of Residence Rule).
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1 flex items-center gap-1">
                                            <Phone size={12}/> Phone Number
                                        </label>
                                        <input 
                                            type="tel" 
                                            value={formData.phone}
                                            onChange={e => setFormData({...formData, phone: e.target.value})}
                                            className="w-full p-3 border border-gray-200 rounded-xl font-medium text-lg bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-levy-blue/20"
                                            placeholder="+234"
                                        />
                                        <p className="text-[11px] text-gray-500 mt-1.5">
                                            We will send you SMS reminders so you don't pay fines for missing deadlines.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(2)} className="px-6 py-3 text-gray-500 font-bold">Back</button>
                                        <button onClick={() => setStep(4)} className="flex-1 bg-levy-blue text-white py-3.5 rounded-xl font-bold">Next</button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Step 4: Reliefs */}
                            {step === 4 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-2xl font-bold text-gray-900">Reliefs & Deductions</h2>
                                    
                                    {formData.entityType === EntityType.INDIVIDUAL ? (
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Annual Rent Paid</label>
                                            <input 
                                                type="number" 
                                                value={formData.rentPaid || ''}
                                                onChange={e => setFormData({...formData, rentPaid: parseFloat(e.target.value)})}
                                                className="w-full p-3 border border-gray-200 rounded-xl font-bold text-lg bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400"
                                                placeholder="₦ 0.00"
                                            />
                                            <p className="text-xs text-levy-blue mt-2 bg-blue-50 p-2 rounded">
                                                New 2026 Rule: You can deduct 20% of your rent (capped at ₦500k).
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <Briefcase size={32} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-gray-600 text-sm">
                                                We'll help you track your <b>Input VAT</b> on assets and services to reduce your liability.
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4">
                                        <button onClick={() => setStep(3)} className="px-6 py-3 text-gray-500 font-bold">Back</button>
                                        <button onClick={() => setStep(5)} className="flex-1 bg-levy-blue text-white py-3.5 rounded-xl font-bold">Next</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Pricing Plan */}
                            {step === 5 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-2xl font-bold text-gray-900">Select Your Plan</h2>
                                    
                                    <div className="space-y-3">
                                        {PRICING_PLANS.map((plan) => (
                                            <div 
                                                key={plan.id}
                                                onClick={() => setFormData({...formData, tier: plan.id as UserTier})}
                                                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.tier === plan.id ? 'border-levy-blue bg-blue-50 ring-1 ring-levy-blue' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                                                    <span className="font-bold text-gray-900">₦{plan.price.toLocaleString()}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-2">{plan.description}</p>
                                                <ul className="text-xs text-gray-600 space-y-1">
                                                    {plan.features.slice(0,3).map((f,i) => (
                                                        <li key={i} className="flex items-center gap-1.5">
                                                            <Check size={12} className="text-green-600"/> {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Disclaimer Section */}
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mt-2">
                                        <div className="flex items-start gap-3">
                                            <input 
                                                type="checkbox" 
                                                id="disclaimer"
                                                checked={disclaimerAgreed}
                                                onChange={(e) => setDisclaimerAgreed(e.target.checked)}
                                                className="mt-1 w-5 h-5 text-levy-blue rounded border-gray-300 focus:ring-levy-blue"
                                            />
                                            <label htmlFor="disclaimer" className="text-xs text-amber-900 leading-relaxed cursor-pointer">
                                                <b>I understand that LevyMate is an educational tool and not a tax advisory service.</b> It does not file taxes with the FIRS/NRS on my behalf. I am responsible for the accuracy of my declarations.
                                            </label>
                                        </div>
                                        <div className="mt-2 pl-8 text-[10px] text-amber-700">
                                            Read our <button onClick={() => openPolicy('usage')} className="underline font-bold">Usage Policy</button> and <button onClick={() => openPolicy('privacy')} className="underline font-bold">Privacy Policy</button>.
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button onClick={() => setStep(4)} className="px-6 py-3 text-gray-500 font-bold">Back</button>
                                        <button 
                                            onClick={handleStart} 
                                            disabled={!disclaimerAgreed}
                                            className="flex-1 bg-levy-blue text-white py-3.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {formData.tier === 'Pro' ? 'Subscribe & Start' : 'Start Free'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default App;
