import { useEffect, useRef, useState } from 'react';
import { Warp } from "@paper-design/shaders-react";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  rolePt: string;
  image: string;
}

const Team = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const teamMembers: TeamMember[] = [
    {
      name: 'Julio Cesar',
      role: 'Motion designer',
      rolePt: 'Motion designer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
    },
    {
      name: 'Eduardo Guimarães',
      role: 'Founder, Animation Director, Motion Designer, Composer',
      rolePt: 'Fundador, Diretor de animação, Motion Designer, Compositor',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop',
    },
    {
      name: 'Henrique Oliveira',
      role: 'Colorist',
      rolePt: 'Colorista',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop',
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % teamMembers.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  return (
    <section
      id="team"
      ref={sectionRef}
      className="relative min-h-screen w-full bg-black py-24"
    >
      {/* Gradient Header */}
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
            team
          </h2>
        </div>
      </div>

      {/* Carousel */}
      <div className="max-w-6xl mx-auto px-8 lg:px-16">
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 lg:-translate-x-16 z-10 text-white/50 hover:text-[#00FF88] transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={40} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 lg:translate-x-16 z-10 text-white/50 hover:text-[#00FF88] transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={40} />
          </button>

          {/* Team Members Grid */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className={`flex flex-col items-center transition-all duration-500 ${index === currentIndex ? 'scale-105' : 'scale-100 opacity-70'
                  }`}
              >
                {/* Member Image */}
                <div className="relative w-full aspect-[3/4] mb-6 overflow-hidden rounded-lg">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-110"
                    style={{
                      backgroundImage: `url(${member.image})`,
                    }}
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
                <h3 className="text-[#00FF88] text-xl font-semibold mb-2">
                  {member.name}
                </h3>
                <p className="text-white/60 text-sm text-center leading-relaxed">
                  {member.role}
                </p>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-12">
            {teamMembers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === index
                  ? 'bg-[#00FF88] w-6'
                  : 'bg-white/30 hover:bg-white/50'
                  }`}
                aria-label={`Go to member ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
