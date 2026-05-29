import { useEffect, useRef, useState } from 'react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

// Logotipos estáticos locais como fallback de segurança
const fallbackClientLogos = [
  "Bradesco.png", "Lexus.png", "Next.png", "Toyota.png", "Vivo.png",
  "Yamaha.png", "c6bank.png", "casas bahia.png", "cna.png", "garoto.png",
  "itau.png", "kuat.png", "live now.png", "mercado livre.png", "mitsubishi.png",
  "nissan.png", "nu bank.png", "renner.png", "suzuki.png", "tik tok.png"
];

type LogoItem = {
  id: string;
  nome: string;
  url: string;
};

const Clients = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [logos, setLogos] = useState<LogoItem[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Carregar os logotipos do Supabase com fallback local
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const { data, error } = await supabase
          .from('logos_clientes')
          .select('id, nome, logo_url')
          .order('ordem');

        if (error) throw error;

        if (data && data.length > 0) {
          setLogos(data.map(item => ({
            id: item.id,
            nome: item.nome,
            url: item.logo_url
          })));
        } else {
          useFallback();
        }
      } catch (err) {
        console.warn('Erro ao carregar logotipos do Supabase (tabela pode não ter sido criada). Usando fallback local:', err);
        useFallback();
      }
    };

    const useFallback = () => {
      setLogos(fallbackClientLogos.map((filename, idx) => ({
        id: `fallback-${idx}`,
        nome: filename.replace(/\.[^/.]+$/, ""),
        url: `/Logotipos/${filename}`
      })));
    };

    fetchLogos();
  }, []);

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
      id="clients"
      ref={sectionRef}
      className="relative w-full bg-black py-24"
    >
      {/* Title */}
      <div className="text-center mb-12 px-8">
        <h2
          className={`text-4xl lg:text-6xl font-bold transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          style={{
            background: 'linear-gradient(90deg, #6B21A8 0%, #00FF88 50%, #00CCAA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {t('clients.title1')}
          <br />
          {t('clients.title2')}
          <br />
          {t('clients.title3')}
        </h2>
      </div>

      {/* Infinite Slider - White Background */}
      <div
        className={`relative transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="py-16 overflow-hidden bg-white">
          <InfiniteSlider gap={48} duration={40} reverse className="w-full">
            {logos.map((logo) => (
              <img
                key={logo.id}
                src={logo.url}
                alt={logo.nome}
                className="h-[80px] md:h-[100px] w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
};

export default Clients;
