"use client";

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'dark';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'default', 
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const textColorClasses = {
    default: 'text-foreground',
    white: 'text-white',
    dark: 'text-slate-900'
  };

  return (
    <div className="flex items-center gap-3">
      {/* Creative Fitness + AI Logo */}
      <div className={`${sizeClasses[size]} relative`}>
        {/* Main container with gradient background */}
        <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
          
          {/* Background geometric pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="hexPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <polygon points="10,2 18,7 18,13 10,18 2,13 2,7" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#hexPattern)" />
            </svg>
          </div>

          {/* Central icon combining dumbbell + brain/neural network */}
          <div className="relative z-10 w-3/4 h-3/4 flex items-center justify-center">
            <svg 
              className="w-full h-full text-white" 
              fill="currentColor" 
              viewBox="0 0 100 100"
            >
              {/* Dumbbell base */}
              <rect x="15" y="42" width="70" height="16" rx="8" fill="currentColor"/>
              
              {/* Left weight */}
              <rect x="8" y="35" width="14" height="30" rx="7" fill="currentColor"/>
              <rect x="5" y="38" width="8" height="24" rx="4" fill="currentColor"/>
              
              {/* Right weight */}
              <rect x="78" y="35" width="14" height="30" rx="7" fill="currentColor"/>
              <rect x="87" y="38" width="8" height="24" rx="4" fill="currentColor"/>
              
              {/* Neural network nodes overlaid */}
              <circle cx="25" cy="25" r="3" fill="currentColor" opacity="0.8"/>
              <circle cx="40" cy="20" r="2.5" fill="currentColor" opacity="0.8"/>
              <circle cx="60" cy="20" r="2.5" fill="currentColor" opacity="0.8"/>
              <circle cx="75" cy="25" r="3" fill="currentColor" opacity="0.8"/>
              
              <circle cx="30" cy="75" r="3" fill="currentColor" opacity="0.8"/>
              <circle cx="50" cy="80" r="2.5" fill="currentColor" opacity="0.8"/>
              <circle cx="70" cy="75" r="3" fill="currentColor" opacity="0.8"/>
              
              {/* Neural network connections */}
              <line x1="25" y1="25" x2="40" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
              <line x1="40" y1="20" x2="60" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
              <line x1="60" y1="20" x2="75" y2="25" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
              
              <line x1="25" y1="25" x2="30" y2="75" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
              <line x1="40" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
              <line x1="60" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
              <line x1="75" y1="25" x2="70" y2="75" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
              
              <line x1="30" y1="75" x2="50" y2="80" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
              <line x1="50" y1="80" x2="70" y2="75" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
            </svg>
          </div>

          {/* Subtle shine effect */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-t-xl"></div>
        </div>
      </div>
      
      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className={`${textSizeClasses[size]} font-black tracking-tight leading-none`}>
            <span className={textColorClasses[variant]}>NUTRI</span>
            <span className="text-blue-500">WISE</span>
          </div>
          <div className={`text-xs font-bold tracking-wider uppercase ${variant === 'white' ? 'text-blue-200' : 'text-emerald-500'} mt-0.5`}>
            AI ELITE
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
