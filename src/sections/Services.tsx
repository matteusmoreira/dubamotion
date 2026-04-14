import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TubesBackground } from '@/components/ui/neon-flow';

const Services = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<'animation' | 'postproduction' | null>(null);
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

  const animationServices = [
    'services.anim.flat',
    'services.anim.stylized',
    'services.anim.mixed',
    'services.anim.collage',
    'services.anim.rigging',
    'services.anim.char',
  ];

  const postProductionServices = [
    'services.post.edit',
    'services.post.color',
    'services.post.roto',
    'services.post.ai',
    'services.post.track',
    'services.post.comp',
  ];

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative w-full bg-black py-24 overflow-hidden"
    >
      {/* Neon Flow Background */}
      <div className="absolute inset-0 z-0">
        <TubesBackground className="w-full h-full bg-black" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 lg:px-16">
        {/* Title */}
        <div className="text-center mb-20">
          <h2
            className={`text-4xl lg:text-6xl font-bold transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            style={{
              background: 'linear-gradient(90deg, #6B21A8 0%, #00FF88 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {t('services.title')}
          </h2>
        </div>

        {/* Accordions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Animation Accordion */}
          <div
            className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
          >
            <button
              onClick={() =>
                setOpenAccordion(openAccordion === 'animation' ? null : 'animation')
              }
              className="w-full flex items-center justify-between group"
            >
              <h3 className="text-3xl lg:text-4xl font-bold text-[#00FF88] group-hover:opacity-80 transition-opacity">
                {t('services.animation')}
              </h3>
              {openAccordion === 'animation' ? (
                <ChevronUp className="text-[#00FF88]" size={32} />
              ) : (
                <ChevronDown className="text-[#00FF88]" size={32} />
              )}
            </button>

            <div
              className={`accordion-content mt-6 ${openAccordion === 'animation' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              <ul className="space-y-3">
                {animationServices.map((service, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-white/80"
                  >
                    <span className="w-2 h-2 bg-[#00FF88] rounded-full" />
                    {t(service)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Post Production Accordion */}
          <div
            className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
          >
            <button
              onClick={() =>
                setOpenAccordion(openAccordion === 'postproduction' ? null : 'postproduction')
              }
              className="w-full flex items-center justify-between group"
            >
              <h3 className="text-3xl lg:text-4xl font-bold text-[#00FF88] group-hover:opacity-80 transition-opacity">
                {t('services.postproduction')}
              </h3>
              {openAccordion === 'postproduction' ? (
                <ChevronUp className="text-[#00FF88]" size={32} />
              ) : (
                <ChevronDown className="text-[#00FF88]" size={32} />
              )}
            </button>

            <div
              className={`accordion-content mt-6 ${openAccordion === 'postproduction' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              <div className="grid grid-cols-2 gap-3">
                {postProductionServices.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-white/80"
                  >
                    <span className="w-2 h-2 bg-[#00FF88] rounded-full" />
                    {t(service)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
