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

    // Track scroll progress for logo animation
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            // Calculate progress from 0 to 1 based on scroll position
            // Logo shrinks completely by 50% of viewport scroll
            const progress = Math.min(scrollY / (windowHeight * 0.5), 1);
            setScrollProgress(progress);

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
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial call
        return () => window.removeEventListener('scroll', handleScroll);
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

                {/* About Section */}
                <About />

                {/* Team Section */}
                <Team />

                {/* Thanks Section */}
                <Thanks />

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
