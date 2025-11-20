
import React from 'react';
import { X, Shield, FileText, Lock } from 'lucide-react';
import Logo from './Logo';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'usage';
}

const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${type === 'privacy' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
               {type === 'privacy' ? <Lock size={20} /> : <FileText size={20} />}
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">
                    {type === 'privacy' ? 'Privacy Policy' : 'Usage Policy & Terms'}
                </h2>
                <p className="text-xs text-gray-500">Effective Date: January 1, 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-8 text-sm text-gray-700 leading-relaxed space-y-6">
            <Logo className="scale-75 origin-left opacity-50 mb-4" />

            {type === 'privacy' ? (
                <>
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">1. Data Collection</h3>
                        <p>LevyMate collects minimal personal information required to estimate your tax liability. This includes your name, estimated annual income, rent payments, and transaction data you voluntarily input. We process image data for OCR receipt scanning solely for the purpose of extracting expense details.</p>
                    </section>
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">2. Data Storage & Security</h3>
                        <p>All financial calculations are performed locally within your browser session where possible. Persistent profile data is stored in your browser's LocalStorage. When using AI features, anonymized query data is sent to our secure inference providers (Google Gemini) solely to generate responses.</p>
                    </section>
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">3. No Government Sharing</h3>
                        <p className="font-bold">LevyMate does NOT share your data with the Federal Inland Revenue Service (FIRS), State Internal Revenue Services (SIRS), or the Nigeria Revenue Service (NRS). We are an independent educational tool.</p>
                    </section>
                     <section>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">4. User Rights</h3>
                        <p>You have the right to delete your profile and all associated data at any time by clearing your browser cache or using the "Reset Data" function in the application.</p>
                    </section>
                </>
            ) : (
                 <>
                    <section className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <h3 className="font-bold text-amber-900 mb-2 text-lg flex items-center gap-2"><Shield size={18}/> Important Disclaimer</h3>
                        <p className="text-amber-800 font-medium">LevyMate is an educational and estimation tool ONLY. We are not a certified tax practitioner, legal firm, or government agency.</p>
                    </section>
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">1. No Professional Advice</h3>
                        <p>The calculations provided by LevyMate are estimates based on the Nigeria Tax Act 2025 and Finance Acts. While we strive for accuracy, tax laws are subject to interpretation and frequent changes. You should consult a chartered accountant or tax professional before filing your returns.</p>
                    </section>
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">2. Limitation of Liability</h3>
                        <p>LevyMate and its developers shall not be held liable for any penalties, interest, or underpayment assessments levied by tax authorities resulting from reliance on this application. You are solely responsible for the accuracy of your tax filings.</p>
                    </section>
                    <section>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">3. Acceptable Use</h3>
                        <p>You agree not to use this application for fraudulent purposes, tax evasion, or to mislead financial institutions. The "Input VAT" and "WREN Test" features are tools to assist in compliance, not to fabricate expenses.</p>
                    </section>
                </>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
            <button onClick={onClose} className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
                I Understand
            </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
