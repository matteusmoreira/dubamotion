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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { projects } from '@/data/projects';

const Projects = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const categories = [
    {
      id: 'mixed',
      title: 'Mixed Midia',
      titlePt: 'Mídia Mista',
      description: 'Projetos que incluem animação 2D, colagem e composição com diversos elementos.',
      descriptionPt: 'Projetos que incluem animação 2D, colagem e composição com diversos elementos.',
    },
    {
      id: 'animation',
      title: 'Animation',
      titlePt: 'Animação',
      description: 'Motion e Pós produção em vídeos publicitários online para marcas em plataformas diversas.',
      descriptionPt: 'Motion e Pós produção em vídeos publicitários online para marcas em plataformas diversas.',
    },
    {
      id: 'social',
      title: 'Social Ads',
      titlePt: 'Ads Sociais',
      description: 'Campanhas publicitárias para redes sociais com foco em engajamento e conversão.',
      descriptionPt: 'Campanhas publicitárias para redes sociais com foco em engajamento e conversão.',
    },
    {
      id: 'video',
      title: 'Video Cases',
      titlePt: 'Cases de Vídeo',
      description: 'Produção de vídeos case completos com edição, color grading e motion graphics.',
      descriptionPt: 'Produção de vídeos case completos com edição, color grading e motion graphics.',
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

  const nextCategory = () => {
    setCurrentCategory((prev) => (prev + 1) % categories.length);
  };

  const prevCategory = () => {
    setCurrentCategory((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const navigate = useNavigate();

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const currentCat = categories[currentCategory];
  const filteredProjects = projects.filter((p) => p.category === currentCat.id);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative min-h-screen w-full bg-black py-24"
    >
      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-16">
          {/* Category Title */}
          <div
            className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              {currentCat.title}:
            </h2>
            <p className="text-white/60 max-w-md">{currentCat.description}</p>
          </div>

          {/* Projects Title */}
          <div
            className={`hidden lg:block transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-white">
              Projects
            </h2>
          </div>
        </div>

        {/* Projects Circular Gallery */}
        <div
          className={`relative w-full mb-12 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
          {filteredProjects.length > 0 ? (
            <Stories>
              <StoriesContent>
                {filteredProjects.map((project) => (
                  <Story
                    className="aspect-[3/4] w-[280px]"
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <StoryImage src={project.image} alt={project.title} />
                    <StoryOverlay />
                    <StoryAuthor>
                      <StoryAuthorName className="text-xl font-bold">{project.title}</StoryAuthorName>
                    </StoryAuthor>
                  </Story>
                ))}
              </StoriesContent>
            </Stories>
          ) : (
            <div className="flex items-center justify-center w-full h-24 text-white/50">
              No projects found for this category.
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {/* Left Arrow */}
          <button
            onClick={prevCategory}
            className="text-white/50 hover:text-[#00FF88] transition-colors"
            aria-label="Previous category"
          >
            <ChevronLeft size={32} />
          </button>

          {/* Category Indicators */}
          <div className="flex gap-2">
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCategory(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentCategory === index
                  ? 'bg-[#00FF88] w-6'
                  : 'bg-white/30 hover:bg-white/50'
                  }`}
                aria-label={`Go to category ${index + 1}`}
              />
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={nextCategory}
            className="text-white/50 hover:text-[#00FF88] transition-colors"
            aria-label="Next category"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Projects;
