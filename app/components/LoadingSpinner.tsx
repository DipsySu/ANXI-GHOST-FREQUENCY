'use client';

import { cn } from '@/app/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className={cn('relative', sizeClasses[size])}>
      {/* Outer ring - Tang mirror pattern */}
      <div className="absolute inset-0 animate-rotate-slow">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Octagonal frame (Tang bronze mirror style) */}
          <polygon
            points="50,2 79,15 93,44 79,73 50,86 21,73 7,44 21,15"
            fill="none"
            stroke="#dc2626"
            strokeWidth="1"
            className="opacity-60"
          />
          {/* Circuit patterns on corners */}
          <circle cx="50" cy="2" r="2" fill="#22d3ee" className="animate-pulse" />
          <circle cx="79" cy="15" r="2" fill="#22d3ee" className="animate-pulse" style={{ animationDelay: '0.1s' }} />
          <circle cx="93" cy="44" r="2" fill="#22d3ee" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
          <circle cx="79" cy="73" r="2" fill="#22d3ee" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
          <circle cx="50" cy="86" r="2" fill="#22d3ee" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
          <circle cx="21" cy="73" r="2" fill="#22d3ee" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
          <circle cx="7" cy="44" r="2" fill="#22d3ee" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
          <circle cx="21" cy="15" r="2" fill="#22d3ee" className="animate-pulse" style={{ animationDelay: '0.7s' }} />
        </svg>
      </div>

      {/* Middle ring - Glitch scan line */}
      <div className="absolute inset-2 animate-rotate-reverse">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#22d3ee"
            strokeWidth="0.5"
            strokeDasharray="4 4"
            className="opacity-40"
          />
          {/* Glitch segments */}
          <path
            d="M 50 10 A 40 40 0 0 1 80 20"
            fill="none"
            stroke="#dc2626"
            strokeWidth="2"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Center - Character "安" with pulse */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Seal background */}
          <div
            className="w-10 h-10 rounded bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center animate-seal-pulse border border-red-950"
          >
            <span className="text-red-100 text-lg font-bold" style={{ fontFamily: 'serif' }}>
              安
            </span>
          </div>
          {/* Glitch artifacts */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-2 h-full bg-cyan-400/30 animate-glitch-1" />
            <div className="absolute top-0 right-0 w-1 h-full bg-red-400/20 animate-glitch-2" />
          </div>
        </div>
      </div>

      {/* Data streams */}
      <div className="absolute inset-0 animate-rotate-slow" style={{ animationDuration: '8s' }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-8 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent origin-left"
            style={{
              transform: `rotate(${angle}deg)`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" style={{ animationDuration: '2s' }} />
    </div>
  );
}

// Compact version for inline loading
export function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-cyan-400 animate-dot-flip"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
