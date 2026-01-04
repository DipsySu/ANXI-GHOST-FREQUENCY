
import React from 'react';

const TRIGRAMS = [
    ['111', '乾 (Qián)'], // Sky
    ['011', '兑 (Duì)'],  // Lake
    ['101', '离 (Lí)'],   // Fire
    ['001', '震 (Zhèn)'], // Thunder
    ['110', '巽 (Xùn)'],  // Wind
    ['010', '坎 (Kǎn)'],  // Water
    ['100', '艮 (Gèn)'],  // Mountain
    ['000', '坤 (Kūn)'],  // Earth
];

export const CyberBagua = () => {
    return (
        <div className="relative flex items-center justify-center w-96 h-96 group">
            {/* Outer Glow Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] animate-[spin_10s_linear_infinite]" />

            {/* Inner Ring with Trigrams */}
            <div className="absolute inset-4 rounded-full border border-fuchsia-500/20 animate-[spin_20s_linear_infinite_reverse]">
                {TRIGRAMS.map((tri, i) => {
                    const angle = (i * 360) / 8;
                    return (
                        <div
                            key={i}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-12 pt-2 origin-center"
                            style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
                        >
                            <div className="flex flex-col gap-1 items-center">
                                {/* Trigram Lines */}
                                {tri[0].split('').map((bit, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-full h-1.5 ${bit === '1' ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'flex justify-between'}`}
                                    >
                                        {bit === '0' && (
                                            <>
                                                <div className="w-[45%] h-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]" />
                                                <div className="w-[45%] h-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)]" />
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Yin Yang Core (Cyber Style) */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-black border-2 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.5)] animate-pulse">
                <div className="absolute top-0 left-1/2 w-16 h-32 bg-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-black border border-cyan-500" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white border border-fuchsia-500" />

                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_10px_white]" />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black shadow-[0_0_10px_cyan]" />
            </div>

            {/* Glitch Overlay Text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50 mix-blend-overlay">
                <span className="text-4xl font-mono text-cyan-500 animate-pulse tracking-widest hidden group-hover:block">
                    LOADING
                </span>
            </div>
        </div>
    );
};
