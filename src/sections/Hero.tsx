import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getShowreelVideoId } from '../lib/showreel';
import arrowIcon from '../../seta/Lootie_Seta-p-baixo_loop.svg';

const FluidOceanBackground = lazy(() => import('../components/FluidOceanBackground'));

const TOTAL_OCTOPUS_FRAMES = 78;

const OctopusFrameCanvas = ({ progress }: { progress: number }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentProgressRef = useRef(progress);
  const smoothProgressRef = useRef(progress);
  const activeFrameIndexRef = useRef(-1);

  // Keep target progress up to date
  useEffect(() => {
    currentProgressRef.current = progress;
  }, [progress]);

  // Preload all clean WebP frames (with transparent background)
  useEffect(() => {
    const images: HTMLImageElement[] = [];
    for (let i = 0; i < TOTAL_OCTOPUS_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i).padStart(3, '0');
      img.src = `/polvo-clean-frames/frame_${numStr}.webp`;
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  // Smooth lerp loop for frame scrub rendering
  useEffect(() => {
    let animId: number;

    const render = () => {
      const target = currentProgressRef.current;
      const diff = target - smoothProgressRef.current;
      if (Math.abs(diff) > 0.00005) {
        smoothProgressRef.current += diff * 0.12;
      } else {
        smoothProgressRef.current = target;
      }

      const p = clamp(smoothProgressRef.current);
      // Map scroll progress 0 -> 1 to 78 octopus frames with proper presence and exit window
      let frameIndex = 0;
      if (p < 0.05) {
        frameIndex = 0;
      } else if (p <= 0.25) {
        const ratio = (p - 0.05) / 0.20;
        frameIndex = Math.floor(ratio * 15);
      } else if (p <= 0.82) {
        const ratio = (p - 0.25) / 0.57;
        frameIndex = Math.floor(15 + ratio * (62 - 15));
      } else {
        const ratio = Math.min((p - 0.82) / 0.16, 1);
        frameIndex = Math.floor(62 + ratio * (77 - 62));
      }
      frameIndex = Math.min(TOTAL_OCTOPUS_FRAMES - 1, Math.max(0, frameIndex));

      if (frameIndex !== activeFrameIndexRef.current) {
        activeFrameIndexRef.current = frameIndex;
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const img = imagesRef.current[frameIndex];
            if (img && img.complete && img.naturalWidth > 0) {
              if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
              }
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-auto w-full object-contain md:mix-blend-screen"
    />
  );
};


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
  const [isMobile, setIsMobile] = useState(false);
  const videoId = getShowreelVideoId(language);
  const progress = clamp(scrollProgress);
  const heroPrimaryLines = [
    t('hero.primary1'),
    t('hero.primary2'),
    t('hero.primary3'),
  ];

  // Detect mobile viewport
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    handler(mql);
    mql.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
    return () => mql.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
  }, []);

  const introPhase = easeInOutCubic(segment(progress, 0, 0.24));
  const showreelPhase = easeInOutCubic(segment(progress, 0.02, 0.15));
  const labelExitPhase = easeInOutCubic(segment(progress, 0.34, 0.46));
  const dockPhase = easeInOutCubic(segment(progress, 0.16, 0.36));
  const handoffPhase = easeInOutCubic(segment(progress, 0.24, 0.4));
  const statementPhase = easeOutCubic(segment(progress, 0.22, 0.42));
  const octopusRevealPhase = easeOutCubic(segment(progress, 0.10, 0.32));
  const octopusDriftPhase = easeInOutCubic(segment(progress, 0.32, 0.82));
  const deepeningPhase = easeOutCubic(segment(progress, 0.45, 0.65));
  const exitPhase = easeInOutCubic(segment(progress, 0.82, 0.98));

  const baseOverlayOpacity = mix(0.04, 0.18, deepeningPhase);
  const atmosphereOpacity = mix(0.12, 0.74, statementPhase);
  const vignetteOpacity = mix(0.12, 0.48, deepeningPhase);
  // Dubamotion está presente desde o início do site e sai na labelExitPhase
  const dubamotionOpacity = 1 * (1 - labelExitPhase);

  // Showreel entra no 1º scroll substituindo a setinha e sai na labelExitPhase
  const showreelOpacity = showreelPhase * (1 - labelExitPhase);

  // Setinha no lado direito: presente no início, desaparece no 1º scroll quando o Showreel entra
  const arrowOpacity = (1 - showreelPhase) * (1 - labelExitPhase);

  const statementOpacity = statementPhase * mix(1, 0.82, deepeningPhase) * (1 - exitPhase * 0.3);
  const deepeningOpacity = deepeningPhase * (1 - exitPhase * 0.35);


  const markRestScale = mix(1.44, 1.2, introPhase);
  const markScale = mix(markRestScale, 0.16, dockPhase);
  const markRestTranslateY = mix(12, 18, introPhase);
  const markTranslateY = mix(markRestTranslateY, -35, dockPhase);
  const markOpacity = mix(1, 0, handoffPhase);

  const octopusOpacity = octopusRevealPhase * (1 - exitPhase);
  const octopusScale = mix(0.82, 1.05, octopusRevealPhase)
    + mix(0, 0.06, octopusDriftPhase)
    - mix(0, 0.08, exitPhase);
  const octopusOffsetX = isMobile ? 0 : mix(0, -20, octopusDriftPhase);
  const octopusOffsetY = mix(72, 12, octopusRevealPhase)
    + mix(0, -8, octopusDriftPhase)
    + mix(0, -8, deepeningPhase)
    - mix(0, 6, exitPhase);
  const showPreview = showreelOpacity > 0.15 && isShowreelHovered;

  return (
    <section id="hero" className="relative h-[430vh] w-full bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[#050014]">
          <Suspense fallback={null}>
            <FluidOceanBackground />
          </Suspense>
          {/* Gradient blend on bottom edge */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50px',
              background: 'linear-gradient(to bottom, transparent 0%, #050014 60%)',
              zIndex: 100000000,
              pointerEvents: 'none',
            }}
          />
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
              src="/images/logo-oficial-final-duba.webp"
              alt=""
              className="block h-auto max-w-none select-none object-contain [filter:brightness(0)]"
              style={{
                width: 'max(238vw, 208vh)',
              }}
            />
          </div>
        </div>

        <div
          className="hero-octopus-glow pointer-events-none absolute left-1/2 top-[50%] z-50 w-[96vw] max-w-[1550px] sm:w-[84vw] lg:w-[70vw] xl:w-[62vw]"
          style={{
            opacity: octopusOpacity,
            transform: `translate3d(calc(-50% + ${octopusOffsetX}vw), calc(-50% + ${octopusOffsetY}vh), 0) scale(${octopusScale})`,
            transition: 'opacity 0.25s ease-out',
          }}
        >
          <OctopusFrameCanvas progress={progress} />
        </div>

        <div className="pointer-events-none absolute inset-0 z-40">
          {/* LADO ESQUERDO: dubamotion (presente desde o início) */}
          <div
            className="absolute bottom-[19vh] left-6 md:left-12 lg:left-20"
            style={{
              opacity: dubamotionOpacity,
              transform: `translate3d(0px, calc(0px - ${mix(0, 68, dockPhase)}vh), 0)`,
            }}
          >
            <span className="neon-text text-lg font-foco lowercase tracking-[0.24em] md:text-xl">
              {t('hero.dubamotion')}
            </span>
          </div>

          {/* LADO DIREITO: Showreel (entra no 1º scroll) e sobe no 2º scroll */}
          <div
            className="absolute bottom-[19vh] right-6 md:right-12 lg:right-20 flex flex-col items-end"
            style={{
              transform: `translate3d(0px, calc(0px - ${mix(0, 68, dockPhase)}vh), 0)`,
            }}
          >
            <div className="relative flex flex-col items-end justify-center min-h-[32px]">
              {/* Showreel (entra no 1º scroll) */}
              <div
                className="relative flex flex-col items-end gap-4"
                style={{
                  opacity: showreelOpacity,
                  transform: `translate3d(${mix(20, 0, showreelPhase)}px, 0, 0)`,
                  pointerEvents: showreelOpacity > 0.5 ? 'auto' : 'none',
                }}
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
          </div>

          <div
            className="absolute left-6 top-[30%] md:left-12 lg:left-20"
            style={{
              opacity: statementOpacity,
              transform: `translate3d(${mix(-44, 0, statementPhase)}px, calc(${mix(32, 0, statementPhase)}px - ${mix(0, 40, exitPhase)}px), 0)`,
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
              transform: `translate3d(${mix(18, 0, deepeningPhase)}px, calc(${mix(22, 0, deepeningPhase)}px - ${mix(0, 40, exitPhase)}px), 0)`,
            }}
          >
            <h2 className="hero-copy-font max-w-[8.5ch] text-[1.28rem] leading-[0.92] text-white md:text-[2.2rem] xl:text-[2.9rem]">
              <span className="block">{t('hero.deep1')}</span>
              <span className="block">{t('hero.deep2')}</span>
              <span className="block">{t('hero.deep3')}</span>
            </h2>
          </div>

          <div
            className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2"
            style={{ opacity: arrowOpacity }}
          >
            <img
              src={arrowIcon}
              alt="Scroll down"
              className="h-16 w-auto"
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 h-44 bg-gradient-to-t from-black via-black/70 to-transparent" />
    </section>
  );
};

export default Hero;
