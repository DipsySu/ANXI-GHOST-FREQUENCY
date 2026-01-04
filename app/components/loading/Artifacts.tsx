import React from 'react';

export const DaliYuanbao = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={`w-16 h-16 ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Coin Body */}
        <circle cx="50" cy="50" r="45" className="fill-yellow-600/80 stroke-yellow-500 stroke-2" />
        <circle cx="50" cy="50" r="35" className="stroke-yellow-700/50 stroke-1" />
        {/* Square Hole */}
        <rect x="35" y="35" width="30" height="30" className="fill-black/80 stroke-yellow-500" />
        {/* Inscriptions (Stylized) */}
        <path d="M50 10 V30 M50 70 V90 M20 50 H30 M70 50 H80" className="stroke-yellow-400 stroke-2 cap-round" />
        <text x="50" y="25" textAnchor="middle" className="fill-yellow-300 text-[10px] font-serif">大</text>
        <text x="50" y="85" textAnchor="middle" className="fill-yellow-300 text-[10px] font-serif">历</text>
        <text x="20" y="55" textAnchor="middle" className="fill-yellow-300 text-[10px] font-serif">元</text>
        <text x="80" y="55" textAnchor="middle" className="fill-yellow-300 text-[10px] font-serif">宝</text>
    </svg>
);

export const DataChip = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={`w-16 h-16 ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Chip Base */}
        <rect x="20" y="20" width="60" height="60" rx="4" className="fill-cyan-900/80 stroke-cyan-500 stroke-1" />
        {/* Circuit Traces */}
        <path d="M30 20 V10 M40 20 V10 M50 20 V10 M60 20 V10 M70 20 V10" className="stroke-cyan-400 stroke-1" />
        <path d="M30 80 V90 M40 80 V90 M50 80 V90 M60 80 V90 M70 80 V90" className="stroke-cyan-400 stroke-1" />
        <path d="M20 30 H10 M20 40 H10 M20 50 H10 M20 60 H10 M20 70 H10" className="stroke-cyan-400 stroke-1" />
        <path d="M80 30 H90 M80 40 H90 M80 50 H90 M80 60 H90 M80 70 H90" className="stroke-cyan-400 stroke-1" />
        {/* Glow Center */}
        <rect x="35" y="35" width="30" height="30" className="fill-cyan-400/20 stroke-cyan-300 animate-pulse" />
    </svg>
);

export const JadeFragment = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={`w-16 h-16 ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Broken Shape */}
        <path d="M20 20 L50 10 L80 30 L70 70 L40 80 L10 50 Z" className="fill-emerald-800/80 stroke-emerald-500 stroke-1" />
        {/* Cracks */}
        <path d="M30 30 L50 50 L40 70" className="stroke-emerald-300/50 stroke-1" />
        {/* Glyph */}
        <text x="50" y="55" textAnchor="middle" className="fill-emerald-300 text-lg font-serif opacity-80">👻</text>
    </svg>
);
