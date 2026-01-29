import { useState, useEffect } from 'react';
import { Mail, Instagram, Twitter, Linkedin, Phone } from 'lucide-react';

interface HeaderProps {
  currentSection?: string;
  scrollProgress?: number;
}

const Header = ({ currentSection = 'work', scrollProgress = 0 }: HeaderProps) => {
  const [language, setLanguage] = useState<'en' | 'pt'>('pt');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Header becomes visible after some scroll
    setIsVisible(scrollProgress > 0.3);
  }, [scrollProgress]);

  const navItems = [
    { id: 'about', label: 'about', labelPt: 'sobre' },
    { id: 'work', label: 'work', labelPt: 'trabalhos' },
    { id: 'services', label: 'services', labelPt: 'serviços' },
    { id: 'clients', label: 'clients', labelPt: 'clientes' },
    { id: 'contact', label: 'contact', labelPt: 'contato' },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Logo opacity increases as scroll progresses
  const logoOpacity = Math.min((scrollProgress - 0.2) * 2, 1);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isVisible
          ? 'bg-black/90 backdrop-blur-md py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="w-full px-8 lg:px-16 flex items-center justify-between">
        {/* Left Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`nav-link text-sm tracking-wider uppercase ${
                currentSection === item.id
                  ? 'text-white font-medium'
                  : 'text-white/70'
              }`}
            >
              {language === 'en' ? item.label : item.labelPt}
            </button>
          ))}
        </nav>

        {/* Center Logo - Small version that appears on scroll */}
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 transition-all duration-300"
          style={{
            opacity: logoOpacity,
            transform: `translate(-50%, 0) scale(${0.5 + logoOpacity * 0.5})`,
          }}
        >
          <button
            onClick={() => scrollToSection('hero')}
            className="transition-transform duration-300 hover:scale-110"
          >
            <img
              src="/images/logo.png"
              alt="Dubamotion"
              className="h-10 w-auto object-contain"
            />
          </button>
        </div>

        {/* Right Side - Social + Language */}
        <div className="flex items-center gap-6">
          {/* Social Icons */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="mailto:contato@dubamotion.com.br"
              className="text-white/70 hover:text-[#00FF88] transition-colors"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
            <a
              href="https://instagram.com/dubamotion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-[#00FF88] transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://twitter.com/dubamotion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-[#00FF88] transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
            <a
              href="https://linkedin.com/company/dubamotion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-[#00FF88] transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
            <a
              href="https://wa.me/5511987540457"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-[#00FF88] transition-colors"
              aria-label="WhatsApp"
            >
              <Phone size={18} />
            </a>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 lang-selector">
            <button
              onClick={() => setLanguage('en')}
              className={`text-xs transition-colors ${
                language === 'en'
                  ? 'text-[#00FF88] font-medium'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              en
            </button>
            <span className="text-white/30">|</span>
            <button
              onClick={() => setLanguage('pt')}
              className={`text-xs transition-colors ${
                language === 'pt'
                  ? 'text-[#00FF88] font-medium'
                  : 'text-white/50 hover:text-white'
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
