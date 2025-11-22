import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, CreditCard as CardIcon, Check } from 'lucide-react';
import CreditCard from './CreditCard';
import Logo from './Logo';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  planPrice: number;
  planName: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess, planPrice, planName }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setCardDetails({ number: '', expiry: '', cvc: '', name: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment gateway delay
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  // Format card number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardDetails({ ...cardDetails, number: formatted });
  };

  // Format expiry date
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    let formatted = value;
    if (value.length >= 2) {
      formatted = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    setCardDetails({ ...cardDetails, expiry: formatted });
  };

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
                name={cardDetails.name || "YOUR NAME"} 
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
              <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                <span className="text-slate-400">Billing Cycle</span>
                <span className="font-bold">Monthly</span>
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

        {/* RIGHT SIDE: Payment Form */}
        <div className="w-full md:w-7/12 p-8 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h2>
            <p className="text-gray-500 text-sm">Complete your purchase to unlock Pro features.</p>
          </div>

          <form onSubmit={handlePayment} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Cardholder Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value.toUpperCase()})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all font-medium text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Card Number</label>
                <div className="relative">
                  <CardIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    required
                    placeholder="0000 0000 0000 0000"
                    value={cardDetails.number}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className="w-full pl-12 pr-4 p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all font-mono text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Expiry Date</label>
                  <input 
                    type="text" 
                    required
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={handleExpiryChange}
                    maxLength={5}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all font-mono text-center text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">CVC / CVV</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="password" 
                      required
                      placeholder="123"
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value.replace(/\D/g, '').substring(0, 4)})}
                      maxLength={4}
                      className="w-full pl-10 pr-4 p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-levy-blue/20 focus:border-levy-blue transition-all font-mono text-center text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing || !cardDetails.number || !cardDetails.cvc || !cardDetails.expiry || !cardDetails.name}
              className="w-full bg-levy-blue text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-800 hover:shadow-blue-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Pay ₦{planPrice.toLocaleString()}
                </>
              )}
            </button>
            
            <div className="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Mock Payment Logos */}
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                <div className="h-6 w-10 bg-gray-200 rounded"></div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
