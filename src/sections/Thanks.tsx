import { useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import WarpTitleBackground from '../components/WarpTitleBackground';

interface ThanksProps {
  onPrev?: () => void;
  animateBackground?: boolean;
}

const Thanks = ({ onPrev, animateBackground = true }: ThanksProps = {}) => {
  const { t } = useLanguage();
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

  const collaborators = [
    { name: 'Amanda Lucatti', role: t('thanks.roles.amanda') },
    { name: 'André Lobato e Equipe Alfred', role: t('thanks.roles.alfred') },
    { name: 'Higor Hatano', role: t('thanks.roles.higor') },
    { name: 'Leonardo Martineli', role: t('thanks.roles.leonardo') },
    { name: 'Victor Santos', role: t('thanks.roles.victor') },
    { name: 'Vitor Tavares', role: t('thanks.roles.vitor') },
  ];

  const clients = [
    'Aldo Fabrini',
    'Andre Vaccaro',
    'Beatriz Partington',
    'Fabiano Feijó',
    'Fidel Lombardi',
    'Joao Pedro Albuquerque',
    'Marcello Coelho',
    'Paulo Aguiar',
    'Rita Theoffilo',
    'Vinicius Bueno',
    'Will Ferrari',
  ];

  return (
    <section
      id="thanks"
      ref={sectionRef}
      className="relative w-full bg-black py-24"
    >
      {/* Gradient Header */}
      <div className="relative h-36 mb-16 overflow-hidden w-full">
        <div className="absolute inset-0 z-0 w-full h-full">
          <WarpTitleBackground active={isVisible && animateBackground} />
          <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <h2
            className={`font-foco font-bold text-5xl lg:text-7xl green-gradient-title pb-2 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            {t('thanks.title')}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 lg:px-16">
        <div className="relative">
          {/* Navigation Arrow */}
          <button
            onClick={() => {
              if (onPrev) {
                onPrev();
              } else {
                const teamSection = document.getElementById('team');
                if (teamSection) {
                  teamSection.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 lg:-translate-x-16 z-10 text-white/50 hover:text-[#00FF88] transition-colors"
            aria-label="Previous section"
          >
            <ChevronLeft size={40} />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Column - Collaborators */}
            <div
              className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}
            >
              <div className="space-y-4">
                {collaborators.map((person, index) => (
                  <div key={index} className="space-y-1">
                    <h4 className="font-avenir font-bold italic text-[#00FF88]">{person.name}</h4>
                    <p className="font-avenir font-normal text-white/50 text-sm">{person.role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Clients */}
            <div
              className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}
            >
              <p className="font-avenir font-normal text-white/60 text-sm mb-6">
                {t('thanks.clientsText')}
              </p>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {clients.map((client, index) => (
                  <span key={index} className="font-avenir font-bold italic text-[#00FF88]">
                    {client}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Thanks;
