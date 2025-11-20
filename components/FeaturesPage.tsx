
import React from 'react';
import { ArrowLeft, Check, Shield, Zap, PieChart, Brain, FileText, Lock } from 'lucide-react';
import { PRICING_PLANS } from '../constants';
import Logo from './Logo';

interface FeaturesPageProps {
  onBack: () => void;
  onGetStarted: () => void;
}

const FeaturesPage: React.FC<FeaturesPageProps> = ({ onBack, onGetStarted }) => {
  
  const FeatureItem = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-levy-blue/30 transition-colors">
      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-levy-blue mb-4">
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <ArrowLeft size={24} />
            </button>
            <Logo />
        </div>
        <button onClick={onGetStarted} className="bg-levy-blue text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
            Get Started
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-24">
        
        {/* Hero Features */}
        <section className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Master the <span className="text-levy-mate">2026 Tax Act</span> with Intelligent Tools.
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
                LevyMate isn't just a calculator; it's a comprehensive compliance engine designed for the Nigerian market.
            </p>
        </section>

        {/* Feature Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureItem 
                icon={Brain} 
                title="AI Tax Assistant" 
                desc="Powered by Gemini, our AI explains complex laws like the WREN test and Small Company exemptions in simple English."
            />
            <FeatureItem 
                icon={Zap} 
                title="Instant Calculations" 
                desc="Real-time estimation of PIT, CIT, and Development Levy based on the latest Finance Acts."
            />
            <FeatureItem 
                icon={PieChart} 
                title="Visual Analytics" 
                desc="See exactly where you stand with the Exemption Threshold Monitor and Income Source breakdown."
            />
            <FeatureItem 
                icon={FileText} 
                title="OCR Receipt Scanning" 
                desc="(Pro) Snap a picture of your receipt, and we'll extract the data, categorize it, and check for VAT credits."
            />
            <FeatureItem 
                icon={Shield} 
                title="Compliance Alerts" 
                desc="Never miss a filing deadline. We track your compliance calendar based on your entity type."
            />
            <FeatureItem 
                icon={Lock} 
                title="Secure & Private" 
                desc="Your financial data is stored locally in your browser. We don't share data with the FIRS."
            />
        </section>

        {/* Pricing Section */}
        <section className="bg-slate-900 rounded-3xl p-8 md:p-16 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-levy-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
                <p className="text-slate-400">Choose the plan that fits your business stage.</p>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {PRICING_PLANS.map((plan) => (
                    <div key={plan.id} className={`p-8 rounded-2xl border ${plan.popular ? 'bg-white text-gray-900 border-white' : 'bg-slate-800 border-slate-700 text-white'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-xl">{plan.name}</h3>
                                <p className={`text-sm ${plan.popular ? 'text-gray-500' : 'text-slate-400'}`}>{plan.description}</p>
                            </div>
                            {plan.popular && <span className="bg-levy-blue text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>}
                        </div>
                        
                        <div className="mb-6">
                            <span className="text-4xl font-bold">₦{plan.price.toLocaleString()}</span>
                            {plan.price > 0 && <span className="text-sm opacity-70"> / month</span>}
                        </div>

                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feat, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm">
                                    <div className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? 'bg-green-100 text-green-600' : 'bg-slate-700 text-levy-mate'}`}>
                                        <Check size={12} />
                                    </div>
                                    <span className={plan.popular ? 'text-gray-700' : 'text-slate-300'}>{feat}</span>
                                </li>
                            ))}
                        </ul>

                        <button 
                            onClick={onGetStarted}
                            className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                                plan.popular 
                                ? 'bg-levy-blue text-white hover:bg-blue-700 shadow-xl shadow-blue-900/20' 
                                : 'bg-slate-700 text-white hover:bg-slate-600'
                            }`}
                        >
                            {plan.cta}
                        </button>
                    </div>
                ))}
            </div>
        </section>
      </div>
    </div>
  );
};

export default FeaturesPage;
