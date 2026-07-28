import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import Header from '../sections/Header';
import Hero from '../sections/Hero';
import ShowreelModal from '../sections/ShowreelModal';
import About from '../sections/About';
import Team from '../sections/Team';
import Thanks from '../sections/Thanks';
import Projects from '../sections/Projects';
import Services from '../sections/Services';
import Clients from '../sections/Clients';
import Footer from '../sections/Footer';

const sectionIds = ['hero', 'about', 'team', 'thanks', 'work', 'services', 'clients', 'contact'] as const;

const sectionMap: Record<(typeof sectionIds)[number], string> = {
    hero: 'work',
    about: 'about',
    team: 'about',
    thanks: 'about',
    work: 'work',
    services: 'services',
    clients: 'clients',
    contact: 'contact',
};

const ScrollDrivenIntro = ({ onShowreelClick }: { onShowreelClick: () => void }) => {
    const [currentSection, setCurrentSection] = useState('work');
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        let frameId: number | null = null;
        let heroStart = 0;
        let heroScrollableDistance = 1;
        let sectionBounds: Array<{ id: (typeof sectionIds)[number]; start: number; end: number }> = [];
        let lastSection = 'work';

        const elements = sectionIds
            .map((id) => ({ id, element: document.getElementById(id) }))
            .filter((item): item is { id: (typeof sectionIds)[number]; element: HTMLElement } => Boolean(item.element));

        const measureLayout = () => {
            const hero = document.getElementById('hero');
            if (hero) {
                heroStart = hero.offsetTop;
                heroScrollableDistance = Math.max(hero.offsetHeight - window.innerHeight, 1);
            }

            sectionBounds = elements.map(({ id, element }) => ({
                id,
                start: element.offsetTop,
                end: element.offsetTop + element.offsetHeight,
            }));
        };

        const updateScrollState = () => {
            const scrollY = window.scrollY;
            const rawProgress = Math.min(Math.max((scrollY - heroStart) / heroScrollableDistance, 0), 1);
            const progress = Math.round(rawProgress * 1000) / 1000;
            setScrollProgress((current) => current === progress ? current : progress);

            const scrollPosition = scrollY + window.innerHeight / 3;
            const activeSection = sectionBounds.find(({ start, end }) => (
                scrollPosition >= start && scrollPosition < end
            ));

            if (activeSection) {
                const mapped = sectionMap[activeSection.id];
                if (mapped !== lastSection) {
                    lastSection = mapped;
                    setCurrentSection(mapped);
                }
            }

            frameId = null;
        };

        const scheduleUpdate = () => {
            if (frameId === null) {
                frameId = window.requestAnimationFrame(updateScrollState);
            }
        };

        const resizeObserver = new ResizeObserver(() => {
            measureLayout();
            scheduleUpdate();
        });

        elements.forEach(({ element }) => resizeObserver.observe(element));
        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate, { passive: true });
        measureLayout();
        scheduleUpdate();

        return () => {
            window.removeEventListener('scroll', scheduleUpdate);
            window.removeEventListener('resize', scheduleUpdate);
            resizeObserver.disconnect();
            if (frameId !== null) window.cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <>
            <Header currentSection={currentSection} scrollProgress={scrollProgress} />
            <Hero onShowreelClick={onShowreelClick} scrollProgress={scrollProgress} />
        </>
    );
};

function Home() {
    const [showreelOpen, setShowreelOpen] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [carouselHeight, setCarouselHeight] = useState<number | null>(null);
    const [isHorizontalCarousel, setIsHorizontalCarousel] = useState(() => window.innerWidth >= 1024);
    const carouselSlideRefs = useRef<Array<HTMLDivElement | null>>([]);

    // Initialize Lenis smooth scroll
    useEffect(() => {
        const desktopPointer = window.matchMedia(
            '(min-width: 769px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
        );
        let lenis: Lenis | null = null;
        let rafId: number | null = null;

        const stop = () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            rafId = null;
            lenis?.destroy();
            lenis = null;
        };

        const start = () => {
            if (lenis) return;

            lenis = new Lenis({
                duration: 0.85,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1.0,
                infinite: false,
            });

            const raf = (time: number) => {
                lenis?.raf(time);
                rafId = requestAnimationFrame(raf);
            };

            rafId = requestAnimationFrame(raf);
        };

        const sync = () => desktopPointer.matches ? start() : stop();
        desktopPointer.addEventListener('change', sync);
        sync();

        return () => {
            desktopPointer.removeEventListener('change', sync);
            stop();
        };
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showreelOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showreelOpen]);

    useEffect(() => {
        const updateCarouselHeight = () => {
            const horizontalCarousel = window.innerWidth >= 1024;
            setIsHorizontalCarousel(horizontalCarousel);

            if (!horizontalCarousel) {
                setCarouselHeight(null);
                return;
            }

            const activeSlide = carouselSlideRefs.current[carouselIndex];
            setCarouselHeight(activeSlide?.offsetHeight ?? null);
        };

        updateCarouselHeight();

        const resizeObserver = new ResizeObserver(() => {
            updateCarouselHeight();
        });

        carouselSlideRefs.current.forEach((slide) => {
            if (slide) {
                resizeObserver.observe(slide);
            }
        });

        window.addEventListener('resize', updateCarouselHeight);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateCarouselHeight);
        };
    }, [carouselIndex]);

    return (
        <div className="relative bg-black min-h-screen">
            {/* Main Content */}
            <main>
                <ScrollDrivenIntro onShowreelClick={() => setShowreelOpen(true)} />

                {/* Carousel for About, Team, Thanks on lg screens */}
                <div 
                    className="relative w-full overflow-hidden bg-black"
                    style={{
                        '--carousel-index': carouselIndex,
                        minHeight: carouselHeight ? `${carouselHeight}px` : undefined,
                    } as React.CSSProperties}
                >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:w-[300%] transition-transform duration-1000 ease-in-out lg:[transform:translateX(calc(-33.333333%*var(--carousel-index)))]">
                        <div
                            ref={(node) => {
                                carouselSlideRefs.current[0] = node;
                            }}
                            className="w-full lg:w-1/3 shrink-0"
                        >
                            <About animateBackground={!isHorizontalCarousel || carouselIndex === 0} onNext={() => {
                                if (isHorizontalCarousel) setCarouselIndex(1);
                                else document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
                            }} />
                        </div>
                        <div
                            ref={(node) => {
                                carouselSlideRefs.current[1] = node;
                            }}
                            className="w-full lg:w-1/3 shrink-0"
                        >
                            <Team 
                                animateBackground={!isHorizontalCarousel || carouselIndex === 1}
                                onNext={() => {
                                    if (isHorizontalCarousel) setCarouselIndex(2);
                                    else document.getElementById('thanks')?.scrollIntoView({ behavior: 'smooth' });
                                }} 
                                onPrev={() => {
                                    if (isHorizontalCarousel) setCarouselIndex(0);
                                    else document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                                }} 
                            />
                        </div>
                        <div
                            ref={(node) => {
                                carouselSlideRefs.current[2] = node;
                            }}
                            className="w-full lg:w-1/3 shrink-0"
                        >
                            <Thanks animateBackground={!isHorizontalCarousel || carouselIndex === 2} onPrev={() => {
                                if (isHorizontalCarousel) setCarouselIndex(1);
                                else document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
                            }} />
                        </div>
                    </div>
                </div>

                {/* Projects Section */}
                <Projects />

                {/* Services Section */}
                <Services />

                {/* Clients Section */}
                <Clients />

                {/* Footer */}
                <Footer />
            </main>

            {/* Showreel Modal */}
            <ShowreelModal isOpen={showreelOpen} onClose={() => setShowreelOpen(false)} />
        </div>
    );
}

export default Home;
