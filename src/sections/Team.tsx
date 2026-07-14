import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import WarpTitleBackground from '../components/WarpTitleBackground';

interface TeamMember {
  name: string;
  role: string;
  rolePt: string;
  image: string;
}

interface TeamProps {
  onNext?: () => void;
  onPrev?: () => void;
  animateBackground?: boolean;
}

const Team = ({ onNext, onPrev, animateBackground = true }: TeamProps = {}) => {
  const { t, language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const teamMembers: TeamMember[] = [
    {
      name: 'Eduardo Guimarães',
      role: 'Founder and Animation Director',
      rolePt: 'Fundador e Diretor de Animação',
      image: '/images/duba-estatico.webp',
    },
    {
      name: 'Henrique Oliveira',
      role: 'Post-production Coordinator',
      rolePt: 'Coordenador de pós produção',
      image: '/images/henrique-estatico.webp',
    },
  ];

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
      id="team"
      ref={sectionRef}
      className="relative w-full bg-black py-24"
    >
      {/* Gradient Header */}
      {/* Gradient Header */}
      <div className="relative h-32 mb-16 overflow-hidden w-full">
        <div className="absolute inset-0 z-0 w-full h-full">
          <WarpTitleBackground active={isVisible && animateBackground} />
          <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <h2
            className={`font-foco font-bold text-5xl lg:text-7xl green-gradient-title transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            {t('team.title')}
          </h2>
        </div>
      </div>

      {/* Carousel */}
      <div className="max-w-6xl mx-auto px-8 lg:px-16">
        <div className="relative">
          {/* Navigation Arrows (for Carousel integration) */}
          <button
            onClick={() => {
              if (onPrev) {
                onPrev();
              } else {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                  aboutSection.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 lg:-translate-x-16 z-10 text-white/50 hover:text-[#00FF88] transition-colors ${onPrev ? 'opacity-100' : 'opacity-100'}`}
            aria-label="Previous section"
          >
            <ChevronLeft size={40} />
          </button>
          <button
            onClick={() => {
              if (onNext) {
                onNext();
              } else {
                const thanksSection = document.getElementById('thanks');
                if (thanksSection) {
                  thanksSection.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 lg:translate-x-16 z-10 text-white/50 hover:text-[#00FF88] transition-colors"
            aria-label="Next section"
          >
            <ChevronRight size={40} />
          </button>

          {/* Team Members Grid */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="flex flex-col items-center transition-all duration-500 hover:scale-105"
              >
                {/* Member Image */}
                <div className="relative w-4/5 mx-auto aspect-[3/4] mb-6 overflow-hidden rounded-lg">
                  <img
                    src={member.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 hover:scale-110"
                  />
                  {/* Purple/Green Overlay */}
                  <div
                    className="absolute inset-0 mix-blend-overlay"
                    style={{
                      background: 'linear-gradient(135deg, rgba(107, 33, 168, 0.4) 0%, rgba(0, 255, 136, 0.2) 100%)',
                    }}
                  />
                  {/* Glow Effect */}
                  <div
                    className="absolute inset-0"
                    style={{
                      boxShadow: 'inset 0 0 60px rgba(107, 33, 168, 0.3)',
                    }}
                  />
                </div>

                {/* Member Info */}
                <h3 className="font-avenir font-bold italic text-[#00FF88] text-xl mb-2">
                  {member.name}
                </h3>
                <p className="font-avenir font-normal text-white/60 text-sm text-center leading-relaxed">
                  {language === 'en' ? member.role : member.rolePt}
                </p>
              </div>
            ))}
          </div>

        {/* Dots Indicator removed since there are only two members shown side by side */}
        </div>
      </div>
    </section>
  );
};

export default Team;
