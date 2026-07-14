'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useId, useRef, useState } from 'react';

type InfiniteSliderProps = {
    children: React.ReactNode;
    gap?: number;
    duration?: number;
    durationOnHover?: number;
    direction?: 'horizontal' | 'vertical';
    reverse?: boolean;
    className?: string;
};

export function InfiniteSlider({
    children,
    gap = 16,
    duration = 25,
    durationOnHover,
    direction = 'horizontal',
    reverse = false,
    className,
}: InfiniteSliderProps) {
    const isHorizontal = direction === 'horizontal';
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    
    // Geramos um ID único estável usando useId do React para isolar os keyframes no CSS
    const rawId = useId();
    const uniqueId = `slider-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
        }, { rootMargin: '160px 0px', threshold: 0.01 });

        observer.observe(wrapper);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes scroll-${uniqueId} {
                    0% {
                        transform: ${isHorizontal ? 'translateX(0)' : 'translateY(0)'};
                    }
                    100% {
                        transform: ${isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)'};
                    }
                }
                @keyframes scroll-reverse-${uniqueId} {
                    0% {
                        transform: ${isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)'};
                    }
                    100% {
                        transform: ${isHorizontal ? 'translateX(0)' : 'translateY(0)'};
                    }
                }
                .${uniqueId}-container {
                    animation: ${reverse ? `scroll-reverse-${uniqueId}` : `scroll-${uniqueId}`} ${duration}s linear infinite;
                }
                
                /* Configuração de hover suave */
                ${durationOnHover ? `
                .${uniqueId}-wrap:hover .${uniqueId}-container {
                    animation-duration: ${durationOnHover}s;
                }
                ` : `
                /* Se não houver durationOnHover específica, pausamos a animação no hover para facilitar a visualização */
                .${uniqueId}-wrap:hover .${uniqueId}-container {
                    animation-play-state: paused;
                }
                `}
            `}} />
            <div 
                ref={wrapperRef}
                className={cn('overflow-hidden w-full select-none', `${uniqueId}-wrap`, className)}
            >
                <div
                    className={cn(
                        'flex w-max',
                        isHorizontal ? 'flex-row' : 'flex-col',
                        `${uniqueId}-container`
                    )}
                    style={{
                        gap: `${gap}px`,
                        animationPlayState: isVisible ? 'running' : 'paused',
                        willChange: isVisible ? 'transform' : 'auto',
                    }}
                >
                    {/* Renderizamos duas cópias idênticas para criar a transição infinita perfeita */}
                    <div className={cn('flex shrink-0 items-center justify-around', isHorizontal ? 'flex-row' : 'flex-col')} style={{ gap: `${gap}px` }}>
                        {children}
                    </div>
                    <div className={cn('flex shrink-0 items-center justify-around', isHorizontal ? 'flex-row' : 'flex-col')} style={{ gap: `${gap}px` }}>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}

