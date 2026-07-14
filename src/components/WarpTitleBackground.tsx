import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useReducedGraphics } from '../hooks/use-mobile';

let warpModulePromise: Promise<typeof import('@paper-design/shaders-react')> | null = null;

const loadWarpModule = () => {
  warpModulePromise ??= import('@paper-design/shaders-react');
  return warpModulePromise;
};

const Warp = lazy(() => loadWarpModule().then((module) => ({ default: module.Warp })));

const StaticWarp = () => (
  <div className="mobile-title-warp absolute inset-0" />
);

const WarpTitleBackground = ({ active }: { active: boolean }) => {
  const reduceGraphics = useReducedGraphics();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: '240px 0px', threshold: 0.01 },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduceGraphics) return;

    const preloadTimer = window.setTimeout(() => {
      void loadWarpModule().catch(() => undefined);
    }, 250);

    return () => window.clearTimeout(preloadTimer);
  }, [reduceGraphics]);

  const shouldAnimate = active && !reduceGraphics && isInView;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      data-warp-animation={shouldAnimate ? 'active' : 'static'}
      aria-hidden="true"
    >
      {shouldAnimate ? (
        <Suspense fallback={<StaticWarp />}>
          <Warp
            style={{ height: '100%', width: '100%' }}
            proportion={0.45}
            softness={1}
            distortion={0.25}
            swirl={0.8}
            swirlIterations={10}
            shape="checks"
            shapeScale={0.1}
            scale={1}
            rotation={0}
            speed={1}
            colors={['#000000', '#064e3b', '#065f46', '#047857']}
          />
        </Suspense>
      ) : (
        <StaticWarp />
      )}
    </div>
  );
};

export default WarpTitleBackground;
