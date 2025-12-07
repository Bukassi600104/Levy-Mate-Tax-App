
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'white';
}

export const LogoIcon = ({ className = "w-8 h-8", white = false }: { className?: string, white?: boolean }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="shieldGradient" x1="15" y1="15" x2="85" y2="95" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#1D4ED8" />
        <stop offset="100%" stopColor="#0EA5E9" />
      </linearGradient>
    </defs>
    {/* Abstract Shield Shape with upward curve on left */}
    <path 
      d="M20 30C20 22 25 15 50 10C75 15 80 22 80 30V55C80 75 50 95 50 95C50 95 20 75 20 55V30Z" 
      fill={white ? "currentColor" : "url(#shieldGradient)"} 
    />
    {/* Embedded Checkmark in lower right */}
    <path 
      d="M48 72L34 58L40 52L48 60L68 40L74 46L48 72Z" 
      fill="white"
    />
  </svg>
);

const Logo: React.FC<LogoProps> = ({ className = "", variant = 'full' }) => {
  if (variant === 'icon') {
    return <LogoIcon className={className} />;
  }

  const isWhite = variant === 'white';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon className="w-9 h-9" white={isWhite} />
      <div className="flex items-baseline font-display font-bold text-2xl tracking-tight">
        <span className={isWhite ? 'text-white' : 'text-levy-blue'}>Levy</span>
        <span className={isWhite ? 'text-blue-200' : 'text-levy-mate'}>Mate</span>
      </div>
    </div>
  );
};

export default Logo;
