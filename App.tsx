import React, { useState, useEffect, Suspense, lazy } from 'react';
import { TaxProfile, PersonaType, EntityType, UserTier } from './types';
import { PERSONA_DESCRIPTIONS, PERSONA_LABELS, NIGERIAN_STATES, PRICING_PLANS } from './constants';
import { 
  CheckCircle, ArrowRight, Building, User, 
  Shield, Lock, Mail, Calculator, Wallet, PieChart, ChevronRight, Briefcase, FileText, MapPin, Phone, Check, ArrowLeft, Loader, Wifi, Eye, EyeOff, Key
} from 'lucide-react';
import Logo from './components/Logo';
import PolicyModal from './components/PolicyModal';
import CreditCard from './components/CreditCard';
import CheckoutModal from './components/CheckoutModal';
import { authSignUp, authSignIn, authSignOut, authGetCurrentUser, authIsAuthenticated, authResendSignUpCode, authForgotPassword, authConfirmResetPassword } from './services/authService';
import { createProfile, getProfile, updateProfile } from './services/amplifyService';

// Lazy Load Components for Performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const FeaturesPage = lazy(() => import('./components/FeaturesPage'));

type AuthView = 'login' | 'register' | 'onboarding' | 'confirm-email' | 'forgot-password' | 'reset-password';

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
  
  // Auth UI State
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState(''); // For reset flow
  const [resetCode, setResetCode] = useState('');

  // Password Validation
  const validatePassword = (pwd: string) => {
      const hasUpper = /[A-Z]/.test(pwd);
      const hasLower = /[a-z]/.test(pwd);
      const hasNumber = /[0-9]/.test(pwd);
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
      const isLength = pwd.length >= 8;
      return { 
          hasUpper, hasLower, hasNumber, hasSymbol, isLength, 
          isValid: hasUpper && hasLower && hasNumber && hasSymbol && isLength 
      };
  };

  const passwordStrength = validatePassword(formData.password);
  const newPasswordStrength = validatePassword(newPassword);

  // Policy Modal State
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'usage'>('usage');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

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
      if (err.name === 'UsernameExistsException') {
        // User exists, try to resend code to see if they are unconfirmed
        try {
            await authResendSignUpCode(formData.email);
            setAuthView('confirm-email');
            setError('Account already exists. A new confirmation code has been sent to your email.');
            setIsLoading(false);
            return;
        } catch (resendErr: any) {
            // If resend fails, they are likely already confirmed
            setAuthView('login');
            setError('Account already exists. Please log in.');
            setIsLoading(false);
            return;
        }
      }
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
      const { authConfirmSignUp } = await import('./services/authService');
      await authConfirmSignUp(formData.email, confirmationCode);
      
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

    // If Pro is selected, require checkout first
    if (formData.tier === 'Pro' && !checkoutModalOpen) {
        setCheckoutModalOpen(true);
        return;
    }

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
      preferredPolicy: 'ACT_2026_PROPOSED'
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.email) {
        setError('Please enter your email address');
        return;
    }
    try {
        setIsLoading(true);
        await authForgotPassword(formData.email);
        setAuthView('reset-password');
        setIsLoading(false);
    } catch (err: any) {
        setError(err.message || 'Failed to send reset code');
        setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const strength = validatePassword(newPassword);
    if (!strength.isValid) {
        setError('Password does not meet security requirements');
        return;
    }

    try {
        setIsLoading(true);
        await authConfirmResetPassword({
            email: formData.email,
            code: resetCode,
            newPassword: newPassword
        });
        setAuthView('login');
        setFormData(prev => ({ ...prev, password: '' })); // Clear password
        setError(null);
        // Show success message (could be a toast, but for now we just switch view)
        alert('Password reset successfully. Please log in with your new password.');
        setIsLoading(false);
    } catch (err: any) {
        setError(err.message || 'Failed to reset password');
        setIsLoading(false);
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
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader className="animate-spin text-levy-blue" size={48} />
            </div>
        }>
            <Dashboard profile={profile} onLogout={handleLogout} onProfileUpdate={setProfile} />
        </Suspense>
    );
  }

  if (viewState === 'features') {
      return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader className="animate-spin text-levy-blue" size={48} />
            </div>
        }>
            <FeaturesPage onBack={() => setViewState('landing')} onGetStarted={handleEnterApp} />
        </Suspense>
      );
  }

  if (viewState === 'landing') {
      return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader className="animate-spin text-levy-blue" size={48} />
            </div>
        }>
            <LandingPage 
                onGetStarted={handleEnterApp} 
                onLogin={handleLogin} 
                openPolicy={openPolicy} 
                onViewFeatures={() => setViewState('features')} 
            />
            <PolicyModal isOpen={policyModalOpen} onClose={() => setPolicyModalOpen(false)} type={policyType} />
        </Suspense>
      );
  }

  // Auth & Registration Flow
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
        <PolicyModal isOpen={policyModalOpen} onClose={() => setPolicyModalOpen(false)} type={policyType} />
        <CheckoutModal 
            isOpen={checkoutModalOpen} 
            onClose={() => setCheckoutModalOpen(false)} 
            onSuccess={() => {
                setCheckoutModalOpen(false);
                handleStart(); // Proceed with profile creation
            }}
            planPrice={PRICING_PLANS.find(p => p.id === 'Pro')?.price || 2999}
            planName="Business Pro"
        />
        
        <div className="flex-1 flex flex-col lg:flex-row">
            {/* Left Panel - Dynamic 3D Cards */}
            <div className="hidden lg:flex lg:w-5/12 bg-[#0f172a] relative overflow-hidden flex-col items-center justify-center min-h-screen p-12">
                {/* Background effects */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-levy-mate/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{animationDelay: '2s'}}></div>

                {/* Logo above cards */}
                <div className="mb-12 relative z-30">
                    <Logo variant="white" />
                </div>

                <div className="relative z-10 w-full max-w-md h-[300px] flex items-center justify-center perspective-1000 mb-12">
                     {/* Card 1 (Back) */}
                     <div className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] scale-90 opacity-80 blur-[0.5px] transition-all duration-1000 hover:rotate-[-15deg] hover:scale-95 hover:opacity-90 hover:blur-0 z-0 shadow-2xl">
                        <CreditCard name="NIGERIA LTD" amount="₦2.4M" label="Corporate" variant="dark" />
                     </div>
                     {/* Card 2 (Middle) */}
                     <div className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 rotate-[-6deg] scale-95 opacity-90 transition-all duration-1000 hover:rotate-[-8deg] hover:scale-100 hover:opacity-100 z-10 shadow-2xl">
                        <CreditCard name="ADEOLA SMITH" amount="₦850k" label="Individual" variant="blue" />
                     </div>
                     {/* Card 3 (Front) */}
                     <div className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 rotate-[0deg] scale-100 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-1000 hover:rotate-[2deg] hover:scale-105 z-20">
                        <CreditCard name="YOUR PROFILE" amount="₦0.00" label="Tax Ready" variant="dark" />
                     </div>
                </div>
                
                <div className="relative z-30 text-center">
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Master Your Taxes</h2>
                    <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
                        Join thousands of Nigerians simplifying their tax compliance with AI-driven insights.
                    </p>
                    <div className="mt-6 flex justify-center gap-4 text-xs text-slate-500">
                        <button onClick={() => openPolicy('privacy')} className="hover:text-slate-300 transition-colors">Privacy</button>
                        <button onClick={() => openPolicy('usage')} className="hover:text-slate-300 transition-colors">Terms</button>
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Forms */}
            <div className="lg:w-7/12 flex items-center justify-center p-6 lg:p-12 bg-levy-offWhite min-h-screen">
                <div className="w-full max-w-md bg-white p-8 lg:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-white relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Back Button */}
                    {(authView !== 'login' && authView !== 'onboarding') && (
                        <button 
                            onClick={() => {
                                if (authView === 'reset-password') setAuthView('forgot-password');
                                else if (authView === 'forgot-password') setAuthView('login');
                                else if (authView === 'register' && step > 1) setStep(step - 1);
                                else if (authView === 'register') setAuthView('login');
                                else setViewState('landing');
                            }}
                            className="absolute top-8 left-8 text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    
                    {authView === 'login' && (
                        <button 
                            onClick={() => setViewState('landing')}
                            className="absolute top-8 left-8 text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}

                    {/* Header */}
                    <div className="mb-8 text-center lg:text-left mt-8 lg:mt-0">
                        <div className="lg:hidden flex justify-center mb-6"><Logo variant="full" /></div>
                        <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
                            {authView === 'login' && 'Welcome Back'}
                            {authView === 'register' && 'Create Account'}
                            {authView === 'forgot-password' && 'Reset Password'}
                            {authView === 'reset-password' && 'New Password'}
                            {authView === 'confirm-email' && 'Verify Email'}
                            {authView === 'onboarding' && 'Setup Profile'}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {authView === 'login' && 'Enter your details to access your dashboard.'}
                            {authView === 'register' && 'Start your journey to stress-free taxes.'}
                            {authView === 'forgot-password' && 'Enter your email to receive a reset code.'}
                            {authView === 'reset-password' && 'Create a strong password for your account.'}
                            {authView === 'confirm-email' && 'We sent a code to your email address.'}
                            {authView === 'onboarding' && 'Let\'s customize LevyMate for you.'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <Shield size={18} className="mt-0.5 flex-shrink-0" />
                            <div>{error}</div>
                        </div>
                    )}

                    {/* FORMS */}
                    
                    {/* 1. Login Form */}
                    {authView === 'login' && (
                        <form onSubmit={handleSignIn} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all text-gray-900 placeholder:text-gray-400"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                                    <button type="button" onClick={() => setAuthView('forgot-password')} className="text-xs font-bold text-levy-blue hover:underline">Forgot?</button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all text-gray-900 placeholder:text-gray-400"
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-levy-blue text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isLoading ? <Loader className="animate-spin mx-auto" /> : 'Sign In'}
                            </button>

                            <div className="text-center pt-2">
                                <span className="text-gray-500 text-sm">Don't have an account? </span>
                                <button type="button" onClick={() => setAuthView('register')} className="text-levy-blue font-bold hover:underline text-sm">Create Account</button>
                            </div>
                        </form>
                    )}

                    {/* 2. Register Form */}
                    {authView === 'register' && (
                        <form onSubmit={handleSignUp} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all text-gray-900 placeholder:text-gray-400"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all text-gray-900 placeholder:text-gray-400"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all text-gray-900 placeholder:text-gray-400"
                                        placeholder="Create a strong password"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                
                                {/* Password Strength Meter */}
                                {formData.password && (
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2 animate-in fade-in slide-in-from-top-1">
                                        <div className="flex gap-1 mb-2">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                                                    (i === 1 && passwordStrength.isLength) ||
                                                    (i === 2 && passwordStrength.hasUpper && passwordStrength.hasLower) ||
                                                    (i === 3 && passwordStrength.hasNumber) ||
                                                    (i === 4 && passwordStrength.hasSymbol)
                                                    ? 'bg-green-500' : 'bg-gray-200'
                                                }`}></div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                                            <div className={`flex items-center gap-1 ${passwordStrength.isLength ? 'text-green-600' : ''}`}>
                                                {passwordStrength.isLength ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />} 8+ Characters
                                            </div>
                                            <div className={`flex items-center gap-1 ${passwordStrength.hasUpper && passwordStrength.hasLower ? 'text-green-600' : ''}`}>
                                                {passwordStrength.hasUpper && passwordStrength.hasLower ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />} Upper & Lowercase
                                            </div>
                                            <div className={`flex items-center gap-1 ${passwordStrength.hasNumber ? 'text-green-600' : ''}`}>
                                                {passwordStrength.hasNumber ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />} Number
                                            </div>
                                            <div className={`flex items-center gap-1 ${passwordStrength.hasSymbol ? 'text-green-600' : ''}`}>
                                                {passwordStrength.hasSymbol ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />} Symbol
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading || !passwordStrength.isValid}
                                className="w-full bg-levy-blue text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isLoading ? <Loader className="animate-spin mx-auto" /> : 'Create Account'}
                            </button>

                            <div className="text-center pt-2">
                                <span className="text-gray-500 text-sm">Already have an account? </span>
                                <button type="button" onClick={() => setAuthView('login')} className="text-levy-blue font-bold hover:underline text-sm">Sign In</button>
                            </div>
                        </form>
                    )}

                    {/* 3. Forgot Password Form */}
                    {authView === 'forgot-password' && (
                        <form onSubmit={handleForgotPassword} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all text-gray-900 placeholder:text-gray-400"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-levy-blue text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/10"
                            >
                                {isLoading ? <Loader className="animate-spin mx-auto" /> : 'Send Reset Code'}
                            </button>
                        </form>
                    )}

                    {/* 4. Reset Password Form */}
                    {authView === 'reset-password' && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Reset Code</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type="text" 
                                        value={resetCode}
                                        onChange={(e) => setResetCode(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all text-gray-900 placeholder:text-gray-400"
                                        placeholder="Enter code from email"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all text-gray-900 placeholder:text-gray-400"
                                        placeholder="New strong password"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {/* Password Strength Meter for Reset */}
                                {newPassword && (
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2 animate-in fade-in slide-in-from-top-1">
                                        <div className="flex gap-1 mb-2">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                                                    (i === 1 && newPasswordStrength.isLength) ||
                                                    (i === 2 && newPasswordStrength.hasUpper && newPasswordStrength.hasLower) ||
                                                    (i === 3 && newPasswordStrength.hasNumber) ||
                                                    (i === 4 && newPasswordStrength.hasSymbol)
                                                    ? 'bg-green-500' : 'bg-gray-200'
                                                }`}></div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                                            <div className={`flex items-center gap-1 ${newPasswordStrength.isLength ? 'text-green-600' : ''}`}>
                                                {newPasswordStrength.isLength ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />} 8+ Characters
                                            </div>
                                            <div className={`flex items-center gap-1 ${newPasswordStrength.hasUpper && newPasswordStrength.hasLower ? 'text-green-600' : ''}`}>
                                                {newPasswordStrength.hasUpper && newPasswordStrength.hasLower ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />} Upper & Lowercase
                                            </div>
                                            <div className={`flex items-center gap-1 ${newPasswordStrength.hasNumber ? 'text-green-600' : ''}`}>
                                                {newPasswordStrength.hasNumber ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />} Number
                                            </div>
                                            <div className={`flex items-center gap-1 ${newPasswordStrength.hasSymbol ? 'text-green-600' : ''}`}>
                                                {newPasswordStrength.hasSymbol ? <Check size={10} /> : <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />} Symbol
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button 
                                type="submit"
                                disabled={isLoading || !newPasswordStrength.isValid}
                                className="w-full bg-levy-blue text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/10"
                            >
                                {isLoading ? <Loader className="animate-spin mx-auto" /> : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    {/* 5. Confirm Email Form */}
                    {authView === 'confirm-email' && (
                        <form onSubmit={handleConfirmEmail} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Confirmation Code</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input 
                                        type="text" 
                                        value={confirmationCode}
                                        onChange={(e) => setConfirmationCode(e.target.value)}
                                        placeholder="Enter code from email"
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-levy-blue text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/10"
                            >
                                {isLoading ? <Loader className="animate-spin mx-auto" /> : 'Confirm Email'}
                            </button>
                        </form>
                    )}

                    {/* 6. Onboarding Flow (Existing logic with improved styling) */}
                    {authView === 'onboarding' && (
                        <>
                            <div className="flex gap-2 mb-8 pt-6">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${step >= i ? 'bg-levy-blue' : 'bg-gray-100'}`}></div>
                                ))}
                            </div>

                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-2xl font-bold text-gray-900">Who are you?</h2>
                                    <div className="grid grid-cols-1 gap-3">
                                        <button
                                            onClick={() => setFormData({...formData, entityType: EntityType.INDIVIDUAL})}
                                            className={`p-4 border rounded-xl text-left flex items-center gap-4 transition-all duration-200 ${formData.entityType === EntityType.INDIVIDUAL ? 'border-levy-blue bg-blue-50 ring-1 ring-levy-blue shadow-md' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                                        >
                                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0"><User size={24}/></div>
                                            <div>
                                                <span className="font-bold block text-gray-900 text-lg">Individual</span>
                                                <span className="text-xs text-gray-500">Freelancer, Employee, Enterprise</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setFormData({...formData, entityType: EntityType.COMPANY, persona: PersonaType.COMPANY})}
                                            className={`p-4 border rounded-xl text-left flex items-center gap-4 transition-all duration-200 ${formData.entityType === EntityType.COMPANY ? 'border-levy-blue bg-blue-50 ring-1 ring-levy-blue shadow-md' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                                        >
                                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0"><Building size={24}/></div>
                                            <div>
                                                <span className="font-bold block text-gray-900 text-lg">Company (Ltd)</span>
                                                <span className="text-xs text-gray-500">Registered Limited Liability Company</span>
                                            </div>
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Display Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="Your Name / Company Name"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full p-3.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400 transition-all"
                                        />
                                    </div>

                                    <button onClick={() => setStep(2)} disabled={!formData.name} className="w-full bg-levy-blue text-white py-4 rounded-xl font-bold disabled:opacity-50 shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all">Next Step</button>
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
                                                className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all"
                                                value={formData.persona}
                                                onChange={e => setFormData({...formData, persona: e.target.value as PersonaType})}
                                             >
                                                {Object.values(PersonaType).filter(p => p !== PersonaType.COMPANY).map(p => (
                                                    <option key={p} value={p}>{PERSONA_LABELS[p]}</option>
                                                ))}
                                             </select>
                                             <p className="text-xs text-gray-500 p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-800">{PERSONA_DESCRIPTIONS[formData.persona]}</p>
                                        </div>
                                    ) : (
                                        <div className="bg-orange-50 p-4 rounded-xl text-orange-800 text-sm border border-orange-100">
                                            <Building size={20} className="mb-2"/>
                                            Under the 2026 Act, companies with turnover ≤ ₦50m are <b>Small Companies</b> and exempt from CIT.
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                                            Est. Annual {formData.entityType === EntityType.COMPANY ? 'Turnover' : 'Gross Income'}
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                                            <input 
                                                type="number" 
                                                value={formData.turnover || ''}
                                                onChange={e => setFormData({...formData, turnover: parseFloat(e.target.value)})}
                                                className="w-full pl-10 pr-4 p-3.5 border border-gray-200 rounded-xl font-bold text-lg bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(1)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Back</button>
                                        <button onClick={() => setStep(3)} className="flex-1 bg-levy-blue text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all">Next</button>
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
                                            className="w-full p-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all"
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
                                            className="w-full p-3.5 border border-gray-200 rounded-xl font-medium text-lg bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all"
                                            placeholder="+234"
                                        />
                                        <p className="text-[11px] text-gray-500 mt-1.5">
                                            We will send you SMS reminders so you don't pay fines for missing deadlines.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(2)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Back</button>
                                        <button onClick={() => setStep(4)} className="flex-1 bg-levy-blue text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all">Next</button>
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
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                                                <input 
                                                    type="number" 
                                                    value={formData.rentPaid || ''}
                                                    onChange={e => setFormData({...formData, rentPaid: parseFloat(e.target.value)})}
                                                    className="w-full pl-10 pr-4 p-3.5 border border-gray-200 rounded-xl font-bold text-lg bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <p className="text-xs text-levy-blue mt-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
                                                New 2026 Rule: You can deduct 20% of your rent (capped at ₦500k).
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                                            <Briefcase size={32} className="mx-auto text-gray-300 mb-3" />
                                            <p className="text-gray-600 text-sm max-w-xs mx-auto">
                                                We'll help you track your <b>Input VAT</b> on assets and services to reduce your liability.
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-4">
                                        <button onClick={() => setStep(3)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Back</button>
                                        <button onClick={() => setStep(5)} className="flex-1 bg-levy-blue text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all">Next</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Pricing Plan */}
                            {step === 5 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-2xl font-bold text-gray-900">Select Your Plan</h2>
                                    
                                    <div className="space-y-4">
                                        {PRICING_PLANS.map((plan) => (
                                            <div 
                                                key={plan.id}
                                                onClick={() => setFormData({...formData, tier: plan.id as UserTier})}
                                                className={`relative w-full aspect-[1.586] rounded-2xl p-6 text-white shadow-xl overflow-hidden transition-transform duration-300 hover:scale-[1.02] cursor-pointer border-4 ${
                                                    formData.tier === plan.id 
                                                        ? 'border-levy-mate ring-2 ring-levy-mate ring-offset-2' 
                                                        : 'border-transparent'
                                                } ${
                                                    plan.id === 'Pro' 
                                                        ? 'bg-gradient-to-br from-slate-800 to-slate-950' 
                                                        : 'bg-gradient-to-br from-blue-500 to-blue-700'
                                                }`}
                                            >
                                                {/* Background Texture */}
                                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
                                                <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                                                
                                                {/* Chip & Wifi */}
                                                <div className="flex justify-between items-start mb-6 relative z-10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-8 bg-yellow-200 rounded-md flex items-center justify-center overflow-hidden relative border border-yellow-300 shadow-sm bg-gradient-to-br from-yellow-100 to-yellow-300">
                                                            <div className="absolute w-full h-[1px] bg-yellow-600/40 top-1/3"></div>
                                                            <div className="absolute w-full h-[1px] bg-yellow-600/40 bottom-1/3"></div>
                                                            <div className="absolute h-full w-[1px] bg-yellow-600/40 left-1/3"></div>
                                                            <div className="absolute h-full w-[1px] bg-yellow-600/40 right-1/3"></div>
                                                        </div>
                                                        <Wifi className="rotate-90 text-white/50" size={20} />
                                                    </div>
                                                    {formData.tier === plan.id && (
                                                        <div className="bg-white text-blue-900 p-1.5 rounded-full shadow-lg animate-in zoom-in">
                                                            <Check size={16} strokeWidth={4} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Plan Name & Price */}
                                                <div className="relative z-10 mb-6">
                                                    <div className="text-xs text-white/70 uppercase tracking-widest font-mono mb-1">{plan.name}</div>
                                                    <div className="text-3xl font-mono font-bold tracking-widest text-white flex items-baseline gap-2 shadow-black drop-shadow-md">
                                                        ₦{plan.price.toLocaleString()} <span className="text-xs font-normal opacity-70 tracking-normal">{plan.id === 'Pro' ? '/mo' : ''}</span>
                                                    </div>
                                                </div>

                                                {/* Features Preview */}
                                                <div className="relative z-10 flex justify-between items-end">
                                                    <div>
                                                        <div className="text-[9px] text-white/60 uppercase mb-1 font-mono">Includes</div>
                                                        <div className="text-xs font-medium text-white/90 font-mono tracking-tight">
                                                            {plan.features[0]} + {plan.features.length - 1} more
                                                        </div>
                                                    </div>
                                                    <div className="text-xs font-bold bg-white/20 px-3 py-1 rounded backdrop-blur-md font-mono uppercase">
                                                        {plan.id}
                                                    </div>
                                                </div>
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
                                        <button onClick={() => setStep(4)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Back</button>
                                        <button 
                                            onClick={handleStart} 
                                            disabled={!disclaimerAgreed}
                                            className="flex-1 bg-levy-blue text-white py-3.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all"
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
