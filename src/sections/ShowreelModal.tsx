import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getShowreelVideoId } from '../lib/showreel';

interface ShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShowreelModal = ({ isOpen, onClose }: ShowreelModalProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const { language } = useLanguage();

  const videoId = getShowreelVideoId(language);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (isOpen) {
      timeoutId = window.setTimeout(() => setIsVisible(true), 30);
    }
    else {
      setIsVisible(false);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
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
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/96 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-5 z-20 rounded-full bg-black/55 p-3 text-white/75 transition-colors hover:text-white md:right-8 md:top-8"
        aria-label="Close"
      >
        <X size={28} />
      </button>

      <div
        className="h-[100dvh] w-[100vw] bg-black"
        onClick={(event) => event.stopPropagation()}
      >
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0&controls=1&title=0&byline=0&portrait=0`}
          className="h-full w-full bg-black"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          title="Showreel"
        />
      </div>
    </div>
  );
};

export default ShowreelModal;
