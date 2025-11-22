import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CreditCard as CardIcon } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import CreditCard from './CreditCard';
import Logo from './Logo';
import { PRO_PRICE_MONTHLY, PRO_PRICE_YEARLY } from '../constants';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (plan: 'Monthly' | 'Yearly') => void;
  planName: string;
  email: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess, planName, email }) => {
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
  
  const planPrice = billingCycle === 'Monthly' ? PRO_PRICE_MONTHLY : PRO_PRICE_YEARLY;
  const yearlyDiscount = Math.round(((PRO_PRICE_MONTHLY * 12) - PRO_PRICE_YEARLY) / (PRO_PRICE_MONTHLY * 12) * 100);

  // Paystack Configuration
  const config = {
    reference: (new Date()).getTime().toString(),
    email: email,
    amount: planPrice * 100, // Amount is in kobo
    publicKey: 'pk_live_7dd455a1cdfca998d8708e1ed0c1ce8b32409680',
    plan: billingCycle === 'Monthly' ? 'PLN_6yev8be7l6wtw4u' : 'PLN_co22o7xiaq48wmq',
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccessPayment = () => {
    onSuccess(billingCycle);
  };

  const onClosePayment = () => {
    // User closed the popup
    console.log('Payment closed');
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setBillingCycle('Monthly');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        
        {/* LEFT SIDE: Order Summary */}
        <div className="w-full md:w-5/12 bg-slate-900 p-8 text-white relative overflow-hidden flex flex-col">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-levy-mate/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <Logo variant="icon" className="w-8 h-8" />
              <span className="font-display font-bold text-xl tracking-tight">Checkout</span>
            </div>

            <div className="mb-8 transform scale-90 origin-left">
              <CreditCard 
                name={email.split('@')[0].toUpperCase() || "YOUR NAME"} 
                amount={`₦${planPrice.toLocaleString()}`} 
                label={planName} 
                variant="dark" 
              />
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                <span className="text-slate-400">Plan</span>
                <span className="font-bold">{planName} Subscription</span>
              </div>
              
              {/* Billing Cycle Toggle */}
              <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                <span className="text-slate-400">Billing Cycle</span>
                <div className="flex bg-slate-800 rounded-lg p-1">
                    <button 
                        type="button"
                        onClick={() => setBillingCycle('Monthly')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${billingCycle === 'Monthly' ? 'bg-levy-blue text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                        Monthly
                    </button>
                    <button 
                        type="button"
                        onClick={() => setBillingCycle('Yearly')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${billingCycle === 'Yearly' ? 'bg-levy-blue text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                        Yearly <span className="bg-green-500 text-white text-[9px] px-1 rounded">-{yearlyDiscount}%</span>
                    </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-lg">
                <span className="text-slate-300">Total due today</span>
                <span className="font-bold text-levy-mate">₦{planPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-auto text-xs text-slate-500 flex items-center gap-2">
              <ShieldCheck size={14} className="text-green-500" />
              <span>Secure 256-bit SSL Encrypted payment</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Payment Action */}
        <div className="w-full md:w-7/12 p-8 relative flex flex-col justify-center">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Purchase</h2>
            <p className="text-gray-500 text-sm">You will be redirected to Paystack to complete your payment securely.</p>
          </div>

          <div className="space-y-6 max-w-sm mx-auto w-full">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-900">{email}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-bold text-levy-blue">₦{planPrice.toLocaleString()}</span>
                </div>
            </div>

            <button 
              onClick={() => {
                  initializePayment({onSuccess: onSuccessPayment, onClose: onClosePayment});
              }}
              className="w-full bg-levy-blue text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-800 hover:shadow-blue-900/30 transition-all flex items-center justify-center gap-2"
            >
              <CardIcon size={20} />
              Pay with Paystack
            </button>
            
            <div className="flex justify-center items-center gap-2 opacity-60">
                <span className="text-xs text-gray-400">Secured by</span>
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Paystack_Logo.png" alt="Paystack" className="h-4 grayscale hover:grayscale-0 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
