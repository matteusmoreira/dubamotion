import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import InteractiveOctopus from '../components/InteractiveOctopus';

interface HeroProps {
  onShowreelClick?: () => void;
  scrollProgress?: number;
}

const Hero = ({ onShowreelClick, scrollProgress = 0 }: HeroProps) => {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<'logo' | 'transition' | 'full'>('logo');
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax Effect Logic
  const { scrollY } = useScroll();

  // Vertical movement: moves down faster than scroll (parallax)
  // Input: 0 to 1000px scroll
  // Output: 0 to 400px movement down
  const yRange = useTransform(scrollY, [0, 1000], [0, 400]);
  const ySpring = useSpring(yRange, { stiffness: 100, damping: 20 });

  // Rotation: simple sway effect based on scroll
  const rotateRange = useTransform(scrollY, [0, 500, 1000], [0, 5, -5]);
  const rotateSpring = useSpring(rotateRange, { stiffness: 100, damping: 20 });


  useEffect(() => {
    // Phase 1: Logo only (0-1.5s)
    const timer1 = setTimeout(() => setPhase('transition'), 1500);
    // Phase 2: Transition (1.5s-2.5s)
    const timer2 = setTimeout(() => setPhase('full'), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate logo animation based on scroll
  const logoScale = Math.max(0.15, 1 - scrollProgress * 0.85);
  const logoOpacity = Math.max(0, 1 - scrollProgress * 1.5);
  const logoTranslateY = scrollProgress * -40;

  // Logo is fully visible at start, then fades as octopus appears
  const initialLogoOpacity = phase === 'logo' ? 1 : phase === 'transition' ? 0.7 : 0.5;

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen w-full overflow-hidden bg-black"
    >
      {/* Octopus Corner Shapes - appear during transition */}
      <div
        className={`octopus-corner octopus-corner-tl transition-all duration-1000 ${phase === 'full' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
      />
      <div
        className={`octopus-corner octopus-corner-tr transition-all duration-1000 delay-200 ${phase === 'full' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
      />
      <div
        className={`octopus-corner octopus-corner-bl transition-all duration-1000 delay-300 ${phase === 'full' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
      />
      <div
        className={`octopus-corner octopus-corner-br transition-all duration-1000 delay-400 ${phase === 'full' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
      />

      {/* Purple Wave Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] transition-all duration-1500 ${phase === 'full' ? 'opacity-60' : 'opacity-0'
            }`}
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, rgba(107, 33, 168, 0.4) 0%, transparent 40%),
              radial-gradient(ellipse at 80% 70%, rgba(107, 33, 168, 0.3) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 50%, rgba(107, 33, 168, 0.2) 0%, transparent 60%)
            `,
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Octopus Layer - Behind content, full screen movement */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          zIndex: 5,
          y: phase !== 'logo' ? ySpring : 0,
          rotate: phase !== 'logo' ? rotateSpring : 0
        }}
        initial={{ opacity: 0 }}
        animate={phase !== 'logo' ? { opacity: 1 } : { opacity: 0 }}
        transition={{
          duration: 1.0,
          ease: "easeOut"
        }}
      >
        {/* Interactive 3D Component - Full viewport (mobile & desktop) */}
        <div className="absolute inset-0">
          {/* Only interactive on desktop (lg and up) */}
          <div className="hidden lg:block w-full h-full">
            <InteractiveOctopus imagePath="/octopus-purple.png" isInteractive={true} />
          </div>
          {/* Static centered version for mobile (hidden on lg) */}
          <div className="lg:hidden w-full h-full">
            <InteractiveOctopus imagePath="/octopus-purple.png" isInteractive={false} />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-8">

        {/* Large Logo - Starts big, shrinks on scroll */}
        <div
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-out pointer-events-auto"
          style={{
            transform: `translate(-50%, calc(-50% + ${logoTranslateY}vh)) scale(${logoScale})`,
            opacity: logoOpacity > 0 ? logoOpacity : initialLogoOpacity,
            zIndex: 50,
          }}
        >
          {/* Solid black background for logo */}
          <div
            className="relative flex items-center justify-center"
            style={{
              width: '400px',
              height: '400px',
              background: phase === 'logo' ? 'black' : 'transparent',
              borderRadius: '50%',
            }}
          >
            <button
              onClick={() => {
                const heroSection = document.getElementById('hero');
                if (heroSection) {
                  heroSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="transition-transform duration-300 hover:scale-105"
            >
              <img
                src="/images/logo.png"
                alt="Dubamotion"
                className="h-48 lg:h-64 w-auto object-contain"
                style={{
                  filter: phase === 'logo'
                    ? 'none'
                    : 'drop-shadow(0 0 80px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 120px rgba(107, 33, 168, 1))',
                }}
              />
            </button>
          </div>
        </div>

        {/* Motion Design Text - appears after logo */}
        <div
          className={`absolute left-8 lg:left-16 top-1/2 transform -translate-y-1/2 transition-all duration-1000 ${phase === 'full'
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 -translate-x-10'
            }`}
          style={{ zIndex: 40 }}
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
          className={`absolute right-8 lg:right-16 top-1/2 transform -translate-y-1/2 transition-all duration-1000 delay-300 ${phase === 'full'
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-10'
            }`}
          style={{ zIndex: 40 }}
        >
          <h2 className="text-2xl lg:text-4xl font-bold text-white leading-tight text-right drop-shadow-lg">
            <span className="block">{t('hero.deep1')}</span>
            <span className="block">{t('hero.deep2')}</span>
            <span className="block">{t('hero.deep3')}</span>
          </h2>
        </div>

        {/* Bottom Left - Dubamotion Text */}
        <div
          className={`absolute bottom-12 left-8 lg:left-16 transition-all duration-1000 delay-500 ${phase !== 'logo' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          style={{ zIndex: 40 }}
        >
          <span className="neon-text text-lg tracking-widest font-medium">
            {t('hero.dubamotion')}
          </span>
        </div>

        {/* Bottom Right - Showreel Link */}
        <div
          className={`absolute bottom-12 right-8 lg:right-16 transition-all duration-1000 delay-600 ${phase !== 'logo' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          style={{ zIndex: 40 }}
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
          className={`absolute bottom-12 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-700 ${phase !== 'logo' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          style={{ zIndex: 40 }}
        >
          <button
            onClick={scrollToAbout}
            className="scroll-indicator cursor-pointer hover:border-[#00FF88] transition-colors"
          />
        </div>
      </div>

      {/* Gradient Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" style={{ zIndex: 30 }} />
    </section>
  );
};

export default Hero;
