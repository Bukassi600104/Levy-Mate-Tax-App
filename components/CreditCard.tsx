
import React from 'react';
import Logo from './Logo';
import { Wifi } from 'lucide-react';

interface CreditCardProps {
  name: string;
  amount: string;
  label: string;
  variant?: 'blue' | 'dark';
}

const CreditCard: React.FC<CreditCardProps> = ({ name, amount, label, variant = 'blue' }) => {
  const bgClass = variant === 'blue' 
    ? 'bg-gradient-to-br from-levy-blue to-[#1e3a8a]' 
    : 'bg-gradient-to-br from-slate-800 to-slate-950';

  return (
    <div className={`relative w-full aspect-[1.586] rounded-2xl ${bgClass} p-6 text-white shadow-2xl overflow-hidden transition-transform duration-500 hover:scale-[1.02] group border-t border-white/10`}>
      
      {/* Background Texture/Noise */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-levy-mate/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Row */}
        <div className="flex justify-between items-start">
           <div className="flex items-center gap-4">
               {/* Chip */}
               <div className="w-12 h-9 bg-yellow-200 rounded-md flex items-center justify-center overflow-hidden relative border border-yellow-300 shadow-[inset_0_1px_4px_rgba(0,0,0,0.2)] bg-gradient-to-br from-yellow-100 to-yellow-300">
                  <div className="absolute w-full h-[1px] bg-yellow-600/40 top-1/3"></div>
                  <div className="absolute w-full h-[1px] bg-yellow-600/40 bottom-1/3"></div>
                  <div className="absolute h-full w-[1px] bg-yellow-600/40 left-1/3"></div>
                  <div className="absolute h-full w-[1px] bg-yellow-600/40 right-1/3"></div>
                  <div className="w-2 h-2 border border-yellow-600/40 rounded-sm"></div>
               </div>
               <Wifi className="rotate-90 text-white/50" size={20} />
           </div>
           <Logo variant="white" className="scale-75 origin-top-right opacity-90" />
        </div>
        
        {/* Middle Row: Amount */}
        <div className="space-y-1 my-4">
          <div className="text-[10px] text-blue-200 uppercase tracking-widest font-mono opacity-80">Est. Tax Liability</div>
          <div className="text-2xl lg:text-3xl font-mono font-bold tracking-widest text-white drop-shadow-md">
            {amount}
          </div>
        </div>

        {/* Bottom Row: Info */}
        <div className="flex justify-between items-end font-mono">
          <div>
            <div className="text-[9px] text-blue-200 uppercase mb-0.5 opacity-70">Taxpayer</div>
            <div className="text-sm lg:text-base font-bold tracking-wider uppercase truncate max-w-[180px] lg:max-w-[220px]">
              {name || 'VALUED USER'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-blue-200 uppercase mb-0.5 opacity-70">Status</div>
            <div className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded backdrop-blur-md">
                {label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCard;
