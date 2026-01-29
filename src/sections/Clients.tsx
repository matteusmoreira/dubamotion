import { useEffect, useRef, useState } from 'react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';

const Clients = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="clients"
      ref={sectionRef}
      className="relative w-full bg-black py-24"
    >
      {/* Title */}
      <div className="text-center mb-12 px-8">
        <h2
          className={`text-4xl lg:text-6xl font-bold transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          style={{
            background: 'linear-gradient(90deg, #6B21A8 0%, #00FF88 50%, #00CCAA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Customers
          <br />
          who have already
          <br />
          sailed with us
        </h2>
      </div>

      {/* Infinite Slider - White Background */}
      <div
        className={`relative transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="py-16 overflow-hidden bg-white">
          <InfiniteSlider gap={24} duration={25} reverse className="w-full">
            <img
              src="https://motion-primitives.com/apple_music_logo.svg"
              alt="Apple Music logo"
              className="h-[120px] w-auto"
            />
            <img
              src="https://motion-primitives.com/chrome_logo.svg"
              alt="Chrome logo"
              className="h-[120px] w-auto"
            />
            <img
              src="https://motion-primitives.com/strava_logo.svg"
              alt="Strava logo"
              className="h-[120px] w-auto"
            />
            <img
              src="https://motion-primitives.com/nintendo_logo.svg"
              alt="Nintendo logo"
              className="h-[120px] w-auto"
            />
            <img
              src="https://motion-primitives.com/jquery_logo.svg"
              alt="Jquery logo"
              className="h-[120px] w-auto"
            />
            <img
              src="https://motion-primitives.com/prada_logo.svg"
              alt="Prada logo"
              className="h-[120px] w-auto"
            />
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
};

export default Clients;
