import React, { useState } from 'react';
import { ArrowLeft, User, FileText, Brain, Download, ChevronDown, ChevronUp, Shield, Zap } from 'lucide-react';
import Logo from './Logo';

interface HowItWorksPageProps {
  onBack: () => void;
  onGetStarted: () => void;
}

const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onBack, onGetStarted }) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const steps = [
    {
      id: 1,
      title: "Create Your Tax Profile",
      icon: User,
      description: "Tell LevyMate who you are to get tailored compliance rules.",
      details: [
        "Select Entity Type: Individual (Salary/Business) or Company (Ltd).",
        "Choose Policy Year: Compare 2024 Finance Act vs. Proposed 2026 Rules.",
        "Set Location: State of residence determines your tax authority."
      ],
      proFeature: false
    },
    {
      id: 2,
      title: "Input Financial Data",
      icon: FileText,
      description: "Enter your income and expenses. We support manual entry and AI automation.",
      details: [
        "Manual Entry: Type in salary, business turnover, and relief items.",
        "Transaction Manager: Log daily expenses to track deductible input VAT.",
        "AI Receipt Scanning (Pro): Snap a photo of invoices to auto-extract data."
      ],
      proFeature: true
    },
    {
      id: 3,
      title: "AI Analysis & Calculation",
      icon: Brain,
      description: "Our engine applies thousands of tax rules instantly.",
      details: [
        "Real-time Computation: See PIT, CIT, and Levy estimates update as you type.",
        "Compliance Checks: Automatic detection of missing fields or audit risks.",
        "AI Chat Assistant: Ask questions like 'Is my lunch expense deductible?'"
      ],
      proFeature: false
    },
    {
      id: 4,
      title: "Optimize & Report",
      icon: Download,
      description: "Get actionable insights to legally reduce your liability.",
      details: [
        "Relief Suggestions: We flag unclaimed reliefs (e.g., Life Insurance, NHF).",
        "Visual Analytics: Charts showing where your money goes.",
        "Export Reports: Download professional summaries for your records."
      ],
      proFeature: true
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
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

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">How LevyMate Works</h1>
            <p className="text-xl text-gray-500">From basic compliance to advanced tax planning in 4 steps.</p>
        </div>

        <div className="space-y-6 relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gray-100 hidden md:block"></div>

            {steps.map((step) => (
                <div key={step.id} className="relative md:pl-24 transition-all duration-500">
                    {/* Number Bubble */}
                    <div className="hidden md:flex absolute left-0 top-0 w-16 h-16 bg-white border-4 border-gray-50 rounded-full items-center justify-center z-10 shadow-sm">
                        <span className="text-2xl font-bold text-levy-blue">{step.id}</span>
                    </div>

                    <div 
                        className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                            expandedStep === step.id ? 'border-levy-blue shadow-lg ring-1 ring-levy-blue/20' : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <button 
                            onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                            className="w-full p-6 flex items-start gap-4 text-left"
                        >
                            <div className={`p-3 rounded-xl flex-shrink-0 ${step.proFeature ? 'bg-slate-900 text-white' : 'bg-blue-50 text-levy-blue'}`}>
                                <step.icon size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-bold text-lg text-gray-900">{step.title}</h3>
                                    {step.proFeature && (
                                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                                            <Zap size={10} fill="currentColor" /> PRO
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-500 text-sm">{step.description}</p>
                            </div>
                            <div className="text-gray-400">
                                {expandedStep === step.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </div>
                        </button>

                        {/* Expanded Content */}
                        {expandedStep === step.id && (
                            <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2">
                                <div className="h-px w-full bg-gray-100 mb-4"></div>
                                <ul className="space-y-3">
                                    {step.details.map((detail, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-levy-blue flex-shrink-0"></div>
                                            <span>{detail}</span>
                                        </li>
                                    ))}
                                </ul>
                                {step.proFeature && (
                                    <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
                                        <Shield size={16} className="text-slate-500" />
                                        <p className="text-xs text-slate-600">
                                            <span className="font-bold">Pro Tip:</span> Upgrading unlocks automation features that save 5+ hours per month.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-16 text-center bg-levy-blue/5 rounded-3xl p-8 border border-levy-blue/10">
            <h3 className="text-2xl font-bold text-levy-blue mb-2">Ready to simplify your taxes?</h3>
            <p className="text-gray-600 mb-6">Join thousands of Nigerians using LevyMate today.</p>
            <button 
                onClick={onGetStarted}
                className="bg-levy-blue text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-blue-900/10 hover:bg-blue-700 hover:scale-105 transition-all"
            >
                Create Free Account
            </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
