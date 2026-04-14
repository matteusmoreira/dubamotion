import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stories,
  StoriesContent,
  Story,
  StoryAuthor,
  StoryAuthorName,
  StoryOverlay,
  StoryImage,
} from '@/components/ui/stories-carousel';
import { supabase } from '@/lib/supabase';
import type { Trabalho } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

const Projects = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const [categories, setCategories] = useState<{id: string, title: string, titlePt: string, description: string, descriptionPt: string}[]>([]);

  // Buscar trabalhos publicados e categorias do Supabase
  useEffect(() => {
    supabase.from('categorias').select('*').order('ordem').then(({ data }) => {
      if (data) {
        setCategories(data.map(c => ({
          id: c.slug,
          title: c.nome,
          titlePt: c.nome,
          description: c.descricao_en || c.descricao || '',
          descriptionPt: c.descricao || ''
        })));
      }
    });

    supabase
      .from('trabalhos')
      .select('*')
      .eq('publicado', true)
      .order('ordem')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTrabalhos(data || []);
        setLoadingProjects(false);
      });
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

  const navigate = useNavigate();

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const filteredProjects = currentCategory
    ? trabalhos.filter((p) => p.categoria === currentCategory)
    : [];


  const currentCatData = currentCategory ? categories.find(c => c.id === currentCategory) : null;

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative w-full bg-black py-24"
    >
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        {/* Header with Title and Filter Tags */}
        <div className={`transition-all duration-1000 mb-12 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
               <h2 className="text-5xl lg:text-7xl font-bold text-white uppercase tracking-tighter">
                 {t('nav.work')}
               </h2>
          </div>
          
          {/* Tags Filter */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCurrentCategory(null)}
              className={`px-6 py-2 rounded-full border text-sm transition-all duration-300 ${
                currentCategory === null
                  ? 'bg-[#00FF88] border-[#00FF88] text-black font-semibold shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                  : 'border-white/20 text-white/70 hover:border-[#00FF88]/50 hover:text-white'
              }`}
            >
              Modalidades
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCurrentCategory(cat.id)}
                className={`px-6 py-2 rounded-full border text-sm transition-all duration-300 ${
                  currentCategory === cat.id
                    ? 'bg-[#00FF88] border-[#00FF88] text-black font-semibold shadow-[0_0_15px_rgba(0,255,136,0.3)]'
                    : 'border-white/20 text-white/70 hover:border-[#00FF88]/50 hover:text-white'
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {!currentCategory ? (
            /* Show only Modalities (Tags) layout */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, index) => (
                <div 
                  key={cat.id} 
                  className={`bg-white/[0.02] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.05] hover:border-[#00FF88]/30 transition-all duration-500 cursor-pointer group hover:-translate-y-1 flex flex-col justify-between min-h-[220px]`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                  onClick={() => setCurrentCategory(cat.id)}
                >
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#00FF88] transition-colors">{cat.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed max-w-sm">{cat.description}</p>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#00FF88] group-hover:bg-[#00FF88]/10 transition-all">
                      <span className="text-white/50 group-hover:text-[#00FF88] transition-colors">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Show Selected Category Projects */
            <div className="animate-in fade-in duration-700">
               <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
                 <div>
                    <h3 className="text-3xl lg:text-4xl font-bold text-white mb-3">{currentCatData?.title}</h3>
                    <p className="text-white/60 max-w-xl text-lg">{currentCatData?.description}</p>
                 </div>
               </div>
               
               {loadingProjects ? (
                 <div className="flex items-center justify-center h-[30vh]">
                   <div className="w-8 h-8 border-2 border-[#00FF88] border-t-transparent rounded-full animate-spin" />
                 </div>
               ) : filteredProjects.length > 0 ? (
                 <div className="w-full relative">
                   <Stories>
                     <StoriesContent>
                       {filteredProjects.map((project) => (
                         <Story
                           className="aspect-[3/4] w-[280px] lg:w-[320px] group"
                           key={project.id}
                           onClick={() => handleProjectClick(project.id)}
                         >
                           <StoryImage
                             src={project.capa_url || 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=400&h=500&fit=crop'}
                             alt={project.titulo}
                             className="transition-transform duration-700 group-hover:scale-105"
                           />
                           <StoryOverlay className="bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                           <StoryAuthor>
                             <StoryAuthorName className="text-2xl font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                               {project.titulo}
                             </StoryAuthorName>
                           </StoryAuthor>
                         </Story>
                       ))}
                     </StoriesContent>
                   </Stories>
                 </div>
               ) : (
                 <div className="flex items-center justify-center w-full h-[40vh] bg-white/[0.02] rounded-3xl text-white/40 border border-white/5 border-dashed">
                   Nenhum projeto encontrado para esta categoria.
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
