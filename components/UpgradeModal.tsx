
import React from 'react';
import { X, Check, Crown } from 'lucide-react';
import { PRICING_PLANS } from '../constants';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const proPlan = PRICING_PLANS.find(p => p.id === 'Pro');
  if (!proPlan) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all scale-100">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-levy-blue/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="w-12 h-12 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-xl flex items-center justify-center text-amber-900 shadow-lg mb-4">
            <Crown size={24} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold font-display">Upgrade to Pro</h2>
          <p className="text-slate-300 text-sm mt-1">Unlock the full power of LevyMate.</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
             <span className="text-4xl font-bold text-gray-900">₦{proPlan.price.toLocaleString()}</span>
             <span className="text-gray-500 font-medium"> / month</span>
          </div>

          <div className="space-y-3">
             {proPlan.features.map((feature, idx) => (
                 <div key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                    <div className="mt-0.5 bg-green-100 text-green-600 p-0.5 rounded-full">
                        <Check size={12} strokeWidth={3} />
                    </div>
                    {feature}
                 </div>
             ))}
          </div>

          <button 
            onClick={onConfirm}
            className="w-full py-3.5 bg-levy-blue text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all transform hover:scale-[1.02]"
          >
            Subscribe Now
          </button>
          
          <p className="text-center text-xs text-gray-400">
            Secure payment. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
