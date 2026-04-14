import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShowreelModal = ({ isOpen, onClose }: ShowreelModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();
  
  const videoId = language === 'en' ? '910534861' : '875142318';

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

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
      className={`fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm transition-opacity duration-500 flex items-center justify-center ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 md:top-8 md:right-8 z-10 text-white/70 hover:text-white transition-colors bg-black/50 p-2 rounded-full"
        aria-label="Close"
      >
        <X size={32} />
      </button>

      {/* Video Container */}
      <div className="w-full max-w-7xl aspect-video px-4 md:px-12">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`}
          className="w-full h-full rounded-lg shadow-2xl bg-black"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Showreel"
        ></iframe>
      </div>
    </div>
  );
};

export default ShowreelModal;
