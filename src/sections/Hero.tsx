import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import InteractiveOctopus from '../components/InteractiveOctopus';

interface HeroProps {
  onShowreelClick?: () => void;
  scrollProgress?: number;
}

const Hero = ({ onShowreelClick, scrollProgress = 0 }: HeroProps) => {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax Effect Logic
  const { scrollY } = useScroll();

  // Vertical movement for background
  const yRange = useTransform(scrollY, [0, 1000], [0, 200]);
  const ySpring = useSpring(yRange, { stiffness: 100, damping: 20 });
  const rotateRange = useTransform(scrollY, [0, 500, 1000], [0, 2, -2]);
  const rotateSpring = useSpring(rotateRange, { stiffness: 100, damping: 20 });

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate logo animation based on scroll (using passed scrollProgress 0 to 1)
  // At 0: Scale is HUGE (e.g. 30), it's black.
  // At 1: Scale is 1, it's white.
  // Filter transition: 0 to 0.7 staying black, 0.7 to 1 going to white
  const smoothProgress = useSpring(scrollProgress, { stiffness: 100, damping: 20 });
  
  // Custom manual interpolation for performance directly in style
  const logoScale = Math.max(1, 30 - scrollProgress * 29);
  // brightness: 0 is black, 1 is original (white)
  const isBlackPhase = scrollProgress < 0.6;
  
  // Texts only appear when scroll is almost done
  const textOpacity = scrollProgress > 0.8 ? 1 : 0;
  const textTranslateX = scrollProgress > 0.8 ? 0 : -20;
  
  // Small logo in header must be managed globally but here we focus on the Hero Logo.

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-[150vh] w-full bg-[#0A0A0A]"
    >
      {/* Sticky container keeps everything in view while the 150vh section scrolls */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        
        {/* Background Interactive Layer (Sea + Octopus) */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            zIndex: 1,
            y: ySpring,
            rotate: rotateSpring
          }}
        >
          <div className="absolute inset-0 pointer-events-auto">
            {/* Interactive 3D Component - Full viewport (mobile & desktop) */}
            <div className="hidden lg:block w-full h-full">
              <InteractiveOctopus imagePath="/octopus-purple.png" isInteractive={true} />
            </div>
            {/* Static image for mobile (no 3D, no movement) */}
            <div className="lg:hidden w-full h-full flex items-center justify-center bg-[#05001a]">
              {/* simple fallback gradient if mobile cannot load canvas */}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>

        {/* Large Logo - Starts GIGANTIC and Black, shrinks to normal size and white */}
        <div
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          style={{
            zIndex: 50,
          }}
        >
          <div
            className="flex items-center justify-center transition-all duration-75"
            style={{
              width: '400px',
              height: '400px',
              transform: `scale(${logoScale})`,
            }}
          >
            <img
              src="/images/logo.png"
              alt="Dubamotion"
              className="h-48 lg:h-64 w-auto object-contain transition-all duration-300"
              style={{
                filter: isBlackPhase 
                    ? 'brightness(0)' 
                    : 'brightness(1) drop-shadow(0 0 80px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 120px rgba(107, 33, 168, 1))',
              }}
            />
          </div>
        </div>

        {/* Motion Design Text - appears after scroll */}
        <div
          className="absolute left-0 right-0 lg:right-auto lg:left-16 top-[58%] lg:top-1/2 transform -translate-y-1/2 text-center lg:text-left transition-all duration-1000 ease-out px-8"
          style={{ 
            zIndex: 40,
            opacity: textOpacity,
            transform: `translateY(-50%) translateX(${textTranslateX}px)`
          }}
        >
          <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
            <span className="block">{t('hero.line1')}</span>
            <span className="block">{t('hero.line2')}</span>
            <span className="block text-white/80">{t('hero.line3')}</span>
            <span className="block">{t('hero.line4')}</span>
            <span className="block">{t('hero.line5')}</span>
          </h1>
        </div>

        {/* Deepening Ideas Text */}
        <div
          className="absolute left-0 right-0 lg:left-auto lg:right-16 top-[78%] lg:top-1/2 transform -translate-y-1/2 text-center lg:text-right transition-all duration-1000 delay-100 ease-out px-8"
          style={{ 
            zIndex: 40,
            opacity: textOpacity,
            transform: `translateY(-50%) translateX(${-textTranslateX}px)`
          }}
        >
          <h2 className="text-2xl lg:text-4xl font-bold text-white leading-tight drop-shadow-lg">
            <span className="block">{t('hero.deep1')}</span>
            <span className="block">{t('hero.deep2')}</span>
            <span className="block">{t('hero.deep3')}</span>
          </h2>
        </div>

        {/* Bottom Left - Dubamotion Text */}
        <div
          className="absolute bottom-12 left-8 lg:left-16 transition-all duration-1000 delay-200"
          style={{ zIndex: 40, opacity: textOpacity }}
        >
          <span className="neon-text text-lg tracking-widest font-medium">
            {t('hero.dubamotion')}
          </span>
        </div>

        {/* Bottom Right - Showreel Link */}
        <div
          className="absolute bottom-12 right-8 lg:right-16 transition-all duration-1000 delay-300 pointer-events-auto"
          style={{ zIndex: 40, opacity: textOpacity }}
        >
          <button
            onClick={onShowreelClick}
            className="neon-text text-lg tracking-widest font-medium hover:opacity-80 transition-opacity cursor-pointer"
          >
            {t('hero.showreel')}
          </button>
        </div>

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-300 pointer-events-auto"
          style={{ zIndex: 40, opacity: textOpacity }}
        >
          <button
            onClick={scrollToAbout}
            className="scroll-indicator cursor-pointer hover:border-[#00FF88] transition-colors"
          />
        </div>
        </div>
      </div>

      {/* Gradient Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" style={{ zIndex: 30 }} />
    </section>
  );
};

export default Hero;
