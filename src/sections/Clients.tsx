import { useEffect, useRef, useState } from 'react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { useLanguage } from '../contexts/LanguageContext';

const clientLogos = [
  "Abbott.png", "Artboard 1 copy 68.png", "Banco_original.png", "Bradesco.png", "Continental.png",
  "Entrenos.png", "Ibinai.png", "Inatel.png", "Juntos-pela-zn.png", "Lexus.png",
  "Michelin.png", "Neutrogena.png", "Next.png", "PlenaVi.png", "Puma.png",
  "SOS_mata_atlantica.png", "Sony.png", "The_black_beef.png", "Toyota.png", "Ultragaz.png",
  "Vedacit(1).png", "Vivo.png", "Yamaha.png", "Zul-digital.png", "acqio.png",
  "arcos dorados.png", "betnacional.png", "bitso.png", "britania.png", "burger king.png",
  "c6bank.png", "casas bahia.png", "clear.png", "clickbus.png", "cna.png",
  "ctrl play.png", "darwin seguros.png", "embelleze.png", "entre nos (2).png", "estapar.png",
  "estrela bet.png", "fifo_arts.png", "fluxo.png", "garoto.png", "hidratei.png",
  "hook&loop.png", "infunsec.png", "itau.png", "john deere.png", "johnnie walker.png",
  "kuat.png", "laserfast.png", "live now.png", "mary.png", "mercado livre.png",
  "microsoft.png", "mitsubishi.png", "netshoes.png", "nissan.png", "nu bank.png",
  "o boticario.png", "omo.png", "pagbank.png", "pubg.png", "renner.png",
  "rexona.png", "samsung.png", "scatolove.png", "spaten.png", "stone.png",
  "suzuki.png", "takeda.png", "tegra.png", "televisa.png", "telhanorte.png",
  "tik tok.png", "vedacit.png", "warren.png", "yeesco.png", "youse.png", "zul digital.png"
];

const Clients = () => {
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
          <InfiniteSlider gap={32} duration={80} reverse className="w-full">
            {clientLogos.map((logo, index) => (
              <img
                key={index}
                src={`/Logotipos/${logo}`}
                alt={`Cliente ${index + 1}`}
                className="h-[80px] md:h-[100px] w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300 mx-4"
              />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
};

export default Clients;
