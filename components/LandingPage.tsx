
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { CreditCard as CCIcon, FileText, Calculator, ChevronRight, User, PieChart, ArrowRight, Smartphone, X, Download, Share, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import Logo from './Logo';
import CreditCard from './CreditCard';
import FloatingChatBubble from './FloatingChatBubble';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  openPolicy?: (type: 'privacy' | 'usage') => void;
  onViewFeatures: () => void;
  onViewHowItWorks: () => void;
  onViewFeedback?: () => void;
  isAuthenticated?: boolean;
  onGoToDashboard?: () => void;
  onLogout?: () => void;
  userName?: string;
}

// PWA Install Banner Component
const PWAInstallBanner: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        onDismiss();
      }
      setDeferredPrompt(null);
    }
  };

  if (showIOSInstructions) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-50 safe-area-pb animate-in slide-in-from-bottom duration-300">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-bold text-gray-900 text-sm">Install LevyMate on iPhone</h4>
            <button onClick={() => setShowIOSInstructions(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-3 text-xs text-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">1</div>
              <span>Tap the <Share className="inline w-4 h-4 text-blue-500" /> Share button in Safari</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">2</div>
              <span>Scroll down and tap <b>"Add to Home Screen"</b></span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">3</div>
              <span>Tap <b>"Add"</b> to install LevyMate</span>
            </div>
          </div>
          <button 
            onClick={() => { setShowIOSInstructions(false); onDismiss(); }}
            className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg text-xs font-semibold"
          >
            Got it!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-levy-blue to-blue-700 text-white p-3 z-50 safe-area-pb animate-in slide-in-from-bottom duration-300">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Smartphone size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm">Add to Home Screen</h4>
          <p className="text-[10px] text-white/80 truncate">Quick access without opening browser</p>
        </div>
        <button 
          onClick={handleInstallClick}
          className="bg-white text-levy-blue px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 hover:bg-white/90 transition-colors"
        >
          Install
        </button>
        <button onClick={onDismiss} className="text-white/60 hover:text-white p-1">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// App Store Buttons Component (Coming Soon)
const AppStoreButtons: React.FC = () => {
  return (
    <div className="flex flex-col items-center lg:items-start gap-3 mt-6">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Mobile App Coming Soon</span>
      <div className="flex gap-3 opacity-50 grayscale pointer-events-none select-none">
        {/* iOS App Store Button */}
        <div className="relative">
          <div className="bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-2.5 border border-gray-700">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="text-left">
              <div className="text-[8px] leading-none">Download on the</div>
              <div className="text-sm font-semibold leading-tight">App Store</div>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[8px] font-bold px-2 py-0.5 rounded-full">
            SOON
          </div>
        </div>

        {/* Google Play Button */}
        <div className="relative">
          <div className="bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-2.5 border border-gray-700">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.25-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.56.69.56 1.19s-.22.92-.56 1.19l-2.11 1.24-2.5-2.5 2.5-2.5 2.11 1.38zm-3.35-4.31l-2.27 2.27-8.49-8.49 10.76 6.22z"/>
            </svg>
            <div className="text-left">
              <div className="text-[8px] leading-none">GET IT ON</div>
              <div className="text-sm font-semibold leading-tight">Google Play</div>
            </div>
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[8px] font-bold px-2 py-0.5 rounded-full">
            SOON
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, openPolicy, onViewFeatures, onViewHowItWorks, onViewFeedback, isAuthenticated, onGoToDashboard, onLogout, userName }) => {
  const [showPWABanner, setShowPWABanner] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    checkMobile();

    // Check if already installed as PWA or dismissed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const dismissed = localStorage.getItem('pwa_banner_dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

    // Show banner if: mobile, not installed, not dismissed in last 24h
    if (!isStandalone && dismissedTime < oneDayAgo) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => {
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          setShowPWABanner(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissPWA = () => {
    setShowPWABanner(false);
    localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
  };
  
  return (
    <div className="min-h-screen bg-white font-sans text-levy-text overflow-x-hidden flex flex-col">
      <Helmet>
        <title>LevyMate - Free Nigerian Tax Calculator | PAYE, CIT & VAT Calculator</title>
        <meta name="description" content="Calculate Nigerian taxes free with LevyMate. Instant PAYE calculator, CIT estimator, VAT tracker. AI-powered tax advice compliant with Nigeria Tax Act 2025. For individuals & businesses." />
        <meta name="keywords" content="Nigerian tax calculator, PAYE calculator Nigeria, CIT calculator, VAT Nigeria, tax compliance, Nigeria Tax Act 2025, income tax calculator, company tax Nigeria" />
        <link rel="canonical" href="https://www.levymatesystems.com/" />
        <meta property="og:title" content="LevyMate - Free Nigerian Tax Calculator" />
        <meta property="og:description" content="Calculate Nigerian taxes instantly. PAYE, CIT, VAT with AI-powered advice." />
        <meta property="og:url" content="https://www.levymatesystems.com/" />
      </Helmet>
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 lg:px-12 max-w-7xl mx-auto w-full relative z-50">
        <Logo />
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-levy-slate">
          <a href="#" className="hover:text-levy-mate transition-colors">Home</a>
          <button onClick={onViewHowItWorks} className="hover:text-levy-mate transition-colors">How It Works</button>
          <button onClick={onViewFeatures} className="hover:text-levy-mate transition-colors">Features</button>
          
          {isAuthenticated ? (
            /* User Profile Dropdown - shown when logged in */
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full pl-3 pr-2 py-1.5 transition-colors"
              >
                <div className="w-7 h-7 bg-levy-blue rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {userName && (
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
                    </div>
                  )}
                  <button 
                    onClick={() => { setShowUserMenu(false); onGoToDashboard?.(); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <LayoutDashboard size={16} className="text-levy-blue" />
                    Dashboard
                  </button>
                  <button 
                    onClick={() => { setShowUserMenu(false); onLogout?.(); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Login/Register buttons - shown when not logged in */
            <>
              <button 
                onClick={onLogin}
                className="text-levy-blue hover:text-levy-mate transition-colors font-semibold"
              >
                Login
              </button>
              <button 
                onClick={onGetStarted}
                className="bg-levy-blue text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all"
              >
                Get Started
              </button>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        {isAuthenticated ? (
          <button 
            onClick={onGoToDashboard} 
            className="md:hidden w-9 h-9 bg-levy-blue rounded-full flex items-center justify-center"
          >
            <User size={18} className="text-white" />
          </button>
        ) : (
          <button onClick={onLogin} className="md:hidden text-sm font-bold text-levy-blue">
            Log In
          </button>
        )}
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 lg:px-12 flex flex-col-reverse lg:flex-row items-center justify-between mt-8 lg:mt-0 gap-12 pb-20 w-full">
        
        {/* LEFT SIDE: Credit Card Animation */}
        <div className="flex-1 relative w-full max-w-lg group perspective-1000 cursor-pointer flex justify-center" onClick={onGetStarted}>
            {/* Abstract representation */}
            <div className="relative w-full aspect-square max-w-[500px] flex items-center justify-center">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-levy-mate/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse group-hover:bg-levy-mate/30 transition-colors duration-500"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-levy-mint rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse group-hover:opacity-100 transition-all duration-500" style={{animationDelay: '1s'}}></div>
                
                {/* Composition */}
                <div className="relative z-10 w-full flex flex-col items-center justify-center">
                    
                    {/* Card Container - Rotated */}
                    <div className="w-[80%] transform -rotate-6 transition-all duration-500 group-hover:rotate-0 group-hover:scale-105 hover:z-20 shadow-[0_30px_60px_-12px_rgba(50,50,93,0.25)] rounded-2xl">
                        <CreditCard 
                            name="CHINEDU OKONKWO" 
                            amount="₦150,000" 
                            label="Tax Liability"
                            variant="blue"
                        />
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute -top-0 -right-4 bg-white p-4 rounded-2xl shadow-xl z-20 text-levy-mate animate-bounce transition-transform duration-500 group-hover:translate-x-4 group-hover:-translate-y-4" style={{animationDuration: '3s'}}>
                        <span className="font-bold text-2xl block">15%</span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Tax Rate</span>
                    </div>

                    <div className="absolute bottom-10 -left-4 bg-white p-3 rounded-full shadow-xl z-20 text-gray-700 flex items-center gap-3 animate-bounce transition-transform duration-500 group-hover:-translate-x-4 group-hover:translate-y-4" style={{animationDuration: '4s', animationDelay: '0.5s'}}>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <PieChart size={20} />
                        </div>
                        <div className="pr-4">
                            <div className="text-[10px] text-gray-400 font-bold uppercase">Input VAT</div>
                            <div className="font-bold text-sm">Saved ₦45k</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT SIDE: Welcome Message */}
        <div className="flex-1 w-full flex flex-col justify-center text-center lg:text-left">
            <div className="space-y-8">
                <div>
                    <h1 className="text-5xl lg:text-7xl font-display font-bold text-levy-blue leading-[0.9]">
                        FILING <br/>
                        <span className="text-levy-mate">THE TAXES</span>
                    </h1>
                </div>
                
                <p className="text-levy-slate text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                    Navigate the <b>Nigeria Tax Act 2025</b> with confidence. Estimate liability, track WREN deductions, and claim Input VAT automatically.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                    <button 
                        onClick={onGetStarted}
                        className="bg-levy-blue text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-lg shadow-blue-900/20 hover:bg-blue-700 hover:scale-105 transition-all duration-300 flex items-center gap-3"
                    >
                        Start Now <ChevronRight size={20} strokeWidth={3} />
                    </button>
                    <button onClick={onLogin} className="text-gray-500 font-bold hover:text-levy-blue px-6 py-4">
                        Existing User
                    </button>
                </div>

                {/* App Store Buttons - Coming Soon */}
                <AppStoreButtons />
            </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
              <p>© 2026 LevyMate. All rights reserved.</p>
              <div className="flex gap-6">
                  {openPolicy && (
                    <>
                      <button onClick={() => openPolicy('privacy')} className="hover:text-levy-blue transition-colors">Privacy Policy</button>
                      <button onClick={() => openPolicy('usage')} className="hover:text-levy-blue transition-colors">Terms of Usage</button>
                    </>
                  )}
                  {onViewFeedback && (
                    <button onClick={onViewFeedback} className="hover:text-levy-blue transition-colors">Feedback</button>
                  )}
                  <span>Version 2.0.0 (NTA 2025 Compliant)</span>
              </div>
          </div>
      </footer>

      {/* PWA Install Banner (Mobile Only) */}
      {showPWABanner && <PWAInstallBanner onDismiss={handleDismissPWA} />}

      {/* Floating AI Chat Bubble - Available for all visitors */}
      <FloatingChatBubble onSignUp={onGetStarted} />
    </div>
  );
};

export default LandingPage;
