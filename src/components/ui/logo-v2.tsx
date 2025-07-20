"use client";

import React from 'react';

interface LogoV2Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'dark';
  showText?: boolean;
}

const LogoV2: React.FC<LogoV2Props> = ({ 
  size = 'md', 
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

  return (
    <div className="flex items-center gap-3">
      {/* Molecular Structure + Muscle Logo */}
      <div className={`${sizeClasses[size]} relative`}>
        {/* Ultra-premium animated gradient background */}
        <div className="w-full h-full bg-gradient-to-br from-slate-950 via-blue-800 to-emerald-700 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden group border-2 border-blue-400/30 backdrop-blur-sm">
          
          {/* Multi-layer animated backgrounds */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-conic from-blue-400/10 via-emerald-400/10 to-blue-400/10 animate-spin" style={{animationDuration: '8s'}}></div>
          <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent animate-ping" style={{animationDuration: '4s'}}></div>
          
          {/* Hexagonal tech pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
              <pattern id="hexPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <polygon points="10,2 18,7 18,17 10,22 2,17 2,7" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#hexPattern)" className="text-blue-300"/>
            </svg>
          </div>
          
          {/* Ultra-sophisticated brain-muscle-AI fusion */}
          <div className="relative z-20 w-4/5 h-4/5 flex items-center justify-center">
            <svg 
              className="w-full h-full text-white group-hover:scale-105 transition-all duration-700 drop-shadow-lg" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 140 140"
              strokeWidth="1.5"
            >
              {/* Main brain structure with enhanced detail */}
              <path 
                d="M35 50 Q28 38 40 32 Q52 26 65 32 Q78 26 90 32 Q102 38 95 50 Q102 62 90 68 Q78 74 65 68 Q52 74 40 68 Q28 62 35 50Z" 
                fill="url(#premiumBrainGradient)" 
                stroke="url(#strokeGradient)"
                strokeWidth="2.5"
                opacity="0.95"
                filter="url(#glow)"
              />
              
              {/* Inner muscle fiber network */}
              <path 
                d="M45 45 Q55 38 65 42 Q75 38 85 45 Q80 52 70 55 Q65 58 60 55 Q50 52 45 45Z" 
                fill="url(#muscleFiberGradient)" 
                stroke="currentColor" 
                strokeWidth="1" 
                opacity="0.8"
              />
              
              {/* Secondary muscle definition */}
              <path 
                d="M48 48 Q58 44 68 48 Q75 52 68 56 Q58 60 48 56 Q42 52 48 48Z" 
                fill="none" 
                stroke="url(#accentGradient)" 
                strokeWidth="1.5" 
                opacity="0.6"
                strokeDasharray="3,2"
              >
                <animate attributeName="stroke-dashoffset" values="0;-10;0" dur="4s" repeatCount="indefinite"/>
              </path>
              
              {/* Premium neural network with varying sizes */}
              <circle cx="40" cy="42" r="4" fill="url(#nodeGradient1)" opacity="0.95" filter="url(#nodeglow)">
                <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="65" cy="35" r="5" fill="url(#nodeGradient2)" opacity="0.95" filter="url(#nodeglow)">
                <animate attributeName="r" values="4;6;4" dur="2.8s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="1;0.6;1" dur="2.2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="90" cy="42" r="4" fill="url(#nodeGradient1)" opacity="0.95" filter="url(#nodeglow)">
                <animate attributeName="r" values="3;5;3" dur="3.2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.7;1;0.7" dur="2.8s" repeatCount="indefinite"/>
              </circle>
              <circle cx="50" cy="60" r="4.5" fill="url(#nodeGradient3)" opacity="0.95" filter="url(#nodeglow)">
                <animate attributeName="r" values="3.5;5.5;3.5" dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="80" cy="60" r="4" fill="url(#nodeGradient2)" opacity="0.95" filter="url(#nodeglow)">
                <animate attributeName="r" values="3;5;3" dur="3.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.8;1;0.8" dur="2.7s" repeatCount="indefinite"/>
              </circle>
              <circle cx="65" cy="50" r="3" fill="url(#coreNodeGradient)" opacity="1" filter="url(#nodeglow)">
                <animate attributeName="r" values="2.5;4;2.5" dur="2s" repeatCount="indefinite"/>
              </circle>
              
              {/* Advanced neural pathways with flowing energy */}
              <path 
                d="M40 42 Q52 38 65 35 Q78 38 90 42" 
                fill="none" 
                stroke="url(#flowGradient1)" 
                strokeWidth="3" 
                opacity="0.8"
                strokeDasharray="6,3"
                filter="url(#pathglow)"
              >
                <animate attributeName="stroke-dashoffset" values="0;-18;0" dur="3s" repeatCount="indefinite"/>
              </path>
              <path 
                d="M50 60 Q58 55 65 50 Q72 55 80 60" 
                fill="none" 
                stroke="url(#flowGradient2)" 
                strokeWidth="3" 
                opacity="0.8"
                strokeDasharray="6,3"
                filter="url(#pathglow)"
              >
                <animate attributeName="stroke-dashoffset" values="-9;9;-9" dur="2.5s" repeatCount="indefinite"/>
              </path>
              <path 
                d="M40 42 Q48 51 50 60" 
                fill="none" 
                stroke="url(#flowGradient3)" 
                strokeWidth="2.5" 
                opacity="0.7"
                strokeDasharray="4,2"
              >
                <animate attributeName="stroke-dashoffset" values="0;-12;0" dur="3.5s" repeatCount="indefinite"/>
              </path>
              <path 
                d="M90 42 Q82 51 80 60" 
                fill="none" 
                stroke="url(#flowGradient3)" 
                strokeWidth="2.5" 
                opacity="0.7"
                strokeDasharray="4,2"
              >
                <animate attributeName="stroke-dashoffset" values="-6;6;-6" dur="3.5s" repeatCount="indefinite"/>
              </path>
              
              {/* Enhanced supplement molecules with 3D effect */}
              <g transform="translate(25,80)">
                <circle cx="0" cy="0" r="3.5" fill="url(#moleculeGradient1)" opacity="0.9" filter="url(#moleculeglow)"/>
                <circle cx="10" cy="5" r="2.5" fill="url(#moleculeGradient2)" opacity="0.9" filter="url(#moleculeglow)"/>
                <circle cx="5" cy="15" r="2.5" fill="url(#moleculeGradient3)" opacity="0.9" filter="url(#moleculeglow)"/>
                <circle cx="15" cy="12" r="2" fill="url(#moleculeGradient1)" opacity="0.8" filter="url(#moleculeglow)"/>
                <line x1="0" y1="0" x2="10" y2="5" stroke="url(#bondGradient)" strokeWidth="2" opacity="0.7"/>
                <line x1="10" y1="5" x2="5" y2="15" stroke="url(#bondGradient)" strokeWidth="2" opacity="0.7"/>
                <line x1="10" y1="5" x2="15" y2="12" stroke="url(#bondGradient)" strokeWidth="1.5" opacity="0.6"/>
              </g>
              
              <g transform="translate(95,85)">
                <circle cx="0" cy="0" r="3.5" fill="url(#moleculeGradient2)" opacity="0.9" filter="url(#moleculeglow)"/>
                <circle cx="-8" cy="6" r="2.5" fill="url(#moleculeGradient3)" opacity="0.9" filter="url(#moleculeglow)"/>
                <circle cx="8" cy="8" r="2.5" fill="url(#moleculeGradient1)" opacity="0.9" filter="url(#moleculeglow)"/>
                <circle cx="0" cy="12" r="2" fill="url(#moleculeGradient2)" opacity="0.8" filter="url(#moleculeglow)"/>
                <line x1="0" y1="0" x2="-8" y2="6" stroke="url(#bondGradient)" strokeWidth="2" opacity="0.7"/>
                <line x1="0" y1="0" x2="8" y2="8" stroke="url(#bondGradient)" strokeWidth="2" opacity="0.7"/>
                <line x1="0" y1="0" x2="0" y2="12" stroke="url(#bondGradient)" strokeWidth="1.5" opacity="0.6"/>
              </g>
              
              {/* Ultra-premium gradient and filter definitions */}
              <defs>
                {/* Main brain gradient with depth */}
                <linearGradient id="premiumBrainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.9"/>
                  <stop offset="30%" stopColor="#3B82F6" stopOpacity="0.95"/>
                  <stop offset="70%" stopColor="#0D9488" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.85"/>
                </linearGradient>
                
                {/* Stroke gradient for definition */}
                <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8"/>
                  <stop offset="50%" stopColor="#34D399" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8"/>
                </linearGradient>
                
                {/* Muscle fiber gradient */}
                <radialGradient id="muscleFiberGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3"/>
                  <stop offset="70%" stopColor="#3B82F6" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.8"/>
                </radialGradient>
                
                {/* Accent gradient for details */}
                <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.7"/>
                  <stop offset="50%" stopColor="#60A5FA" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.7"/>
                </linearGradient>
                
                {/* Neural node gradients */}
                <radialGradient id="nodeGradient1" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#DBEAFE" stopOpacity="1"/>
                  <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.8"/>
                </radialGradient>
                <radialGradient id="nodeGradient2" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#D1FAE5" stopOpacity="1"/>
                  <stop offset="50%" stopColor="#34D399" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.8"/>
                </radialGradient>
                <radialGradient id="nodeGradient3" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#EDE9FE" stopOpacity="1"/>
                  <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.8"/>
                </radialGradient>
                <radialGradient id="coreNodeGradient" cx="20%" cy="20%" r="80%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1"/>
                  <stop offset="40%" stopColor="#F0F9FF" stopOpacity="0.95"/>
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.9"/>
                </radialGradient>
                
                {/* Flow gradients for neural pathways */}
                <linearGradient id="flowGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4"/>
                  <stop offset="50%" stopColor="#60A5FA" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.4"/>
                </linearGradient>
                <linearGradient id="flowGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.4"/>
                  <stop offset="50%" stopColor="#34D399" stopOpacity="1"/>
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.4"/>
                </linearGradient>
                <linearGradient id="flowGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.6"/>
                  <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.6"/>
                </linearGradient>
                
                {/* Molecule gradients */}
                <radialGradient id="moleculeGradient1" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#F0FDF4" stopOpacity="1"/>
                  <stop offset="60%" stopColor="#22C55E" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#15803D" stopOpacity="0.8"/>
                </radialGradient>
                <radialGradient id="moleculeGradient2" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#EFF6FF" stopOpacity="1"/>
                  <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.8"/>
                </radialGradient>
                <radialGradient id="moleculeGradient3" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#F5F3FF" stopOpacity="1"/>
                  <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.8"/>
                </radialGradient>
                
                {/* Bond gradient */}
                <linearGradient id="bondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8"/>
                  <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.9"/>
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.8"/>
                </linearGradient>
                
                {/* Glow filters */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="nodeglow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="pathglow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="moleculeglow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
            </svg>
          </div>

          {/* Ultra-premium glowing border effects */}
          <div className="absolute inset-0 rounded-3xl border-2 border-blue-400/50 group-hover:border-emerald-400/80 transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-emerald-400/30"></div>
          
          {/* Premium corner accent lights with pulse */}
          <div className="absolute top-2 left-2 w-3 h-3 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full opacity-70 group-hover:opacity-100 transition-all duration-500 animate-pulse" style={{animationDuration: '2s'}}></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 bg-gradient-to-br from-emerald-300 to-emerald-500 rounded-full opacity-70 group-hover:opacity-100 transition-all duration-500 animate-pulse" style={{animationDuration: '2.5s'}}></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full opacity-60 group-hover:opacity-90 transition-all duration-500 animate-pulse" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-gradient-to-br from-cyan-300 to-cyan-500 rounded-full opacity-60 group-hover:opacity-90 transition-all duration-500 animate-pulse" style={{animationDuration: '2.8s'}}></div>
        </div>
      </div>
      
      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className={`${textSizeClasses[size]} font-black tracking-tight leading-none relative`}>
            <span className="relative">
              <span className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent blur-sm opacity-50"></span>
              <span className="relative bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">NUTRI</span>
            </span>
            <span className="relative ml-1">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent blur-sm opacity-50"></span>
              <span className="relative bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent drop-shadow-sm">WISE</span>
            </span>
          </div>
          <div className="flex items-center justify-start mt-1">
            <span className="relative">
              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent blur-sm opacity-40"></span>
              <span className="relative text-xs font-bold tracking-[0.25em] uppercase bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 bg-clip-text text-transparent">AI</span>
            </span>
            <div className="mx-2 w-1 h-1 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full animate-pulse"></div>
            <span className="relative">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent blur-sm opacity-40"></span>
              <span className="relative text-xs font-bold tracking-[0.25em] uppercase bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">ELITE</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoV2;
