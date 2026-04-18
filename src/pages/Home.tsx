import { useState, useEffect } from 'react';
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

function Home() {
    const [showreelOpen, setShowreelOpen] = useState(false);
    const [currentSection, setCurrentSection] = useState('work');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [carouselIndex, setCarouselIndex] = useState(0);

    // Track scroll progress for logo animation
    useEffect(() => {
        let ticking = false;

        const updateScrollState = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const heroSection = document.getElementById('hero');

            if (heroSection) {
                const heroStart = heroSection.offsetTop;
                const heroScrollableDistance = Math.max(heroSection.offsetHeight - windowHeight, 1);
                const progress = Math.min(Math.max((scrollY - heroStart) / heroScrollableDistance, 0), 1);
                setScrollProgress(progress);
            } else {
                setScrollProgress(0);
            }

            // Track current section
            const sections = ['hero', 'about', 'team', 'thanks', 'work', 'services', 'clients', 'contact'];
            const scrollPosition = scrollY + windowHeight / 3;

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        const sectionMap: { [key: string]: string } = {
                            hero: 'work',
                            about: 'about',
                            team: 'about',
                            thanks: 'about',
                            work: 'work',
                            services: 'services',
                            clients: 'clients',
                            contact: 'contact',
                        };
                        setCurrentSection(sectionMap[sectionId] || 'work');
                        break;
                    }
                }
            }

            ticking = false;
        };

        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollState);
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
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

    return (
        <div className="relative bg-black min-h-screen">
            {/* Fixed Header with small logo */}
            <Header currentSection={currentSection} scrollProgress={scrollProgress} />

            {/* Main Content */}
            <main>
                {/* Hero Section with large logo that shrinks on scroll */}
                <Hero onShowreelClick={() => setShowreelOpen(true)} scrollProgress={scrollProgress} />

                {/* Carousel for About, Team, Thanks on lg screens */}
                <div 
                    className="relative w-full overflow-hidden bg-black"
                    style={{ '--carousel-index': carouselIndex } as React.CSSProperties}
                >
                    <div className="flex flex-col lg:flex-row lg:w-[300%] transition-transform duration-1000 ease-in-out lg:[transform:translateX(calc(-33.333333%*var(--carousel-index)))]">
                        <div className="w-full lg:w-1/3 shrink-0">
                            <About onNext={() => {
                                if (window.innerWidth >= 1024) setCarouselIndex(1);
                                else document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
                            }} />
                        </div>
                        <div className="w-full lg:w-1/3 shrink-0">
                            <Team 
                                onNext={() => {
                                    if (window.innerWidth >= 1024) setCarouselIndex(2);
                                    else document.getElementById('thanks')?.scrollIntoView({ behavior: 'smooth' });
                                }} 
                                onPrev={() => {
                                    if (window.innerWidth >= 1024) setCarouselIndex(0);
                                    else document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                                }} 
                            />
                        </div>
                        <div className="w-full lg:w-1/3 shrink-0">
                            <Thanks onPrev={() => {
                                if (window.innerWidth >= 1024) setCarouselIndex(1);
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
