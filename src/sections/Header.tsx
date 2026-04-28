import { Mail, Instagram, Linkedin } from 'lucide-react';
import { FaVimeoV, FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  currentSection?: string;
  scrollProgress?: number;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const easeInOutCubic = (value: number) => {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
};

const Header = ({ currentSection = 'work', scrollProgress = 0 }: HeaderProps) => {
  const { language, setLanguage, t } = useLanguage();
  const isVisible = scrollProgress > 0.18;
  const logoDockPhase = easeInOutCubic(clamp((scrollProgress - 0.26) / 0.14));
  const logoOpacity = logoDockPhase;

  const navItems = [
    { id: 'about' },
    { id: 'work' },
    { id: 'services' },
    { id: 'clients' },
    { id: 'contact' },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        isVisible ? 'bg-black/72 py-4 backdrop-blur-md' : 'bg-transparent py-6'
      }`}
    >
      <div className="flex w-full items-center justify-between px-8 lg:px-16">
        <nav className="hidden items-center gap-6 md:flex lg:gap-7">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`nav-link text-[0.82rem] lowercase tracking-[0.08em] ${
                currentSection === item.id ? 'font-medium text-white' : 'text-white/70'
              }`}
            >
              {t(`nav.${item.id}`)}
            </button>
          ))}
        </nav>

        <div
          className="absolute left-1/2 transition-all duration-300"
          style={{
            opacity: logoOpacity,
            transform: `translate(-50%, ${18 - logoDockPhase * 18}px) scale(${0.78 + logoDockPhase * 0.22})`,
          }}
        >
          <button
            type="button"
            onClick={() => scrollToSection('hero')}
            className="transition-transform duration-300 hover:scale-110"
            aria-label="Dubamotion"
          >
            <img
              src="/images/logo-oficial-final-duba.png"
              alt="Dubamotion"
              className="h-auto w-10 [filter:brightness(0)] md:w-12"
            />
          </button>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-3.5 lg:flex">
            <a
              href="mailto:contato@dubamotion.com.br"
              className="text-white/70 transition-colors hover:text-[#00FF88]"
              aria-label="Email"
            >
              <Mail size={16} />
            </a>
            <a
              href="https://instagram.com/dubamotion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 transition-colors hover:text-[#00FF88]"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href="https://vimeo.com/dubamotion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 transition-colors hover:text-[#00FF88]"
              aria-label="Vimeo"
            >
              <FaVimeoV size={16} />
            </a>
            <a
              href="https://linkedin.com/company/dubamotion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 transition-colors hover:text-[#00FF88]"
              aria-label="LinkedIn"
            >
              <Linkedin size={16} />
            </a>
            <a
              href="https://wa.me/5511987540457"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 transition-colors hover:text-[#00FF88]"
              aria-label="WhatsApp"
            >
              <FaWhatsapp size={16} />
            </a>
          </div>

          <div className="lang-selector flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`text-xs transition-colors ${
                language === 'en' ? 'font-medium text-[#00FF88]' : 'text-white/50 hover:text-white'
              }`}
            >
              en
            </button>
            <span className="text-white/30">|</span>
            <button
              type="button"
              onClick={() => setLanguage('pt')}
              className={`text-xs transition-colors ${
                language === 'pt' ? 'font-medium text-[#00FF88]' : 'text-white/50 hover:text-white'
              }`}
            >
              pt
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
