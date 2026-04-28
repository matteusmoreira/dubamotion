import { useState } from 'react';
import InteractiveOctopus from '../components/InteractiveOctopus';
import { useLanguage } from '../contexts/LanguageContext';
import { getShowreelVideoId } from '../lib/showreel';
import octopusHeroImage from '../../polvo/0112.png';

interface HeroProps {
  onShowreelClick?: () => void;
  scrollProgress?: number;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);

const segment = (value: number, start: number, end: number) => {
  if (end <= start) return 0;
  return clamp((value - start) / (end - start));
};

const mix = (from: number, to: number, value: number) => from + (to - from) * value;

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

const easeInOutCubic = (value: number) => {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
};

const Hero = ({ onShowreelClick, scrollProgress = 0 }: HeroProps) => {
  const { t, language } = useLanguage();
  const [isShowreelHovered, setIsShowreelHovered] = useState(false);
  const videoId = getShowreelVideoId(language);
  const progress = clamp(scrollProgress);
  const heroPrimaryLines = [
    t('hero.primary1'),
    t('hero.primary2'),
    t('hero.primary3'),
  ];

  const introPhase = easeInOutCubic(segment(progress, 0, 0.24));
  const labelPhase = easeOutCubic(segment(progress, 0.08, 0.22));
  const labelExitPhase = easeInOutCubic(segment(progress, 0.34, 0.46));
  const dockPhase = easeInOutCubic(segment(progress, 0.16, 0.36));
  const handoffPhase = easeInOutCubic(segment(progress, 0.24, 0.4));
  const statementPhase = easeOutCubic(segment(progress, 0.28, 0.48));
  const octopusRevealPhase = easeOutCubic(segment(progress, 0.32, 0.54));
  const octopusDriftPhase = easeInOutCubic(segment(progress, 0.68, 0.84));
  const deepeningPhase = easeOutCubic(segment(progress, 0.72, 0.9));
  const exitPhase = easeInOutCubic(segment(progress, 0.88, 1));

  const baseOverlayOpacity = mix(0.04, 0.18, deepeningPhase);
  const atmosphereOpacity = mix(0.12, 0.74, statementPhase);
  const vignetteOpacity = mix(0.12, 0.48, deepeningPhase);
  const labelOpacity = labelPhase * (1 - labelExitPhase);
  const statementOpacity = statementPhase * mix(1, 0.82, deepeningPhase) * (1 - exitPhase * 0.3);
  const deepeningOpacity = deepeningPhase * (1 - exitPhase * 0.35);
  const indicatorOpacity = clamp(labelOpacity + statementOpacity * 0.55) * (1 - exitPhase * 0.45);

  const markRestScale = mix(1.44, 1.2, introPhase);
  const markScale = mix(markRestScale, 0.16, dockPhase);
  const markRestTranslateY = mix(12, 18, introPhase);
  const markTranslateY = mix(markRestTranslateY, -35, dockPhase);
  const markOpacity = mix(1, 0.06, handoffPhase) * (1 - exitPhase * 0.2);

  const octopusOpacity = octopusRevealPhase * (1 - exitPhase * 0.18);
  const octopusScale = mix(0.9, 1.08, octopusRevealPhase)
    + mix(0, 0.18, octopusDriftPhase)
    + mix(0, 0.4, deepeningPhase)
    - mix(0, 0.08, exitPhase);
  const octopusOffsetX = mix(0, -20, octopusDriftPhase);
  const octopusOffsetY = mix(72, 12, octopusRevealPhase)
    + mix(0, -8, octopusDriftPhase)
    + mix(0, -8, deepeningPhase)
    - mix(0, 6, exitPhase);
  const showPreview = labelOpacity > 0.15 && isShowreelHovered;

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative h-[430vh] w-full bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="hidden h-full w-full lg:block">
            <InteractiveOctopus
              imagePath="/octopus-purple.png"
              isInteractive={true}
              showOctopus={false}
            />
          </div>
          <div className="absolute inset-0 lg:hidden bg-[#050014]" />
        </div>

        <div
          className="absolute inset-0 z-10 bg-black transition-opacity duration-200"
          style={{ opacity: baseOverlayOpacity }}
        />
        <div
          className="absolute inset-0 z-20"
          style={{
            opacity: atmosphereOpacity,
            backgroundImage: 'radial-gradient(circle at center, rgba(90, 40, 160, 0.18), transparent 55%), linear-gradient(180deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.6))',
          }}
        />
        <div
          className="absolute inset-0 z-20"
          style={{
            opacity: vignetteOpacity,
            backgroundImage: 'radial-gradient(circle at center, transparent 46%, rgba(0, 0, 0, 0.7) 100%)',
          }}
        />

        <div className="pointer-events-none absolute inset-0 z-30">
          <div
            className="absolute left-1/2 top-[56%]"
            style={{
              opacity: markOpacity,
              transform: `translate3d(-50%, calc(-50% + ${markTranslateY}vh), 0) scale(${markScale})`,
            }}
          >
            <img
              src="/images/logo-oficial-final-duba.png"
              alt=""
              className="block h-auto max-w-none select-none object-contain [filter:brightness(0)]"
              style={{
                width: 'max(238vw, 208vh)',
              }}
            />
          </div>
        </div>

        <div
          className="pointer-events-none absolute left-1/2 top-[60%] z-50 w-[104vw] max-w-[1580px] sm:w-[80vw] lg:w-[56vw]"
          style={{
            opacity: octopusOpacity,
            transform: `translate3d(calc(-50% + ${octopusOffsetX}vw), calc(-50% + ${octopusOffsetY}vh), 0) scale(${octopusScale})`,
          }}
        >
          <img
            src={octopusHeroImage}
            alt=""
            className="h-auto w-full object-contain mix-blend-screen drop-shadow-[0_40px_90px_rgba(0,0,0,0.75)]"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 z-40">
          <div
            className="absolute bottom-[19vh] left-6 md:left-12 lg:left-20"
            style={{
              opacity: labelOpacity,
              transform: `translate3d(${mix(-30, 0, labelPhase)}px, ${mix(24, 0, labelPhase)}px, 0)`,
            }}
          >
            <span className="neon-text text-lg font-foco lowercase tracking-[0.24em] md:text-xl">
              {t('hero.dubamotion')}
            </span>
          </div>

          <div
            className="pointer-events-auto absolute bottom-[19vh] right-6 md:right-12 lg:right-20"
            style={{
              opacity: labelOpacity,
              transform: `translate3d(${mix(30, 0, labelPhase)}px, ${mix(24, 0, labelPhase)}px, 0)`,
            }}
          >
            <div
              className="relative flex flex-col items-end gap-4"
              onMouseEnter={() => setIsShowreelHovered(true)}
              onMouseLeave={() => setIsShowreelHovered(false)}
              onFocusCapture={() => setIsShowreelHovered(true)}
              onBlurCapture={() => setIsShowreelHovered(false)}
            >
              <div
                className={`absolute bottom-full right-0 mb-5 aspect-video w-[220px] overflow-hidden rounded-[26px] border border-white/20 bg-black/80 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-sm transition-all duration-300 md:w-[320px] ${
                  showPreview ? 'pointer-events-auto translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-3 scale-95 opacity-0'
                }`}
              >
                <iframe
                  src={`https://player.vimeo.com/video/${videoId}?background=1&autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0`}
                  className="pointer-events-none h-full w-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  title="Showreel preview"
                />
                <button
                  type="button"
                  onClick={onShowreelClick}
                  className="absolute inset-0 z-10"
                  aria-label="Open showreel preview"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
              </div>

              <button
                type="button"
                onClick={onShowreelClick}
                className="neon-text text-lg font-avenir font-medium lowercase tracking-[0.24em] transition-opacity hover:opacity-80 md:text-xl"
              >
                {t('hero.showreel')}
              </button>
            </div>
          </div>

          <div
            className="absolute left-6 top-[30%] md:left-12 lg:left-20"
            style={{
              opacity: statementOpacity,
              transform: `translate3d(${mix(-44, 0, statementPhase)}px, ${mix(32, 0, statementPhase)}px, 0)`,
            }}
          >
            <h1
              className="font-foco max-w-[14ch] text-left leading-[0.9] text-white text-[1.6rem] md:text-[2.6rem] xl:text-[3.3rem]"
            >
              <span className="block">{heroPrimaryLines[0]}</span>
              <span className="block pl-[3.4ch]">{heroPrimaryLines[1]}</span>
              <span className="block">{heroPrimaryLines[2]}</span>
            </h1>
          </div>

          <div
            className="absolute bottom-[18vh] right-6 text-right md:right-12 lg:right-20"
            style={{
              opacity: deepeningOpacity,
              transform: `translate3d(${mix(18, 0, deepeningPhase)}px, ${mix(22, 0, deepeningPhase)}px, 0)`,
            }}
          >
            <h2 className="hero-copy-font max-w-[8.5ch] text-[1.28rem] leading-[0.92] text-white md:text-[2.2rem] xl:text-[2.9rem]">
              <span className="block">{t('hero.deep1')}</span>
              <span className="block">{t('hero.deep2')}</span>
              <span className="block">{t('hero.deep3')}</span>
            </h2>
          </div>

          <div
            className="pointer-events-auto absolute bottom-10 left-1/2 -translate-x-1/2"
            style={{ opacity: indicatorOpacity }}
          >
            <button
              type="button"
              onClick={scrollToAbout}
              className="scroll-indicator cursor-pointer transition-colors hover:border-[#00FF88]"
              aria-label="Scroll to next section"
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 h-44 bg-gradient-to-t from-black via-black/70 to-transparent" />
    </section>
  );
};

export default Hero;
