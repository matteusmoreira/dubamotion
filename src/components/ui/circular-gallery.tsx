import React, { useState, useEffect, useRef, type HTMLAttributes } from 'react';
import { useNavigate } from 'react-router-dom';

// A simple utility for conditional class names
const cn = (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ');
}

// Define the type for a single gallery item
export interface GalleryItem {
    id?: string;
    common: string;
    binomial: string;
    photo: {
        url: string;
        text: string;
        pos?: string;
        by: string;
    };
}

// Define the props for the CircularGallery component
interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
    items: GalleryItem[];
    /** Controls how far the items are from the center. */
    radius?: number;
    /** Controls the speed of auto-rotation when not scrolling. */
    autoRotateSpeed?: number;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
    ({ items, className, radius = 600, autoRotateSpeed = 0.02, ...props }, ref) => {
        const [rotation, setRotation] = useState(0);
        const [isScrolling, setIsScrolling] = useState(false);
        const [isVisible, setIsVisible] = useState(false);
        const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
        const animationFrameRef = useRef<number | null>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        const navigate = useNavigate();

        // IntersectionObserver to pause animation when not visible
        useEffect(() => {
            const observer = new IntersectionObserver(
                ([entry]) => setIsVisible(entry.isIntersecting),
                { threshold: 0.1 }
            );

            if (containerRef.current) {
                observer.observe(containerRef.current);
            }

            return () => observer.disconnect();
        }, []);

        // Effect to handle scroll-based rotation
        useEffect(() => {
            const handleScroll = () => {
                setIsScrolling(true);
                if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                }

                const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollProgress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
                const scrollRotation = scrollProgress * 360;
                setRotation(scrollRotation);

                scrollTimeoutRef.current = setTimeout(() => {
                    setIsScrolling(false);
                }, 150);
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            return () => {
                window.removeEventListener('scroll', handleScroll);
                if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                }
            };
        }, []);

        // Effect for auto-rotation when not scrolling AND visible
        useEffect(() => {
            if (!isVisible) return;

            const autoRotate = () => {
                if (!isScrolling) {
                    setRotation(prev => prev + autoRotateSpeed);
                }
                animationFrameRef.current = requestAnimationFrame(autoRotate);
            };

            animationFrameRef.current = requestAnimationFrame(autoRotate);

            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }, [isScrolling, isVisible, autoRotateSpeed]);

        const anglePerItem = 360 / items.length;

        const handleItemClick = (id?: string) => {
            if (id) {
                navigate(`/project/${id}`);
            }
        };

        return (
            <div
                ref={(node) => {
                    // Combine forwardRef with containerRef
                    containerRef.current = node;
                    if (typeof ref === 'function') ref(node);
                    else if (ref) ref.current = node;
                }}
                role="region"
                aria-label="Circular 3D Gallery"
                className={cn("relative w-full h-full flex items-center justify-center", className)}
                style={{ perspective: '2000px' }}
                {...props}
            >
                <div
                    className="relative w-full h-full"
                    style={{
                        transform: `rotateY(${rotation}deg)`,
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {items.map((item, i) => {
                        const itemAngle = i * anglePerItem;
                        const totalRotation = rotation % 360;
                        const relativeAngle = (itemAngle + totalRotation + 360) % 360;
                        const normalizedAngle = Math.abs(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle);
                        const opacity = Math.max(0.3, 1 - (normalizedAngle / 180));
                        // Determine z-index based on opacity/angle to ensure front items are clickable
                        const zIndex = Math.round(opacity * 100);

                        return (
                            <div
                                key={item.photo.url}
                                role="button"
                                tabIndex={0}
                                aria-label={`View project ${item.common}`}
                                onClick={() => handleItemClick(item.id)}
                                onKeyDown={(e) => e.key === 'Enter' && handleItemClick(item.id)}
                                className="absolute w-[300px] h-[400px] cursor-pointer"
                                style={{
                                    transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                                    left: '50%',
                                    top: '50%',
                                    marginLeft: '-150px',
                                    marginTop: '-200px',
                                    opacity: opacity,
                                    zIndex: zIndex,
                                    transition: 'opacity 0.3s linear',
                                    pointerEvents: opacity < 0.5 ? 'none' : 'auto' // Disable clicks on back items
                                }}
                            >
                                <div className="relative w-full h-full rounded-lg shadow-2xl overflow-hidden group border border-border bg-card/70 dark:bg-card/30 backdrop-blur-lg transform transition-transform duration-300 hover:scale-105 hover:border-[#00FF88]/50">
                                    <img
                                        src={item.photo.url}
                                        alt={item.photo.text}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        style={{ objectPosition: item.photo.pos || 'center' }}
                                    />
                                    {/* Replaced text-primary-foreground with text-white for consistent color */}
                                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                                        <h2 className="text-xl font-bold group-hover:text-[#00FF88] transition-colors">{item.common}</h2>
                                        <em className="text-sm italic opacity-80">{item.binomial}</em>
                                        <p className="text-xs mt-2 opacity-70">Photo by: {item.photo.by}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
