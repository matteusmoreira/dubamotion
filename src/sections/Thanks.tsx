import { useEffect, useRef, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Warp } from "@paper-design/shaders-react";

const Thanks = () => {
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
    { name: 'Amanda Lucatti', role: 'Designer redes sociais' },
    { name: 'Dalmo Azevedo', role: 'Motion Designer Parceiro e Sound Designer do Manifesto' },
    { name: 'Leonardo Martineli', role: 'Modelagem e textura do Polvo 3D da Marca' },
    { name: 'Victor Santos', role: 'Redação Manifesto' },
    { name: 'Vitor Tavares', role: 'Branding da marca e direção de arte do Manifesto' },
  ];

  const clients = [
    'Aldo Fabrini',
    'Andre Vaccaro',
    'Fabiano Feijó',
    'Fidel',
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
      className="relative min-h-screen w-full bg-black py-24"
    >
      {/* Gradient Header */}
      <div className="relative h-32 mb-16 overflow-hidden w-full">
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
          <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
        </div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <h2
            className={`text-5xl lg:text-7xl font-bold green-gradient-title transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            thanks
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Collaborators */}
          <div
            className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
          >
            <div className="space-y-4">
              {collaborators.map((person, index) => (
                <div key={index} className="space-y-1">
                  <h4 className="text-[#00FF88] font-semibold">{person.name}</h4>
                  <p className="text-white/50 text-sm">{person.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Clients */}
          <div
            className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
          >
            <p className="text-white/60 text-sm mb-6">
              Aos clientes e parceiros que acreditaram no nosso trabalho e possibilitaram o surgimento do estúdio:
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {clients.map((client, index) => (
                <span key={index} className="text-[#00FF88] font-medium">
                  {client}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Arrow */}
        <div className="mt-16 flex justify-start">
          <button
            onClick={() => {
              const teamSection = document.getElementById('team');
              if (teamSection) {
                teamSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="text-white/50 hover:text-[#00FF88] transition-colors"
            aria-label="Previous section"
          >
            <ChevronLeft size={32} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Thanks;
