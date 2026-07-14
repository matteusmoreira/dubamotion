import React, { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";
import { useReducedGraphics } from '@/hooks/use-mobile';

// Helper for random colors
const randomColors = (count: number) => {
    return new Array(count)
        .fill(0)
        .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
};

interface TubesBackgroundProps {
    children?: React.ReactNode;
    className?: string;
    enableClickInteraction?: boolean;
}

interface TubesController {
    tubes: {
        setColors: (colors: string[]) => void;
        setLightsColors: (colors: string[]) => void;
    };
    destroy?: () => void;
    dispose?: () => void;
}

export function TubesBackground({
    children,
    className,
    enableClickInteraction = true
}: TubesBackgroundProps) {
    const reduceGraphics = useReducedGraphics();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const tubesRef = useRef<TubesController | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
        }, { rootMargin: '240px 0px', threshold: 0.01 });

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (reduceGraphics || !isVisible) return;

        let mounted = true;
        let cleanup: (() => void) | undefined;

        const initTubes = async () => {
            if (!canvasRef.current) return;

            try {
                // We use the specific build from the CDN as it contains the exact effect requested
                // Using native dynamic import which works in modern browsers
                // @ts-expect-error Runtime-only CDN module intentionally has no local type package.
                const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js') as {
                    default: (canvas: HTMLCanvasElement, options: object) => TubesController;
                };
                const TubesCursor = module.default;

                if (!mounted) return;

                const app = TubesCursor(canvasRef.current, {
                    tubes: {
                        colors: ["#f967fb", "#53bc28", "#6958d5"],
                        lights: {
                            intensity: 200,
                            colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"]
                        }
                    }
                });

                tubesRef.current = app;

                const handleResize = () => {
                    // The library likely handles resize internally or attaches to window
                };

                window.addEventListener('resize', handleResize);

                cleanup = () => {
                    window.removeEventListener('resize', handleResize);
                    if (typeof app.destroy === 'function') app.destroy();
                    else if (typeof app.dispose === 'function') app.dispose();
                    tubesRef.current = null;
                };

            } catch (error) {
                console.error("Failed to load TubesCursor:", error);
            }
        };

        initTubes();

        return () => {
            mounted = false;
            if (cleanup) cleanup();
        };
    }, [isVisible, reduceGraphics]);

    const handleClick = () => {
        if (reduceGraphics || !isVisible || !enableClickInteraction || !tubesRef.current) return;

        const colors = randomColors(3);
        const lightsColors = randomColors(4);

        tubesRef.current.tubes.setColors(colors);
        tubesRef.current.tubes.setLightsColors(lightsColors);
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full h-full min-h-[400px] overflow-hidden bg-background", className)}
            onClick={handleClick}
        >
            {(reduceGraphics || !isVisible) && <div className="mobile-neon-flow absolute inset-0" aria-hidden="true" />}
            {!reduceGraphics && isVisible && (
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 block h-full w-full"
                    style={{ touchAction: 'pan-y' }}
                    aria-hidden="true"
                />
            )}

            {/* Content Overlay */}
            <div className="relative z-10 w-full h-full pointer-events-none">
                {children}
            </div>
        </div>
    );
}

// Default export
export default TubesBackground;
