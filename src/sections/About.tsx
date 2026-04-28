import { useEffect, useRef, useState } from 'react';
import { Mail, Instagram, Twitter, Linkedin, Phone, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Warp } from "@paper-design/shaders-react";

interface AboutProps {
  onNext?: () => void;
}

const About = ({ onNext }: AboutProps = {}) => {
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

  const contactInfo = [
    { icon: Mail, text: 'contato@dubamotion.com.br', href: 'mailto:contato@dubamotion.com.br' },
    { icon: Instagram, text: '@dubamotion', href: 'https://instagram.com/dubamotion' },
    { icon: Twitter, text: '/dubamotion', href: 'https://twitter.com/dubamotion' },
    { icon: Linkedin, text: '/dubamotion', href: 'https://linkedin.com/company/dubamotion' },
    { icon: Phone, text: '55 (11) 9.8754-0457', href: 'https://wa.me/5511987540457' },
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full bg-black py-24 overflow-hidden"
    >
      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* Header */}
        <div className="relative h-32 mb-16 flex items-center justify-center overflow-hidden w-full">
          {/* Warp Background for Title */}
          <div className="absolute inset-0 z-0 w-full h-full">
            <Warp
              style={{ height: "100%", width: "100%" }}
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
              colors={["#000000", "#064e3b", "#065f46", "#047857"]}
            />
            {/* Optional overlay/mask if needed to blend edges or improve text contrast */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
          </div>

          <h2
            className={`relative z-10 font-avenir font-black text-5xl text-white transition-all duration-1000 lg:text-7xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            {t('about.title')}
          </h2>
        </div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Contact Info */}
            <div
              className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}
            >
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-4 group"
                  >
                    <span className="font-avenir font-normal text-white/70 text-lg group-hover:text-[#00FF88] transition-colors">
                      {item.text}
                    </span>
                    <item.icon
                      size={18}
                      className="text-white/50 group-hover:text-[#00FF88] transition-colors"
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* Right Column - Description */}
            <div
              className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}
            >
              <div className="space-y-6">
                <p className="font-avenir text-white/80 text-lg leading-relaxed">
                  {t('about.p1')}
                  <span className="font-avenir font-bold text-white">
                    {t('about.highlight')}
                  </span>
                  .
                </p>
                <p className="font-avenir font-normal text-white/60 leading-relaxed">
                  {t('about.p2')}
                </p>
              </div>

              {/* Navigation Arrow */}
              <div className="mt-12 flex justify-end">
                <button
                  onClick={() => {
                    if (onNext) {
                      onNext();
                    } else {
                      const teamSection = document.getElementById('team');
                      if (teamSection) {
                        teamSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className="text-white/50 hover:text-[#00FF88] transition-colors"
                  aria-label="Next section"
                >
                  <ChevronRight size={32} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
