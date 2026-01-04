'use client';

import React, { useState, useEffect } from 'react';
import { CyberBagua } from './CyberBagua';
import { ExcavationLayer } from './ExcavationLayer';

const SESSION_KEY = 'anxi_gatekeeper_unlocked';

export const Gatekeeper = ({ children }: { children: React.ReactNode }) => {
    const [isLocked, setIsLocked] = useState(true);
    const [showGame, setShowGame] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Check if user has already unlocked the site in this session
        const hasUnlocked = sessionStorage.getItem(SESSION_KEY);

        if (hasUnlocked) {
            setIsLocked(false);
            setShowGame(false);
        } else {
            setShowGame(true);
        }
    }, []);

    const handleUnlock = () => {
        sessionStorage.setItem(SESSION_KEY, 'true');
        // Start exit animation
        setTimeout(() => {
            setIsLocked(false);
        }, 1500); // Wait for canvas fade out
    };

    // Prevent hydration mismatch by returning null or a simple loader until client-side
    if (!isClient) return null;

    return (
        <>
            {children}

            {/* Loading Overlay */}
            {isLocked && (
                <div className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-1000 ${!showGame ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

                    {/* Center Visual */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
                        <CyberBagua />
                    </div>

                    {/* Interactive Layer */}
                    {showGame && (
                        <ExcavationLayer onUnlock={handleUnlock} />
                    )}
                </div>
            )}
        </>
    );
};
