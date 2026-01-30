import { Mail, Instagram, Twitter, Linkedin, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const contactInfo = [
    { icon: Mail, text: 'contato@dubamotion.com.br', href: 'mailto:contato@dubamotion.com.br' },
    { icon: Instagram, text: '@dubamotion', href: 'https://instagram.com/dubamotion' },
    { icon: Twitter, text: '/dubamotion', href: 'https://twitter.com/dubamotion' },
    { icon: Linkedin, text: '/dubamotion', href: 'https://linkedin.com/company/dubamotion' },
    { icon: Phone, text: '55 (11) 9.8754-0457', href: 'https://wa.me/5511987540457' },
  ];

  return (
    <footer id="contact" className="w-full bg-black py-16 px-8 lg:px-16">
      <div className="max-w-6xl mx-auto">
        {/* Contact Info */}
        <div className="flex flex-col items-start gap-4">
          {contactInfo.map((item, index) => (
            <a
              key={index}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-4 group"
            >
              <item.icon
                size={18}
                className="text-white/50 group-hover:text-[#00FF88] transition-colors"
              />
              <span className="text-white/70 text-lg group-hover:text-[#00FF88] transition-colors">
                {item.text}
              </span>
            </a>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <img
              src="/images/logo.png"
              alt="Dubamotion"
              className="h-10 w-auto object-contain opacity-50"
            />
          </div>

          {/* Copyright */}
          <p className="text-white/40 text-sm">
            {t('footer.rights')}
          </p>

          {/* Back to Top */}
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-white/40 hover:text-[#00FF88] transition-colors text-sm"
          >
            {t('footer.backToTop')}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
