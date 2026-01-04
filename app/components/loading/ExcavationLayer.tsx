'use client';

import React, { useRef, useEffect, useState } from 'react';
import { DaliYuanbao, DataChip, JadeFragment } from './Artifacts';

interface ExcavationLayerProps {
    onUnlock: () => void;
    width?: number;
    height?: number;
}

interface Artifact {
    id: number;
    type: 'coin' | 'chip' | 'jade';
    x: number;
    y: number;
    isCollected: boolean;
    isVisible: boolean; // Computed based on canvas transparency
}

export const ExcavationLayer: React.FC<ExcavationLayerProps> = ({ onUnlock }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [collectedCount, setCollectedCount] = useState(0);
    const [isFading, setIsFading] = useState(false);

    // Initialize artifacts on mount
    useEffect(() => {
        const newArtifacts: Artifact[] = [
            { id: 1, type: 'coin', x: 20 + Math.random() * 20, y: 20 + Math.random() * 20, isCollected: false, isVisible: false },
            { id: 2, type: 'chip', x: 60 + Math.random() * 20, y: 30 + Math.random() * 20, isCollected: false, isVisible: false },
            { id: 3, type: 'jade', x: 40 + Math.random() * 20, y: 60 + Math.random() * 20, isCollected: false, isVisible: false },
        ];
        setArtifacts(newArtifacts);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeValues = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Use logic to persist cleared areas if needed, but for now reset is acceptable on resize
            // Fill with "digital sand" / rubble
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add noise
            for (let i = 0; i < 5000; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const size = Math.random() * 3 + 1;
                ctx.fillStyle = Math.random() > 0.5 ? '#333' : '#000';
                ctx.fillRect(x, y, size, size);
            }

            ctx.font = '20px monospace';
            ctx.fillStyle = '#222';
            ctx.fillText('ANOMALY_DETECTED', canvas.width * 0.2, canvas.height * 0.3);
            ctx.fillText('SECTOR_7', canvas.width * 0.7, canvas.height * 0.8);
        };

        resizeValues();
        window.addEventListener('resize', resizeValues);
        return () => window.removeEventListener('resize', resizeValues);
    }, []);

    // Check if artifacts are revealed
    const checkArtifactVisibility = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        setArtifacts(prev => prev.map(art => {
            if (art.isCollected) return art;

            // Convert % coordinates to pixels
            const px = (art.x / 100) * width;
            const py = (art.y / 100) * height;

            // Check transparency at the center of the artifact
            const pixel = ctx.getImageData(px, py, 1, 1).data;
            // If alpha is low, it's revealed
            if (pixel[3] < 50) {
                return { ...art, isVisible: true };
            }
            return art;
        }));
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas || isFading) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 60, 0, Math.PI * 2);
        ctx.fill();

        // Throttle visibility checks
        if (Math.random() > 0.9) {
            checkArtifactVisibility(ctx, canvas.width, canvas.height);
        }
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Check if clicked ON an artifact that is VISIBLE, even if canvas is covering interactions
        // This logic relies on the React elements below receiving the click if canvas is clear,
        // BUT since canvas is on top, we handle clicks here and check collision with artifacts.

        // Convert artifact coords to pixels
        const width = canvas.width;
        const height = canvas.height;

        artifacts.forEach(art => {
            if (art.isCollected) return;

            const ax = (art.x / 100) * width;
            const ay = (art.y / 100) * height;

            // Simple distance check (assume artifact radius ~ 40px)
            const dist = Math.sqrt(Math.pow(clickX - ax, 2) + Math.pow(clickY - ay, 2));

            if (dist < 50 && art.isVisible) {
                collectArtifact(art.id);
            }
        });
    };

    const collectArtifact = (id: number) => {
        setArtifacts(prev => prev.map(a => a.id === id ? { ...a, isCollected: true } : a));

        const newCount = collectedCount + 1;
        setCollectedCount(newCount);

        if (newCount >= 3) {
            setTimeout(() => {
                setIsFading(true);
                onUnlock();
            }, 1000);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 transition-opacity duration-1000 ${isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

            {/* Artifact Layer (Underneath Canvas) */}
            <div className="absolute inset-0 z-0">
                {artifacts.map((art) => (
                    !art.isCollected && (
                        <div
                            key={art.id}
                            className={`absolute transition-all duration-500 ${art.isVisible ? 'opacity-100 scale-100 animate-pulse cursor-pointer' : 'opacity-20 scale-90 grayscale'}`}
                            style={{ top: `${art.y}%`, left: `${art.x}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            {art.type === 'coin' && <DaliYuanbao className={art.isVisible ? "drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" : ""} />}
                            {art.type === 'chip' && <DataChip className={art.isVisible ? "drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" : ""} />}
                            {art.type === 'jade' && <JadeFragment className={art.isVisible ? "drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]" : ""} />}
                        </div>
                    )
                ))}
            </div>

            {/* Canvas Layer */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-10 w-full h-full cursor-crosshair touch-none"
                onMouseMove={handleMouseMove}
                onTouchMove={handleMouseMove}
                onClick={handleCanvasClick}
            />

            {/* HUD Overlay */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-cyan-500 font-mono tracking-widest pointer-events-none select-none flex flex-col items-center gap-2 z-20">
                <div className="text-sm opacity-80">ARTIFACTS RECOVERED</div>
                <div className="flex gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-4 h-4 rounded-full border border-cyan-500 transition-all duration-500 ${i < collectedCount ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-transparent'}`}
                        />
                    ))}
                </div>
                <div className="text-xs mt-2 text-cyan-700/80">{collectedCount} / 3</div>
            </div>

            {/* Instructional Hint */}
            {collectedCount === 0 && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 text-white/30 font-mono text-sm pointer-events-none animate-pulse text-center">
                    [ SCANNING FOR RELICS... ]<br />
                    [ CLEAR RUBBLE TO COLLECT ]
                </div>
            )}
        </div>
    );
};
