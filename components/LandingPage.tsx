
import React from 'react';
import { CreditCard as CCIcon, FileText, Calculator, ChevronRight, User, PieChart, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import CreditCard from './CreditCard';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  openPolicy?: (type: 'privacy' | 'usage') => void;
  onViewFeatures: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, openPolicy, onViewFeatures }) => {
  
  return (
    <div className="min-h-screen bg-white font-sans text-levy-text overflow-x-hidden flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 lg:px-12 max-w-7xl mx-auto w-full relative z-50">
        <Logo />
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-levy-slate">
          <a href="#" className="hover:text-levy-mate transition-colors">Home</a>
          <button onClick={onViewFeatures} className="hover:text-levy-mate transition-colors">Features</button>
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
        </div>
        
        {/* Mobile Menu Button */}
        <button onClick={onLogin} className="md:hidden text-sm font-bold text-levy-blue">
            Log In
        </button>
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
                  <span>Version 2.0.0 (NTA 2025 Compliant)</span>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
