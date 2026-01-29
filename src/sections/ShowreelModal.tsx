import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShowreelModal = ({ isOpen, onClose }: ShowreelModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const slides = [
    {
      year: '37000 a.c',
      text: 'HÁ 37 MIL ANOS A GENTE CONTAVA HISTÓRIAS ASSIM',
      bgImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80',
    },
    {
      year: '7000 a.c',
      text: 'HÁ 7 MIL ANOS A GENTE CONTAVA HISTÓRIAS ASSIM',
      bgImage: 'https://images.unsplash.com/photo-1564399580075-5dfe19c205f3?w=1920&q=80',
    },
    {
      year: '500 a.c',
      text: 'HÁ 5 MIL ANOS A GENTE CONTAVA HISTÓRIAS ASSIM',
      bgImage: 'https://images.unsplash.com/photo-1555662106-067f6a1f9b8d?w=1920&q=80',
    },
    {
      year: '2000 d.c',
      text: 'HÁ 2 MIL ANOS A GENTE CONTAVA HISTÓRIAS ASSIM',
      bgImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80',
    },
    {
      year: '1714',
      text: 'E NOSSAS NARRATIVAS CONTINUARAM ESTÁTICAS',
      bgImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
      // Auto-advance slides
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4000);
      return () => clearInterval(interval);
    } else {
      setIsVisible(false);
      setCurrentSlide(0);
    }
  }, [isOpen, slides.length]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] modal-overlay transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-10 text-white/70 hover:text-white transition-colors"
        aria-label="Close"
      >
        <X size={32} />
      </button>

      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ${
              currentSlide === index
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${slide.bgImage})`,
                filter: 'brightness(0.3) grayscale(0.5)',
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
              {/* Year */}
              <h2
                className={`text-6xl lg:text-8xl font-bold text-[#8B5CF6] mb-8 transition-all duration-700 ${
                  currentSlide === index
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                }`}
              >
                {slide.year}
              </h2>

              {/* Audio Wave Animation */}
              <div className="flex items-center gap-2 mb-8">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-white rounded-full animate-pulse"
                    style={{
                      height: `${20 + Math.random() * 40}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.8s',
                    }}
                  />
                ))}
              </div>

              {/* Text */}
              <p
                className={`text-xl lg:text-2xl text-white/90 text-center max-w-2xl transition-all duration-700 delay-200 ${
                  currentSlide === index
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                }`}
              >
                {slide.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? 'bg-[#00FF88] w-8'
                : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ShowreelModal;
